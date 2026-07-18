import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  FaHome, FaCalendarCheck, FaRupeeSign, FaStar,
  FaUsers, FaChartLine, FaBed, FaCommentDots
} from 'react-icons/fa';

const HomestayDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { icon: FaCalendarCheck, label: 'Bookings (Month)', value: '24', color: 'bg-blue-500', change: '+15%' },
    { icon: FaRupeeSign, label: 'Revenue (Month)', value: '₹1,82,400', color: 'bg-green-500', change: '+22%' },
    { icon: FaBed, label: 'Occupancy Rate', value: '78%', color: 'bg-purple-500', change: '+5%' },
    { icon: FaStar, label: 'Avg Rating', value: '4.8', color: 'bg-yellow-500', change: '+0.2' }
  ];

  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Revenue (₹)',
      data: [85000, 92000, 78000, 125000, 148000, 182400],
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const occupancyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Occupancy %',
      data: [45, 52, 38, 72, 85, 78],
      backgroundColor: 'rgba(59, 130, 246, 0.7)'
    }]
  };

  const bookingSourceData = {
    labels: ['Direct Website', 'WhatsApp', 'Google', 'Referral', 'Repeat'],
    datasets: [{
      data: [40, 25, 15, 12, 8],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(37, 211, 102, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(249, 115, 22, 0.8)'
      ]
    }]
  };

  // Recent bookings
  const recentBookings = [
    { id: 'BK20251001', guest: 'Arun Sharma', checkIn: '2025-07-20', checkOut: '2025-07-23', rooms: 2, amount: 15000, status: 'confirmed' },
    { id: 'BK20251002', guest: 'Meera Patel', checkIn: '2025-07-22', checkOut: '2025-07-25', rooms: 1, amount: 7500, status: 'pending' },
    { id: 'BK20251003', guest: 'Vikram Singh', checkIn: '2025-07-25', checkOut: '2025-07-28', rooms: 3, amount: 22500, status: 'confirmed' },
    { id: 'BK20251004', guest: 'Divya Nair', checkIn: '2025-07-28', checkOut: '2025-07-30', rooms: 1, amount: 5000, status: 'cancelled' }
  ];

  // Sentiment summary
  const sentimentData = {
    positive: 78,
    neutral: 15,
    negative: 7,
    topStrengths: ['Hospitality', 'Food Quality', 'Mountain Views'],
    topWeaknesses: ['WiFi Speed', 'Road Access', 'Hot Water']
  };

  // Offseason packages
  const offseasonPackages = [
    { name: 'Monsoon Wellness Retreat', duration: '3N/4D', price: 8999, target: 'Yoga & Wellness seekers', status: 'Active' },
    { name: 'Writer\'s Mountain Escape', duration: '5N/6D', price: 12999, target: 'Writers & Artists', status: 'Active' },
    { name: 'Remote Work Mountain Office', duration: '7N/8D', price: 18999, target: 'Corporate Professionals', status: 'Draft' }
  ];

  return (
    <div className="min-h-screen bg-surface-alt dark:bg-app-bg py-8">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-ink-soft dark:text-ink-soft">🏡 Homestay Dashboard</h1>
            <p className="text-gray-500 dark:text-ink-soft-soft mt-1">
              Trishul Eco-Homestay · Chopta, Rudraprayag
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Zero Commission</span>
            </p>
          </div>
          <button
            onClick={() => navigate(`/profile/${user?._id || user?.id}`)}
            className="mt-4 md:mt-0 flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl hover:bg-emerald-100 transition font-medium border border-emerald-200"
          >
            <FaHome /> <span>My Homestay Profile</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-surface dark:bg-surface rounded-xl shadow-sm dark:shadow-none p-6 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-3">
                <div className={`${stat.color} p-3 rounded-xl text-white`}>
                  <stat.icon className="text-xl" />
                </div>
                <span className="text-green-600 text-sm font-semibold">{stat.change}</span>
              </div>
              <p className="text-2xl font-bold text-ink-soft dark:text-ink-soft">{stat.value}</p>
              <p className="text-gray-500 dark:text-ink-soft-soft text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-surface dark:bg-surface rounded-xl shadow-sm dark:shadow-none p-6">
            <h3 className="text-lg font-bold text-ink-soft dark:text-ink-soft mb-4">💰 Revenue Trend (₹)</h3>
            <Line data={revenueData} options={{ responsive: true }} />
          </div>
          <div className="bg-surface dark:bg-surface rounded-xl shadow-sm dark:shadow-none p-6">
            <h3 className="text-lg font-bold text-ink-soft dark:text-ink-soft mb-4">📊 Booking Sources</h3>
            <Doughnut data={bookingSourceData} options={{ responsive: true }} />
            <p className="text-center text-sm text-green-600 font-semibold mt-4">
              40% Direct = ₹72,960 saved from OTA commissions!
            </p>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-surface dark:bg-surface rounded-xl shadow-sm dark:shadow-none p-6 mb-8">
          <h3 className="text-lg font-bold text-ink-soft dark:text-ink-soft mb-4">📋 Recent Bookings</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-alt dark:bg-app-bg">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft">Booking ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft">Guest</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft">Check-in</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft">Check-out</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft">Rooms</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentBookings.map((booking, i) => (
                  <tr key={i} className="hover:bg-surface-alt">
                    <td className="px-4 py-3 font-mono text-sm text-blue-600">{booking.id}</td>
                    <td className="px-4 py-3 font-medium">{booking.guest}</td>
                    <td className="px-4 py-3">{booking.checkIn}</td>
                    <td className="px-4 py-3">{booking.checkOut}</td>
                    <td className="px-4 py-3">{booking.rooms}</td>
                    <td className="px-4 py-3 font-semibold">₹{booking.amount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sentiment Analysis + Offseason Packages */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* AI Sentiment Summary */}
          <div className="bg-surface dark:bg-surface rounded-xl shadow-sm dark:shadow-none p-6">
            <h3 className="text-lg font-bold text-ink-soft dark:text-ink-soft mb-4">🤖 AI Review Sentiment Analysis</h3>
            <div className="flex space-x-4 mb-6">
              <div className="flex-1 text-center p-4 bg-green-50 rounded-xl">
                <p className="text-3xl font-bold text-green-600">{sentimentData.positive}%</p>
                <p className="text-sm text-green-700">Positive</p>
              </div>
              <div className="flex-1 text-center p-4 bg-surface-alt dark:bg-app-bg rounded-xl">
                <p className="text-3xl font-bold text-ink-soft-soft dark:text-ink-soft-soft">{sentimentData.neutral}%</p>
                <p className="text-sm text-ink-soft-soft dark:text-ink-soft-soft">Neutral</p>
              </div>
              <div className="flex-1 text-center p-4 bg-red-50 rounded-xl">
                <p className="text-3xl font-bold text-red-600">{sentimentData.negative}%</p>
                <p className="text-sm text-red-700">Negative</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-green-700 mb-1">✅ Top Strengths</h4>
                <div className="flex flex-wrap gap-2">
                  {sentimentData.topStrengths.map((s, i) => (
                    <span key={i} className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-red-700 mb-1">⚠️ Areas to Improve</h4>
                <div className="flex flex-wrap gap-2">
                  {sentimentData.topWeaknesses.map((w, i) => (
                    <span key={i} className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full">{w}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Offseason Packages */}
          <div className="bg-surface dark:bg-surface rounded-xl shadow-sm dark:shadow-none p-6">
            <h3 className="text-lg font-bold text-ink-soft dark:text-ink-soft mb-4">🌧️ Monsoon/Offseason Packages</h3>
            <div className="space-y-4">
              {offseasonPackages.map((pkg, i) => (
                <div key={i} className="border rounded-xl p-4 hover:border-green-500 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-ink-soft dark:text-ink-soft">{pkg.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-ink-soft-soft">{pkg.duration} · Target: {pkg.target}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">₹{pkg.price.toLocaleString()}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${pkg.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-surface-alt dark:bg-surface-alt text-ink-soft-soft dark:text-ink-soft-soft'
                        }`}>
                        {pkg.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomestayDashboard;