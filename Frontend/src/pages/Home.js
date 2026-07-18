import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import HomestayCard from '../components/HomestayCard';
import {
  FaLeaf, FaHome, FaUsers, FaHandshake,
  FaSeedling, FaUtensils, FaTree, FaArrowRight,
  FaRobot, FaQuoteLeft, FaStar
} from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Home = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [featuredHomestays, setFeaturedHomestays] = useState([]);
  const [stats] = useState({
    farmers: 120,
    homestays: 45,
    products: 350,
    guests: 2500
  });

  useEffect(() => {
    fetchFeaturedData();
  }, []);

  const fetchFeaturedData = async () => {
    try {
      const [productsRes, homestaysRes] = await Promise.all([
        axios.get(`${API_URL}/products?featured=true&limit=4`).catch(() => ({ data: { products: [] } })),
        axios.get(`${API_URL}/homestays?featured=true&limit=3`).catch(() => ({ data: { homestays: [] } }))
      ]);
      setFeaturedProducts(productsRes.data.products || sampleProducts);
      setFeaturedHomestays(homestaysRes.data.homestays || sampleHomestays);
    } catch (error) {
      setFeaturedProducts(sampleProducts);
      setFeaturedHomestays(sampleHomestays);
    }
  };

  const sampleProducts = [
    {
      _id: '1',
      productName: 'Organic Rajma (Red Kidney Beans)',
      category: 'Pulses',
      description: 'High-altitude organic rajma from Kedarnath Valley. Rich in protein, naturally grown without pesticides.',
      pricing: { basePrice: 220, unit: 'kg' },
      ratings: { average: 4.8, count: 45 },
      organicCertification: { certified: true },
      images: [{ url: 'https://images.unsplash.com/photo-1515543904279-0a239e9ba5d8?w=400' }],
      featured: true
    },
    {
      _id: '2',
      productName: 'Himalayan Pahadi Dal',
      category: 'Pulses',
      description: 'Traditional mountain lentils grown at 2500m altitude. Unique flavor profile.',
      pricing: { basePrice: 180, unit: 'kg' },
      ratings: { average: 4.6, count: 32 },
      organicCertification: { certified: true },
      images: [{ url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400' }],
      featured: true
    },
    {
      _id: '3',
      productName: 'Fresh Organic Cabbage',
      category: 'Vegetables',
      description: 'Crispy mountain cabbage from organic farms. Farm-fresh, delivered within 24 hours.',
      pricing: { basePrice: 45, unit: 'kg' },
      ratings: { average: 4.5, count: 28 },
      organicCertification: { certified: false },
      images: [{ url: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=400' }],
      featured: true
    },
    {
      _id: '4',
      productName: 'Mandua (Finger Millet) Flour',
      category: 'Millets',
      description: 'Nutritious Mandua flour from Uttarakhand hills. Gluten-free, high in calcium.',
      pricing: { basePrice: 120, unit: 'kg' },
      ratings: { average: 4.7, count: 56 },
      organicCertification: { certified: true },
      images: [{ url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400' }],
      featured: true
    }
  ];

  const sampleHomestays = [
    {
      _id: '1',
      homestayName: 'Trishul Valley Eco Homestay',
      tagline: 'Where mountains whisper and stars shine brightest',
      location: { village: 'Chopta', district: 'Rudraprayag' },
      roomTypes: [{ pricing: { basePrice: 2500 } }],
      ratings: { overall: 4.8, totalReviews: 124 },
      facilities: { meals: true, wifi: true, trekking: true, farmVisit: true },
      farmToTablePartnership: { servesOrganicProduce: true },
      images: [{ url: 'https://images.unsplash.com/photo-1587381420270-1e9c0b1b7d5e?w=500' }],
      seo: { slug: 'trishul-valley-eco-homestay' },
      featured: true
    },
    {
      _id: '2',
      homestayName: 'Mandakini Riverside Cottage',
      tagline: 'Wake up to river songs and mountain views',
      location: { village: 'Ukhimath', district: 'Rudraprayag' },
      roomTypes: [{ pricing: { basePrice: 1800 } }],
      ratings: { overall: 4.6, totalReviews: 89 },
      facilities: { meals: true, wifi: false, trekking: true, farmVisit: true },
      farmToTablePartnership: { servesOrganicProduce: true },
      images: [{ url: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=500' }],
      seo: { slug: 'mandakini-riverside-cottage' },
      featured: true
    },
    {
      _id: '3',
      homestayName: 'Tungnath Heights Stay',
      tagline: 'World\'s highest Shiva temple at your doorstep',
      location: { village: 'Dugalbitta', district: 'Rudraprayag' },
      roomTypes: [{ pricing: { basePrice: 2200 } }],
      ratings: { overall: 4.9, totalReviews: 67 },
      facilities: { meals: true, wifi: true, trekking: true, farmVisit: false },
      farmToTablePartnership: { servesOrganicProduce: false },
      images: [{ url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500' }],
      seo: { slug: 'tungnath-heights-stay' },
      featured: true
    }
  ];

  const experiences = [
    { icon: FaSeedling, title: 'Organic Farm Walk', desc: 'Visit mountain farms, learn traditional methods' },
    { icon: FaUtensils, title: 'Farm-to-Table Dining', desc: 'Fresh organic meals cooked by local hosts' },
    { icon: FaTree, title: 'Nature Treks', desc: 'Guided trails through Kedarnath Valley' },
    { icon: FaUsers, title: 'Cultural Immersion', desc: 'Local festivals, music, and storytelling' }
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      location: 'Delhi',
      text: 'The farm-to-table experience was incredible! Fresh organic food straight from the mountain farms. Best holiday ever!',
      rating: 5
    },
    {
      name: 'Rahul Verma',
      location: 'Mumbai',
      text: 'Stayed at Trishul homestay and bought organic rajma. Both were amazing! The farmers are so hospitable.',
      rating: 5
    },
    {
      name: 'Anita Joshi',
      location: 'Bangalore',
      text: 'No OTA commissions means better prices for us AND the host family. Direct booking was so easy!',
      rating: 4
    }
  ];

  return (
    <div className="min-h-screen bg-surface-alt dark:bg-app-bg">
      <Hero />

      <section className="bg-green-700 py-8 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
          <div>
            <p className="text-3xl md:text-4xl font-bold">{stats.farmers}+</p>
            <p className="text-green-200 text-sm font-medium mt-1">Mountain Farmers</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-bold">{stats.stats || stats.homestays}+</p>
            <p className="text-green-200 text-sm font-medium mt-1">Eco Homestays</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-bold">{stats.products}+</p>
            <p className="text-green-200 text-sm font-medium mt-1">Organic Products</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-bold">{stats.guests}+</p>
            <p className="text-green-200 text-sm font-medium mt-1">Happy Guests</p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-surface dark:bg-surface">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-ink-soft dark:text-ink-soft mb-3">How It Works</h2>
            <p className="text-gray-500 dark:text-ink-soft-soft text-base md:text-lg font-medium">Farm-to-Table meets Eco-Tourism</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl hover:shadow-md transition duration-300 bg-green-50/50 border border-green-100/50">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm dark:shadow-none">
                <FaSeedling className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-lg font-bold text-ink-soft dark:text-ink-soft mb-2">1. Farmers Grow</h3>
              <p className="text-gray-500 dark:text-ink-soft-soft text-sm leading-relaxed">Mountain farmers cultivate organic produce using traditional Himalayan methods at high altitudes</p>
            </div>
            <div className="text-center p-8 rounded-2xl hover:shadow-md transition duration-300 bg-yellow-50/50 border border-yellow-100/50">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm dark:shadow-none">
                <FaHandshake className="text-yellow-600 text-2xl" />
              </div>
              <h3 className="text-lg font-bold text-ink-soft dark:text-ink-soft mb-2">2. We Connect</h3>
              <p className="text-gray-500 dark:text-ink-soft-soft text-sm leading-relaxed">Platform connects farmers with homestays and city buyers. No middlemen, fair prices guaranteed</p>
            </div>
            <div className="text-center p-8 rounded-2xl hover:shadow-md transition duration-300 bg-blue-50/50 border border-blue-100/50">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm dark:shadow-none">
                <FaHome className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-lg font-bold text-ink-soft dark:text-ink-soft mb-2">3. You Experience</h3>
              <p className="text-gray-500 dark:text-ink-soft-soft text-sm leading-relaxed">Stay at eco homestays, eat farm-fresh organic food, and immerse in Himalayan culture</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-surface-alt dark:bg-app-bg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-ink-soft dark:text-ink-soft mb-2">🌿 Fresh Organic Produce</h2>
              <p className="text-gray-500 dark:text-ink-soft-soft text-sm font-medium">Directly from Kedarnath Valley farms to your table</p>
            </div>
            <Link to="/products" className="hidden md:flex items-center space-x-2 text-green-600 hover:text-green-700 font-bold text-sm transition">
              <span>View All Products</span> <FaArrowRight className="text-xs" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(featuredProducts.length > 0 ? featuredProducts : sampleProducts).map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          <div className="text-center mt-10 md:hidden">
            <Link to="/products" className="bg-green-600 text-white px-6 py-3 rounded-xl inline-flex items-center space-x-2 hover:bg-green-700 text-sm font-bold shadow-sm dark:shadow-none">
              <span>View All Products</span> <FaArrowRight className="text-xs" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-surface dark:bg-surface">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-ink-soft dark:text-ink-soft mb-2">🏡 Eco Homestays</h2>
              <p className="text-gray-500 dark:text-ink-soft-soft text-sm font-medium">Zero-commission direct booking · Save 20% compared to OTAs</p>
            </div>
            <Link to="/homestays" className="hidden md:flex items-center space-x-2 text-green-600 hover:text-green-700 font-bold text-sm transition">
              <span>View All Homestays</span> <FaArrowRight className="text-xs" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(featuredHomestays.length > 0 ? featuredHomestays : sampleHomestays).map(homestay => (
              <HomestayCard key={homestay._id} homestay={homestay} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-green-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-ink-soft dark:text-ink-soft mb-2">🎭 Cultural Experiences</h2>
            <p className="text-gray-500 dark:text-ink-soft-soft text-base md:text-lg font-medium">More than just a stay — live the mountain life</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {experiences.map((exp, i) => (
              <div key={i} className="bg-surface dark:bg-surface rounded-2xl p-6 shadow-sm dark:shadow-none border border-gray-100 dark:border-outline hover:shadow-md transition duration-300 text-center">
                <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100">
                  <exp.icon className="text-green-600 text-xl" />
                </div>
                <h3 className="text-base font-bold text-ink-soft dark:text-ink-soft mb-1">{exp.title}</h3>
                <p className="text-gray-400 dark:text-ink-soft-soft text-xs leading-relaxed">{exp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3">💬 What Guests Say</h2>
            <p className="text-gray-400 dark:text-ink-soft-soft text-base font-medium">Real reviews from real travelers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-gray-800/80 rounded-2xl p-6 border border-gray-700/50 shadow-lg">
                <FaQuoteLeft className="text-green-400 text-xl mb-4 opacity-80" />
                <p className="border-outline mb-4 text-sm italic leading-relaxed">"{t.text}"</p>
                <div className="flex items-center justify-between pt-2 border-t border-gray-700/40">
                  <div>
                    <p className="font-bold text-sm text-white">{t.name}</p>
                    <p className="text-gray-500 dark:text-ink-soft-soft text-xs mt-0.5">{t.location}</p>
                  </div>
                  <div className="flex text-yellow-400 text-xs gap-0.5">
                    {[...Array(t.rating)].map((_, j) => <FaStar key={j} />)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-green-600 text-white text-center shadow-inner">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">Ready to Experience the Himalayas?</h2>
          <p className="text-green-100 text-sm md:text-base font-medium mb-8">
            Join our community of farmers, hosts, and conscious travelers
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/register" className="bg-surface dark:bg-surface text-green-700 px-8 py-3.5 rounded-xl text-base font-bold hover:bg-green-50 shadow-sm dark:shadow-none transition duration-200">
              Get Started Free
            </Link>
            <Link to="/homestays" className="border-2 border-white text-white px-8 py-3.5 rounded-xl text-base font-bold hover:bg-surface/10 transition duration-200">
              Browse Homestays
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      <button
        onClick={() => navigate('/ai-assistant')}
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-600 text-white rounded-xl shadow-lg hover:bg-green-700 flex items-center justify-center z-40 transition transform hover:scale-110 border border-green-500"
        title="Chat with your Himalaya Connect AI Assistant"
      >
        <FaRobot className="text-2xl" />
      </button>
    </div>
  );
};

export default Home;