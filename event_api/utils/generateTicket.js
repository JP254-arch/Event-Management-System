const PDFDocument = require('pdfkit');

const generateTicket = (user, event) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('error', reject);

    doc.fontSize(24).text('🎟️ Event Ticket', { align: 'center' });
    doc.moveDown(1.5);

    doc.fontSize(16).text(`Event: ${event.title}`, { align: 'left' });
    doc.moveDown(0.5);
    doc.text(`Date: ${new Date(event.date).toLocaleString()}`);
    doc.text(`Location: ${event.location}`);
    doc.text(`Amount Paid: KES ${event.price}`);
    doc.moveDown(1);
    doc.text(`Booked By: ${user.username}`);
    doc.text(`Email: ${user.email}`);

    doc.end();

    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });
  });
};

module.exports = generateTicket;
