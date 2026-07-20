const axios = require('axios');

// Reads an SMS gateway config from the environment (Fast2SMS — simple REST
// API, popular for Indian numbers). If not configured, falls back to
// logging the OTP to the console so registration still works end-to-end in
// local/dev setups without a paid SMS account.
//
// Swapping providers later (MSG91, Twilio, etc.) only requires changing
// this one file — the rest of the app just calls sendSmsOtp().
async function sendSmsOtp(fullPhoneNumber, otp) {
  const apiKey = process.env.SMS_API_KEY;

  if (!apiKey) {
    console.log('\n================ SMS (dev fallback, no SMS_API_KEY configured) ================');
    console.log('To:', fullPhoneNumber);
    console.log('Message: Your Himalaya Connect verification code is', otp, '- valid for 10 minutes.');
    console.log('=================================================================================\n');
    return { usingRealSMS: false };
  }

  // Fast2SMS expects a bare 10-digit Indian number (no +91). For other
  // countries you'd swap in a different provider that accepts full E.164
  // numbers — this is intentionally isolated to this one function.
  const digitsOnly = fullPhoneNumber.replace(/\D/g, '').slice(-10);

  await axios.post(
    'https://www.fast2sms.com/dev/bulkV2',
    {
      route: 'otp',
      variables_values: otp,
      numbers: digitsOnly
    },
    {
      headers: {
        authorization: apiKey,
        'Content-Type': 'application/json'
      }
    }
  );

  return { usingRealSMS: true };
}

module.exports = { sendSmsOtp };
