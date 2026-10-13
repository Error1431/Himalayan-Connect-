import React from 'react';
import { motion } from 'framer-motion';
import { RECIPES } from '../../data/recipes';
import { PRODUCTS, PRODUCT_CATEGORIES } from '../../data/products';
import { ProductCard } from './ChatInterface';

export const CATEGORY_EMOJI = {
  Fruits: '🍎', Grains: '🌾', Pulses: '🫘', Specialty: '🍯', Homestays: '🏡',
};

// Shared recipe grid — reused by CustomerView.jsx (same markup for both roles).
export const RecipesGrid = ({ card, openRecipeInChat }) => (
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
);

// Homestay role: Recipes tab + Products tab (with B2B pricing banner).
export default function HomestayDashboard({ activeTab, card, openRecipeInChat, role, traceOpen, setTraceOpen, handleBuyNow }) {
  return (
    <>
      {/* ============ RECIPES (homestay) ============ */}
      {activeTab === 'recipes' && <RecipesGrid card={card} openRecipeInChat={openRecipeInChat} />}

      {/* ============ PRODUCTS (homestay) ============ */}
      {activeTab === 'products' && (
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-7">
          <div className={`${card} p-4 bg-gradient-to-r from-indigo-900/20 to-transparent border-indigo-500/20`}>
            <p className="text-sm font-bold text-white">🏡 Homestay B2B Mode</p>
            <p className="text-[11px] text-gray-400 mt-1">
              Every card shows your <span className="text-emerald-400 font-bold">direct-from-farmer price</span> vs the{' '}
              <span className="text-rose-400 font-bold">city market rate</span> — see exactly how much you save & profit by sourcing direct!
            </p>
          </div>
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
                    <ProductCard
                      product={product}
                      role={role}
                      traceOpen={traceOpen}
                      setTraceOpen={setTraceOpen}
                      handleBuyNow={handleBuyNow}
                      card={card}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
