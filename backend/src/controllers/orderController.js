import { Order, Product, User } from '../models/index.js';
import { generateInvoicePDF } from '../utils/pdfGenerator.js';
import { sendInvoiceEmail } from '../utils/emailService.js';
import { sendOrderSMS } from '../utils/smsService.js';

export const createOrder = async (req, res) => {
  try {
    const { productId, quantity, deliveryAddress } = req.body;
    
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
      deliveryAddress
    });

    // Optionally update product quantity here or when accepted
    product.quantity -= quantity;
    await product.save();

    // Fetch user details for invoice and notifications
    const retailer = await User.findByPk(req.user.id);
    const farmer = await User.findByPk(product.farmerId);

    try {
      // Generate Invoice PDF
      const pdfBuffer = await generateInvoicePDF(order, retailer, product, farmer);

      // Send Email to Retailer with PDF Attached
      if (retailer.email) {
        await sendInvoiceEmail(retailer.email, pdfBuffer, order.id);
      }
    } catch (notifErr) {
      console.error('Notification Error (Ignored for order creation):', notifErr.message);
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createBatchOrder = async (req, res) => {
  try {
    const { items, deliveryAddress } = req.body;
    
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
        deliveryAddress
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

    try {
      const pdfBuffer = await generateInvoicePDF(sharedOrderNumber, createdOrders, buyer, productsMap, farmersMap);
      if (buyer.email) {
        await sendInvoiceEmail(buyer.email, pdfBuffer, sharedOrderNumber);
      }
    } catch (notifErr) {
      console.error('Batch Notification Error:', notifErr.message);
    }

    res.status(201).json({ message: 'Orders created successfully', orders: createdOrders });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getTraceabilityInfo = async (req, res) => {
  try {
    const invoiceNumber = req.params.invoiceId;
    
    // Find all orders that share this invoice number
    const orders = await Order.findAll({
      where: { orderNumber: invoiceNumber },
      include: [
        { model: Product },
        { model: User, as: 'farmer', attributes: ['name', 'village', 'district', 'phone'] },
        { model: User, as: 'retailer', attributes: ['name', 'shopName'] }
      ]
    });

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

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
