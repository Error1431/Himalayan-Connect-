import React, { useState } from 'react';
import api from '../utils/api';
import { FaCamera, FaTimes } from 'react-icons/fa';

const AddProduct = ({ onClose, onProductAdded }) => {
    const [formData, setFormData] = useState({
        productName: '', category: '', description: '', basePrice: '', unit: 'kg', quantity: '', locationAddress: ''
    });
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (image) data.append('image', image);

        try {
            // ⚠️ Dhyan rakh: Content-Type header auto-set ho jayega FormData ke sath
            await api.post('/products', data);
            alert('Product added successfully!');
            onProductAdded(); // Dashboard refresh karne ke liye
            onClose();
        } catch (err) {
            alert('Upload failed: ' + (err.response?.data?.message || 'Check console'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface dark:bg-surface rounded-3xl w-full max-w-lg p-8 relative shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 dark:text-ink-soft-soft"><FaTimes /></button>
                <h2 className="text-2xl font-bold mb-6">Add New Crop</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Product Name (e.g., Bhindi)" className="w-full p-3 border rounded-xl" required onChange={(e) => setFormData({ ...formData, productName: e.target.value })} />

                    <select className="w-full p-3 border rounded-xl" onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                        <option value="">Select Category</option>
                        <option value="Vegetables">Vegetables</option>
                        <option value="Pulses">Pulses</option>
                        <option value="Millets">Millets</option>
                    </select>

                    <input type="number" placeholder="Price per unit (₹)" className="w-full p-3 border rounded-xl" required onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })} />

                    {/* Location field jahan tum address likhoge */}
                    <input type="text" placeholder="Village / Place Name" className="w-full p-3 border rounded-xl" required onChange={(e) => setFormData({ ...formData, locationAddress: e.target.value })} />

                    <div className="border-2 border-dashed p-4 rounded-xl text-center">
                        <input type="file" onChange={(e) => setImage(e.target.files[0])} />
                        <p className="text-xs text-gray-400 dark:text-ink-soft-soft mt-2">Upload product photo</p>
                    </div>

                    <button disabled={loading} className="w-full bg-emerald-600 text-white p-3 rounded-xl font-bold hover:bg-emerald-700">
                        {loading ? 'Uploading...' : 'Submit Product'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddProduct;