const axios = require('axios');

/**
 * Sends an SMS OTP using Fast2SMS with automatic Developer Fallback.
 * 
 * @param {string} fullPhoneNumber - Phone number with or without dial code.
 * @param {string|number} otp - Generated verification code.
 * @returns {Promise<{usingRealSMS: boolean}>}
 */
async function sendSmsOtp(fullPhoneNumber, otp) {
  const apiKey = process.env.SMS_API_KEY;

  // Extract exactly 10 digits for Indian mobile numbers
  const digitsOnly = String(fullPhoneNumber).replace(/\D/g, '').slice(-10);

  // 1. Dev Fallback: If SMS API Key is missing in .env
  if (!apiKey) {
    console.log('\n================ SMS (Dev Fallback - No SMS_API_KEY) ================');
    console.log('To:', fullPhoneNumber);
    console.log('OTP Code:', otp);
    console.log('Message: Your Himalaya Connect verification code is', otp, '- valid for 10 minutes.');
    console.log('======================================================================\n');
    return { usingRealSMS: false };
  }

  try {
    const response = await axios.post(
      'https://www.fast2sms.com/dev/bulkV2',
      {
        route: 'otp',
        variables_values: String(otp), // Fast2SMS strictly requires string format
        numbers: digitsOnly
      },
      {
        headers: {
          authorization: apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 8000 // 8 second timeout to avoid hanging requests
      }
    );

    // Fast2SMS returns HTTP 200 even on some logical failures (e.g., low balance)
    if (response.data && response.data.return === true) {
      console.log(`✅ [SMS SUCCESS] Sent OTP ${otp} to ${digitsOnly}`);
      return { usingRealSMS: true };
    } else {
      console.warn(`⚠️ [Fast2SMS Rejected]:`, response.data?.message || response.data);
      throw new Error(response.data?.message || 'Fast2SMS dispatch failed');
    }

  } catch (error) {
    // 2. Dev Graceful Fallback: Handles Fast2SMS failures (e.g. 400 Bad Request / 401 Unauthorized / Insufficient Funds)
    console.error('\n❌ [Fast2SMS Gateway Error]:', error.response?.data || error.message);
    console.log('================ SMS (Dev Fallback Active) ================');
    console.log('To:', fullPhoneNumber);
    console.log('OTP Code:', otp);
    console.log('Status: Fast2SMS failed, but OTP logged above to keep registration unblocked.');
    console.log('===========================================================\n');

    // Return false instead of re-throwing, allowing registration flow to proceed in dev mode
    return { usingRealSMS: false };
  }
}

module.exports = { sendSmsOtp };