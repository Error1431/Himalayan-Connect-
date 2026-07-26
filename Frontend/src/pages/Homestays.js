import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const [homestays, setHomestays] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const navigate = useNavigate();
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

  const filtered = filter === 'all' ? homestays : homestays.filter((h) => h.type === filter);

  return (
    <div className="bg-surface-alt dark:bg-gray-900 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
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

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((stay) => (
              <div
                key={stay._id}
                className="bg-surface dark:bg-gray-800 rounded-3xl shadow-sm hover:shadow-xl border border-gray-100/80 dark:border-gray-700 overflow-hidden flex flex-col justify-between transition-all duration-500 group"
              >
                <div>
                  <div className="w-full h-56 overflow-hidden bg-surface-alt relative">
                    <ImageCarousel
                      images={stay.images && stay.images.length > 0 ? stay.images : [stay.image]}
                      alt={stay.homestayName}
                      className="w-full h-full transform group-hover:scale-105 transition-transform duration-700 ease-out"
                      onClick={() => navigate(`/homestays/${stay._id}`)}
                    />
                    <span className="absolute top-4 right-4 bg-surface/95 backdrop-blur-sm text-green-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm capitalize border border-gray-100">
                      {stay.type}
                    </span>
                    <button
                      onClick={() => stay.isSample ? addToast('This is a sample listing.', 'info') : handleWishlistToggle(stay)}
                      title={isWishlisted(stay._id, 'room') ? 'Remove from wishlist' : 'Save to wishlist'}
                      className="absolute top-4 left-4 w-9 h-9 rounded-full bg-surface/95 backdrop-blur-sm shadow-sm flex items-center justify-center border border-gray-100 hover:scale-110 transition-transform"
                    >
                      {isWishlisted(stay._id, 'room') ? (
                        <FaHeart className="text-red-500 text-sm" />
                      ) : (
                        <FaRegHeart className="text-gray-500 text-sm" />
                      )}
                    </button>
                  </div>

                  <div className="p-6 space-y-3">
                    <p className="flex items-center gap-1 text-xs font-medium text-gray-400">
                      <FaMapMarkerAlt className="text-red-400" /> {stay.village}, {stay.district}
                    </p>

                    <h3 className="text-xl font-bold text-ink-soft dark:text-white tracking-tight group-hover:text-green-600 transition-colors duration-300">
                      {stay.homestayName}
                    </h3>

                    {getOwnerId(stay) ? (
                      <button
                        onClick={() => navigate(`/profile/${getOwnerId(stay)}`)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-green-700 dark:text-green-400 hover:underline"
                      >
                        <FaUserCircle className="text-sm" /> {getOwnerName(stay)}
                      </button>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
                        <FaUserCircle className="text-sm" /> {getOwnerName(stay)}
                      </span>
                    )}

                    {stay.reviews > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <FaStar className="text-yellow-400 text-sm" />
                        <span className="text-sm font-bold text-ink-soft-soft dark:border-outline">{stay.rating.toFixed(1)}</span>
                        <span className="text-xs text-gray-400 font-normal">({stay.reviews} review{stay.reviews === 1 ? '' : 's'})</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">No reviews yet</span>
                    )}

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(stay.tags || []).map((tag, j) => (
                        <span
                          key={j}
                          className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-md font-medium border border-green-100/50"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 mt-4 border-t border-gray-50 dark:border-gray-700">
                  <div className="flex items-center justify-between pt-3">
                    <div>
                      <span className="text-2xl font-black text-ink-soft dark:text-white">₹{stay.price}</span>
                      <span className="text-xs font-medium text-gray-400">/night</span>
                    </div>

                    {stay.isSample ? (
                      <button
                        onClick={() => addToast('This is a sample listing — real homestays will appear here once hosts list them.', 'info')}
                        className="bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 font-bold text-sm px-5 py-2.5 rounded-2xl cursor-not-allowed"
                      >
                        Sample Listing
                      </button>
                    ) : (
                      <Link
                        to={`/booking/${stay._id}`}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-5 py-2.5 rounded-2xl transition-all duration-300 active:scale-95 shadow-sm hover:shadow-md hover:shadow-green-100"
                      >
                        Book Direct
                      </Link>
                    )}
                  </div>
                  {!stay.isSample && (
                    <button
                      onClick={() => handleMessageOwner(stay)}
                      className="w-full mt-3 bg-surface-alt dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-ink-soft dark:text-white font-bold text-xs px-3 py-2.5 rounded-xl flex items-center justify-center gap-1.5 border border-gray-200 dark:border-gray-600 transition-all active:scale-95"
                    >
                      <FaCommentDots className="text-sm" /> Message Host
                    </button>
                  )}
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
