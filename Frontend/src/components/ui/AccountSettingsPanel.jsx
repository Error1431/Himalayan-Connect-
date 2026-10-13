import { Link } from 'react-router-dom';
import SettingsThemeToggle from './SettingsThemeToggle';
import PaymentMethodSelector from './PaymentMethodSelector';
import AadhaarField from './AadhaarField';
import Button from './Button';

export default function AccountSettingsPanel({
    role,
    aadhaar,
    onAadhaarChange,
    paymentMethod,
    onPaymentMethodChange,
}) {
    return (
        <div className="space-y-8">
            <SettingsThemeToggle />

            {(role === 'farmer' || role === 'homestay') && (
                <div className="bg-surface rounded-2xl border border-outline p-5 space-y-4">
                    <h3 className="font-semibold text-ink-soft">Identity Verification</h3>
                    <AadhaarField value={aadhaar} onChange={onAadhaarChange} />
                    <p className="text-xs text-ink-soft-soft">
                        A clear photo of your Aadhaar card will also be requested during manual review before your listings go live.
                    </p>
                </div>
            )}

            <div className="bg-surface rounded-2xl border border-outline p-5 space-y-4">
                <h3 className="font-semibold text-ink-soft">Payment Method</h3>
                <PaymentMethodSelector value={paymentMethod} onChange={onPaymentMethodChange} />
            </div>

            {role === 'farmer' && (
                <Link to="/farmer/dashboard">
                    <Button variant="outline" className="w-full">Manage My Products</Button>
                </Link>
            )}

            {role === 'homestay' && (
                <Link to="/homestay/add-listing">
                    <Button variant="outline" className="w-full">Add New Homestay Listing</Button>
                </Link>
            )}
        </div>
    );
}