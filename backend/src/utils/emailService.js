import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = 'UZHAVAN 2 DOORSTEP <onboarding@resend.dev>';

export const sendInvoiceEmail = async (toEmail, pdfBuffer, orderId) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('⚠️  No RESEND_API_KEY set. Skipping invoice email.');
      return;
    }
    await resend.emails.send({
      from: FROM,
      to: [process.env.EMAIL_USER || toEmail],
      subject: `Your Invoice for Order #${orderId} - UZHAVAN 2 DOORSTEP`,
      text: `Hello,\n\nThank you for your order! Please find attached the invoice for your recent order #${orderId}.\n\nBest Regards,\nUZHAVAN 2 DOORSTEP Team`,
      attachments: [
        {
          filename: `Invoice_${orderId}.pdf`,
          content: pdfBuffer.toString('base64'),
        },
      ],
    });
    console.log(`\n✅ SUCCESSFULLY SENT EMAIL TO: ${toEmail}`);
  } catch (error) {
    console.error('Error sending invoice email:', error);
  }
};

export const sendLowStockEmail = async (farmerEmail, product) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('⚠️  No RESEND_API_KEY set. Skipping low stock email.');
      return;
    }
    await resend.emails.send({
      from: FROM,
      to: [process.env.EMAIL_USER || farmerEmail],
      subject: `🚨 Low Stock Alert: ${product.name} - UZHAVAN 2 DOORSTEP`,
      text: `Hello,\n\nThis is an automated alert that your product "${product.name}" is running low on stock. You currently have only ${product.quantity} ${product.unit} left.\n\nPlease update your inventory soon to continue receiving orders.\n\nBest Regards,\nUZHAVAN 2 DOORSTEP Team`,
    });
    console.log(`✅ LOW STOCK EMAIL SENT TO: ${farmerEmail}`);
  } catch (error) {
    console.error('Error sending low stock email:', error);
  }
};

export const sendNewOrderEmailToFarmer = async (farmerEmail, order, product, quantity, buyerName, paymentMethod = 'Online') => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('⚠️  No RESEND_API_KEY set. Skipping new order email.');
      return;
    }
    const paymentInfo = paymentMethod === 'COD'
      ? '💵 Payment Method: Cash on Delivery (collect payment at delivery)'
      : '✅ Payment Method: Online Payment (already paid)';

    await resend.emails.send({
      from: FROM,
      to: [process.env.EMAIL_USER || farmerEmail],
      subject: `🎉 New Order Received! ${product.name} - UZHAVAN 2 DOORSTEP`,
      text: `Hello,\n\nGreat news! You have received a new order from ${buyerName}.\n\nOrder Details:\n- Product: ${product.name}\n- Quantity: ${quantity} ${product.unit}\n- Total Value: ₹${product.price * quantity}\n- Order ID: ${order.id}\n- ${paymentInfo}\n\nPlease check your Farmer Dashboard to process this order.\n\nBest Regards,\nUZHAVAN 2 DOORSTEP Team`,
    });
    console.log(`✅ NEW ORDER EMAIL SENT TO FARMER: ${farmerEmail}`);
  } catch (error) {
    console.error('Error sending new order email:', error);
  }
};

export const sendOrderAcceptedEmail = async (buyerEmail, order, product, farmerName) => {
  try {
    if (!process.env.RESEND_API_KEY) return;
    await resend.emails.send({
      from: FROM,
      to: [process.env.EMAIL_USER || buyerEmail],
      subject: `✅ Order Accepted! ${product.name} - UZHAVAN 2 DOORSTEP`,
      text: `Hello,\n\nGood news! Your order has been ACCEPTED by the farmer (${farmerName}).\n\nOrder Details:\n- Product: ${product.name}\n- Quantity: ${order.quantity} ${product.unit}\n- Total Value: ₹${order.totalAmount}\n- Order ID: ${order.orderNumber || order.id}\n\nThe farmer is now preparing your order for shipment.\n\nBest Regards,\nUZHAVAN 2 DOORSTEP Team`,
    });
    console.log(`✅ ORDER ACCEPTED EMAIL SENT TO BUYER: ${buyerEmail}`);
  } catch (error) {
    console.error('Error sending order accepted email:', error);
  }
};

export const sendOrderShippedEmail = async (buyerEmail, order, product, farmerName) => {
  try {
    if (!process.env.RESEND_API_KEY) return;
    await resend.emails.send({
      from: FROM,
      to: [process.env.EMAIL_USER || buyerEmail],
      subject: `🚚 Order Shipped! ${product.name} - UZHAVAN 2 DOORSTEP`,
      text: `Hello,\n\nGreat news! Your order has been SHIPPED by the farmer (${farmerName}).\n\nOrder Details:\n- Product: ${product.name}\n- Quantity: ${order.quantity} ${product.unit}\n- Order ID: ${order.orderNumber || order.id}\n\nYour order is on its way to your delivery address.\n\nBest Regards,\nUZHAVAN 2 DOORSTEP Team`,
    });
    console.log(`✅ ORDER SHIPPED EMAIL SENT TO BUYER: ${buyerEmail}`);
  } catch (error) {
    console.error('Error sending order shipped email:', error);
  }
};
