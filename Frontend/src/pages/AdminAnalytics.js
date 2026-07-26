import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  FaEye, FaUsers, FaChartLine, FaGlobe, FaUserPlus,
  FaLeaf, FaHome, FaShoppingBag
} from 'react-icons/fa';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const StatCard = ({ icon: Icon, label, value, sub, color, darkMode }) => (
  <div className={`rounded-xl p-5 border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
    <div className="flex items-center justify-between mb-2">
      <span className={`text-xs font-semibold uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{label}</span>
      <Icon className={color} />
    </div>
    <p className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-ink-soft'}`}>{value}</p>
    {sub && <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{sub}</p>}
  </div>
);

const AdminAnalytics = () => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/analytics/summary')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <p className="text-ink-soft-soft dark:text-ink-soft-soft">This dashboard is only available to admin accounts.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center text-red-500">{error || 'No data available'}</div>
    );
  }

  const { traffic, users } = data;

  const chartData = {
    labels: traffic.dailySeries.map((d) => d.date.slice(5)), // MM-DD
    datasets: [
      {
        label: 'Page Views',
        data: traffic.dailySeries.map((d) => d.views),
        borderColor: '#16a34a',
        backgroundColor: 'rgba(22,163,74,0.1)',
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Unique Visitors',
        data: traffic.dailySeries.map((d) => d.uniqueVisitors),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className={`text-2xl font-black mb-1 ${darkMode ? 'text-white' : 'text-ink-soft'}`}>📊 Site Analytics</h1>
      <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Traffic and registration overview — admin only</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FaEye} label="Views (24h)" value={traffic.views24h} color="text-blue-500" darkMode={darkMode} />
        <StatCard icon={FaChartLine} label="Views (7 days)" value={traffic.views7d} color="text-green-500" darkMode={darkMode} />
        <StatCard icon={FaGlobe} label="Unique Visitors (30d)" value={traffic.uniqueVisitors30d} color="text-purple-500" darkMode={darkMode} />
        <StatCard icon={FaEye} label="Total Views (all time)" value={traffic.totalViews} color="text-gray-500" darkMode={darkMode} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FaUsers} label="Registered Users" value={users.total} color="text-emerald-500" darkMode={darkMode} />
        <StatCard icon={FaUserPlus} label="New (7 days)" value={users.newLast7Days} color="text-amber-500" darkMode={darkMode} />
        <StatCard icon={FaLeaf} label="Farmers" value={users.byRole?.farmer || 0} color="text-green-600" darkMode={darkMode} />
        <StatCard icon={FaHome} label="Homestay Owners" value={users.byRole?.homestay_owner || 0} color="text-blue-600" darkMode={darkMode} />
      </div>

      <div className={`rounded-xl p-5 border shadow-sm mb-8 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        <h2 className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-ink-soft'}`}>Traffic — last 30 days</h2>
        {traffic.dailySeries.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No traffic data yet — check back after the site gets some visits.</p>
        ) : (
          <Line data={chartData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
        )}
      </div>

      <div className={`rounded-xl p-5 border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        <h2 className={`font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-ink-soft'}`}>
          <FaShoppingBag className="text-green-600" /> Top Pages (last 30 days)
        </h2>
        {traffic.topPages.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No page view data yet.</p>
        ) : (
          <div className="space-y-2">
            {traffic.topPages.map((p, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className={darkMode ? 'text-gray-300' : 'text-ink-soft-soft'}>{p.path}</span>
                <span className="font-bold text-green-600">{p.views} views</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
