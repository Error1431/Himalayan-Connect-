// ============================================
// PROFIT CALCULATOR
// - Calculates farmer profit & margin for value-added products
// Extracted from data/valueadd.js for standalone reuse
// ============================================

export const calcProfit = (v) => v.marketPrice - v.rawCost - v.conversionCost;
export const calcMargin = (v) => Math.round((calcProfit(v) / (v.rawCost + v.conversionCost)) * 100);
