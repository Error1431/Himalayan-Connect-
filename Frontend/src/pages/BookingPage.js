import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { payWithRazorpay } from '../utils/razorpay';
import {
  FaCalendarAlt, FaUsers, FaBed, FaRupeeSign,
  FaCheck, FaMountain, FaLeaf, FaStar, FaQuoteLeft, FaMapMarkerAlt, FaLock
} from 'react-icons/fa';

// Environment variable input config fallback handle
const API = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api` : 'http://localhost:5000/api';

const BookingPage = () => {
  // ✅ FIX 1: URL se :id ko nikal kar use code ke hisab se 'homestayId' ka rasta de diya hai
  const { id: homestayId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [homestay, setHomestay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    roomType: '',
    numberOfRooms: 1,
    specialRequests: '',
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressCity: '',
    addressState: '',
    addressPincode: '',
    addExperiences: [],
    farmToTable: false
  });

  const [pricing, setPricing] = useState({
    roomPrice: 0,
    experiencePrice: 0,
    farmToTablePrice: 0,
    tax: 0,
    total: 0,
    nights: 0
  });

  useEffect(() => {
    fetchHomestay();
  }, [homestayId]);

  useEffect(() => {
    calculatePricing();
  }, [bookingData, homestay]);

  const fetchHomestay = async () => {
    try {
      const res = await axios.get(`${API}/homestays/${homestayId}`);
      setHomestay(res.data);
      if (res.data.roomTypes?.length > 0) {
        setBookingData(prev => ({
          ...prev,
          roomType: res.data.roomTypes[0].name
        }));
      }
    } catch (error) {
      toast.error('Failed to load homestay details');
    } finally {
      setLoading(false);
    }
  };

  const calculatePricing = () => {
    if (!homestay || !bookingData.checkIn || !bookingData.checkOut) return;

    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    if (nights <= 0) return;

    const selectedRoom = homestay.roomTypes?.find(r => r.name === bookingData.roomType);
    const roomPrice = (selectedRoom?.pricing?.basePrice || 1500) * nights * bookingData.numberOfRooms;

    let experiencePrice = 0;
    if (bookingData.addExperiences.length > 0 && homestay.experiences) {
      homestay.experiences.forEach(exp => {
        if (bookingData.addExperiences.includes(exp.name) && !exp.included) {
          experiencePrice += exp.price * bookingData.guests;
        }
      });
    }

    const farmToTablePrice = bookingData.farmToTable ? 500 * nights * bookingData.guests : 0;
    const subtotal = roomPrice + experiencePrice + farmToTablePrice;
    const tax = subtotal * 0.12;
    const total = subtotal + tax;

    setPricing({
      roomPrice,
      experiencePrice,
      farmToTablePrice,
      tax: Math.round(tax),
      total: Math.round(total),
      nights
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleExperienceToggle = (expName) => {
    setBookingData(prev => {
      const exists = prev.addExperiences.includes(expName);
      return {
        ...prev,
        addExperiences: exists
          ? prev.addExperiences.filter(e => e !== expName)
          : [...prev.addExperiences, expName]
      };
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // 1. Take real payment first — Razorpay's checkout modal offers UPI
      // (Google Pay / PhonePe), debit/credit cards, netbanking and wallets.
      const address = `${bookingData.addressLine1}, ${bookingData.addressCity}, ${bookingData.addressState} - ${bookingData.addressPincode}`;
      const paymentResult = await payWithRazorpay({
        amount: pricing.total,
        name: bookingData.name,
        email: bookingData.email,
        phone: bookingData.phone,
        description: `Booking: ${homestay?.homestayName}`,
        notes: { homestayId, type: 'homestay_booking' },
      });

      // 2. Payment verified — now create the actual booking record.
      const payload = {
        homestay: homestayId,
        customer: user?._id || user?.id,
        guestDetails: {
          name: bookingData.name,
          email: bookingData.email,
          phone: bookingData.phone,
          numberOfGuests: bookingData.guests,
          specialRequests: bookingData.specialRequests,
          address: {
            line1: bookingData.addressLine1,
            city: bookingData.addressCity,
            state: bookingData.addressState,
            pincode: bookingData.addressPincode
          }
        },
        booking: {
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut,
          roomType: bookingData.roomType,
          numberOfRooms: bookingData.numberOfRooms
        },
        pricing: {
          roomPrice: pricing.roomPrice,
          experiencePrice: pricing.experiencePrice,
          taxAmount: pricing.tax,
          totalAmount: pricing.total
        },
        payment: {
          method: 'online',
          status: 'paid',
          transactionId: paymentResult.razorpay_payment_id,
          paidAmount: pricing.total,
          paidAt: new Date().toISOString()
        }
      };

      const res = await axios.post(`${API}/bookings`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      toast.success('🎉 Payment successful — booking confirmed! Check your email.');

      const confirmId = res.data?.data?.bookingId || res.data?.booking?._id || res.data?.data?._id || res.data?._id;
      navigate(`/booking/confirmation/${confirmId}`);
    } catch (error) {
      if (error.code === 'CANCELLED') {
        toast.info('Payment cancelled — your booking was not placed.');
      } else if (error.response?.data?.code === 'PAYMENTS_NOT_CONFIGURED') {
        toast.error('Online payments are not set up on this server yet. Please contact support.');
      } else {
        toast.error(error.response?.data?.message || error.message || 'Booking failed');
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-600 rounded-2xl p-8 text-white mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <FaMountain /> Book Your Stay
        </h1>
        <p className="text-green-100 mt-2 text-lg">
          {homestay?.homestayName} — {homestay?.location?.village}, {homestay?.location?.district}
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex justify-center mb-8">
        {['Dates & Rooms', 'Experiences', 'Guest Details', 'Review & Pay'].map((label, i) => (
          <div key={i} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
              ${step > i + 1 ? 'bg-green-600 text-white' : step === i + 1 ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-surface-alt text-gray-500 dark:text-ink-soft-soft'}`}>
              {step > i + 1 ? <FaCheck /> : i + 1}
            </div>
            <span className={`ml-2 text-sm hidden md:block ${step === i + 1 ? 'font-bold text-green-700' : 'text-gray-500 dark:text-ink-soft-soft'}`}>
              {label}
            </span>
            {i < 3 && <div className={`w-12 h-1 mx-2 ${step > i + 1 ? 'bg-green-500' : 'bg-gray-200 dark:bg-surface-alt'}`}></div>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left: Forms */}
        <div className="lg:col-span-2">

          {/* Step 1: Dates & Rooms */}
          {step === 1 && (
            <div className="bg-surface dark:bg-surface rounded-xl shadow-lg p-6 space-y-6">
              <h2 className="text-xl font-bold text-ink-soft dark:text-ink-soft flex items-center gap-2">
                <FaCalendarAlt className="text-green-600" /> Select Dates & Room
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-1">Check-in Date</label>
                  <input
                    type="date"
                    name="checkIn"
                    value={bookingData.checkIn}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-outline rounded-lg focus:border-green-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-1">Check-out Date</label>
                  <input
                    type="date"
                    name="checkOut"
                    value={bookingData.checkOut}
                    onChange={handleChange}
                    min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-outline rounded-lg focus:border-green-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-1">
                    <FaUsers className="inline mr-1" /> Guests
                  </label>
                  <select
                    name="guests"
                    value={bookingData.guests}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-outline rounded-lg focus:border-green-500 focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                      <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-1">
                    <FaBed className="inline mr-1" /> Room Type
                  </label>
                  <select
                    name="roomType"
                    value={bookingData.roomType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-outline rounded-lg focus:border-green-500 focus:outline-none"
                  >
                    {homestay?.roomTypes?.map((room, i) => (
                      <option key={i} value={room.name}>
                        {room.name} — ₹{room.pricing?.basePrice}/night
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-1">Rooms</label>
                  <select
                    name="numberOfRooms"
                    value={bookingData.numberOfRooms}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-outline rounded-lg focus:border-green-500 focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5].map(n => (
                      <option key={n} value={n}>{n} Room{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!bookingData.checkIn || !bookingData.checkOut) {
                    toast.error('Please select check-in and check-out dates');
                    return;
                  }
                  setStep(2);
                }}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-green-700 transition"
              >
                Continue to Experiences →
              </button>
            </div>
          )}

          {/* Step 2: Experiences */}
          {step === 2 && (
            <div className="bg-surface dark:bg-surface rounded-xl shadow-lg p-6 space-y-6">
              <h2 className="text-xl font-bold text-ink-soft dark:text-ink-soft flex items-center gap-2">
                <FaMountain className="text-green-600" /> Add Experiences
              </h2>

              <div className={`p-4 border-2 rounded-xl cursor-pointer transition ${bookingData.farmToTable ? 'border-green-500 bg-green-50' : 'border-gray-200 dark:border-outline hover:border-green-300'}`}
                onClick={() => setBookingData(prev => ({ ...prev, farmToTable: !prev.farmToTable }))}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <FaLeaf className="text-green-600 text-xl" />
                    </div>
                    <div>
                      <h3 className="font-bold text-ink-soft dark:text-ink-soft">🌿 Farm-to-Table Organic Meals</h3>
                      <p className="text-sm text-ink-soft-soft dark:text-ink-soft-soft">Fresh organic produce from Mandakini Collective farms. Traditional Garhwali recipes cooked by local hosts.</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">₹500</p>
                    <p className="text-xs text-gray-500 dark:text-ink-soft-soft">per person/night</p>
                  </div>
                </div>
              </div>

              <h3 className="font-semibold text-ink-soft-soft dark:text-ink-soft-soft mt-4">Cultural & Adventure Activities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(homestay?.experiences || [
                  { name: 'Village Heritage Walk', description: 'Guided walk through ancient temples', duration: '3 hours', price: 300, included: false },
                  { name: 'Organic Farm Visit', description: 'Visit partner farms, learn traditional farming', duration: '4 hours', price: 400, included: false },
                  { name: 'Traditional Cooking Class', description: 'Learn Garhwali recipes with hosts', duration: '2 hours', price: 350, included: false },
                  { name: 'Sunrise Trek to Tungnath', description: 'Guided trek to highest Shiva temple', duration: '6 hours', price: 600, included: false },
                  { name: 'Stargazing Night', description: 'Night sky observation at 8000ft', duration: '2 hours', price: 0, included: true },
                  { name: 'Local Music Evening', description: 'Folk songs by village musicians', duration: '1.5 hours', price: 0, included: true }
                ]).map((exp, i) => (
                  <div
                    key={i}
                    onClick={() => !exp.included && handleExperienceToggle(exp.name)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition ${exp.included ? 'border-blue-300 bg-blue-50' : bookingData.addExperiences.includes(exp.name) ? 'border-green-500 bg-green-50' : 'border-gray-200 dark:border-outline hover:border-green-300'}`}
                  >
                    <h4 className="font-bold text-ink-soft dark:text-ink-soft">{exp.name}</h4>
                    <p className="text-sm text-ink-soft-soft dark:text-ink-soft-soft mt-1">{exp.description}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500 dark:text-ink-soft-soft">⏱ {exp.duration}</span>
                      {exp.included ? (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">✓ Included Free</span>
                      ) : (
                        <span className="text-green-600 font-bold">₹{exp.price}/person</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="flex-1 border-2 border-gray-300 dark:border-outline text-ink-soft-soft dark:text-ink-soft-soft py-3 rounded-lg font-semibold hover:bg-surface-alt transition">← Back</button>
                <button onClick={() => setStep(3)} className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition">Continue →</button>
              </div>
            </div>
          )}

          {/* Step 3: Guest Details */}
          {step === 3 && (
            <div className="bg-surface dark:bg-surface rounded-xl shadow-lg p-6 space-y-6">
              <h2 className="text-xl font-bold text-ink-soft dark:text-ink-soft flex items-center gap-2">
                <FaUsers className="text-green-600" /> Guest Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={bookingData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-outline rounded-lg focus:border-green-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={bookingData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-outline rounded-lg focus:border-green-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-1">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={bookingData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-outline rounded-lg focus:border-green-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <h3 className="font-semibold text-ink-soft-soft dark:text-ink-soft-soft mt-2 flex items-center gap-2">
                <FaMapMarkerAlt className="text-green-600" /> Your Address
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-1">Address Line *</label>
                  <input
                    type="text"
                    name="addressLine1"
                    value={bookingData.addressLine1}
                    onChange={handleChange}
                    placeholder="House no., street, area"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-outline rounded-lg focus:border-green-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-1">City *</label>
                  <input
                    type="text"
                    name="addressCity"
                    value={bookingData.addressCity}
                    onChange={handleChange}
                    placeholder="City"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-outline rounded-lg focus:border-green-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-1">State *</label>
                  <input
                    type="text"
                    name="addressState"
                    value={bookingData.addressState}
                    onChange={handleChange}
                    placeholder="State"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-outline rounded-lg focus:border-green-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-1">Pincode *</label>
                  <input
                    type="text"
                    name="addressPincode"
                    value={bookingData.addressPincode}
                    onChange={handleChange}
                    placeholder="Pincode"
                    maxLength={6}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-outline rounded-lg focus:border-green-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-1">Special Requests</label>
                <textarea
                  name="specialRequests"
                  value={bookingData.specialRequests}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Any dietary requirements, accessibility needs, celebration plans..."
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-outline rounded-lg focus:border-green-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(2)} className="flex-1 border-2 border-gray-300 dark:border-outline text-ink-soft-soft dark:text-ink-soft-soft py-3 rounded-lg font-semibold hover:bg-surface-alt transition">← Back</button>
                <button onClick={() => {
                  if (!bookingData.name || !bookingData.email || !bookingData.phone) {
                    toast.error('Please fill in all required fields');
                    return;
                  }
                  if (!bookingData.addressLine1 || !bookingData.addressCity || !bookingData.addressState || !bookingData.addressPincode) {
                    toast.error('Please fill in your complete address');
                    return;
                  }
                  setStep(4);
                }} className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition">Review Booking →</button>
              </div>
            </div>
          )}

          {/* Step 4: Review & Pay */}
          {step === 4 && (
            <div className="bg-surface dark:bg-surface rounded-xl shadow-lg p-6 space-y-6">
              <h2 className="text-xl font-bold text-ink-soft dark:text-ink-soft flex items-center gap-2">
                <FaCheck className="text-green-600" /> Review Your Booking
              </h2>

              <div className="bg-green-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-ink-soft-soft dark:text-ink-soft-soft">🏠 Homestay</span>
                  <span className="font-semibold">{homestay?.homestayName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-soft-soft dark:text-ink-soft-soft">📅 Check-in</span>
                  <span className="font-semibold">{new Date(bookingData.checkIn).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-soft-soft dark:text-ink-soft-soft">📅 Check-out</span>
                  <span className="font-semibold">{new Date(bookingData.checkOut).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-soft-soft dark:text-ink-soft-soft">🌙 Nights</span>
                  <span className="font-semibold">{pricing.nights}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-soft-soft dark:text-ink-soft-soft">👥 Guests</span>
                  <span className="font-semibold">{bookingData.guests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-soft-soft dark:text-ink-soft-soft">🛏️ Room</span>
                  <span className="font-semibold">{bookingData.roomType} × {bookingData.numberOfRooms}</span>
                </div>
                {bookingData.farmToTable && (
                  <div className="flex justify-between">
                    <span className="text-ink-soft-soft dark:text-ink-soft-soft">🌿 Farm-to-Table Meals</span>
                    <span className="font-semibold text-green-600">Added</span>
                  </div>
                )}
                {bookingData.addExperiences.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-ink-soft-soft dark:text-ink-soft-soft">🎯 Experiences</span>
                    <span className="font-semibold">{bookingData.addExperiences.join(', ')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-ink-soft-soft dark:text-ink-soft-soft">👤 Guest</span>
                  <span className="font-semibold">{bookingData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-soft-soft dark:text-ink-soft-soft">📍 Address</span>
                  <span className="font-semibold text-right max-w-[60%]">{bookingData.addressLine1}, {bookingData.addressCity}, {bookingData.addressState} - {bookingData.addressPincode}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(3)} className="flex-1 border-2 border-gray-300 dark:border-outline text-ink-soft-soft dark:text-ink-soft-soft py-3 rounded-lg font-semibold hover:bg-surface-alt transition">← Back</button>
                <button onClick={handleSubmit} disabled={submitting} className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
                  <FaLock className="text-sm" /> {submitting ? 'Processing...' : `Pay ₹${pricing.total} Securely`}
                </button>
              </div>

              <p className="text-xs text-center text-gray-500 dark:text-ink-soft-soft">🔒 Secure payment via UPI, Debit/Credit Card, Netbanking or Wallet. Direct booking = Zero commission = Better prices for you & the community 🤝</p>
            </div>
          )}
        </div>

        {/* Right: Price Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-surface dark:bg-surface rounded-xl shadow-lg p-6 sticky top-24">
            <h3 className="font-bold text-lg text-ink-soft dark:text-ink-soft mb-4">
              <FaRupeeSign className="inline text-green-600" /> Price Summary
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-soft-soft dark:text-ink-soft-soft">Room ({pricing.nights} nights)</span>
                <span className="font-semibold">₹{pricing.roomPrice.toLocaleString()}</span>
              </div>

              {pricing.experiencePrice > 0 && (
                <div className="flex justify-between">
                  <span className="text-ink-soft-soft dark:text-ink-soft-soft">Experiences</span>
                  <span className="font-semibold">₹{pricing.experiencePrice.toLocaleString()}</span>
                </div>
              )}

              {pricing.farmToTablePrice > 0 && (
                <div className="flex justify-between">
                  <span className="text-ink-soft-soft dark:text-ink-soft-soft">🌿 Farm-to-Table Meals</span>
                  <span className="font-semibold text-green-600">₹{pricing.farmToTablePrice.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-ink-soft-soft dark:text-ink-soft-soft">GST (12%)</span>
                <span className="font-semibold">₹{pricing.tax.toLocaleString()}</span>
              </div>

              <hr />

              <div className="flex justify-between text-lg">
                <span className="font-bold text-ink-soft dark:text-ink-soft">Total</span>
                <span className="font-bold text-green-600">₹{pricing.total.toLocaleString()}</span>
              </div>

              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">💡 <strong>You save ₹{Math.round(pricing.total * 0.2)}</strong> by booking directly! OTAs charge 18-25% commission.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BookingPage;