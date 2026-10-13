import api from './api';

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Opens Razorpay's hosted checkout modal, which itself offers UPI (incl.
 * Google Pay / PhonePe), debit/credit cards, netbanking and wallets — so we
 * don't need to build separate custom forms for each payment method.
 *
 * @param {Object} opts
 * @param {number} opts.amount - Amount in rupees.
 * @param {string} opts.name - Customer's name (prefill).
 * @param {string} opts.email - Customer's email (prefill).
 * @param {string} opts.phone - Customer's phone (prefill).
 * @param {string} opts.description - What this payment is for.
 * @param {Object} [opts.notes] - Extra metadata stored on the Razorpay order.
 * @returns {Promise<{razorpay_order_id, razorpay_payment_id, razorpay_signature}>}
 *          Resolves on a *verified* successful payment. Rejects with an
 *          Error (with a `.code`) on failure, cancellation, or misconfiguration.
 */
export async function payWithRazorpay({ amount, name, email, phone, description, notes }) {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    const err = new Error('Could not load the payment gateway. Check your internet connection.');
    err.code = 'SCRIPT_LOAD_FAILED';
    throw err;
  }

  const { data } = await api.post('/payments/create-order', { amount, notes });
  const { order, keyId } = data;

  return new Promise((resolve, reject) => {
    const options = {
      key: keyId,
      amount: order.amount,
      currency: order.currency,
      order_id: order.id,
      name: 'Himalaya Connect',
      description: description || 'Payment to Himalaya Connect',
      prefill: { name, email, contact: phone },
      theme: { color: '#16a34a' },
      handler: async (response) => {
        try {
          const verifyRes = await api.post('/payments/verify-payment', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          if (verifyRes.data.verified) {
            resolve(response);
          } else {
            const err = new Error('Payment could not be verified. If money was deducted, it will be refunded automatically.');
            err.code = 'VERIFY_FAILED';
            reject(err);
          }
        } catch (err) {
          err.code = err.code || 'VERIFY_FAILED';
          reject(err);
        }
      },
      modal: {
        ondismiss: () => {
          const err = new Error('Payment was cancelled.');
          err.code = 'CANCELLED';
          reject(err);
        },
      },
    };

    const razorpayInstance = new window.Razorpay(options);
    razorpayInstance.on('payment.failed', (response) => {
      const err = new Error(response?.error?.description || 'Payment failed. Please try again.');
      err.code = 'PAYMENT_FAILED';
      reject(err);
    });
    razorpayInstance.open();
  });
}
