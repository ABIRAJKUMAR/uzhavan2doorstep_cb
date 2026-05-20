import { Order, Product, User } from '../models/index.js';
import { generateInvoicePDF } from '../utils/pdfGenerator.js';
import { sendInvoiceEmail, sendLowStockEmail, sendNewOrderEmailToFarmer, sendOrderAcceptedEmail, sendOrderShippedEmail } from '../utils/emailService.js';
import { sendOrderSMS } from '../utils/smsService.js';


export const createOrder = async (req, res) => {
  try {
    const { productId, quantity, deliveryAddress, paymentMethod } = req.body;
    
    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (product.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient quantity' });
    }

    const totalAmount = product.price * quantity;

    const order = await Order.create({
      retailerId: req.user.id,
      farmerId: product.farmerId,
      productId,
      quantity,
      totalAmount,
      deliveryAddress,
      paymentMethod: paymentMethod || 'Online',
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
    });

    // Optionally update product quantity here or when accepted
    product.quantity -= quantity;
    await product.save();

    // Fetch user details for invoice and notifications
    const retailer = await User.findByPk(req.user.id);
    const farmer = await User.findByPk(product.farmerId);

    // Run notifications asynchronously in the background so it doesn't block the frontend
    (async () => {
      try {
        const pdfBuffer = await generateInvoicePDF(order, retailer, product, farmer);
        if (retailer.email) sendInvoiceEmail(retailer.email, pdfBuffer, order.id);
        
        if (farmer.email) sendNewOrderEmailToFarmer(farmer.email, order, product, quantity, retailer.name, paymentMethod || 'Online');

        const LOW_STOCK_THRESHOLD = 20;
        if (product.quantity < LOW_STOCK_THRESHOLD && farmer.email) {
          sendLowStockEmail(farmer.email, product);
        }
      } catch (notifErr) {
        console.error('Notification Error:', notifErr.message);
      }
    })();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createBatchOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod } = req.body;
    const isCOD = paymentMethod === 'COD';
    
    if (!items || items.length === 0) return res.status(400).json({ message: 'No items in order' });

    const buyer = await User.findByPk(req.user.id);
    let createdOrders = [];
    let productsMap = {};
    let farmersMap = {};

    const commonDateStr = new Date().toISOString().slice(0,10).replace(/-/g, '');
    const proRandomNumber = Math.floor(10000 + Math.random() * 90000); // 5 digit random number
    const sharedOrderNumber = `U2D-INV-${commonDateStr}-${proRandomNumber}`;

    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) continue;
      if (product.quantity < item.quantity) continue;

      const totalAmount = product.price * item.quantity;
      
      const order = await Order.create({
        retailerId: buyer.id,
        farmerId: product.farmerId,
        productId: product.id,
        quantity: item.quantity,
        totalAmount,
        deliveryAddress,
        paymentMethod: isCOD ? 'COD' : 'Online',
        paymentStatus: isCOD ? 'Pending' : 'Paid',
      });

      product.quantity -= item.quantity;
      await product.save();
      
      createdOrders.push(order);
      productsMap[product.id] = product;
      
      if (!farmersMap[product.farmerId]) {
        farmersMap[product.farmerId] = await User.findByPk(product.farmerId);
      }
    }

    if (createdOrders.length === 0) {
      return res.status(400).json({ message: 'Could not process any items. Insufficient stock.' });
    }

    // Run batch notifications asynchronously in the background
    (async () => {
      try {
        const pdfBuffer = await generateInvoicePDF(sharedOrderNumber, createdOrders, buyer, productsMap, farmersMap);
        if (buyer.email) sendInvoiceEmail(buyer.email, pdfBuffer, sharedOrderNumber);

        const LOW_STOCK_THRESHOLD = 20;
        for (const order of createdOrders) {
          const product = productsMap[order.productId];
          const farmer = farmersMap[product.farmerId];
          
          if (farmer && farmer.email) {
            sendNewOrderEmailToFarmer(farmer.email, order, product, order.quantity, buyer.name, isCOD ? 'COD' : 'Online');
            
            if (product.quantity < LOW_STOCK_THRESHOLD) {
              sendLowStockEmail(farmer.email, product);
            }
          }
        }
      } catch (notifErr) {
        console.error('Batch Notification Error:', notifErr.message);
      }
    })();

    res.status(201).json({ message: 'Orders created successfully', orders: createdOrders });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getTraceabilityInfo = async (req, res) => {
  try {
    const invoiceNumber = req.params.invoiceId;
    
    // Find all orders that share this invoice number
    let orders = await Order.findAll({
      where: { orderNumber: invoiceNumber },
      include: [
        { model: Product },
        { model: User, as: 'farmer', attributes: ['name', 'village', 'district', 'phone'] },
        { model: User, as: 'retailer', attributes: ['name', 'shopName'] }
      ]
    });

    // Fallback: search by primary key order ID directly
    if (!orders || orders.length === 0) {
      const singleOrder = await Order.findByPk(invoiceNumber, {
        include: [
          { model: Product },
          { model: User, as: 'farmer', attributes: ['name', 'village', 'district', 'phone'] },
          { model: User, as: 'retailer', attributes: ['name', 'shopName'] }
        ]
      });
      if (singleOrder) {
        orders = [singleOrder];
      }
    }

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'Traceability data not found for this invoice.' });
    }

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    let orders;
    if (req.user.role === 'Farmer') {
      orders = await Order.findAll({
        where: { farmerId: req.user.id },
        include: [
          { model: Product },
          { model: User, as: 'retailer', attributes: ['name', 'shopName', 'phone'] }
        ]
      });
    } else if (req.user.role === 'Retailer' || req.user.role === 'Customer') {
      orders = await Order.findAll({
        where: { retailerId: req.user.id },
        include: [
          { model: Product },
          { model: User, as: 'farmer', attributes: ['name', 'phone'] }
        ]
      });
    } else {
      orders = await Order.findAll(); // Admin
    }
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id);
    
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.farmerId !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    order.status = status;
    await order.save();

    // Trigger email asynchronously if status is Accepted or Shipped
    if (status === 'Accepted' || status === 'Shipped') {
      (async () => {
        try {
          const product = await Product.findByPk(order.productId);
          const buyer = await User.findByPk(order.retailerId);
          const farmer = await User.findByPk(order.farmerId);
          
          if (buyer && buyer.email && product && farmer) {
            if (status === 'Accepted') {
              sendOrderAcceptedEmail(buyer.email, order, product, farmer.name);
            } else if (status === 'Shipped') {
              sendOrderShippedEmail(buyer.email, order, product, farmer.name);
            }
          }
        } catch (emailErr) {
          console.error('Error in status update email background task:', emailErr);
        }
      })();
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
