import twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio only if credentials exist
const client = (accountSid && authToken) ? twilio(accountSid, authToken) : null;

export const sendOrderSMS = async (toPhone, orderId, totalAmount, role = 'Retailer') => {
  try {
    if (!toPhone) return;

    if (!client) {
      console.log(`[SIMULATED SMS to ${toPhone}] UZHAVAN 2 DOORSTEP: Order #${orderId} for Rs.${totalAmount} successfully placed. Configure TWILIO in .env for real SMS.`);
      return;
    }

    // Ensure Indian country code if not present
    let formattedPhone = toPhone.startsWith('+') ? toPhone : `+91${toPhone}`;

    const messageBody = role === 'Retailer' 
      ? `UZHAVAN 2 DOORSTEP: Your order #${orderId} for Rs.${totalAmount} has been successfully placed.`
      : `UZHAVAN 2 DOORSTEP: You received a new order #${orderId} for Rs.${totalAmount}. Please check your dashboard.`;

    await client.messages.create({
      body: messageBody,
      from: fromPhone,
      to: formattedPhone
    });
    
    console.log(`Successfully sent SMS to ${formattedPhone}`);
  } catch (error) {
    console.error(`Error sending SMS to ${toPhone}:`, error.message);
  }
};
