import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import HomestayCard from '../components/HomestayCard';
import { ProduceShowcase, StaysShowcase } from '../components/HimalayaShowcase';
import {
  FaLeaf, FaHome, FaHandshake,
  FaArrowRight, FaRobot, FaQuoteLeft, FaStar, FaArrowDown
} from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease: 'easeOut' },
};

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

      {/* ================= HERO ================= */}
      <section className="relative min-h-screen flex flex-col justify-end bg-[#0A0F0A] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1920&q=80)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F0A] via-[#0A0F0A]/70 to-[#0A0F0A]/20" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pb-20 pt-40 w-full">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-[#E8562C] text-xs sm:text-sm font-bold uppercase tracking-[0.25em] mb-6"
          >
            Uttarakhand · Zero Middlemen
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-[#F7F3E8] leading-[0.95] tracking-tight mb-8"
          >
            Grown by hand.<br />
            <span className="text-[#8FA876]">Hosted</span> by family.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-[#B8B5AC] text-base sm:text-lg max-w-xl mb-10 leading-relaxed"
          >
            Organic produce straight from Himalayan farms, and homestays run by
            the families who live there — booked direct, at fair prices, with
            nothing in between.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <Link
              to="/products"
              className="bg-[#E8562C] hover:bg-[#d64a22] text-white px-7 py-3.5 rounded-full text-sm font-bold transition inline-flex items-center gap-2"
            >
              Shop the Produce <FaArrowRight className="text-xs" />
            </Link>
            <Link
              to="/homestays"
              className="border border-white/30 hover:border-white/60 text-[#F7F3E8] px-7 py-3.5 rounded-full text-sm font-bold transition"
            >
              Browse Homestays
            </Link>
          </motion.div>
        </div>

        <div className="relative z-10 border-t border-white/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              [`${stats.farmers}+`, 'Farmers'],
              [`${stats.homestays}+`, 'Homestays'],
              [`${stats.products}+`, 'Products'],
              [`${stats.guests}+`, 'Happy Guests'],
            ].map(([value, label]) => (
              <div key={label}>
                <p className="text-2xl md:text-3xl font-black text-[#F7F3E8]">{value}</p>
                <p className="text-[#8FA876] text-xs font-semibold uppercase tracking-wide mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <FaArrowDown className="absolute bottom-24 right-6 sm:right-10 text-white/30 text-xl animate-bounce hidden md:block" />
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="py-20 md:py-28 bg-surface dark:bg-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div {...fadeUp} className="mb-14 text-center">
            <h2 className="text-3xl md:text-4xl font-black text-ink-soft dark:text-ink-soft mb-3 tracking-tight">How It Works</h2>
            <p className="text-gray-500 dark:text-ink-soft-soft text-base font-medium">Farm-to-table meets eco-tourism, in three steps</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { n: '01', icon: FaLeaf, title: 'Farmers Grow', desc: 'Mountain families cultivate organic produce using traditional Himalayan methods at high altitudes.' },
              { n: '02', icon: FaHandshake, title: 'We Connect', desc: 'The platform links farmers and hosts directly with buyers and guests. No middlemen, fair prices.' },
              { n: '03', icon: FaHome, title: 'You Experience', desc: 'Stay at eco homestays, eat farm-fresh organic food, and live the Himalayan way, if only for a while.' },
            ].map((step) => (
              <motion.div key={step.n} {...fadeUp} className="p-8 rounded-2xl border border-gray-100 dark:border-outline bg-surface-alt/50 dark:bg-app-bg/40">
                <div className="flex items-center justify-between mb-6">
                  <step.icon className="text-2xl text-[#E8562C]" />
                  <span className="text-4xl font-black text-gray-200 dark:text-gray-700">{step.n}</span>
                </div>
                <h3 className="text-lg font-bold text-ink-soft dark:text-ink-soft mb-2">{step.title}</h3>
                <p className="text-gray-500 dark:text-ink-soft-soft text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= DEEP STORYTELLING: PRODUCE & STAYS ================= */}
      <ProduceShowcase />
      <StaysShowcase />

      {/* ================= SHOP: LIVE PRODUCE GRID ================= */}
      <section className="py-20 bg-surface-alt dark:bg-app-bg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-ink-soft dark:text-ink-soft mb-2">Shop the Produce</h2>
              <p className="text-gray-500 dark:text-ink-soft-soft text-sm font-medium">Directly from the farms you just read about</p>
            </div>
            <Link to="/products" className="hidden md:flex items-center space-x-2 text-[#E8562C] hover:opacity-80 font-bold text-sm transition">
              <span>View All Products</span> <FaArrowRight className="text-xs" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(featuredProducts.length > 0 ? featuredProducts : sampleProducts).map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          <div className="text-center mt-10 md:hidden">
            <Link to="/products" className="bg-[#E8562C] text-white px-6 py-3 rounded-xl inline-flex items-center space-x-2 hover:opacity-90 text-sm font-bold shadow-sm dark:shadow-none">
              <span>View All Products</span> <FaArrowRight className="text-xs" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= BOOK: LIVE HOMESTAY GRID ================= */}
      <section className="py-20 bg-surface dark:bg-surface">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-ink-soft dark:text-ink-soft mb-2">Book a Stay</h2>
              <p className="text-gray-500 dark:text-ink-soft-soft text-sm font-medium">Zero-commission direct booking — better prices, same family</p>
            </div>
            <Link to="/homestays" className="hidden md:flex items-center space-x-2 text-[#E8562C] hover:opacity-80 font-bold text-sm transition">
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

      {/* ================= TESTIMONIALS ================= */}
      <section className="py-20 md:py-28 bg-[#0A0F0A] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div {...fadeUp} className="mb-14">
            <p className="text-[#E8562C] text-xs font-bold uppercase tracking-[0.2em] mb-4">Guests & Buyers</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">What people say</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={i} {...fadeUp} className="bg-white/[0.03] rounded-2xl p-6 border border-white/10">
                <FaQuoteLeft className="text-[#8FA876] text-xl mb-4 opacity-80" />
                <p className="text-[#B8B5AC] mb-5 text-sm italic leading-relaxed">"{t.text}"</p>
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div>
                    <p className="font-bold text-sm text-[#F7F3E8]">{t.name}</p>
                    <p className="text-[#8FA876] text-xs mt-0.5">{t.location}</p>
                  </div>
                  <div className="flex text-[#E8562C] text-xs gap-0.5">
                    {[...Array(t.rating)].map((_, j) => <FaStar key={j} />)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-24 bg-[#E8562C] text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-black mb-3 tracking-tight">Ready for the mountains?</h2>
          <p className="text-white/85 text-sm md:text-base font-medium mb-8">
            Join the farmers, hosts, and travelers building this, direct.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="bg-white text-[#E8562C] px-8 py-3.5 rounded-full text-sm font-bold hover:bg-white/90 transition">
              Get Started Free
            </Link>
            <Link to="/homestays" className="border-2 border-white/70 text-white px-8 py-3.5 rounded-full text-sm font-bold hover:bg-white/10 transition">
              Browse Homestays
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      <button
        onClick={() => navigate('/ai-assistant')}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#E8562C] text-white rounded-full shadow-lg hover:opacity-90 flex items-center justify-center z-40 transition transform hover:scale-110"
        title="Chat with your Himalaya Connect AI Assistant"
      >
        <FaRobot className="text-2xl" />
      </button>
    </div>
  );
};

export default Home;
