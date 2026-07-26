import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaMountain, FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import api from '../utils/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      toast.success(data.message || 'If an account exists, a reset link has been sent.');
      setSent(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 px-4">
      <div className="bg-surface dark:bg-surface rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <FaMountain className="text-5xl text-green-600 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-ink-soft dark:text-ink-soft">Forgot Password?</h2>
          <p className="text-gray-500 dark:text-ink-soft-soft mt-1">
            {sent
              ? "We've sent a reset link to your email if an account exists."
              : "Enter your email and we'll send you a link to reset your password."}
          </p>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 rounded-xl p-4 mb-6">
              <p className="text-green-700 dark:text-green-400 text-sm">
                Check your inbox (and spam folder) for <strong>{email}</strong>. The link expires in 1 hour.
              </p>
            </div>
            <button
              onClick={() => setSent(false)}
              className="text-green-600 font-semibold hover:underline text-sm"
            >
              Didn't get it? Try again
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-ink-soft-soft dark:text-ink-soft-soft text-sm font-semibold mb-2">Email Address</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-ink-soft-soft" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-surface dark:bg-surface text-ink-soft dark:text-ink-soft dark:border-outline"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          <Link to="/login" className="text-green-600 font-semibold hover:underline text-sm flex items-center justify-center gap-1.5">
            <FaArrowLeft className="text-xs" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
