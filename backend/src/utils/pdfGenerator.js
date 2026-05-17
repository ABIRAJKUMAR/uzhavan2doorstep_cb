import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

export const generateInvoicePDF = async (invoiceNumber, orders, buyer, productsMap, farmersMap) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      let buffers = [];
      
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        let pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Generate QR Code Buffer
      const trackingUrl = `http://localhost:5173/trace/${invoiceNumber}`;
      const qrImageBuffer = await QRCode.toBuffer(trackingUrl);

      // Header
      doc.fontSize(20).text('UZHAVAN 2 DOORSTEP', { align: 'center' });
      doc.fontSize(12).text('Farmer to Retailer Supply Chain', { align: 'center' });
      doc.moveDown();
      doc.fontSize(25).text('INVOICE', { align: 'center', underline: true });
      doc.moveDown();
      
      doc.fontSize(12).text(`Invoice Number: ${invoiceNumber}`);
      doc.text(`Date: ${new Date().toLocaleString()}`);
      doc.moveDown();
      
      // Buyer Details
      doc.fontSize(14).text('Billed To:', { underline: true });
      doc.fontSize(12).text(`Name: ${buyer.name}`);
      doc.text(`Email: ${buyer.email}`);
      doc.text(`Phone: ${buyer.phone || 'N/A'}`);
      doc.text(`Delivery Address: ${orders[0].deliveryAddress}`);
      doc.moveDown();

      // Product Details Header
      doc.fontSize(14).text('Order Summary:', { underline: true });
      doc.moveDown(0.5);
      
      let grandTotal = 0;

      orders.forEach((order, index) => {
        const product = productsMap[order.productId];
        const farmer = farmersMap[product.farmerId];
        
        doc.fontSize(12).text(`${index + 1}. ${product.name} (${product.category})`);
        doc.fontSize(10).text(`   Seller: ${farmer.name} (${farmer.phone || 'N/A'})`);
        doc.text(`   Quantity: ${order.quantity} ${product.unit}`);
        doc.text(`   Unit Price: Rs. ${product.price} / ${product.unit}`);
        doc.text(`   Item Total: Rs. ${order.totalAmount}`);
        doc.moveDown(0.5);
        
        grandTotal += order.totalAmount;
      });
      
      // Total
      doc.moveDown();
      doc.rect(50, doc.y, 500, 2).fill();
      doc.moveDown();
      doc.fontSize(16).text(`Grand Total: Rs. ${grandTotal}`, { align: 'right' });

      // Add QR Code
      doc.moveDown(2);
      doc.fontSize(12).text('Scan to View Product Traceability (Farm Journey):', { align: 'center', underline: true });
      doc.image(qrImageBuffer, (doc.page.width - 100) / 2, doc.y + 10, { width: 100 });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
