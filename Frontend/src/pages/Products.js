import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api, { API_BASE_URL } from '../utils/api';
import { FaLeaf, FaMapMarkerAlt, FaStar, FaSearch, FaTimes, FaShoppingCart, FaShoppingBag, FaHeart, FaRegHeart, FaCommentDots, FaUserCircle } from 'react-icons/fa';
import { Loader } from '../components/ui';
import { useToast } from '../components/ToastContainer';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const CATEGORIES = ['All Products', 'Pulses', 'Millets', 'Processed', 'Vegetables'];

const DUMMY_PRODUCTS = [
  { _id: 'dummy_1', productName: 'Organic Kedarnath Rajma', category: 'Pulses', basePrice: 180, unit: 'kg', ratings: { average: 4.5, count: 23 }, locationAddress: 'Kedarnath Valley, 7000ft', imageUrl: '/rajma.jpg' },
  { _id: 'dummy_2', productName: 'Himalayan Mandua (Finger Millet)', category: 'Millets', basePrice: 120, unit: 'kg', ratings: { average: 4.8, count: 45 }, locationAddress: 'Garhwal Highlands', imageUrl: '/madu.jpg' },
  { _id: 'dummy_3', productName: 'Wild Organic Forest Honey', category: 'Processed', basePrice: 650, unit: 'kg', ratings: { average: 4.9, count: 67 }, locationAddress: 'Kedarnath Forests', imageUrl: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=600&q=80' },
  { _id: 'dummy_4', productName: 'Pahadi Gahat (Horse Gram)', category: 'Pulses', basePrice: 160, unit: 'kg', ratings: { average: 4.3, count: 18 }, locationAddress: 'Uttarakhand Valleys', imageUrl: '/gahat.jpg' },
  { _id: 'dummy_5', productName: 'Jhangora (Barnyard Millet)', category: 'Millets', basePrice: 140, unit: 'kg', ratings: { average: 4.6, count: 31 }, locationAddress: 'Mountain Terraces', imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80' },
  { _id: 'dummy_6', productName: 'Buransh Flower Juice', category: 'Processed', basePrice: 250, unit: 'liter', ratings: { average: 4.7, count: 52 }, locationAddress: 'Uttarakhand State Flower', imageUrl: '/bura.jpg' },
  { _id: 'dummy_7', productName: 'Organic Pahadi Potatoes', category: 'Vegetables', basePrice: 60, unit: 'kg', ratings: { average: 4.4, count: 40 }, locationAddress: 'Chopta Valley', imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80' },
  { _id: 'dummy_8', productName: 'Fresh Mountain Spinach', category: 'Vegetables', basePrice: 80, unit: 'kg', ratings: { average: 4.2, count: 15 }, locationAddress: 'Mandakini Valley', imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80' }
];

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All Products');
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Lets the navbar's "Organic Produce" mega-menu link straight to a
  // category, e.g. /products?category=Pulses
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get('category');
    if (category && CATEGORIES.includes(category)) {
      setActiveCategory(category);
    }
  }, [location.search]);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await api.get('/products');
        const liveProducts = Array.isArray(response.data)
          ? response.data
          : (response.data.products || []);

        // Only show sample products when there are no real ones yet —
        // otherwise Buy Now / cart / wishlist on a sample leads nowhere real.
        setProducts(liveProducts.length > 0 ? liveProducts : DUMMY_PRODUCTS.map((p) => ({ ...p, isSample: true })));
      } catch (error) {
        console.error('Failed to fetch market products:', error);
        addToast('Could not load live products, showing sample listings', 'error');
        setProducts(DUMMY_PRODUCTS.map((p) => ({ ...p, isSample: true })));
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [addToast]);

  const runSearch = useCallback(async (term) => {
    if (!term.trim()) {
      setSearching(false);
      return;
    }

    setSearching(true);
    try {
      const response = await api.get('/products/search', { params: { q: term } });
      const liveResults = Array.isArray(response.data) ? response.data : [];
      const localMatches = liveResults.length > 0 ? [] : DUMMY_PRODUCTS.filter((p) =>
        p.productName.toLowerCase().includes(term.toLowerCase()) ||
        p.category.toLowerCase().includes(term.toLowerCase())
      ).map((p) => ({ ...p, isSample: true }));
      setProducts([...liveResults, ...localMatches]);
    } catch (error) {
      console.error('Search failed:', error);
      addToast('Search failed, showing all products', 'error');
    } finally {
      setSearching(false);
    }
  }, [addToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        runSearch(searchTerm);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, runSearch]);

  const clearSearch = () => {
    setSearchTerm('');
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = activeCategory === 'All Products'
      || (p.category && p.category.toLowerCase().includes(activeCategory.toLowerCase().replace(' products', '')));

    const matchesSearch = !searchTerm.trim()
      || p.productName.toLowerCase().includes(searchTerm.toLowerCase())
      || (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
      || (p.locationAddress && p.locationAddress.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const getProductImage = (prod) => {
    if (prod._id && String(prod._id).startsWith('dummy_')) return prod.imageUrl;
    if (prod.imageUrl && prod.imageUrl !== '') return `${API_BASE_URL}${prod.imageUrl}`;
    if (prod.category === 'Vegetables') return 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80';
    if (prod.category === 'Millets') return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80';
    if (prod.category === 'Processed') return 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=600&q=80';
    return 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80';
  };

  const getMapLink = (prod) => {
    if (prod.locationLat && prod.locationLng) {
      return `https://www.google.com/maps/search/?api=1&query=${prod.locationLat},${prod.locationLng}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(prod.locationAddress || 'Kedarnath')}`;
  };

  const handleBuyNow = (product) => {
    if (product.isSample) {
      addToast('This is a sample listing — real products will appear here once farmers list them.', 'info');
      return;
    }
    if (product.inStock === false) {
      addToast('This product is out of stock right now.', 'error');
      return;
    }
    if (!user) {
      addToast('Please login to buy this product', 'info');
      navigate('/login');
      return;
    }
    navigate(`/checkout/product/${product._id}`, { state: { product } });
  };

  const getSellerId = (product) => product.farmer?._id || product.farmerId || null;
  const getSellerName = (product) => product.farmer?.name || product.farmerName || 'Himalayan Farmer';

  const handleAddToCart = (product) => {
    if (product.isSample) {
      addToast('This is a sample listing — it can\'t be added to cart yet.', 'info');
      return;
    }
    if (product.inStock === false) {
      addToast('This product is out of stock right now.', 'error');
      return;
    }
    const price = product.pricing?.basePrice || product.basePrice;
    const unit = product.pricing?.unit || product.unit || 'kg';
    addToCart({
      id: product._id,
      type: 'product',
      name: product.productName,
      price,
      unit,
      image: getProductImage(product),
      sellerId: getSellerId(product),
      sellerName: getSellerName(product),
    });
    addToast(`${product.productName} added to cart`, 'success');
  };

  const handleWishlistToggle = (product) => {
    if (product.isSample) {
      addToast('This is a sample listing.', 'info');
      return;
    }
    if (!user) {
      addToast('Please login to save items to your wishlist', 'info');
      navigate('/login');
      return;
    }
    const price = product.pricing?.basePrice || product.basePrice;
    const unit = product.pricing?.unit || product.unit || 'kg';
    toggleWishlist({
      id: product._id,
      type: 'product',
      name: product.productName,
      price,
      unit,
      image: getProductImage(product),
      sellerId: getSellerId(product),
      sellerName: getSellerName(product),
    });
  };

  const handleMessageSeller = (product) => {
    if (product.isSample) {
      addToast('This is a sample listing — no seller to message yet.', 'info');
      return;
    }
    if (!user) {
      addToast('Please login to message the seller', 'info');
      navigate('/login');
      return;
    }
    const sellerId = getSellerId(product);
    if (!sellerId) {
      addToast('Seller details are not available for this listing', 'error');
      return;
    }
    navigate(`/messages?to=${sellerId}&productName=${encodeURIComponent(product.productName)}`);
  };

  return (
    <div className="bg-surface-alt dark:bg-app-bg min-h-screen py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800 uppercase tracking-wider">100% Pure &amp; Organic</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-ink-soft dark:text-ink-soft mt-3 tracking-tight flex items-center justify-center gap-3">
            <FaLeaf className="text-emerald-500" /> Organic Mountain Produce
          </h1>
          <p className="text-lg text-ink-soft-soft dark:text-ink-soft-soft mt-3 max-w-2xl mx-auto">Direct from Mandakini Valley Farmers — Zero Middlemen</p>
        </div>

        <div className="max-w-xl mx-auto mb-10 relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-ink-soft-soft" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products, category or location..."
            className="w-full pl-11 pr-10 py-3 rounded-2xl border border-gray-200 dark:border-outline bg-surface dark:bg-surface text-ink-soft dark:text-ink-soft placeholder-gray-400 dark:placeholder-ink-soft focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm transition-colors"
          />
          {searchTerm && (
            <button onClick={clearSearch} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-ink-soft-soft hover:text-ink-soft-soft dark:hover:text-ink-soft">
              <FaTimes />
            </button>
          )}
        </div>

        <div className="flex justify-center gap-3 mb-12 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border capitalize ${activeCategory === cat
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-100 dark:shadow-none'
                : 'bg-surface dark:bg-surface text-ink-soft-soft dark:text-ink-soft-soft border-gray-200 dark:border-outline hover:bg-surface-alt dark:hover:bg-surface-alt hover:text-ink-soft dark:hover:text-ink-soft'
                }`}
            >
              {cat === 'All Products' ? '🌾 All Products' : cat}
            </button>
          ))}
        </div>

        {loading || searching ? (
          <div className="flex justify-center py-20">
            <Loader size="lg" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-gray-500 dark:text-ink-soft-soft">
            No products found for "{searchTerm}". Try a different search.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <div key={product._id} className="bg-surface dark:bg-surface rounded-3xl shadow-sm hover:shadow-xl border border-gray-100/80 dark:border-outline overflow-hidden flex flex-col justify-between transition-all duration-500 group">
                <div>
                  <div className="w-full h-52 overflow-hidden bg-surface-alt dark:bg-surface-alt relative">
                    <img src={getProductImage(product)} alt={product.productName} className={`w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out ${product.inStock === false ? 'grayscale opacity-60' : ''}`} onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80'; }} />
                    {product.inStock === false && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-red-600 text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wide shadow-lg">Out of Stock</span>
                      </div>
                    )}
                    <span className="absolute top-4 left-4 bg-surface/95 dark:bg-surface/95 backdrop-blur-sm text-emerald-800 dark:text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1 border border-gray-100 dark:border-outline">
                      <FaLeaf className="text-emerald-500" /> {product.category}
                    </span>
                    <button
                      onClick={() => handleWishlistToggle(product)}
                      title={isWishlisted(product._id, 'product') ? 'Remove from wishlist' : 'Save to wishlist'}
                      className="absolute top-4 right-4 w-9 h-9 rounded-full bg-surface/95 dark:bg-surface/95 backdrop-blur-sm shadow-sm flex items-center justify-center border border-gray-100 dark:border-outline hover:scale-110 transition-transform"
                    >
                      {isWishlisted(product._id, 'product') ? (
                        <FaHeart className="text-red-500 text-sm" />
                      ) : (
                        <FaRegHeart className="text-gray-500 dark:text-ink-soft-soft text-sm" />
                      )}
                    </button>
                  </div>
                  <div className="p-5 space-y-2.5">
                    <a href={getMapLink(product)} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 dark:text-ink-soft-soft hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 font-medium transition-colors cursor-pointer">
                      <FaMapMarkerAlt className="text-pink-500" /> <span className="truncate">{product.locationAddress || 'Kedarnath Valley'}</span>
                    </a>
                    <h3 className="font-bold text-ink-soft dark:text-ink-soft text-lg line-clamp-1">{product.productName}</h3>
                    {getSellerId(product) ? (
                      <button
                        onClick={() => navigate(`/profile/${getSellerId(product)}`)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                      >
                        <FaUserCircle className="text-sm" /> {getSellerName(product)}
                      </button>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 dark:text-ink-soft-soft">
                        <FaUserCircle className="text-sm" /> {getSellerName(product)}
                      </span>
                    )}
                    {product.ratings?.count > 0 ? (
                      <div className="flex items-center gap-1.5 bg-surface-alt dark:bg-surface-alt w-fit px-2.5 py-1 rounded-lg border border-gray-100 dark:border-outline">
                        <FaStar className="text-amber-400 text-sm" />
                        <span className="text-sm font-bold text-ink-soft-soft dark:text-ink-soft">{product.ratings.average.toFixed(1)}</span>
                        <span className="text-xs text-gray-400 dark:text-ink-soft-soft">({product.ratings.count} review{product.ratings.count === 1 ? '' : 's'})</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-ink-soft-soft italic">No reviews yet</span>
                    )}
                  </div>
                </div>
                <div className="p-5 pt-0 mt-4 border-t border-gray-50/60 dark:border-outline">
                  <div className="flex items-center justify-between pt-3">
                    <div><span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">₹{product.pricing?.basePrice || product.basePrice}</span><span className="text-xs font-medium text-gray-400 dark:text-ink-soft-soft">/{product.pricing?.unit || product.unit || 'kg'}</span></div>
                    <button
                      onClick={() => handleBuyNow(product)}
                      disabled={product.inStock === false}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold text-sm px-5 py-2.5 rounded-2xl flex items-center gap-2 shadow-sm transition-all active:scale-95"
                    >
                      <FaShoppingBag className="text-base" /> {product.inStock === false ? 'Out of Stock' : 'Buy Now'}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.inStock === false}
                      className="flex-1 bg-surface-alt dark:bg-surface-alt hover:bg-emerald-50 dark:hover:bg-emerald-900/30 disabled:opacity-50 disabled:cursor-not-allowed text-ink-soft dark:text-ink-soft font-bold text-xs px-3 py-2.5 rounded-xl flex items-center justify-center gap-1.5 border border-gray-200 dark:border-outline transition-all active:scale-95"
                    >
                      <FaShoppingCart className="text-sm" /> Add to Cart
                    </button>
                    <button
                      onClick={() => handleMessageSeller(product)}
                      className="flex-1 bg-surface-alt dark:bg-surface-alt hover:bg-blue-50 dark:hover:bg-blue-900/30 text-ink-soft dark:text-ink-soft font-bold text-xs px-3 py-2.5 rounded-xl flex items-center justify-center gap-1.5 border border-gray-200 dark:border-outline transition-all active:scale-95"
                    >
                      <FaCommentDots className="text-sm" /> Message
                    </button>
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

export default Products;
