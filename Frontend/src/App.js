import { useState, useEffect, useRef } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Homestays from './pages/Homestays';
import Login from './pages/Login';
import OAuthSuccess from './pages/OAuthSuccess';
import BookingPage from './pages/BookingPage';
import BookingConfirmation from './pages/BookingConfirmation';
import ProductCheckout from './pages/ProductCheckout';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import FarmerDashboard from './pages/FarmerDashboard';
import HomestayDashboard from './pages/HomestayDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import Settings from './pages/Settings';
import Messages from './pages/Messages';
import PrivateRoute from './components/PrivateRoute';
import AddHomestay from './components/AddHomestay';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';
import SellerProfile from './pages/SellerProfile';
import HimalayanAIPage from './pages/AIAssistant';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ToastProvider, useToast } from './components/ToastContainer';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastContainer as ReactToastNotifications } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeToggle } from './components/ui';
import {
  FaThLarge,
  FaChartLine,
  FaShoppingBag,
  FaConciergeBell,
  FaHeadset,
  FaShieldAlt,
  FaTimesCircle,
  FaQuestionCircle,
  FaUniversalAccess,
  FaUserCheck,
  FaSeedling,
  FaHome,
  FaUserFriends,
  FaHandshake,
  FaRobot,
  FaArrowUp,
  FaStar,
  FaLeaf,
  FaMountain,
} from 'react-icons/fa';


function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
}


function PageLoader() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 1200);
    return () => clearTimeout(t);
  }, []);
  if (!visible) return null;
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'linear-gradient(135deg, #064e3b, #065f46, #047857)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}
    >
      <style>{`
        @keyframes fadeOutLoader {
          to { opacity: 0; pointer-events: none; }
        }
        @keyframes spinPulse {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.1); }
          100% { transform: rotate(360deg) scale(1); }
        }
        @keyframes loaderFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
      <div style={{ fontSize: 56, animation: 'spinPulse 1.2s ease infinite' }}>🏔️</div>
      <p style={{
        color: '#a7f3d0', fontWeight: 800, fontSize: 22, marginTop: 16, letterSpacing: 2,
        animation: 'loaderFadeUp 0.6s ease 0.2s both',
      }}>
        HIMALAYAN CONNECT
      </p>
      <p style={{
        color: '#6ee7b7', fontSize: 13, marginTop: 6, opacity: 0.8,
        animation: 'loaderFadeUp 0.6s ease 0.35s both',
      }}>
        Loading your mountain experience...
      </p>
      <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%', background: '#34d399',
            animation: `dotBounce 1.2s ease-in-out ${i * 0.15}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}


function ScrollToTopButton() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const handler = () => setShow(window.scrollY > 400);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      style={{
        position: 'fixed', bottom: 90, right: 24, zIndex: 50,
        width: 44, height: 44, borderRadius: '50%',
        background: 'linear-gradient(135deg, #059669, #0d9488)',
        border: 'none', color: 'white', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(5,150,105,0.4)',
        transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        fontSize: 16,
        opacity: show ? 1 : 0,
        transform: show ? 'scale(1) translateY(0)' : 'scale(0.4) translateY(20px)',
        pointerEvents: show ? 'all' : 'none',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15) translateY(-3px)'}
      onMouseLeave={e => e.currentTarget.style.transform = show ? 'scale(1) translateY(0)' : 'scale(0.4) translateY(20px)'}
      title="Back to top"
    >
      <FaArrowUp />
    </button>
  );
}


function AIFloatingButton() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [hovered, setHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const isAIPage = pathname === '/ai-assistant';

  useEffect(() => {
    const t1 = setTimeout(() => setShowTooltip(true), 2500);
    const t2 = setTimeout(() => setShowTooltip(false), 7000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (isAIPage) return null;

  return (
    <>
      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes aiFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        @keyframes tooltipSlide {
          from { opacity: 0; transform: translateX(10px) translateY(-50%); }
          to { opacity: 1; transform: translateX(0) translateY(-50%); }
        }
      `}</style>

      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9000 }}>
        {showTooltip && !hovered && (
          <div style={{
            position: 'absolute', right: 70, top: '50%',
            animation: 'tooltipSlide 0.3s ease forwards',
            background: 'linear-gradient(135deg, #1a0533, #2d1b69)',
            color: 'white', fontSize: 12, fontWeight: 700,
            padding: '9px 14px', borderRadius: 12, whiteSpace: 'nowrap',
            boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
            border: '1px solid rgba(139,92,246,0.4)',
          }}>
            🤖 Ask Himalayan AI!
            <div style={{
              position: 'absolute', right: -6, top: '50%', transform: 'translateY(-50%)',
              width: 0, height: 0,
              borderTop: '6px solid transparent',
              borderBottom: '6px solid transparent',
              borderLeft: '6px solid #2d1b69',
            }} />
          </div>
        )}

        <div style={{
          position: 'absolute', inset: -4, borderRadius: '50%',
          background: 'rgba(139,92,246,0.3)',
          animation: 'ping 2s cubic-bezier(0,0,0.2,1) infinite',
          pointerEvents: 'none',
        }} />

        <button
          onClick={() => navigate('/ai-assistant')}
          onMouseEnter={() => { setHovered(true); setShowTooltip(false); }}
          onMouseLeave={() => setHovered(false)}
          style={{
            width: 58, height: 58, borderRadius: '50%', border: 'none',
            background: hovered
              ? 'linear-gradient(135deg, #6d28d9, #be185d)'
              : 'linear-gradient(135deg, #7c3aed, #db2777)',
            color: 'white', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: hovered
              ? '0 16px 48px rgba(124,58,237,0.75)'
              : '0 8px 32px rgba(124,58,237,0.5)',
            fontSize: 24,
            animation: hovered ? 'none' : 'aiFloat 3s ease-in-out infinite',
            transform: hovered ? 'scale(1.12)' : 'scale(1)',
            transition: 'background 0.3s, box-shadow 0.3s, transform 0.3s',
            position: 'relative',
          }}
          title="Open Himalayan AI Assistant"
        >
          <FaRobot />
        </button>
      </div>
    </>
  );
}


const HeroSection = () => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  const STATS = [
    { icon: '🌾', value: '500+', label: 'Farmers' },
    { icon: '🏡', value: '120+', label: 'Homestays' },
    { icon: '🌿', value: '1200+', label: 'Products' },
    { icon: '⭐', value: '4.9', label: 'Avg Rating' },
  ];

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '90vh', background: '#111827', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <style>{`
        @keyframes heroFloat {
          0%, 100% { transform: scale(1.05) translateY(0px); }
          50% { transform: scale(1.08) translateY(-8px); }
        }
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .hero-stat-card:hover {
          transform: translateY(-4px) scale(1.05) !important;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3) !important;
        }
        .hero-btn-primary:hover {
          transform: translateY(-3px) !important;
          box-shadow: 0 16px 40px rgba(5,150,105,0.6) !important;
        }
        .hero-btn-secondary:hover {
          transform: translateY(-3px) !important;
          background: rgba(255,255,255,0.15) !important;
          border-color: rgba(255,255,255,0.4) !important;
        }
      `}</style>

      <img
        src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80"
        alt="Himalayan Ranges"
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', opacity: 0.45,
          animation: 'heroFloat 12s ease-in-out infinite',
        }}
      />

      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(17,24,39,0.95) 0%, rgba(17,24,39,0.4) 50%, rgba(17,24,39,0.2) 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 0%, rgba(17,24,39,0.6) 100%)' }} />

      <div style={{ position: 'relative', zIndex: 10, maxWidth: 900, padding: '0 24px', textAlign: 'center', width: '100%' }}>
        <div style={{ opacity: loaded ? 1 : 0, animation: loaded ? 'slideUpFade 0.6s ease forwards' : 'none' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(16,185,129,0.15)', color: '#6ee7b7',
            fontSize: 11, fontWeight: 800,
            padding: '6px 16px', borderRadius: 999,
            border: '1px solid rgba(110,231,183,0.3)',
            backdropFilter: 'blur(12px)',
            letterSpacing: '0.15em', textTransform: 'uppercase',
            marginBottom: 24, boxShadow: '0 0 20px rgba(16,185,129,0.15)',
          }}>
            🏔️ Himalayan Connect
          </span>
        </div>

        <div style={{ opacity: loaded ? 1 : 0, animation: loaded ? 'slideUpFade 0.7s ease 0.1s forwards' : 'none' }}>
          <h1 style={{
            fontSize: 'clamp(36px, 7vw, 72px)',
            fontWeight: 900, color: 'white',
            lineHeight: 1.1, letterSpacing: '-0.02em',
            marginBottom: 20,
          }}>
            From{' '}
            <span style={{
              background: 'linear-gradient(135deg, #34d399, #10b981, #059669)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'shimmer 3s linear infinite',
            }}>
              Himalayan Farms
            </span>
            <br />To Your Doorstep
          </h1>
        </div>

        <div style={{ opacity: loaded ? 1 : 0, animation: loaded ? 'slideUpFade 0.7s ease 0.2s forwards' : 'none' }}>
          <p style={{
            color: 'rgba(255,255,255,0.85)', fontSize: 'clamp(15px, 2vw, 19px)',
            maxWidth: 600, margin: '0 auto 32px',
            fontWeight: 500, lineHeight: 1.7,
          }}>
            Experience Uttarakhand's organic produce and eco-homestays.
            Support mountain farmers. Live the Himalayan way.
          </p>
        </div>

        <div style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
          gap: 12, marginBottom: 56,
          opacity: loaded ? 1 : 0,
          animation: loaded ? 'slideUpFade 0.7s ease 0.3s forwards' : 'none',
        }}>
          <a href="#produce" className="hero-btn-primary"
            style={{
              background: 'linear-gradient(135deg, #059669, #047857)',
              color: 'white', fontWeight: 700,
              padding: '14px 32px', borderRadius: 16,
              textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 8px 32px rgba(5,150,105,0.4)',
              transition: 'all 0.3s', fontSize: 15,
            }}
          >
            🌾 Shop Organic
          </a>
          <a href="#stays" className="hero-btn-secondary"
            style={{
              background: 'rgba(255,255,255,0.08)', color: 'white', fontWeight: 700,
              padding: '14px 32px', borderRadius: 16,
              textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8,
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.2)',
              transition: 'all 0.3s', fontSize: 15,
            }}
          >
            🏡 Book Homestay
          </a>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
          opacity: loaded ? 1 : 0,
          animation: loaded ? 'slideUpFade 0.7s ease 0.4s forwards' : 'none',
        }}>
          {STATS.map((stat, i) => (
            <div key={i} className="hero-stat-card"
              style={{
                background: 'rgba(255,255,255,0.07)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 16, padding: '16px 12px',
                transition: 'all 0.3s', cursor: 'default',
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 4 }}>{stat.icon}</div>
              <div style={{ color: '#34d399', fontWeight: 900, fontSize: 22 }}>{stat.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


const DashboardOverview = () => {
  const { darkMode } = useTheme();

  const CARDS = [
    { icon: FaChartLine, label: 'Active Orders', value: '₹24,850', color: '#10b981', bg: darkMode ? 'rgba(16,185,129,0.1)' : '#f0fdf4', border: darkMode ? 'rgba(16,185,129,0.25)' : '#bbf7d0' },
    { icon: FaShoppingBag, label: 'Product Sales', value: '42 Units', color: '#6366f1', bg: darkMode ? 'rgba(99,102,241,0.1)' : '#eef2ff', border: darkMode ? 'rgba(99,102,241,0.25)' : '#c7d2fe' },
    { icon: FaConciergeBell, label: 'Homestay Bookings', value: '7 Nights', color: '#f59e0b', bg: darkMode ? 'rgba(245,158,11,0.1)' : '#fffbeb', border: darkMode ? 'rgba(245,158,11,0.25)' : '#fde68a' },
    { icon: FaThLarge, label: 'Account Status', value: 'Verified ✓', color: '#10b981', bg: darkMode ? 'rgba(16,185,129,0.1)' : '#f0fdf4', border: darkMode ? 'rgba(16,185,129,0.25)' : '#bbf7d0' },
  ];

  return (
    <div style={{
      padding: 32, borderRadius: 28,
      background: darkMode ? '#1f2937' : 'white',
      border: `1px solid ${darkMode ? '#374151' : '#f3f4f6'}`,
      boxShadow: '0 4px 32px rgba(0,0,0,0.08)',
      transition: 'all 0.3s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <div style={{
          padding: 14, borderRadius: 18,
          background: 'linear-gradient(135deg, #059669, #0d9488)',
          color: 'white', fontSize: 24,
          boxShadow: '0 8px 20px rgba(5,150,105,0.25)',
        }}>
          <FaThLarge />
        </div>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: darkMode ? 'white' : '#111827', margin: 0, letterSpacing: '-0.02em' }}>
            Main Dashboard Overview
          </h1>
          <p style={{ margin: '4px 0 0', color: darkMode ? '#9ca3af' : '#6b7280', fontSize: 14, fontWeight: 500 }}>
            Verified local mountain ecosystem management panel
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
        {CARDS.map((card, i) => (
          <div key={i}
            style={{
              padding: 24, borderRadius: 20,
              background: card.bg,
              border: `1px solid ${card.border}`,
              transition: 'all 0.3s', cursor: 'default',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 16px 32px rgba(0,0,0,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <card.icon style={{ fontSize: 22, color: card.color, marginBottom: 12 }} />
            <p style={{ fontSize: 11, fontWeight: 700, color: card.color, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>
              {card.label}
            </p>
            <p style={{ fontSize: 22, fontWeight: 900, color: darkMode ? 'white' : '#111827', margin: 0 }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};


const DynamicLayout = ({ bannerImage, icon: Icon, title, subtitle, children }) => {
  const { darkMode } = useTheme();
  return (
    <div style={{ background: darkMode ? '#111827' : '#f9fafb', minHeight: '100vh' }}>
      <div style={{ width: '100%', height: 280, position: 'relative', overflow: 'hidden', background: '#111827' }}>
        <img src={bannerImage} alt={title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35, transform: 'scale(1.05)' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(17,24,39,0.92), rgba(17,24,39,0.4), transparent)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: '0 40px', maxWidth: 1200, margin: '0 auto', left: 0, right: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ padding: 16, borderRadius: 20, fontSize: 28, color: 'white', background: 'linear-gradient(135deg, #059669, #0d9488)', boxShadow: '0 8px 24px rgba(5,150,105,0.4)' }}>
              <Icon />
            </div>
            <div>
              <h1 style={{ fontSize: 'clamp(24px, 4vw, 44px)', fontWeight: 900, color: 'white', margin: 0, letterSpacing: '-0.02em' }}>{title}</h1>
              <p style={{ color: '#6ee7b7', fontSize: 15, margin: '6px 0 0', fontWeight: 500 }}>{subtitle}</p>
            </div>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px', position: 'relative', zIndex: 10, marginTop: -24 }}>
        {children}
      </div>
    </div>
  );
};


function ContactPage() {
  const { darkMode } = useTheme();
  const { addToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', bookingId: '', message: '' });
  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) { addToast('Please fill in all required fields', 'error'); return; }
    addToast('Support ticket submitted successfully', 'success');
    setForm({ name: '', email: '', bookingId: '', message: '' });
  };
  const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: 12, outline: 'none', fontSize: 14, transition: 'all 0.2s', boxSizing: 'border-box', background: darkMode ? '#374151' : '#f9fafb', border: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`, color: darkMode ? 'white' : '#111827' };
  return (
    <DynamicLayout bannerImage="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80" icon={FaHeadset} title="Customer Support Hub" subtitle="Get in touch with Mandakini Valley operators instantly">
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div style={{ background: darkMode ? '#1f2937' : 'white', borderRadius: 24, padding: 32, border: `1px solid ${darkMode ? '#374151' : '#f3f4f6'}`, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: darkMode ? 'white' : '#111827', margin: 0 }}>Send an Emergency Ticket</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <input type="text" placeholder="Your Name" value={form.name} onChange={handleChange('name')} style={inputStyle} />
            <input type="email" placeholder="Email Address" value={form.email} onChange={handleChange('email')} style={inputStyle} />
          </div>
          <input type="text" placeholder="Booking / Order ID" value={form.bookingId} onChange={handleChange('bookingId')} style={inputStyle} />
          <textarea rows={4} placeholder="Describe your issue..." value={form.message} onChange={handleChange('message')} style={{ ...inputStyle, resize: 'none' }} />
          <button onClick={handleSubmit}
            style={{ background: 'linear-gradient(135deg, #059669, #047857)', color: 'white', fontWeight: 700, padding: '14px 32px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 15, transition: 'all 0.2s', alignSelf: 'flex-start' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >Submit Ticket</button>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #111827, #1f2937)', borderRadius: 24, padding: 32, color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ color: '#34d399', fontSize: 18, fontWeight: 800, margin: '0 0 8px' }}>Direct Contacts</h3>
            <p style={{ color: '#9ca3af', fontSize: 13, lineHeight: 1.6, margin: 0 }}>Skip the queue and reach our active desk nodes natively.</p>
          </div>
          <div style={{ borderTop: '1px solid #374151', paddingTop: 20 }}>
            <p style={{ color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>Helpline</p>
            <p style={{ fontSize: 22, fontWeight: 900, background: 'linear-gradient(135deg, #34d399, #6ee7b7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 16px' }}>+91 93899 20016</p>
            <p style={{ color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>Support Mail</p>
            <p style={{ color: '#d1d5db', fontSize: 13, fontWeight: 600, margin: 0 }}>ankitrana125014@gmail.com</p>
          </div>
        </div>
      </div>
    </DynamicLayout>
  );
}


function SafetyPage() {
  const { darkMode } = useTheme();
  const SAFETY_ITEMS = [
    { icon: '🛡️', title: 'Verified Operators', desc: 'Every farm and homestay host goes through rigorous physical verification checkups.' },
    { icon: '🔒', title: 'Secure Escrows', desc: 'Transactions are safely routed without middlemen using secure payment protocols.' },
    { icon: '🚨', title: 'Emergency Response', desc: 'Direct coordination networks available near Chopta and all major trekking routes.' },
  ];
  return (
    <DynamicLayout bannerImage="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80" icon={FaShieldAlt} title="Safety & Security" subtitle="Ensuring verified community-led mountain initiatives">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {SAFETY_ITEMS.map((item) => (
          <div key={item.title}
            style={{ padding: 28, borderRadius: 20, background: darkMode ? '#1f2937' : 'white', border: `1px solid ${darkMode ? '#374151' : '#f3f4f6'}`, transition: 'all 0.3s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>{item.icon}</div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: darkMode ? 'white' : '#111827', margin: '0 0 8px' }}>{item.title}</h3>
            <p style={{ fontSize: 14, color: darkMode ? '#9ca3af' : '#6b7280', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
          </div>
        ))}
      </div>
    </DynamicLayout>
  );
}


function CancelBookingPage() {
  const { darkMode } = useTheme();
  const { addToast } = useToast();
  const [bookingId, setBookingId] = useState('');
  const handleCancel = () => {
    if (!bookingId) { addToast('Please enter a booking ID', 'error'); return; }
    addToast(`Cancellation requested for ${bookingId}`, 'success');
    setBookingId('');
  };
  return (
    <DynamicLayout bannerImage="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80" icon={FaTimesCircle} title="Cancel Your Booking" subtitle="Process smooth, zero-hassle cancellations instantly">
      <div style={{ maxWidth: 600, margin: '0 auto', background: darkMode ? '#1f2937' : 'white', borderRadius: 24, padding: 32, border: `1px solid ${darkMode ? '#374151' : '#f3f4f6'}`, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ padding: 20, borderRadius: 16, background: darkMode ? 'rgba(245,158,11,0.1)' : '#fffbeb', border: `1px solid ${darkMode ? 'rgba(245,158,11,0.3)' : '#fde68a'}` }}>
          <p style={{ fontWeight: 800, color: darkMode ? '#fcd34d' : '#92400e', margin: '0 0 4px' }}>⚠️ Cancellation Policy</p>
          <p style={{ fontSize: 13, color: darkMode ? '#fde68a' : '#78350f', margin: 0, lineHeight: 1.6 }}>Cancellations 48 hours before check-in get a 100% full refund automatically processed to source.</p>
        </div>
        <input type="text" placeholder="e.g. BKN-908123" value={bookingId} onChange={(e) => setBookingId(e.target.value)}
          style={{ padding: '12px 16px', borderRadius: 12, outline: 'none', fontSize: 14, background: darkMode ? '#374151' : '#f9fafb', border: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`, color: darkMode ? 'white' : '#111827' }}
        />
        <button onClick={handleCancel}
          style={{ width: '100%', padding: '14px', borderRadius: 12, background: '#dc2626', border: 'none', color: 'white', fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#b91c1c'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >Process Cancellation</button>
      </div>
    </DynamicLayout>
  );
}


function FAQPage() {
  const { darkMode } = useTheme();
  const [openIdx, setOpenIdx] = useState(null);
  const FAQ_ITEMS = [
    { q: 'How do I purchase raw organic produce?', a: 'Click the Contact Seller button on product cards to start a chat with the farmer directly through our platform.' },
    { q: 'Are homestays located near trekking routes?', a: 'Yes, our selected listings function as pristine base camps for Tungnath, Deoriatal, and Chopta treks.' },
    { q: 'How is product quality guaranteed?', a: 'Every product is verified by our local field team. Farmers must pass quality audits before listing.' },
    { q: 'Can I track my order from farm to delivery?', a: 'Yes! Use our AI Assistant to scan the QR code on your package and trace it back to the exact farm and farmer.' },
  ];
  return (
    <DynamicLayout bannerImage="https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=1200&q=80" icon={FaQuestionCircle} title="Guides & Knowledge Base" subtitle="Frequently asked questions about Himalayan eco-travel">
      <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {FAQ_ITEMS.map((faq, i) => (
          <div key={i}
            style={{ borderRadius: 16, background: darkMode ? '#1f2937' : 'white', border: `1px solid ${darkMode ? '#374151' : '#f3f4f6'}`, overflow: 'hidden', transition: 'all 0.3s' }}
          >
            <button onClick={() => setOpenIdx(openIdx === i ? null : i)}
              style={{ width: '100%', padding: '20px 24px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span style={{ fontSize: 15, fontWeight: 700, color: darkMode ? 'white' : '#111827' }}>{faq.q}</span>
              <span style={{ color: '#10b981', fontSize: 20, transition: 'transform 0.3s', transform: openIdx === i ? 'rotate(45deg)' : 'rotate(0)', display: 'inline-block' }}>+</span>
            </button>
            {openIdx === i && (
              <div style={{ padding: '0 24px 20px' }}>
                <p style={{ fontSize: 14, color: darkMode ? '#9ca3af' : '#6b7280', lineHeight: 1.7, margin: 0 }}>{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </DynamicLayout>
  );
}


function AccessibilityPage() {
  const { darkMode } = useTheme();
  return (
    <DynamicLayout bannerImage="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80" icon={FaUniversalAccess} title="Accessibility" subtitle="Digital standardization access logs">
      <div style={{ maxWidth: 700, margin: '0 auto', padding: 32, borderRadius: 24, background: darkMode ? '#1f2937' : 'white', border: `1px solid ${darkMode ? '#374151' : '#f3f4f6'}` }}>
        <p style={{ fontSize: 15, color: darkMode ? '#d1d5db' : '#374151', lineHeight: 1.8, margin: 0 }}>
          Himalayan Connect follows standard semantic markup and WCAG guidelines so the platform stays usable across screen readers, keyboards and assistive devices.
        </p>
      </div>
    </DynamicLayout>
  );
}


function GrievancePage() {
  const { darkMode } = useTheme();
  return (
    <DynamicLayout bannerImage="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80" icon={FaUserCheck} title="Grievance Redressal" subtitle="Legal liaison nodes">
      <div style={{ maxWidth: 500, margin: '0 auto', padding: 32, borderRadius: 24, background: darkMode ? '#1f2937' : 'white', border: `1px solid ${darkMode ? '#374151' : '#f3f4f6'}`, textAlign: 'center' }}>
        <p style={{ fontSize: 15, color: darkMode ? '#d1d5db' : '#6b7280', lineHeight: 1.7, margin: '0 0 12px' }}>Forward complaints against any farmer, homestay host or order directly to our grievance desk:</p>
        <p style={{ color: '#10b981', fontWeight: 800, fontSize: 18, margin: 0 }}>ankitrana125014@gmail.com</p>
      </div>
    </DynamicLayout>
  );
}


function FarmerPartnerPage() {
  const { darkMode } = useTheme();
  return (
    <DynamicLayout bannerImage="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=80" icon={FaSeedling} title="Register as Farmer" subtitle="Sell directly without intermediaries">
      <div style={{ maxWidth: 600, margin: '0 auto', padding: 32, borderRadius: 24, background: darkMode ? '#1f2937' : 'white', border: `1px solid ${darkMode ? '#374151' : '#f3f4f6'}`, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🌱</div>
        <p style={{ fontSize: 15, color: darkMode ? '#d1d5db' : '#374151', lineHeight: 1.8, margin: 0 }}>
          Onboarding requires Aadhaar based identity verification along with farm location and produce details before your listings go live.
        </p>
      </div>
    </DynamicLayout>
  );
}


function HomestayPartnerPage() {
  const { darkMode } = useTheme();
  return (
    <DynamicLayout bannerImage="https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80" icon={FaHome} title="List Your Homestay" subtitle="Onboard village infrastructure properties">
      <div style={{ maxWidth: 600, margin: '0 auto', padding: 32, borderRadius: 24, background: darkMode ? '#1f2937' : 'white', border: `1px solid ${darkMode ? '#374151' : '#f3f4f6'}`, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🏡</div>
        <p style={{ fontSize: 15, color: darkMode ? '#d1d5db' : '#374151', lineHeight: 1.8, margin: 0 }}>
          Submit your Aadhaar verification, property location and room details to get your homestay listed for bookings.
        </p>
      </div>
    </DynamicLayout>
  );
}


function PartnerLoginPage() {
  const { darkMode } = useTheme();
  const { addToast } = useToast();
  const [accessCode, setAccessCode] = useState('');
  const handleLogin = () => {
    if (!accessCode) { addToast('Enter your access code', 'error'); return; }
    addToast('Verifying access code...', 'info');
  };
  return (
    <DynamicLayout bannerImage="https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80" icon={FaUserFriends} title="Partner Login" subtitle="Extranet secure authentication panel">
      <div style={{ maxWidth: 360, margin: '0 auto', padding: 32, borderRadius: 24, background: darkMode ? '#1f2937' : 'white', border: `1px solid ${darkMode ? '#374151' : '#f3f4f6'}`, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <input type="text" placeholder="Access Code" value={accessCode} onChange={(e) => setAccessCode(e.target.value)}
          style={{ padding: '12px 16px', borderRadius: 12, outline: 'none', fontSize: 14, background: darkMode ? '#374151' : '#f9fafb', border: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`, color: darkMode ? 'white' : '#111827' }}
        />
        <button onClick={handleLogin}
          style={{ padding: '12px', borderRadius: 12, background: 'linear-gradient(135deg, #1f2937, #111827)', border: 'none', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >Login</button>
      </div>
    </DynamicLayout>
  );
}


function AffiliatePage() {
  const { darkMode } = useTheme();
  return (
    <DynamicLayout bannerImage="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80" icon={FaHandshake} title="Affiliate Program" subtitle="Earn through sustainable references">
      <div style={{ maxWidth: 600, margin: '0 auto', padding: 32, borderRadius: 24, background: darkMode ? '#1f2937' : 'white', border: `1px solid ${darkMode ? '#374151' : '#f3f4f6'}`, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🤝</div>
        <p style={{ fontSize: 15, color: darkMode ? '#d1d5db' : '#374151', lineHeight: 1.8, margin: 0 }}>
          Earn localized tracking incentives by promoting rural sustainable tourism references back to validated agricultural clusters.
        </p>
      </div>
    </DynamicLayout>
  );
}


function AppContent() {
  const { darkMode } = useTheme();

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', minHeight: '100vh',
      background: darkMode ? '#111827' : '#f9fafb',
      WebkitFontSmoothing: 'antialiased',
    }}>
      <ScrollToTop />
      <Navbar />

      <ReactToastNotifications
        position="top-right"
        autoClose={3000}
        theme={darkMode ? 'dark' : 'light'}
        toastStyle={{ borderRadius: 16, fontWeight: 600 }}
      />

      <ThemeToggle className="fixed bottom-6 left-6 z-40 bg-surface dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700" />

      <ScrollToTopButton />
      <AIFloatingButton />

      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={
            <div style={{ width: '100%' }}>
              <HeroSection />
              <div style={{ maxWidth: 1280, margin: '0 auto', padding: '64px 24px', display: 'flex', flexDirection: 'column', gap: 80 }}>
                <DashboardOverview />
                <div id="produce" style={{ scrollMarginTop: 96 }}>
                  <Products />
                </div>
                <hr style={{ border: 'none', borderTop: `1px solid ${darkMode ? 'rgba(55,65,81,0.6)' : 'rgba(229,231,235,0.6)'}` }} />
                <div id="stays" style={{ scrollMarginTop: 96 }}>
                  <Homestays />
                </div>
              </div>
            </div>
          } />

          <Route path="/ai-assistant" element={<HimalayanAIPage />} />
          <Route path="/login" element={<div style={{ paddingTop: 64 }}><Login /></div>} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />
          <Route path="/register" element={<div style={{ paddingTop: 64 }}><Register /></div>} />
          <Route path="/farmer/dashboard" element={<PrivateRoute><FarmerDashboard /></PrivateRoute>} />
          <Route path="/homestay/dashboard" element={<PrivateRoute><HomestayDashboard /></PrivateRoute>} />
          <Route path="/homestay/add-listing" element={<PrivateRoute><div style={{ maxWidth: 900, margin: '0 auto', padding: '96px 24px 48px' }}><AddHomestay /></div></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><CustomerDashboard /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
          <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
          <Route path="/products" element={<div style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 24px 48px' }}><Products /></div>} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/homestays" element={<div style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 24px 48px' }}><Homestays /></div>} />
          <Route path="/booking/:id" element={
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 24px 48px' }}>
              <PrivateRoute><BookingPage /></PrivateRoute>
            </div>
          } />
          <Route path="/booking/confirmation/:id" element={
            <div style={{ paddingTop: 64 }}><PrivateRoute><BookingConfirmation /></PrivateRoute></div>
          } />
          <Route path="/checkout/product/:id" element={
            <div style={{ paddingTop: 64 }}><PrivateRoute><ProductCheckout /></PrivateRoute></div>
          } />
          <Route path="/profile/:id" element={<SellerProfile />} />
          <Route path="/support/contact" element={<ContactPage />} />
          <Route path="/support/safety" element={<SafetyPage />} />
          <Route path="/support/cancel" element={<CancelBookingPage />} />
          <Route path="/support/faq" element={<FAQPage />} />
          <Route path="/terms/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms/service" element={<TermsAndConditions />} />
          <Route path="/terms/accessibility" element={<AccessibilityPage />} />
          <Route path="/terms/grievance" element={<GrievancePage />} />
          <Route path="/partners/farmer" element={<FarmerPartnerPage />} />
          <Route path="/partners/list-homestay" element={<HomestayPartnerPage />} />
          <Route path="/partners/login" element={<PartnerLoginPage />} />
          <Route path="/partners/affiliate" element={<AffiliatePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}


function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <PageLoader />
              <AppContent />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;