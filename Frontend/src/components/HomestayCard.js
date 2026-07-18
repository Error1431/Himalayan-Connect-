import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaUtensils, FaWifi, FaTree, FaUsers, FaUserAlt, FaShoppingCart } from 'react-icons/fa';
import { ProfileLink } from '../components/ui';
import { useCart } from '../context/CartContext';
import { useToast } from './ToastContainer';

const HomestayCard = ({ homestay }) => {
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const getLowestPrice = () => {
    if (!homestay.roomTypes || homestay.roomTypes.length === 0) return 0;
    return Math.min(...homestay.roomTypes.map(r => r.pricing?.basePrice || 0));
  };

  const handleAddToCart = () => {
    addToCart({
      id: homestay._id,
      type: 'room',
      name: homestay.homestayName,
      price: getLowestPrice(),
      unit: 'night',
      image: homestay.images?.[0]?.url || '',
      sellerId: homestay.hostId || homestay.farmerId,
      sellerName: homestay.hostName,
    });
    addToast(`${homestay.homestayName} added to cart!`, 'success');
  };

  return (
    <div className="bg-surface dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700">

      {/* Image Gallery */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={homestay.images?.[0]?.url || '/images/default-homestay.jpg'}
          alt={homestay.homestayName}
          className="w-full h-full object-cover"
        />
        {homestay.featured && (
          <span className="absolute top-3 left-3 bg-yellow-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
            ⭐ Top Rated
          </span>
        )}
        {homestay.farmToTablePartnership?.servesOrganicProduce && (
          <span className="absolute top-3 right-3 bg-green-500 text-white text-xs px-3 py-1 rounded-full">
            🌿 Farm-to-Table
          </span>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <h3 className="text-white text-xl font-bold">{homestay.homestayName}</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Location & Host Integration Node */}
        <div className="flex flex-col gap-1.5 mb-3">
          <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
            <FaMapMarkerAlt className="mr-1 text-green-500 animate-pulse" />
            <span>{homestay.location?.village}, {homestay.location?.district}</span>
          </div>

          {/* 🔴 REAL BACKEND PROFILE LINK GATEWAY ATTACHED HERE */}
          {homestay.hostName && (
            <div className="flex items-center text-xs text-gray-400 gap-1 mt-0.5">
              <FaUserAlt className="border-outline dark:text-gray-500 scale-90" />
              <span>Host:</span>
              <ProfileLink sellerId={homestay.hostId || homestay.farmerId} name={homestay.hostName} />
            </div>
          )}
        </div>

        {/* Tagline */}
        <p className="text-ink-soft-soft dark:border-outline text-sm mb-3 line-clamp-2 leading-relaxed">
          {homestay.tagline || homestay.description?.short}
        </p>

        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex items-center bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
            <FaStar className="text-green-600 dark:text-green-400 mr-1" />
            <span className="text-green-800 dark:text-green-400 font-bold">{homestay.ratings?.overall?.toFixed(1) || '4.5'}</span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
            ({homestay.ratings?.totalReviews || 0} reviews)
          </span>
        </div>

        {/* Facilities */}
        <div className="flex flex-wrap gap-2 mb-4">
          {homestay.facilities?.meals && (
            <span className="flex items-center text-xs bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 px-2 py-1 rounded-full font-medium">
              <FaUtensils className="mr-1" /> Meals
            </span>
          )}
          {homestay.facilities?.wifi && (
            <span className="flex items-center text-xs bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full font-medium">
              <FaWifi className="mr-1" /> WiFi
            </span>
          )}
          {homestay.facilities?.trekking && (
            <span className="flex items-center text-xs bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full font-medium">
              <FaTree className="mr-1" /> Trekking
            </span>
          )}
          {homestay.facilities?.farmVisit && (
            <span className="flex items-center text-xs bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded-full font-medium">
              <FaUsers className="mr-1" /> Farm Visit
            </span>
          )}
        </div>

        {/* Price and CTA */}
        <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-700 pt-3">
          <div>
            <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Starting from</span>
            <p className="text-2xl font-black text-green-600 dark:text-green-400 mt-0.5">₹{getLowestPrice()}</p>
            <span className="text-xs text-gray-400">/night</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddToCart}
              title="Add to Cart"
              className="p-2.5 rounded-xl border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 transition active:scale-95"
            >
              <FaShoppingCart />
            </button>
            <Link
              to={`/homestays/${homestay.seo?.slug || homestay._id}`}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl transition font-bold text-sm shadow-md shadow-green-900/10 active:scale-95"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomestayCard;