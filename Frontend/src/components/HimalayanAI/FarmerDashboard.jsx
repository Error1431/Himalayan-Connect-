import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { VALUE_PRODUCTS, calcProfit, calcMargin, WEATHER_DATA, MARKET_NEEDS } from '../../data/valueadd';

// Farmer role: Dashboard + Value-Add + Market tabs.
export default function FarmerDashboard({ activeTab, setActiveTab, card }) {
  const [weatherIdx, setWeatherIdx] = useState(0);
  const weather = WEATHER_DATA[weatherIdx];

  return (
    <>
      {/* ============ FARMER: DASHBOARD ============ */}
      {activeTab === 'dashboard' && (
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
      {activeTab === 'valueadd' && (
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
      {activeTab === 'market' && (
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
    </>
  );
}
