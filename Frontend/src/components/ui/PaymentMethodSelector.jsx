import { useState } from 'react';

const methods = [
    { id: 'upi', label: 'UPI', hint: 'Google Pay, PhonePe, Paytm' },
    { id: 'card', label: 'Debit / Credit Card', hint: 'Visa, Mastercard, RuPay' },
    { id: 'razorpay', label: 'Razorpay Checkout', hint: 'Netbanking and wallets' },
];

export default function PaymentMethodSelector({ value, onChange }) {
    const [selected, setSelected] = useState(value || 'upi');

    const handleSelect = (id) => {
        setSelected(id);
        onChange?.(id);
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {methods.map((method) => (
                <button
                    key={method.id}
                    type="button"
                    onClick={() => handleSelect(method.id)}
                    className={`text-left p-4 rounded-2xl border transition-all ${selected === method.id
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-outline bg-surface hover:border-green-300'
                        }`}
                >
                    <p className="font-semibold text-ink-soft">{method.label}</p>
                    <p className="text-xs text-ink-soft-soft mt-1">{method.hint}</p>
                </button>
            ))}
        </div>
    );
}