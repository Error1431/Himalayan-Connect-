import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHeartBroken, FaTrash, FaCommentDots, FaArrowLeft, FaHeart, FaShoppingCart } from 'react-icons/fa';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/ToastContainer';

const Wishlist = () => {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { darkMode } = useTheme();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const bg = darkMode ? 'bg-gray-900' : 'bg-surface-alt';
  const cardBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-surface border-gray-100';
  const textMain = darkMode ? 'text-white' : 'text-ink-soft';
  const textSub = darkMode ? 'text-gray-400' : 'text-ink-soft-soft';

  const handleMoveToCart = (item) => {
    if (item.type !== 'product') {
      addToast('Homestays can be booked directly from their listing.', 'info');
      return;
    }
    addToCart(item);
    removeFromWishlist(item.id, item.type);
    addToast(`${item.name} moved to cart`, 'success');
  };

  return (
    <div className={`min-h-screen pt-24 pb-16 px-4 ${bg}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}>
            <FaArrowLeft className={textMain} />
          </button>
          <h1 className={`text-2xl font-black flex items-center gap-2 ${textMain}`}>
            <FaHeart className="text-red-500" /> My Wishlist
            {items.length > 0 && <span className="text-sm font-semibold text-red-500">({items.length} saved)</span>}
          </h1>
        </div>

        {items.length === 0 ? (
          <div className={`rounded-2xl border p-10 text-center ${cardBg}`}>
            <FaHeartBroken className="text-5xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className={`font-bold text-lg ${textMain}`}>Your wishlist is empty</p>
            <p className={`text-sm mt-1 ${textSub}`}>
              Tap the heart icon on any product or homestay to save it here.
            </p>
            <div className="flex gap-3 justify-center mt-5">
              <Link to="/products" className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all">
                🌾 Browse Produce
              </Link>
              <Link to="/homestays" className="px-5 py-2.5 rounded-xl bg-white border border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-bold text-sm transition-all">
                🏡 Browse Homestays
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((item) => (
              <div key={`${item.type}-${item.id}`} className={`rounded-2xl border p-4 flex gap-4 items-center ${cardBg}`}>
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=200&q=80'}
                  alt={item.name}
                  className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className={`font-bold truncate ${textMain}`}>{item.name}</p>
                  {item.sellerName && (
                    <Link to={`/profile/${item.sellerId}`} className="text-xs text-emerald-600 font-semibold hover:underline">
                      {item.type === 'room' ? '🏡' : '🌾'} {item.sellerName}
                    </Link>
                  )}
                  <p className={`text-sm mt-1 font-bold text-green-600`}>
                    ₹{item.price}{item.unit ? `/${item.unit}` : ''}
                  </p>
                  <div className="flex gap-2 mt-2">
                    {item.type === 'product' && (
                      <button
                        onClick={() => handleMoveToCart(item)}
                        title="Add to cart"
                        className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 hover:bg-emerald-100 flex items-center gap-1"
                      >
                        <FaShoppingCart /> Add to Cart
                      </button>
                    )}
                    {item.sellerId && (
                      <button
                        onClick={() => navigate(`/messages?to=${item.sellerId}&productName=${encodeURIComponent(item.name)}`)}
                        title="Message seller"
                        className="text-xs px-2.5 py-1 rounded-lg bg-surface-alt dark:bg-surface-alt border border-gray-200 dark:border-outline hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center gap-1"
                      >
                        <FaCommentDots /> Message
                      </button>
                    )}
                    <button
                      onClick={() => removeFromWishlist(item.id, item.type)}
                      title="Remove"
                      className="text-xs px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 hover:bg-red-100 flex items-center gap-1"
                    >
                      <FaTrash /> Remove
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

export default Wishlist;
