// 📁 utils/generateTicket.js
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const generateTicket = (booking, user, event) => {
  return new Promise((resolve, reject) => {
    try {
      const ticketsDir = path.join(__dirname, '..', 'tickets');
      if (!fs.existsSync(ticketsDir)) {
        fs.mkdirSync(ticketsDir);
      }

      const fileName = `ticket_${booking._id}.pdf`;
      const outputPath = path.join(ticketsDir, fileName);

      const doc = new PDFDocument();
      const stream = fs.createWriteStream(outputPath);

      doc.pipe(stream);

      doc.fontSize(20).text('🎫 Event Ticket', { align: 'center' }).moveDown();
      doc.fontSize(14)
        .text(`Event: ${event.title}`)
        .text(`Date: ${new Date(event.date).toLocaleString()}`)
        .text(`Location: ${event.location}`)
        .text(`Price: KES ${event.price}`)
        .moveDown()
        .text(`Booked By: ${user.username} (${user.email})`)
        .text(`Booking ID: ${booking._id}`)
        .moveDown()
        .text(`Thank you for booking with us!`);

      doc.end();

      stream.on('finish', () => {
        resolve(outputPath);
      });

      stream.on('error', (err) => {
        reject(err);
      });
    } catch (err) {
      console.error('❌ Ticket generation failed:', err);
      reject(err);
    }
  });
};

module.exports = generateTicket;
