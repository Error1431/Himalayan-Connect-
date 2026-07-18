const { HIMALAYAN_PRODUCTS, SEASONAL_CALENDAR, YATRA_HOT_PRODUCTS } = require("../data/himalayan-knowledge-base");
const { askAssistant, isAIConfigured } = require("../services/openaiService");

function detectLanguage(text) {
    const hindiPattern = /[\u0900-\u097F]/;
    const hinglishWords = [
        "kya", "hai", "mujhe", "batao", "chahiye", "karo", "bhai", "yaar",
        "kitna", "kaise", "kaisa", "kab", "kahan", "kyun", "mere", "mera",
        "apna", "wala", "nahi", "haan", "theek", "accha", "pura", "abhi",
    ];
    if (hindiPattern.test(text)) return "hindi";
    const lowerText = text.toLowerCase();
    const count = hinglishWords.filter((w) => lowerText.includes(w)).length;
    if (count >= 2) return "hinglish";
    return "english";
}

function detectUserType(text) {
    const lower = text.toLowerCase();
    const farmerKw = ["farmer", "kisan", "kheti", "fasal", "profit", "loss", "sell", "bechna", "ugana", "grow", "mandi", "income"];
    const homestayKw = ["homestay", "hotel", "restaurant", "recipe", "menu", "cook", "banana", "guest", "serve", "dish", "buy"];
    const customerKw = ["buy", "where", "kahan", "organic", "healthy", "benefit", "tourist", "track", "origin", "authentic"];
    const fs = farmerKw.filter((k) => lower.includes(k)).length;
    const hs = homestayKw.filter((k) => lower.includes(k)).length;
    const cs = customerKw.filter((k) => lower.includes(k)).length;
    const max = Math.max(fs, hs, cs);
    if (max === 0) return "general";
    if (fs === max) return "farmer";
    if (hs === max) return "homestay";
    return "customer";
}

function calculateRawMaterialProfit(materialId, quantityKg) {
    const mat = HIMALAYAN_PRODUCTS.rawMaterials[materialId];
    if (!mat) return null;
    const fgRev = mat.pricePerKg.farmGate * quantityKg;
    const mkRev = mat.pricePerKg.market * quantityKg;
    const prRev = mat.pricePerKg.premium * quantityKg;
    const cost = fgRev * 0.3;
    return {
        material: mat.name,
        quantity: quantityKg,
        farmGateRevenue: fgRev,
        marketRevenue: mkRev,
        premiumRevenue: prRev,
        estimatedCost: cost,
        farmGateProfit: fgRev - cost,
        marketProfit: mkRev - cost,
        premiumProfit: prRev - cost,
        shelfLife: mat.storageLife,
        bestProducts: mat.derivedProducts ? mat.derivedProducts.slice(0, 3) : [],
        recommendation: `Processing can give ${Math.round((prRev / fgRev - 1) * 100)}% more revenue`,
    };
}

function calculateProductProfit(productId, quantity) {
    const prod = HIMALAYAN_PRODUCTS.processedProducts[productId];
    if (!prod || !prod.ingredients) return null;
    let rawCost = 0;
    Object.values(prod.ingredients).forEach((d) => {
        rawCost += (d.quantity / 1000) * d.costPerUnit * quantity;
    });
    const labor = rawCost * 0.15;
    const packaging = rawCost * 0.1;
    const overhead = rawCost * 0.05;
    const total = rawCost + labor + packaging + overhead;
    const fgRev = (prod.farmGatePrice || 0) * quantity;
    const hsRev = (prod.homestaySellingPrice || 0) * quantity;
    const mkRev = (prod.marketPrice || 0) * quantity;
    return {
        product: prod.name,
        quantity,
        costs: {
            rawMaterial: rawCost.toFixed(2),
            labor: labor.toFixed(2),
            packaging: packaging.toFixed(2),
            overhead: overhead.toFixed(2),
            total: total.toFixed(2),
        },
        revenue: { farmGate: fgRev, homestay: hsRev, market: mkRev },
        profit: {
            farmGate: (fgRev - total).toFixed(2),
            homestay: (hsRev - total).toFixed(2),
            market: (mkRev - total).toFixed(2),
        },
        profitMargin: {
            homestay: fgRev > 0 ? (((hsRev - total) / hsRev) * 100).toFixed(1) : "0",
        },
        shelfLife: prod.shelfLife,
        demand: prod.demand,
        usp: prod.usp,
    };
}

function buildAIResponse(query) {
    const language = detectLanguage(query);
    const userType = detectUserType(query);
    const lower = query.toLowerCase();

    let responseData = {
        language,
        userType,
        message: "",
        profitData: null,
        suggestions: [],
        productInfo: null,
        recipeInfo: null,
    };

    if (lower.includes("gaazna") || lower.includes("wild turmeric") || (lower.includes("haldi") && lower.includes("gaz"))) {
        const farmerProfit = calculateRawMaterialProfit("gaazna_haldi", 100);
        const productProfit = calculateProductProfit("gaazna_haldi_milk", 1);
        responseData.profitData = { rawMaterial: farmerProfit, product: productProfit };
        responseData.productInfo = HIMALAYAN_PRODUCTS.rawMaterials.gaazna_haldi;

        if (userType === "farmer") {
            responseData.message =
                language === "hinglish"
                    ? "Bhai Gaazna Haldi teri sabse badi asset hai! Regular haldi se 3x zyada powerful. 100kg ka profit dekh!"
                    : language === "hindi"
                        ? "गाज़ना हल्दी आपकी सबसे मूल्यवान फसल है! Golden Milk Mix बनाकर 4 गुना कमाई करें!"
                        : "Gaazna Haldi is your GOLD! 3x curcumin. Process into Golden Milk Mix for maximum profit!";
            responseData.suggestions = ["Golden Milk Mix banao", "Haldi Laddu 30 din shelf life", "Health stores mein sell karo"];
        } else if (userType === "homestay") {
            responseData.message =
                language === "hinglish"
                    ? "Bhai Gaazna Haldi Doodh homestay ka star drink bana do! Save 60% vs market!"
                    : "Make Gaazna Haldi your homestay signature - save 60% buying direct from farmer!";
            responseData.suggestions = ["Morning Golden Milk welcome drink", "Sell souvenir mix pack Rs 900", "Add to menu as Himalayan Latte"];
        } else {
            responseData.message =
                "Gaazna Haldi is wildcrafted from pristine Himalayan forests with 3x more curcumin than regular turmeric!";
            responseData.suggestions = ["Track to exact farmer", "Buy Golden Milk Mix", "Try Haldi Laddu"];
        }
    } else if (lower.includes("lingda") || lower.includes("fern") || lower.includes("लिंगड़ा")) {
        const farmerProfit = calculateRawMaterialProfit("lingda", 50);
        const pickleProfit = calculateProductProfit("lingda_pickle", 1);
        responseData.profitData = { rawMaterial: farmerProfit, product: pickleProfit };
        responseData.productInfo = HIMALAYAN_PRODUCTS.rawMaterials.lingda;
        responseData.message =
            userType === "farmer"
                ? language === "hinglish"
                    ? "Bhai Lingda 42mg iron per 100g wala superfood hai! Pickle banao 12 month shelf life!"
                    : "Lingda is nature's iron supplement! Make pickle for 12 month shelf life and year-round income!"
                : userType === "customer"
                    ? "Lingda Fern has 42mg iron per 100g - more than any other vegetable! Wildcrafted from Himalayan riverbanks."
                    : "Lingda Saag and Pickle are must for authentic homestay - buy from farmer at 67% savings vs market!";
        responseData.suggestions = ["Lingda Pickle 12 month shelf life", "Lingda Chips unique snack", "Hospital clinic iron supplement angle"];
    } else if (lower.includes("burans") || lower.includes("rhododendron") || lower.includes("बुरांस")) {
        const juiceProfit = calculateProductProfit("burans_juice", 1);
        responseData.profitData = { product: juiceProfit, nursery: HIMALAYAN_PRODUCTS.processedProducts.burans_nursery };
        responseData.productInfo = HIMALAYAN_PRODUCTS.rawMaterials.burans;
        responseData.message =
            userType === "farmer"
                ? language === "hinglish"
                    ? "Bhai Burans ek baar lagao saalon tak kamaao! Nursery se shuru karo 6 months mein profit!"
                    : "Plant Burans once, earn for decades! State flower commands premium prices everywhere!"
                : "Burans is Uttarakhand's state flower with proven heart-health benefits!";
        responseData.suggestions = ["Nursery shuru karo 6 months profit", "Burans Juice seasonal high demand", "Government scheme check karo"];
    } else if (lower.includes("rotna") || lower.includes("रोटना")) {
        const profitData = calculateProductProfit("rotna", 5);
        responseData.profitData = { product: profitData };
        responseData.productInfo = HIMALAYAN_PRODUCTS.processedProducts.rotna;
        responseData.recipeInfo = HIMALAYAN_PRODUCTS.processedProducts.rotna.recipe;
        responseData.message =
            language === "hinglish"
                ? "Bhai Rotna Dehradun aur yatra route pe bhut bada hit hai! 30 din shelf life tension nahi!"
                : "Rotna is a massive hit on Dehradun and all yatra routes! VERY HIGH demand guaranteed!";
        responseData.suggestions = ["Yatra route sell karo", "Eco leaf wrap premium packaging", "Homestay direct tie-up"];
    } else if (lower.includes("arsa") || lower.includes("आरसा")) {
        const profitData = calculateProductProfit("arsa", 5);
        responseData.profitData = { product: profitData };
        responseData.productInfo = HIMALAYAN_PRODUCTS.processedProducts.arsa;
        responseData.recipeInfo = HIMALAYAN_PRODUCTS.processedProducts.arsa.recipe;
        responseData.message =
            language === "hinglish"
                ? "Bhai Arsa ke bina koi tyohaar adhoora! 45 din shelf life aur guaranteed income!"
                : "No festival in Uttarakhand is complete without Arsa! 45 day shelf life, guaranteed income!";
        responseData.suggestions = ["Festival season double production", "Yatra prasad market", "Online gifting - Himalayan Connect"];
    } else if (lower.includes("kafuli") || lower.includes("कफुली")) {
        const profitData = calculateProductProfit("kafuli", 10);
        responseData.profitData = { product: profitData };
        responseData.productInfo = HIMALAYAN_PRODUCTS.processedProducts.kafuli;
        responseData.recipeInfo = HIMALAYAN_PRODUCTS.processedProducts.kafuli.recipe;
        responseData.message =
            userType === "homestay"
                ? "Kafuli with 75% profit margin! Iron kadhai cooking adds natural iron - that is your USP!"
                : "Kafuli is not just food - it is a complete iron treatment! Spinach + fenugreek + iron kadhai magic!";
        responseData.suggestions = ["Iron Thali signature dish", "Health tourist special menu", "Winter highest demand"];
    } else if (lower.includes("bhang") || lower.includes("hemp")) {
        const profitData = calculateProductProfit("bhang_chutney", 3);
        responseData.profitData = { product: profitData };
        responseData.message = "Bhang Ki Chutney is legal healthy hemp seeds - omega-3 powerhouse of Uttarakhand!";
        responseData.suggestions = ["Hemp chutney with every pahadi meal", "Export potential huge", "Hemp protein powder premium product"];
    } else if (lower.includes("jhangora") || lower.includes("kheer")) {
        const profitData = calculateProductProfit("jhangora_kheer", 1);
        responseData.profitData = { product: profitData };
        responseData.message = "Jhangora is the gluten-free superfood the world is searching for and it grows in our mountains!";
        responseData.suggestions = ["Jhangora Kheer signature dessert", "Gluten-free market booming", "Export to metro health stores"];
    } else if (lower.includes("ghee") || lower.includes("घी")) {
        const profitData = calculateRawMaterialProfit("local_ghee", 10);
        responseData.profitData = { rawMaterial: profitData };
        responseData.productInfo = HIMALAYAN_PRODUCTS.rawMaterials.local_ghee;
        responseData.message =
            language === "hinglish"
                ? "Bhai Pahadi Ghee sirf fat nahi yeh ek medicine hai! A2 milk se bana liquid gold!"
                : "Pahadi Ghee is medicine not just fat! From A2 milk cows grazing on medicinal Himalayan herbs!";
        responseData.suggestions = ["Haldi Ghee = maximum premium", "Gift pack with haldi ghee combo", "Ayurveda market huge demand"];
    } else if (lower.includes("mandua") || lower.includes("brownie") || lower.includes("bread") || lower.includes("ragi")) {
        const brownieProfit = calculateProductProfit("brownie_mandua", 2);
        const breadProfit = calculateProductProfit("mandua_bread", 3);
        responseData.profitData = { brownie: brownieProfit, bread: breadProfit };
        responseData.message = "Mandua has highest calcium among ALL grains 344mg per 100g! Brownie, Bread, Laddu all sell at premium!";
        responseData.suggestions = ["Mandua Brownie Instagram hit", "Breakfast bakery for homestay", "Gluten-free market boom"];
    } else if (lower.includes("profit") || lower.includes("munafa") || lower.includes("kamaai") || lower.includes("income")) {
        const topProducts = [
            { name: "Gaazna Haldi Milk Mix", profit: "Rs 700 per kg", demand: "VERY HIGH" },
            { name: "Lingda Pickle", profit: "Rs 350 per kg", demand: "VERY HIGH" },
            { name: "Mandua Brownie", profit: "Rs 60 per piece", demand: "VERY HIGH" },
            { name: "Pahadi Ghee", profit: "Rs 500-1500 per kg", demand: "VERY HIGH" },
            { name: "Rotna", profit: "Rs 200-400 per kg", demand: "VERY HIGH" },
            { name: "Arsa", profit: "Rs 200 per kg", demand: "VERY HIGH" },
        ];
        responseData.profitData = { topProducts };
        responseData.message =
            language === "hinglish"
                ? "Bhai yeh hain top products jinse maximum munafa milega! Rotna aur Arsa se shuru karo!"
                : "Top profitable Himalayan products ranked! Start with Rotna and Arsa - zero special equipment needed!";
        responseData.suggestions = ["Rotna + Arsa se shuru karo", "Homestay direct supply", "Festival season double production"];
    } else if (lower.includes("seasonal") || lower.includes("calendar") || lower.includes("season")) {
        responseData.profitData = { calendar: SEASONAL_CALENDAR };
        responseData.message = "Himalayan seasonal harvest calendar - plan your production year-round!";
        responseData.suggestions = ["Spring - Burans and Lingda", "Autumn - Jhangora Mandua Gahat", "Winter - Gaazna Haldi"];
    } else {
        responseData.message =
            language === "hinglish"
                ? "Namaste bhai! Main Himalayan Connect AI hun. Gaazna Haldi, Lingda, Burans, Rotna, Arsa, Kafuli, Ghee, Mandua kisi ke baare mein poochho!"
                : language === "hindi"
                    ? "नमस्ते! मैं हिमालयन कनेक्ट AI हूं। किसी भी उत्पाद के बारे में पूछें!"
                    : "Welcome to Himalayan Connect AI! Ask me about any Himalayan product - farmer profits, homestay recipes, or customer benefits!";
        responseData.suggestions = [
            "Gaazna Haldi profit analysis",
            "Lingda se kya banta hai",
            "Rotna ki recipe",
            "Burans nursery business",
        ];
    }

    return responseData;
}

const queryAI = async (req, res) => {
    try {
        const { query, userType: forcedUserType } = req.body;
        if (!query || query.trim().length === 0) {
            return res.status(400).json({ success: false, message: "Query is required" });
        }
        const response = buildAIResponse(query);
        if (forcedUserType) response.userType = forcedUserType;
        return res.status(200).json({ success: true, data: response });
    } catch (error) {
        console.error("AI Controller Error:", error);
        return res.status(500).json({ success: false, message: "AI processing failed", error: error.message });
    }
};

// ---------------------------------------------------------------------
// Week 7 — real AI API integration.
//
// POST /api/ai/assistant
// Body: { message: string, role?: 'farmer'|'homestay_owner'|'customer'|'guest', history?: [{type,text}] }
//
// This is called by the "Pahadi Mitra" chat (Frontend/src/components/HimalayanAI)
// only when the fast local rule-based engine (utils/ai-engine.js) doesn't have a
// specific answer for the question — so simple/known queries stay instant, and
// open-ended questions get a real, grounded LLM answer. The OpenAI API key never
// leaves this backend service.
// ---------------------------------------------------------------------
const assistantChat = async (req, res) => {
    try {
        const { message, role, history } = req.body;

        if (!message || typeof message !== "string" || !message.trim()) {
            return res.status(400).json({ success: false, message: "A message is required." });
        }
        if (message.length > 1000) {
            return res.status(400).json({ success: false, message: "Message is too long (max 1000 characters)." });
        }

        if (!isAIConfigured()) {
            return res.status(503).json({
                success: false,
                code: "AI_NOT_CONFIGURED",
                message: "The AI assistant is not configured on this server yet. Add OPENAI_API_KEY to Backend/.env.",
            });
        }

        const result = await askAssistant({
            message: message.trim(),
            role,
            history: Array.isArray(history) ? history : [],
        });

        return res.status(200).json({ success: true, data: { text: result.text, model: result.model } });
    } catch (error) {
        console.error("AI Assistant Error:", error.message);

        // Distinguish a few common OpenAI failure modes so the frontend can
        // show a genuinely useful message instead of a generic "error".
        if (error.name === "AbortError" || error.message?.includes("aborted")) {
            return res.status(504).json({ success: false, code: "AI_TIMEOUT", message: "The AI took too long to respond. Please try again." });
        }
        if (error.status === 429 || error.code === "insufficient_quota") {
            return res.status(429).json({ success: false, code: "AI_RATE_LIMITED", message: "The AI service is busy or out of quota right now. Please try again shortly." });
        }
        if (error.code === "AI_NOT_CONFIGURED") {
            return res.status(503).json({ success: false, code: "AI_NOT_CONFIGURED", message: error.message });
        }

        return res.status(500).json({ success: false, code: "AI_ERROR", message: "The AI assistant hit an unexpected error. Please try again." });
    }
};

const getProductAnalysis = async (req, res) => {
    try {
        const { productId, quantity = 1, type = "raw" } = req.query;
        if (!productId) return res.status(400).json({ success: false, message: "productId required" });
        let data;
        if (type === "raw") {
            data = calculateRawMaterialProfit(productId, parseFloat(quantity));
        } else {
            data = calculateProductProfit(productId, parseFloat(quantity));
        }
        if (!data) return res.status(404).json({ success: false, message: "Product not found" });
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getAllProducts = async (req, res) => {
    try {
        const { category } = req.query;
        let rawMaterials = Object.values(HIMALAYAN_PRODUCTS.rawMaterials);
        let processed = Object.values(HIMALAYAN_PRODUCTS.processedProducts);
        if (category) {
            rawMaterials = rawMaterials.filter((p) => p.category === category);
            processed = processed.filter((p) => p.category === category);
        }
        return res.status(200).json({
            success: true,
            data: { rawMaterials, processedProducts: processed, seasonal: SEASONAL_CALENDAR, yatraHotProducts: YATRA_HOT_PRODUCTS },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getSeasonalCalendar = async (req, res) => {
    try {
        return res.status(200).json({ success: true, data: SEASONAL_CALENDAR });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { queryAI, getProductAnalysis, getAllProducts, getSeasonalCalendar, assistantChat };