// ============================================
// AI DISTRIBUTION SYSTEM DATA
// Value-added products, weather, market needs,
// traceability — for Farmer / Homestay / User roles
// ============================================
// profit = marketPrice - rawCost - conversionCost
export const VALUE_PRODUCTS = [
    {
        id: 'brownie', name: 'Mandua Brownie', emoji: '🍫', baseCrop: 'Mandua (Ragi)',
        rawMaterial: '1 kg mandua flour + jaggery + ghee', rawCost: 260, conversionCost: 140,
        outputYield: '20 brownies (60g each)', shelfLife: '7 days', marketPrice: 800, unit: 'batch',
        demandNote: 'Gluten-free brownies trending in Dehradun cafes & Rishikesh yoga retreats!',
    },
    {
        id: 'bread', name: 'Mandua-Wheat Bread', emoji: '🍞', baseCrop: 'Mandua (Ragi)',
        rawMaterial: '1 kg mandua + 1 kg wheat flour', rawCost: 180, conversionCost: 120,
        outputYield: '6 loaves (400g each)', shelfLife: '4-5 days', marketPrice: 540, unit: 'batch',
        demandNote: 'Health bakeries in Dehradun buy ragi bread at premium — daily repeat demand.',
    },
    {
        id: 'buns', name: 'Small Buns (Ragi)', emoji: '🥯', baseCrop: 'Mandua (Ragi)',
        rawMaterial: '1 kg mixed flour + milk + butter', rawCost: 200, conversionCost: 110,
        outputYield: '30 small buns', shelfLife: '3-4 days', marketPrice: 600, unit: 'batch',
        demandNote: 'Yatra route dhabas & tea stalls need soft buns daily — steady bulk orders.',
    },
    {
        id: 'doughnuts', name: 'Small Doughnuts', emoji: '🍩', baseCrop: 'Mandua + Wheat',
        rawMaterial: '1 kg flour + sugar + oil', rawCost: 220, conversionCost: 150,
        outputYield: '25 mini doughnuts', shelfLife: '3 days', marketPrice: 750, unit: 'batch',
        demandNote: 'Tourist cafes in Mussoorie & Nainital love local-grain doughnuts — 100%+ margin.',
    },
    {
        id: 'laddu', name: 'Mandua-Gond Laddu', emoji: '🟤', baseCrop: 'Mandua (Ragi)',
        rawMaterial: '1 kg mandua + jaggery + ghee + gond', rawCost: 380, conversionCost: 120,
        outputYield: '35 laddus (40g each)', shelfLife: '21 days', marketPrice: 1050, unit: 'batch',
        demandNote: 'Winter immunity laddus — huge gifting demand Oct-Feb. Long shelf life = low risk!',
    },
    {
        id: 'kheerMix', name: 'Ghariya Chawal Kheer Mix', emoji: '🍚', baseCrop: 'Ghariya Chawal (Red Rice)',
        rawMaterial: '1 kg red rice + dry fruits + cardamom', rawCost: 420, conversionCost: 80,
        outputYield: '8 ready-to-cook kheer packs (150g)', shelfLife: '3 months', marketPrice: 960, unit: 'batch',
        demandNote: 'Top-notch red rice kheer! Ready-mix packs fly off shelves on yatra routes.',
    },
    {
        id: 'jhangoraKheer', name: 'Jhangora Kheer Cups', emoji: '🍮', baseCrop: 'Jhangora (Millet)',
        rawMaterial: '1 kg jhangora + milk powder + sugar', rawCost: 300, conversionCost: 130,
        outputYield: '20 instant kheer cups', shelfLife: '2 months', marketPrice: 800, unit: 'batch',
        demandNote: 'Fasting-friendly dessert cups — massive demand during Navratri & yatra season.',
    },
    {
        id: 'lingdaPickle', name: 'Lingda Pickle (Iron-Rich)', emoji: '🌿', baseCrop: 'Lingda (Fiddlehead Fern)',
        rawMaterial: '2 kg fresh lingda + mustard oil + spices', rawCost: 320, conversionCost: 130,
        outputYield: '8 jars (250g each)', shelfLife: '12 months', marketPrice: 1200, unit: 'batch',
        demandNote: 'Lingda is RICH IN IRON! Monsoon-only harvest = premium exotic pickle all year. 165% margin!',
        special: true,
    },
    {
        id: 'lingdaDried', name: 'Sun-Dried Lingda', emoji: '☀️', baseCrop: 'Lingda (Fiddlehead Fern)',
        rawMaterial: '3 kg fresh lingda', rawCost: 360, conversionCost: 60,
        outputYield: '500g dried lingda packs', shelfLife: '8 months', marketPrice: 900, unit: 'batch',
        demandNote: 'Iron-rich dried lingda sells to city Pahadi families who miss home food!',
        special: true,
    },
    {
        id: 'buransSquash', name: 'Burans Squash/Juice', emoji: '🌺', baseCrop: 'Burans (Rhododendron)',
        rawMaterial: '2 kg burans flowers + sugar', rawCost: 240, conversionCost: 160,
        outputYield: '10 bottles (750ml squash)', shelfLife: '9 months', marketPrice: 1500, unit: 'batch',
        demandNote: 'State flower drink! Heart-healthy, cooling — every yatra shop stocks it. 275% margin!',
        special: true,
    },
    {
        id: 'buransNursery', name: 'Burans Nursery (Saplings)', emoji: '🌱', baseCrop: 'Burans (Rhododendron)',
        rawMaterial: 'Seeds/cuttings + 100 poly bags + soil mix', rawCost: 800, conversionCost: 700,
        outputYield: '100 saplings (18-24 months)', shelfLife: 'Living plants', marketPrice: 8000, unit: 'cycle',
        demandNote: 'NURSERY FORMATION GUIDE: Collect seeds Apr-May → sow in shaded beds → transplant to poly bags at 10cm → sell at ₹80-120/sapling to forest dept, resorts & eco-projects. Govt afforestation schemes buy in bulk!',
        special: true,
    },
    {
        id: 'specialRotna', name: 'Special Rotna (Travel Pack)', emoji: '🫓', baseCrop: 'Mandua (Ragi)',
        rawMaterial: '2 kg mandua flour + ghee + ajwain', rawCost: 350, conversionCost: 150,
        outputYield: '40 vacuum-packed rotnas', shelfLife: '10 days', marketPrice: 1200, unit: 'batch',
        demandNote: 'HUGE DEMAND in Dehradun & all yatra routes (Kedarnath, Badrinath)! Pilgrims want ready Pahadi rotis. 140% margin!',
        special: true,
    },
    {
        id: 'specialArsa', name: 'Special Arsa (Gift Box)', emoji: '🍩', baseCrop: 'Rice + Jaggery',
        rawMaterial: '2 kg rice + 1 kg jaggery + mustard oil', rawCost: 300, conversionCost: 180,
        outputYield: '4 gift boxes (12 arsa each)', shelfLife: '15 days', marketPrice: 1400, unit: 'batch',
        demandNote: 'HUGE DEMAND in Dehradun & yatra routes! Wedding-favour gift boxes — premium packaging doubles the price. 190% margin!',
        special: true,
    },
    {
        id: 'gaaznaHaldi', name: 'Gaazna Haldi Powder (Rare)', emoji: '✨', baseCrop: 'Gaazna Haldi',
        rawMaterial: '5 kg fresh gaazna rhizomes', rawCost: 450, conversionCost: 150,
        outputYield: '1 kg premium powder (100g jars)', shelfLife: '18 months', marketPrice: 1800, unit: 'batch',
        demandNote: 'Rare wild turmeric with exceptional curcumin! Ayurveda stores pay 3x normal haldi price. 200% margin!',
        special: true,
    },
    {
        id: 'localGhee', name: 'Local Bilona Ghee', emoji: '🧈', baseCrop: 'Desi Cow Milk',
        rawMaterial: '30 liters desi cow milk', rawCost: 1500, conversionCost: 300,
        outputYield: '1 kg pure bilona ghee', shelfLife: '12 months', marketPrice: 3000, unit: 'kg',
        demandNote: 'Hand-churned bilona ghee sells at ₹2500-3000/kg in cities vs ₹800 commercial! The secret of Pahadi strength.',
        special: true,
    },
];
export const calcProfit = (v) => v.marketPrice - v.rawCost - v.conversionCost;
export const calcMargin = (v) => Math.round((calcProfit(v) / (v.rawCost + v.conversionCost)) * 100);
export const WEATHER_DATA = [
    {
        district: 'Rudraprayag', altitude: '895m',
        now: { temp: 14, feels: 12, humidity: 62, wind: 8, icon: '⛅', condition: 'Partly Cloudy' },
        forecast: [
            { day: 'Tue', icon: '☀️', temp: '16°/6°', rain: 5 },
            { day: 'Wed', icon: '⛅', temp: '15°/5°', rain: 15 },
            { day: 'Thu', icon: '🌧️', temp: '12°/4°', rain: 70 },
            { day: 'Fri', icon: '☀️', temp: '15°/5°', rain: 10 },
        ],
        advisory: '🌧️ Rain expected Thursday — harvest ready rajma before Wednesday evening. Ideal week for sowing winter garlic after Friday.',
    },
    {
        district: 'Chamoli', altitude: '1,308m',
        now: { temp: 11, feels: 9, humidity: 58, wind: 12, icon: '☀️', condition: 'Sunny' },
        forecast: [
            { day: 'Tue', icon: '☀️', temp: '13°/3°', rain: 0 },
            { day: 'Wed', icon: '☀️', temp: '14°/4°', rain: 5 },
            { day: 'Thu', icon: '⛅', temp: '12°/2°', rain: 25 },
            { day: 'Fri', icon: '🌨️', temp: '8°/0°', rain: 60 },
        ],
        advisory: '🌨️ Light snow possible Friday at higher villages — cover nursery beds. Perfect sun-drying window Tue-Wed for lingda & apricots.',
    },
    {
        district: 'Uttarkashi', altitude: '1,158m',
        now: { temp: 12, feels: 10, humidity: 55, wind: 10, icon: '🌤️', condition: 'Mostly Sunny' },
        forecast: [
            { day: 'Tue', icon: '☀️', temp: '15°/4°', rain: 0 },
            { day: 'Wed', icon: '🌤️', temp: '14°/4°', rain: 10 },
            { day: 'Thu', icon: '⛅', temp: '13°/3°', rain: 20 },
            { day: 'Fri', icon: '☀️', temp: '14°/4°', rain: 5 },
        ],
        advisory: '🍎 Excellent apple orchard pruning week! Dry conditions ideal for lime-sulfur spray against apple scab.',
    },
    {
        district: 'Pithoragarh', altitude: '1,514m',
        now: { temp: 10, feels: 8, humidity: 60, wind: 14, icon: '⛅', condition: 'Partly Cloudy' },
        forecast: [
            { day: 'Tue', icon: '⛅', temp: '12°/2°', rain: 15 },
            { day: 'Wed', icon: '☀️', temp: '13°/3°', rain: 5 },
            { day: 'Thu', icon: '☀️', temp: '13°/3°', rain: 5 },
            { day: 'Fri', icon: '⛅', temp: '11°/1°', rain: 20 },
        ],
        advisory: '🌰 Walnut collection season — dry Wed-Thu perfect for harvest. Store gahat in dry jute bags this week.',
    },
    {
        district: 'Dehradun', altitude: '640m',
        now: { temp: 19, feels: 19, humidity: 65, wind: 6, icon: '☀️', condition: 'Clear' },
        forecast: [
            { day: 'Tue', icon: '☀️', temp: '22°/10°', rain: 0 },
            { day: 'Wed', icon: '☀️', temp: '23°/11°', rain: 0 },
            { day: 'Thu', icon: '🌤️', temp: '21°/10°', rain: 10 },
            { day: 'Fri', icon: '☀️', temp: '22°/10°', rain: 5 },
        ],
        advisory: '🌾 Ideal week for basmati field preparation. Turmeric harvest conditions excellent — dig gaazna haldi now for peak curcumin.',
    },
];
export const MARKET_NEEDS = [
    { product: 'Special Rotna packs', emoji: '🫓', demand: 'Very High', buyer: 'Yatra route shops, Dehradun stores', note: 'Kedarnath-Badrinath route shops asking for 500+ packs/week' },
    { product: 'Special Arsa gift boxes', emoji: '🍩', demand: 'Very High', buyer: 'Dehradun sweet shops, wedding orders', note: 'Wedding season — 3x normal orders coming in' },
    { product: 'Burans squash', emoji: '🌺', demand: 'High', buyer: 'Tourist cafes, homestays', note: 'Summer stock booking started — pre-orders open' },
    { product: 'Lingda pickle', emoji: '🌿', demand: 'High', buyer: 'City Pahadi families, exotic food stores', note: 'Iron-rich exotic pickle — Delhi/Mumbai orders growing' },
    { product: 'Bilona Ghee', emoji: '🧈', demand: 'Very High', buyer: 'Homestays, urban health stores', note: 'Always short supply — sell every drop you make' },
    { product: 'Gaazna Haldi powder', emoji: '✨', demand: 'Rising', buyer: 'Ayurveda brands', note: 'Rare variety — brands paying 3x for verified organic' },
    { product: 'Mandua laddu', emoji: '🟤', demand: 'High', buyer: 'Winter gifting, schools', note: 'Immunity laddu demand peaks Oct-Feb' },
    { product: 'Burans saplings', emoji: '🌱', demand: 'Rising', buyer: 'Forest dept, eco-resorts', note: 'Afforestation tenders open — bulk sapling contracts' },
];
export const TRACEABILITY = {
    apple: { farmer: 'Sundar Singh Rawat', village: 'Bagori', district: 'Uttarkashi (Harsil)', altitude: '2,620m', harvest: 'Sep 2025', method: 'Organic orchard, no wax, hand-picked' },
    redrice: { farmer: 'Bhagwati Devi', village: 'Sari', district: 'Rudraprayag', altitude: '1,980m', harvest: 'Oct 2025', method: 'Traditional gharat (water mill) ground' },
    rajma: { farmer: 'Ramesh Negi', village: 'Guptkashi', district: 'Rudraprayag', altitude: '1,320m', harvest: 'Oct 2025', method: 'GI-tagged seed, cow manure only' },
    honey: { farmer: 'Kishan Bisht', village: 'Munsiyari', district: 'Pithoragarh', altitude: '2,200m', harvest: 'Nov 2025', method: 'Wild multi-floral, raw & unheated' },
    ghee: { farmer: 'Parvati Devi SHG', village: 'Ukhimath', district: 'Rudraprayag', altitude: '1,311m', harvest: 'Fresh weekly', method: 'Desi Badri cow, hand-churned bilona' },
    mandua: { farmer: 'Mohan Singh Panwar', village: 'Chopta', district: 'Rudraprayag', altitude: '1,700m', harvest: 'Oct 2025', method: 'Rain-fed terrace farming, zero chemicals' },
    gaazna: { farmer: 'Deepa Rana', village: 'Jakholi', district: 'Rudraprayag', altitude: '1,550m', harvest: 'Dec 2025', method: 'Wild-harvested, shade dried, stone ground' },
    bhatt: { farmer: 'Harish Joshi', village: 'Kausani', district: 'Bageshwar', altitude: '1,890m', harvest: 'Oct 2025', method: 'Heritage seed, mixed cropping' },
    gahat: { farmer: 'Ganga Devi', village: 'Berinag', district: 'Pithoragarh', altitude: '1,740m', harvest: 'Nov 2025', method: 'Traditional terrace, sun dried' },
    jhangora: { farmer: 'Prem Singh', village: 'Baijnath', district: 'Bageshwar', altitude: '1,126m', harvest: 'Sep 2025', method: 'Organic millet rotation farming' },
};
export const getTrace = (productId, region) => TRACEABILITY[productId] ?? {
    farmer: 'Verified Partner Farmer',
    village: 'Hill village',
    district: region,
    altitude: '1,200m+',
    harvest: '2025 season',
    method: '100% organic, Himalayan Connect verified',
};
// ---------- B2B pricing helper (for homestays) ----------
export const getB2BPricing = (priceValue) => {
    const farmerPrice = Math.round(priceValue * 0.75); // direct from farmer
    const marketPrice = Math.round(priceValue * 1.35); // city market rate
    const saving = marketPrice - farmerPrice;
    const savingPct = Math.round((saving / marketPrice) * 100);
    return { farmerPrice, marketPrice, saving, savingPct };
};
