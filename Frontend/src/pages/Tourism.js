import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaUserCheck, FaHeart, FaRegHeart, FaSearch, FaShoppingCart } from 'react-icons/fa';
import api from '../utils/api';
import { Loader } from '../components/ui';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/ToastContainer';

export const CATEGORIES = [
  { value: 'all', label: 'All Experiences' },
  { value: 'wedding', label: 'Weddings' },
  { value: 'farm_visit', label: 'Farm Visits' },
  { value: 'farm_work', label: 'Grow With Us' },
  { value: 'trek', label: 'Treks' },
  { value: 'hiking', label: 'Hiking' },
  { value: 'village_tour', label: 'Village Tours' },
];

const DUMMY_EXPERIENCES = [
  {
    _id: 'demo_wedding_1',
    title: 'Traditional Garhwali Village Wedding',
    category: 'wedding',
    village: 'Sari', district: 'Rudraprayag',
    rating: 4.9, reviews: 34, price: 45000,
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
  },
  {
    _id: 'demo_farmvisit_1',
    title: 'Watch Rajma Grow — Live Farm Visit & Tasting',
    category: 'farm_visit',
    village: 'Chopta', district: 'Rudraprayag',
    rating: 4.7, reviews: 61, price: 500,
    cropsGrown: ['Rajma', 'Mandua', 'Hill Vegetables'],
    howToReach: '20 min walk from Chopta main road, ask for Devi Farms — well signposted.',
    highlights: ['viewpoint', 'farming', 'local_food'],
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
  },
  {
    _id: 'demo_farmwork_1',
    title: 'Grow With the Farmer — A Day in the Fields',
    category: 'farm_work',
    village: 'Ukhimath', district: 'Rudraprayag',
    rating: 4.8, reviews: 28, price: 800,
    cropsGrown: ['Jhangora', 'Buckwheat', 'Seasonal Vegetables'],
    howToReach: 'Pickup available from Ukhimath bus stand on request.',
    highlights: ['farming', 'local_food', 'traditional_house', 'village_evening'],
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=600&q=80',
  },
  {
    _id: 'demo_trek_1',
    title: 'Kedarkantha Trek with Certified Guide',
    category: 'trek',
    village: 'Sankri', district: 'Uttarkashi',
    rating: 4.9, reviews: 152, price: 6500,
    highlights: ['viewpoint', 'wild_trail', 'night_sky'],
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
  },
  {
    _id: 'demo_hike_1',
    title: 'Deoria Tal Sunrise Hike',
    category: 'hiking',
    village: 'Sari', district: 'Rudraprayag',
    rating: 4.6, reviews: 77, price: 1200,
    highlights: ['viewpoint', 'wild_trail'],
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=600&q=80',
  },
  {
    _id: 'demo_village_1',
    title: 'Kumaoni Village Culture Walk',
    category: 'village_tour',
    village: 'Kasar Devi', district: 'Almora',
    rating: 4.7, reviews: 43, price: 700,
    highlights: ['farming', 'traditional_house', 'village_evening', 'local_culture', 'night_sky'],
    image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=600&q=80',
  },
];

const Tourism = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('all');
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { addToast } = useToast();

  // Lets the navbar's "Tourism & Culture" mega-menu link straight to a category,
  // e.g. /tourism?category=trek
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const c = params.get('category');
    if (c) setCategory(c);
  }, [location.search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.get('/experiences')
      .then((res) => {
        if (cancelled) return;
        setExperiences(Array.isArray(res.data) && res.data.length ? res.data : DUMMY_EXPERIENCES);
      })
      .catch(() => { if (!cancelled) setExperiences(DUMMY_EXPERIENCES); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const districts = useMemo(
    () => ['all', ...Array.from(new Set(experiences.map((e) => e.district).filter(Boolean)))],
    [experiences]
  );

  const filtered = experiences.filter((e) => {
    if (category !== 'all' && e.category !== category) return false;
    if (district !== 'all' && e.district !== district) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const haystack = `${e.title} ${e.village || ''} ${e.district || ''} ${e.theme || ''}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const handleAddToCart = (exp) => {
    addToCart({ id: exp._id, type: 'experience', name: exp.title, price: exp.price, unit: 'booking', image: exp.image, sellerId: exp.hostId, sellerName: exp.hostName });
    addToast('Added to cart', 'success');
  };

  const handleBookNow = (exp) => {
    handleAddToCart(exp);
    navigate('/checkout/cart');
  };

  return (
    <div className="bg-surface-alt/55 dark:bg-app-bg/60 backdrop-blur-sm transition-colors">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-ink-soft dark:text-ink-soft">Tourism &amp; Culture</h1>
        <p className="text-gray-500 dark:text-ink-soft-soft mt-2 max-w-2xl mx-auto">
          Live the mountains, not just visit them — village weddings, farm-fresh tastings,
          working the fields with a farmer, certified treks &amp; hikes, and real village life.
        </p>
      </div>

      <div className="max-w-xl mx-auto mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search a wedding, trek, farm visit or village tour..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-soft text-sm focus:outline-none focus:border-green-500"
          />
        </div>
        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="px-4 py-2.5 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-soft text-sm focus:outline-none focus:border-green-500"
        >
          {districts.map((d) => <option key={d} value={d}>{d === 'all' ? 'All Locations' : d}</option>)}
        </select>
      </div>

      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
              category === c.value
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white dark:bg-surface-soft text-gray-600 dark:text-ink-soft-soft border-gray-200 dark:border-white/10'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="flex flex-wrap justify-center gap-6">
          {filtered.map((exp) => (
            <div key={exp._id} className="relative w-full sm:w-[320px] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition group">
              <div className="relative h-80">
                <img src={exp.image} alt={exp.title} className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

                <span className="absolute top-4 left-4 bg-white/95 text-green-800 text-[11px] font-bold px-2.5 py-1 rounded-full shadow capitalize">
                  {CATEGORIES.find((c) => c.value === exp.category)?.label || exp.category}
                </span>
                <button
                  onClick={() => toggleWishlist({ id: exp._id, type: 'experience', name: exp.title, image: exp.image, price: exp.price })}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow flex items-center justify-center hover:scale-110 transition-transform"
                  aria-label="Save to wishlist"
                >
                  {isWishlisted(exp._id, 'experience') ? <FaHeart className="text-red-500 text-sm" /> : <FaRegHeart className="text-gray-500 text-sm" />}
                </button>

                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-xs text-white/75 flex items-center gap-1 mb-1">
                    <FaMapMarkerAlt className="text-green-400" /> {exp.village}{exp.district ? `, ${exp.district}` : ''}
                  </p>
                  <h3 className="font-bold text-white text-lg mb-1 line-clamp-2">{exp.title}</h3>

                  <div className="flex items-center gap-3 mb-3">
                    {exp.guide?.certified && (
                      <span className="text-xs text-green-300 flex items-center gap-1">
                        <FaUserCheck /> Certified guide
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs font-bold text-white/90">
                      <FaStar className="text-amber-400" /> {exp.rating || '—'} <span className="text-white/60 font-normal">({exp.reviews || 0})</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-black text-white">₹{exp.price?.toLocaleString?.() ?? exp.price}</span>
                    <button
                      onClick={() => handleBookNow(exp)}
                      className="bg-white hover:bg-green-50 text-ink-soft font-bold text-sm px-5 py-2.5 rounded-full transition active:scale-95 shadow-sm"
                    >
                      Book Now
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAddToCart(exp)}
                      aria-label="Add to cart"
                      className="flex-1 bg-white/15 hover:bg-white/25 text-white font-bold text-xs px-3 py-2.5 rounded-xl flex items-center justify-center gap-1.5 border border-white/25 transition active:scale-95"
                    >
                      <FaShoppingCart className="text-sm" /> Add to Cart
                    </button>
                    <Link
                      to={`/tourism/${exp._id}`}
                      className="flex-1 text-center bg-white/15 hover:bg-white/25 text-white font-bold text-xs px-3 py-2.5 rounded-xl border border-white/25 transition active:scale-95"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full text-center text-gray-500 py-12">No experiences found in this category yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Tourism;
