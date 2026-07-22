import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaMountain, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../utils/api';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { password });
      toast.success(data.message || 'Password reset successfully!');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'This reset link is invalid or has expired');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 px-4">
      <div className="bg-surface dark:bg-surface rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <FaMountain className="text-5xl text-green-600 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-ink-soft dark:text-ink-soft">Reset Your Password</h2>
          <p className="text-gray-500 dark:text-ink-soft-soft mt-1">Choose a new password for your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-ink-soft-soft dark:text-ink-soft-soft text-sm font-semibold mb-2">New Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-ink-soft-soft" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-surface dark:bg-surface text-ink-soft dark:text-ink-soft dark:border-outline"
                placeholder="Min 6 characters"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-ink-soft-soft"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-ink-soft-soft dark:text-ink-soft-soft text-sm font-semibold mb-2">Confirm New Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-surface dark:bg-surface text-ink-soft dark:text-ink-soft dark:border-outline"
              placeholder="Re-enter password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link to="/login" className="text-green-600 font-semibold hover:underline text-sm">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
