"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Users, Droplets, Leaf, Home, GraduationCap, Coins } from "lucide-react";

// ─── Simple CountUp Hook ────────────────────────────────────────────────────────
function Counter({ value, suffix = "" }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    if (start === end) return;
    let totalMiliseconds = 2000;
    let incrementTime = (totalMiliseconds / end) * 2;
    let timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{count}{suffix}</span>;
}

const fadeIn = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: "easeOut" }
};

export default function ImpactPage() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);

  return (
    <div className="bg-white min-h-screen overflow-x-hidden">
      {/* ── Hero Section ────────────────────────────────────────── */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <motion.div style={{ opacity, scale }} className="absolute inset-0">
          <Image
            src="/images/impacts_hero.png"
            alt="Impact in the village"
            fill
            className="object-cover brightness-[0.4]"
            priority
          />
        </motion.div>

        <div className="relative z-10 text-center px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            <span className="inline-block px-4 py-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-[0.3em] rounded-full mb-8">
              Transparency Report 2025
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl md:text-8xl font-serif font-bold text-white mb-8 leading-tight"
          >
            Crafting a <span className="text-emerald-400">Better</span> World.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-lg md:text-2xl text-white/70 font-light max-w-3xl mx-auto leading-relaxed"
          >
            We don't measure success by profit alone. We measure it by the smiles of our artisans,
            the health of our soil, and the preservation of our heritage.
          </motion.p>
        </div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/40"
        >
          <div className="w-px h-16 bg-gradient-to-t from-emerald-500 to-transparent mx-auto" />
        </motion.div>
      </section>

      {/* ── Dashboard Stats ──────────────────────────────────────── */}
      <section className="relative z-20 -mt-20 px-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center backdrop-blur-xl bg-white/90">
          {[
            { Icon: Users, label: "Artisans Empowered", value: "520", suffix: "+" },
            { Icon: Home, label: "Villages Impacted", value: "28", suffix: "" },
            { Icon: Leaf, label: "Nature Fibers Used", value: "100", suffix: "%" },
            { Icon: Coins, label: "Fair Trade Premium", value: "45", suffix: "%" },
          ].map((stat, i) => (
            <div key={i} className="space-y-3">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <stat.Icon size={24} />
              </div>
              <h3 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 border-b-2 border-emerald-500/10 inline-block">
                <Counter value={stat.value} suffix={stat.suffix} />
              </h3>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pillars of Change ────────────────────────────────────── */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center mb-32">
          <motion.div variants={fadeIn} initial="initial" whileInView="whileInView" viewport="viewport" className="space-y-8">
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-gray-900">
              Women-Led <span className="text-emerald-700">Economic</span> Independence.
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              In the rural heartlands, women are the primary guardians of craft. Over 85% of our
              partners are female artisans. By providing them with consistent work,
              we are shifting the community dynamics—allowing them to fund their children's
              education and have a significant voice in household decisions.
            </p>
            <ul className="space-y-4">
              {[
                { icon: GraduationCap, text: "Children of 100% of our artisans attend school." },
                { icon: Droplets, text: "Sanitary health workshops provided quarterly." },
                { icon: ShieldCheck, text: "Health insurance for all master artisans." }
              ].map((item, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <item.icon size={12} />
                  </div>
                  <span className="text-gray-700 font-medium">{item.text}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          <div className="relative group">
            <div className="absolute inset-0 bg-emerald-600/10 rounded-3xl rotate-3 group-hover:rotate-0 transition-transform duration-500" />
            <Image
              src="/images/women_led.png"
              alt="Women artisan working"
              width={600}
              height={700}
              className="relative rounded-3xl shadow-lg z-10"
            />
          </div>
        </div>

        {/* Sustainability Pillar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center flex-row-reverse">
          <div className="order-2 md:order-1 relative group">
            <div className="absolute inset-0 bg-amber-600/10 rounded-3xl -rotate-3 group-hover:rotate-0 transition-transform duration-500" />
            <Image
              src="/images/sustainables_banner.png"
              alt="Sustainable materials"
              width={600}
              height={700}
              className="relative rounded-3xl shadow-lg z-10"
            />
          </div>
          <motion.div variants={fadeIn} initial="initial" whileInView="whileInView" viewport="viewport" className="space-y-8 order-1 md:order-2">
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-gray-900">
              Uncompromisingly <span className="text-amber-700">Sustainable</span>.
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              We reject the plastic economy. Our production cycle is designed to leave no trace.
              From the Moonj grass harvested from riverbeds to the natural pigments extracted
              from flowers, our materials are gifts from nature that return to nature.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
                <p className="text-2xl font-bold text-amber-900 mb-1 leading-none">0%</p>
                <p className="text-xs uppercase tracking-widest text-amber-600 font-bold">Synthetic Materials</p>
              </div>
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                <p className="text-2xl font-bold text-emerald-900 mb-1 leading-none">100%</p>
                <p className="text-xs uppercase tracking-widest text-emerald-600 font-bold">Plastic Free Packagin</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Community Quote ────────────────────────────────────────── */}
      <section className="bg-gray-900 py-32 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div variants={fadeIn} initial="initial" whileInView="whileInView">
            <span className="text-emerald-500 font-bold uppercase tracking-[0.4em] text-xs mb-8 block">Our Philosophy</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white italic leading-relaxed mb-12">
              "We don't inherit the earth from our ancestors, we borrow it from our children.
              Our craft is our way of giving back more than we take."
            </h2>

          </motion.div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────── */}
      <section className="py-32 text-center px-6">
        <h2 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-10">Choose Impact.</h2>
        <p className="text-gray-500 max-w-xl mx-auto mb-12">Every purchase contributes to our Artisan Development Fund, dedicated to village healthcare and craft training.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <button className="px-12 py-4 bg-emerald-600 text-white font-bold rounded-full hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20">
            Shop Mindfully
          </button>
          <button className="px-12 py-4 border-2 border-gray-900 text-gray-900 font-bold rounded-full hover:bg-gray-50 transition-all">
            Join the Cooperative
          </button>
        </div>
      </section>
    </div>
  );
}

// Helper icon
function ShieldCheck({ size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" /></svg>
  )
}
