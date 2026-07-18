import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from './ui/Input';
import Button from './ui/Button';
import { useToast } from './ToastContainer';
import api from '../utils/api';

export default function AddHomestay() {
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: '',
        location: '',
        pricePerNight: '',
        rooms: '',
        description: '',
    });
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.location || !form.pricePerNight) {
            addToast('Please fill in all required fields', 'error');
            return;
        }

        // "Village, District" style location -> split for the backend
        const [village = '', district = ''] = form.location.split(',').map((s) => s.trim());

        setSubmitting(true);
        try {
            await api.post('/homestays', {
                homestayName: form.title,
                village,
                district,
                price: form.pricePerNight,
                rooms: form.rooms,
                description: form.description,
            });
            addToast('Homestay listing submitted for review', 'success');
            setForm({ title: '', location: '', pricePerNight: '', rooms: '', description: '' });
            navigate('/homestays');
        } catch (error) {
            addToast(error.response?.data?.message || 'Could not submit listing', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-surface rounded-3xl border border-outline p-8 space-y-5 max-w-2xl mx-auto shadow-sm dark:shadow-none">
            <h2 className="text-xl font-bold text-ink-soft">List a New Homestay</h2>
            <Input
                label="Homestay Title"
                placeholder="e.g. Riverside Cottage, Ukhimath"
                value={form.title}
                onChange={handleChange('title')}
                required
            />
            <Input
                label="Location"
                placeholder="Village, District, Uttarakhand"
                value={form.location}
                onChange={handleChange('location')}
                required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                    label="Price per Night (₹)"
                    type="number"
                    placeholder="1500"
                    value={form.pricePerNight}
                    onChange={handleChange('pricePerNight')}
                    required
                />
                <Input
                    label="Total Rooms"
                    type="number"
                    placeholder="3"
                    value={form.rooms}
                    onChange={handleChange('rooms')}
                />
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-ink-soft">Description</label>
                <textarea
                    rows="4"
                    value={form.description}
                    onChange={handleChange('description')}
                    placeholder="Describe the rooms, views and nearby attractions..."
                    className="rounded-lg border border-outline px-3 py-2 text-sm bg-surface text-ink-soft placeholder-ink-soft focus:outline-none focus:ring-2 focus:ring-green-500"
                />
            </div>
            <Button type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Listing'}
            </Button>
        </form>
    );
}
