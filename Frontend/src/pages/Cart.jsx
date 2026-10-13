import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaMinus, FaPlus, FaShoppingCart, FaArrowLeft } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

const Cart = () => {
  const { items, removeFromCart, updateQty, totalItems, totalAmount } = useCart();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const bg = darkMode ? 'bg-gray-900' : 'bg-surface-alt';
  const cardBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-surface border-gray-100';
  const textMain = darkMode ? 'text-white' : 'text-ink-soft';
  const textSub = darkMode ? 'text-gray-400' : 'text-ink-soft-soft';

  return (
    <div className={`min-h-screen pt-24 pb-16 px-4 ${bg}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}>
            <FaArrowLeft className={textMain} />
          </button>
          <h1 className={`text-2xl font-black flex items-center gap-2 ${textMain}`}>
            <FaShoppingCart className="text-emerald-600" /> Your Cart
            {totalItems > 0 && <span className="text-sm font-semibold text-emerald-600">({totalItems} items)</span>}
          </h1>
        </div>

        {items.length === 0 ? (
          <div className={`rounded-2xl border p-10 text-center ${cardBg}`}>
            <p className="text-5xl mb-4">🛒</p>
            <p className={`font-bold text-lg ${textMain}`}>Your cart is empty</p>
            <p className={`text-sm mt-1 ${textSub}`}>
              Browse organic produce or homestays and tap "Add to Cart" to get started.
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
          <>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={`${item.type}-${item.id}`} className={`rounded-2xl border p-4 flex gap-4 items-center ${cardBg}`}>
                  <img
                    src={item.image || 'https://via.placeholder.com/100?text=Himalayan+Connect'}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold ${textMain}`}>{item.name}</p>
                    {item.sellerName && (
                      <Link to={`/profile/${item.sellerId}`} className="text-xs text-emerald-600 font-semibold hover:underline">
                        {item.type === 'room' ? '🏡' : '🌾'} {item.sellerName}
                      </Link>
                    )}
                    <p className={`text-sm mt-1 ${textSub}`}>
                      ₹{item.price} / {item.unit}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(item.id, item.type, item.qty - 1)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                    >
                      <FaMinus className="text-xs" />
                    </button>
                    <span className={`w-8 text-center font-bold ${textMain}`}>{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.id, item.type, item.qty + 1)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                    >
                      <FaPlus className="text-xs" />
                    </button>
                  </div>

                  <p className="font-black text-emerald-600 w-20 text-right">₹{item.qty * item.price}</p>

                  <button
                    onClick={() => removeFromCart(item.id, item.type)}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>

            <div className={`rounded-2xl border p-5 mt-6 ${cardBg}`}>
              <div className="flex justify-between items-center mb-4">
                <span className={`font-bold ${textMain}`}>Total ({totalItems} items)</span>
                <span className="text-2xl font-black text-emerald-600">₹{totalAmount}</span>
              </div>
              <button
                onClick={() => navigate('/checkout/cart')}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold shadow-lg transition-all disabled:opacity-60"
              >
                Proceed to Address & Payment →
              </button>
              <p className={`text-xs text-center mt-3 ${textSub}`}>
                Zero commission — your payment goes straight through to the sellers.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
