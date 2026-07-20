import React, { useState, useEffect } from 'react';
import { resolveImageUrl } from '../utils/media';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80';

/**
 * Auto-sliding image carousel. Pass an array of relative or absolute image
 * URLs — resolves them automatically via resolveImageUrl. Shows dot
 * indicators when there's more than one image, and pauses on hover.
 */
const ImageCarousel = ({ images = [], alt = '', className = '', intervalMs = 3000, onClick }) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const list = (images && images.length > 0 ? images : [null]).map((img) => resolveImageUrl(img, FALLBACK_IMG));

  useEffect(() => {
    if (list.length <= 1 || paused) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % list.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [list.length, paused, intervalMs]);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onClick={onClick}
    >
      {list.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`${alt} ${i + 1}`}
          onError={(e) => { e.target.src = FALLBACK_IMG; }}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === index ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}
      {/* Reserve layout height since children are absolutely positioned */}
      <img src={list[0]} alt="" className="w-full h-full object-cover invisible" aria-hidden="true" />

      {list.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {list.map((_, i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all ${i === index ? 'bg-white w-4' : 'bg-white/50'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;
