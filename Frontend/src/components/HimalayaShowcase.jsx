import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

// ---------------------------------------------------------------------
// TiltCard — the page's signature element. A mouse-tracked 3D tilt
// (perspective + rotateX/rotateY driven by cursor position) gives every
// story card real depth on hover, the way OnePlus's product showcases do,
// without needing WebGL/Three.js — just CSS 3D transforms, which is fast
// and reliable on every device including lower-end phones (tilt is
// disabled below `md` since there's no hover on touch anyway).
// ---------------------------------------------------------------------
const TiltCard = ({ children, className = '' }) => {
  const ref = useRef(null);
  const [style, setStyle] = useState({});

  const handleMouseMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setStyle({
      transform: `perspective(1000px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale3d(1.02,1.02,1.02)`,
    });
  };

  const handleMouseLeave = () => {
    setStyle({ transform: 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)' });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transition: 'transform 0.15s ease-out', transformStyle: 'preserve-3d', ...style }}
      className={className}
    >
      {children}
    </div>
  );
};

const revealProps = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6, ease: 'easeOut' },
};

// Real, specific growing/origin stories — this is what makes the section
// feel grounded rather than templated: altitude, soil, harvest method,
// specific villages, not generic "organic and fresh" copy.
export const PRODUCE_STORIES = [
  {
    id: 'rajma',
    eyebrow: 'Kedarnath Valley · 2,200m',
    name: 'Rajma',
    subtitle: 'Red kidney beans, grown where the air runs thin',
    story:
      'Planted in black volcanic soil after the first monsoon rains, Kedarnath Valley rajma spends four months on terraced slopes with no irrigation but the sky. Families hand-pick each pod in October, then sun-dry them on rooftops for a week before the beans are ready — a rhythm unchanged for generations.',
    facts: ['Hand-harvested', 'Rain-fed, no irrigation', 'Dried on rooftops'],
    image: 'https://images.unsplash.com/photo-1515543904279-0a239e9ba5d8?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'mandua',
    eyebrow: 'Hill terraces · 1,800m+',
    name: 'Mandua',
    subtitle: 'Finger millet that needs no coaxing',
    story:
      "Long before 'superfood' was a word, hill families grew mandua because it asks for almost nothing — no irrigation, no pesticide, no flat land. It thrives on steep, rocky terraces where rice never could. Naturally gluten-free and rich in calcium, it's ground fresh into flour on stone mills, the same way it has been for centuries.",
    facts: ['Naturally gluten-free', 'Stone-ground', 'Grows on steep terraces'],
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'ghee',
    eyebrow: 'High-altitude grazing · 2,000m+',
    name: 'Pahadi Ghee',
    subtitle: 'Churned by hand, the bilona way',
    story:
      "Desi hill cows graze freely on wild herbs and mountain grass — never stall-fed, never rushed. Their milk is set to curd overnight, then hand-churned in wooden bilona vessels the traditional way, a slow process that takes hours but keeps every nutrient the shortcut methods lose.",
    facts: ['A2 milk, grass-fed cows', 'Traditional bilona churning', 'No shortcuts, no additives'],
    image: 'https://images.unsplash.com/photo-1631206753348-db44968fd440?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'honey',
    eyebrow: 'Oak & rhododendron forests',
    name: 'Wild Honey',
    subtitle: 'Two harvests a year, one forest at a time',
    story:
      "Local beekeepers follow the bloom — oak forests in spring, wild rhododendron through summer — moving hives by hand along mountain trails no vehicle can reach. Each harvest tastes a little different depending on what was flowering that season, which is exactly the point.",
    facts: ['Multi-floral, seasonal', 'Harvested twice a year', 'Raw, unfiltered'],
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1200&q=80',
  },
];

export const HOMESTAY_STORIES = [
  {
    id: 'chopta',
    eyebrow: '2,680m · "Mini Switzerland of India"',
    name: 'Chopta',
    subtitle: 'Wake up level with the clouds',
    story:
      "Chopta is the last stop before the trail to Tungnath, the world's highest Shiva temple, and Chandrashila summit beyond it. Homestays here sit inside rhododendron forest, with mornings that open onto the snow line of the Chaukhamba and Nanda Devi ranges — no filter needed.",
    highlights: ['Gateway to Tungnath & Chandrashila trek', 'Rhododendron forest views', 'Sunrise over Chaukhamba range'],
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'ukhimath',
    eyebrow: 'Mandakini riverside',
    name: 'Ukhimath',
    subtitle: "Kedarnath's winter home",
    story:
      'When snow closes Kedarnath temple each winter, its deity is carried down to Ukhimath — a town of terraced apple orchards on the banks of the Mandakini. Stay here and you fall asleep to the river, and wake up to farmers already out in the orchards.',
    highlights: ['Winter seat of Kedarnath deity', 'Riverside on the Mandakini', 'Apple orchard walks'],
    image: 'https://images.unsplash.com/photo-1601701119533-fe36c5b0e2b8?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'dugalbitta',
    eyebrow: 'High alpine meadow',
    name: 'Dugalbitta',
    subtitle: 'The darkest skies you\'ll ever see',
    story:
      "A scattering of homestays in an open bugyal (alpine meadow) just below Chopta, far enough from any town that the Milky Way shows up without trying. Days are for meadow walks; nights are for lying back and actually seeing the stars people talk about.",
    highlights: ['Alpine meadow (bugyal) setting', 'Near-zero light pollution', 'Closest stays to the high trails'],
    image: 'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?auto=format&fit=crop&w=1200&q=80',
  },
];

const ProduceShowcase = () => (
  <section className="bg-[#0A0F0A] py-24 md:py-32 px-4 sm:px-6">
    <div className="max-w-6xl mx-auto">
      <motion.div {...revealProps} className="mb-16 md:mb-24">
        <p className="text-[#E8562C] text-xs font-bold uppercase tracking-[0.2em] mb-4">The Produce</p>
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#F7F3E8] leading-[1.05] tracking-tight max-w-3xl">
          Grown at altitude.<br />Harvested by hand.
        </h2>
      </motion.div>

      <div className="space-y-20 md:space-y-28">
        {PRODUCE_STORIES.map((item, i) => (
          <motion.div
            key={item.id}
            {...revealProps}
            className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center ${i % 2 === 1 ? 'md:[direction:rtl]' : ''}`}
          >
            <div style={{ direction: 'ltr' }}>
              <TiltCard className="rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-72 md:h-96 object-cover"
                  loading="lazy"
                />
              </TiltCard>
            </div>
            <div style={{ direction: 'ltr' }}>
              <p className="text-[#E8562C] text-xs font-bold uppercase tracking-[0.15em] mb-3">{item.eyebrow}</p>
              <h3 className="text-3xl md:text-4xl font-black text-[#F7F3E8] mb-2 tracking-tight">{item.name}</h3>
              <p className="text-[#8FA876] font-semibold text-sm mb-5">{item.subtitle}</p>
              <p className="text-[#B8B5AC] text-base leading-relaxed mb-6">{item.story}</p>
              <div className="flex flex-wrap gap-2">
                {item.facts.map((f) => (
                  <span key={f} className="text-xs font-semibold text-[#F7F3E8] bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const StaysShowcase = () => (
  <section className="bg-[#12160F] py-24 md:py-32 px-4 sm:px-6">
    <div className="max-w-6xl mx-auto">
      <motion.div {...revealProps} className="mb-16 md:mb-24">
        <p className="text-[#E8562C] text-xs font-bold uppercase tracking-[0.2em] mb-4">The Stays</p>
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#F7F3E8] leading-[1.05] tracking-tight max-w-3xl">
          Every homestay sits<br />somewhere for a reason.
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {HOMESTAY_STORIES.map((item) => (
          <motion.div key={item.id} {...revealProps}>
            <TiltCard className="rounded-2xl overflow-hidden bg-white/[0.03] border border-white/10 h-full flex flex-col shadow-2xl shadow-black/40">
              <img src={item.image} alt={item.name} className="w-full h-56 object-cover" loading="lazy" />
              <div className="p-6 flex flex-col flex-1">
                <p className="text-[#E8562C] text-[11px] font-bold uppercase tracking-[0.15em] mb-2">{item.eyebrow}</p>
                <h3 className="text-2xl font-black text-[#F7F3E8] mb-1 tracking-tight">{item.name}</h3>
                <p className="text-[#8FA876] font-semibold text-sm mb-4">{item.subtitle}</p>
                <p className="text-[#B8B5AC] text-sm leading-relaxed mb-5 flex-1">{item.story}</p>
                <ul className="space-y-1.5">
                  {item.highlights.map((h) => (
                    <li key={h} className="text-xs text-[#F7F3E8]/80 flex items-start gap-2">
                      <span className="text-[#E8562C] mt-1">—</span> {h}
                    </li>
                  ))}
                </ul>
              </div>
            </TiltCard>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const HimalayaShowcase = { ProduceShowcase, StaysShowcase, TiltCard, revealProps };
export default HimalayaShowcase;
