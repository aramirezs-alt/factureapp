const nodemailer = require('nodemailer');

let transporter;
let isTestMode = false;

const createEtherealTransporter = async () => {
  console.log('⚠️ Using Ethereal test mode (Auto-fallback)...');
  const testAccount = await nodemailer.createTestAccount();
  isTestMode = true;
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

const getTransporter = async () => {
  if (transporter) return transporter;

  const hasCredentials = process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.EMAIL_PASS !== 'TU_APP_PASSWORD';

  if (hasCredentials) {
    try {
      console.log('Trying configured SMTP: ' + process.env.EMAIL_USER);
      const tempTransporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      // Verify immediately
      await tempTransporter.verify();
      console.log('✅ SMTP configured correctly!');
      transporter = tempTransporter;
      isTestMode = false;
    } catch (error) {
      console.error('❌ SMTP configuration failed. Falling back to Ethereal.');
      transporter = await createEtherealTransporter();
    }
  } else {
    transporter = await createEtherealTransporter();
  }
  return transporter;
};

const sendEmail = async ({ to, subject, text, html, attachments }) => {
  try {
    const currentTransporter = await getTransporter();
    const mailOptions = {
      from: `"FactureApp" <${isTestMode ? 'no-reply@ethereal.email' : process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
      attachments
    };

    const info = await currentTransporter.sendMail(mailOptions);
    
    if (isTestMode) {
      console.log('✉️ Email sent (TEST MODE)');
      console.log('🔗 Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } else {
      console.log('Email sent: %s', info.messageId);
    }
    
    return info;
  } catch (error) {
    // If it failed because of credentials during send, try one last time with Ethereal
    if (error.code === 'EAUTH' && !isTestMode) {
      console.log('🔄 Auth failed during sending. Retrying with Ethereal...');
      transporter = await createEtherealTransporter();
      return sendEmail({ to, subject, text, html, attachments });
    }
    console.error('Error sending email:', error);
    throw error;
  }
};

const verifyTransporter = async () => {
  try {
    const currentTransporter = await getTransporter();
    await currentTransporter.verify();
    console.log('Email Service: Ready');
  } catch (error) {
    console.error('Email Service: Error', error.message);
  }
};

module.exports = {
  sendEmail,
  verifyTransporter
};

