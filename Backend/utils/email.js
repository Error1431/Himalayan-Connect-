const nodemailer = require('nodemailer');

// Reads SMTP settings from the environment. If none are configured, the
// transporter falls back to logging the email to the console so that
// registration and email-verification still work in local/dev setups
// without requiring real SMTP credentials.
let transporter = null;
let usingRealSMTP = false;

function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    usingRealSMTP = true;
  } else {
    // Dev fallback: "send" the email by logging it, so nothing crashes
    // when SMTP credentials aren't set up yet.
    transporter = {
      sendMail: async (options) => {
        console.log('\n================ EMAIL (dev fallback, no SMTP configured) ================');
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        console.log('Body:\n', options.text || options.html);
        console.log('=============================================================================\n');
        return { messageId: 'dev-fallback' };
      }
    };
    usingRealSMTP = false;
  }

  return transporter;
}

async function sendVerificationEmail(user, token) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const verifyUrl = `${frontendUrl}/verify-email/${token}`;

  const mailer = getTransporter();
  await mailer.sendMail({
    from: process.env.SMTP_FROM || 'Himalaya Connect <no-reply@himalayaconnect.app>',
    to: user.email,
    subject: 'Verify your Himalaya Connect email address',
    text: `Hi ${user.name},\n\nWelcome to Himalaya Connect! Please verify your email address by opening this link:\n${verifyUrl}\n\nThis link expires in 24 hours. If you didn't create this account, you can ignore this email.\n\n— Himalaya Connect Team`,
    html: `<p>Hi ${user.name},</p><p>Welcome to Himalaya Connect! Please verify your email address by clicking the button below.</p><p><a href="${verifyUrl}" style="background:#059669;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;display:inline-block;">Verify Email</a></p><p>Or open this link: ${verifyUrl}</p><p>This link expires in 24 hours. If you didn't create this account, you can ignore this email.</p><p>— Himalaya Connect Team</p>`
  });

  return { usingRealSMTP };
}

module.exports = { sendVerificationEmail, getTransporter };
