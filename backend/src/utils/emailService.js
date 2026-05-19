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
