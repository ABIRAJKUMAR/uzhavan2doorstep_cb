import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const sendInvoiceEmail = async (toEmail, pdfBuffer, orderId) => {
  try {
    let transporter;

    // If you haven't set up Gmail yet, we will automatically create a FREE test email account!
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('No Gmail configured. Generating a free test email account for testing...');
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } else {
      // Use Real Gmail with explicit host and port (587) to avoid ECONNREFUSED on port 465
      transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports (will use STARTTLS)
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    }
    
    const info = await transporter.sendMail({
      from: `"UZHAVAN 2 DOORSTEP" <noreply@uzhavan2doorstep.com>`,
      to: toEmail,
      subject: `Your Invoice for Order #${orderId} - UZHAVAN 2 DOORSTEP`,
      text: `Hello,\n\nThank you for your order! Please find attached the invoice for your recent order #${orderId}.\n\nBest Regards,\nUZHAVAN 2 DOORSTEP Team`,
      attachments: [
        {
          filename: `Invoice_${orderId}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });
    
    console.log(`\n✅ SUCCESSFULLY SENT EMAIL TO: ${toEmail}`);
    
    // If it's a test account, we print the URL so the user can literally SEE the email and PDF!
    if (!process.env.EMAIL_USER) {
      console.log(`🌐 CLICK HERE TO VIEW THE REAL EMAIL & PDF: ${nodemailer.getTestMessageUrl(info)}\n`);
    }

  } catch (error) {
    console.error('Error sending invoice email:', error);
  }
};

const getTransporter = async () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } else {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
};

export const sendLowStockEmail = async (farmerEmail, product) => {
  try {
    const transporter = await getTransporter();
    await transporter.sendMail({
      from: `"UZHAVAN 2 DOORSTEP" <noreply@uzhavan2doorstep.com>`,
      to: farmerEmail,
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
    const transporter = await getTransporter();
    const paymentInfo = paymentMethod === 'COD'
      ? '💵 Payment Method: Cash on Delivery (collect payment at delivery)'
      : '✅ Payment Method: Online Payment (already paid)';

    await transporter.sendMail({
      from: `"UZHAVAN 2 DOORSTEP" <noreply@uzhavan2doorstep.com>`,
      to: farmerEmail,
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
    const transporter = await getTransporter();
    await transporter.sendMail({
      from: `"UZHAVAN 2 DOORSTEP" <noreply@uzhavan2doorstep.com>`,
      to: buyerEmail,
      subject: `✅ Order Accepted! ${product.name} - UZHAVAN 2 DOORSTEP`,
      text: `Hello,\n\nGood news! Your order has been ACCEPTED by the farmer (${farmerName}).\n\nOrder Details:\n- Product: ${product.name}\n- Quantity: ${order.quantity} ${product.unit}\n- Total Value: ₹${order.totalAmount}\n- Order ID: ${order.orderNumber || order.id}\n\nThe farmer is now preparing your order for shipment. You will be notified when it is shipped.\n\nBest Regards,\nUZHAVAN 2 DOORSTEP Team`,
    });
    console.log(`✅ ORDER ACCEPTED EMAIL SENT TO BUYER: ${buyerEmail}`);
  } catch (error) {
    console.error('Error sending order accepted email:', error);
  }
};

export const sendOrderShippedEmail = async (buyerEmail, order, product, farmerName) => {
  try {
    const transporter = await getTransporter();
    await transporter.sendMail({
      from: `"UZHAVAN 2 DOORSTEP" <noreply@uzhavan2doorstep.com>`,
      to: buyerEmail,
      subject: `🚚 Order Shipped! ${product.name} - UZHAVAN 2 DOORSTEP`,
      text: `Hello,\n\nGreat news! Your order has been SHIPPED by the farmer (${farmerName}).\n\nOrder Details:\n- Product: ${product.name}\n- Quantity: ${order.quantity} ${product.unit}\n- Order ID: ${order.orderNumber || order.id}\n\nYour order is on its way to your delivery address. Please log in to your dashboard to track its status.\n\nBest Regards,\nUZHAVAN 2 DOORSTEP Team`,
    });
    console.log(`✅ ORDER SHIPPED EMAIL SENT TO BUYER: ${buyerEmail}`);
  } catch (error) {
    console.error('Error sending order shipped email:', error);
  }
};
