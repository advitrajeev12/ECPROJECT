"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion";
import { Heart, ShieldCheck, Leaf, Users, Globe, Recycle, ChevronRight, ArrowDown } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// ── Animated counter for the impact strip ─────────────────────
function Counter({ to, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(eased * to));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, to]);

  return (
    <span ref={ref}>
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}

// ── Hand-drawn weave divider — the page's signature element ───
function WeaveDivider({ className = "" }) {
  return (
    <svg
      viewBox="0 0 400 24"
      className={className}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0 12 Q 25 0, 50 12 T 100 12 T 150 12 T 200 12 T 250 12 T 300 12 T 350 12 T 400 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

const journey = [
  {
    year: "2018",
    title: "A village, a vision",
    text: "Bal Jyoti began as a grassroots initiative in rural Bihar, after we watched centuries-old bamboo weaving and sikki grass artistry fade as younger hands left for the cities."
  },
  {
    year: "2020",
    title: "Building the cooperative",
    text: "We formalized partnerships with the first artisan collectives, replacing middlemen with direct, fair-wage relationships and consistent training."
  },
  {
    year: "2023",
    title: "Crossing borders",
    text: "Bal Jyoti pieces began reaching conscious homes abroad, carrying Bihar's craft traditions onto a genuinely global stage."
  },
  {
    year: "Today",
    title: "500 artisans, 15 villages",
    text: "Every product still carries the thumbprint of the person who made it — paid fairly, trained well, and proud of the work."
  }
];

export default function AboutPage() {
  const [showLetter, setShowLetter] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroImgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const heroTextY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="bg-[#FBF8F2] min-h-screen">
      {/* ── Hero Section ────────────────────────────────────────── */}
      <section ref={heroRef} className="relative h-[85vh] w-full overflow-hidden flex items-center justify-center">
        <motion.div style={{ scale: heroImgScale }} className="absolute inset-0">
          <Image
            src="/images/about_heros.png"
            alt="Artisans at work"
            fill
            className="object-cover brightness-[0.45]"
            priority
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1108]/70 via-transparent to-[#1A1108]/20" />

        <motion.div style={{ y: heroTextY, opacity: heroOpacity }} className="relative z-10 text-center px-4 max-w-4xl">
          <motion.span
            initial={{ opacity: 0, letterSpacing: "0.5em" }}
            animate={{ opacity: 1, letterSpacing: "0.3em" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="block text-amber-300/90 text-xs font-semibold uppercase mb-6"
          >
            Bal Jyoti Design — Est. 2018, Bihar
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 }}
            className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 tracking-tight"
          >
            A Legacy of <span className="text-amber-400 italic">Hands</span>.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-lg md:text-xl text-white/85 font-light max-w-2xl mx-auto leading-relaxed"
          >
            Born to bridge the gap between forgotten rural artisans and the modern global home —
            one woven thread at a time.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/70"
        >
          <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.6 }}>
            <ArrowDown size={16} />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Impact strip ─────────────────────────────────────────── */}
      <section className="bg-[#1F2D22] py-10 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {[
            { to: 500, suffix: "+", label: "Artisans partnered" },
            { to: 15, suffix: "", label: "Villages reached" },
            { to: 70, suffix: "%", label: "Value paid direct" },
            { to: 20, suffix: "+", label: "Countries shipped to" }
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-3xl md:text-4xl font-serif font-bold text-amber-300">
                <Counter to={s.to} suffix={s.suffix} />
              </span>
              <span className="text-[11px] uppercase tracking-wider text-white/60">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Our Journey ──────────────────────────────────────────── */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-20">
          <motion.div
            variants={fadeIn}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="space-y-6"
          >
            <span className="text-amber-600 font-bold uppercase tracking-[0.2em] text-xs">Our Journey</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 leading-tight">
              Started in a small village, inspired by a <span className="text-emerald-700 italic">billion stories.</span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Founded in 2018, Bal Jyoti Design began as a grassroots initiative in rural Bihar.
              We noticed that centuries-old techniques of bamboo weaving and sikki grass art
              were fading into obscurity as younger generations migrated to cities.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              Today, we partner with over 500 artisans across 15 villages, ensuring their
              skills are not only preserved but celebrated on a global stage. Every product
              carries the thumbprint of an artisan who was paid fairly and treated with dignity.
            </p>
            <WeaveDivider className="w-40 h-5 text-amber-500" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl"
          >
            <Image
              src="/images/small_village.png"
              alt="Hands of an artisan"
              fill
              className="object-cover"
            />
          </motion.div>
        </div>

        {/* Timeline */}
        <div className="relative pl-6 md:pl-0">
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-amber-200 -translate-x-1/2" />
          <div className="space-y-12 md:space-y-0">
            {journey.map((j, i) => (
              <motion.div
                key={j.year}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6 }}
                className={`md:flex md:items-center md:gap-10 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  } relative md:py-8`}
              >
                <div className="md:w-1/2 md:px-10">
                  <div className={`border-l-2 md:border-l-0 border-amber-300 pl-4 md:pl-0 ${i % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                    <span className="text-amber-600 font-serif font-bold text-2xl">{j.year}</span>
                    <h3 className="text-xl font-bold text-gray-900 mt-1 mb-2">{j.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{j.text}</p>
                  </div>
                </div>
                <div className="hidden md:flex md:w-0 justify-center">
                  <div className="w-3 h-3 rounded-full bg-amber-500 ring-4 ring-amber-100 absolute left-1/2 -translate-x-1/2" />
                </div>
                <div className="md:w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values Grid ──────────────────────────────────────────── */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-amber-600 font-bold uppercase tracking-[0.2em] text-xs">What we stand for</span>
            <h2 className="text-4xl font-serif font-bold text-gray-900 mt-3 mb-4">Our Core Philosophy</h2>
            <WeaveDivider className="w-24 h-4 text-amber-500 mx-auto" />
          </div>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                Icon: Users,
                title: "Artisan Empowerment",
                desc: "We eliminate middlemen, ensuring 70% of the value reaches the artisan directly."
              },
              {
                Icon: Leaf,
                title: "Radical Sustainability",
                desc: "We use 100% biodegradable materials like Moonj, Bamboo, and natural dyes."
              },
              {
                Icon: Heart,
                title: "Heritage Preservation",
                desc: "Saving rare craft forms from extinction through training and mentorship."
              },
              {
                Icon: Globe,
                title: "Global Reach",
                desc: "Taking indigenous Indian art to conscious homes in over 20 countries."
              },
              {
                Icon: ShieldCheck,
                title: "Authenticity Guaranteed",
                desc: "Every item is GI-tagged and ethically sourced from registered cooperatives."
              },
              {
                Icon: Recycle,
                title: "Zero Waste Mission",
                desc: "Our production cycles and packaging are entirely plastic-free."
              },
            ].map((value, i) => (
              <motion.div
                key={i}
                variants={fadeIn}
                whileHover={{ y: -6 }}
                className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-amber-200 transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-6 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                  <value.Icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-500 leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Impact Banner ────────────────────────────────────────── */}
      <section className="relative py-28 overflow-hidden bg-[#1F2D22]">
        {/* Subtle decorative circles for a premium abstract design */}
        <div className="absolute top-[-10%] left-[-10%] w-[30%] aspect-square rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[35%] aspect-square rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white flex flex-col items-center">
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-10 leading-tight italic tracking-wide max-w-3xl">
            "When you buy a product, you're not just decorating a home; you're sustaining a family and a thousand-year-old dream."
          </h2>

          <motion.div
            layout
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/5 border border-white/10 backdrop-blur-md p-8 md:p-10 rounded-3xl max-w-xl shadow-2xl flex flex-col items-center gap-4 transition-all duration-300 hover:border-amber-400/30"
          >
            <div className="flex flex-col items-center">
              <span className="text-amber-400 text-xs font-bold uppercase tracking-[0.2em] mb-3">Our Founder</span>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-20 h-20 rounded-full bg-white/10 border-2 border-amber-400/40 p-1 mb-4 flex items-center justify-center overflow-hidden shadow-lg"
              >
                <div className="relative w-full h-full rounded-full overflow-hidden bg-emerald-900 flex items-center justify-center">
                  <Image src="/images/logo.png" alt="Founder" width={48} height={48} className="object-contain" />
                </div>
              </motion.div>
              <span className="text-2xl font-bold uppercase tracking-widest text-white">Rupak Kumar</span>
              <span className="text-white/60 text-xs tracking-wider mt-1">Founder & Managing Director</span>
            </div>

            <AnimatePresence mode="wait">
              {!showLetter ? (
                <motion.button
                  key="read-btn"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowLetter(true)}
                  className="mt-4 px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-gray-900 text-xs font-bold uppercase tracking-wider rounded-full shadow-lg transition-all duration-300 flex items-center gap-2"
                >
                  Read Founder's Letter <ChevronRight className="w-3.5 h-3.5" />
                </motion.button>
              ) : (
                <motion.div
                  key="letter-body"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden flex flex-col items-center"
                >
                  <p className="text-white/80 text-sm font-light leading-relaxed text-center mt-4 max-w-md italic border-t border-white/10 pt-6">
                    "Every weave in Bal Jyoti carries a story, a family's heartbeat. In 2018, I met rural artisans whose master crafts were dying because they lacked access to a global platform. We created Bal Jyoti to empower their hands, secure their future, and preserve India's natural handloom heritage. Thank you for making their dream a part of your home."
                  </p>
                  <button
                    onClick={() => setShowLetter(false)}
                    className="mt-6 text-amber-400 hover:text-amber-300 text-xs font-bold uppercase tracking-widest underline decoration-dotted transition-colors"
                  >
                    Close Letter
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* ── Call to Action ───────────────────────────────────────── */}
      <section className="py-24 text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center"
        >
          <WeaveDivider className="w-24 h-4 text-amber-400 mb-6" />
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 mb-8 tracking-tight">
            Be a Part of the Story
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={ROUTES.COLLECTIONS}
              className="px-10 py-4 bg-gray-900 text-white font-bold rounded-full hover:bg-emerald-800 transition-all transform hover:scale-105 shadow-xl inline-block"
            >
              Explore Collections
            </Link>
            <Link
              href={ROUTES.IMPACT}
              className="px-10 py-4 border-2 border-gray-900 text-gray-900 font-bold rounded-full hover:bg-gray-50 transition-all transform hover:scale-105 shadow-lg inline-block"
            >
              Learn About Impact
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}