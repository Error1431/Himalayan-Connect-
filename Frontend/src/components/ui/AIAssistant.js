import React, { useState, useRef, useEffect } from 'react';
import {
    FaRobot, FaPaperPlane, FaSpinner, FaTimes,
    FaExpand, FaCompress, FaTrash, FaLightbulb,
    FaSeedling, FaHome, FaLeaf, FaChartLine,
    FaUsers, FaShoppingBag, FaMicrophone, FaSearch,
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const ANTHROPIC_API_KEY = 'YOUR_ANTHROPIC_API_KEY_HERE';

const SYSTEM_PROMPT = `You are "Pahadi Mitra" — the official AI assistant for Himalayan Connect, an organic farming & eco-tourism platform based in Uttarakhand, India.

PERSONALITY:
- Super friendly, warm, encouraging dost
- Always motivate farmers and homestay owners
- Use relevant emojis to make responses lively
- Be concise but complete

STRICT LANGUAGE RULE - MOST IMPORTANT:
Detect the language the user wrote in and REPLY IN EXACTLY THAT LANGUAGE.
- User writes Hindi (Devanagari) → reply fully in Hindi
- User writes English → reply fully in English  
- User writes Hinglish (Roman Hindi) → reply in Hinglish
- Mixed language → match the dominant language
- Spelling mistakes are fine — understand intent

UTTARAKHAND KNOWLEDGE:
Chamoli: Rajma, Aloo, Apple orchards, Eco homestays Auli/Chopta
Rudraprayag: Rajma ₹150/kg, Mandua flour ₹120/kg, Jhingora, Chopta homestay ₹2500/night
Uttarkashi: Harsil Apple ₹160-220/kg, Walnut, Apricot, Gangotri stays
Pithoragarh: Lohia Patta Rajma, Buckwheat, Munsiyari stays
Almora: Aloo Gutuk, Bhatt ki Dal, Gahat, Singodi sweets
Bageshwar: Mandua, Jhingora, Kafal fruit, Baijnath stays
Nainital: Strawberry, Mushroom, Peach orchards
Dehradun/Haridwar: Organic turmeric, Basmati rice, Lychee, Mango ₹140-180/kg

HIMALAYAN CONNECT PRODUCTS:
- Rajma: ₹150/kg, Kedarnath Valley
- Mandua Flour: ₹120/kg, Rudraprayag, gluten-free
- Organic Apple: ₹160-220/kg, Harsil
- Organic Mango: ₹140-180/kg, Doon valley
- Chopta Eco Homestay: ₹2500/night, 20% direct discount

ORGANIC FARMING:
- Fertilizers: Vermicompost, Jeevamrit, Panchagavya, Neem cake
- Pest: Neem oil, Pheromone traps, Bordeaux mixture
- Diseases: Trichoderma for root rot, Lime-sulfur for apple scab

ALWAYS end every response with:
📞 Agri Helpline: 1800-180-1551 (Toll-Free) | Code: 1551
📞 कृषि हेल्पलाइन: 1800-180-1551 (टोल-फ्री) | कोड: 1551`;

const HELPLINE = `\n\n📞 Agri Helpline: 1800-180-1551 (Toll-Free) | Code: 1551\n📞 कृषि हेल्पलाइन: 1800-180-1551 (टोल-फ्री) | कोड: 1551`;

const getFallbackResponse = (userQuery) => {
    const q = userQuery.toLowerCase().trim();
    const isHindi = /[\u0900-\u097F]/.test(userQuery);

    if (q.includes('rajma') || q.includes('dal') || q.includes('mandua') || q.includes('pulse')) {
        return `🫘 **Himalayan Organic Pulses:**\n• Kedarnath Valley Rajma: ₹150/kg (premium quality)\n• Mandua Flour: ₹120/kg (gluten-free, calcium-rich)\n• Bhatt ki Dal: Highly nutritious black soybean\n• Gahat: Horse gram with medicinal properties${HELPLINE}`;
    }
    if (q.includes('apple') || q.includes('seb') || q.includes('fruit') || q.includes('mango') || q.includes('aam')) {
        return `🍎 **Himalayan Organic Fruits:**\n• Harsil Apple (Uttarkashi): ₹160-220/kg\n• Chaunsa Mango (Doon Valley): ₹140-180/kg\n• Mountain Apricots & Peaches: Fresh seasonal harvest${HELPLINE}`;
    }
    if (q.includes('homestay') || q.includes('stay') || q.includes('hotel') || q.includes('chopta')) {
        return `🏡 **Himalayan Connect Eco Homestays:**\n• Chopta Trishul Homestay: ₹2500/night\n• 20% discount on direct booking\n• Organic meals + Trek guide + WiFi included\n• Available across Rudraprayag, Uttarkashi, Pithoragarh${HELPLINE}`;
    }
    if (q.includes('profit') || q.includes('munafa') || q.includes('income') || q.includes('kamai')) {
        return `💰 **Farmer Profit Guide:**\n• Rajma: Buy ₹80/kg → Sell ₹150/kg = 87% profit\n• Apple: Buy ₹100/kg → Sell ₹220/kg = 120% profit\n• Mandua Flour: Buy ₹60/kg → Sell ₹120/kg = 100% profit\n• Direct selling through Himalayan Connect = Maximum earnings!${HELPLINE}`;
    }
    if (q.includes('pest') || q.includes('disease') || q.includes('bimari') || q.includes('insect') || q.includes('keeda')) {
        return `🐛 **Organic Pest Management:**\n• Apple Scab → Lime-sulfur spray + pruning\n• Fruit Fly → Pheromone traps + neem oil\n• Root Rot → Trichoderma soil treatment\n• Aphids → Neem extract spray\n• All treatments are 100% organic!${HELPLINE}`;
    }
    if (isHindi) {
        return `🌿 **पहाड़ी मित्र AI:**\nआपका सवाल मिल गया! मैं उत्तराखंड के सभी जिलों की जैविक खेती, फसल दाम, और होमस्टे की जानकारी रखता हूं। कृपया विशिष्ट फसल या जिले का नाम लिखें।${HELPLINE}`;
    }
    if (q.includes('hello') || q.includes('hi') || q.includes('namaste') || q.includes('hii')) {
        return `👋 **Namaste! Main hoon Pahadi Mitra!**\n\nMain aapki help kar sakta hoon:\n🌾 Organic farming tips & crop prices\n🐛 Pest & disease treatment\n🏡 Eco homestay booking\n📍 District-wise crop information\n\nKoi bhi sawaal poochho - Hindi, English, ya Hinglish mein!${HELPLINE}`;
    }
    return `🌱 **Pahadi Mitra AI:**\nMain aapke sawaal ko samajh raha hoon! Organic farming, crop prices, pest treatment, ya Uttarakhand homestays ke baare mein specific sawaal poochho.${HELPLINE}`;
};

const renderMarkdown = (text) => {
    return text
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#34d399">$1</strong>')
        .replace(/\n/g, '<br/>');
};

const STATS = [
    { icon: FaUsers, label: 'Active Farmers', value: '500+', change: '+12.5%', color: '#10b981' },
    { icon: FaHome, label: 'Eco Homestays', value: '120+', change: '+8.2%', color: '#6366f1' },
    { icon: FaShoppingBag, label: 'Products Listed', value: '1,200+', change: '+5.4%', color: '#f59e0b' },
    { icon: FaChartLine, label: 'Avg Farmer Income', value: '₹34.5K', change: '+18%', color: '#10b981' },
];

const QUICK_QUERIES = [
    { text: 'Rudraprayag organic crops?', emoji: '📍' },
    { text: 'Apple scab disease treatment?', emoji: '🍎' },
    { text: 'राजमा का भाव क्या है?', emoji: '🫘' },
    { text: 'Farmer profit analysis', emoji: '💰' },
    { text: 'Chopta homestay booking?', emoji: '🏡' },
    { text: 'Organic pest management?', emoji: '🌿' },
];

const AIAssistant = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState([{
        type: 'bot',
        text: '👋 **Namaste! Main hoon Pahadi Mitra!**\n\nHimalayan Connect ka official AI assistant. Kisi bhi bhasha mein poochho!\n\n🌾 Organic farming & crop prices\n🐛 Pest & disease solutions\n🏡 Eco homestay booking\n📍 District-wise Uttarakhand info\n\n📞 Agri Helpline: 1800-180-1551 (Toll-Free)\n📞 कृषि हेल्पलाइन: 1800-180-1551 | Code: 1551',
        timestamp: new Date(),
    }]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [conversationHistory, setConversationHistory] = useState([]);
    const [activeTab, setActiveTab] = useState('chat');
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => inputRef.current?.focus(), 60);
        }
    }, [messages, isOpen]);

    const callClaudeAPI = async (userMessage, history) => {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true',
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 1000,
                system: SYSTEM_PROMPT,
                messages: [...history, { role: 'user', content: userMessage }],
            }),
        });
        if (!response.ok) throw new Error('API ' + response.status);
        const data = await response.json();
        return data.content?.[0]?.text || 'Thoda problem aa gaya! Dobara try karein.';
    };

    const sendQuery = async (e) => {
        e?.preventDefault();
        if (!query.trim()) return;
        const userMessage = query.trim();
        setMessages(prev => [...prev, { type: 'user', text: userMessage, timestamp: new Date() }]);
        setQuery('');
        setLoading(true);
        try {
            const botReply = await callClaudeAPI(userMessage, conversationHistory);
            setConversationHistory(prev => [...prev, { role: 'user', content: userMessage }, { role: 'assistant', content: botReply }]);
            setMessages(prev => [...prev, { type: 'bot', text: botReply, timestamp: new Date() }]);
        } catch (err) {
            const fallback = getFallbackResponse(userMessage);
            setMessages(prev => [...prev, { type: 'bot', text: fallback, timestamp: new Date(), fallback: true }]);
        } finally {
            setLoading(false);
            setTimeout(() => inputRef.current?.focus(), 25);
        }
    };

    const clearChat = () => {
        setMessages([{ type: 'bot', text: '👋 Chat reset! Naya sawaal poochho bhai! 🌿\n\n📞 Agri Helpline: 1800-180-1551 | Code: 1551', timestamp: new Date() }]);
        setConversationHistory([]);
        toast.success('Chat cleared!');
    };

    const formatTime = (date) => new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    if (!isOpen) return null;

    return (
        <>
            <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-green {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(16,185,129,0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        .ai-scrollbar::-webkit-scrollbar { width: 4px; }
        .ai-scrollbar::-webkit-scrollbar-track { background: #0d1117; }
        .ai-scrollbar::-webkit-scrollbar-thumb { background: #10b981; border-radius: 4px; }
        .stat-card { transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        .stat-card:hover { transform: translateY(-4px) scale(1.02); }
        .msg-enter { animation: fadeInUp 0.3s ease forwards; }
        .quick-btn { transition: all 0.2s; }
        .quick-btn:hover { transform: translateY(-2px); }
        .send-btn { transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1); }
        .send-btn:hover:not(:disabled) { transform: scale(1.08); }
        .send-btn:active:not(:disabled) { transform: scale(0.95); }
        .tab-btn { transition: all 0.2s; position: relative; }
        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0; right: 0;
          height: 2px;
          background: #10b981;
          border-radius: 2px;
        }
      `}</style>

            <div
                style={{
                    position: 'fixed',
                    bottom: isExpanded ? 0 : 96,
                    right: isExpanded ? 0 : 24,
                    width: isExpanded ? '100vw' : 'min(92vw, 860px)',
                    height: isExpanded ? '100vh' : 'min(90vh, 680px)',
                    background: '#0d1117',
                    borderRadius: isExpanded ? 0 : 20,
                    boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(16,185,129,0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 9999,
                    overflow: 'hidden',
                    animation: 'fadeInUp 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                    border: '1px solid rgba(16,185,129,0.2)',
                }}
            >
                {/* ── TOP HEADER ── */}
                <div style={{
                    background: 'linear-gradient(135deg, #0a0f0a 0%, #111827 100%)',
                    borderBottom: '1px solid rgba(16,185,129,0.15)',
                    padding: '0 20px',
                    flexShrink: 0,
                }}>
                    {/* Header Row 1 - Logo + Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: 12,
                                background: 'linear-gradient(135deg, #065f46, #10b981)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 18, boxShadow: '0 4px 16px rgba(16,185,129,0.4)',
                                animation: 'pulse-green 2s infinite',
                                flexShrink: 0,
                            }}>🏔️</div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <h3 style={{ color: 'white', fontWeight: 800, fontSize: 15, margin: 0, letterSpacing: '-0.01em' }}>
                                        Pahadi Mitra AI
                                    </h3>
                                    <span style={{
                                        background: 'rgba(16,185,129,0.15)', color: '#10b981',
                                        fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                                        border: '1px solid rgba(16,185,129,0.3)', letterSpacing: '0.05em',
                                    }}>LIVE</span>
                                </div>
                                <p style={{ color: '#6b7280', fontSize: 11, margin: 0 }}>Himalayan Connect • Agricultural AI</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                                borderRadius: 8, padding: '4px 10px', marginRight: 4,
                            }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', animation: 'pulse-green 1.5s infinite' }} />
                                <span style={{ color: '#10b981', fontSize: 11, fontWeight: 600 }}>Online</span>
                            </div>
                            {[
                                { icon: isExpanded ? FaCompress : FaExpand, onClick: () => setIsExpanded(!isExpanded), title: 'Expand' },
                                { icon: FaTrash, onClick: clearChat, title: 'Clear' },
                                { icon: FaTimes, onClick: onClose, title: 'Close' },
                            ].map((btn, i) => (
                                <button key={i} onClick={btn.onClick} title={btn.title}
                                    style={{
                                        width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)',
                                        background: 'rgba(255,255,255,0.05)', color: '#9ca3af', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.15)'; e.currentTarget.style.color = '#10b981'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.3)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                                >
                                    <btn.icon />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Header Row 2 - Search + Tabs */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 12 }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <FaSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#4b5563', fontSize: 12 }} />
                            <input
                                type="text"
                                placeholder="Search metrics, crops, or ask..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%', padding: '8px 12px 8px 32px',
                                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: 10, color: '#d1d5db', fontSize: 13, outline: 'none',
                                    boxSizing: 'border-box',
                                }}
                                onFocus={e => e.target.style.borderColor = 'rgba(16,185,129,0.4)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                            />
                        </div>
                        {[
                            { id: 'overview', label: 'Overview' },
                            { id: 'chat', label: 'AI Chat' },
                            { id: 'analytics', label: 'Analytics' },
                        ].map(tab => (
                            <button key={tab.id} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                                    background: activeTab === tab.id ? 'rgba(16,185,129,0.15)' : 'transparent',
                                    color: activeTab === tab.id ? '#10b981' : '#6b7280',
                                    fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
                                }}
                            >{tab.label}</button>
                        ))}

                        <div style={{ display: 'flex', gap: 6, marginLeft: 4 }}>
                            {['Last 24 Hours', 'Last 7 Days', 'Last 30 Days'].map((label, i) => (
                                <button key={i}
                                    style={{
                                        padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)',
                                        background: i === 0 ? 'rgba(16,185,129,0.15)' : 'transparent',
                                        color: i === 0 ? '#10b981' : '#6b7280', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                    }}
                                >{label}</button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── BODY ── */}
                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                    {/* ── LEFT SIDEBAR ── */}
                    <div style={{
                        width: 200, background: '#0a0f0a', borderRight: '1px solid rgba(16,185,129,0.1)',
                        display: 'flex', flexDirection: 'column', flexShrink: 0,
                    }}>
                        {/* Farmer Hero Image */}
                        <div style={{ position: 'relative', height: 120, overflow: 'hidden' }}>
                            <img
                                src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=400&q=80"
                                alt="Farmer"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
                            />
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, #0a0f0a 100%)' }} />
                            <div style={{ position: 'absolute', bottom: 8, left: 10, right: 10 }}>
                                <p style={{ color: '#10b981', fontSize: 10, fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    🌾 Himalayan Farmers
                                </p>
                                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 9, margin: '2px 0 0' }}>
                                    500+ verified partners
                                </p>
                            </div>
                        </div>

                        {/* Sidebar Menu */}
                        <div style={{ padding: '12px 8px', flex: 1 }}>
                            <p style={{ color: '#4b5563', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px 8px' }}>
                                Navigation
                            </p>
                            {[
                                { icon: FaChartLine, label: 'Overview', id: 'overview', active: activeTab === 'overview' },
                                { icon: FaRobot, label: 'AI Chat', id: 'chat', active: activeTab === 'chat' },
                                { icon: FaSeedling, label: 'Farmers', id: 'farmers', active: false },
                                { icon: FaHome, label: 'Homestays', id: 'homestays', active: false },
                                { icon: FaShoppingBag, label: 'Products', id: 'products', active: false },
                                { icon: FaLeaf, label: 'Organic Tips', id: 'tips', active: false },
                            ].map((item, i) => (
                                <button key={i}
                                    onClick={() => item.id === 'chat' || item.id === 'overview' || item.id === 'analytics' ? setActiveTab(item.id) : null}
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                                        padding: '9px 10px', borderRadius: 10, border: 'none', cursor: 'pointer',
                                        background: item.active ? 'rgba(16,185,129,0.15)' : 'transparent',
                                        color: item.active ? '#10b981' : '#6b7280',
                                        fontSize: 13, fontWeight: item.active ? 700 : 500,
                                        marginBottom: 2, textAlign: 'left', transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={e => { if (!item.active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#d1d5db'; } }}
                                    onMouseLeave={e => { if (!item.active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b7280'; } }}
                                >
                                    <item.icon style={{ fontSize: 14, flexShrink: 0 }} />
                                    <span>{item.label}</span>
                                    {item.active && <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />}
                                </button>
                            ))}

                            <div style={{ marginTop: 16, padding: '0 8px' }}>
                                <p style={{ color: '#4b5563', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>System</p>
                                <div style={{ padding: '10px 12px', background: 'rgba(16,185,129,0.08)', borderRadius: 10, border: '1px solid rgba(16,185,129,0.15)' }}>
                                    <p style={{ color: '#10b981', fontSize: 10, fontWeight: 700, margin: '0 0 4px' }}>📞 Helpline</p>
                                    <p style={{ color: '#d1d5db', fontSize: 11, fontWeight: 800, margin: 0 }}>1800-180-1551</p>
                                    <p style={{ color: '#6b7280', fontSize: 9, margin: '2px 0 0' }}>Toll-Free | Code: 1551</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── MAIN CONTENT ── */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#0d1117' }}>

                        {/* OVERVIEW TAB */}
                        {activeTab === 'overview' && (
                            <div style={{ flex: 1, overflow: 'auto', padding: 20 }} className="ai-scrollbar">
                                {/* Stats Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
                                    {STATS.map((stat, i) => (
                                        <div key={i} className="stat-card"
                                            style={{
                                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                                                borderRadius: 14, padding: '16px 14px', cursor: 'default',
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                                <div style={{ padding: 8, borderRadius: 8, background: `${stat.color}15` }}>
                                                    <stat.icon style={{ fontSize: 14, color: stat.color }} />
                                                </div>
                                                <span style={{ fontSize: 10, color: '#10b981', fontWeight: 700, background: 'rgba(16,185,129,0.1)', padding: '2px 6px', borderRadius: 6 }}>
                                                    {stat.change}
                                                </span>
                                            </div>
                                            <p style={{ color: 'white', fontSize: 20, fontWeight: 800, margin: '0 0 2px', letterSpacing: '-0.02em' }}>{stat.value}</p>
                                            <p style={{ color: '#6b7280', fontSize: 11, margin: 0 }}>{stat.label}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Chart Area */}
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 16 }}>
                                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 18 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                                            <div>
                                                <p style={{ color: 'white', fontWeight: 700, fontSize: 14, margin: 0 }}>Revenue Growth</p>
                                                <p style={{ color: '#6b7280', fontSize: 11, margin: '2px 0 0' }}>Revenue over the last 30 days</p>
                                            </div>
                                            <span style={{ color: '#6b7280', fontSize: 18, cursor: 'pointer' }}>···</span>
                                        </div>
                                        <div style={{ position: 'relative', height: 100 }}>
                                            <svg viewBox="0 0 400 100" style={{ width: '100%', height: '100%' }} preserveAspectRatio="none">
                                                <defs>
                                                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                                                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                                                    </linearGradient>
                                                </defs>
                                                <path d="M0,80 C40,75 80,70 120,60 C160,50 180,45 220,35 C260,25 300,20 340,15 C370,12 390,10 400,8" stroke="#10b981" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                                                <path d="M0,80 C40,75 80,70 120,60 C160,50 180,45 220,35 C260,25 300,20 340,15 C370,12 390,10 400,8 L400,100 L0,100 Z" fill="url(#chartGrad)" />
                                                {[0, 80, 160, 240, 320, 400].map((x, i) => {
                                                    const y = [80, 70, 60, 45, 28, 8][i];
                                                    return <circle key={i} cx={x} cy={y} r="4" fill="#10b981" opacity={i === 5 ? 1 : 0.5} />;
                                                })}
                                            </svg>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                                            {['01 Nov', '08 Nov', '15 Nov', '22 Nov', '29 Nov'].map(d => (
                                                <span key={d} style={{ color: '#4b5563', fontSize: 10 }}>{d}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 18 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                            <p style={{ color: 'white', fontWeight: 700, fontSize: 14, margin: 0 }}>Traffic Sources</p>
                                            <span style={{ color: '#6b7280', fontSize: 18, cursor: 'pointer' }}>···</span>
                                        </div>
                                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 90 }}>
                                            <svg viewBox="0 0 100 100" style={{ width: 90, height: 90 }} transform="rotate(-90)">
                                                <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                                                <circle cx="50" cy="50" r="35" fill="none" stroke="#10b981" strokeWidth="12" strokeDasharray="98 122" strokeLinecap="round" />
                                                <circle cx="50" cy="50" r="35" fill="none" stroke="#6366f1" strokeWidth="12" strokeDasharray="55 165" strokeDashoffset="-98" strokeLinecap="round" />
                                                <circle cx="50" cy="50" r="35" fill="none" stroke="#f59e0b" strokeWidth="12" strokeDasharray="35 185" strokeDashoffset="-153" strokeLinecap="round" />
                                            </svg>
                                            <div style={{ position: 'absolute', textAlign: 'center' }}>
                                                <p style={{ color: 'white', fontSize: 18, fontWeight: 900, margin: 0 }}>45%</p>
                                            </div>
                                        </div>
                                        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                            {[
                                                { label: 'Direct', pct: '45%', color: '#10b981' },
                                                { label: 'Social', pct: '25%', color: '#6366f1' },
                                                { label: 'Referral', pct: '30%', color: '#f59e0b' },
                                            ].map((item, i) => (
                                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                                                    <span style={{ color: '#9ca3af', fontSize: 10 }}>{item.label} ({item.pct})</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 18 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                        <div>
                                            <p style={{ color: 'white', fontWeight: 700, fontSize: 14, margin: 0 }}>Recent Farmer Activity</p>
                                            <p style={{ color: '#6b7280', fontSize: 11, margin: '2px 0 0' }}>Latest farmers who joined the platform</p>
                                        </div>
                                        <button style={{ color: '#10b981', fontSize: 12, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>View All</button>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
                                        {['FARMER', 'CROP', 'DISTRICT', 'STATUS', 'ACTION'].map(h => (
                                            <span key={h} style={{ color: '#4b5563', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</span>
                                        ))}
                                    </div>
                                    {[
                                        { name: 'Ramesh Negi', crop: 'Rajma', district: 'Rudraprayag', status: 'Active' },
                                        { name: 'Pushpa Devi', crop: 'Lingda', district: 'Chamoli', status: 'Active' },
                                        { name: 'Sundar Singh', crop: 'Apple', district: 'Uttarkashi', status: 'Verified' },
                                        { name: 'Meena Rawat', crop: 'Mandua', district: 'Pauri', status: 'Pending' },
                                    ].map((row, i) => (
                                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 8, padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #065f46, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'white', fontWeight: 700, flexShrink: 0 }}>
                                                    {row.name[0]}
                                                </div>
                                                <span style={{ color: '#d1d5db', fontSize: 12, fontWeight: 600 }}>{row.name}</span>
                                            </div>
                                            <span style={{ color: '#9ca3af', fontSize: 12 }}>{row.crop}</span>
                                            <span style={{ color: '#9ca3af', fontSize: 12 }}>{row.district}</span>
                                            <span style={{
                                                fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, display: 'inline-block',
                                                background: row.status === 'Active' ? 'rgba(16,185,129,0.15)' : row.status === 'Verified' ? 'rgba(99,102,241,0.15)' : 'rgba(245,158,11,0.15)',
                                                color: row.status === 'Active' ? '#10b981' : row.status === 'Verified' ? '#818cf8' : '#f59e0b',
                                            }}>{row.status}</span>
                                            <button style={{ fontSize: 11, color: '#10b981', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, textAlign: 'left' }}>View →</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* CHAT TAB */}
                        {activeTab === 'chat' && (
                            <>
                                {/* Messages */}
                                <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }} className="ai-scrollbar">
                                    {messages.map((msg, i) => (
                                        <div key={i} className="msg-enter" style={{ display: 'flex', justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start', gap: 10 }}>
                                            {msg.type === 'bot' && (
                                                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #065f46, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, marginTop: 2 }}>🏔️</div>
                                            )}
                                            <div style={{
                                                maxWidth: '78%',
                                                background: msg.type === 'user'
                                                    ? 'linear-gradient(135deg, #065f46, #059669)'
                                                    : 'rgba(255,255,255,0.04)',
                                                border: msg.type === 'user'
                                                    ? '1px solid rgba(16,185,129,0.3)'
                                                    : '1px solid rgba(255,255,255,0.08)',
                                                borderRadius: msg.type === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                                padding: '12px 16px',
                                            }}>
                                                <div
                                                    style={{ color: msg.type === 'user' ? 'white' : '#d1d5db', fontSize: 13, lineHeight: 1.65, whiteSpace: 'pre-line' }}
                                                    dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }}
                                                />
                                                <div style={{ fontSize: 10, color: msg.type === 'user' ? 'rgba(255,255,255,0.5)' : '#4b5563', marginTop: 6, textAlign: 'right', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6 }}>
                                                    {formatTime(msg.timestamp)}
                                                    {msg.fallback && <span style={{ color: '#f59e0b', fontSize: 9 }}>● offline mode</span>}
                                                </div>
                                            </div>
                                            {msg.type === 'user' && (
                                                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #1f2937, #374151)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, marginTop: 2 }}>👤</div>
                                            )}
                                        </div>
                                    ))}

                                    {loading && (
                                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #065f46, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🏔️</div>
                                            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px 18px 18px 4px', padding: '14px 18px', display: 'flex', gap: 6, alignItems: 'center' }}>
                                                {[0, 1, 2].map(i => (
                                                    <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', animation: `pulse-green 1.2s ease-in-out ${i * 0.15}s infinite` }} />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Quick Queries - show only on first message */}
                                    {messages.length <= 1 && (
                                        <div style={{ marginTop: 8 }}>
                                            <p style={{ color: '#4b5563', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <FaLightbulb style={{ color: '#f59e0b' }} /> Quick Queries
                                            </p>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                                {QUICK_QUERIES.map((q, i) => (
                                                    <button key={i} className="quick-btn"
                                                        onClick={() => { setQuery(q.text); setTimeout(() => inputRef.current?.focus(), 25); }}
                                                        style={{
                                                            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
                                                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                                                            borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                                                        }}
                                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.08)'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.25)'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                                                    >
                                                        <span style={{ fontSize: 16, flexShrink: 0 }}>{q.emoji}</span>
                                                        <span style={{ color: '#9ca3af', fontSize: 12, fontWeight: 500, lineHeight: 1.4 }}>{q.text}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.07)', background: '#0a0f0a', flexShrink: 0 }}>
                                    <form onSubmit={sendQuery} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                        <div style={{ flex: 1, position: 'relative' }}>
                                            <input
                                                ref={inputRef}
                                                type="text"
                                                value={query}
                                                onChange={e => setQuery(e.target.value)}
                                                placeholder="Hindi, Hinglish, or English mein type karo..."
                                                maxLength={500}
                                                style={{
                                                    width: '100%', padding: '12px 44px 12px 16px',
                                                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: 14, color: 'white', fontSize: 13, outline: 'none',
                                                    boxSizing: 'border-box', fontFamily: 'inherit', transition: 'all 0.2s',
                                                }}
                                                onFocus={e => { e.target.style.borderColor = 'rgba(16,185,129,0.5)'; e.target.style.background = 'rgba(16,185,129,0.05)'; }}
                                                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.05)'; }}
                                            />
                                            <FaMicrophone style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#4b5563', fontSize: 14, cursor: 'pointer' }} />
                                        </div>
                                        <button type="submit" disabled={loading || !query.trim()} className="send-btn"
                                            style={{
                                                width: 46, height: 46, borderRadius: 14, border: 'none',
                                                background: query.trim() && !loading ? 'linear-gradient(135deg, #059669, #10b981)' : 'rgba(255,255,255,0.07)',
                                                color: query.trim() && !loading ? 'white' : '#4b5563',
                                                cursor: query.trim() && !loading ? 'pointer' : 'not-allowed',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 16, flexShrink: 0,
                                                boxShadow: query.trim() && !loading ? '0 4px 16px rgba(16,185,129,0.35)' : 'none',
                                            }}
                                        >
                                            {loading ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaPaperPlane />}
                                        </button>
                                    </form>
                                    <p style={{ color: '#374151', fontSize: 10, textAlign: 'center', marginTop: 8 }}>
                                        📞 <strong style={{ color: '#10b981' }}>1800-180-1551</strong> (Toll-Free) | कृषि हेल्पलाइन: <strong style={{ color: '#10b981' }}>1551</strong>
                                    </p>
                                </div>
                            </>
                        )}

                        {/* ANALYTICS TAB */}
                        {activeTab === 'analytics' && (
                            <div style={{ flex: 1, overflow: 'auto', padding: 20 }} className="ai-scrollbar">
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    {[
                                        { title: 'Top Selling Crops', data: [{ label: 'Rajma', pct: 85, color: '#10b981' }, { label: 'Apple', pct: 72, color: '#6366f1' }, { label: 'Mandua', pct: 60, color: '#f59e0b' }, { label: 'Mango', pct: 48, color: '#ec4899' }] },
                                        { title: 'District Performance', data: [{ label: 'Rudraprayag', pct: 90, color: '#10b981' }, { label: 'Uttarkashi', pct: 75, color: '#6366f1' }, { label: 'Chamoli', pct: 65, color: '#f59e0b' }, { label: 'Pithoragarh', pct: 55, color: '#ec4899' }] },
                                    ].map((section, si) => (
                                        <div key={si} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 18 }}>
                                            <p style={{ color: 'white', fontWeight: 700, fontSize: 14, margin: '0 0 16px' }}>{section.title}</p>
                                            {section.data.map((item, i) => (
                                                <div key={i} style={{ marginBottom: 14 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                                        <span style={{ color: '#d1d5db', fontSize: 12 }}>{item.label}</span>
                                                        <span style={{ color: item.color, fontSize: 12, fontWeight: 700 }}>{item.pct}%</span>
                                                    </div>
                                                    <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                                                        <div style={{ height: '100%', width: `${item.pct}%`, background: item.color, borderRadius: 3, transition: 'width 1s ease' }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>

                                <div style={{ marginTop: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 18 }}>
                                    <p style={{ color: 'white', fontWeight: 700, fontSize: 14, margin: '0 0 16px' }}>Monthly Revenue Trend</p>
                                    <svg viewBox="0 0 600 120" style={{ width: '100%', height: 120 }} preserveAspectRatio="none">
                                        <defs>
                                            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                                                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                        <path d="M0,100 C50,90 100,80 150,65 C200,50 230,45 280,35 C330,25 380,20 430,15 C480,10 540,8 600,5" stroke="#10b981" strokeWidth="2" fill="none" />
                                        <path d="M0,100 C50,90 100,80 150,65 C200,50 230,45 280,35 C330,25 380,20 430,15 C480,10 540,8 600,5 L600,120 L0,120 Z" fill="url(#areaGrad)" />
                                        {[0, 100, 200, 300, 400, 500, 600].map((x, i) => {
                                            const y = [100, 90, 75, 55, 35, 20, 5][i];
                                            return <circle key={i} cx={x} cy={y} r="4" fill="#10b981" />;
                                        })}
                                    </svg>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </>
    );
};

export default AIAssistant;