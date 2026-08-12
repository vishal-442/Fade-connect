const nodemailer = require('nodemailer');

const isConfigured = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

let transporter = null;
if (isConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

/**
 * Sends an email, or logs it to the console when SMTP is not configured
 * (keeps auth flows / booking confirmations usable in local dev).
 */
const sendEmail = async ({ to, subject, html, text }) => {
  if (!isConfigured) {
    console.log('\n----- [DEV EMAIL] -----');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(text || html);
    console.log('------------------------\n');
    return { delivered: false, dev: true };
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'Fade Connect <no-reply@fadeconnect.app>',
    to,
    subject,
    html,
    text,
  });
  return { delivered: true, dev: false };
};

module.exports = sendEmail;
