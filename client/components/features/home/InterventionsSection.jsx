"use client";
import React, { useRef, useState, useEffect, useCallback, memo } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';

// ─── Data ─────────────────────────────────────────────────────────────────────
const interventions = [
  {
    id: "lohardaga",
    location: "Lohardaga, Jharkhand",
    title: "The Rugs of Peshrar",
    description:
      "In the rugged terrains of Lohardaga, we've partnered with the Peshrar cluster to revive ancestral rug weaving. 200+ tribal families now blend raw artistic instinct with modern quality standards — creating pieces that carry centuries of story into modern homes.",
    image: "/images/rug_jharkhand.png",
    cardBg: "#EEDC5B",
    textColor: "#1a1200",
    accent: "#b89a00",
    cluster: "Peshrar Cluster",
    families: 200, craft: "Rug Weaving", year: "2019", tag: "Heritage",
  },
  {
    id: "bodhgaya",
    location: "Bodhgaya, Bihar",
    title: "Bamboo Mastery",
    description:
      "Beyond Bodhgaya's spiritual echo lies the Hahesadi Bamboo Cluster. We help craftsmen diversify — turning everyday bamboo into high-end sustainable décor that finds homes in conscious living rooms across the world.",
    image: "/images/bamboo_cluster.png",
    cardBg: "#1F3D22",
    textColor: "#e8f5e9",
    accent: "#6ee06e",
    cluster: "Hahesadi Cluster",
    families: 150, craft: "Bamboo Craft", year: "2020", tag: "Sustainable",
  },
  {
    id: "sitapur",
    location: "Sitapur, Uttar Pradesh",
    title: "Moonj Grass Revival",
    description:
      "Women artisans in Sitapur now lead self-help groups that weave moonj grass into sophisticated home accessories — sending a thousand-year-old tradition into living rooms worldwide and reclaiming their economic independence.",
    image: "/images/moonj_cluster.png",
    cardBg: "#8B2500",
    textColor: "#fff3ee",
    accent: "#f8b76b",
    cluster: "Sitapur Cluster",
    families: 180, craft: "Moonj Weaving", year: "2021", tag: "Women-led",
  },
  {
    id: "kutch",
    location: "Kutch, Gujarat",
    title: "Ajrakh Printing",
    description:
      "The timeless art of Ajrakh block printing finds new expression in Kutch. We work with master craftsmen on sustainable natural dyeing, bringing ancient geometric patterns into contemporary lifestyle products that travel globally.",
    image: "/images/folk_painting.png",
    cardBg: "#1E0B3A",
    textColor: "#ede7f6",
    accent: "#b39ddb",
    cluster: "Dhamadka Cluster",
    families: 120, craft: "Block Printing", year: "2022", tag: "Artisan",
  },
  {
    id: "sualkuchi",
    location: "Sualkuchi, Assam",
    title: "Golden Silk Heritage",
    description:
      "In Assam's silk village, we provide modern loom technology to weavers of Muga and Eri silk — ensuring golden threads that have shimmered for centuries keep shimmering for centuries more, connecting ancient looms to global markets.",
    image: "/images/khadi_banner.png",
    cardBg: "#3D2800",
    textColor: "#fff8e1",
    accent: "#ffd54f",
    cluster: "Sualkuchi Cluster",
    families: 90, craft: "Silk Weaving", year: "2023", tag: "Golden Thread",
  },
];

const TOTAL = interventions.length;

const stats = [
  { value: 740, suffix: "+", label: "Artisan Families" },
  { value: 5, suffix: "", label: "Clusters Partnered" },
  { value: 14, suffix: "+", label: "States Reached" },
  { value: 4, suffix: "x", label: "Income Growth" },
];

// ─── Counter hook ──────────────────────────────────────────────────────────────
function useCountUp(target, duration = 1400, active = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let v = 0;
    const step = target / (duration / 16);
    const id = setInterval(() => {
      v = Math.min(v + step, target);
      setCount(Math.floor(v));
      if (v >= target) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [target, duration, active]);
  return count;
}

// ─── Stat cell ─────────────────────────────────────────────────────────────────
const StatCell = memo(({ value, suffix, label, active, accent }) => {
  const count = useCountUp(value, 1400, active);
  return (
    <div className="flex flex-col items-center gap-2 py-8 px-4 group cursor-default relative">
      <span
        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0 group-hover:w-2/3 transition-all duration-500 rounded-full"
        style={{ background: accent }}
      />
      <span className="font-playfair text-3xl md:text-4xl font-bold tabular-nums" style={{ color: accent }}>
        {count.toLocaleString('en-IN')}{suffix}
      </span>
      <span className="font-inter text-[10px] uppercase tracking-[0.24em] text-white/40">{label}</span>
    </div>
  );
});
StatCell.displayName = 'StatCell';

// ─── Card face (pure presentational — transform is applied by the parent via ref) ──
const CardFace = memo(({ item, idx }) => (
  <div className="relative w-full h-full overflow-hidden rounded-2xl shadow-2xl">
    <div className="absolute inset-y-0 left-0" style={{ width: '54%' }}>
      <Image
        src={item.image}
        alt={item.title}
        fill
        sizes="(max-width: 768px) 100vw, 54vw"
        className="object-cover object-center"
        priority={idx < 2}
        draggable={false}
      />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to right, transparent 45%, rgba(0,0,0,0.15) 70%, rgba(0,0,0,0.35) 100%)' }}
      />
      <div className="absolute inset-0 md:hidden" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
    </div>

    <div
      className="absolute inset-y-0 right-0 flex flex-col justify-center overflow-hidden"
      style={{ left: '38%', background: item.cardBg, padding: 'clamp(22px, 3vw, 44px) clamp(22px, 2.8vw, 42px)' }}
    >
      <div className="absolute top-6 right-6 w-3 h-3 rounded-full opacity-80" style={{ background: item.accent, boxShadow: `0 0 12px ${item.accent}` }} />
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: `radial-gradient(${item.textColor} 1px, transparent 1px)`, backgroundSize: '20px 20px' }}
      />

      <span
        className="relative inline-flex items-center gap-2 font-inter text-[9px] font-bold uppercase tracking-[0.22em] px-3 py-1.5 mb-4 w-fit border"
        style={{ color: item.textColor, borderColor: `${item.textColor}38`, background: `${item.textColor}12` }}
      >
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: item.accent }} />
        {item.tag} · {item.cluster}
      </span>

      <p className="relative font-inter text-[10px] font-semibold uppercase tracking-[0.2em] mb-3 flex items-center gap-2" style={{ color: item.accent }}>
        <svg width="9" height="12" viewBox="0 0 9 12" fill="none" aria-hidden>
          <path d="M4.5 0C2.01 0 0 2.01 0 4.5c0 3.375 4.5 7.5 4.5 7.5S9 7.875 9 4.5C9 2.01 6.99 0 4.5 0zm0 6A1.5 1.5 0 1 1 4.5 3 1.5 1.5 0 0 1 4.5 6z" fill="currentColor" />
        </svg>
        {item.location}
      </p>

      <h3 className="relative font-playfair font-bold leading-[1.12] mb-3" style={{ color: item.textColor, fontSize: 'clamp(1.5rem, 2.6vw, 2.5rem)' }}>
        {item.title}
      </h3>

      <div className="relative w-9 h-[2px] mb-4 rounded-full" style={{ background: item.accent }} />

      <p className="relative font-inter text-[12.5px] leading-[1.8] mb-6" style={{ color: item.textColor, opacity: 0.72, maxWidth: '40ch' }}>
        {item.description}
      </p>

      <div className="relative flex flex-wrap gap-2 mb-7">
        {[`${item.families}+ families`, item.craft, `Est. ${item.year}`].map((m) => (
          <span
            key={m}
            className="font-inter text-[9px] font-semibold uppercase tracking-[0.12em] px-2.5 py-1.5"
            style={{ color: item.textColor, opacity: 0.55, background: `${item.textColor}0e`, border: `1px solid ${item.textColor}20` }}
          >
            {m}
          </span>
        ))}
      </div>

      <Link
        href={`/interventions/${item.id}`}
        className="relative group inline-flex items-center gap-3 font-inter text-[11px] font-bold uppercase tracking-[0.2em] px-5 py-[12px] w-fit transition-all duration-200"
        style={{ color: item.textColor, border: `1.5px solid ${item.textColor}55` }}
        onMouseEnter={(e) => { e.currentTarget.style.background = `${item.textColor}18`; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        Explore Story
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden className="transition-transform duration-200 group-hover:translate-x-1.5">
          <path d="M2 6.5h9M7 3l3.5 3.5L7 10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>

      <span className="absolute bottom-3 right-5 font-playfair font-bold leading-none pointer-events-none select-none" style={{ color: item.textColor, opacity: 0.05, fontSize: '5.5rem' }}>
        {String(idx + 1).padStart(2, '0')}
      </span>
    </div>
  </div>
));
CardFace.displayName = 'CardFace';

// ─── Depth interpolation ────────────────────────────────────────────────────────
// `pos` = idx - continuousProgress. 0 = front & center. 1,2 = peeking behind.
// Negative pos = this card has already been "dealt" past and is sliding away.
const KEYFRAMES = [
  { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }, // pos 0 — front
  { x: 34, y: -26, rotate: 5, scale: 0.955, opacity: 1 }, // pos 1
  { x: -26, y: -46, rotate: -6.5, scale: 0.915, opacity: 1 }, // pos 2
  { x: 14, y: -62, rotate: 3, scale: 0.88, opacity: 0 }, // pos 3 — waiting, hidden
];
const GONE = { x: 0, y: 130, rotate: -16, scale: 0.86, opacity: 0 }; // dealt away

function lerp(a, b, t) {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    rotate: a.rotate + (b.rotate - a.rotate) * t,
    scale: a.scale + (b.scale - a.scale) * t,
    opacity: a.opacity + (b.opacity - a.opacity) * t,
  };
}

function depthAt(pos) {
  if (pos <= -1) return GONE;
  if (pos < 0) return lerp(KEYFRAMES[0], GONE, -pos);
  if (pos >= KEYFRAMES.length - 1) return KEYFRAMES[KEYFRAMES.length - 1];
  const lower = Math.floor(pos);
  const t = pos - lower;
  return lerp(KEYFRAMES[lower], KEYFRAMES[lower + 1], t);
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function InterventionsSection() {
  const [activeIdx, setActiveIdx] = useState(0);

  const wrapperRef = useRef(null);
  const cardRefs = useRef([]);
  const dotRefs = useRef([]);
  const counterRef = useRef(null);
  const hintRef = useRef(null);
  const statsRef = useRef(null);
  const rafRef = useRef(null);
  const lastIdxRef = useRef(0);

  const statsInView = useInView(statsRef, { once: true, margin: '-80px' });
  const activeItem = interventions[activeIdx];

  // ── Core: scroll position → deck transforms (direct DOM writes, GPU-only) ──
  const handleScroll = useCallback(() => {
    if (rafRef.current) return;

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;

      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const rect = wrapper.getBoundingClientRect();
      const scrollH = wrapper.offsetHeight - window.innerHeight;
      if (scrollH <= 0) return;

      const raw = -rect.top / scrollH;
      const progress = Math.max(0, Math.min(1, raw));

      // continuous index across the whole deck, 0..TOTAL-1
      const continuous = Math.min(TOTAL - 1, progress * TOTAL);

      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const pos = i - continuous;
        const d = depthAt(pos);
        card.style.transform = `translate(${d.x}px, ${d.y}px) rotate(${d.rotate}deg) scale(${d.scale})`;
        card.style.opacity = d.opacity;
        card.style.zIndex = 100 - Math.round(pos * 10);
        card.style.pointerEvents = pos > -0.5 && pos < 0.5 ? 'auto' : pos >= 0.5 && pos < 2.5 ? 'auto' : 'none';
      });

      const newIdx = Math.min(TOTAL - 1, Math.floor(progress * TOTAL));

      dotRefs.current.forEach((dot, i) => {
        if (!dot) return;
        const iv = interventions[i];
        const on = i === newIdx;
        dot.style.background = on ? iv.accent : 'rgba(255,255,255,0.22)';
        dot.style.width = on ? '26px' : '7px';
        dot.style.boxShadow = on ? `0 0 10px ${iv.accent}99` : 'none';
      });

      if (counterRef.current) {
        counterRef.current.textContent = `${String(newIdx + 1).padStart(2, '0')} / ${String(TOTAL).padStart(2, '0')}`;
        counterRef.current.style.color = interventions[newIdx].accent;
      }

      if (hintRef.current) {
        hintRef.current.style.opacity = progress > 0.04 ? '0' : '1';
      }

      if (newIdx !== lastIdxRef.current) {
        lastIdxRef.current = newIdx;
        setActiveIdx(newIdx);
      }
    });
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleScroll]);

  // ── Programmatic scroll to a given card (dots / arrows / clicking a peek) ──
  const scrollToSlide = useCallback((idx) => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const slotH = (wrapper.offsetHeight - window.innerHeight) / TOTAL;
    const target = wrapper.offsetTop + idx * slotH + 1;
    window.scrollTo({ top: target, behavior: 'smooth' });
  }, []);

  // ── Keyboard navigation while the section is on screen ──────────────────────
  useEffect(() => {
    const handler = (e) => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      if (rect.top > window.innerHeight || rect.bottom < 0) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); scrollToSlide(Math.min(lastIdxRef.current + 1, TOTAL - 1)); }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); scrollToSlide(Math.max(lastIdxRef.current - 1, 0)); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [scrollToSlide]);

  return (
    <>
      {/* Section title — sits in normal flow, scrolls into view before the deck pins */}
      <div style={{ background: '#0a0a0a' }} className="pt-20 pb-12 md:pt-28 md:pb-16 px-6 text-center">
        <p className="font-inter text-[10px] font-bold tracking-[0.34em] uppercase text-white/50 flex items-center justify-center gap-2 mb-3">
          <span className="h-px w-5 bg-white/20" /> Ground Realities <span className="h-px w-5 bg-white/20" />
        </p>
        <h2 className="font-playfair text-4xl md:text-6xl font-bold text-white">Our Clusters</h2>
      </div>

      {/* Scroll track: TOTAL × 100vh — each 100vh "deals" the next card to the front */}
      <div ref={wrapperRef} style={{ height: `${TOTAL * 100}vh` }} aria-label="Our Clusters — scroll to deal through each story">
        <div className="sticky top-0 overflow-hidden" style={{ height: '100vh', background: '#0a0a0a' }}>

          {/* Counter — top right */}
          <span
            ref={counterRef}
            className="absolute top-7 right-7 z-50 pointer-events-none hidden md:block font-inter text-[11px] tracking-[0.22em] tabular-nums"
            style={{ color: activeItem.accent }}
          >
            01 / 05
          </span>

          {/* The deck */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative" style={{ width: 'min(1280px, 92vw)', height: 'clamp(460px, 68vh, 660px)' }}>
              {interventions.map((item, i) => (
                <div
                  key={item.id}
                  ref={(el) => { cardRefs.current[i] = el; }}
                  className="absolute inset-0"
                  style={{
                    transition: 'transform 0.05s linear',
                    willChange: 'transform',
                    transform: i === 0 ? 'translate(0px,0px) rotate(0deg) scale(1)' : 'translate(0px,130px) rotate(-16deg) scale(0.86)',
                    opacity: i === 0 ? 1 : 0,
                    cursor: i > 0 ? 'pointer' : 'default',
                  }}
                  onClick={() => { if (i !== lastIdxRef.current) scrollToSlide(i); }}
                >
                  <CardFace item={item} idx={i} />
                </div>
              ))}
            </div>
          </div>

          {/* Control bar — prev arrow / dots / next arrow. Always visible, clearly active. */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 md:gap-5">
            <button
              onClick={() => scrollToSlide(Math.max(lastIdxRef.current - 1, 0))}
              aria-label="Previous story"
              className="w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center text-white transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.28)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            >
              <svg width="14" height="14" viewBox="0 0 13 13" fill="none" aria-hidden>
                <path d="M11 6.5H2M6 3 2.5 6.5 6 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className="flex items-center gap-2.5 px-1">
              {interventions.map((iv, i) => (
                <button
                  key={iv.id}
                  ref={(el) => { dotRefs.current[i] = el; }}
                  onClick={() => scrollToSlide(i)}
                  aria-label={`Jump to ${iv.cluster}`}
                  title={iv.cluster}
                  className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 transition-all duration-300"
                  style={{
                    width: i === 0 ? 28 : 9,
                    height: 9,
                    background: i === 0 ? iv.accent : 'rgba(255,255,255,0.3)',
                    boxShadow: i === 0 ? `0 0 12px ${iv.accent}bb` : 'none',
                  }}
                />
              ))}
            </div>

            <button
              onClick={() => scrollToSlide(Math.min(lastIdxRef.current + 1, TOTAL - 1))}
              aria-label="Next story"
              className="w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center text-white transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.28)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            >
              <svg width="14" height="14" viewBox="0 0 13 13" fill="none" aria-hidden>
                <path d="M2 6.5h9M7 3l3.5 3.5L7 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Scroll hint */}
          <div ref={hintRef} className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 hidden md:flex flex-col items-center gap-2 pointer-events-none" style={{ opacity: 1, transition: 'opacity 0.5s ease' }}>
            <span className="font-inter text-[9px] uppercase tracking-[0.3em] text-white/40">Scroll to deal the next card</span>
            <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
                <path d="M6.5 2v9M3 9l3.5 3 3.5-3" stroke="rgba(255,255,255,0.35)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>
          </div>

          {/* Progress bar — bottom edge */}
          <div className="absolute bottom-0 left-0 right-0 z-50 h-[2px] hidden md:block" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-full"
              style={{ width: `${((activeIdx + 1) / TOTAL) * 100}%`, background: activeItem.accent, transition: 'width 0.4s cubic-bezier(0.22,1,0.36,1)' }}
            />
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div ref={statsRef} style={{ background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-[1360px] mx-auto px-5 md:px-10 py-2">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/[0.06]" style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)' }}>
            {stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={statsInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.08, duration: 0.45 }}>
                <StatCell {...s} active={statsInView} accent={activeItem.accent} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}