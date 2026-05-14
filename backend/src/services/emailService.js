const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, text, html, attachments }) => {
  try {
    const mailOptions = {
      from: `"FactureApp" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
      attachments
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

const verifyTransporter = async () => {
  try {
    await transporter.verify();
    console.log('SMTP server is ready to take our messages');
  } catch (error) {
    console.error('SMTP connection error:', error);
  }
};

module.exports = {
  sendEmail,
  verifyTransporter
};
