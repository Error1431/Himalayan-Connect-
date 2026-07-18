import { useState } from 'react';
import { Button, useToast } from '.';

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

export default function RazorpayCheckoutButton({ amount, onSuccess }) {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);

    const handlePay = async () => {
        setLoading(true);
        const loaded = await loadRazorpayScript();

        if (!loaded) {
            showToast('Could not load payment gateway', 'error');
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/payments/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ amount }),
            });
            const order = await response.json();

            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                order_id: order.id,
                name: 'Himalayan Connect',
                theme: { color: '#16a34a' },
                handler: (paymentResult) => {
                    onSuccess?.(paymentResult);
                    showToast('Payment successful', 'success');
                },
            };

            const razorpayInstance = new window.Razorpay(options);
            razorpayInstance.open();
        } catch (error) {
            showToast('Payment could not be started', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button onClick={handlePay} disabled={loading}>
            {loading ? 'Processing...' : `Pay ₹${amount}`}
        </Button>
    );
}