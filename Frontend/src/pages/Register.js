import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  FaMountain, FaUser, FaEnvelope, FaLock, FaPhone, FaLeaf, FaHome,
  FaShoppingBag, FaGoogle, FaGlobeAsia, FaShieldAlt, FaMapMarkerAlt, FaRedo
} from 'react-icons/fa';
import api, { API_BASE_URL } from '../utils/api';
import { COUNTRIES, INDIA_STATES, findCountry } from '../utils/countries';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30; // seconds

const Register = () => {
  const [step, setStep] = useState(1); // 1: identity, 2: OTP, 3: details
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
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [phoneVerificationToken, setPhoneVerificationToken] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef([]);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

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

  const dialCode = findCountry(formData.countryCode).dial;

  // ---------- Step 1 -> Step 2: send the real OTP ----------
  const handleSendOtp = async () => {
    if (!formData.role || !formData.name || !formData.phone) {
      toast.error('Please fill all fields');
      return;
    }
    setSendingOtp(true);
    try {
      const { data } = await api.post('/otp/send-phone-otp', {
        phone: formData.phone,
        dialCode,
      });
      toast.success(data.message || 'OTP sent!');
      setStep(2);
      setResendCooldown(RESEND_COOLDOWN);
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setSendingOtp(true);
    try {
      const { data } = await api.post('/otp/send-phone-otp', {
        phone: formData.phone,
        dialCode,
      });
      toast.success(data.message || 'OTP resent!');
      setResendCooldown(RESEND_COOLDOWN);
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      otpRefs.current[0]?.focus();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not resend OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleOtpDigitChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // digits only
    const next = [...otpDigits];
    next[index] = value;
    setOtpDigits(next);
    if (value && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    setOtpDigits((prev) => {
      const next = [...prev];
      pasted.split('').forEach((d, i) => { next[i] = d; });
      return next;
    });
    otpRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  // ---------- Step 2 -> Step 3: verify the real OTP ----------
  const handleVerifyOtp = async () => {
    const otp = otpDigits.join('');
    if (otp.length !== OTP_LENGTH) {
      toast.error(`Please enter the ${OTP_LENGTH}-digit code`);
      return;
    }
    setVerifyingOtp(true);
    try {
      const { data } = await api.post('/otp/verify-phone-otp', {
        phone: formData.phone,
        dialCode,
        otp,
      });
      setPhoneVerificationToken(data.verificationToken);
      toast.success('Phone number verified! 🎉');
      setStep(3);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Incorrect OTP');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // ---------- Step 3: create the account ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (!phoneVerificationToken) {
      return toast.error('Please verify your phone number first');
    }
    setLoading(true);
    try {
      const payload = {
        ...formData,
        phone: `${dialCode} ${formData.phone}`.trim(),
        phoneCountryCode: dialCode,
        phoneVerificationToken,
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
          <p className="text-gray-500 dark:text-ink-soft-soft">Step {step} of 3</p>
        </div>

        {/* Progress Bar */}
        <div className="flex mb-8 space-x-2">
          <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-green-500' : 'bg-gray-200 dark:bg-surface-alt'}`}></div>
          <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-green-500' : 'bg-gray-200 dark:bg-surface-alt'}`}></div>
          <div className={`flex-1 h-2 rounded-full ${step >= 3 ? 'bg-green-500' : 'bg-gray-200 dark:bg-surface-alt'}`}></div>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Step 1: Role, Name, Phone */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-ink-soft-soft dark:text-ink-soft-soft text-sm font-semibold mb-3">I am a...</label>
                <div className="grid grid-cols-1 gap-3">
                  {roles.map(role => (
                    <label
                      key={role.value}
                      className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition ${formData.role === role.value
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
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
                    className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-surface dark:bg-surface text-ink-soft dark:text-ink-soft dark:border-outline"
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
                    className="w-28 px-2 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-surface dark:bg-surface text-ink-soft dark:text-ink-soft dark:border-outline"
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
                      className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-surface dark:bg-surface text-ink-soft dark:text-ink-soft dark:border-outline"
                      placeholder="98765 43210"
                      required
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-400 dark:text-ink-soft-soft mt-1.5">We'll text a verification code to this number.</p>
              </div>

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={sendingOtp}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition text-lg disabled:opacity-50"
              >
                {sendingOtp ? 'Sending OTP...' : 'Send OTP →'}
              </button>
            </div>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="text-center">
                <FaShieldAlt className="text-4xl text-green-600 mx-auto mb-3" />
                <p className="text-ink-soft dark:text-ink-soft font-semibold">Verify your phone number</p>
                <p className="text-sm text-gray-500 dark:text-ink-soft-soft mt-1">
                  We sent a {OTP_LENGTH}-digit code to <span className="font-semibold">{dialCode} {formData.phone}</span>
                </p>
              </div>

              <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-surface dark:bg-surface text-ink-soft dark:text-ink-soft dark:border-outline"
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={verifyingOtp}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50"
              >
                {verifyingOtp ? 'Verifying...' : 'Verify OTP →'}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-ink-soft-soft dark:text-ink-soft-soft hover:underline"
                >
                  ← Change number
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || sendingOtp}
                  className="flex items-center gap-1.5 text-green-600 font-semibold hover:underline disabled:opacity-50 disabled:no-underline"
                >
                  <FaRedo className="text-xs" /> {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Email, Location, Password */}
          {step === 3 && (
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
                    className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-surface dark:bg-surface text-ink-soft dark:text-ink-soft dark:border-outline"
                    placeholder="you@example.com"
                    required
                  />
                </div>
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
                    className="w-full px-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-surface dark:bg-surface text-ink-soft dark:text-ink-soft dark:border-outline"
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
                      className="w-full px-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-surface dark:bg-surface text-ink-soft dark:text-ink-soft dark:border-outline"
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
                      className="w-full px-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-surface dark:bg-surface text-ink-soft dark:text-ink-soft dark:border-outline"
                      placeholder="State / Province"
                    />
                  )}
                </div>
              </div>

              {formData.countryCode === 'IN' ? (
                <div>
                  <label className="block text-ink-soft-soft dark:text-ink-soft-soft text-sm font-semibold mb-2">District</label>
                  <select
                    name="location.district"
                    value={formData.location.district}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-surface dark:bg-surface text-ink-soft dark:text-ink-soft dark:border-outline"
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
              ) : (
                <div>
                  <label className="block text-ink-soft-soft dark:text-ink-soft-soft text-sm font-semibold mb-2">City / District</label>
                  <input
                    type="text"
                    name="location.district"
                    value={formData.location.district}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-surface dark:bg-surface text-ink-soft dark:text-ink-soft dark:border-outline"
                    placeholder="Your city"
                  />
                </div>
              )}

              <div>
                <label className="block text-ink-soft-soft dark:text-ink-soft-soft text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <FaMapMarkerAlt className="text-green-600" /> Address / Village
                </label>
                <input
                  type="text"
                  name="location.village"
                  value={formData.location.village}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-surface dark:bg-surface text-ink-soft dark:text-ink-soft dark:border-outline"
                  placeholder="House/Street, Village or Area"
                />
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
                    className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-surface dark:bg-surface text-ink-soft dark:text-ink-soft dark:border-outline"
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
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-surface dark:bg-surface text-ink-soft dark:text-ink-soft dark:border-outline"
                  placeholder="Re-enter password"
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
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

        {step === 1 && (
          <>
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
          </>
        )}

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
