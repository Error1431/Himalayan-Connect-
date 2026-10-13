// ============================================
// ROLE-SPECIFIC AI DATA
// Farmer: crop calendar, market analysis
// Homestay: room pricing vs OTA sites, menus
// Customer: room recommendations, organic vs market
// ============================================

// ---------- FARMER: Weather-based crop calendar ----------
export interface CropPlan {
  crop: string;
  emoji: string;
  sowing: string;
  harvest: string;
  weatherNeed: string;
  expectedPrice: string;
  profitNote: string;
}

export const CROP_CALENDAR: Record<string, CropPlan[]> = {
  'Spring (Feb-Apr)': [
    { crop: 'Potato (Pahadi)', emoji: '🥔', sowing: 'Feb-Mar', harvest: 'May-Jun', weatherNeed: '15-20°C, well-drained slopes', expectedPrice: '₹35-45/kg', profitNote: 'Red Pahadi potato sells 2x plains potato in Dehradun' },
    { crop: 'Peas', emoji: '🟢', sowing: 'Feb-Mar', harvest: 'Apr-May', weatherNeed: '12-18°C, light rain okay', expectedPrice: '₹60-80/kg', profitNote: 'Off-season hill peas get premium in plains markets' },
    { crop: 'Gaazna Haldi', emoji: '✨', sowing: 'Mar-Apr', harvest: 'Dec-Jan', weatherNeed: 'Warm start, shade tolerant', expectedPrice: '₹220/kg raw, ₹1800/kg powder', profitNote: 'Rare variety — Ayurveda brands pay 3x!' },
  ],
  'Summer (May-Jun)': [
    { crop: 'Rajma (Kedarnath)', emoji: '🫘', sowing: 'May-Jun', harvest: 'Sep-Oct', weatherNeed: '18-24°C, moderate rain', expectedPrice: '₹150/kg', profitNote: 'GI-tagged — direct selling gives 87% margin' },
    { crop: 'Mandua (Ragi)', emoji: '🌾', sowing: 'May-Jun', harvest: 'Sep-Oct', weatherNeed: 'Rain-fed, drought tolerant', expectedPrice: '₹120/kg flour', profitNote: 'Convert to laddu/brownies = +350% income' },
    { crop: 'Jhangora', emoji: '🌿', sowing: 'May-Jun', harvest: 'Sep', weatherNeed: 'Rain-fed terraces', expectedPrice: '₹90/kg', profitNote: 'Kheer cups demand rising — fasting season gold' },
  ],
  'Monsoon (Jul-Sep)': [
    { crop: 'Lingda (collect wild)', emoji: '🌿', sowing: 'Wild harvest', harvest: 'Jul-Sep', weatherNeed: 'Moist forest edges', expectedPrice: '₹160/kg fresh, ₹1200/batch pickle', profitNote: 'IRON-RICH! Pickle = 165% margin, 12-month shelf life' },
    { crop: 'Kandali (nettle)', emoji: '🌱', sowing: 'Wild harvest', harvest: 'Jul-Oct', weatherNeed: 'Grows wild everywhere', expectedPrice: '₹80/kg', profitNote: 'City restaurants buying for exotic saag menus' },
  ],
  'Autumn/Winter (Oct-Jan)': [
    { crop: 'Garlic (hill)', emoji: '🧄', sowing: 'Oct-Nov', harvest: 'Apr-May', weatherNeed: 'Cool 8-15°C, frost okay', expectedPrice: '₹120-180/kg', profitNote: 'Hill garlic has stronger flavour — chefs pay extra' },
    { crop: 'Mustard', emoji: '🌼', sowing: 'Oct-Nov', harvest: 'Feb-Mar', weatherNeed: 'Cool dry winters', expectedPrice: '₹70/kg seed', profitNote: 'Cold-pressed hill mustard oil ₹350/L in cities' },
    { crop: 'Burans nursery (start)', emoji: '🌺', sowing: 'Seeds Apr-May, care all winter', harvest: 'Saplings in 18-24 months', weatherNeed: 'Shade beds, frost protection', expectedPrice: '₹80-120/sapling', profitNote: 'Forest dept bulk tenders — ₹6,500 profit per 100 saplings' },
  ],
};

// ---------- HOMESTAY: Room pricing vs OTA sites ----------
export interface RoomPricing {
  location: string;
  emoji: string;
  yourType: string;
  otaRates: { site: string; rate: number }[];
  avgMarket: number;
  suggestedMin: number;
  suggestedMax: number;
  reasoning: string;
  occupancyTip: string;
}

export const ROOM_PRICING: RoomPricing[] = [
  {
    location: 'Chopta', emoji: '🌲', yourType: 'Eco Homestay (organic meals)',
    otaRates: [
      { site: 'OYO', rate: 3200 }, { site: 'MakeMyTrip', rate: 3500 },
      { site: 'Booking.com', rate: 3800 }, { site: 'Airbnb', rate: 3400 },
    ],
    avgMarket: 3475, suggestedMin: 2400, suggestedMax: 2800,
    reasoning: 'OTA hotels charge ₹3,200-3,800 but give standard rooms + commission cuts of 18-25%. Direct booking at ₹2,400-2,800 with organic meals included beats them on VALUE — guests save money AND get authentic experience. You keep 100% (no commission)!',
    occupancyTip: 'Peak (Apr-Jun, Oct-Nov): charge ₹2,800. Off-season: ₹2,200 + free trek guide to maintain occupancy.',
  },
  {
    location: 'Auli', emoji: '⛷️', yourType: 'Ski-view Homestay',
    otaRates: [
      { site: 'OYO', rate: 4200 }, { site: 'MakeMyTrip', rate: 4800 },
      { site: 'Booking.com', rate: 5200 }, { site: 'Airbnb', rate: 4500 },
    ],
    avgMarket: 4675, suggestedMin: 3200, suggestedMax: 3800,
    reasoning: 'Ski season OTA rates hit ₹5,000+. Your ₹3,200-3,800 with ski equipment + local guide included is unbeatable. Winter weekends can go to ₹4,200.',
    occupancyTip: 'Jan-Feb ski season: ₹3,800-4,200. Summer: drop to ₹2,500 targeting Valley of Flowers trekkers.',
  },
  {
    location: 'Munsiyari', emoji: '🏔️', yourType: 'Panchachuli-view Homestay',
    otaRates: [
      { site: 'OYO', rate: 2600 }, { site: 'MakeMyTrip', rate: 2900 },
      { site: 'Booking.com', rate: 3100 }, { site: 'Airbnb', rate: 2800 },
    ],
    avgMarket: 2850, suggestedMin: 1800, suggestedMax: 2200,
    reasoning: 'Remote location = fewer OTA listings, but also fewer tourists. Price at ₹1,800-2,200 to capture budget trekkers. Your Panchachuli sunrise view is FREE marketing — ask guests to post reels!',
    occupancyTip: 'Milam glacier trek season (May-Jun, Sep-Oct): ₹2,200. Add packed organic lunch ₹250/person for trekkers.',
  },
  {
    location: 'Harsil', emoji: '🌊', yourType: 'Apple-orchard Riverside Stay',
    otaRates: [
      { site: 'OYO', rate: 3400 }, { site: 'MakeMyTrip', rate: 3900 },
      { site: 'Booking.com', rate: 4200 }, { site: 'Airbnb', rate: 3700 },
    ],
    avgMarket: 3800, suggestedMin: 2600, suggestedMax: 3000,
    reasoning: 'Gangotri yatra route = guaranteed footfall May-Oct. OTAs charge ₹3,400-4,200. Your orchard stay at ₹2,600-3,000 with apple-picking experience (Sep) can even charge ₹3,400 in harvest season.',
    occupancyTip: 'Yatra season (May-Oct): near-full occupancy at ₹3,000. Apple harvest Sep: premium ₹3,400 with picking experience.',
  },
];

// ---------- HOMESTAY: Organic menu suggestions ----------
export const MENU_SUGGESTIONS = {
  breakfast: [
    '🫓 Mandua ki Roti + Local Bilona Ghee + Bhang ki Chutney',
    '🥞 Gahat ke Paranthe + Kumaoni Raita + Organic Honey',
    '🍞 Ragi Bread toast + Himalayan Honey + Burans Squash',
  ],
  lunch: [
    '🍛 Chainsoo + Ghariya Chawal (Red Rice) + Kandali Saag',
    '🥣 Phaanu + Steamed Rice + Aloo ke Gutke + Kumaoni Raita',
    '🍲 Bhatt ki Churdkani + Mandua Roti + Lingda Pickle',
  ],
  dinner: [
    '🥬 Kafuli + Red Rice + Dubuk + Muli Thechwa',
    '🍛 Garhwal ka Fannah + Rice + Kandali Saag',
    '🍲 Thhatwani (Ras) + Rice + Aloo Tamatar ka Jhol',
  ],
  desserts: [
    '🍮 Jhangora ki Kheer (signature!)',
    '🍚 Ghariya Chawal Kheer (top-notch — guests LOVE this)',
    '🍩 Arsa + Singori (festival platter)',
    '🍡 Gulgula with evening chai',
  ],
  welcome: ['🌺 Burans Squash welcome drink', '🍵 Buransh tea with mandua cookies'],
};

// ---------- Organic vs Market comparison ----------
export const ORGANIC_VS_MARKET = [
  { aspect: 'Pesticides', organic: 'Zero — only neem oil & natural methods', market: 'Chemical residues (linked to health issues)', emoji: '🧪' },
  { aspect: 'Ripening', organic: 'Naturally sun-ripened on plant', market: 'Carbide/ethylene artificial ripening', emoji: '☀️' },
  { aspect: 'Nutrition', organic: 'Higher antioxidants, minerals intact', market: '20-40% nutrient loss in cold storage', emoji: '💪' },
  { aspect: 'Freshness', organic: 'Farm to you in 24-48 hrs', market: 'Weeks in cold storage + wax coating', emoji: '⏱️' },
  { aspect: 'Farmer income', organic: 'Farmer gets 75-80% of price', market: 'Farmer gets only 25-30%, middlemen take rest', emoji: '👨‍🌾' },
  { aspect: 'Traceability', organic: 'Know your exact farmer & village', market: 'No idea where it came from', emoji: '🔍' },
];

export const CUSTOMER_STATS = {
  likeOrganic: 84,          // % guests who prefer organic food at homestays
  repeatBooking: 67,        // % rebooking when organic meals served
  payMore: 72,              // % willing to pay 10-15% more for organic menu
  reviews: 'Homestays serving organic Pahadi food get 4.7★ avg vs 4.1★ for regular menus',
};

// ---------- CUSTOMER: Homestay recommendations by location ----------
export interface StayListing {
  name: string;
  location: string;
  emoji: string;
  price: number;
  otaAvg: number;
  rating: number;
  highlights: string[];
  bestFor: string;
}

// ---------- FARMER: Market price comparison (other websites) ----------
export interface MarketCompare {
  product: string;
  emoji: string;
  ourPrice: number;
  unit: string;
  sites: { site: string; price: number }[];
  advice: string;
}

export const MARKET_COMPARE: MarketCompare[] = [
  {
    product: 'Rajma', emoji: '🫘', ourPrice: 150, unit: 'kg',
    sites: [
      { site: 'BigBasket', price: 210 }, { site: 'Amazon Fresh', price: 230 },
      { site: 'JioMart', price: 195 }, { site: 'Local Mandi (you get)', price: 90 },
    ],
    advice: 'City sites sell at ₹195-230. Mandi gives you only ₹90. Sell direct at ₹150 — customer still saves, you earn 66% more!',
  },
  {
    product: 'Ragi/Mandua Flour', emoji: '🌾', ourPrice: 120, unit: 'kg',
    sites: [
      { site: 'BigBasket', price: 165 }, { site: 'Amazon', price: 180 },
      { site: 'JioMart', price: 155 }, { site: 'Local Mandi (you get)', price: 55 },
    ],
    advice: 'Branded ragi sells ₹155-180 online. Your organic mandua at ₹120 direct beats them all — and mandi ₹55 is a loss deal!',
  },
  {
    product: 'Organic Honey', emoji: '🍯', ourPrice: 525, unit: 'kg',
    sites: [
      { site: 'BigBasket (organic)', price: 700 }, { site: 'Amazon (raw)', price: 850 },
      { site: 'JioMart', price: 650 }, { site: 'Local trader (you get)', price: 300 },
    ],
    advice: 'Raw honey sells ₹650-850 online! Traders offer you just ₹300. Direct at ₹525 = 75% more income.',
  },
  {
    product: 'Desi Ghee', emoji: '🧈', ourPrice: 2800, unit: 'kg',
    sites: [
      { site: 'BigBasket (A2)', price: 3200 }, { site: 'Amazon (bilona)', price: 3500 },
      { site: 'JioMart', price: 2900 }, { site: 'Local trader (you get)', price: 1400 },
    ],
    advice: 'Bilona ghee sells ₹2,900-3,500 online. Never accept trader price ₹1,400 — sell direct at ₹2,800!',
  },
  {
    product: 'Apple (organic)', emoji: '🍎', ourPrice: 190, unit: 'kg',
    sites: [
      { site: 'BigBasket', price: 240 }, { site: 'Amazon Fresh', price: 260 },
      { site: 'JioMart', price: 220 }, { site: 'Mandi (you get)', price: 105 },
    ],
    advice: 'Organic apples ₹220-260 in cities. Mandi ₹105 barely covers cost. Direct ₹190 = 81% more!',
  },
];

// ---------- FARMER: Customer attraction tips ----------
export const ATTRACTION_TIPS = [
  '📸 **Photos sell!** Post harvest photos/reels — farms at altitude look premium. Tag location (e.g., "Kedarnath Valley Rajma").',
  '🏷️ **Story labels:** Add farmer name + village + altitude on packets. "Grown by Ramesh Negi at 1,800m" doubles trust.',
  '⭐ **First-order offer:** 10% off or free 100g honey sample — repeat customers spend 3x more.',
  '📦 **Combo packs:** Rajma + Mandua + Ghee "Pahadi Kitchen Box" — combos sell 2.5x faster than singles.',
  '💬 **WhatsApp catalog:** Free WhatsApp Business catalog — 70% of direct orders come from WhatsApp shares.',
  '🚚 **Yatra season push:** May-Oct pilgrims want Special Rotna & Arsa — contact route shops in April itself.',
  '🎁 **Festival gifting:** Diwali/wedding Arsa gift boxes at 2x price — start taking orders 1 month early.',
];

// ---------- HOMESTAY: Seasonal food guide ----------
export const SEASONAL_FOOD: Record<string, { title: string; why: string; dishes: string[]; drink: string }> = {
  winter: {
    title: '❄️ Winter Menu (Body-Heating Foods)',
    why: 'Guests need warming, high-energy food in the cold. These traditional dishes generate body heat (taseer garam):',
    dishes: [
      '🍵 Thhatwani/Ras — hot lentil soup, the ultimate winter starter',
      '🫘 Bhatt ki Churdkani — black soybean, deep winter warmth',
      '🍲 Chainsoo — protein-rich urad dal, keeps body warm',
      '🥣 Phaanu — mixed lentils, perfect winter luncheon',
      '🫓 Gahat ke Paranthe + Bilona Ghee — gahat is naturally heating',
      '🟤 Mandua-Gond Laddu — traditional winter immunity sweet',
      '🍩 Arsa — jaggery-based, warming dessert',
    ],
    drink: '🍯 Hot water + Himalayan honey + Gaazna Haldi (haldi doodh) at bedtime',
  },
  summer: {
    title: '☀️ Summer Menu (Cooling Foods)',
    why: 'Guests need light, cooling food (taseer thandi) in warm months:',
    dishes: [
      '🥗 Kumaoni Raita — curd + cucumber, the ultimate cooler',
      '🥬 Kafuli — light greens, easy to digest',
      '🍮 Jhangora ki Kheer (chilled) — cooling millet dessert',
      '🍚 Ghariya Chawal Kheer (chilled) — signature red rice sweet',
      '🍅 Aloo Tamatar ka Jhol — light gravy, not heavy',
      '🍡 Gulgula with evening chai',
    ],
    drink: '🌺 Burans Squash — the state-flower cooler, heart-healthy & refreshing!',
  },
  monsoon: {
    title: '🌧️ Monsoon Menu (Fresh & Immunity)',
    why: 'Monsoon brings fresh wild greens + guests crave hot fried snacks:',
    dishes: [
      '🌿 Lingda Sabzi — iron-rich fiddlehead fern (monsoon-only exotic!)',
      '🌱 Kandali ka Saag — wild nettle, mineral powerhouse',
      '🧆 Urad Dal ke Pakode — hot pakoras with rain = guest happiness',
      '🥬 Kafuli + hot rice',
      '🫓 Mandua Roti + Bhang ki Chutney',
    ],
    drink: '🍵 Buransh tea + hot mandua cookies',
  },
};

export const STAY_LISTINGS: StayListing[] = [
  {
    name: 'Chopta Eco Homestay', location: 'Chopta', emoji: '🌲', price: 2500, otaAvg: 3475, rating: 4.8,
    highlights: ['Organic meals from own farm', 'Tungnath-Chandrashila trek guide', 'Bonfire + star gazing', '20% direct discount'],
    bestFor: 'Trekkers & nature lovers — Mini Switzerland of India!',
  },
  {
    name: 'Auli Ski-View Homestay', location: 'Auli', emoji: '⛷️', price: 3500, otaAvg: 4675, rating: 4.7,
    highlights: ['Ski equipment included', 'Nanda Devi views', 'Ski instructor on call', 'Hot organic meals'],
    bestFor: 'Ski enthusiasts (Jan-Feb) & Valley of Flowers trekkers (Jul-Aug)',
  },
  {
    name: 'Munsiyari Panchachuli Stay', location: 'Munsiyari', emoji: '🏔️', price: 2000, otaAvg: 2850, rating: 4.9,
    highlights: ['Panchachuli sunrise from bed!', 'Khaliya Top trek base', 'Cheapest in region', 'Authentic Kumaoni food'],
    bestFor: 'Budget travelers wanting the best Himalayan views',
  },
  {
    name: 'Harsil Orchard Riverside Stay', location: 'Harsil', emoji: '🌊', price: 2800, otaAvg: 3800, rating: 4.8,
    highlights: ['Inside apple orchard', 'Bhagirathi riverside', 'Apple picking (Sep)', 'Gangotri 25km'],
    bestFor: 'Gangotri yatris & peace seekers — the hidden gem of Uttarakhand',
  },
  {
    name: 'Baijnath Temple-View Stay', location: 'Baijnath', emoji: '🛕', price: 1800, otaAvg: 2400, rating: 4.6,
    highlights: ['Ancient temple walk', 'Kafal & Singori tasting', 'Gomti riverside', 'Quiet & spiritual'],
    bestFor: 'Spiritual travelers & Kumaon culture explorers',
  },
];
