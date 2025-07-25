const nodemailer = require('nodemailer');

const sendEmailWithTicket = async (toEmail, subject, text, buffer, filename) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject,
    text,
    attachments: [
      {
        filename,
        content: buffer
      }
    ]
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendEmailWithTicket;
