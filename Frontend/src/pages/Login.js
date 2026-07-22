import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaMountain, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle } from 'react-icons/fa';
import { API_BASE_URL } from '../utils/api';

const OAUTH_ERROR_MESSAGES = {
  no_account: "We couldn't find a Himalaya Connect account for that Google email. Please register first — it only takes a moment.",
  google_not_configured: 'Google sign-in is not set up on this server yet. Please use your email and password.',
  google_auth_failed: 'Google sign-in did not complete. Please try again.',
  google_duplicate_account: 'Something went wrong creating your account. Please try again or register with your email instead.',
  NO_EMAIL: 'Your Google account has no public email address, so we could not sign you in.',
};

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get('oauth_error');
    if (oauthError) {
      toast.error(OAUTH_ERROR_MESSAGES[oauthError] || 'Google sign-in failed. Please try again.', { autoClose: 7000 });
      // Clean the URL so a refresh doesn't re-show the toast
      window.history.replaceState({}, '', '/login');
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(formData.email, formData.password);
      toast.success(`Welcome back, ${data.user.name}!`);

      // Redirect based on role
      if (data.user.role === 'farmer') navigate('/farmer/dashboard');
      else if (data.user.role === 'homestay_owner') navigate('/homestay/dashboard');
      else if (data.user.role === 'admin') navigate('/admin');
      else navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 py-12 px-4">
      <div className="bg-surface dark:bg-surface rounded-2xl shadow-2xl w-full max-w-md p-8">

        {/* Logo */}
        <div className="text-center mb-8">
          <FaMountain className="text-5xl text-green-600 mx-auto mb-3" />
          <h2 className="text-3xl font-bold text-ink-soft dark:text-ink-soft">Welcome Back</h2>
          <p className="text-gray-500 dark:text-ink-soft-soft">Sign in to Himalayan Connect</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-ink-soft-soft dark:text-ink-soft-soft text-sm font-semibold mb-2">Email Address</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-ink-soft-soft" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-outline rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="farmer@example.com"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-ink-soft-soft dark:text-ink-soft-soft text-sm font-semibold">Password</label>
              <Link to="/forgot-password" className="text-xs font-semibold text-green-600 hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-ink-soft-soft" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-outline rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="••••••••"
                required
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50 text-lg"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-200 dark:bg-outline" />
          <span className="text-xs text-gray-400 dark:text-ink-soft-soft font-medium">OR</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-outline" />
        </div>

        <a
          href={`${API_BASE_URL}/api/auth/google?intent=login`}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 dark:border-outline text-ink-soft dark:text-ink-soft py-3 rounded-xl font-semibold hover:bg-surface-alt dark:hover:bg-surface-alt transition"
        >
          <FaGoogle className="text-red-500" /> Sign in with Google
        </a>

        <div className="text-center mt-6">
          <p className="text-ink-soft-soft dark:text-ink-soft-soft">
            Don't have an account?{' '}
            <Link to="/register" className="text-green-600 font-semibold hover:underline">Register Now</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;