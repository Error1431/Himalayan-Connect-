import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RECIPES } from './recipes';
import { PRODUCTS, PRODUCT_CATEGORIES, type Product } from './products';
import { generateAIResponse, WELCOME_TEXT } from './ai';
import {
  VALUE_PRODUCTS, calcProfit, calcMargin,
  WEATHER_DATA, MARKET_NEEDS, getTrace, getB2BPricing,
} from './valueadd';

// ============================================
// TYPES
// ============================================
type Role = 'farmer' | 'homestay' | 'user';
type TabId = 'dashboard' | 'chat' | 'valueadd' | 'market' | 'recipes' | 'products';

interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
  recipe?: boolean;
  products?: Product[];
}

const mkId = () => Math.random().toString(36).slice(2, 10);

const CATEGORY_EMOJI: Record<string, string> = {
  Fruits: '🍎', Grains: '🌾', Pulses: '🫘', Specialty: '🍯', Homestays: '🏡',
};

const ROLE_TABS: Record<Role, { id: TabId; label: string; icon: string }[]> = {
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
};

const ROLE_INFO: Record<Role, { label: string; emoji: string; desc: string; features: string[] }> = {
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
};

// ============================================
// MAIN APP
// ============================================
const freshChat = (): Message[] => [
  { id: mkId(), type: 'bot', text: WELCOME_TEXT, timestamp: new Date() },
];

export default function App() {
  const [role, setRole] = useState<Role | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('chat');
  // Per-role chat history — each role keeps its own chat.
  // In-memory only: clears automatically on page refresh/close (as required).
  const [chats, setChats] = useState<Record<Role, Message[]>>({
    farmer: freshChat(),
    homestay: freshChat(),
    user: freshChat(),
  });
  const messages = role ? chats[role] : [];
  const setMessages = useCallback(
    (updater: Message[] | ((prev: Message[]) => Message[])) => {
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
  const [toast, setToast] = useState<string | null>(null);
  const [weatherIdx, setWeatherIdx] = useState(0);
  const [traceOpen, setTraceOpen] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }, []);

  const selectRole = (r: Role) => {
    setRole(r);
    setActiveTab(r === 'farmer' ? 'dashboard' : 'chat');
    showToast(`${ROLE_INFO[r].emoji} Welcome, ${ROLE_INFO[r].label}!`);
  };

  const handleBuyNow = useCallback(
    (product: Product) => {
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
    (textOverride?: string) => {
      const userMessage = (textOverride ?? query).trim();
      if (!userMessage || loading) return;
      setMessages((prev) => [...prev, { id: mkId(), type: 'user', text: userMessage, timestamp: new Date() }]);
      setQuery('');
      if (inputRef.current) inputRef.current.style.height = 'auto';
      // role is captured in closure below
      setLoading(true);
      setTimeout(() => {
        const ai = generateAIResponse(userMessage, role ?? 'user');
        setMessages((prev) => [
          ...prev,
          { id: mkId(), type: 'bot', text: ai.text, timestamp: new Date(), recipe: ai.recipe, products: ai.products },
        ]);
        setLoading(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }, 700);
    },
    [query, loading, role, setMessages]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
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

  const openRecipeInChat = (recipeName: string) => {
    setActiveTab('chat');
    sendQuery(`${recipeName} recipe`);
  };

  const formatTime = (date: Date) =>
    new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const card = 'bg-white/[0.03] border border-white/10 rounded-2xl';

  // ---------- Product card (role-aware) ----------
  const ProductCard = ({ product, compact = false }: { product: Product; compact?: boolean }) => {
    const b2b = getB2BPricing(product.priceValue);
    const trace = getTrace(product.id, product.region);
    const isTraceOpen = traceOpen === product.id;

    return (
      <motion.div
        whileHover={{ y: -3 }}
        className={`${card} ${compact ? 'p-3' : 'p-4'} hover:border-emerald-500/40 transition-colors flex flex-col`}
      >
        <div className="flex items-start justify-between">
          <span className={compact ? 'text-2xl' : 'text-3xl'}>{product.emoji}</span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold uppercase">
            {product.category}
          </span>
        </div>
        <h4 className={`font-bold text-white ${compact ? 'text-xs' : 'text-sm'} mt-2`}>{product.name}</h4>
        <p className="text-gray-500 text-[10px]">{product.region}</p>

        {/* HOMESTAY: B2B price comparison */}
        {role === 'homestay' && !compact && (
          <div className="mt-2 p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-400">🌾 Direct from farmer:</span>
              <span className="text-emerald-400 font-bold">₹{b2b.farmerPrice}/{product.unit}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-400">🏪 City market rate:</span>
              <span className="text-rose-400 font-bold line-through">₹{b2b.marketPrice}/{product.unit}</span>
            </div>
            <div className="flex justify-between text-[10px] pt-1 border-t border-white/10">
              <span className="text-indigo-300 font-bold">💰 You save:</span>
              <span className="text-indigo-300 font-black">₹{b2b.saving} ({b2b.savingPct}%)</span>
            </div>
          </div>
        )}

        {/* USER: USP + traceability */}
        {role === 'user' && !compact && (
          <>
            <p className="text-gray-400 text-[10px] mt-1.5 flex-1">✨ {product.whyBuy}</p>
            <button
              onClick={() => setTraceOpen(isTraceOpen ? null : product.id)}
              className="mt-2 text-[10px] text-teal-400 font-bold text-left flex items-center gap-1"
            >
              🔍 {isTraceOpen ? 'Hide' : 'Trace to Farm'} {isTraceOpen ? '▲' : '▼'}
            </button>
            <AnimatePresence>
              {isTraceOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 p-2.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-[10px] space-y-1">
                    <p className="text-white font-bold">👨‍🌾 {trace.farmer}</p>
                    <p className="text-gray-400">📍 {trace.village}, {trace.district}</p>
                    <p className="text-gray-400">⛰️ Altitude: {trace.altitude} | 🗓️ {trace.harvest}</p>
                    <p className="text-teal-300">🌱 {trace.method}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {(role === 'farmer' || compact) && !((role === 'user' || role === 'homestay') && !compact) && (
          <p className="text-gray-400 text-[10px] mt-1.5 flex-1">{compact ? '' : product.whyBuy}</p>
        )}

        <div className="flex items-center justify-between gap-2 mt-3">
          <span className="text-emerald-400 font-black text-sm">
            {product.price}
            <span className="text-[9px] text-gray-500 font-medium">/{product.unit}</span>
          </span>
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => handleBuyNow(product)}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white text-[10px] font-bold shadow-lg shadow-emerald-500/25 whitespace-nowrap"
          >
            🛒 {role === 'homestay' ? 'Bulk Order' : 'Buy Now'}
          </motion.button>
        </div>
      </motion.div>
    );
  };

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
            {(Object.keys(ROLE_INFO) as Role[]).map((r, i) => (
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

  const weather = WEATHER_DATA[weatherIdx];

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
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setRole(null)}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3.5 py-2 text-[11px] font-bold text-emerald-400 hover:bg-emerald-500/25 hover:border-emerald-400 shadow-lg shadow-emerald-500/10 transition-colors whitespace-nowrap"
            >
              🔄 <span className="hidden xs:inline sm:inline">Switch Role</span><span className="inline xs:hidden sm:hidden">Role</span>
            </motion.button>
            <button
              onClick={clearChat}
              title="Clear chat"
              className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 transition-colors text-red-400 text-sm"
            >
              🗑️
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
          {/* ============ FARMER: DASHBOARD ============ */}
          {activeTab === 'dashboard' && role === 'farmer' && (
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-5">
              {/* Weather widget */}
              <div className={`${card} p-5`}>
                <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    🌤️ Live Weather <span className="text-[10px] text-gray-500 font-medium">(Geo-based)</span>
                  </h3>
                  <div className="flex gap-1.5 flex-wrap">
                    {WEATHER_DATA.map((w, i) => (
                      <button
                        key={w.district}
                        onClick={() => setWeatherIdx(i)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                          weatherIdx === i
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-white/5 text-gray-500 border border-transparent hover:text-gray-300'
                        }`}
                      >
                        {w.district}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-6xl">{weather.now.icon}</span>
                    <div>
                      <p className="text-4xl font-black text-white">{weather.now.temp}°C</p>
                      <p className="text-xs text-gray-400">{weather.now.condition}</p>
                      <p className="text-[10px] text-gray-500">
                        {weather.district} • {weather.altitude} • Feels {weather.now.feels}°
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-around md:border-x border-white/10">
                    <div className="text-center">
                      <p className="text-lg font-bold text-white">💧 {weather.now.humidity}%</p>
                      <p className="text-[10px] text-gray-500">Humidity</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-white">💨 {weather.now.wind}</p>
                      <p className="text-[10px] text-gray-500">km/h Wind</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-around">
                    {weather.forecast.map((f) => (
                      <div key={f.day} className="text-center">
                        <p className="text-[10px] text-gray-500 font-bold">{f.day}</p>
                        <p className="text-xl my-1">{f.icon}</p>
                        <p className="text-[10px] text-gray-300 font-semibold">{f.temp}</p>
                        <p className="text-[9px] text-blue-400">💧{f.rain}%</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                    🤖 AI Farm Advisory
                  </p>
                  <p className="text-xs text-gray-300 leading-relaxed">{weather.advisory}</p>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: 'This Month Income', value: '₹34,500', change: '+18%', emoji: '💰' },
                  { label: 'Orders Pending', value: '12', change: '+3 new', emoji: '📦' },
                  { label: 'Best Seller', value: 'Rajma', change: '92 kg sold', emoji: '🫘' },
                  { label: 'Value-Add Profit', value: '₹12,800', change: '+42%', emoji: '🏭' },
                ].map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className={`${card} p-4`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-2xl">{s.emoji}</span>
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        {s.change}
                      </span>
                    </div>
                    <p className="text-xl font-black text-white">{s.value}</p>
                    <p className="text-[10px] text-gray-500">{s.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Market needs preview */}
              <div className={`${card} p-5`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-white">📈 What the Market Needs Right Now</h3>
                  <button
                    onClick={() => setActiveTab('market')}
                    className="text-xs text-emerald-400 font-bold"
                  >
                    Full Analysis →
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {MARKET_NEEDS.slice(0, 4).map((m) => (
                    <div key={m.product} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <span className="text-2xl">{m.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-white">{m.product}</p>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-black ${
                            m.demand === 'Very High' ? 'bg-rose-500/20 text-rose-400' :
                            m.demand === 'High' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {m.demand.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5">{m.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============ FARMER: VALUE-ADD ============ */}
          {activeTab === 'valueadd' && role === 'farmer' && (
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
              <div className={`${card} p-4 mb-5 bg-gradient-to-r from-emerald-900/20 to-teal-900/10`}>
                <p className="text-sm font-bold text-white">🏭 AI Value-Addition Calculator</p>
                <p className="text-[11px] text-gray-400 mt-1">
                  Convert your raw crops into products — the AI quantifies raw material, conversion cost, shelf life, expected market price and your profit. Special items (⭐) have the highest demand!
                </p>
              </div>

              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {VALUE_PRODUCTS.map((v, i) => {
                  const profit = calcProfit(v);
                  const margin = calcMargin(v);
                  return (
                    <motion.div
                      key={v.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.04 * i }}
                      whileHover={{ y: -4 }}
                      className={`${card} p-4 flex flex-col ${v.special ? 'border-amber-500/30 bg-gradient-to-b from-amber-900/10 to-transparent' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-3xl">{v.emoji}</span>
                        {v.special && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-black">
                            ⭐ SPECIAL
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-white text-sm">{v.name}</h4>
                      <p className="text-[10px] text-emerald-400/80 font-semibold mb-2">Base: {v.baseCrop}</p>

                      <div className="space-y-1.5 text-[10px] flex-1">
                        <div className="flex justify-between">
                          <span className="text-gray-500">📦 Raw material:</span>
                          <span className="text-gray-300 text-right max-w-[55%]">{v.rawMaterial}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">💵 Raw cost:</span>
                          <span className="text-gray-300">₹{v.rawCost}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">⚙️ Conversion cost:</span>
                          <span className="text-gray-300">₹{v.conversionCost}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">📤 Output:</span>
                          <span className="text-gray-300 text-right max-w-[55%]">{v.outputYield}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">🕒 Shelf life:</span>
                          <span className="text-blue-300 font-semibold">{v.shelfLife}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">🏷️ Market price:</span>
                          <span className="text-white font-bold">₹{v.marketPrice}/{v.unit}</span>
                        </div>
                      </div>

                      <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between">
                        <div>
                          <p className="text-[9px] text-gray-400 uppercase font-bold">Your Profit</p>
                          <p className="text-lg font-black text-emerald-400">₹{profit}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] text-gray-400 uppercase font-bold">Margin</p>
                          <p className="text-lg font-black text-emerald-400">{margin}%</p>
                        </div>
                      </div>

                      <p className="mt-2.5 text-[10px] text-amber-300/90 leading-relaxed">💡 {v.demandNote}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============ FARMER: MARKET ============ */}
          {activeTab === 'market' && role === 'farmer' && (
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-5">
              {/* Profit / Loss comparison */}
              <div className={`${card} p-5`}>
                <h3 className="text-base font-bold text-white mb-1">📊 Profit Analysis — Raw vs Value-Added</h3>
                <p className="text-[11px] text-gray-500 mb-4">Selling raw crop vs converting to product (per equivalent batch)</p>
                <div className="space-y-4">
                  {[
                    { crop: 'Mandua (1kg raw ₹120)', product: 'As Laddu batch', raw: 120, valueAdd: 550, emoji: '🟤' },
                    { crop: 'Red Rice (1kg raw ₹200)', product: 'As Kheer Mix', raw: 200, valueAdd: 460, emoji: '🍚' },
                    { crop: 'Lingda (2kg raw ₹320)', product: 'As Pickle jars', raw: 320, valueAdd: 750, emoji: '🌿' },
                    { crop: 'Burans (2kg flowers ₹240)', product: 'As Squash', raw: 240, valueAdd: 1100, emoji: '🌺' },
                    { crop: 'Milk (30L ₹1500)', product: 'As Bilona Ghee', raw: 1500, valueAdd: 2700, emoji: '🧈' },
                  ].map((row, i) => {
                    const gain = Math.round(((row.valueAdd - row.raw) / row.raw) * 100);
                    return (
                      <div key={row.crop}>
                        <div className="flex justify-between text-[11px] mb-1.5">
                          <span className="text-gray-300 font-semibold">{row.emoji} {row.crop} → {row.product}</span>
                          <span className="text-emerald-400 font-black">+{gain}% income</span>
                        </div>
                        <div className="flex gap-1.5 items-center">
                          <div className="h-3 rounded-full bg-gray-500/40" style={{ width: `${(row.raw / 2700) * 100}%`, minWidth: 30 }} />
                          <span className="text-[9px] text-gray-500 w-14">₹{row.raw} raw</span>
                        </div>
                        <div className="flex gap-1.5 items-center mt-1">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(row.valueAdd / 2700) * 100}%` }}
                            transition={{ duration: 0.8, delay: 0.1 * i }}
                            className="h-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-400"
                            style={{ minWidth: 30 }}
                          />
                          <span className="text-[9px] text-emerald-400 font-bold w-20">₹{row.valueAdd} value-add</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Full market needs */}
              <div className={`${card} p-5`}>
                <h3 className="text-base font-bold text-white mb-4">📈 Market Needs — AI Demand Signals</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {MARKET_NEEDS.map((m, i) => (
                    <motion.div
                      key={m.product}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i }}
                      className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-emerald-500/30 transition-colors"
                    >
                      <span className="text-2xl">{m.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs font-bold text-white">{m.product}</p>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-black ${
                            m.demand === 'Very High' ? 'bg-rose-500/20 text-rose-400' :
                            m.demand === 'High' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {m.demand.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[10px] text-emerald-400/80 font-semibold mt-0.5">🎯 {m.buyer}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{m.note}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============ CHAT (all roles) ============ */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.type === 'bot' && (
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-sm flex-shrink-0 shadow-lg shadow-emerald-500/20 mt-1">
                        🏔️
                      </div>
                    )}
                    <div
                      className={`max-w-[82%] lg:max-w-[72%] ${
                        msg.type === 'user'
                          ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-2xl rounded-tr-sm px-4 py-3'
                          : 'bg-white/[0.05] border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3'
                      }`}
                    >
                      <div className="text-[13px] leading-relaxed whitespace-pre-line text-white">{msg.text}</div>
                      {msg.type === 'bot' && msg.recipe && (
                        <div className="mt-3 p-3 rounded-xl bg-gradient-to-br from-emerald-900/30 to-teal-900/20 border border-emerald-500/20">
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-400">🍽️</span>
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                              Authentic Pahadi Recipe — verified from traditional Uttarakhand sources
                            </span>
                          </div>
                        </div>
                      )}
                      {msg.type === 'bot' && msg.products && msg.products.length > 0 && (
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {msg.products.map((p) => (
                            <ProductCard key={p.id + msg.id} product={p} compact />
                          ))}
                        </div>
                      )}
                      <div className={`text-[10px] ${msg.type === 'user' ? 'text-white/50' : 'text-gray-500'} mt-2`}>
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                    {msg.type === 'user' && (
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm flex-shrink-0 shadow-lg mt-1">
                        👤
                      </div>
                    )}
                  </motion.div>
                ))}

                <AnimatePresence>
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex gap-3"
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg text-sm">
                        🏔️
                      </div>
                      <div className="bg-white/[0.05] border border-white/10 rounded-2xl rounded-tl-sm px-5 py-4">
                        <div className="flex gap-1.5">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 rounded-full bg-emerald-400"
                              animate={{ y: [0, -8, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {messages.length <= 1 && !loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2.5">💡 Try asking</p>
                    <div className="flex flex-wrap gap-2">
                      {(role === 'farmer'
                        ? [
                            'Which crops should I grow now?',
                            'Weather in Rudraprayag',
                            'Market analysis — selling price?',
                            'Burans nursery kaise banaye?',
                            'Lingda products profit',
                            'Mandua laddu profit margin',
                          ]
                        : role === 'homestay'
                          ? [
                              'Room price for Chopta homestay?',
                              'Compare my rates with OYO',
                              'Organic menu for my guests',
                              'Organic vs market products',
                              'Bilona ghee bulk price',
                              'Kafuli recipe for guests',
                            ]
                          : [
                              'Suggest rooms in Chopta',
                              'Organic vs market products',
                              'Urad Dal ke Pakode recipe',
                              'सिंगोड़ी की रेसिपी बताओ',
                              'Why buy Gaazna Haldi?',
                              'Ghariya chawal benefits',
                            ]
                      ).map((s) => (
                        <motion.button
                          key={s}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => sendQuery(s)}
                          className="px-3.5 py-2 rounded-full text-xs font-medium bg-white/[0.04] border border-white/10 text-gray-400 hover:border-emerald-500/40 hover:text-emerald-400 transition-colors"
                        >
                          {s}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/10 bg-white/[0.02] shrink-0">
                <div className="flex gap-3 items-end">
                  <textarea
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about recipes, weather, profit, products... (English / हिंदी / Hinglish) 💬"
                    rows={1}
                    className="flex-1 resize-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-500 outline-none focus:border-emerald-500/50 transition-all custom-scrollbar"
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                    }}
                  />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => sendQuery()}
                    disabled={loading || !query.trim()}
                    className={`h-[46px] px-6 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                      query.trim() && !loading
                        ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30 cursor-pointer'
                        : 'bg-white/5 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {loading ? (
                      <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                        ⏳
                      </motion.span>
                    ) : (
                      <>
                        <span>Send</span>
                        <span>➤</span>
                      </>
                    )}
                  </motion.button>
                </div>
                <p className="text-[10px] text-gray-500 text-center mt-2">
                  📞 Agri Helpline: <strong className="text-emerald-500">1800-180-1551</strong> (Toll-Free) | Code:{' '}
                  <strong className="text-emerald-500">1551</strong> • Free for all farmers 🌾
                </p>
              </div>
            </div>
          )}

          {/* ============ RECIPES (homestay + user) ============ */}
          {activeTab === 'recipes' && (
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Object.entries(RECIPES).map(([key, recipe], i) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 * i }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    onClick={() => openRecipeInChat(recipe.name)}
                    className={`${card} p-5 cursor-pointer hover:border-emerald-500/30 transition-colors flex flex-col`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-4xl">{recipe.emoji}</span>
                      <span
                        className={`text-[9px] px-2 py-1 rounded-full font-bold ${
                          recipe.difficulty === 'Easy'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : recipe.difficulty === 'Medium'
                              ? 'bg-amber-500/15 text-amber-400'
                              : 'bg-rose-500/15 text-rose-400'
                        }`}
                      >
                        {recipe.difficulty}
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-sm mb-1">{recipe.name}</h3>
                    <p className="text-[10px] text-emerald-400/80 font-semibold mb-2">📍 {recipe.region}</p>
                    <p className="text-[10px] text-gray-500 line-clamp-2 flex-1">{recipe.description}</p>
                    <div className="flex items-center gap-3 text-[10px] text-gray-500 mt-3">
                      <span>⏱️ {recipe.time}</span>
                      <span>🔥 {recipe.calories}</span>
                    </div>
                    <button className="mt-2.5 text-xs text-emerald-500 font-semibold text-left">
                      View Full Recipe →
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* ============ PRODUCTS (homestay + user) ============ */}
          {activeTab === 'products' && (
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-7">
              {role === 'homestay' && (
                <div className={`${card} p-4 bg-gradient-to-r from-indigo-900/20 to-transparent border-indigo-500/20`}>
                  <p className="text-sm font-bold text-white">🏡 Homestay B2B Mode</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Every card shows your <span className="text-emerald-400 font-bold">direct-from-farmer price</span> vs the{' '}
                    <span className="text-rose-400 font-bold">city market rate</span> — see exactly how much you save & profit by sourcing direct!
                  </p>
                </div>
              )}
              {role === 'user' && (
                <div className={`${card} p-4 bg-gradient-to-r from-teal-900/20 to-transparent border-teal-500/20`}>
                  <p className="text-sm font-bold text-white">🔍 Farm-to-Fork Traceability</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Tap <span className="text-teal-400 font-bold">"Trace to Farm"</span> on any product to see the exact farmer, village, altitude and harvest date — 100% transparency!
                  </p>
                </div>
              )}
              {PRODUCT_CATEGORIES.map((category) => (
                <div key={category}>
                  <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                    <span>{CATEGORY_EMOJI[category]}</span> {category}
                    <span className="text-[10px] font-medium text-gray-500">
                      ({PRODUCTS.filter((p) => p.category === category).length} items)
                    </span>
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {PRODUCTS.filter((p) => p.category === category).map((product, i) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.03 * i }}
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
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
