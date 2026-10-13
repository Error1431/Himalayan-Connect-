import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';

const FEATURED_PRODUCE = [
  {
    key: 'red rice',
    title: 'Ghriya Chawal (Red Rice)',
    subtitle: 'Grown in the Garhwal Terraces',
    highlight: 'Antioxidant-rich red rice, hand-harvested on the terraced fields of Garhwal at 1,800m — nutty flavour, naturally organic.',
    tags: ['Antioxidant Rich', 'Naturally Organic'],
    fieldImage: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=1200&q=80',
    productImage: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
  },
  {
    key: 'rajma',
    title: 'Himalayan Rajma',
    subtitle: 'Grown in the Uttarkashi Valleys',
    highlight: 'Slow-grown kidney beans from high-altitude fields — rich in protein and iron, a Himalayan kitchen staple.',
    tags: ['High Protein', 'Rich in Iron'],
    fieldImage: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80',
    productImage: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=600&q=80',
  },
  {
    key: 'mandua',
    title: 'Mandua (Ragi/Finger Millet)',
    subtitle: 'Grown in the Pauri Hills',
    highlight: 'A traditional pahadi grain, stone-ground into flour — high in fibre, naturally gluten-free, low glycemic.',
    tags: ['Rich in Fiber', 'Gluten-Free'],
    fieldImage: 'https://images.unsplash.com/photo-1595855759920-86582396756c?auto=format&fit=crop&w=1200&q=80',
    productImage: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=600&q=80',
  },
  {
    key: 'gahat',
    title: 'Gahat (Horse Gram)',
    subtitle: 'Grown in the Rudraprayag Hills',
    highlight: 'A hardy hill legume cooked into a warming winter dal — traditionally used to aid digestion.',
    tags: ['High Protein', 'Good for Digestion'],
    fieldImage: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80',
    productImage: 'https://images.unsplash.com/photo-1622542796254-5b9c46ab0d2f?auto=format&fit=crop&w=600&q=80',
  },
];

const ProduceShowcase = () => {
  const [realMatches, setRealMatches] = useState({});

  useEffect(() => {
    let cancelled = false;
    api.get('/products')
      .then((res) => {
        if (cancelled || !Array.isArray(res.data)) return;
        const matches = {};
        FEATURED_PRODUCE.forEach((f) => {
          const found = res.data.find((p) =>
            (p.productName || '').toLowerCase().includes(f.key.split(' ')[0])
          );
          if (found) matches[f.key] = found;
        });
        setRealMatches(matches);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return (
    <div>
      <div className="text-center mb-10">
        <p className="text-sm uppercase tracking-widest text-green-600 font-semibold mb-2">Straight From the Terraces</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-ink-soft dark:text-ink-soft">Organic Produce, Grown Right Here</h2>
        <p className="text-gray-500 dark:text-ink-soft-soft mt-2 max-w-xl mx-auto">
          Every product is grown by a real Himalayan farming family — see the field it came from before you buy.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {FEATURED_PRODUCE.map((item, i) => {
          const real = realMatches[item.key];
          const buyLink = real ? `/checkout/product/${real._id}` : '/products';
          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="relative rounded-3xl overflow-hidden shadow-lg group"
              style={{ perspective: 1000 }}
            >
              <div className="relative h-72 sm:h-80">
                <img
                  src={item.fieldImage}
                  alt={`${item.title} growing in the field`}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <motion.img
                  src={item.productImage}
                  alt={item.title}
                  whileHover={{ rotateY: 8, rotateX: -4, scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="absolute top-4 right-4 w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl border-2 border-white/80 shadow-2xl"
                  style={{ transformStyle: 'preserve-3d' }}
                />

                <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                  {item.tags.map((t) => (
                    <span key={t} className="bg-white/90 text-green-700 text-[11px] font-semibold px-2.5 py-1 rounded-full shadow">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                  <p className="text-white/70 text-xs uppercase tracking-wide mb-1">{item.subtitle}</p>
                  <h3 className="text-white text-xl sm:text-2xl font-bold mb-2">{item.title}</h3>
                  <p className="text-white/85 text-sm leading-relaxed mb-4 max-w-md">{item.highlight}</p>
                  <div className="flex gap-3">
                    <Link
                      to={buyLink}
                      className="bg-white text-ink-soft text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-green-50 transition"
                    >
                      Buy Now
                    </Link>
                    <Link
                      to="/products"
                      className="text-white text-sm font-semibold px-5 py-2.5 rounded-full border border-white/40 hover:border-white transition"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ProduceShowcase;
