// ============================================
// LANGUAGE DETECTION
// - Detects English / Hindi / Hinglish queries
// - Provides localized (T) string tables
// Extracted from ai-engine.js for standalone reuse
// ============================================

const HINGLISH_WORDS = /\b(kya|hai|hain|kaise|banate|banau|banaye|batao|bata|bhaiya|bhai|mujhe|mera|meri|kitna|kitne|bhav|daam|kheti|fasal|karo|chahiye|dikhao|acha|accha|theek|nahi|nhi|haan|poochho|karein|krna|karna|wala|wali|ka|ki|ke|se|mein|aur|recipe batao|kaha|kahan|milega|lena|kharidna|order)\b/i;
export const detectLang = (q) => {
    if (/[\u0900-\u097F]/.test(q))
        return 'hi';
    if (HINGLISH_WORDS.test(q))
        return 'hing';
    return 'en';
};
// ---------- Localized strings ----------
export const T = {
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
