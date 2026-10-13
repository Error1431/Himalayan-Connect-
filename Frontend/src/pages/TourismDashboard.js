import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { useToast } from '../components/ToastContainer';
import {
  FaPlus, FaTrash, FaEdit, FaMountain, FaHiking, FaSeedling,
  FaHeart, FaMapMarkedAlt, FaStar, FaTimes
} from 'react-icons/fa';

const CATEGORY_OPTIONS = [
  { value: 'wedding', label: 'Wedding (Uttarakhand / village / India)' },
  { value: 'farm_visit', label: 'Live Farm Visit & Tasting' },
  { value: 'farm_work', label: 'Grow With the Farmer' },
  { value: 'trek', label: 'Trek (certified guide)' },
  { value: 'hiking', label: 'Hiking' },
  { value: 'village_tour', label: 'Village Exploration' },
];

const HIGHLIGHT_OPTIONS = [
  { value: 'viewpoint', label: '🏔️ Himalayan viewpoint (sunrise/sunset)' },
  { value: 'farming', label: '🌾 Village farming (fields, irrigation, cattle sheds, tools)' },
  { value: 'local_food', label: '🫓 Cook/eat local food together (Mandua roti, Jhangore kheer, Chainsoo...)' },
  { value: 'traditional_house', label: '🏡 Traditional stone/wood village house' },
  { value: 'wild_trail', label: '🌲 Forest trail, stream, waterfall or meadow' },
  { value: 'village_evening', label: '🔥 Village evening — tea, snacks, meeting neighbours' },
  { value: 'local_culture', label: '🎵 Local folk music, dance or instruments' },
  { value: 'night_sky', label: '🌌 Stargazing under a dark Himalayan sky' },
];

const EMPTY_FORM = {
  title: '', category: 'trek', culture: 'garhwali', village: '', district: '',
  description: '', duration: '', difficulty: 'easy', price: '', priceUnit: 'per person',
  minGroup: 1, maxGroup: 10, guideName: '', guideCertified: false, certificationBody: '', guideYears: '',
  includes: '', theme: '', fromLocation: '', toLocation: '', cropsGrown: '', howToReach: '', highlights: []
};

const TourismDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchMine = async () => {
    setLoading(true);
    try {
      const res = await api.get('/experiences/mine');
      setExperiences(res.data || []);
    } catch (e) {
      setExperiences([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMine(); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const toggleHighlight = (value) => {
    setForm((f) => ({
      ...f,
      highlights: f.highlights.includes(value)
        ? f.highlights.filter((h) => h !== value)
        : [...f.highlights, value]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.price) {
      addToast('Title and price are required', 'error');
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      await api.post('/experiences', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      addToast('Experience listed!', 'success');
      setShowForm(false);
      setForm(EMPTY_FORM);
      fetchMine();
    } catch (err) {
      addToast(err?.response?.data?.message || 'Could not create listing', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await api.delete(`/experiences/${id}`);
      setExperiences((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      addToast('Could not delete listing', 'error');
    }
  };

  const stats = [
    { label: 'Listings', value: experiences.length, icon: <FaMountain /> },
    { label: 'Total Reviews', value: experiences.reduce((s, e) => s + (e.reviews || 0), 0), icon: <FaStar /> },
    { label: 'Avg. Rating', value: (experiences.reduce((s, e) => s + (e.rating || 0), 0) / (experiences.length || 1)).toFixed(1), icon: <FaHeart /> },
  ];

  return (
    <div className="max-w-6xl mx-auto pt-24 px-4 pb-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-ink-soft dark:text-ink-soft">Tourism &amp; Culture Dashboard</h1>
          <p className="text-gray-500 dark:text-ink-soft-soft">Welcome back, {user?.name}. Manage your weddings, farm visits, treks, hikes and village tours.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          <FaPlus /> New Experience
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white dark:bg-surface-soft rounded-2xl p-5 border border-gray-100 dark:border-white/10 flex items-center gap-4">
            <div className="text-2xl text-green-600">{s.icon}</div>
            <div>
              <p className="text-xl font-bold text-ink-soft dark:text-ink-soft">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading your listings…</p>
      ) : experiences.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl">
          <FaHiking className="text-4xl text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">You haven't listed any experiences yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map((exp) => (
            <div key={exp._id} className="bg-white dark:bg-surface-soft rounded-2xl p-5 border border-gray-100 dark:border-white/10">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-ink-soft dark:text-ink-soft">{exp.title}</h3>
                  <p className="text-xs text-gray-500 capitalize">{exp.category?.replace('_', ' ')}</p>
                </div>
                <button onClick={() => handleDelete(exp._id)} className="text-red-500 hover:text-red-600" aria-label="Delete">
                  <FaTrash />
                </button>
              </div>
              <p className="mt-3 text-sm text-gray-500 flex items-center gap-1">
                <FaMapMarkedAlt className="text-green-600" /> {exp.village}{exp.district ? `, ${exp.district}` : ''}
              </p>
              <p className="mt-2 font-semibold text-ink-soft dark:text-ink-soft">₹{exp.price?.toLocaleString?.() ?? exp.price}</p>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-surface-soft rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">New Tourism Experience</h2>
              <button onClick={() => setShowForm(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <input name="title" value={form.title} onChange={handleChange} required
                  className="w-full mt-1 p-2 border rounded-lg dark:bg-surface dark:border-white/10" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <select name="category" value={form.category} onChange={handleChange}
                    className="w-full mt-1 p-2 border rounded-lg dark:bg-surface dark:border-white/10">
                    {CATEGORY_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Culture</label>
                  <select name="culture" value={form.culture} onChange={handleChange}
                    className="w-full mt-1 p-2 border rounded-lg dark:bg-surface dark:border-white/10">
                    <option value="garhwali">Garhwali</option>
                    <option value="kumaoni">Kumaoni</option>
                    <option value="jaunsari">Jaunsari</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Village</label>
                  <input name="village" value={form.village} onChange={handleChange}
                    className="w-full mt-1 p-2 border rounded-lg dark:bg-surface dark:border-white/10" />
                </div>
                <div>
                  <label className="text-sm font-medium">District</label>
                  <input name="district" value={form.district} onChange={handleChange}
                    className="w-full mt-1 p-2 border rounded-lg dark:bg-surface dark:border-white/10" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                  className="w-full mt-1 p-2 border rounded-lg dark:bg-surface dark:border-white/10" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Duration</label>
                  <input name="duration" value={form.duration} onChange={handleChange} placeholder="e.g. 2 days"
                    className="w-full mt-1 p-2 border rounded-lg dark:bg-surface dark:border-white/10" />
                </div>
                <div>
                  <label className="text-sm font-medium">Price (₹)</label>
                  <input name="price" type="number" value={form.price} onChange={handleChange} required
                    className="w-full mt-1 p-2 border rounded-lg dark:bg-surface dark:border-white/10" />
                </div>
                <div>
                  <label className="text-sm font-medium">Difficulty</label>
                  <select name="difficulty" value={form.difficulty} onChange={handleChange}
                    className="w-full mt-1 p-2 border rounded-lg dark:bg-surface dark:border-white/10">
                    <option value="easy">Easy</option>
                    <option value="moderate">Moderate</option>
                    <option value="challenging">Challenging</option>
                  </select>
                </div>
              </div>
              {(form.category === 'trek' || form.category === 'hiking') && (
                <div className="grid grid-cols-2 gap-4 border-t pt-4 dark:border-white/10">
                  <div>
                    <label className="text-sm font-medium">Starting Point (From)</label>
                    <input name="fromLocation" value={form.fromLocation} onChange={handleChange} placeholder="e.g. Sankri"
                      className="w-full mt-1 p-2 border rounded-lg dark:bg-surface dark:border-white/10" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Destination (To)</label>
                    <input name="toLocation" value={form.toLocation} onChange={handleChange} placeholder="e.g. Kedarkantha Summit"
                      className="w-full mt-1 p-2 border rounded-lg dark:bg-surface dark:border-white/10" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Guide Name</label>
                    <input name="guideName" value={form.guideName} onChange={handleChange}
                      className="w-full mt-1 p-2 border rounded-lg dark:bg-surface dark:border-white/10" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Certification Body</label>
                    <input name="certificationBody" value={form.certificationBody} onChange={handleChange} placeholder="e.g. Uttarakhand Tourism"
                      className="w-full mt-1 p-2 border rounded-lg dark:bg-surface dark:border-white/10" />
                  </div>
                  <label className="flex items-center gap-2 col-span-2 text-sm">
                    <input type="checkbox" name="guideCertified" checked={form.guideCertified} onChange={handleChange} />
                    Guide is certified
                  </label>
                </div>
              )}
              {form.category === 'wedding' && (
                <div>
                  <label className="text-sm font-medium">Wedding Theme</label>
                  <input name="theme" value={form.theme} onChange={handleChange} placeholder="e.g. Traditional Garhwali, Kumaoni Folk, Destination Village Wedding"
                    className="w-full mt-1 p-2 border rounded-lg dark:bg-surface dark:border-white/10" />
                </div>
              )}
              {(form.category === 'farm_visit' || form.category === 'farm_work') && (
                <div className="grid grid-cols-1 gap-4 border-t pt-4 dark:border-white/10">
                  <div>
                    <label className="text-sm font-medium">What's growing right now (comma-separated)</label>
                    <input name="cropsGrown" value={form.cropsGrown} onChange={handleChange} placeholder="e.g. Rajma, Mandua, Hill Vegetables"
                      className="w-full mt-1 p-2 border rounded-lg dark:bg-surface dark:border-white/10" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">How to reach the farm</label>
                    <textarea name="howToReach" value={form.howToReach} onChange={handleChange} rows={2}
                      placeholder="e.g. 20 min walk from Sari village bus stand, or nearest road-head + landmark"
                      className="w-full mt-1 p-2 border rounded-lg dark:bg-surface dark:border-white/10" />
                  </div>
                </div>
              )}
              {form.category === 'village_tour' && (
                <div>
                  <label className="text-sm font-medium">How to reach the village</label>
                  <textarea name="howToReach" value={form.howToReach} onChange={handleChange} rows={2}
                    placeholder="e.g. Nearest bus stand / road-head and directions from there"
                    className="w-full mt-1 p-2 border rounded-lg dark:bg-surface dark:border-white/10" />
                </div>
              )}
              <div>
                <label className="text-sm font-medium">What's included (comma-separated)</label>
                <input name="includes" value={form.includes} onChange={handleChange} placeholder="Meals, Transport, Homestay"
                  className="w-full mt-1 p-2 border rounded-lg dark:bg-surface dark:border-white/10" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Experience Highlights</label>
                <div className="grid grid-cols-1 gap-2">
                  {HIGHLIGHT_OPTIONS.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.highlights.includes(opt.value)}
                        onChange={() => toggleHighlight(opt.value)}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={saving}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-medium disabled:opacity-50">
                {saving ? 'Saving…' : 'Publish Experience'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TourismDashboard;
