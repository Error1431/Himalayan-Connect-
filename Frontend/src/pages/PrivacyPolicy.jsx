import { FaUserShield } from 'react-icons/fa';
import DynamicLayout from '../components/ui/DynamicLayout';

const sections = [
    {
        title: 'Information We Collect',
        body: 'We collect your name, contact details, location and payment information when you register, list a product, list a homestay, or make a booking on Himalayan Connect.',
    },
    {
        title: 'Identity Verification',
        body: 'Farmers and homestay hosts are required to complete Aadhaar based identity verification before their listings go live. This information is stored securely and is only used to confirm identity and prevent fraud.',
    },
    {
        title: 'How We Use Your Data',
        body: 'Your data is used to process orders and bookings, enable chat between buyers and sellers, show relevant listings near you, and send booking or order updates.',
    },
    {
        title: 'Data Sharing',
        body: 'We do not sell your personal data. Limited information such as your name and contact number is shared with the farmer or homestay host only when required to fulfil an order or booking.',
    },
    {
        title: 'Payment Information',
        body: 'Payments made through UPI, debit or credit cards, or Razorpay are processed by our payment partners directly. Himalayan Connect does not store your card or UPI credentials.',
    },
    {
        title: 'Your Rights',
        body: 'You may request access to, correction of, or deletion of your personal data at any time by writing to our support team.',
    },
];

export default function PrivacyPolicy() {
    return (
        <DynamicLayout
            bannerImage="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80"
            icon={FaUserShield}
            title="Privacy Policy"
            subtitle="How we collect, use and protect your information"
        >
            <div className="bg-surface rounded-3xl shadow-sm dark:shadow-none border border-outline max-w-3xl mx-auto p-8 space-y-7">
                {sections.map((section) => (
                    <div key={section.title}>
                        <h3 className="font-bold text-ink-soft text-lg">{section.title}</h3>
                        <p className="text-ink-soft-soft mt-1.5 leading-relaxed">{section.body}</p>
                    </div>
                ))}
            </div>
        </DynamicLayout>
    );
}