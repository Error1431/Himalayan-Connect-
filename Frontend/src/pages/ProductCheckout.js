import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaLock, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastContainer';
import api from '../utils/api';
import { payWithRazorpay } from '../utils/razorpay';

const ProductCheckout = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [product, setProduct] = useState(location.state?.product || null);
  const [loading, setLoading] = useState(!location.state?.product);
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    line1: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    if (!product) {
      api
        .get(`/products/${id}`)
        .then((res) => setProduct(res.data.product || res.data))
        .catch(() => addToast('Could not load this product', 'error'))
        .finally(() => setLoading(false));
    }
  }, [id, product, addToast]);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const price = product?.pricing?.basePrice || product?.basePrice || 0;
  const unit = product?.pricing?.unit || product?.unit || 'kg';
  const total = price * quantity;

  const getSellerId = (p) => p?.farmer?._id || p?.farmerId || null;
  const getSellerName = (p) => p?.farmer?.name || p?.farmerName || 'Himalayan Farmer';

  const handlePayAndOrder = async () => {
    if (!form.name || !form.email || !form.phone) {
      addToast('Please fill in your name, email and phone', 'error');
      return;
    }
    if (!form.line1 || !form.city || !form.state || !form.pincode) {
      addToast('Please fill in your complete delivery address', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const paymentResult = await payWithRazorpay({
        amount: total,
        name: form.name,
        email: form.email,
        phone: form.phone,
        description: `Order: ${product.productName}`,
        notes: { productId: product._id, type: 'product_order' },
      });

      const address = `${form.line1}, ${form.city}, ${form.state} - ${form.pincode}`;
      const res = await api.post('/orders', {
        items: [
          {
            id: product._id,
            type: 'product',
            name: product.productName,
            price,
            qty: quantity,
            sellerId: getSellerId(product),
          },
        ],
        deliveryAddress: address,
        payment: { method: 'online', transactionId: paymentResult.razorpay_payment_id },
      });

      addToast('🎉 Payment successful — your order is confirmed!', 'success');
      setOrderPlaced(res.data.orders?.[0] || null);
    } catch (error) {
      if (error.code === 'CANCELLED') {
        addToast('Payment cancelled — your order was not placed.', 'info');
      } else if (error.response?.data?.code === 'PAYMENTS_NOT_CONFIGURED') {
        addToast('Online payments are not set up on this server yet.', 'error');
      } else {
        addToast(error.response?.data?.message || error.message || 'Order failed', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-ink-soft-soft dark:text-ink-soft-soft mb-4">We couldn't find this product.</p>
        <Link to="/products" className="text-green-600 font-semibold hover:underline">← Back to Products</Link>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-ink-soft dark:text-ink-soft mb-2">Order Confirmed!</h1>
        <p className="text-ink-soft-soft dark:text-ink-soft-soft mb-6">
          {product.productName} × {quantity} — the seller has been notified to arrange delivery.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/settings" className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-green-700 transition">
            View My Orders
          </Link>
          <Link to="/products" className="border border-gray-300 dark:border-outline px-5 py-2.5 rounded-xl font-semibold hover:bg-surface-alt transition">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-ink-soft-soft dark:text-ink-soft-soft mb-6 hover:text-green-600">
        <FaArrowLeft /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-surface dark:bg-surface rounded-xl shadow-lg p-6 space-y-6">
          <h1 className="text-xl font-bold text-ink-soft dark:text-ink-soft">Checkout</h1>

          <div className="flex gap-4 items-center border-b border-gray-100 dark:border-outline pb-4">
            <img
              src={product.imageUrl || product.images?.[0] || 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=200&q=80'}
              alt={product.productName}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div className="flex-1">
              <p className="font-bold text-ink-soft dark:text-ink-soft">{product.productName}</p>
              <p className="text-sm text-ink-soft-soft dark:text-ink-soft-soft">by {getSellerName(product)}</p>
              <p className="text-green-600 font-bold">₹{price}/{unit}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-8 h-8 rounded-lg border border-gray-300 dark:border-outline font-bold">-</button>
              <span className="w-8 text-center font-semibold">{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)} className="w-8 h-8 rounded-lg border border-gray-300 dark:border-outline font-bold">+</button>
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-ink-soft dark:text-ink-soft mb-3">Contact Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name *" className="w-full px-4 py-3 border-2 border-gray-200 dark:border-outline rounded-lg focus:border-green-500 focus:outline-none" />
              <input name="email" value={form.email} onChange={handleChange} placeholder="Email *" className="w-full px-4 py-3 border-2 border-gray-200 dark:border-outline rounded-lg focus:border-green-500 focus:outline-none" />
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone *" className="w-full px-4 py-3 border-2 border-gray-200 dark:border-outline rounded-lg focus:border-green-500 focus:outline-none md:col-span-2" />
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-ink-soft dark:text-ink-soft mb-3 flex items-center gap-2">
              <FaMapMarkerAlt className="text-green-600" /> Delivery Address
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="line1" value={form.line1} onChange={handleChange} placeholder="Address Line *" className="w-full px-4 py-3 border-2 border-gray-200 dark:border-outline rounded-lg focus:border-green-500 focus:outline-none md:col-span-2" />
              <input name="city" value={form.city} onChange={handleChange} placeholder="City *" className="w-full px-4 py-3 border-2 border-gray-200 dark:border-outline rounded-lg focus:border-green-500 focus:outline-none" />
              <input name="state" value={form.state} onChange={handleChange} placeholder="State *" className="w-full px-4 py-3 border-2 border-gray-200 dark:border-outline rounded-lg focus:border-green-500 focus:outline-none" />
              <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="Pincode *" maxLength={6} className="w-full px-4 py-3 border-2 border-gray-200 dark:border-outline rounded-lg focus:border-green-500 focus:outline-none" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-surface dark:bg-surface rounded-xl shadow-lg p-6 sticky top-24 space-y-3">
            <h3 className="font-bold text-lg text-ink-soft dark:text-ink-soft mb-2">Order Summary</h3>
            <div className="flex justify-between text-sm">
              <span className="text-ink-soft-soft dark:text-ink-soft-soft">{product.productName} × {quantity}</span>
              <span className="font-semibold">₹{total}</span>
            </div>
            <hr className="border-gray-100 dark:border-outline" />
            <div className="flex justify-between text-lg">
              <span className="font-bold text-ink-soft dark:text-ink-soft">Total</span>
              <span className="font-bold text-green-600">₹{total}</span>
            </div>
            <button
              onClick={handlePayAndOrder}
              disabled={submitting}
              className="w-full mt-3 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FaLock className="text-sm" /> {submitting ? 'Processing...' : `Pay ₹${total} Securely`}
            </button>
            <p className="text-xs text-center text-gray-500 dark:text-ink-soft-soft">🔒 UPI, Debit/Credit Card, Netbanking or Wallet — zero commission, straight to the farmer.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCheckout;
