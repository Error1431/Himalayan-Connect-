import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaWater, FaMountain } from 'react-icons/fa';
import api from '../utils/api';

const FEATURED_HOMESTAYS = [
  {
    key: 'rishikesh',
    name: 'Ganga-Side Retreat',
    village: 'Rishikesh', district: 'Dehradun',
    view: 'river', viewLabel: 'River View',
    famous: 'Steps from the Ganga ghats — evening Ganga Aarti and white-water rafting nearby.',
    image: 'https://images.unsplash.com/photo-1506059612708-99d6c258160e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    key: 'chopta',
    name: 'Chopta Meadow House',
    village: 'Chopta', district: 'Rudraprayag',
    view: 'mountain', viewLabel: 'Mountain View',
    famous: 'Wakes up to the Chaukhamba peaks — base point for the Tungnath & Chandrashila trek.',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    key: 'sattal',
    name: 'Sattal Lakeside Cottage',
    village: 'Sattal', district: 'Nainital',
    view: 'lake', viewLabel: 'Lake View',
    famous: 'A cluster of seven interconnected lakes — known for birdwatching and quiet forest walks.',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    key: 'almora',
    name: 'Kasar Devi Hilltop Home',
    village: 'Kasar Devi', district: 'Almora',
    view: 'valley', viewLabel: 'Valley View',
    famous: 'Panoramic valley sunsets — close to the Kasar Devi temple and Kalimath forest trails.',
    image: 'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    key: 'sankri',
    name: 'Sankri Trailhead Stay',
    village: 'Sankri', district: 'Uttarkashi',
    view: 'mountain', viewLabel: 'Mountain View',
    famous: 'The gateway village to the Kedarkantha and Har Ki Dun treks, deodar forests all around.',
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200&q=80',
  },
];

const VIEW_ICON = { river: FaWater, lake: FaWater, mountain: FaMountain, valley: FaMountain, forest: FaMountain, general: FaMapMarkerAlt };

const HomestayShowcase = () => {
  const [realMatches, setRealMatches] = useState({});

  useEffect(() => {
    let cancelled = false;
    api.get('/homestays')
      .then((res) => {
        if (cancelled || !Array.isArray(res.data)) return;
        const matches = {};
        FEATURED_HOMESTAYS.forEach((f) => {
          const found = res.data.find((h) =>
            (h.village || '').toLowerCase().includes(f.village.toLowerCase())
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
        <p className="text-sm uppercase tracking-widest text-blue-600 font-semibold mb-2">Wake Up to the View</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-ink-soft dark:text-ink-soft">Homestays Worth Waking Up Early For</h2>
        <p className="text-gray-500 dark:text-ink-soft-soft mt-2 max-w-xl mx-auto">
          River, mountain, lake or valley — every listing is auto-tagged by its real view, so you know exactly what you're booking.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURED_HOMESTAYS.map((item, i) => {
          const real = realMatches[item.key];
          const Icon = VIEW_ICON[item.view] || FaMapMarkerAlt;
          const bookLink = real ? `/booking/${real._id}` : '/homestays';
          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              whileHover={{ y: -6, rotateX: 2 }}
              className="relative rounded-3xl overflow-hidden shadow-lg group"
              style={{ perspective: 1000 }}
            >
              <div className="relative h-64">
                <img
                  src={item.image}
                  alt={`${item.name} — ${item.viewLabel}`}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                <span className="absolute top-4 left-4 flex items-center gap-1.5 bg-white/90 text-blue-700 text-[11px] font-semibold px-2.5 py-1 rounded-full shadow">
                  <Icon /> {item.viewLabel}
                </span>

                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-white/70 text-xs flex items-center gap-1 mb-1">
                    <FaMapMarkerAlt /> {item.village}, {item.district}
                  </p>
                  <h3 className="text-white text-lg font-bold mb-2">{item.name}</h3>
                  <p className="text-white/80 text-xs leading-relaxed mb-4">{item.famous}</p>
                  <div className="flex gap-2">
                    <Link
                      to={bookLink}
                      className="bg-white text-ink-soft text-xs font-semibold px-4 py-2 rounded-full hover:bg-blue-50 transition"
                    >
                      Book Now
                    </Link>
                    <Link
                      to="/homestays"
                      className="text-white text-xs font-semibold px-4 py-2 rounded-full border border-white/40 hover:border-white transition"
                    >
                      Explore
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

export default HomestayShowcase;
