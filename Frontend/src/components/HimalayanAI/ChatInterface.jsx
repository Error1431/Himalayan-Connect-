import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTrace, getB2BPricing } from '../../data/valueadd';

// ---------- Product card (role-aware) ----------
// Exported so HomestayDashboard.jsx and CustomerView.jsx can reuse the
// exact same card for the Products tab.
export const ProductCard = ({
  product,
  compact = false,
  role,
  traceOpen,
  setTraceOpen,
  handleBuyNow,
  card,
}) => {
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

// ---------- Chat tab (all roles) ----------
export default function ChatInterface({
  role,
  card,
  messages,
  loading,
  query,
  setQuery,
  sendQuery,
  handleKeyDown,
  formatTime,
  messagesEndRef,
  inputRef,
  traceOpen,
  setTraceOpen,
  handleBuyNow,
}) {
  return (
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
                    <ProductCard
                      key={p.id + msg.id}
                      product={p}
                      compact
                      role={role}
                      traceOpen={traceOpen}
                      setTraceOpen={setTraceOpen}
                      handleBuyNow={handleBuyNow}
                      card={card}
                    />
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
              const target = e.target;
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
  );
}
