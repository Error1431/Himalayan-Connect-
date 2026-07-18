// ============================================
// SMART AI ENGINE
// - Fuzzy token-based matching (handles typos & word order)
// - 3-language detection: English / Hindi / Hinglish
// - Product recommendations with reasons
// ============================================
import { RECIPES } from '../data/recipes';
import { PRODUCTS, getProductById } from '../data/products';
import { VALUE_PRODUCTS, calcProfit, calcMargin, WEATHER_DATA } from '../data/valueadd';
import { CROP_CALENDAR, ROOM_PRICING, MENU_SUGGESTIONS, ORGANIC_VS_MARKET, CUSTOMER_STATS, STAY_LISTINGS, MARKET_COMPARE, ATTRACTION_TIPS, SEASONAL_FOOD, } from '../data/roledata';
// ---------- Language detection ----------
const HINGLISH_WORDS = /\b(kya|hai|hain|kaise|banate|banau|banaye|batao|bata|bhaiya|bhai|mujhe|mera|meri|kitna|kitne|bhav|daam|kheti|fasal|karo|chahiye|dikhao|acha|accha|theek|nahi|nhi|haan|poochho|karein|krna|karna|wala|wali|ka|ki|ke|se|mein|aur|recipe batao|kaha|kahan|milega|lena|kharidna|order)\b/i;
export const detectLang = (q) => {
    if (/[\u0900-\u097F]/.test(q))
        return 'hi';
    if (HINGLISH_WORDS.test(q))
        return 'hing';
    return 'en';
};
// ---------- Localized strings ----------
const T = {
    en: {
        region: 'Region',
        time: 'Time',
        difficulty: 'Difficulty',
        calories: 'Calories',
        about: 'About this dish',
        ingredients: 'Ingredients',
        steps: 'Cooking Steps',
        tip: "Chef's Tip",
        nutrition: 'Nutrition',
        recipeIntro: 'Here is the authentic recipe for',
        productSuggest: '🛒 Recommended products for this recipe (tap Buy Now below):',
        helpline: '\n\n📞 Agri Helpline: 1800-180-1551 (Toll-Free) | Code: 1551',
        greeting: "🙏 **Namaste! I'm your Pahadi Mitra** — the official AI assistant of Himalayan Connect.\n\nI can help you with:\n🍽️ 20+ authentic Uttarakhand recipes (Kafuli, Chainsoo, Singori...)\n🛒 Organic products with prices & Buy Now\n🌾 Organic farming guidance\n🏡 Eco homestay bookings\n💰 Crop prices & profit analysis\n\nAsk me anything in English, Hindi or Hinglish!",
        thanks: '🙏 You are most welcome! Your Pahadi Mitra is always here to help. Feel free to ask anything else!',
        fallback: "🌱 **Your Pahadi Mitra is listening!**\n\nI can help you with:\n🍽️ Recipes — try *\"Urad Dal ke Pakode recipe\"*\n💰 Prices — try *\"Rajma price\"*\n🛒 Products — try *\"organic honey\"* or *\"red rice\"*\n🏡 Homestays — try *\"Chopta homestay\"*\n🌾 Farming — try *\"organic farming tips\"*",
        priceTitle: '💰 **Current Market Prices (Himalayan Connect)**',
        priceTip: '💡 Direct selling through our platform = 50-120% more profit for farmers!',
        farmingTitle: '🌾 **Organic Farming Guide**',
        productTitle: 'Here are our organic products:',
        whyBuyLabel: '✨ Why buy',
        buyHint: '👇 Tap "Buy Now" on any product card below to order!',
        recipeList: '🏔️ **Famous Recipes of Uttarakhand** — ask me for any of these:',
        recipeListHint: '\n💬 Just type the name, e.g. *"Kafuli recipe"* or *"How to make Singori"*',
    },
    hi: {
        region: 'क्षेत्र',
        time: 'समय',
        difficulty: 'कठिनाई',
        calories: 'कैलोरी',
        about: 'इस व्यंजन के बारे में',
        ingredients: 'सामग्री',
        steps: 'बनाने की विधि',
        tip: 'शेफ की सलाह',
        nutrition: 'पोषण',
        recipeIntro: 'यह रही प्रामाणिक रेसिपी —',
        productSuggest: '🛒 इस रेसिपी के लिए सुझाए गए उत्पाद (नीचे Buy Now दबाएं):',
        helpline: '\n\n📞 कृषि हेल्पलाइन: 1800-180-1551 (टोल-फ्री) | कोड: 1551',
        greeting: '🙏 **नमस्ते! मैं आपका पहाड़ी मित्र हूं** — Himalayan Connect का आधिकारिक AI सहायक।\n\nमैं आपकी मदद कर सकता हूं:\n🍽️ 20+ प्रामाणिक उत्तराखंडी रेसिपी\n🛒 जैविक उत्पाद और कीमतें\n🌾 जैविक खेती मार्गदर्शन\n🏡 इको होमस्टे बुकिंग\n\nहिंदी, अंग्रेजी या हिंग्लिश में कुछ भी पूछें!',
        thanks: '🙏 आपका बहुत-बहुत स्वागत है! आपका पहाड़ी मित्र हमेशा सेवा में है। कुछ और पूछना हो तो बेझिझक पूछें!',
        fallback: '🌱 **आपका पहाड़ी मित्र सुन रहा है!**\n\nमैं मदद कर सकता हूं:\n🍽️ रेसिपी — *"काफुली रेसिपी"*\n💰 दाम — *"राजमा का भाव"*\n🛒 उत्पाद — *"जैविक शहद"* या *"लाल चावल"*\n🏡 होमस्टे — *"चोपता होमस्टे"*\n🌾 खेती — *"जैविक खेती टिप्स"*',
        priceTitle: '💰 **वर्तमान बाजार भाव (Himalayan Connect)**',
        priceTip: '💡 हमारे प्लेटफॉर्म से सीधी बिक्री = किसानों को 50-120% अधिक मुनाफा!',
        farmingTitle: '🌾 **जैविक खेती गाइड**',
        productTitle: 'यह रहे हमारे जैविक उत्पाद:',
        whyBuyLabel: '✨ क्यों खरीदें',
        buyHint: '👇 ऑर्डर करने के लिए नीचे किसी भी कार्ड पर "Buy Now" दबाएं!',
        recipeList: '🏔️ **उत्तराखंड की प्रसिद्ध रेसिपी** — इनमें से कोई भी पूछें:',
        recipeListHint: '\n💬 बस नाम लिखें, जैसे *"काफुली रेसिपी"* या *"सिंगोड़ी कैसे बनाएं"*',
    },
    hing: {
        region: 'Region',
        time: 'Time',
        difficulty: 'Difficulty',
        calories: 'Calories',
        about: 'Is dish ke baare mein',
        ingredients: 'Samagri (Ingredients)',
        steps: 'Banane ki Vidhi (Steps)',
        tip: 'Chef ki Salah',
        nutrition: 'Nutrition',
        recipeIntro: 'Ye rahi authentic recipe —',
        productSuggest: '🛒 Is recipe ke liye recommended products (neeche Buy Now dabayein):',
        helpline: '\n\n📞 Agri Helpline: 1800-180-1551 (Toll-Free) | Code: 1551',
        greeting: '🙏 **Namaste! Main aapka Pahadi Mitra hoon** — Himalayan Connect ka official AI assistant.\n\nMain aapki madad kar sakta hoon:\n🍽️ 20+ authentic Uttarakhand recipes\n🛒 Organic products with prices & Buy Now\n🌾 Organic farming guidance\n🏡 Eco homestay bookings\n\nEnglish, Hindi ya Hinglish — kisi bhi bhasha mein poochhein!',
        thanks: '🙏 Aapka bahut swagat hai! Aapka Pahadi Mitra hamesha seva mein hai. Aur kuch poochna ho toh bejhijhak poochhein!',
        fallback: '🌱 **Aapka Pahadi Mitra sun raha hai!**\n\nMain madad kar sakta hoon:\n🍽️ Recipes — *"Urad Dal ke Pakode recipe"*\n💰 Prices — *"Rajma ka bhav"*\n🛒 Products — *"organic honey"* ya *"red rice"*\n🏡 Homestays — *"Chopta homestay"*\n🌾 Farming — *"organic kheti tips"*',
        priceTitle: '💰 **Current Market Prices (Himalayan Connect)**',
        priceTip: '💡 Hamare platform se direct selling = farmers ko 50-120% zyada munafa!',
        farmingTitle: '🌾 **Organic Kheti Guide**',
        productTitle: 'Ye rahe hamare organic products:',
        whyBuyLabel: '✨ Kyun kharidein',
        buyHint: '👇 Order karne ke liye neeche kisi bhi card par "Buy Now" dabayein!',
        recipeList: '🏔️ **Uttarakhand ki Famous Recipes** — inme se koi bhi poochhein:',
        recipeListHint: '\n💬 Bas naam likhein, jaise *"Kafuli recipe"* ya *"Singori kaise banayein"*',
    },
};
// ---------- Fuzzy recipe matching (token-score based) ----------
const normalize = (s) => s
    .toLowerCase()
    .replace(/[^\w\s\u0900-\u097F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
const STOP_WORDS = new Set([
    'recipe', 'of', 'the', 'a', 'an', 'how', 'to', 'make', 'batao', 'bata',
    'kaise', 'banate', 'banaye', 'banau', 'hain', 'hai', 'ki', 'ka', 'ke',
    'please', 'me', 'mujhe', 'chahiye', 'do', 'de', 'dena', 'for', 'and',
    'रेसिपी', 'कैसे', 'बनाएं', 'बताओ',
]);
export const findRecipe = (query) => {
    const q = normalize(query);
    const qTokens = q.split(' ').filter((t) => t.length > 1 && !STOP_WORDS.has(t));
    if (qTokens.length === 0 && q.length === 0)
        return null;
    let bestKey = null;
    let bestScore = 0;
    for (const [key, recipe] of Object.entries(RECIPES)) {
        let score = 0;
        // 1. Full alias substring match (highest priority)
        for (const alias of recipe.aliases) {
            const a = normalize(alias);
            if (q.includes(a))
                score = Math.max(score, 100 + a.length);
        }
        // 2. Token overlap scoring (handles "recipe of urad dal ke pakode")
        const recipeTokens = new Set();
        recipe.aliases.forEach((a) => normalize(a).split(' ').forEach((t) => t.length > 1 && recipeTokens.add(t)));
        normalize(recipe.name).split(' ').forEach((t) => t.length > 1 && recipeTokens.add(t));
        let overlap = 0;
        for (const token of qTokens) {
            if (recipeTokens.has(token))
                overlap += 10;
            else {
                // partial/typo match: token is prefix of a recipe token or vice versa
                for (const rt of recipeTokens) {
                    if (rt.length > 3 && token.length > 3 && (rt.startsWith(token) || token.startsWith(rt))) {
                        overlap += 6;
                        break;
                    }
                }
            }
        }
        score = Math.max(score, overlap);
        if (score > bestScore) {
            bestScore = score;
            bestKey = key;
        }
    }
    // Require a reasonable confidence
    if (bestKey && bestScore >= 10)
        return { key: bestKey, recipe: RECIPES[bestKey] };
    return null;
};
// ---------- Response builders ----------
const buildRecipeText = (recipe, lang) => {
    const t = T[lang];
    return (`🍽️ **${recipe.name}** ${recipe.emoji}\n\n` +
        `📍 **${t.region}:** ${recipe.region}\n` +
        `⏱️ **${t.time}:** ${recipe.time} | 🔥 **${t.difficulty}:** ${recipe.difficulty} | 📊 **${t.calories}:** ${recipe.calories}\n\n` +
        `📖 **${t.about}:**\n${recipe.description}\n\n` +
        `📋 **${t.ingredients}:**\n${recipe.ingredients.map((ing, i) => `${i + 1}. ${ing}`).join('\n')}\n\n` +
        `👨‍🍳 **${t.steps}:**\n${recipe.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n` +
        `💡 **${t.tip}:** ${recipe.tips}\n\n` +
        `🥗 **${t.nutrition}:** ${recipe.nutrition}\n\n` +
        `${t.productSuggest}` +
        t.helpline);
};
const matchProducts = (q) => {
    const matched = [];
    const checks = [
        [/apple|seb|सेब/, ['apple']],
        [/mango|aam|आम/, ['mango']],
        [/strawberry/, ['strawberry']],
        [/walnut|akhrot|अखरोट/, ['walnut']],
        [/kafal|काफल/, ['kafal']],
        [/honey|shahad|madhu|शहद/, ['honey']],
        [/ghee|घी/, ['ghee']],
        [/red rice|ghariya|lal chawal|घरिया|लाल चावल/, ['redrice']],
        [/mandua|ragi|raagi|मंडुवा/, ['mandua']],
        [/jhangora|झंगोरा/, ['jhangora']],
        [/rajma|राजमा/, ['rajma', 'rajma2']],
        [/bhatt|भट्ट/, ['bhatt']],
        [/gahat|गहत/, ['gahat']],
        [/turmeric|haldi|हल्दी/, ['turmeric', 'gaazna']],
        [/buckwheat|kuttu|lingda|कुट्टू/, ['buckwheat']],
        [/chopta|चोपता/, ['chopta']],
        [/auli|औली/, ['auli']],
        [/munsiyari|मुनस्यारी/, ['munsiyari']],
        [/harsil|हर्षिल/, ['harsil']],
    ];
    for (const [re, ids] of checks) {
        if (re.test(q))
            ids.forEach((id) => {
                const p = getProductById(id);
                if (p && !matched.includes(p))
                    matched.push(p);
            });
    }
    return matched;
};
// ---------- Main AI ----------
export const generateAIResponse = (userMessage, role = 'user') => {
    const q = normalize(userMessage);
    const lang = detectLang(userMessage);
    const t = T[lang];
    // ========== GUEST (not logged in) — limited assistant ==========
    // Guests get a small, safe subset of help and are nudged to log in for
    // the full farmer / homestay / customer assistant tied to their account.
    if (role === 'guest') {
        const isGreeting = /^(hi|hello|hey|namaste|namaskar|start)$/.test(q.trim());
        const wantsProducts = /(product|organic|buy|price|खरीद|उत्पाद)/.test(q);
        const wantsRooms = /(room|homestay|stay|book|कमरा|होमस्टे)/.test(q);
        let hint = 'Ask me about products or homestays, or tell me what you\'re looking for.';
        if (wantsProducts) hint = 'You can browse organic products from the **Products** page — prices, farmer details and ordering are all there.';
        if (wantsRooms) hint = 'You can browse homestays from the **Homestays** page — you\'ll see pricing and can book direct.';
        return {
            text: `👋 **Hi, I'm your Himalayan Connect Assistant.**\n\n` +
                (isGreeting ? '' : `${hint}\n\n`) +
                `I'm a limited guest assistant right now. **Please log in or register** according to what you are — Farmer, Homestay Owner, or Customer — to unlock your full personal AI assistant with dashboards, recommendations and more.\n\n` +
                `🔐 [Login](/login) · [Register](/register)`,
        };
    }
    // ========== ROLE-SPECIFIC INTENTS (checked first) ==========
    // FARMER: what to grow / crop suggestion (professional, to-the-point)
    if (role === 'farmer' &&
        /(what.*grow|kya ugau|kya ugaye|kaunsi fasal|which crop|crop suggest|suggest crop|kab ugaye|when.*grow|kab boye|sowing|फसल|क्या उगाएं|बुवाई)/.test(q)) {
        const month = new Date().getMonth(); // 0-11
        const seasonKey = month >= 1 && month <= 3 ? 'Spring (Feb-Apr)'
            : month >= 4 && month <= 5 ? 'Summer (May-Jun)'
                : month >= 6 && month <= 8 ? 'Monsoon (Jul-Sep)'
                    : 'Autumn/Winter (Oct-Jan)';
        const current = CROP_CALENDAR[seasonKey];
        const currentRows = current
            .map((c) => `${c.emoji} **${c.crop}** — Sow: ${c.sowing} | Harvest: ${c.harvest} | 💰 Sell at: **${c.expectedPrice}**`)
            .join('\n');
        return {
            text: `🌱 **AI Crop Advisor** (Professional Recommendation)\n\n` +
                `📅 **Grow NOW — ${seasonKey}:**\n${currentRows}\n\n` +
                `🎯 **My top pick this season:** ${current[0].emoji} ${current[0].crop} — ${current[0].profitNote}\n\n` +
                `🌤️ Weather need: ${current[0].weatherNeed}\n` +
                `Check **Dashboard** rain forecast before sowing day.\n\n` +
                `💬 Ask me: *"market price compare"* or *"profit calculate"* for the next step!` +
                t.helpline,
        };
    }
    // FARMER: market price comparison from other websites
    if (role === 'farmer' &&
        /(market price|price compare|compare price|dusri site|other site|bigbasket|amazon|jiomart|kitne price|kitna price|online price|बाजार भाव)/.test(q)) {
        const item = MARKET_COMPARE.find((m) => q.includes(m.product.toLowerCase().split('/')[0].split(' ')[0].toLowerCase()));
        if (item) {
            const rows = item.sites.map((s) => `   • ${s.site}: ₹${s.price}/${item.unit}`).join('\n');
            return {
                text: `📊 **Market Price Comparison — ${item.product}** ${item.emoji}\n\n${rows}\n\n` +
                    `✅ **Your direct price: ₹${item.ourPrice}/${item.unit}**\n\n💡 ${item.advice}` +
                    t.helpline,
            };
        }
        const all = MARKET_COMPARE.map((m) => {
            const best = Math.max(...m.sites.filter((s) => !s.site.includes('you get')).map((s) => s.price));
            const mandi = m.sites.find((s) => s.site.includes('you get')).price;
            return `${m.emoji} **${m.product}**: Online sites ₹${best} | Mandi gives ₹${mandi} | ✅ Sell direct: **₹${m.ourPrice}**`;
        }).join('\n');
        return {
            text: `📊 **Market Price Comparison (Live from major sites)**\n\n${all}\n\n` +
                `💡 Rule: NEVER sell at mandi rate — direct selling earns 60-100% more!\n` +
                `💬 Ask *"rajma price compare"* for detailed site-wise breakdown.` +
                t.helpline,
        };
    }
    // FARMER: profit/loss calculator (parses numbers from query)
    if (role === 'farmer' &&
        /(calculat|hisab|kitne pese|kitna milega|kitna profit|bechu to|dunga to|becha to|profit.*nikal|हिसाब|कितना मिलेगा)/.test(q)) {
        const nums = (userMessage.match(/\d+(\.\d+)?/g) || []).map(Number).filter((n) => n > 0);
        if (nums.length >= 2) {
            const [price, qty] = nums;
            const revenue = price * qty;
            const estCost = Math.round(revenue * 0.55);
            const profit = revenue - estCost;
            const perUnit = Math.round(profit / qty);
            return {
                text: `🧮 **AI Profit Calculator**\n\n` +
                    `📦 Selling **${qty} units** at **₹${price}** each:\n\n` +
                    `   💵 Total Revenue: ₹${price} × ${qty} = **₹${revenue.toLocaleString('en-IN')}**\n` +
                    `   ⚙️ Est. Production Cost (~55%): −₹${estCost.toLocaleString('en-IN')}\n` +
                    `   ────────────────\n` +
                    `   ✅ **Net Profit: ₹${profit.toLocaleString('en-IN')}** (₹${perUnit}/unit)\n` +
                    `   📈 Margin: ${Math.round((profit / estCost) * 100)}%\n\n` +
                    `💡 **To earn more:** value-addition (laddu/pickle/ghee) lifts margin to 150-275% — check **Value-Add** tab!\n` +
                    `💬 Tell me your exact cost — e.g. *"cost 300 price 500 qty 10"* — for a precise calculation.` +
                    t.helpline,
            };
        }
        if (nums.length === 3) {
            // handled above by first two; keep simple
        }
        return {
            text: `🧮 **AI Profit Calculator — Ready!**\n\n` +
                `Tell me price and quantity, e.g.:\n` +
                `• *"500 mein dunga to 10 product ke kitne milenge?"*\n` +
                `• *"calculate 150 x 40 kg rajma"*\n\n` +
                `I will show revenue, estimated cost, net profit and margin instantly!` +
                t.helpline,
        };
    }
    // FARMER: how much to grow/sell to stay in profit
    if (role === 'farmer' &&
        /(kitna grow|kitna ugau|kitna ugana|how much grow|kitna bechu|kitna sell|how much sell|quantity|कितना उगाऊं|कितना बेचूं)/.test(q)) {
        return {
            text: `⚖️ **AI Grow & Sell Planner (Stay in Profit)**\n\n` +
                `**Golden rules for a hill farm (per season):**\n` +
                `🫘 Rajma: grow **200-300 kg** — sell 80% direct (₹150/kg), keep 20% as seed/home\n` +
                `🌾 Mandua: grow **400+ kg** — sell only 40% raw, convert 60% to laddu/flour (+350% income)\n` +
                `🍚 Ghariya Chawal: **150-200 kg** — city demand exceeds supply, sell 90%\n` +
                `🧈 Ghee: make from **all surplus milk** — it never sells at a loss (₹2,800/kg)\n\n` +
                `📌 **Profit formula:** Sell 70% at harvest peak price, hold 30% for off-season when prices rise 20-30%.\n` +
                `📌 Never sell more than 50% to one buyer — price bargaining power stays with you!` +
                t.helpline,
        };
    }
    // FARMER: how to attract customers
    if (role === 'farmer' &&
        /(customer attract|attract customer|grahak|kaise bechu|how to sell|marketing|zyada bech|sales badha|ग्राहक)/.test(q)) {
        return {
            text: `🎯 **AI Marketing Coach — How to Attract Customers**\n\n${ATTRACTION_TIPS.map((tip) => tip).join('\n\n')}\n\n` +
                `🏆 **The #1 rule:** Your story IS your brand. City customers don't buy rajma — they buy "GI-tagged rajma grown at 1,800m by a real Pahadi farmer family."` +
                t.helpline,
        };
    }
    // FARMER: market analysis / price suggestion
    if (role === 'farmer' &&
        /(market analy|price suggest|kitne mein bech|kitna price rakh|sell price|selling price|mandi|profit loss|loss|कितने में बेच|मंडी)/.test(q)) {
        return {
            text: `📊 **AI Market Analysis — What to Sell & At What Price**\n\n` +
                `**Current best sellers (price you should charge):**\n` +
                `🫘 Rajma: sell at **₹150/kg** (mandi gives only ₹85-95 — sell direct!)\n` +
                `🍎 Harsil Apple: **₹180-220/kg** direct vs ₹110 to middlemen\n` +
                `🌾 Mandua: raw ₹120/kg — but as **laddu = ₹1,050/batch (+350%)**\n` +
                `🍚 Ghariya Chawal: **₹200-220/kg** — city demand exceeds supply!\n` +
                `🧈 Bilona Ghee: **₹2,800-3,000/kg** — never sell below ₹2,500\n\n` +
                `**⚠️ Loss alerts:**\n` +
                `📉 Selling raw lingda in local market = ₹160/kg, spoils in 2 days → 40% wastage loss. Convert to pickle!\n` +
                `📉 Mandi middlemen take 55-70% of final price — avoid!\n\n` +
                `📈 Open **Market** tab for full profit/loss bars & live demand signals.` +
                t.helpline,
        };
    }
    // HOMESTAY: room price / budget suggestion (vs OYO, MakeMyTrip etc.)
    if (role === 'homestay' &&
        /(room price|room rate|budget|kitna price|kitna rakhu|kitna charge|pricing|oyo|makemytrip|booking com|airbnb|compare.*room|room.*compare|कितना|किराया)/.test(q)) {
        const loc = ROOM_PRICING.find((r) => q.includes(r.location.toLowerCase())) ?? ROOM_PRICING[0];
        const otaRows = loc.otaRates.map((o) => `   • ${o.site}: ₹${o.rate.toLocaleString('en-IN')}/night`).join('\n');
        return {
            text: `🏡 **AI Room Pricing Advisor — ${loc.location}** ${loc.emoji}\n\n` +
                `**What OTA sites charge nearby (${loc.yourType}):**\n${otaRows}\n   📊 Market average: **₹${loc.avgMarket.toLocaleString('en-IN')}/night**\n\n` +
                `✅ **AI Suggested price for you: ₹${loc.suggestedMin.toLocaleString('en-IN')}-${loc.suggestedMax.toLocaleString('en-IN')}/night**\n\n` +
                `**Why this price wins:**\n${loc.reasoning}\n\n` +
                `📅 **Occupancy strategy:**\n${loc.occupancyTip}\n\n` +
                `💡 Ask me *"room price in Auli/Munsiyari/Harsil"* for other locations!` +
                t.helpline,
        };
    }
    // HOMESTAY: seasonal/weather-based food suggestion
    if (role === 'homestay' &&
        /(sardi|thand|winter|cold|garmi|summer|hot weather|barsaat|barish|monsoon|mausam|season.*food|food.*season|weather.*khana|khana.*weather|ठंड|सर्दी|गर्मी|बरसात|मौसम)/.test(q)) {
        let key;
        if (/(sardi|thand|winter|cold|ठंड|सर्दी)/.test(q))
            key = 'winter';
        else if (/(garmi|summer|hot|गर्मी)/.test(q))
            key = 'summer';
        else if (/(barsaat|barish|monsoon|बरसात)/.test(q))
            key = 'monsoon';
        else {
            const m = new Date().getMonth();
            key = m >= 10 || m <= 1 ? 'winter' : m >= 5 && m <= 8 ? 'monsoon' : 'summer';
        }
        const s = SEASONAL_FOOD[key];
        return {
            text: `${s.title}\n\n${s.why}\n\n${s.dishes.map((d) => `• ${d}`).join('\n')}\n\n` +
                `🥤 **Signature drink:** ${s.drink}\n\n` +
                `💬 Ask me any dish recipe — e.g. *"Thhatwani recipe"* — full cooking steps + ingredient Buy Now cards!` +
                t.helpline,
            products: key === 'winter'
                ? [getProductById('ghee'), getProductById('gahat'), getProductById('honey')]
                : key === 'summer'
                    ? [getProductById('jhangora'), getProductById('redrice')]
                    : [getProductById('mandua'), getProductById('honey')],
        };
    }
    // HOMESTAY: menu suggestion for guests
    if (role === 'homestay' &&
        /(menu|khana kya|kya banau|kya khila|guest.*food|food.*guest|thali|breakfast|lunch|dinner|मेन्यू|थाली)/.test(q)) {
        return {
            text: `🍽️ **AI Organic Menu Planner — Keep Guests Happy!**\n\n` +
                `🌅 **Breakfast:**\n${MENU_SUGGESTIONS.breakfast.map((m) => `• ${m}`).join('\n')}\n\n` +
                `🌞 **Lunch:**\n${MENU_SUGGESTIONS.lunch.map((m) => `• ${m}`).join('\n')}\n\n` +
                `🌙 **Dinner:**\n${MENU_SUGGESTIONS.dinner.map((m) => `• ${m}`).join('\n')}\n\n` +
                `🍮 **Desserts:**\n${MENU_SUGGESTIONS.desserts.map((m) => `• ${m}`).join('\n')}\n\n` +
                `🥤 **Welcome drink:**\n${MENU_SUGGESTIONS.welcome.map((m) => `• ${m}`).join('\n')}\n\n` +
                `📊 **Why organic menu?** ${CUSTOMER_STATS.likeOrganic}% guests prefer organic Pahadi food, ${CUSTOMER_STATS.repeatBooking}% rebook when served organic, ${CUSTOMER_STATS.payMore}% happily pay 10-15% more!\n` +
                `⭐ ${CUSTOMER_STATS.reviews}\n\n` +
                `💬 Ask me any recipe — e.g. *"Kafuli recipe"* — and buy ingredients with the product cards!` +
                t.helpline,
        };
    }
    // HOMESTAY + USER: organic vs market comparison
    if (/(organic vs|vs market|market product|difference.*organic|organic.*difference|market se|market wale|fark|फर्क|अंतर|kyu organic|why organic|benefit.*organic|organic.*benefit)/.test(q)) {
        const rows = ORGANIC_VS_MARKET.map((o) => `${o.emoji} **${o.aspect}**\n   ✅ Organic: ${o.organic}\n   ❌ Market: ${o.market}`).join('\n\n');
        const statLine = role === 'homestay'
            ? `\n\n📊 **For your homestay:** ${CUSTOMER_STATS.likeOrganic}% guests prefer organic, ${CUSTOMER_STATS.payMore}% pay more for it. ${CUSTOMER_STATS.reviews}`
            : '';
        return {
            text: `🌿 **Organic vs Market Products — The Honest Comparison**\n\n${rows}${statLine}\n\n` +
                `🛒 Every product on Himalayan Connect is traceable to the exact farmer & village!` +
                t.helpline,
            products: [getProductById('honey'), getProductById('ghee'), getProductById('apple')],
        };
    }
    // USER: room/homestay recommendation by location
    if (role === 'user' &&
        /(room|stay|homestay|hotel|book|rukna|kaha ruku|kahan ruk|where.*stay|suggest.*stay|कहां रुकूं|होटल|कमरा)/.test(q)) {
        const locMatch = STAY_LISTINGS.find((s) => q.includes(s.location.toLowerCase()));
        if (locMatch) {
            const savings = locMatch.otaAvg - locMatch.price;
            return {
                text: `🏡 **Best Stay in ${locMatch.location}** ${locMatch.emoji}\n\n` +
                    `⭐ **${locMatch.name}** — ${locMatch.rating}★\n` +
                    `💰 Direct price: **₹${locMatch.price.toLocaleString('en-IN')}/night** (OTA sites avg: ₹${locMatch.otaAvg.toLocaleString('en-IN')} — you save ₹${savings.toLocaleString('en-IN')}!)\n\n` +
                    `**Highlights:**\n${locMatch.highlights.map((h) => `✅ ${h}`).join('\n')}\n\n` +
                    `🎯 **Best for:** ${locMatch.bestFor}\n\n` +
                    `📞 Book direct: **1800-180-1551** — no commission, better price, authentic experience!`,
            };
        }
        const list = STAY_LISTINGS.map((s) => `${s.emoji} **${s.name}** (${s.location}) — ${s.rating}★\n   ₹${s.price.toLocaleString('en-IN')}/night (OTA avg ₹${s.otaAvg.toLocaleString('en-IN')} — save ₹${(s.otaAvg - s.price).toLocaleString('en-IN')}!)\n   🎯 ${s.bestFor}`).join('\n\n');
        return {
            text: `🏔️ **AI Stay Recommendations — Compared with OTA Market Rates**\n\n${list}\n\n` +
                `💬 Tell me your location — e.g. *"rooms in Chopta"* or *"stay in Munsiyari"* — for a detailed comparison!\n` +
                `📞 Direct booking: **1800-180-1551**`,
        };
    }
    // 1. Greetings
    if (/^(hello|hi+|hey|namaste|namaskar|नमस्ते|नमस्कार|salaam|hola)\b/.test(q) && q.split(' ').length <= 3) {
        return { text: t.greeting + t.helpline };
    }
    // 2. Thanks
    if (/(thank|thanks|dhanyawad|dhanyavad|shukriya|धन्यवाद|शुक्रिया)/.test(q)) {
        return { text: t.thanks + t.helpline };
    }
    // 3. Recipe list request
    if (/(all|sab|saari|sari|list|famous|kaun|konsi|which|कौन|सारी)/.test(q) && /(recipe|dish|khana|food|रेसिपी|व्यंजन)/.test(q)) {
        const list = Object.values(RECIPES)
            .map((r) => `${r.emoji} **${r.name}** — ${r.region}`)
            .join('\n');
        return { text: `${t.recipeList}\n\n${list}${t.recipeListHint}${t.helpline}` };
    }
    // 4. Recipe fuzzy match (farmers get business info instead of recipes)
    const found = findRecipe(userMessage);
    const isRecipeIntent = /(recipe|banate|banaye|banau|kaise|how|make|cook|vidhi|रेसिपी|बनाएं|विधि)/.test(q);
    if (found && (isRecipeIntent || found.recipe.aliases.some((a) => q.includes(normalize(a))))) {
        if (role === 'farmer') {
            const products = found.recipe.relatedProducts
                .map((id) => getProductById(id))
                .filter((p) => !!p);
            const crop = products[0];
            return {
                text: `💼 **Business Intel — ${found.recipe.name}** ${found.recipe.emoji}\n\n` +
                    `This dish is in demand — that means YOUR crops sell! Focus on business, not cooking:\n\n` +
                    `**Key benefits to tell buyers (your selling points):**\n` +
                    `✅ ${found.recipe.nutrition}\n` +
                    `✅ Authentic ${found.recipe.region} tradition — city customers pay premium for this story\n` +
                    `✅ Homestays & restaurants need ingredients for this dish regularly\n` +
                    `✅ ${found.recipe.tips}\n\n` +
                    (crop
                        ? `**Sell your ${crop.name} at: ${crop.price}/${crop.unit}** (never below this — city sites charge 30-60% more!)\n\n`
                        : '') +
                    `🎯 **Business move:** Contact homestays serving this dish — offer weekly ingredient supply contracts. Steady income beats one-time mandi sales!\n\n` +
                    `💬 Ask me: *"market price compare"* or *"profit calculate"* for numbers.` +
                    t.helpline,
                products,
            };
        }
        const products = found.recipe.relatedProducts
            .map((id) => getProductById(id))
            .filter((p) => !!p);
        return { text: buildRecipeText(found.recipe, lang), recipe: true, products };
    }
    // HOMESTAY: room design, cleanliness & hygiene coach
    if (role === 'homestay' &&
        /(design|decor|interior|saaf|safai|clean|hygiene|hygien|room ready|room set|maintain|सफाई|डिज़ाइन)/.test(q)) {
        return {
            text: `🏡 **AI Homestay Design & Hygiene Coach**\n\n` +
                `**Room design (Pahadi premium look):**\n` +
                `🪵 Use local wood + ringal bamboo decor — guests photograph it, free marketing!\n` +
                `🧶 Local woolen throws & Aipan art on walls — authentic > fancy\n` +
                `🪟 Keep windows unblocked — mountain view IS your best decor\n` +
                `💡 Warm yellow lighting, not white tube lights\n` +
                `🌿 Fresh burans/marigold flowers in rooms daily\n\n` +
                `**Hygiene checklist (non-negotiable — reviews depend on it):**\n` +
                `✅ Fresh linen EVERY guest — sun-dry for that mountain freshness\n` +
                `✅ Bathroom deep-clean daily, hair-free drains, fresh towels\n` +
                `✅ Kitchen visible & spotless — guests LOVE open Pahadi kitchens\n` +
                `✅ Water filter serviced + boiled water option\n` +
                `✅ Dustbins with lids, daily clearing, no plastic litter around property\n\n` +
                `**Stock organic (guests notice!):**\n` +
                `🧈 Bilona Ghee on the table • 🍯 Honey jars in rooms • 🌺 Burans welcome drink\n` +
                `📊 Organic-serving homestays average 4.7★ vs 4.1★ — cleanliness + organic = repeat bookings!` +
                t.helpline,
            products: [getProductById('ghee'), getProductById('honey'), getProductById('redrice')],
        };
    }
    // CUSTOMER: location, environment & fresh-air benefits
    if (role === 'user' &&
        /(location benefit|fresh air|environment|nature|hawa|mahol|view|scenery|kyu jau|why visit|kya milega|वातावरण|हवा|नज़ारा)/.test(q)) {
        return {
            text: `🏔️ **Why Stay at a Himalayan Connect Homestay?**\n\n` +
                `**The location advantage:**\n` +
                `🌄 Wake up to Himalayan peaks — Chopta (Chaukhamba), Munsiyari (Panchachuli), Auli (Nanda Devi)\n` +
                `🌬️ Pure oxygen-rich mountain air at 1,800-2,600m — city AQI 300 vs hills AQI 30!\n` +
                `🌲 Deodar-oak forests, star-filled night skies, zero noise pollution\n` +
                `🏞️ Rivers, waterfalls & treks right from your doorstep\n\n` +
                `**The organic food advantage:**\n` +
                `🍽️ Every meal from the farm you can SEE — zero chemicals, zero cold storage\n` +
                `💪 Mandua, red rice, bhatt — superfoods city restaurants charge 5x for\n` +
                `🧈 Real bilona ghee & raw honey — taste you cannot get in cities\n\n` +
                `**What you get from local families:**\n` +
                `❤️ Real Pahadi hospitality, home-cooked food, local trek secrets\n` +
                `💰 Your money goes 100% to the farmer family, not corporate chains\n\n` +
                `💬 Tell me a location — *"rooms in Chopta"* — and I'll find your perfect stay!`,
        };
    }
    // 5. Direct product queries
    const directProducts = matchProducts(q);
    if (directProducts.length > 0) {
        const intro = directProducts
            .map((p) => `${p.emoji} **${p.name}** — ${p.price}/${p.unit} (${p.region})\n${t.whyBuyLabel}: ${p.whyBuy}`)
            .join('\n\n');
        return {
            text: `${t.productTitle}\n\n${intro}\n\n${t.buyHint}${t.helpline}`,
            products: directProducts,
        };
    }
    // 6. Category product queries
    if (/(fruit|fal|फल)/.test(q)) {
        const products = PRODUCTS.filter((p) => p.category === 'Fruits').slice(0, 6);
        return { text: `🍎 ${t.productTitle}\n\n${t.buyHint}${t.helpline}`, products };
    }
    if (/(grain|chawal|rice|anaaj|atta|flour|अनाज|चावल)/.test(q)) {
        const products = PRODUCTS.filter((p) => p.category === 'Grains');
        return { text: `🌾 ${t.productTitle}\n\n${t.buyHint}${t.helpline}`, products };
    }
    if (/(dal|pulse|lentil|दाल)/.test(q)) {
        const products = PRODUCTS.filter((p) => p.category === 'Pulses');
        return { text: `🫘 ${t.productTitle}\n\n${t.buyHint}${t.helpline}`, products };
    }
    if (/(organic|special|शहद)/.test(q)) {
        const products = PRODUCTS.filter((p) => p.category === 'Specialty');
        return { text: `🍯 ${t.productTitle}\n\n${t.buyHint}${t.helpline}`, products };
    }
    if (/(homestay|stay|hotel|room|booking|book|होमस्टे)/.test(q)) {
        const products = PRODUCTS.filter((p) => p.category === 'Homestays');
        return { text: `🏡 ${t.productTitle}\n\n${t.buyHint}${t.helpline}`, products };
    }
    // 7. Price queries
    if (/(price|rate|bhav|daam|cost|kitna|kitne|भाव|दाम|कीमत)/.test(q)) {
        return {
            text: `${t.priceTitle}\n\n` +
                `🫘 Kedarnath Rajma: ₹150/kg\n🍎 Harsil Apple: ₹160-220/kg\n🌾 Mandua Flour: ₹120/kg\n🍚 Ghariya Chawal (Red Rice): ₹180-220/kg\n🍯 Organic Honey: ₹450-600/kg\n🧈 Pahadi Ghee: ₹650-800/kg\n🌰 Walnut: ₹350/kg\n🏡 Chopta Homestay: ₹2,500/night\n\n${t.priceTip}` +
                t.helpline,
            products: [getProductById('rajma'), getProductById('apple'), getProductById('redrice')],
        };
    }
    // 8a. Weather queries
    if (/(weather|mausam|baarish|rain|temperature|forecast|मौसम|बारिश)/.test(q)) {
        const district = WEATHER_DATA.find((w) => q.includes(w.district.toLowerCase())) ?? WEATHER_DATA[0];
        const fc = district.forecast.map((f) => `${f.day}: ${f.icon} ${f.temp} (rain ${f.rain}%)`).join('\n');
        return {
            text: `🌤️ **Weather — ${district.district}** (${district.altitude})\n\n` +
                `Now: ${district.now.icon} ${district.now.temp}°C, ${district.now.condition}\n` +
                `Humidity: ${district.now.humidity}% | Wind: ${district.now.wind} km/h\n\n` +
                `**4-Day Forecast:**\n${fc}\n\n` +
                `**🤖 AI Farm Advisory:**\n${district.advisory}\n\n` +
                `💡 Open the **Dashboard** tab (Farmer mode) for live weather of all districts!` +
                t.helpline,
        };
    }
    // 8b. Value-added / processing / profit queries
    if (/(value|processing|brownie|browne|bread|bun|doughnut|donut|laddu|convert|banakar|bech|profit|munafa|shelf life|मुनाफा|लड्डू)/.test(q)) {
        const special = VALUE_PRODUCTS.filter((v) => v.special).slice(0, 5);
        const rows = special
            .map((v) => `${v.emoji} **${v.name}**\n   Raw: ₹${v.rawCost} + Processing: ₹${v.conversionCost} → Sells: ₹${v.marketPrice}\n   ✅ Profit: ₹${calcProfit(v)} (${calcMargin(v)}% margin) | Shelf life: ${v.shelfLife}`)
            .join('\n\n');
        return {
            text: `🏭 **AI Value-Addition Suggestions (Top Picks)**\n\n${rows}\n\n` +
                `📊 Open the **Value-Add** tab (Farmer mode) to see all 15 products with full cost breakdown — brownies, bread, buns, doughnuts, laddu, kheer mixes & more!` +
                t.helpline,
        };
    }
    // 8c. Burans queries (nursery + products)
    if (/(burans|buransh|rhododendron|बुरांस|nursery|sapling)/.test(q)) {
        const squash = VALUE_PRODUCTS.find((v) => v.id === 'buransSquash');
        const nursery = VALUE_PRODUCTS.find((v) => v.id === 'buransNursery');
        return {
            text: `🌺 **Burans (Rhododendron) — Complete Business Guide**\n\n` +
                `**1. Burans Squash/Juice** ${squash.emoji}\n${squash.rawMaterial} → ${squash.outputYield}\nCost: ₹${squash.rawCost + squash.conversionCost} → Sells: ₹${squash.marketPrice} = **₹${calcProfit(squash)} profit (${calcMargin(squash)}%)**\nShelf life: ${squash.shelfLife}\n${squash.demandNote}\n\n` +
                `**2. Burans Nursery Formation** ${nursery.emoji}\n${nursery.demandNote}\nInvestment: ₹${nursery.rawCost + nursery.conversionCost} → Returns: ₹${nursery.marketPrice} per 100 saplings = **₹${calcProfit(nursery)} profit!**\n\n` +
                `💚 Burans is heart-healthy, rich in antioxidants — the state flower of Uttarakhand!` +
                t.helpline,
        };
    }
    // 8d. Lingda queries
    if (/(lingda|lingra|fiddlehead|लिंगड़ा)/.test(q)) {
        const pickle = VALUE_PRODUCTS.find((v) => v.id === 'lingdaPickle');
        const dried = VALUE_PRODUCTS.find((v) => v.id === 'lingdaDried');
        return {
            text: `🌿 **Lingda (Fiddlehead Fern) — RICH IN IRON!**\n\n` +
                `Monsoon-only delicacy (July-Sep) from high Himalayan forests. Rich in iron, antioxidants & fiber.\n\n` +
                `**Value Products:**\n` +
                `${pickle.emoji} **${pickle.name}** — Cost ₹${pickle.rawCost + pickle.conversionCost} → Sells ₹${pickle.marketPrice} = ₹${calcProfit(pickle)} profit (${calcMargin(pickle)}%!) | Shelf: ${pickle.shelfLife}\n` +
                `${dried.emoji} **${dried.name}** — Cost ₹${dried.rawCost + dried.conversionCost} → Sells ₹${dried.marketPrice} = ₹${calcProfit(dried)} profit | Shelf: ${dried.shelfLife}\n\n` +
                `💡 Fresh lingda spoils in 2 days but pickle lasts 12 months — value addition = year-round income from a 3-month crop!` +
                t.helpline,
        };
    }
    // 8. Farming queries
    if (/(farming|kheti|grow|ugaye|fasal|crop|fertilizer|pest|disease|bimari|खेती|फसल|कीट)/.test(q)) {
        return {
            text: `${t.farmingTitle}\n\n` +
                `**Organic Fertilizers:**\n🪱 Vermicompost — 2 tons/acre\n🐄 Jeevamrit — weekly spray\n🌿 Panchagavya — foliar spray\n🌱 Neem cake — soil treatment\n\n` +
                `**Natural Pest Control:**\n🌿 Neem oil spray — 5ml/liter\n🪤 Pheromone traps — fruit flies\n🍎 Lime-sulfur — apple scab\n🦠 Trichoderma — root rot\n\n` +
                `**Season Guide:**\n🌸 Spring: Potato, Peas\n☀️ Summer: Rajma, Maize\n🍂 Autumn: Apple harvest\n❄️ Winter: Mustard, Garlic` +
                t.helpline,
        };
    }
    // 9. Fallback — no specific local rule matched. The chat UI checks
    // `isFallback` to decide whether to escalate this question to the real
    // AI backend (Week 7 feature) instead of showing this generic message.
    return { text: t.fallback + t.helpline, isFallback: true };
};
export const WELCOME_TEXT = T.en.greeting + T.en.helpline;
