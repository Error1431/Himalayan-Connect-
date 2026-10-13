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
    // Dev/graceful fallback — the OTP is still generated, verified, and
    // registration proceeds normally; only the actual SMS delivery failed.
    const gatewayMessage = error.response?.data?.message || error.message;
    const isDltNotConfigured = error.response?.data?.status_code === 996;

    if (isDltNotConfigured) {
      // This specific code means the Fast2SMS ACCOUNT (not the code) hasn't
      // completed DLT/website verification yet — required by Indian telecom
      // regulation before the 'otp' route can send real SMS. Nothing to fix
      // in code; the account owner needs to complete verification in the
      // Fast2SMS dashboard (or use the 'q' quick route for testing).
      console.warn(
        `⚠️  Fast2SMS account not yet verified for OTP delivery (see: https://www.fast2sms.com/dashboard/dev-api → OTP Message / DLT SMS). ` +
        `Falling back to console-logged OTPs until this is completed.`
      );
    } else {
      console.error('❌ Fast2SMS delivery failed:', gatewayMessage);
    }

    console.log('\n================ SMS (Dev Fallback Active) ================');
    console.log('To:', fullPhoneNumber);
    console.log('OTP Code:', otp);
    console.log('Status: SMS gateway unavailable — OTP logged above so registration can continue.');
    console.log('===========================================================\n');

    // Return false instead of re-throwing, allowing registration flow to proceed in dev mode
    return { usingRealSMS: false };
  }
}

module.exports = { sendSmsOtp };