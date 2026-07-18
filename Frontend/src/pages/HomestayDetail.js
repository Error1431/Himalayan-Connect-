import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    FaStar, FaMapMarkerAlt, FaWifi, FaUtensils,
    FaTree, FaFire, FaMountain, FaLeaf, FaUsers,
    FaBed, FaCheck, FaArrowLeft,
    FaPhone, FaEnvelope, FaCalendarAlt, FaHeart,
    FaShareAlt, FaCamera, FaShieldAlt
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api` : 'http://localhost:5000/api';

const HomestayDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [homestay, setHomestay] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [activeTab, setActiveTab] = useState('overview');
    const [wishlist, setWishlist] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guests, setGuests] = useState(2);

    // Sample homestay data (works without backend)
    const sampleHomestay = {
        _id: slug || '1',
        homestayName: 'Trishul View Cottage',
        tagline: 'Where Mountains Meet Serenity',
        description: {
            short: 'Authentic eco-homestay with stunning Trishul peak views near Chopta, Uttarakhand.',
            detailed: `Nestled at 8,000 feet in the heart of Uttarakhand's most pristine valleys, 
      Trishul View Cottage offers an unparalleled mountain experience. 
      Our community-run homestay is surrounded by dense oak and rhododendron forests, 
      with a breathtaking view of the mighty Trishul peak from every room.
      
      We partner directly with Mandakini Organic Produce Collective to serve fresh, 
      farm-to-table meals cooked by our host family using traditional Garhwali recipes. 
      Experience authentic village life, trek to Tungnath (highest Shiva temple in the world), 
      and witness the most spectacular stargazing at 8000ft altitude.`
        },
        location: {
            village: 'Sari',
            nearestTown: 'Ukhimath',
            district: 'Rudraprayag',
            state: 'Uttarakhand',
            pincode: '246439',
            accessibility: '45 km from Rudraprayag, 8 km from Chopta, motorable road till Sari village',
            nearbyAttractions: [
                'Tungnath Temple (4 km trek)',
                'Chandrashila Peak (5 km trek)',
                'Deoriatal Lake (2 km trek)',
                'Chopta Meadows (8 km)',
                'Kedarnath (45 km)'
            ]
        },
        images: [
            { url: null, caption: 'Mountain View from Balcony' },
            { url: null, caption: 'Cozy Room Interior' },
            { url: null, caption: 'Farm-to-Table Breakfast' },
            { url: null, caption: 'Trekking Trail' },
            { url: null, caption: 'Bonfire Evening' }
        ],
        roomTypes: [
            {
                name: 'Mountain View Room',
                description: 'Spacious room with direct Trishul peak view and attached bathroom',
                capacity: 2,
                totalRooms: 3,
                availableRooms: 2,
                pricing: {
                    basePrice: 2500,
                    weekendPrice: 3000,
                    monsoonPrice: 1800
                },
                amenities: [
                    'Attached Bathroom',
                    'Hot Water (Solar)',
                    'Mountain View',
                    'Blankets Provided',
                    'Study Table',
                    'Power Backup'
                ]
            },
            {
                name: 'Forest Cottage',
                description: 'Private cottage surrounded by oak forest with sit-out area',
                capacity: 4,
                totalRooms: 2,
                availableRooms: 1,
                pricing: {
                    basePrice: 4500,
                    weekendPrice: 5500,
                    monsoonPrice: 3000
                },
                amenities: [
                    'Private Sit-Out',
                    'Attached Bathroom',
                    'Hot Water (Solar)',
                    'Forest View',
                    'Kitchenette',
                    'Power Backup',
                    'WiFi'
                ]
            },
            {
                name: 'Budget Dormitory',
                description: 'Shared dormitory for solo travelers and backpackers',
                capacity: 8,
                totalRooms: 1,
                availableRooms: 1,
                pricing: {
                    basePrice: 800,
                    weekendPrice: 1000,
                    monsoonPrice: 600
                },
                amenities: [
                    'Shared Bathroom',
                    'Hot Water',
                    'Lockers',
                    'Common Area Access',
                    'Blankets'
                ]
            }
        ],
        facilities: {
            wifi: true,
            parking: true,
            meals: true,
            bonfire: true,
            trekking: true,
            farmVisit: true,
            organicFood: true,
            electricBackup: true,
            hotWater: true
        },
        experiences: [
            {
                name: 'Tungnath Temple Trek',
                description: 'Guided trek to the highest Shiva temple in the world at 12,073 ft',
                duration: '6-7 hours',
                price: 600,
                included: false,
                seasonalAvailability: ['April', 'May', 'June', 'September', 'October', 'November']
            },
            {
                name: 'Deoriatal Sunrise Trek',
                description: 'Early morning trek to Deoriatal lake for magical sunrise reflection',
                duration: '3-4 hours',
                price: 400,
                included: false,
                seasonalAvailability: ['All Year']
            },
            {
                name: 'Organic Farm Visit',
                description: 'Visit partner farms of Mandakini Collective, learn traditional farming',
                duration: '3 hours',
                price: 350,
                included: false,
                seasonalAvailability: ['April', 'May', 'June', 'September', 'October']
            },
            {
                name: 'Traditional Cooking Class',
                description: 'Learn to cook authentic Garhwali recipes with your host family',
                duration: '2 hours',
                price: 300,
                included: false,
                seasonalAvailability: ['All Year']
            },
            {
                name: 'Stargazing Night',
                description: 'Crystal clear night sky at 8000ft, guided by our host',
                duration: '2 hours',
                price: 0,
                included: true,
                seasonalAvailability: ['All Year']
            },
            {
                name: 'Bonfire & Folk Music',
                description: 'Evening bonfire with local folk songs by village musicians',
                duration: '2 hours',
                price: 0,
                included: true,
                seasonalAvailability: ['All Year']
            }
        ],
        farmToTablePartnership: {
            servesOrganicProduce: true,
            sourceDescription: 'Fresh vegetables, pulses and dairy directly from Mandakini Organic Produce Collective farmers'
        },
        offseasonPackages: [
            {
                name: '🌧️ Monsoon Writers Residency',
                description: 'Peaceful writing retreat during monsoon with misty valley views',
                duration: '7 Days / 6 Nights',
                price: 18000,
                validFrom: 'June 15',
                validTo: 'September 15',
                targetAudience: 'Writers, Artists, Content Creators',
                itinerary: [
                    'Daily writing sessions 6 AM - 12 PM',
                    'Afternoon forest walks',
                    'Evening community dinners',
                    'Weekly cultural sharing session'
                ]
            },
            {
                name: '🧘 Wellness Monsoon Retreat',
                description: 'Yoga, meditation and herbal healing in the misty mountains',
                duration: '4 Days / 3 Nights',
                price: 12000,
                validFrom: 'June 15',
                validTo: 'September 15',
                targetAudience: 'Wellness seekers, Yoga practitioners',
                itinerary: [
                    'Morning yoga at sunrise point',
                    'Herbal tea ceremonies',
                    'Ayurvedic cooking class',
                    'Forest therapy walks'
                ]
            }
        ],
        ratings: {
            overall: 4.7,
            cleanliness: 4.5,
            food: 4.9,
            hospitality: 5.0,
            location: 4.8,
            value: 4.6,
            totalReviews: 89
        },
        bookingRules: {
            checkInTime: '12:00 PM',
            checkOutTime: '11:00 AM',
            minimumStay: 1,
            maximumStay: 30,
            cancellationPolicy: 'Free cancellation up to 48 hours before check-in',
            advanceBookingDays: 90
        },
        verification: {
            verified: true,
            touristLicense: 'UK-TOUR-2024-5678'
        },
        featured: true
    };

    const sampleReviews = [
        {
            _id: '1',
            customer: { name: 'Priya Sharma', from: 'Delhi' },
            rating: { overall: 5, food: 5, hospitality: 5, location: 5, cleanliness: 5 },
            title: 'Best homestay experience ever!',
            comment: 'The organic food was absolutely incredible. Fresh rajma, pahadi dal, and the view of Trishul from the balcony was breathtaking. Host family was so warm. Will definitely come back!',
            date: '2025-05-20',
            verified: true,
            images: []
        },
        {
            _id: '2',
            customer: { name: 'Rahul Mehra', from: 'Bangalore' },
            rating: { overall: 4, food: 5, hospitality: 5, location: 4, cleanliness: 4 },
            title: 'Perfect for a mountain escape',
            comment: 'Came for the writers residency package during monsoon. The misty views were magical. WiFi was decent enough for work. Food quality is 10/10 - everything from local farms. Road was a bit bumpy but worth it!',
            date: '2025-05-10',
            verified: true,
            images: []
        },
        {
            _id: '3',
            customer: { name: 'Ananya Patel', from: 'Mumbai' },
            rating: { overall: 5, food: 5, hospitality: 5, location: 5, cleanliness: 4 },
            title: 'Farm-to-table dining is a game changer',
            comment: 'Never thought I would enjoy waking up at 5 AM for a farm visit, but it was incredible. The hosts are so knowledgeable about traditional farming. The cooking class taught me recipes my grandma used to make. Stargazing was out of this world!',
            date: '2025-04-28',
            verified: true,
            images: []
        },
        {
            _id: '4',
            customer: { name: 'Vikram Singh', from: 'Jaipur' },
            rating: { overall: 5, food: 5, hospitality: 5, location: 5, cleanliness: 5 },
            title: 'Corporate retreat done right!',
            comment: 'Brought our team of 8 here for a corporate retreat. The team bonding activities, farm visits and bonfire evenings were perfect. The homestay owner arranged everything seamlessly. Already planning our next trip!',
            date: '2025-04-15',
            verified: true,
            images: []
        }
    ];

    useEffect(() => {
        fetchHomestay();
    }, [slug]);

    const fetchHomestay = async () => {
        try {
            const res = await axios.get(`${API}/homestays/${slug}`);
            setHomestay(res.data);
            setSelectedRoom(res.data.roomTypes?.[0]);
        } catch (error) {
            // Use sample data if backend not available
            setHomestay(sampleHomestay);
            setSelectedRoom(sampleHomestay.roomTypes[0]);
        } finally {
            setLoading(false);
        }
    };

    // Calculate price
    const calculatePrice = () => {
        if (!checkIn || !checkOut || !selectedRoom) return null;
        const nights = Math.ceil(
            (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
        );
        if (nights <= 0) return null;
        const roomPrice = selectedRoom.pricing.basePrice * nights;
        const tax = Math.round(roomPrice * 0.12);
        return { nights, roomPrice, tax, total: roomPrice + tax };
    };

    const priceCalc = calculatePrice();

    const handleBookNow = () => {
        if (!checkIn || !checkOut) {
            toast.error('Please select check-in and check-out dates');
            return;
        }
        if (user) {
            navigate(`/booking/${homestay?._id || slug}`);
        } else {
            toast.info('Please login to book');
            navigate('/login');
        }
    };

    const handleMessageHost = () => {
        const data = homestay || sampleHomestay;
        const hostId = data?.hostId || data?.owner;
        if (!user) {
            toast.info('Please login to message the host');
            navigate('/login');
            return;
        }
        if (!hostId) {
            toast.error('Host details are not available for this listing');
            return;
        }
        navigate(`/messages?to=${hostId}&productName=${encodeURIComponent(data.homestayName)}`);
    };

    const facilityIcons = {
        wifi: { icon: FaWifi, label: 'Free WiFi' },
        meals: { icon: FaUtensils, label: 'Meals Included' },
        bonfire: { icon: FaFire, label: 'Bonfire' },
        trekking: { icon: FaMountain, label: 'Trekking' },
        farmVisit: { icon: FaLeaf, label: 'Farm Visit' },
        organicFood: { icon: FaLeaf, label: 'Organic Food' },
        parking: { icon: FaCheck, label: 'Parking' },
        electricBackup: { icon: FaCheck, label: 'Power Backup' },
        hotWater: { icon: FaCheck, label: 'Hot Water' }
    };

    const data = homestay || sampleHomestay;
    const reviews = sampleReviews;

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mx-auto"></div>
                    <p className="text-ink-soft-soft dark:text-ink-soft-soft">Loading homestay details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">

            {/* Back Button */}
            <button
                onClick={() => navigate('/homestays')}
                className="flex items-center gap-2 text-ink-soft-soft dark:text-ink-soft-soft hover:text-green-600 mb-6 font-semibold transition"
            >
                <FaArrowLeft /> Back to Homestays
            </button>

            {/* ===== HERO SECTION ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 rounded-2xl overflow-hidden mb-8 h-96">

                {/* Main Image */}
                <div className="lg:col-span-2 bg-gradient-to-br from-green-200 to-emerald-300 flex items-center justify-center relative">
                    <div className="text-center text-white">
                        <div className="text-9xl mb-4">🏔️</div>
                        <p className="text-lg font-semibold text-green-800">{data.homestayName}</p>
                        <p className="text-sm text-green-700">{data.location?.village}, {data.location?.district}</p>
                    </div>

                    {/* Wishlist & Share Buttons */}
                    <div className="absolute top-4 right-4 flex gap-2">
                        <button
                            onClick={() => {
                                setWishlist(!wishlist);
                                toast.success(wishlist ? 'Removed from wishlist' : 'Added to wishlist! ❤️');
                            }}
                            className={`p-3 rounded-full shadow-lg transition ${wishlist ? 'bg-red-500 text-white' : 'bg-surface dark:bg-surface text-ink-soft-soft dark:text-ink-soft-soft'
                                }`}
                        >
                            <FaHeart />
                        </button>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                toast.success('Link copied! 📋');
                            }}
                            className="p-3 rounded-full bg-surface dark:bg-surface text-ink-soft-soft dark:text-ink-soft-soft shadow-lg hover:bg-surface-alt"
                        >
                            <FaShareAlt />
                        </button>
                    </div>

                    {/* Verified Badge */}
                    {data.verification?.verified && (
                        <div className="absolute bottom-4 left-4 bg-green-600 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1">
                            <FaShieldAlt /> Verified Homestay
                        </div>
                    )}
                </div>

                {/* Side Images */}
                <div className="hidden lg:grid grid-rows-2 gap-3">
                    <div className="bg-gradient-to-br from-blue-200 to-cyan-300 flex items-center justify-center rounded-xl">
                        <div className="text-center">
                            <div className="text-5xl">🛏️</div>
                            <p className="text-xs text-blue-700 mt-1">Cozy Rooms</p>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-200 to-orange-200 flex items-center justify-center rounded-xl">
                        <div className="text-center">
                            <div className="text-5xl">🍽️</div>
                            <p className="text-xs text-orange-700 mt-1">Farm-to-Table Food</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== MAIN CONTENT ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Content (2/3) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Title & Rating */}
                    <div>
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-extrabold text-ink-soft dark:text-ink-soft">
                                    {data.homestayName}
                                </h1>
                                <p className="text-green-600 font-semibold text-lg mt-1">
                                    {data.tagline}
                                </p>
                                <p className="flex items-center gap-1 text-gray-500 dark:text-ink-soft-soft mt-2">
                                    <FaMapMarkerAlt className="text-red-400" />
                                    {data.location?.village}, {data.location?.district}, {data.location?.state}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar
                                            key={i}
                                            className={i < Math.floor(data.ratings?.overall) ? 'text-yellow-400' : 'border-outline'}
                                        />
                                    ))}
                                    <span className="font-bold ml-1">{data.ratings?.overall}</span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-ink-soft-soft">{data.ratings?.totalReviews} reviews</p>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex flex-wrap gap-4 mt-4">
                            {[
                                { label: 'Check-in', value: data.bookingRules?.checkInTime || '12:00 PM' },
                                { label: 'Check-out', value: data.bookingRules?.checkOutTime || '11:00 AM' },
                                { label: 'Min Stay', value: `${data.bookingRules?.minimumStay || 1} night` },
                                { label: 'Altitude', value: '8,000 ft' }
                            ].map((stat, i) => (
                                <div key={i} className="bg-green-50 rounded-lg px-4 py-2 text-center">
                                    <p className="text-xs text-gray-500 dark:text-ink-soft-soft">{stat.label}</p>
                                    <p className="font-bold text-green-700 text-sm">{stat.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200 dark:border-outline">
                        <div className="flex gap-1 overflow-x-auto">
                            {[
                                { id: 'overview', label: '🏠 Overview' },
                                { id: 'rooms', label: '🛏️ Rooms' },
                                { id: 'experiences', label: '🎯 Experiences' },
                                { id: 'reviews', label: `⭐ Reviews (${reviews.length})` },
                                { id: 'offseason', label: '🌧️ Offseason Packages' },
                                { id: 'location', label: '📍 Location' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition ${activeTab === tab.id
                                        ? 'border-green-600 text-green-600'
                                        : 'border-transparent text-gray-500 dark:text-ink-soft-soft hover:text-green-600'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ===== OVERVIEW TAB ===== */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Description */}
                            <div>
                                <h3 className="text-xl font-bold text-ink-soft dark:text-ink-soft mb-3">About This Homestay</h3>
                                <p className="text-ink-soft-soft dark:text-ink-soft-soft leading-relaxed">{data.description?.detailed}</p>
                            </div>

                            {/* Facilities */}
                            <div>
                                <h3 className="text-xl font-bold text-ink-soft dark:text-ink-soft mb-4">Facilities & Amenities</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {Object.entries(data.facilities || {}).map(([key, value]) => {
                                        if (!value || !facilityIcons[key]) return null;
                                        const { icon: Icon, label } = facilityIcons[key];
                                        return (
                                            <div key={key} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                                <Icon className="text-green-600" />
                                                <span className="text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft">{label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Farm to Table */}
                            {data.farmToTablePartnership?.servesOrganicProduce && (
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
                                    <h4 className="font-bold text-green-800 flex items-center gap-2 text-lg">
                                        <FaLeaf className="text-green-600" /> Farm-to-Table Partnership
                                    </h4>
                                    <p className="text-green-700 mt-2">
                                        {data.farmToTablePartnership.sourceDescription}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {['Fresh Vegetables', 'Organic Pulses', 'Local Honey', 'Mountain Herbs', 'Dairy Products'].map((item, i) => (
                                            <span key={i} className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                                                ✓ {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Ratings Breakdown */}
                            <div>
                                <h3 className="text-xl font-bold text-ink-soft dark:text-ink-soft mb-4">Rating Breakdown</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: 'Overall', value: data.ratings?.overall },
                                        { label: 'Cleanliness', value: data.ratings?.cleanliness },
                                        { label: 'Food', value: data.ratings?.food },
                                        { label: 'Hospitality', value: data.ratings?.hospitality },
                                        { label: 'Location', value: data.ratings?.location },
                                        { label: 'Value for Money', value: data.ratings?.value }
                                    ].map((rating, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <span className="text-sm text-ink-soft-soft dark:text-ink-soft-soft w-28">{rating.label}</span>
                                            <div className="flex-1 bg-gray-200 dark:bg-surface-alt rounded-full h-2">
                                                <div
                                                    className="bg-green-500 h-2 rounded-full"
                                                    style={{ width: `${(rating.value / 5) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-bold text-ink-soft-soft dark:text-ink-soft-soft">{rating.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ===== ROOMS TAB ===== */}
                    {activeTab === 'rooms' && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-ink-soft dark:text-ink-soft">Available Rooms</h3>
                            {data.roomTypes?.map((room, i) => (
                                <div
                                    key={i}
                                    onClick={() => setSelectedRoom(room)}
                                    className={`border-2 rounded-xl overflow-hidden cursor-pointer transition hover:shadow-lg ${selectedRoom?.name === room.name
                                        ? 'border-green-500 shadow-md'
                                        : 'border-gray-200 dark:border-outline'
                                        }`}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-3">
                                        {/* Room Image */}
                                        <div className="bg-gradient-to-br from-green-100 to-emerald-50 flex items-center justify-center h-40 md:h-auto">
                                            <div className="text-center">
                                                <div className="text-5xl">
                                                    {i === 0 ? '🏔️' : i === 1 ? '🌲' : '🛏️'}
                                                </div>
                                                <p className="text-xs text-ink-soft-soft dark:text-ink-soft-soft mt-1">{room.name}</p>
                                            </div>
                                        </div>

                                        {/* Room Details */}
                                        <div className="md:col-span-2 p-5">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="text-lg font-bold text-ink-soft dark:text-ink-soft">{room.name}</h4>
                                                    <p className="text-sm text-ink-soft-soft dark:text-ink-soft-soft mt-1">{room.description}</p>
                                                </div>
                                                {selectedRoom?.name === room.name && (
                                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                                                        ✓ Selected
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex gap-4 mt-3 text-sm text-gray-500 dark:text-ink-soft-soft">
                                                <span className="flex items-center gap-1">
                                                    <FaUsers /> Max {room.capacity} guests
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <FaBed /> {room.availableRooms} available
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {room.amenities?.map((amenity, j) => (
                                                    <span key={j} className="text-xs bg-surface-alt dark:bg-surface-alt text-ink-soft-soft dark:text-ink-soft-soft px-2 py-1 rounded-full">
                                                        ✓ {amenity}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="flex justify-between items-center mt-4 pt-4 border-t">
                                                <div>
                                                    <p className="text-2xl font-bold text-green-600">
                                                        ₹{room.pricing?.basePrice?.toLocaleString()}
                                                        <span className="text-sm text-gray-500 dark:text-ink-soft-soft font-normal">/night</span>
                                                    </p>
                                                    <p className="text-xs text-gray-400 dark:text-ink-soft-soft">
                                                        Weekend: ₹{room.pricing?.weekendPrice?.toLocaleString()} |
                                                        Monsoon: ₹{room.pricing?.monsoonPrice?.toLocaleString()}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedRoom(room)}
                                                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${selectedRoom?.name === room.name
                                                        ? 'bg-green-600 text-white'
                                                        : 'border-2 border-green-600 text-green-600 hover:bg-green-50'
                                                        }`}
                                                >
                                                    {selectedRoom?.name === room.name ? '✓ Selected' : 'Select Room'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ===== EXPERIENCES TAB ===== */}
                    {activeTab === 'experiences' && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-ink-soft dark:text-ink-soft">Activities & Experiences</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {data.experiences?.map((exp, i) => (
                                    <div key={i} className={`p-5 rounded-xl border-2 ${exp.included
                                        ? 'border-blue-200 bg-blue-50'
                                        : 'border-gray-200 dark:border-outline hover:border-green-300 bg-surface dark:bg-surface'
                                        } transition`}>
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-ink-soft dark:text-ink-soft">{exp.name}</h4>
                                            {exp.included ? (
                                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">
                                                    FREE ✓
                                                </span>
                                            ) : (
                                                <span className="text-green-600 font-bold">₹{exp.price}/person</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-ink-soft-soft dark:text-ink-soft-soft mt-2">{exp.description}</p>
                                        <div className="flex justify-between items-center mt-3">
                                            <span className="text-xs text-gray-500 dark:text-ink-soft-soft">⏱ {exp.duration}</span>
                                            <span className="text-xs text-green-600 font-semibold">
                                                📅 {exp.seasonalAvailability?.join(', ')}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ===== REVIEWS TAB ===== */}
                    {activeTab === 'reviews' && (
                        <div className="space-y-6">
                            {/* Review Summary */}
                            <div className="bg-green-50 rounded-xl p-6 flex flex-col md:flex-row gap-6 items-center">
                                <div className="text-center">
                                    <p className="text-6xl font-extrabold text-green-700">
                                        {data.ratings?.overall}
                                    </p>
                                    <div className="flex justify-center mt-2">
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar key={i} className="text-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-ink-soft-soft mt-1">
                                        {data.ratings?.totalReviews} reviews
                                    </p>
                                </div>
                                <div className="flex-1 space-y-2 w-full">
                                    {[
                                        { label: 'Excellent (5★)', count: 67, percent: 75 },
                                        { label: 'Good (4★)', count: 18, percent: 20 },
                                        { label: 'Average (3★)', count: 4, percent: 4 },
                                        { label: 'Poor (1-2★)', count: 0, percent: 1 }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <span className="text-xs text-ink-soft-soft dark:text-ink-soft-soft w-32">{item.label}</span>
                                            <div className="flex-1 bg-gray-200 dark:bg-surface-alt rounded-full h-2">
                                                <div
                                                    className="bg-yellow-400 h-2 rounded-full"
                                                    style={{ width: `${item.percent}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs text-gray-500 dark:text-ink-soft-soft w-8">{item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Individual Reviews */}
                            <div className="space-y-4">
                                {reviews.map((review) => (
                                    <div key={review._id} className="bg-surface dark:bg-surface border border-gray-100 dark:border-outline rounded-xl p-5 shadow-sm dark:shadow-none">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-700">
                                                    {review.customer?.name?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-ink-soft dark:text-ink-soft">{review.customer?.name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-ink-soft-soft">
                                                        {review.customer?.from} • {review.date}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <FaStar
                                                        key={i}
                                                        className={i < review.rating?.overall ? 'text-yellow-400' : 'border-outline'}
                                                        size={12}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <h4 className="font-semibold text-ink-soft dark:text-ink-soft mt-3">{review.title}</h4>
                                        <p className="text-sm text-ink-soft-soft dark:text-ink-soft-soft mt-1 leading-relaxed">{review.comment}</p>
                                        {review.verified && (
                                            <span className="text-xs text-green-600 font-semibold mt-2 block">
                                                ✅ Verified Stay
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ===== OFFSEASON PACKAGES TAB ===== */}
                    {activeTab === 'offseason' && (
                        <div className="space-y-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <h4 className="font-bold text-blue-800">
                                    🌧️ Monsoon Offseason Packages (June - September)
                                </h4>
                                <p className="text-sm text-blue-600 mt-1">
                                    Special packages designed to beat the seasonal revenue drop.
                                    Best prices guaranteed during monsoon season!
                                </p>
                            </div>

                            {data.offseasonPackages?.map((pkg, i) => (
                                <div key={i} className="border-2 border-blue-200 rounded-xl overflow-hidden hover:shadow-lg transition">
                                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                                        <h4 className="text-xl font-bold">{pkg.name}</h4>
                                        <p className="text-blue-200 mt-1">{pkg.duration}</p>
                                        <p className="text-3xl font-bold mt-2">
                                            ₹{pkg.price?.toLocaleString()}
                                            <span className="text-sm font-normal">/person</span>
                                        </p>
                                        <p className="text-blue-300 text-xs mt-1">
                                            Valid: {pkg.validFrom} – {pkg.validTo}
                                        </p>
                                    </div>
                                    <div className="p-6 space-y-4 bg-surface dark:bg-surface">
                                        <p className="text-ink-soft-soft dark:text-ink-soft-soft">{pkg.description}</p>
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 dark:text-ink-soft-soft uppercase mb-2">Target</p>
                                            <p className="text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft">{pkg.targetAudience}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 dark:text-ink-soft-soft uppercase mb-2">Itinerary</p>
                                            {pkg.itinerary?.map((item, j) => (
                                                <p key={j} className="text-sm text-ink-soft-soft dark:text-ink-soft-soft py-1 border-b border-dashed">
                                                    📌 {item}
                                                </p>
                                            ))}
                                        </div>
                                        <div className="flex gap-3 mt-4">
                                            <button
                                                onClick={handleMessageHost}
                                                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center gap-2"
                                            >
                                                <FaEnvelope /> Ask About This Package
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ===== LOCATION TAB ===== */}
                    {activeTab === 'location' && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-ink-soft dark:text-ink-soft">Location & Accessibility</h3>

                            <div className="bg-surface-alt dark:bg-surface-alt rounded-xl h-64 flex items-center justify-center">
                                <div className="text-center text-gray-500 dark:text-ink-soft-soft">
                                    <FaMapMarkerAlt className="text-red-400 text-4xl mx-auto mb-2" />
                                    <p className="font-semibold">{data.homestayName}</p>
                                    <p className="text-sm">{data.location?.village}, {data.location?.district}</p>
                                    <p className="text-xs mt-2">📍 Uttarakhand, India</p>
                                    <a
                                        href={`https://maps.google.com/?q=${data.location?.village}+${data.location?.district}+Uttarakhand`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-3 inline-block bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600"
                                    >
                                        Open in Google Maps
                                    </a>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-surface dark:bg-surface border rounded-xl p-4">
                                    <h4 className="font-bold text-ink-soft dark:text-ink-soft mb-3">🚗 How to Reach</h4>
                                    <p className="text-sm text-ink-soft-soft dark:text-ink-soft-soft">{data.location?.accessibility}</p>
                                    <div className="mt-3 space-y-2 text-sm">
                                        <p>✈️ Nearest Airport: Jolly Grant, Dehradun (190 km)</p>
                                        <p>🚂 Nearest Railway: Rishikesh (185 km)</p>
                                        <p>🚌 Bus: Rudraprayag → Ukhimath → Sari</p>
                                    </div>
                                </div>
                                <div className="bg-surface dark:bg-surface border rounded-xl p-4">
                                    <h4 className="font-bold text-ink-soft dark:text-ink-soft mb-3">📍 Nearby Attractions</h4>
                                    <ul className="space-y-2">
                                        {data.location?.nearbyAttractions?.map((attraction, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm text-ink-soft-soft dark:text-ink-soft-soft">
                                                <FaMapMarkerAlt className="text-red-400 flex-shrink-0" />
                                                {attraction}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ===== RIGHT SIDEBAR - BOOKING WIDGET ===== */}
                <div className="lg:col-span-1">
                    <div className="sticky top-20 space-y-4">

                        {/* Booking Card */}
                        <div className="bg-surface dark:bg-surface rounded-2xl shadow-xl border border-gray-100 dark:border-outline overflow-hidden">
                            {/* Price Header */}
                            <div className="bg-gradient-to-r from-green-700 to-emerald-600 p-5 text-white">
                                <p className="text-3xl font-extrabold">
                                    ₹{selectedRoom?.pricing?.basePrice?.toLocaleString() || '1,800'}
                                </p>
                                <p className="text-green-200 text-sm">per night • {selectedRoom?.name || 'Mountain View Room'}</p>

                                <div className="flex items-center gap-1 mt-2">
                                    <FaStar className="text-yellow-300" />
                                    <span className="font-bold">{data.ratings?.overall}</span>
                                    <span className="text-green-300 text-sm">({data.ratings?.totalReviews} reviews)</span>
                                </div>
                            </div>

                            <div className="p-5 space-y-4">

                                {/* Date Selection */}
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs text-gray-500 dark:text-ink-soft-soft font-semibold block mb-1">
                                            <FaCalendarAlt className="inline mr-1" /> Check-in
                                        </label>
                                        <input
                                            type="date"
                                            value={checkIn}
                                            onChange={(e) => setCheckIn(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full px-3 py-2 border-2 border-gray-200 dark:border-outline rounded-lg text-sm focus:border-green-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 dark:text-ink-soft-soft font-semibold block mb-1">
                                            <FaCalendarAlt className="inline mr-1" /> Check-out
                                        </label>
                                        <input
                                            type="date"
                                            value={checkOut}
                                            onChange={(e) => setCheckOut(e.target.value)}
                                            min={checkIn || new Date().toISOString().split('T')[0]}
                                            className="w-full px-3 py-2 border-2 border-gray-200 dark:border-outline rounded-lg text-sm focus:border-green-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Guests */}
                                <div>
                                    <label className="text-xs text-gray-500 dark:text-ink-soft-soft font-semibold block mb-1">
                                        <FaUsers className="inline mr-1" /> Guests
                                    </label>
                                    <select
                                        value={guests}
                                        onChange={(e) => setGuests(Number(e.target.value))}
                                        className="w-full px-3 py-2 border-2 border-gray-200 dark:border-outline rounded-lg text-sm focus:border-green-500 focus:outline-none"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                                            <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Room Selection */}
                                <div>
                                    <label className="text-xs text-gray-500 dark:text-ink-soft-soft font-semibold block mb-1">
                                        <FaBed className="inline mr-1" /> Room Type
                                    </label>
                                    <select
                                        value={selectedRoom?.name || ''}
                                        onChange={(e) => {
                                            const room = data.roomTypes?.find(r => r.name === e.target.value);
                                            setSelectedRoom(room);
                                        }}
                                        className="w-full px-3 py-2 border-2 border-gray-200 dark:border-outline rounded-lg text-sm focus:border-green-500 focus:outline-none"
                                    >
                                        {data.roomTypes?.map((room, i) => (
                                            <option key={i} value={room.name}>
                                                {room.name} — ₹{room.pricing?.basePrice}/night
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Price Breakdown */}
                                {priceCalc && (
                                    <div className="bg-green-50 rounded-xl p-4 space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-ink-soft-soft dark:text-ink-soft-soft">Room ({priceCalc.nights} nights)</span>
                                            <span className="font-semibold">₹{priceCalc.roomPrice?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-ink-soft-soft dark:text-ink-soft-soft">GST (12%)</span>
                                            <span className="font-semibold">₹{priceCalc.tax?.toLocaleString()}</span>
                                        </div>
                                        <hr className="border-green-200" />
                                        <div className="flex justify-between text-base">
                                            <span className="font-bold text-ink-soft dark:text-ink-soft">Total</span>
                                            <span className="font-bold text-green-600">
                                                ₹{priceCalc.total?.toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-green-600 font-semibold text-center">
                                            💰 You save ₹{Math.round(priceCalc.total * 0.2).toLocaleString()} vs OTA booking!
                                        </p>
                                    </div>
                                )}

                                {/* Book Now Button */}
                                <button
                                    onClick={handleBookNow}
                                    className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition transform hover:scale-105 shadow-lg"
                                >
                                    {priceCalc
                                        ? `Book Now — ₹${priceCalc.total?.toLocaleString()}`
                                        : 'Book Now'}
                                </button>

                                {/* Message Host */}
                                <button
                                    onClick={handleMessageHost}
                                    className="w-full flex items-center justify-center gap-2 bg-surface-alt dark:bg-surface-alt text-ink-soft dark:text-ink-soft border border-gray-200 dark:border-outline py-3 rounded-xl font-semibold hover:bg-green-50 dark:hover:bg-green-900/20 transition"
                                >
                                    <FaEnvelope size={18} /> Message Host
                                </button>

                                <p className="text-xs text-center text-gray-500 dark:text-ink-soft-soft">
                                    Zero commission booking 🤝 Best price guaranteed
                                </p>
                            </div>
                        </div>

                        {/* Contact Card */}
                        <div className="bg-surface dark:bg-surface rounded-xl shadow-md border p-5 space-y-3">
                            <h4 className="font-bold text-ink-soft dark:text-ink-soft">📞 Contact Host Directly</h4>
                            <div className="space-y-2">
                                {(homestay || sampleHomestay)?.hostPhone ? (
                                    <a
                                        href={`tel:+91${(homestay || sampleHomestay).hostPhone}`}
                                        className="flex items-center gap-3 text-sm text-ink-soft-soft dark:text-ink-soft-soft hover:text-green-600 transition"
                                    >
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                            <FaPhone className="text-green-600" size={12} />
                                        </div>
                                        +91 {(homestay || sampleHomestay).hostPhone}
                                    </a>
                                ) : (
                                    <p className="text-xs text-gray-400 dark:text-ink-soft-soft">Phone number not shared publicly — use Message Host below.</p>
                                )}
                                <button
                                    onClick={handleMessageHost}
                                    className="flex items-center gap-3 text-sm text-ink-soft-soft dark:text-ink-soft-soft hover:text-green-600 transition"
                                >
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <FaEnvelope className="text-green-600" size={12} />
                                    </div>
                                    Message Host on Himalaya Connect
                                </button>
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="bg-surface dark:bg-surface rounded-xl shadow-md border p-4">
                            <div className="grid grid-cols-2 gap-3 text-center text-xs text-ink-soft-soft dark:text-ink-soft-soft">
                                {[
                                    { emoji: '🛡️', label: 'Verified Host' },
                                    { emoji: '💰', label: 'Best Price' },
                                    { emoji: '✅', label: 'Instant Confirm' },
                                    { emoji: '🔄', label: 'Free Cancel' }
                                ].map((badge, i) => (
                                    <div key={i} className="bg-green-50 rounded-lg p-2">
                                        <div className="text-xl">{badge.emoji}</div>
                                        <p className="font-semibold mt-1">{badge.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomestayDetail;