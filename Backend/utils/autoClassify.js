// Lightweight, dependency-free keyword classifier. It looks at whatever text
// a farmer/host actually typed (name + description + location) and tags the
// listing automatically — so the platform can group "which homestay is a
// river view" or "which product is iron-rich" without the host having to
// manually pick every tag themselves.

const norm = (s = '') => String(s).toLowerCase();

// ---------------- Products: nutrition / use-case tags ----------------
const PRODUCT_BENEFIT_RULES = [
  { tag: 'Rich in Iron', match: ['rajma', 'kidney bean', 'ragi', 'mandua', 'spinach', 'palak', 'jaggery', 'gur'] },
  { tag: 'High Protein', match: ['rajma', 'kidney bean', 'dal', 'lentil', 'pulse', 'gahat', 'horse gram', 'soy'] },
  { tag: 'Rich in Fiber', match: ['jhangora', 'barnyard millet', 'mandua', 'ragi', 'oats', 'whole grain', 'millet'] },
  { tag: 'Antioxidant Rich', match: ['red rice', 'ghriya', 'black rice', 'berries', 'kilmora', 'buransh', 'rhododendron'] },
  { tag: 'Good for Digestion', match: ['gahat', 'horse gram', 'buttermilk', 'chaach', 'ginger', 'adrak'] },
  { tag: 'Boosts Immunity', match: ['honey', 'shahad', 'turmeric', 'haldi', 'tulsi', 'basil', 'amla', 'gooseberry'] },
  { tag: 'Heart Healthy', match: ['walnut', 'akhrot', 'mustard oil', 'sarson', 'olive'] },
  { tag: 'Low Glycemic', match: ['mandua', 'ragi', 'jhangora', 'buckwheat', 'kuttu'] },
  { tag: 'Naturally Organic', match: ['organic', 'chemical-free', 'no pesticide', 'natural farming'] },
  { tag: 'Gluten-Free', match: ['ragi', 'mandua', 'jhangora', 'rice flour', 'buckwheat', 'kuttu'] },
];

function classifyProductBenefits({ productName = '', description = '', category = '' }) {
  const text = norm(`${productName} ${description} ${category}`);
  const tags = PRODUCT_BENEFIT_RULES
    .filter((rule) => rule.match.some((kw) => text.includes(kw)))
    .map((rule) => rule.tag);
  return Array.from(new Set(tags)).slice(0, 5);
}

// ---------------- Homestays: view type & property type ----------------
const VIEW_RULES = [
  { tag: 'river', label: 'River View', match: ['river', 'nadi', 'ganga', 'alaknanda', 'bhagirathi', 'mandakini', 'stream', 'riverside', 'riverbank'] },
  { tag: 'mountain', label: 'Mountain View', match: ['mountain', 'himalaya', 'peak', 'snow', 'chotta', 'summit', 'ridge', 'hill view'] },
  { tag: 'valley', label: 'Valley View', match: ['valley', 'ghati'] },
  { tag: 'forest', label: 'Forest View', match: ['forest', 'jungle', 'pine', 'deodar', 'oak forest', 'woods'] },
  { tag: 'lake', label: 'Lake View', match: ['lake', 'tal', 'jheel'] },
];

const PROPERTY_TYPE_RULES = [
  { tag: 'highway_stay', label: 'Highway / Roadside Stay', match: ['highway', 'nh-', 'national highway', 'main road', 'roadside', 'byepass'] },
  { tag: 'guesthouse', label: 'Guesthouse', match: ['guest house', 'guesthouse', 'lodge', 'inn'] },
  { tag: 'homestay', label: 'Family Homestay', match: ['homestay', 'home stay', 'family run', 'family-run', 'stay with a local family'] },
];

function classifyHomestayView({ description = '', tagline = '', village = '', district = '', address = '' }) {
  const text = norm(`${description} ${tagline} ${village} ${district} ${address}`);
  for (const rule of VIEW_RULES) {
    if (rule.match.some((kw) => text.includes(kw))) {
      return { viewType: rule.tag, viewLabel: rule.label };
    }
  }
  return { viewType: 'general', viewLabel: 'Scenic Village View' };
}

function classifyPropertyType({ description = '', homestayName = '', address = '' }) {
  const text = norm(`${description} ${homestayName} ${address}`);
  for (const rule of PROPERTY_TYPE_RULES) {
    if (rule.match.some((kw) => text.includes(kw))) {
      return { propertyType: rule.tag, propertyLabel: rule.label };
    }
  }
  return { propertyType: 'homestay', propertyLabel: 'Family Homestay' };
}

module.exports = {
  classifyProductBenefits,
  classifyHomestayView,
  classifyPropertyType,
};
