const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

/**
 * sendMail({ to, subject, html })
 */
module.exports = async function sendMail({ to, subject, html }) {
  const list = Array.isArray(to) ? to.filter(Boolean) : [to];
  console.log('📧  Enviando a:', list);           // ← debug
  return transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: list,
    subject,
    html
  });
};

