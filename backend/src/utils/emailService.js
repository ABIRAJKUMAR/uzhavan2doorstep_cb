import * as SibApiV3Sdk from '@getbrevo/brevo';
import dotenv from 'dotenv';
dotenv.config();

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

const FROM = { email: process.env.EMAIL_USER || 'abirajdell@gmail.com', name: 'UZHAVAN 2 DOORSTEP' };

const sendEmail = async (to, subject, text) => {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.sender = FROM;
  sendSmtpEmail.to = [{ email: to }];
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.textContent = text;
  await apiInstance.sendTransacEmail(sendSmtpEmail);
};

export const sendInvoiceEmail = async (toEmail, pdfBuffer, orderId) => {
  try {
    if (!process.env.BREVO_API_KEY) {
      console.log('⚠️  No BREVO_API_KEY set. Skipping invoice email.');
      return;
    }
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.sender = FROM;
    sendSmtpEmail.to = [{ email: toEmail }];
    sendSmtpEmail.subject = `Your Invoice for Order #${orderId} - UZHAVAN 2 DOORSTEP`;
    sendSmtpEmail.textContent = `Hello,\n\nThank you for your order! Please find attached the invoice for your recent order #${orderId}.\n\nBest Regards,\nUZHAVAN 2 DOORSTEP Team`;
    sendSmtpEmail.attachment = [
      {
        content: pdfBuffer.toString('base64'),
        name: `Invoice_${orderId}.pdf`,
      },
    ];
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`\n✅ SUCCESSFULLY SENT EMAIL TO: ${toEmail}`);
  } catch (error) {
    console.error('Error sending invoice email:', error?.response?.body || error.message);
  }
};

export const sendLowStockEmail = async (farmerEmail, product) => {
  try {
    if (!process.env.BREVO_API_KEY) return;
    await sendEmail(
      farmerEmail,
      `🚨 Low Stock Alert: ${product.name} - UZHAVAN 2 DOORSTEP`,
      `Hello,\n\nYour product "${product.name}" is running low on stock. You currently have only ${product.quantity} ${product.unit} left.\n\nPlease update your inventory soon.\n\nBest Regards,\nUZHAVAN 2 DOORSTEP Team`
    );
    console.log(`✅ LOW STOCK EMAIL SENT TO: ${farmerEmail}`);
  } catch (error) {
    console.error('Error sending low stock email:', error?.response?.body || error.message);
  }
};

export const sendNewOrderEmailToFarmer = async (farmerEmail, order, product, quantity, buyerName, paymentMethod = 'Online') => {
  try {
    if (!process.env.BREVO_API_KEY) return;
    const paymentInfo = paymentMethod === 'COD'
      ? '💵 Payment Method: Cash on Delivery (collect payment at delivery)'
      : '✅ Payment Method: Online Payment (already paid)';

    await sendEmail(
      farmerEmail,
      `🎉 New Order Received! ${product.name} - UZHAVAN 2 DOORSTEP`,
      `Hello,\n\nYou have received a new order from ${buyerName}.\n\nOrder Details:\n- Product: ${product.name}\n- Quantity: ${quantity} ${product.unit}\n- Total Value: ₹${product.price * quantity}\n- Order ID: ${order.id}\n- ${paymentInfo}\n\nCheck your Farmer Dashboard to process this order.\n\nBest Regards,\nUZHAVAN 2 DOORSTEP Team`
    );
    console.log(`✅ NEW ORDER EMAIL SENT TO FARMER: ${farmerEmail}`);
  } catch (error) {
    console.error('Error sending new order email:', error?.response?.body || error.message);
  }
};

export const sendOrderAcceptedEmail = async (buyerEmail, order, product, farmerName) => {
  try {
    if (!process.env.BREVO_API_KEY) return;
    await sendEmail(
      buyerEmail,
      `✅ Order Accepted! ${product.name} - UZHAVAN 2 DOORSTEP`,
      `Hello,\n\nYour order has been ACCEPTED by the farmer (${farmerName}).\n\nOrder Details:\n- Product: ${product.name}\n- Quantity: ${order.quantity} ${product.unit}\n- Total Value: ₹${order.totalAmount}\n- Order ID: ${order.orderNumber || order.id}\n\nThe farmer is now preparing your order for shipment.\n\nBest Regards,\nUZHAVAN 2 DOORSTEP Team`
    );
    console.log(`✅ ORDER ACCEPTED EMAIL SENT TO BUYER: ${buyerEmail}`);
  } catch (error) {
    console.error('Error sending order accepted email:', error?.response?.body || error.message);
  }
};

export const sendOrderShippedEmail = async (buyerEmail, order, product, farmerName) => {
  try {
    if (!process.env.BREVO_API_KEY) return;
    await sendEmail(
      buyerEmail,
      `🚚 Order Shipped! ${product.name} - UZHAVAN 2 DOORSTEP`,
      `Hello,\n\nYour order has been SHIPPED by the farmer (${farmerName}).\n\nOrder Details:\n- Product: ${product.name}\n- Quantity: ${order.quantity} ${product.unit}\n- Order ID: ${order.orderNumber || order.id}\n\nYour order is on its way!\n\nBest Regards,\nUZHAVAN 2 DOORSTEP Team`
    );
    console.log(`✅ ORDER SHIPPED EMAIL SENT TO BUYER: ${buyerEmail}`);
  } catch (error) {
    console.error('Error sending order shipped email:', error?.response?.body || error.message);
  }
};
