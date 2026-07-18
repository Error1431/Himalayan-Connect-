import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api, { API_BASE_URL } from '../utils/api';
import {
  FaStar, FaLeaf, FaMapMarkerAlt, FaEnvelope,
  FaUser, FaRobot, FaTimes, FaPaperPlane, FaExternalLinkAlt, FaShoppingCart
} from 'react-icons/fa';

const ProfileLink = ({ id, name }) => {
  const navigate = useNavigate();

  if (!id) return null;

  return (
    <button
      onClick={() => navigate(`/profile/${id}`)}
      className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-all group"
    >
      <span>View {name?.split(' ')[0]}'s Profile</span>
      <FaExternalLinkAlt className="text-[10px] group-hover:translate-x-1 transition-transform" />
    </button>
  );
};

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [showAI, setShowAI] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const farmerName = product.farmer?.name || product.farmerName || 'Himalayan Farmer';
  const farmerId = product.farmer?._id || product.farmerId || product.farmer;

  const productImage = product.imageUrl
    ? (product.imageUrl.startsWith('http') ? product.imageUrl : `${API_BASE_URL}${product.imageUrl}`)
    : (product.image || 'https://via.placeholder.com/400x300?text=Fresh+Himalayan+Produce');

  const cartItem = {
    id: product._id,
    type: 'product',
    name: product.productName || product.name,
    price: product.pricing?.basePrice || product.basePrice || 0,
    unit: product.pricing?.unit || product.unit || 'kg',
    image: productImage,
    sellerId: farmerId,
    sellerName: farmerName,
  };

  const handleAddToCart = () => {
    addToCart(cartItem);
  };

  const handleBuyNow = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/checkout/product/${product._id}`, { state: { product } });
  };

  const handleStartChat = async () => {
    if (!user) {
      alert('Please login to contact the seller!');
      navigate('/login');
      return;
    }

    try {
      const sellerId = product.farmer?._id || product.farmer || product.farmerId;

      if (!sellerId) {
        alert('Seller information not available');
        return;
      }

      const response = await api.post('/chat/create', {
        participantId: sellerId,
        productId: product._id
      });

      navigate(`/messages?chat=${response.data.chat._id}`);
    } catch (error) {
      console.error('Start chat error:', error);
      alert('Failed to start chat. Please try again.');
    }
  };

  const handleAIQuestion = async () => {
    if (!aiQuestion.trim()) return;

    setAiLoading(true);
    try {
      const response = await api.post('/ai/product-query', {
        productId: product._id,
        productName: product.productName,
        category: product.category,
        description: product.description,
        price: product.pricing?.basePrice || product.basePrice,
        unit: product.pricing?.unit || product.unit,
        location: product.locationAddress || product.location?.address,
        question: aiQuestion
      });

      setAiResponse(response.data.answer || response.data.response || 'AI response received');
    } catch (error) {
      console.error('AI Query Error:', error);
      setAiResponse(getLocalAIResponse(aiQuestion));
    } finally {
      setAiLoading(false);
    }
  };

  const getLocalAIResponse = (question) => {
    const q = question.toLowerCase();
    const productInfo = `${product.productName} - ${product.category}`;

    if (q.includes('price') || q.includes('cost') || q.includes('kitna')) {
      return `${product.productName} ki price hai ₹${product.pricing?.basePrice || product.basePrice} per ${product.pricing?.unit || product.unit}. Yeh fresh Himalayan produce hai aur organic certified hai.`;
    }

    if (q.includes('quality') || q.includes('organic') || q.includes('gunvatta')) {
      return `${product.productName} 100% organic aur fresh hai. Yeh directly Uttarakhand ke Himalayan farms se aata hai. Chemical-free aur naturally grown hai.`;
    }

    if (q.includes('delivery') || q.includes('shipping') || q.includes('bhijwa')) {
      return `Delivery available hai across major cities. Location: ${product.locationAddress || 'Kedarnath Valley, Uttarakhand'}. WhatsApp ya chat karke exact delivery timeline confirm kar sakte hain.`;
    }

    if (q.includes('farmer') || q.includes('seller') || q.includes('kisan')) {
      return `Yeh product ${farmerName} ke farm se hai. Aap directly unse WhatsApp ya chat pe baat kar sakte hain for more details.`;
    }

    if (q.includes('fresh') || q.includes('taza') || q.includes('harvest')) {
      return `${product.productName} fresh harvest hai. Himalayan climate mein naturally grown hai jo iski quality ko best banata hai. Chemical-free farming practices use hoti hain.`;
    }

    return `${product.productName} ek premium ${product.category} product hai jo Himalayan region se aata hai. Price: ₹${product.pricing?.basePrice || product.basePrice}/${product.pricing?.unit || product.unit}. Direct farmer ${farmerName} se contact kar sakte hain.`;
  };

  const getImageUrl = () => {
    if (product.imageURL) {
      return `${API_BASE_URL}${product.imageURL}`;
    }
    if (product.images?.[0]?.url) {
      return product.images[0].url;
    }
    return 'https://via.placeholder.com/400x300?text=Fresh+Himalayan+Produce';
  };

  return (
    <>
      <div className="bg-surface dark:bg-surface rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-outline">
        <div className="relative h-48 overflow-hidden group">
          <img
            src={getImageUrl()}
            alt={product.productName}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
            }}
          />
          {(product.organicCertification?.certified || product.category === 'Organic Foods') && (
            <span className="absolute top-3 left-3 bg-green-500 text-white text-xs px-3 py-1.5 rounded-full flex items-center space-x-1 shadow-lg backdrop-blur-sm">
              <FaLeaf /> <span>Organic Certified</span>
            </span>
          )}
          {product.featured && (
            <span className="absolute top-3 right-3 bg-yellow-500 text-white text-xs px-3 py-1.5 rounded-full shadow-lg">
              ⭐ Featured
            </span>
          )}

          <button
            onClick={() => setShowAI(true)}
            className="absolute bottom-3 right-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-2.5 rounded-full shadow-xl hover:scale-110 transition-transform opacity-0 group-hover:opacity-100"
            title="Ask AI about this product"
          >
            <FaRobot className="text-lg" />
          </button>
        </div>

        <div className="p-5">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-ink-soft dark:text-ink-soft flex-1 line-clamp-1">{product.productName}</h3>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full ml-2 whitespace-nowrap font-semibold">
              {product.category}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-3 p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold shadow-md">
              {farmerName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 dark:text-ink-soft-soft font-semibold">Farmer</p>
              <p className="text-sm font-bold text-ink-soft dark:text-ink-soft">{farmerName}</p>
              <ProfileLink id={farmerId} name={farmerName} />
            </div>
          </div>

          <p className="text-gray-500 dark:text-ink-soft-soft text-sm mb-3 line-clamp-2">
            {product.description || product.aiGeneratedDescription || 'Fresh and organic produce from Himalayan farms'}
          </p>

          <div className="flex items-center text-gray-400 dark:text-ink-soft-soft text-xs mb-3">
            <FaMapMarkerAlt className="mr-1 text-green-500" />
            <span className="truncate">{product.locationAddress || product.location?.address || 'Kedarnath Valley, Uttarakhand'}</span>
          </div>

          <div className="flex items-center mb-3">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                className={`text-sm ${i < Math.floor(product.ratings?.average || 4.5) ? 'text-yellow-400' : 'border-outline'}`}
              />
            ))}
            <span className="text-xs text-gray-500 dark:text-ink-soft-soft ml-2">({product.ratings?.count || 20} reviews)</span>
          </div>

          <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-100 dark:border-outline">
            <div>
              <span className="text-2xl font-bold text-green-600">
                ₹{product.pricing?.basePrice || product.basePrice || 0}
              </span>
              <span className="text-sm text-gray-500 dark:text-ink-soft-soft">/{product.pricing?.unit || product.unit || 'kg'}</span>
            </div>
          </div>

          <div className="flex gap-2 mb-3">
            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-emerald-600 text-emerald-600 px-3 py-2.5 rounded-lg hover:bg-emerald-50 transition font-bold text-sm"
            >
              <FaShoppingCart /> Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white px-3 py-2.5 rounded-lg hover:from-emerald-700 hover:to-green-700 transition font-bold text-sm shadow-md"
            >
              🛒 Buy Now
            </button>
          </div>

          <button
            onClick={handleStartChat}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition font-medium shadow-md hover:shadow-lg"
          >
            <FaEnvelope /> Contact {farmerName.split(' ')[0]}
          </button>
        </div>
      </div>

      {showAI && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-surface dark:bg-surface rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-surface dark:bg-surface/20 backdrop-blur-sm p-2.5 rounded-xl">
                  <FaRobot className="text-2xl text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Product AI Assistant</h3>
                  <p className="text-white/80 text-xs">Ask anything about {product.productName}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAI(false);
                  setAiQuestion('');
                  setAiResponse('');
                }}
                className="text-white/80 hover:text-white p-2 hover:bg-surface/10 rounded-lg transition"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                <p className="text-sm text-ink-soft-soft dark:text-ink-soft-soft font-medium mb-2">Quick Info:</p>
                <p className="text-xs text-ink-soft-soft dark:text-ink-soft-soft leading-relaxed">
                  🌾 Product: <span className="font-bold">{product.productName}</span><br />
                  💰 Price: <span className="font-bold">₹{product.pricing?.basePrice || product.basePrice}/{product.pricing?.unit || product.unit}</span><br />
                  👨‍🌾 Farmer: <span className="font-bold">{farmerName}</span><br />
                  📍 Location: <span className="font-bold">{product.locationAddress?.split(',')[0] || 'Kedarnath Valley'}</span>
                </p>
              </div>

              {aiResponse && (
                <div className="bg-surface dark:bg-surface rounded-xl p-4 border-2 border-purple-200 shadow-sm dark:shadow-none animate-slideUp">
                  <p className="text-xs text-purple-600 font-bold mb-2 flex items-center gap-2">
                    <FaRobot /> AI Response:
                  </p>
                  <p className="text-sm text-ink-soft-soft dark:text-ink-soft-soft leading-relaxed">{aiResponse}</p>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-xs text-gray-500 dark:text-ink-soft-soft font-semibold">Quick Questions:</p>
                <div className="flex flex-wrap gap-2">
                  {['Price details?', 'Is it organic?', 'Delivery available?', 'Contact farmer?'].map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setAiQuestion(q);
                        setAiResponse(getLocalAIResponse(q));
                      }}
                      className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full hover:bg-purple-200 transition font-medium hover:shadow-md"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-surface-alt dark:bg-app-bg border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAIQuestion()}
                  placeholder="Ask anything in Hindi/English..."
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-outline rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-sm transition"
                />
                <button
                  onClick={handleAIQuestion}
                  disabled={aiLoading || !aiQuestion.trim()}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2.5 rounded-lg hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  {aiLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <FaPaperPlane />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;