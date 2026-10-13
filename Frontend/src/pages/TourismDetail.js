import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaUserCheck, FaCommentDots, FaRoute, FaShoppingCart } from 'react-icons/fa';
import api from '../utils/api';
import { Loader } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastContainer';
import { useCart } from '../context/CartContext';

const HIGHLIGHT_LABELS = {
  viewpoint: '🏔️ A proper Himalayan viewpoint — sunrise or sunset, and time to just take in the quiet',
  farming: '🌾 Village farming — terraced fields, irrigation, cattle sheds, traditional tools',
  local_food: '🫓 Local food, cooked with you — Mandua roti, Jhangore ki kheer, Chainsoo, fresh butter/curd',
  traditional_house: '🏡 A traditional stone/wood village house and how people lived',
  wild_trail: '🌲 A genuinely wild spot — forest trail, stream, waterfall or meadow',
  village_evening: '🔥 A village evening — tea, snacks, meeting the neighbours',
  local_culture: '🎵 Local folk music, dance or instruments — kept authentic, not staged',
  night_sky: '🌌 Stargazing under a dark, light-pollution-free Himalayan sky',
};

const TourismDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const { addToCart } = useCart();
  const [experience, setExperience] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [booking, setBooking] = useState({ date: '', guests: 1, fromLocation: '', toLocation: '', notes: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.get(`/experiences/${id}`)
      .then((res) => { if (!cancelled) setExperience(res.data); })
      .catch(() => { if (!cancelled) setExperience(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBooking((b) => ({ ...b, [name]: value }));
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      addToast('Please log in to request a booking', 'error');
      return;
    }
    if (!booking.date) {
      addToast('Please select a date', 'error');
      return;
    }
    setSending(true);
    try {
      await api.post(`/experiences/${id}/inquire`, booking);
      addToast('Booking request sent to the host!', 'success');
      setShowBooking(false);
      setBooking({ date: '', guests: 1, fromLocation: '', toLocation: '', notes: '' });
    } catch (err) {
      addToast(err?.response?.data?.message || 'Could not send booking request', 'error');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <Loader />;
  if (!experience) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-500">This experience couldn't be found.</p>
        <Link to="/tourism" className="text-green-600 font-medium">← Back to Tourism &amp; Culture</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <img
        src={experience.images?.[0] || experience.image}
        alt={experience.title}
        className="w-full h-72 object-cover rounded-2xl mb-6"
      />
      <h1 className="text-3xl font-bold text-ink-soft dark:text-ink-soft">{experience.title}</h1>
      <p className="text-gray-500 dark:text-ink-soft-soft flex items-center gap-1 mt-2">
        <FaMapMarkerAlt className="text-green-600" /> {experience.village}{experience.district ? `, ${experience.district}` : ''}
      </p>
      <div className="flex items-center gap-4 mt-3">
        <span className="flex items-center gap-1 text-amber-500">
          <FaStar /> {experience.rating || '—'} <span className="text-gray-400">({experience.reviews || 0} reviews)</span>
        </span>
        {experience.guide?.certified && (
          <span className="flex items-center gap-1 text-sm text-green-700 dark:text-green-400">
            <FaUserCheck /> Certified guide{experience.guide?.certificationBody ? ` — ${experience.guide.certificationBody}` : ''}
          </span>
        )}
      </div>

      <p className="mt-6 text-ink-soft dark:text-ink-soft-soft leading-relaxed">
        {experience.description?.detailed || experience.description?.short || 'No description provided yet.'}
      </p>

      {experience.theme && (
        <p className="mt-2 text-sm text-gray-500 dark:text-ink-soft-soft">🎭 Theme: <span className="font-medium text-ink-soft dark:text-ink-soft">{experience.theme}</span></p>
      )}
      {(experience.route?.from || experience.route?.to) && (
        <p className="mt-2 text-sm text-gray-500 dark:text-ink-soft-soft flex items-center gap-2">
          <FaRoute className="text-green-600" /> {experience.route?.from || '—'} → {experience.route?.to || '—'}
        </p>
      )}
      {experience.cropsGrown?.length > 0 && (
        <p className="mt-2 text-sm text-gray-500 dark:text-ink-soft-soft">
          🌾 Currently growing: <span className="font-medium text-ink-soft dark:text-ink-soft">{experience.cropsGrown.join(', ')}</span>
        </p>
      )}
      {experience.howToReach && (
        <div className="mt-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl p-4">
          <p className="text-sm font-semibold text-ink-soft dark:text-ink-soft mb-1">📍 How to reach</p>
          <p className="text-sm text-gray-600 dark:text-ink-soft-soft">{experience.howToReach}</p>
        </div>
      )}

      {experience.highlights?.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-3">What to Expect</h3>
          <ul className="space-y-2">
            {experience.highlights.map((h) => (
              <li key={h} className="text-sm text-gray-600 dark:text-ink-soft-soft flex gap-2">
                <span>{HIGHLIGHT_LABELS[h] || h}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {experience.includes?.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">What's included</h3>
          <ul className="list-disc list-inside text-gray-600 dark:text-ink-soft-soft space-y-1">
            {experience.includes.map((inc, i) => <li key={i}>{inc}</li>)}
          </ul>
        </div>
      )}

      <div className="mt-8 bg-gray-50 dark:bg-white/5 rounded-2xl p-6">
        <h3 className="font-semibold text-ink-soft dark:text-ink-soft mb-3">How Booking Works</h3>
        <ul className="text-sm text-gray-600 dark:text-ink-soft-soft space-y-2 list-disc list-inside">
          <li><strong>Add to Cart / Book Now</strong> adds this experience to your cart, same as an organic product or homestay room.</li>
          <li>At checkout you'll confirm your <strong>pickup/contact address</strong> — pulled from what you enter (or your saved profile address if you've booked before).</li>
          <li>The experience itself takes place at <strong>{experience.village}{experience.district ? `, ${experience.district}` : ''}</strong>{experience.howToReach ? ' — directions are in the "How to reach" note above.' : '.'}</li>
          <li>Use <strong>Request Booking</strong> instead if you'd rather agree on a date/route with the host directly before paying.</li>
        </ul>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-surface-soft border border-gray-100 dark:border-white/10 rounded-2xl p-6">
        <div>
          <p className="text-2xl font-bold text-ink-soft dark:text-ink-soft">
            ₹{experience.price?.toLocaleString?.() ?? experience.price}
            <span className="text-sm font-normal text-gray-500"> / {experience.priceUnit || 'per person'}</span>
          </p>
          {experience.duration && <p className="text-sm text-gray-500">Duration: {experience.duration}</p>}
        </div>
        <div className="flex gap-3">
          {experience.hostId && (
            <Link
              to={`/profile/${experience.hostId}`}
              className="px-4 py-3 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-medium"
            >
              Host Profile
            </Link>
          )}
          {user && experience.hostId && (
            <Link
              to={`/messages?to=${experience.hostId}`}
              className="px-5 py-3 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <FaCommentDots /> Message Host
            </Link>
          )}
          <button
            className="px-4 py-3 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-medium flex items-center gap-2"
            onClick={() => {
              addToCart({ id: experience._id, type: 'experience', name: experience.title, price: experience.price, unit: experience.priceUnit || 'per person', image: experience.images?.[0] || experience.image, sellerId: experience.hostId, sellerName: experience.hostName });
              addToast('Added to cart', 'success');
            }}
          >
            <FaShoppingCart /> Add to Cart
          </button>
          <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium" onClick={() => setShowBooking(true)}>
            Book Now
          </button>
        </div>
      </div>

      {showBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-surface-soft rounded-2xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold mb-4">Request a Booking</h2>
            <form onSubmit={submitBooking} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Preferred Date</label>
                <input type="date" name="date" value={booking.date} onChange={handleBookingChange} required
                  className="w-full mt-1 p-2 border rounded-lg dark:bg-surface dark:border-white/10" />
              </div>
              <div>
                <label className="text-sm font-medium">Number of Guests</label>
                <input type="number" min="1" name="guests" value={booking.guests} onChange={handleBookingChange}
                  className="w-full mt-1 p-2 border rounded-lg dark:bg-surface dark:border-white/10" />
              </div>
              {(experience.category === 'trek' || experience.category === 'hiking') && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">From</label>
                    <input name="fromLocation" value={booking.fromLocation} onChange={handleBookingChange} placeholder={experience.route?.from || 'Starting point'}
                      className="w-full mt-1 p-2 border rounded-lg dark:bg-surface dark:border-white/10" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">To</label>
                    <input name="toLocation" value={booking.toLocation} onChange={handleBookingChange} placeholder={experience.route?.to || 'Destination'}
                      className="w-full mt-1 p-2 border rounded-lg dark:bg-surface dark:border-white/10" />
                  </div>
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Notes (optional)</label>
                <textarea name="notes" value={booking.notes} onChange={handleBookingChange} rows={2}
                  className="w-full mt-1 p-2 border rounded-lg dark:bg-surface dark:border-white/10" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowBooking(false)} className="flex-1 border border-gray-200 dark:border-white/10 py-2.5 rounded-lg font-medium">
                  Cancel
                </button>
                <button type="submit" disabled={sending} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-medium disabled:opacity-50">
                  {sending ? 'Sending…' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TourismDetail;
