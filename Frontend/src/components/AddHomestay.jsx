import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCamera, FaTimes, FaWifi, FaUtensils, FaParking, FaFire } from 'react-icons/fa';
import Input from './ui/Input';
import Button from './ui/Button';
import { useToast } from './ToastContainer';
import api from '../utils/api';

const MAX_IMAGES = 6;

export default function AddHomestay() {
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: '',
        location: '',
        pricePerNight: '',
        rooms: '',
        description: '',
        occupancy: 'double',
        acType: 'non-ac',
        wifi: false,
        meals: false,
        parking: false,
        bonfire: false,
    });
    const [images, setImages] = useState([]); // File objects
    const [previews, setPreviews] = useState([]); // object URLs
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (field) => (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleImagesSelected = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const combined = [...images, ...files].slice(0, MAX_IMAGES);
        if (images.length + files.length > MAX_IMAGES) {
            addToast(`You can upload up to ${MAX_IMAGES} photos — only the first ${MAX_IMAGES} were kept.`, 'info');
        }
        setImages(combined);
        setPreviews(combined.map((f) => URL.createObjectURL(f)));
        e.target.value = ''; // allow re-selecting the same file later
    };

    const removeImage = (index) => {
        const nextImages = images.filter((_, i) => i !== index);
        setImages(nextImages);
        setPreviews(nextImages.map((f) => URL.createObjectURL(f)));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.location || !form.pricePerNight) {
            addToast('Please fill in all required fields', 'error');
            return;
        }
        if (images.length === 0) {
            addToast('Please upload at least 1 photo of your homestay', 'error');
            return;
        }

        // "Village, District" style location -> split for the backend
        const [village = '', district = ''] = form.location.split(',').map((s) => s.trim());

        setSubmitting(true);
        try {
            const data = new FormData();
            data.append('homestayName', form.title);
            data.append('village', village);
            data.append('district', district);
            data.append('price', form.pricePerNight);
            data.append('rooms', form.rooms || '1');
            data.append('description', form.description);
            data.append('occupancy', form.occupancy);
            data.append('acType', form.acType);
            data.append('wifi', form.wifi);
            data.append('meals', form.meals);
            data.append('parking', form.parking);
            data.append('bonfire', form.bonfire);
            images.forEach((file) => data.append('images', file));

            await api.post('/homestays', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            addToast('Homestay listing submitted! 🎉', 'success');
            setForm({
                title: '', location: '', pricePerNight: '', rooms: '', description: '',
                occupancy: 'double', acType: 'non-ac', wifi: false, meals: false, parking: false, bonfire: false,
            });
            setImages([]);
            setPreviews([]);
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-ink-soft">Room Occupancy</label>
                    <select
                        value={form.occupancy}
                        onChange={handleChange('occupancy')}
                        className="rounded-lg border border-outline px-3 py-2 text-sm bg-surface text-ink-soft focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <option value="single">Single</option>
                        <option value="double">Double</option>
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-ink-soft">Room Type</label>
                    <select
                        value={form.acType}
                        onChange={handleChange('acType')}
                        className="rounded-lg border border-outline px-3 py-2 text-sm bg-surface text-ink-soft focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <option value="non-ac">Non-AC</option>
                        <option value="ac">AC</option>
                    </select>
                </div>
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

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-ink-soft">Amenities</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                        { key: 'wifi', label: 'WiFi', icon: FaWifi },
                        { key: 'meals', label: 'Meals', icon: FaUtensils },
                        { key: 'parking', label: 'Parking', icon: FaParking },
                        { key: 'bonfire', label: 'Bonfire', icon: FaFire },
                    ].map(({ key, label, icon: Icon }) => (
                        <label
                            key={key}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition ${
                                form[key] ? 'border-green-500 bg-green-50 text-green-700' : 'border-outline text-ink-soft'
                            }`}
                        >
                            <input type="checkbox" checked={form[key]} onChange={handleChange(key)} className="hidden" />
                            <Icon /> {label}
                        </label>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-ink-soft">
                    Photos <span className="text-ink-soft-soft font-normal">(1 required, up to {MAX_IMAGES})</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {previews.map((src, i) => (
                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-outline group">
                            <img src={src} alt={`Homestay ${i + 1}`} className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => removeImage(i)}
                                className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                            >
                                <FaTimes size={12} />
                            </button>
                        </div>
                    ))}
                    {images.length < MAX_IMAGES && (
                        <label className="aspect-square rounded-lg border-2 border-dashed border-outline flex flex-col items-center justify-center gap-1 cursor-pointer text-ink-soft-soft hover:border-green-500 hover:text-green-600 transition">
                            <FaCamera size={20} />
                            <span className="text-xs font-semibold">Add Photo</span>
                            <input type="file" accept="image/*" multiple onChange={handleImagesSelected} className="hidden" />
                        </label>
                    )}
                </div>
            </div>

            <Button type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Listing'}
            </Button>
        </form>
    );
}
