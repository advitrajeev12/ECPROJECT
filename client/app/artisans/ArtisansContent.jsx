"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Palette, Award, Zap, Heart, Star } from "lucide-react";

const artisans = [
  {
    name: "Hahesadi Bamboo Cluster",
    location: "Hahesadi, Bihar",
    craft: "Bamboo Products",
    story: "Hahesadi Bamboo Cluster, Bihar — where tradition meets sustainability. Skilled artisans transform locally sourced bamboo into eco-friendly, handcrafted products, preserving heritage while creating livelihoods for rural communities.",
    image: "/images/bamboo_cluster.png", // Reusing this for individual story
    tags: ["Sustainable Living", "Rural Artisans"]
  },
  {
    name: "Sitapur Moonj Cluster",
    location: "Sitapur, Uttar Pradesh",
    craft: "Moonj Grass",
    story: "Sitapur Moonj Cluster, Uttar Pradesh — a hub of traditional craftsmanship where artisans weave natural moonj grass into beautifully handcrafted rugs. Blending sustainability with heritage, each piece reflects skilled artistry while supporting rural livelihoods.",
    image: "/images/moonj_cluster.png",
    tags: ["Eco-Friendly", "Natural Fiber"]
  },
  {
    name: "Peshrar Rugs Cluster",
    location: "Peshrar, Jharkhand",
    craft: "Rug Weaving",
    story: "Peshrar Rugs Cluster, Jharkhand — a vibrant center of rug weaving where skilled artisans craft intricate, handwoven rugs rooted in tradition. Each piece reflects cultural heritage, sustainable practices, and the dedication of rural communities.",
    image: "/images/rug_jharkhand.png",
    tags: ["Handwoven Rugs", "Skill Trainer"]
  }
];

const fadeIn = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

export default function ArtisansPage() {
  return (
    <div className="bg-[#fdfbf7] min-h-screen">
      {/* ── Hero Section ────────────────────────────────────────── */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/artisans_hero.png"
          alt="Our artisans"
          fill
          className="object-cover brightness-75 scale-105"
          priority
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          <motion.span
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-amber-400 font-bold uppercase tracking-[0.3em] text-xs mb-4 block"
          >
            The Soul of Bal Jyoti
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-serif font-bold mb-6"
          >
            The Hands that <span className="text-amber-400 italic">Heal</span>.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl font-light opacity-90 max-w-3xl mx-auto leading-relaxed"
          >
            Meet the master craftspeople who transform raw natural fibers into pieces of
            timeless art. Behind every product is a name, a family, and a thousand-year-old legacy.
          </motion.p>
        </div>
      </section>

      {/* ── Meet the Masters ──────────────────────────────────────── */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">Meet the Masters</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">Our artisans aren't just suppliers; they are our partners, our mentors, and the guardians of India's heritage.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {artisans.map((artisan, index) => (
            <motion.div
              key={index}
              variants={fadeIn}
              initial="initial"
              whileInView="whileInView"
              viewport="viewport"
              className="bg-white rounded-none overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 group"
            >
              <div className="relative h-80 w-full overflow-hidden">
                <Image
                  src={artisan.image}
                  alt={artisan.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-4 left-4 flex gap-2">
                  {artisan.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-amber-400 text-gray-900 text-[10px] font-bold rounded-none uppercase tracking-wider">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-2 text-amber-600 mb-2">
                  <MapPin size={14} />
                  <span className="text-xs font-bold uppercase tracking-widest">{artisan.location}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{artisan.name}</h3>
                <span className="text-[#1a5b3a] font-semibold text-sm block mb-4 italic">{artisan.craft}</span>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  {artisan.story}
                </p>
                <button className="w-full py-3 bg-gray-50 text-gray-700 font-bold text-xs uppercase tracking-widest rounded-none hover:bg-[#1a5b3a] hover:text-white transition-all">
                  Read Full Story
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Craft Regions ─────────────────────────────────────────── */}
      <section className="bg-[#1a3a1a] py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <Image src="/images/lotus_icon.png" alt="" fill className="object-contain scale-150 rotate-12" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-16">
          <div className="w-full md:w-1/2 space-y-8">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight">
              Crafting Across the <span className="text-amber-400">Heartland</span>.
            </h2>
            <p className="text-white/70 text-lg leading-relaxed">
              We focus our interventions in regions where craft traditions are deepest but
              opportunities are fewest. By establishing cooperatives in these hubs, we
              ensure economic stability for entire communities.
            </p>
            <div className="grid grid-cols-2 gap-6">
              {[
                { label: "Bihar", count: "12 Villages", crafts: "Sikki, Madhubani" },
                { label: "Jharkhand", count: "8 Villages", crafts: "Bamboo, Tussar" },
                { label: "Uttar Pradesh", count: "5 Villages", crafts: "Bhadohi Rugs" },
                { label: "West Bengal", count: "4 Villages", crafts: "Jute Weaving" },
              ].map((region, i) => (
                <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-none hover:bg-white/10 transition-colors duration-300">
                  <h4 className="text-amber-400 font-bold mb-1">{region.label}</h4>
                  <p className="text-white text-xs mb-2 opacity-60 italic">{region.count}</p>
                  <p className="text-white text-sm font-medium">{region.crafts}</p>
                </div>
              ))}
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="w-full md:w-1/2"
          >
            <div className="relative aspect-square md:aspect-[4/3] rounded-none overflow-hidden shadow-2xl border-2 border-amber-400/20 bg-black/40">
              <Image
                src="/images/india_craft_map.png"
                alt="Interactive map of craft regions in India"
                fill
                className="object-cover opacity-80 mix-blend-screen"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a3a1a]/80 via-transparent to-transparent pointer-events-none" />
              
              {/* Interactive Markers */}
              {[
                { name: "Uttar Pradesh", top: "42%", left: "48%" },
                { name: "Bihar", top: "52%", left: "62%" },
                { name: "Jharkhand", top: "60%", left: "59%" },
                { name: "West Bengal", top: "60%", left: "68%" }
              ].map((loc, idx) => (
                <div
                  key={idx}
                  className="absolute group z-10 flex flex-col items-center justify-center cursor-pointer"
                  style={{ top: loc.top, left: loc.left, transform: 'translate(-50%, -50%)' }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: idx * 0.4 }}
                    className="absolute w-8 h-8 bg-amber-400/50 rounded-full"
                  />
                  <div className="relative w-3 h-3 bg-amber-400 rounded-full border-2 border-[#1a3a1a] shadow-[0_0_15px_rgba(251,191,36,0.8)] group-hover:scale-150 transition-transform duration-300" />
                  
                  {/* Tooltip */}
                  <div className="absolute mt-14 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-[#112411]/90 text-amber-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-none whitespace-nowrap border border-amber-400/30 backdrop-blur-md shadow-xl">
                    <span className="block mb-1 opacity-70 text-[8px] leading-none">Craft Region</span>
                    {loc.name}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Collaborative Process ─────────────────────────────────── */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            {
              Icon: Palette,
              title: "Design Synthesis",
              desc: "We work with artisans to blend traditional motifs with modern utility."
            },
            {
              Icon: Star,
              title: "Raw Purity",
              desc: "Every material is sourced locally and sustainably within 10km of the village."
            },
            {
              Icon: Award,
              title: "Quality Mastery",
              desc: "Rigorous quality checks performed by village-level master artisans."
            },
            {
              Icon: Heart,
              title: "Dignified Wages",
              desc: "Wages are paid twice a month, empowering artisans to plan for their futures."
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              variants={fadeIn}
              initial="initial"
              whileInView="whileInView"
              className="text-center space-y-4"
            >
              <div className="w-20 h-20 mx-auto bg-gray-50 rounded-none flex items-center justify-center text-[#1a5b3a] border border-emerald-100 hover:bg-emerald-50 transition-colors duration-300">
                <item.Icon size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
