import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaMountain, FaUser, FaEnvelope, FaLock, FaPhone, FaLeaf, FaHome, FaShoppingBag, FaGoogle, FaGlobeAsia } from 'react-icons/fa';
import { API_BASE_URL } from '../utils/api';
import { COUNTRIES, INDIA_STATES, findCountry } from '../utils/countries';

const Register = () => {
  const [step, setStep] = useState(1); // Multi-step form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    countryCode: 'IN',
    password: '',
    confirmPassword: '',
    role: '',
    location: {
      village: '',
      district: '',
      state: 'Uttarakhand',
      country: 'India',
      pincode: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCountryChange = (e) => {
    const iso = e.target.value;
    const country = findCountry(iso);
    setFormData((prev) => ({
      ...prev,
      countryCode: iso,
      location: {
        ...prev.location,
        country: country.name,
        state: iso === 'IN' ? (prev.location.state || 'Uttarakhand') : ''
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      const dialCode = findCountry(formData.countryCode).dial;
      const payload = {
        ...formData,
        phone: `${dialCode} ${formData.phone}`.trim(),
        phoneCountryCode: dialCode
      };
      await register(payload);
      toast.success('Registration successful! Welcome to Himalayan Connect! 🏔️');

      if (formData.role === 'farmer') navigate('/farmer/dashboard');
      else if (formData.role === 'homestay_owner') navigate('/homestay/dashboard');
      else navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: 'farmer', icon: FaLeaf, label: 'Farmer', desc: 'Sell organic produce', color: 'green' },
    { value: 'homestay_owner', icon: FaHome, label: 'Homestay Owner', desc: 'List your homestay', color: 'blue' },
    { value: 'customer', icon: FaShoppingBag, label: 'Customer / Traveler', desc: 'Shop & book stays', color: 'purple' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 py-12 px-4">
      <div className="bg-surface dark:bg-surface rounded-2xl shadow-2xl w-full max-w-lg p-8">

        <div className="text-center mb-8">
          <FaMountain className="text-5xl text-green-600 mx-auto mb-3" />
          <h2 className="text-3xl font-bold text-ink-soft dark:text-ink-soft">Join Himalayan Connect</h2>
          <p className="text-gray-500 dark:text-ink-soft-soft">Step {step} of 2</p>
        </div>

        {/* Progress Bar */}
        <div className="flex mb-8 space-x-2">
          <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-green-500' : 'bg-gray-200 dark:bg-surface-alt'}`}></div>
          <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-green-500' : 'bg-gray-200 dark:bg-surface-alt'}`}></div>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Step 1: Role Selection & Basic Info */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-ink-soft-soft dark:text-ink-soft-soft text-sm font-semibold mb-3">I am a...</label>
                <div className="grid grid-cols-1 gap-3">
                  {roles.map(role => (
                    <label
                      key={role.value}
                      className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition ${formData.role === role.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 dark:border-outline hover:border-green-300'
                        }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        checked={formData.role === role.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <role.icon className={`text-2xl mr-4 ${formData.role === role.value ? 'text-green-600' : 'text-gray-400 dark:text-ink-soft-soft'}`} />
                      <div>
                        <p className="font-semibold text-ink-soft dark:text-ink-soft">{role.label}</p>
                        <p className="text-sm text-gray-500 dark:text-ink-soft-soft">{role.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-ink-soft-soft dark:text-ink-soft-soft text-sm font-semibold mb-2">Full Name</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-ink-soft-soft" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Your full name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-ink-soft-soft dark:text-ink-soft-soft text-sm font-semibold mb-2">Phone Number</label>
                <div className="flex gap-2">
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleCountryChange}
                    className="w-28 px-2 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    title="Country code"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.flag} {c.dial}</option>
                    ))}
                  </select>
                  <div className="relative flex-1">
                    <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-ink-soft-soft" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="98765 43210"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!formData.role || !formData.name || !formData.phone) {
                    return toast.error('Please fill all fields');
                  }
                  setStep(2);
                }}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition text-lg"
              >
                Continue →
              </button>
            </div>
          )}

          {/* Step 2: Account Details */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-ink-soft-soft dark:text-ink-soft-soft text-sm font-semibold mb-2">Email Address</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-ink-soft-soft" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-ink-soft-soft dark:text-ink-soft-soft text-sm font-semibold mb-2">Village / Area</label>
                <input
                  type="text"
                  name="location.village"
                  value={formData.location.village}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Chopta, Ukhimath"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-ink-soft-soft dark:text-ink-soft-soft text-sm font-semibold mb-2 flex items-center gap-1.5">
                    <FaGlobeAsia className="text-green-600" /> Country
                  </label>
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleCountryChange}
                    className="w-full px-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-ink-soft-soft dark:text-ink-soft-soft text-sm font-semibold mb-2">State / Region</label>
                  {formData.countryCode === 'IN' ? (
                    <select
                      name="location.state"
                      value={formData.location.state}
                      onChange={handleChange}
                      className="w-full px-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    >
                      {INDIA_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      name="location.state"
                      value={formData.location.state}
                      onChange={handleChange}
                      className="w-full px-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      placeholder="State / Province"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-ink-soft-soft dark:text-ink-soft-soft text-sm font-semibold mb-2">District</label>
                <select
                  name="location.district"
                  value={formData.location.district}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select District</option>
                  <option value="Rudraprayag">Rudraprayag</option>
                  <option value="Chamoli">Chamoli</option>
                  <option value="Uttarkashi">Uttarkashi</option>
                  <option value="Tehri">Tehri Garhwal</option>
                  <option value="Nainital">Nainital</option>
                  <option value="Almora">Almora</option>
                  <option value="Pithoragarh">Pithoragarh</option>
                  <option value="Dehradun">Dehradun</option>
                </select>
              </div>

              <div>
                <label className="block text-ink-soft-soft dark:text-ink-soft-soft text-sm font-semibold mb-2">Password</label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-ink-soft-soft" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Min 6 characters"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <label className="block text-ink-soft-soft dark:text-ink-soft-soft text-sm font-semibold mb-2">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Re-enter password"
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 border-2 border-gray-300 dark:border-outline text-ink-soft-soft dark:text-ink-soft-soft py-3 rounded-xl font-semibold hover:bg-surface-alt transition"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-200 dark:bg-outline" />
          <span className="text-xs text-gray-400 dark:text-ink-soft-soft font-medium">OR</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-outline" />
        </div>

        <a
          href={`${API_BASE_URL}/api/auth/google?intent=register`}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 dark:border-outline text-ink-soft dark:text-ink-soft py-3 rounded-xl font-semibold hover:bg-surface-alt dark:hover:bg-surface-alt transition"
        >
          <FaGoogle className="text-red-500" /> Sign up with Google
        </a>
        <p className="text-center text-xs text-gray-400 dark:text-ink-soft-soft mt-2">
          Google sign-up creates a Customer account — you can add farm or homestay details later from Settings.
        </p>

        <div className="text-center mt-6">
          <p className="text-ink-soft-soft dark:text-ink-soft-soft">
            Already have an account?{' '}
            <Link to="/login" className="text-green-600 font-semibold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;