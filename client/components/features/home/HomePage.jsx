"use client";
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import axios from 'axios';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ROUTES } from '@/lib/routes';
import { useAuth } from '@/context/AuthContext';
import { formatImageUrl } from '@/lib/utils';
import ProductSection from './ProductSection';
import SquareProductSection from './SquareProductSection';
import ValuesSlider from './ValuesSlider';
import HeartOfArtisans from './HeartOfArtisans';
import InterventionsSection from './InterventionsSection';

// ─── Category navigation data ───────────────────────────────────────────────
const CATEGORIES = [
  {
    label: "Bamboo Crafts",
    slug: "bamboo",
    image: "/images/categories/bamboo.png",
    accent: "#4ade80",
  },
  {
    label: "Rugs",
    slug: "rugs",
    image: "/images/categories/rugs.jpg",
    accent: "#fbbf24",
  },
  {
    label: "Moonj & Sikki",
    slug: "moonj-sikki",
    image: "/images/categories/moonj.jpg",
    accent: "#fb923c",
  },
  {
    label: "Wood Products",
    slug: "wood",
    image: "/images/categories/wood.jpg",
    accent: "#d97706",
  },
  {
    label: "Apparels",
    slug: "apparel",
    image: "/images/categories/apparels.jpg",
    accent: "#a78bfa",
  },
  {
    label: "Paintings",
    slug: "painting",
    image: "/images/categories/painting.jpg",
    accent: "#f472b6",
  },
];

// ─── Counter animation hook ───────────────────────────────────────────────────
function useCountUp(target, duration = 1500) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);
  return [count, ref];
}

// ─── Individual stat ─────────────────────────────────────────────────────────
function Stat({ value, suffix, label }) {
  const [count, ref] = useCountUp(value);
  return (
    <div ref={ref} className="flex flex-col items-center">
      <span className="text-4xl md:text-5xl font-extrabold text-white">
        {count.toLocaleString('en-IN')}{suffix}
      </span>
      <span className="text-sm text-white/60 mt-1 uppercase tracking-widest">{label}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const HomePage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/products')
      .then(res => {
        if (res.data?.success) setProducts(res.data.data);
      })
      .catch(err => console.error("Failed to fetch products:", err))
      .finally(() => setLoading(false));
  }, []);

  const bestSellers = [...products].reverse().slice(0, 10);
  const justArrived = products.slice(-10).reverse();

  return (
    <div className="w-full flex flex-col overflow-x-clip bg-white">

      {/* ── Welcome ribbon ── */}
      {user && (
        <div className="bg-[#1a3a1a] py-2 px-6 text-center">
          <p className="text-white text-sm font-medium">
            Welcome back, <span className="font-bold text-amber-400">{user.name}</span>!&nbsp;
            <Link href={ROUTES.PROFILE} className="underline hover:text-amber-300 transition-colors">
              View your orders →
            </Link>
          </p>
        </div>
      )}

      {/* ════════════════════════════════════════
          HERO
      ════════════════════════════════════════ */}
      <section
        className="relative w-full overflow-hidden flex flex-col md:flex-row items-center"
        style={{ minHeight: "clamp(540px, 80vh, 720px)", background: "linear-gradient(135deg, #0d2b0d 0%, #1a5b3a 55%, #2d7a4f 100%)" }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-[-80px] left-[-80px] w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute bottom-[-60px] right-[15%] w-72 h-72 rounded-full bg-amber-400/10 pointer-events-none" />
        <div className="absolute top-[20%] right-[-30px] w-56 h-56 rounded-full bg-emerald-400/10 pointer-events-none" />

        {/* LEFT: Hero copy */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10 flex-1 flex flex-col items-center text-center justify-center px-8 md:px-16 py-20 md:py-0"
        >
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center justify-center gap-2 bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-semibold uppercase tracking-widest rounded-full px-4 py-1.5 mb-8 w-fit"
          >
            🌿 Authentic Indian Handcrafts
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-3xl sm:text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6"
          >
            Crafted by <span className="text-amber-400">Artisans.</span><br />
            Loved by <span className="text-emerald-300">Millions.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-white/70 text-sm sm:text-base md:text-xl font-light mb-8 sm:mb-12 max-w-xl px-2 sm:px-0"
          >
            Discover handmade treasures from rural India. Every product supports a real artisan family and preserves a centuries-old story.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link
              href="/collections/best-sellers"
              className="bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold px-10 py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-amber-400/30 hover:scale-105 text-sm uppercase tracking-widest"
            >
              Shop Collections
            </Link>
            <Link
              href="/bulk-orders"
              className="border border-white/30 text-white hover:bg-white/10 font-medium px-10 py-4 rounded-full transition-all duration-300 text-sm uppercase tracking-widest"
            >
              Customize
            </Link>
          </motion.div>
        </motion.div>

        {/* RIGHT: Category cards */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10 flex-1 flex items-center justify-center gap-4 px-4 md:px-[20px] py-10 md:py-0 flex-wrap lg:flex-nowrap"
        >
          {CATEGORIES.slice(0, 3).map((cat, idx) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + idx * 0.15 }}
            >
              <Link
                href={`/collections/${cat.slug}`}
                className="group relative flex flex-col items-center justify-end rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-105 shadow-2xl block border border-white/10"
                style={{ width: "clamp(120px, 25vw, 160px)", height: "clamp(200px, 35vw, 260px)", flexShrink: 0 }}
              >
                {/* Real category image */}
                <Image
                  src={cat.image}
                  alt={cat.label}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                {/* Accent glow on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                  style={{ background: cat.accent }}
                />
                <div className="relative z-10 w-full px-3 py-5 text-center">
                  <span className="text-white font-bold text-[10px] uppercase tracking-widest block drop-shadow-md">{cat.label}</span>
                  <span
                    className="text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 block mt-1 uppercase tracking-tighter"
                    style={{ color: cat.accent }}
                  >Explore →</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>



      {/* ════════════════════════════════════════
          SHOP BY CATEGORY — 3x2 GRID
      ════════════════════════════════════════ */}
      <section className="w-full max-w-[1600px] mx-auto px-4 md:px-[20px] py-12">
        <div className="text-center mb-10">
          <Link href="/collections" className="inline-block group">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 transition-colors group-hover:text-amber-700 uppercase font-serif">
              Shop by Category
            </h2>
            <div className="h-1 w-0 group-hover:w-full bg-amber-700 transition-all duration-500 mx-auto mt-2" />
          </Link>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[10px]">

          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/collections/${cat.slug}`}
              className="group relative flex flex-col justify-end rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 aspect-square"
            >
              {/* Real category image */}
              <Image
                src={cat.image}
                alt={cat.label}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent transition-all duration-500" />

              {/* Hover colour tint */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-15 transition-opacity duration-500"
                style={{ background: cat.accent }}
              />

              {/* Label bar */}
              <div className="relative z-10 text-center py-6 px-4">
                <span className="block text-sm md:text-base font-extrabold uppercase tracking-[0.3em] text-white drop-shadow-lg">
                  {cat.label}
                </span>
                <span
                  className="block text-xs font-semibold uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0"
                  style={{ color: cat.accent }}
                >
                  Explore Collection →
                </span>
              </div>
            </Link>
          ))}

        </div>
      </section>

      <section className="w-full bg-[#f5f0e8]">
        <div className="max-w-[1400px] mx-auto px-4 md:px-[20px] pt-20 pb-10 flex flex-col">

          {/* Heading */}
          <div className="text-center mb-16">
            <p className="text-2xl md:text-3xl tracking-[0.4em] text-[#b03a48] uppercase font-serif font-bold">
              What We Do
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 items-stretch">

            {[
              {
                title: "Women Empowerment",
                img: "/images/women_icon.png"
              },
              {
                title: "Sustainable",
                img: "/images/sustainable_icon.png"
              },
              {
                title: "Handloom Heritage",
                img: "/images/loom_icon.png"
              }
            ].map((item, idx) => (

              <div
                key={idx}
                className="
            bg-[#eae5db]
            border border-[#d1ccc0]
            flex flex-col
            items-center
            justify-between
            text-center
            min-h-[380px] sm:min-h-[460px] md:min-h-[520px]
            px-6 sm:px-8 py-8 sm:py-12
            group
            transition-all duration-500
            hover:shadow-2xl
            hover:-translate-y-2
          "
              >

                {/* Image */}
                <div className="relative w-full h-64 mb-6">
                  <Image
                    src={item.img}
                    alt={item.title}
                    fill
                    className="object-contain transition duration-500 group-hover:scale-110"
                  />
                </div>

                {/* Title */}
                <h3 className="text-3xl md:text-4xl font-serif text-[#b03a48] tracking-wide">
                  {item.title}
                </h3>

              </div>

            ))}

          </div>
        </div>
      </section>

      {/*════════════════════════════════
      BRAND STORY SLIDER
      ════════════════════════════════════════ */}
      {/* 
      <section className="w-full py-8 bg-white shadow-inner">
        <ValuesSlider />
      </section>
      */}

      {/* ════════════════════════════════════════
          BEST SELLERS — SQUARE BOXES
      ════════════════════════════════════════ */}
      {loading ? (
        <div className="w-full h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1a5b3a]"></div>
        </div>
      ) : (
        bestSellers.length > 0 && (
          <SquareProductSection
            products={bestSellers}
            title="Best Sellers"
            slug="best-sellers"
            subtitle="Most Loved Pieces"
          />
        )
      )}

      {/* ════════════════════════════════════════
          GIFTS BANNER
      ════════════════════════════════════════ */}
      <section
        className="relative w-full overflow-hidden flex items-center justify-center py-12"
        style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 80%, #533483 100%)" }}
      >
        <div className="absolute w-96 h-96 rounded-full bg-purple-600/20 blur-3xl top-[-100px] left-[-100px] pointer-events-none" />
        <div className="absolute w-80 h-80 rounded-full bg-amber-400/10 blur-3xl bottom-[-60px] right-[5%] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center px-6">
          <span className="text-amber-400 text-xs font-semibold uppercase tracking-[0.4em] mb-4">Curated for life's milestones</span>
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-serif text-white font-light mb-6 leading-tight uppercase">
            Gifts for <span className="text-amber-400 italic">Human Connection</span>
          </h2>
          <p className="text-white/60 text-base md:text-lg mb-12 max-w-lg font-light leading-relaxed">
            Handcrafted gifts that carry human warmth — from rural artisan hands to your home.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {["🎁 Weddings", "🎂 Birthdays", "🏡 Home Decor", "🪔 Festivals"].map(tag => (
              <span
                key={tag}
                className="px-6 py-2 rounded-full text-xs font-bold border border-white/20 bg-white/5 text-white hover:bg-amber-400 hover:border-amber-400 hover:text-gray-900 transition-all duration-300 cursor-default"
              >
                {tag}
              </span>
            ))}
          </div>
          <Link
            href="/archive"
            className="px-12 py-4 bg-white text-gray-900 text-sm font-bold uppercase tracking-widest hover:bg-amber-400 transition-all duration-300 shadow-xl hover:scale-105 rounded-full"
          >
            Shop Curated Gifts
          </Link>
        </div>
      </section>




      {/* ════════════════════════════════════════
          JUST ARRIVED — SQUARE BOXES
      ════════════════════════════════════════ */}
      {!loading && justArrived.length > 0 && (
        <SquareProductSection
          products={justArrived}
          title="New Arrivals"
          slug="just-arrival"
          subtitle="The Latest Creations"
        />
      )}

      {/* ════════════════════════════════════════
          REGIONAL INTERVENTIONS — STICKY STORIES
      ════════════════════════════════════════ */}
      <InterventionsSection />

      {/* ════════════════════════════════════════
          HEART OF ARTISANS
      ════════════════════════════════════════ */}
      <HeartOfArtisans />

    </div>
  );
};

export default HomePage;