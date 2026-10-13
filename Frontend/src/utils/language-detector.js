export function detectLanguage(text) {
    const hindiPattern = /[\u0900-\u097F]/;
    const hinglishWords = [
        "kya", "hai", "mujhe", "batao", "chahiye", "karo", "bhai", "yaar",
        "kitna", "kaise", "kaisa", "kab", "kahan", "kyun", "mere", "mera",
        "apna", "wala", "nahi", "haan", "theek", "accha", "pura", "abhi",
        "seedha", "phir", "aur", "toh", "se", "mein", "ka", "ki", "ke",
    ];
    if (hindiPattern.test(text)) return "hindi";
    const lower = text.toLowerCase();
    const count = hinglishWords.filter((w) => lower.includes(w)).length;
    if (count >= 2) return "hinglish";
    return "english";
}

export function detectUserType(text) {
    const lower = text.toLowerCase();
    const farmerKw = ["farmer", "kisan", "kheti", "fasal", "profit", "loss", "sell", "bechna", "ugana", "grow", "mandi", "income", "kamana"];
    const homestayKw = ["homestay", "hotel", "restaurant", "recipe", "menu", "cook", "banana", "guest", "serve", "dish", "buy", "revenue"];
    const customerKw = ["buy", "where", "kahan", "organic", "healthy", "benefit", "tourist", "track", "origin", "authentic", "try"];
    const fs = farmerKw.filter((k) => lower.includes(k)).length;
    const hs = homestayKw.filter((k) => lower.includes(k)).length;
    const cs = customerKw.filter((k) => lower.includes(k)).length;
    const max = Math.max(fs, hs, cs);
    if (max === 0) return "general";
    if (fs === max) return "farmer";
    if (hs === max) return "homestay";
    return "customer";
}