import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaHeart, FaRegHeart, FaCommentDots, FaUserCircle } from 'react-icons/fa';
import api from '../utils/api';
import { Loader } from '../components/ui';
import { useToast } from '../components/ToastContainer';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import ImageCarousel from '../components/ImageCarousel';
const DUMMY_HOMESTAYS = [
  {
    _id: 'dummy_1',
    homestayName: 'Trishul View Cottage',
    village: 'Sari',
    district: 'Rudraprayag',
    rating: 4.7,
    reviews: 89,
    price: 1800,
    tags: ['Organic Food', 'Trekking', 'Mountain View'],
    type: 'budget',
    image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=600&q=80',
  },
  {
    _id: 'dummy_2',
    homestayName: 'Mandakini Riverside Stay',
    village: 'Ukhimath',
    district: 'Rudraprayag',
    rating: 4.5,
    reviews: 56,
    price: 2200,
    tags: ['Riverside', 'Bonfire', 'Farm Visit'],
    type: 'mid',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
  },
  {
    _id: 'dummy_3',
    homestayName: 'Chopta Meadows Homestay',
    village: 'Chopta',
    district: 'Rudraprayag',
    rating: 4.8,
    reviews: 124,
    price: 2500,
    tags: ['Best View', 'WiFi', 'Farm-to-Table'],
    type: 'premium',
    image: 'https://images.unsplash.com/photo-1486911278844-a81c5267e227?auto=format&fit=crop&w=600&q=80',
  },
];

const Homestays = () => {
  const [filter, setFilter] = useState('all');
  const [acFilter, setAcFilter] = useState('all'); // 'all' | 'ac' | 'non-ac'
  const navigate = useNavigate();
  const location = useLocation();

  // Lets the navbar's "Homestays" mega-menu link straight to a price tier
  // and/or AC type, e.g. /homestays?filter=premium&ac=ac
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const f = params.get('filter');
    const ac = params.get('ac');
    if (f && ['all', 'budget', 'mid', 'premium'].includes(f)) setFilter(f);
    if (ac && ['all', 'ac', 'non-ac'].includes(ac)) setAcFilter(ac);
  }, [location.search]);
  const [homestays, setHomestays] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const { user } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const getOwnerId = (stay) => stay.hostId || stay.owner || null;
  const getOwnerName = (stay) => stay.hostName || 'Himalayan Host';

  const handleWishlistToggle = (stay) => {
    if (!user) {
      addToast('Please login to save items to your wishlist', 'info');
      navigate('/login');
      return;
    }
    toggleWishlist({
      id: stay._id,
      type: 'room',
      name: stay.homestayName,
      price: stay.price,
      unit: 'night',
      image: stay.image,
      sellerId: getOwnerId(stay),
      sellerName: getOwnerName(stay),
    });
  };

  const handleMessageOwner = (stay) => {
    if (!user) {
      addToast('Please login to message the host', 'info');
      navigate('/login');
      return;
    }
    const ownerId = getOwnerId(stay);
    if (!ownerId) {
      addToast('Host details are not available for this listing', 'error');
      return;
    }
    navigate(`/messages?to=${ownerId}&productName=${encodeURIComponent(stay.homestayName)}`);
  };

  useEffect(() => {
    const fetchHomestays = async () => {
      setLoading(true);
      try {
        const response = await api.get('/homestays');
        const liveHomestays = Array.isArray(response.data) ? response.data : (response.data?.homestays || []);
        // Only fall back to sample listings when there are no real ones yet —
        // otherwise "Book Direct" on a sample card leads nowhere real.
        setHomestays(liveHomestays.length > 0 ? liveHomestays : DUMMY_HOMESTAYS.map((h) => ({ ...h, isSample: true })));
      } catch (error) {
        addToast('Could not load homestays, showing sample listings', 'error');
        setHomestays(DUMMY_HOMESTAYS.map((h) => ({ ...h, isSample: true })));
      } finally {
        setLoading(false);
      }
    };
    fetchHomestays();
  }, [addToast]);

  const hasAcAmenity = (h, want) => {
    const amenities = (h.roomTypes || []).flatMap((rt) => rt.amenities || []).map((a) => a.toLowerCase());
    return want === 'ac' ? amenities.includes('ac') : amenities.includes('non-ac');
  };

  const filtered = homestays
    .filter((h) => filter === 'all' || h.type === filter)
    .filter((h) => acFilter === 'all' || h.isSample || hasAcAmenity(h, acFilter));

  return (
    <div className="bg-surface-alt/55 dark:bg-app-bg/60 backdrop-blur-sm min-h-screen py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-12">
          <span className="bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full border border-green-100 uppercase tracking-wider">
            Verified Village Stays
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-ink-soft dark:text-white mt-3 tracking-tight">
            🏡 Eco-Homestays Near Chopta
          </h1>
          <p className="text-lg text-ink-soft-soft dark:text-gray-400 mt-3 max-w-2xl mx-auto">
            Community-led stays in Uttarakhand. Book direct — Zero OTA commission.
          </p>
        </div>

        <div className="flex justify-center gap-3 mb-12 flex-wrap">
          {[
            { key: 'all', label: '🌾 All Stays' },
            { key: 'budget', label: '💰 Budget (< ₹2000)' },
            { key: 'mid', label: '⭐ Mid-Range' },
            { key: 'premium', label: '👑 Premium' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border ${filter === f.key
                ? 'bg-green-600 text-white border-green-600 shadow-md shadow-green-100'
                : 'bg-surface dark:bg-gray-800 text-ink-soft-soft dark: border-gray-200 dark:border-gray-700 hover:bg-surface-alt dark:hover:bg-gray-700 hover:text-ink-soft dark:hover:text-white'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex justify-center gap-3 mb-12 flex-wrap">
          {[
            { key: 'all', label: 'All Rooms' },
            { key: 'ac', label: '❄️ AC' },
            { key: 'non-ac', label: '🌬️ Non-AC' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setAcFilter(f.key)}
              className={`px-5 py-2 rounded-full text-xs font-semibold transition-all duration-300 border ${acFilter === f.key
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100'
                : 'bg-surface dark:bg-gray-800 text-ink-soft-soft dark:border-gray-200 dark:border-gray-700 hover:bg-surface-alt dark:hover:bg-gray-700 hover:text-ink-soft dark:hover:text-white'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader size="lg" />
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-8">
            {filtered.map((stay) => (
              <div
                key={stay._id}
                className="relative w-full sm:w-[360px] rounded-3xl shadow-lg hover:shadow-2xl overflow-hidden flex flex-col transition-all duration-500 group"
              >
                <div className="relative h-80">
                  <ImageCarousel
                    images={stay.images && stay.images.length > 0 ? stay.images : [stay.image]}
                    alt={stay.homestayName}
                    className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                    onClick={() => navigate(`/homestays/${stay._id}`)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent pointer-events-none" />

                  <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
                    {stay.viewLabel && (
                      <span className="bg-white/95 text-blue-700 text-[11px] font-bold px-2.5 py-1 rounded-full shadow">
                        {stay.viewLabel}
                      </span>
                    )}
                    <span className="bg-white/90 text-green-800 text-[11px] font-bold px-2.5 py-1 rounded-full shadow capitalize">
                      {stay.type}
                    </span>
                  </div>

                  <button
                    onClick={() => stay.isSample ? addToast('This is a sample listing.', 'info') : handleWishlistToggle(stay)}
                    title={isWishlisted(stay._id, 'room') ? 'Remove from wishlist' : 'Save to wishlist'}
                    className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    {isWishlisted(stay._id, 'room') ? (
                      <FaHeart className="text-red-500 text-sm" />
                    ) : (
                      <FaRegHeart className="text-gray-500 text-sm" />
                    )}
                  </button>

                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="flex items-center gap-1 text-xs font-medium text-white/75 mb-1">
                      <FaMapMarkerAlt className="text-red-400" /> {stay.village}, {stay.district}
                    </p>

                    <h3 className="text-xl font-bold text-white tracking-tight mb-1 line-clamp-1">
                      {stay.homestayName}
                    </h3>

                    <div className="flex items-center gap-3 mb-2">
                      {getOwnerId(stay) ? (
                        <button
                          onClick={() => navigate(`/profile/${getOwnerId(stay)}`)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-white/85 hover:text-white hover:underline"
                        >
                          <FaUserCircle className="text-sm" /> {getOwnerName(stay)}
                        </button>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-white/60">
                          <FaUserCircle className="text-sm" /> {getOwnerName(stay)}
                        </span>
                      )}
                      {stay.reviews > 0 ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-white/90">
                          <FaStar className="text-yellow-400" /> {stay.rating.toFixed(1)} <span className="text-white/60 font-normal">({stay.reviews})</span>
                        </span>
                      ) : (
                        <span className="text-xs text-white/50 italic">No reviews yet</span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {(stay.tags || []).slice(0, 3).map((tag, j) => (
                        <span
                          key={j}
                          className="text-[11px] bg-white/15 text-white px-2.5 py-1 rounded-md font-medium border border-white/20"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-2xl font-black text-white">₹{stay.price}</span>
                        <span className="text-xs font-medium text-white/60">/night</span>
                      </div>

                      {stay.isSample ? (
                        <button
                          onClick={() => addToast('This is a sample listing — real homestays will appear here once hosts list them.', 'info')}
                          className="bg-white/20 text-white/70 font-bold text-sm px-5 py-2.5 rounded-full cursor-not-allowed"
                        >
                          Sample Listing
                        </button>
                      ) : (
                        <Link
                          to={`/booking/${stay._id}`}
                          className="bg-white hover:bg-green-50 text-ink-soft font-bold text-sm px-5 py-2.5 rounded-full transition-all duration-300 active:scale-95 shadow-sm"
                        >
                          Book Direct
                        </Link>
                      )}
                    </div>
                    {!stay.isSample && (
                      <button
                        onClick={() => handleMessageOwner(stay)}
                        className="w-full bg-white/15 hover:bg-white/25 text-white font-bold text-xs px-3 py-2.5 rounded-xl flex items-center justify-center gap-1.5 border border-white/25 transition-all active:scale-95"
                      >
                        <FaCommentDots className="text-sm" /> Message Host
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Homestays;
