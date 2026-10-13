import { FaFileContract } from 'react-icons/fa';
import DynamicLayout from '../components/ui/DynamicLayout';

const sections = [
    {
        title: 'Product Responsibility',
        body: 'All farmers and sellers listing produce on Himalayan Connect are solely responsible for the quality, freshness and accurate description of the products they list and sell.',
    },
    {
        title: 'Expired or Damaged Goods',
        body: 'If a product is found to be expired, spoiled, or significantly different from its listing at the time of delivery, the responsibility lies entirely with the seller or farmer who listed it. Himalayan Connect acts only as a connecting platform between buyers and sellers.',
    },
    {
        title: 'Complaint Handling',
        body: 'Any complaint raised by a buyer against a seller, farmer or homestay host will be reviewed by our support team. Action will be taken based on the severity and evidence of the complaint, including warnings, listing removal, or temporary suspension.',
    },
    {
        title: 'Account Suspension',
        body: 'Himalayan Connect reserves the right to suspend or permanently disable the account of any farmer, homestay host, or customer found violating platform policies, repeatedly delivering substandard products, or engaging in fraudulent activity.',
    },
    {
        title: 'Homestay Bookings',
        body: 'Homestay hosts are responsible for the accuracy of their listing, room availability and condition of the property at the time of check-in. Cancellation terms are governed by the policy stated on the cancellation page.',
    },
    {
        title: 'Payments',
        body: 'Payments made via UPI, debit or credit card, or Razorpay checkout are final once an order or booking is confirmed, subject to the cancellation and refund policy.',
    },
    {
        title: 'Platform Role',
        body: 'Himalayan Connect facilitates discovery, communication and payment between farmers, homestay hosts and customers, and is not a party to the actual sale or stay agreement between them.',
    },
];

export default function TermsAndConditions() {
    return (
        <DynamicLayout
            bannerImage="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80"
            icon={FaFileContract}
            title="Terms & Conditions"
            subtitle="Rules and responsibilities for using Himalayan Connect"
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