import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import api, { API_BASE_URL } from '../utils/api';
import {
  FaMountain, FaBars, FaTimes, FaUser,
  FaSignOutAlt, FaLeaf, FaHome, FaCog,
  FaEnvelope, FaChevronDown, FaSun, FaMoon, FaShoppingCart, FaHeart, FaChartLine
} from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { totalItems } = useCart();
  const { totalItems: wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenu, setMobileMenu] = useState(false);
  const [profileMenu, setProfileMenu] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const dropdownRef = useRef(null);

  const isDark = theme === 'dark';

  useEffect(() => {
    if (user) {
      fetchUserAvatar();
      fetchUnreadMessages();
      const interval = setInterval(fetchUnreadMessages, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    setMobileMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUserAvatar = async () => {
    try {
      const response = await api.get('/settings');
      if (response.data.settings?.profile?.avatar) {
        setAvatar(`${API_BASE_URL}${response.data.settings.profile.avatar}`);
      }
    } catch { }
  };

  const fetchUnreadMessages = async () => {
    try {
      const response = await api.get('/chat');
      const myId = user?.id || user?._id;
      const unread = response.data.chats?.reduce((count, chat) => {
        const unreadInChat = chat.messages?.filter(
          msg => msg.sender?._id !== myId && !msg.readBy?.some(r => r.user === myId)
        ).length || 0;
        return count + unreadInChat;
      }, 0);
      setUnreadMessages(unread || 0);
    } catch { }
  };

  const handleLogout = () => {
    logout();
    setProfileMenu(false);
    setMobileMenu(false);
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'farmer': return '/farmer/dashboard';
      case 'homestay_owner': return '/homestay/dashboard';
      case 'homestay': return '/homestay/dashboard';
      case 'admin': return '/admin';
      default: return '/dashboard';
    }
  };

  const getUserInitial = () => {
    return user?.name?.charAt(0).toUpperCase() || 'U';
  };

  const isActive = (path) => {
    return location.pathname === path
      ? 'text-green-600 font-bold border-b-2 border-green-600'
      : 'text-ink-soft hover:text-green-600 font-medium';
  };

  return (
    <>
      <nav className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${isDark
          ? 'bg-gray-900/95 border-gray-800 text-white'
          : 'bg-surface/95 border-gray-100 text-ink-soft'
        }
        backdrop-blur-md shadow-sm border-b
      `}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">

            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className={`p-2 rounded-xl ${isDark
                  ? 'bg-green-900/50 group-hover:bg-green-900'
                  : 'bg-green-50 group-hover:bg-green-100'
                  }`}>
                  <FaMountain className={`text-2xl ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                <div>
                  <h1 className={`text-lg font-extrabold ${isDark ? 'text-white' : 'text-ink-soft'}`}>
                    Himalayan Connect
                  </h1>
                  <p className="text-xs text-green-600 font-bold uppercase tracking-wider">
                    Farm · Stay · Experience
                  </p>
                </div>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className={`flex items-center space-x-1.5 py-1 px-1 ${isActive('/')}`}>
                <FaHome className="text-xs" /> <span className="text-sm">Home</span>
              </Link>
              <Link to="/products" className={`flex items-center space-x-1.5 py-1 px-1 ${isActive('/products')}`}>
                <FaLeaf className="text-xs" /> <span className="text-sm">Organic Produce</span>
              </Link>
              <Link to="/homestays" className={`flex items-center space-x-1.5 py-1 px-1 ${isActive('/homestays')}`}>
                <FaMountain className="text-xs" /> <span className="text-sm">Homestays</span>
              </Link>

              <Link to="/cart" className="relative">
                <FaShoppingCart className="text-xl" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-emerald-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>

              {user ? (
                <>
                  <Link to="/messages" className="relative">
                    <FaEnvelope className="text-xl" />
                    {unreadMessages > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadMessages > 9 ? '9+' : unreadMessages}
                      </span>
                    )}
                  </Link>

                  <Link to="/wishlist" className="relative" title="Wishlist">
                    <FaHeart className="text-xl text-red-500" />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {wishlistCount > 9 ? '9+' : wishlistCount}
                      </span>
                    )}
                  </Link>

                  <button
                    onClick={toggleTheme}
                    className={`p-2 rounded-lg transition-all ${isDark
                      ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                      : 'bg-surface-alt text-ink-soft hover:bg-gray-200'
                      }`}
                    title={isDark ? 'Light Mode' : 'Dark Mode'}
                  >
                    {isDark ? <FaSun /> : <FaMoon />}
                  </button>

                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setProfileMenu(!profileMenu)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl border ${isDark
                        ? 'bg-gray-800 border-gray-700'
                        : 'bg-surface-alt border-gray-200'
                        }`}
                    >
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold overflow-hidden bg-gradient-to-br from-green-400 to-blue-500">
                        {avatar ? (
                          <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          getUserInitial()
                        )}
                      </div>
                      <span className="text-sm font-semibold">{user.name}</span>
                      <FaChevronDown className={`text-xs transition-transform ${profileMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {profileMenu && (
                      <div className={`absolute right-0 mt-2 w-56 rounded-xl shadow-2xl border py-2 ${isDark
                        ? 'bg-gray-800 border-gray-700'
                        : 'bg-surface border-gray-100'
                        }`}>
                        <div className="px-4 py-3 border-b">
                          <p className="font-bold">{user.name}</p>
                          <p className="text-xs">{user.email}</p>
                        </div>

                        <Link
                          to={getDashboardLink()}
                          className="flex items-center space-x-2 px-4 py-2.5 text-sm"
                          onClick={() => setProfileMenu(false)}
                        >
                          <FaUser /> <span>Dashboard</span>
                        </Link>

                        {user.role === 'admin' && (
                          <Link
                            to="/admin/analytics"
                            className="flex items-center space-x-2 px-4 py-2.5 text-sm"
                            onClick={() => setProfileMenu(false)}
                          >
                            <FaChartLine /> <span>Site Analytics</span>
                          </Link>
                        )}

                        <Link
                          to="/settings"
                          className="flex items-center space-x-2 px-4 py-2.5 text-sm"
                          onClick={() => setProfileMenu(false)}
                        >
                          <FaCog /> <span>Settings</span>
                        </Link>

                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2.5 text-sm flex items-center space-x-2 border-t mt-1 text-red-500"
                        >
                          <FaSignOutAlt /> <span>Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={toggleTheme}
                    className={`p-2 rounded-lg transition-all ${isDark
                      ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                      : 'bg-surface-alt text-ink-soft hover:bg-gray-200'
                      }`}
                  >
                    {isDark ? <FaSun /> : <FaMoon />}
                  </button>

                  <Link to="/login" className="font-semibold text-sm">
                    Login
                  </Link>
                  <Link to="/register" className="bg-green-600 text-white px-5 py-2 rounded-xl text-sm font-bold">
                    Register
                  </Link>
                </div>
              )}
            </div>

            <div className="md:hidden flex items-center gap-2">
              <Link to="/cart" className="relative p-2">
                <FaShoppingCart className="text-xl" />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>

              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg ${isDark
                  ? 'bg-gray-800 text-yellow-400'
                  : 'bg-surface-alt text-ink-soft'
                  }`}
              >
                {isDark ? <FaSun /> : <FaMoon />}
              </button>

              <button
                onClick={() => setMobileMenu(!mobileMenu)}
                className="text-xl p-2 rounded-lg"
              >
                {mobileMenu ? <FaTimes /> : <FaBars />}
              </button>
            </div>
          </div>

          {/* Mobile dropdown menu — was missing entirely before, so the
              hamburger button changed icon but nothing ever opened. */}
          {mobileMenu && (
            <div className={`md:hidden border-t py-3 space-y-1 ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
              <Link
                to="/"
                onClick={() => setMobileMenu(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium ${isActive('/')} ${isDark ? 'hover:bg-gray-800' : 'hover:bg-surface-alt'}`}
              >
                <FaHome /> Home
              </Link>
              <Link
                to="/products"
                onClick={() => setMobileMenu(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium ${isActive('/products')} ${isDark ? 'hover:bg-gray-800' : 'hover:bg-surface-alt'}`}
              >
                <FaLeaf /> Organic Produce
              </Link>
              <Link
                to="/homestays"
                onClick={() => setMobileMenu(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium ${isActive('/homestays')} ${isDark ? 'hover:bg-gray-800' : 'hover:bg-surface-alt'}`}
              >
                <FaMountain /> Homestays
              </Link>

              {user ? (
                <>
                  <Link
                    to="/messages"
                    onClick={() => setMobileMenu(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium ${isActive('/messages')} ${isDark ? 'hover:bg-gray-800' : 'hover:bg-surface-alt'}`}
                  >
                    <FaEnvelope /> Messages
                    {unreadMessages > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadMessages > 9 ? '9+' : unreadMessages}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/wishlist"
                    onClick={() => setMobileMenu(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium ${isActive('/wishlist')} ${isDark ? 'hover:bg-gray-800' : 'hover:bg-surface-alt'}`}
                  >
                    <FaHeart className="text-red-500" /> Wishlist
                    {wishlistCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {wishlistCount > 9 ? '9+' : wishlistCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to={getDashboardLink()}
                    onClick={() => setMobileMenu(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium ${isDark ? 'hover:bg-gray-800' : 'hover:bg-surface-alt'}`}
                  >
                    <FaUser /> Dashboard
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setMobileMenu(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium ${isActive('/settings')} ${isDark ? 'hover:bg-gray-800' : 'hover:bg-surface-alt'}`}
                  >
                    <FaCog /> Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-red-500"
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </>
              ) : (
                <div className="flex gap-3 px-3 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenu(false)}
                    className={`flex-1 text-center py-2.5 rounded-xl text-sm font-semibold border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenu(false)}
                    className="flex-1 text-center bg-green-600 text-white py-2.5 rounded-xl text-sm font-bold"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      <div className="h-16 w-full"></div>
    </>
  );
};

export default Navbar;