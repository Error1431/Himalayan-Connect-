import React from 'react';
import { motion } from 'framer-motion';
import { PRODUCTS, PRODUCT_CATEGORIES } from '../../data/products';
import { ProductCard } from './ChatInterface';
import { RecipesGrid, CATEGORY_EMOJI } from './HomestayDashboard';

// Customer ("user") role: Recipes tab + Products tab (Trace to Farm mode).
export default function CustomerView({ activeTab, card, openRecipeInChat, role, traceOpen, setTraceOpen, handleBuyNow }) {
  return (
    <>
      {/* ============ RECIPES (customer) ============ */}
      {activeTab === 'recipes' && <RecipesGrid card={card} openRecipeInChat={openRecipeInChat} />}

      {/* ============ PRODUCTS (customer — user mode + Trace to Farm) ============ */}
      {activeTab === 'products' && (
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-7">
          <div className={`${card} p-4 bg-gradient-to-r from-teal-900/20 to-transparent border-teal-500/20`}>
            <p className="text-sm font-bold text-white">🔍 Farm-to-Fork Traceability</p>
            <p className="text-[11px] text-gray-400 mt-1">
              Tap <span className="text-teal-400 font-bold">"Trace to Farm"</span> on any product to see the exact farmer, village, altitude and harvest date — 100% transparency!
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
