import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { generateAIResponse, WELCOME_TEXT } from '../../utils/ai-engine';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import ChatInterface from './ChatInterface';
import FarmerDashboard from './FarmerDashboard';
import HomestayDashboard from './HomestayDashboard';
import CustomerView from './CustomerView';

// Maps a backend account role to the AI's internal role key.
// Every logged-in user gets exactly ONE assistant that matches their account —
// they never see the other roles' assistants.
const mapAccountRoleToAIRole = (accountRole) => {
  if (accountRole === 'farmer') return 'farmer';
  if (accountRole === 'homestay_owner' || accountRole === 'homestay') return 'homestay';
  if (accountRole === 'customer') return 'user';
  return null;
};

// ============================================
// CONSTANTS
// ============================================
const mkId = () => Math.random().toString(36).slice(2, 10);

const ROLE_TABS = {
  farmer: [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'chat', label: 'AI Chat', icon: '💬' },
    { id: 'valueadd', label: 'Value-Add', icon: '🏭' },
    { id: 'market', label: 'Market', icon: '📈' },
  ],
  homestay: [
    { id: 'chat', label: 'AI Chat', icon: '💬' },
    { id: 'recipes', label: 'Recipes', icon: '🍽️' },
    { id: 'products', label: 'Products', icon: '🛒' },
  ],
  user: [
    { id: 'chat', label: 'AI Chat', icon: '💬' },
    { id: 'recipes', label: 'Recipes', icon: '🍽️' },
    { id: 'products', label: 'Products', icon: '🛒' },
  ],
  guest: [
    { id: 'chat', label: 'AI Chat', icon: '💬' },
  ],
};

const ROLE_INFO = {
  farmer: {
    label: 'Farmer', emoji: '👨‍🌾',
    desc: 'Grow, process & profit',
    features: ['📊 Dashboard + Live Weather', '🌱 AI Crop Advisor (what & when to grow)', '📈 Market Analysis & Profit/Loss', '🏭 Value-Addition Calculator'],
  },
  homestay: {
    label: 'Homestay / Hotel', emoji: '🏡',
    desc: 'Price smart, source direct',
    features: ['💲 Room Pricing vs OYO/MakeMyTrip', '🍽️ AI Organic Menu Planner', '💰 Farmer vs Market Price Compare', '📊 Guest Preference Analytics'],
  },
  user: {
    label: 'Seeking Rooms / Products (Customer)', emoji: '🛍️',
    desc: 'Trace it back to the farm',
    features: ['🏡 AI Room Recommendations', '🌿 Organic vs Market Comparison', '🔍 Farm-to-Fork Traceability', '🍽️ 21 Authentic Recipes'],
  },
  guest: {
    label: 'Guest Assistant', emoji: '💬',
    desc: 'A quick, limited helper — log in for the full experience',
    features: ['🔍 Basic product & homestay search', '❓ General questions about Himalayan Connect', '🔐 Login to unlock your personal AI'],
  },
};

// ============================================
// MAIN APP
// ============================================
const freshChat = () => [
  { id: mkId(), type: 'bot', text: WELCOME_TEXT, timestamp: new Date() },
];

export default function HimalayanAI() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [minimized, setMinimized] = useState(false);
  // Role is derived automatically from the logged-in account — never chosen manually.
  // Farmers only ever see the Farmer assistant, homestay owners only see the Homestay
  // assistant, and customers only see the Customer assistant. Anyone browsing without
  // an account gets a single, limited "guest" assistant that nudges them to log in.
  const accountRole = mapAccountRoleToAIRole(user?.role);
  const [role, setRole] = useState(accountRole || (user ? null : 'guest'));
  const [activeTab, setActiveTab] = useState('chat');
  // Per-role chat history — each role keeps its own chat.
  // In-memory only: clears automatically on page refresh/close (as required).
  const [chats, setChats] = useState({
    farmer: freshChat(),
    homestay: freshChat(),
    user: freshChat(),
    guest: freshChat(),
  });

  // Whenever the logged-in account (or its role) changes, re-sync the assistant's
  // role automatically — no card-picker is ever shown to a logged-in user.
  useEffect(() => {
    if (user) {
      const mapped = mapAccountRoleToAIRole(user.role);
      setRole(mapped || 'guest');
    } else {
      setRole('guest');
    }
  }, [user]);
  const messages = role ? chats[role] : [];
  const setMessages = useCallback(
    (updater) => {
      setChats((prev) => {
        const r = role ?? 'user';
        const next = typeof updater === 'function' ? updater(prev[r]) : updater;
        return { ...prev, [r]: next };
      });
    },
    [role]
  );
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [traceOpen, setTraceOpen] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }, []);

  const selectRole = (r) => {
    setRole(r);
    setActiveTab(r === 'farmer' ? 'dashboard' : 'chat');
    showToast(`${ROLE_INFO[r].emoji} Welcome, ${ROLE_INFO[r].label}!`);
  };

  const handleBuyNow = useCallback(
    (product) => {
      showToast(`🎉 ${product.name} added to order!`);
      setMessages((prev) => [
        ...prev,
        {
          id: mkId(), type: 'bot',
          text:
            `✅ **Order Request Placed!**\n\n${product.emoji} **${product.name}**\n💰 Price: ${product.price}/${product.unit}\n📍 From: ${product.region}\n\n` +
            `Our team will contact you shortly to confirm delivery details.\n\n📞 For instant confirmation call: **1800-180-1551** (Toll-Free)`,
          timestamp: new Date(),
        },
      ]);
      setActiveTab('chat');
    },
    [showToast, setMessages]
  );

  const sendQuery = useCallback(
    (textOverride) => {
      const userMessage = (textOverride ?? query).trim();
      if (!userMessage || loading) return;
      const currentMessages = chats[role ?? 'guest'] || [];
      setMessages((prev) => [...prev, { id: mkId(), type: 'user', text: userMessage, timestamp: new Date() }]);
      setQuery('');
      if (inputRef.current) inputRef.current.style.height = 'auto';
      setLoading(true);

      // Small delay so the instant local-engine answers still feel like a
      // "thinking" beat rather than an abrupt flash.
      setTimeout(async () => {
        const local = generateAIResponse(userMessage, role ?? 'user');

        // The local rule engine knows the answer — respond instantly, no
        // network call needed at all.
        if (!local.isFallback) {
          setMessages((prev) => [
            ...prev,
            { id: mkId(), type: 'bot', text: local.text, timestamp: new Date(), recipe: local.recipe, products: local.products },
          ]);
          setLoading(false);
          setTimeout(() => inputRef.current?.focus(), 100);
          return;
        }

        // No specific local answer — escalate to the real AI backend
        // (Week 7 feature). Loading stays true for the whole round trip.
        try {
          const { data } = await api.post('/ai/assistant', {
            message: userMessage,
            role: role ?? 'guest',
            history: currentMessages.slice(-6).map((m) => ({ type: m.type, text: m.text })),
          });

          setMessages((prev) => [
            ...prev,
            { id: mkId(), type: 'bot', text: data.data.text, timestamp: new Date() },
          ]);
        } catch (err) {
          // Never leave the user stuck: fall back to the local generic
          // message, and surface a toast explaining what happened.
          const code = err?.response?.data?.code;
          const friendly =
            code === 'AI_NOT_CONFIGURED' ? '🤖 The AI assistant isn\'t fully set up yet on this server.' :
            code === 'AI_RATE_LIMITED' ? '⏳ The AI is a little busy right now — try again in a moment.' :
            code === 'AI_TIMEOUT' ? '⏱️ That took too long — please try again.' :
            '⚠️ Could not reach the AI assistant right now.';
          showToast(friendly);
          setMessages((prev) => [...prev, { id: mkId(), type: 'bot', text: local.text, timestamp: new Date() }]);
        } finally {
          setLoading(false);
          setTimeout(() => inputRef.current?.focus(), 100);
        }
      }, 500);
    },
    [query, loading, role, setMessages, chats, showToast]
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendQuery();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: mkId(), type: 'bot',
        text: '🔄 **Chat cleared!**\n\nYour Pahadi Mitra is ready for new questions!\n\n📞 Agri Helpline: 1800-180-1551 (Toll-Free)',
        timestamp: new Date(),
      },
    ]);
    showToast('✅ Chat cleared!');
  };

  const openRecipeInChat = (recipeName) => {
    setActiveTab('chat');
    sendQuery(`${recipeName} recipe`);
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const card = 'bg-white/[0.03] border border-white/10 rounded-2xl';

  // ============================================
  // ROLE SELECTION SCREEN
  // ============================================
  if (!role) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-emerald-950 flex items-center justify-center p-6 font-sans">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-600/20 blur-3xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 15, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-600/15 blur-3xl"
            animate={{ scale: [1.2, 1, 1.2] }}
            transition={{ duration: 18, repeat: Infinity }}
          />
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-4xl w-full">
          <div className="text-center mb-10">
            <motion.div
              className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-4xl shadow-2xl shadow-emerald-500/40 mb-5"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🏔️
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Pahadi Mitra <span className="text-emerald-400">AI</span>
            </h1>
            <p className="text-gray-400 mt-2 text-sm">
              AI-Based Distribution System • Himalayan Connect • Uttarakhand
            </p>
            <p className="text-gray-500 mt-1 text-xs">
              Using as guest? Tell us who you are — EN | हिंदी | Hinglish supported
            </p>
            <p className="text-emerald-500/80 mt-2 text-[11px] font-semibold">
              💡 Logged-in users on Himalayan Connect get their role auto-detected from their account
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {Object.keys(ROLE_INFO).map((r, i) => (
              <motion.button
                key={r}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.1 }}
                whileHover={{ y: -8, scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => selectRole(r)}
                className="bg-white/[0.04] border border-white/10 rounded-3xl p-6 text-left hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10 transition-colors group"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform origin-left">
                  {ROLE_INFO[r].emoji}
                </div>
                <h3 className="text-lg font-bold text-white">{ROLE_INFO[r].label}</h3>
                <p className="text-emerald-400 text-xs font-semibold mb-4">{ROLE_INFO[r].desc}</p>
                <ul className="space-y-1.5">
                  {ROLE_INFO[r].features.map((f) => (
                    <li key={f} className="text-[11px] text-gray-400">{f}</li>
                  ))}
                </ul>
                <div className="mt-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white text-center text-sm font-bold shadow-lg shadow-emerald-500/25">
                  Continue →
                </div>
              </motion.button>
            ))}
          </div>

          <p className="text-center text-[10px] text-gray-600 mt-8">
            📞 Agri Helpline: <span className="text-emerald-500 font-bold">1800-180-1551</span> (Toll-Free) | Code: 1551
          </p>
        </motion.div>
      </div>
    );
  }

  // ============================================
  // MINIMIZED (small floating bubble to restore)
  // ============================================
  if (minimized) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setMinimized(false)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 pl-3 pr-5 py-3 rounded-full bg-gradient-to-br from-gray-900 to-emerald-950 border border-emerald-500/40 shadow-2xl shadow-emerald-500/20"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-lg shadow-lg shadow-emerald-500/30">
          🏔️
        </div>
        <span className="text-sm font-bold text-white">Pahadi Mitra AI</span>
        <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
          ▲
        </span>
      </motion.button>
    );
  }

  // ============================================
  // MAIN APP (role selected)
  // ============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-emerald-950 font-sans">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-600/20 blur-3xl"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-600/15 blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-3 md:inset-6 lg:inset-8 bg-white/[0.03] backdrop-blur-xl rounded-3xl shadow-2xl flex flex-col z-40 overflow-hidden border border-white/10"
      >
        {/* Header */}
        <header className="border-b border-white/10 px-5 py-3.5 flex items-center justify-between bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-3">
            <motion.div className="relative" whileHover={{ scale: 1.1 }}>
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-xl shadow-lg shadow-emerald-500/30">
                🏔️
              </div>
              <motion.div
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-gray-900"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Pahadi Mitra
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                  AI LIVE
                </span>
              </h1>
              <p className="text-[11px] text-gray-400">
                {ROLE_INFO[role].emoji} {ROLE_INFO[role].label} Mode • EN | हिंदी | Hinglish
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearChat}
              title="Clear chat"
              className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 transition-colors text-red-400 text-sm"
            >
              🗑️
            </button>
            <button
              onClick={() => setMinimized(true)}
              title="Minimize"
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 transition-colors text-gray-300 text-sm"
            >
              ─
            </button>
            <button
              onClick={() => navigate('/')}
              title="Close"
              className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 transition-colors text-gray-300 hover:text-red-400 text-sm"
            >
              ✕
            </button>
          </div>
        </header>

        {/* Role-based Tabs */}
        <div className="flex gap-1 p-1.5 mx-5 mt-3 mb-1 rounded-xl w-fit bg-white/[0.04] shrink-0 overflow-x-auto">
          {ROLE_TABS[role].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {role === 'farmer' && (activeTab === 'dashboard' || activeTab === 'valueadd' || activeTab === 'market') && (
            <FarmerDashboard activeTab={activeTab} setActiveTab={setActiveTab} card={card} />
          )}

          {activeTab === 'chat' && (
            <ChatInterface
              role={role}
              card={card}
              messages={messages}
              loading={loading}
              query={query}
              setQuery={setQuery}
              sendQuery={sendQuery}
              handleKeyDown={handleKeyDown}
              formatTime={formatTime}
              messagesEndRef={messagesEndRef}
              inputRef={inputRef}
              traceOpen={traceOpen}
              setTraceOpen={setTraceOpen}
              handleBuyNow={handleBuyNow}
            />
          )}

          {role === 'homestay' && (activeTab === 'recipes' || activeTab === 'products') && (
            <HomestayDashboard
              activeTab={activeTab}
              card={card}
              openRecipeInChat={openRecipeInChat}
              role={role}
              traceOpen={traceOpen}
              setTraceOpen={setTraceOpen}
              handleBuyNow={handleBuyNow}
            />
          )}

          {role === 'user' && (activeTab === 'recipes' || activeTab === 'products') && (
            <CustomerView
              activeTab={activeTab}
              card={card}
              openRecipeInChat={openRecipeInChat}
              role={role}
              traceOpen={traceOpen}
              setTraceOpen={setTraceOpen}
              handleBuyNow={handleBuyNow}
            />
          )}
        </div>
      </motion.div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-gray-900/95 border border-emerald-500/40 text-white text-sm font-bold shadow-2xl shadow-emerald-500/20 backdrop-blur-xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16,185,129,0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16,185,129,0.5); }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
}
