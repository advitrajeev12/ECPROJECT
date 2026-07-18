"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { interventionsData } from '@/lib/data/interventions';
import { useParams, notFound } from 'next/navigation';
import { MapPin, ChevronLeft, Heart, Zap, Globe } from 'lucide-react';

export default function InterventionDetailPage() {
  const params = useParams();
  const slug = params.slug;
  const data = interventionsData[slug];

  if (!data) {
    notFound();
  }

  return (
    <div className="bg-white min-h-screen">
      {/* ── HERO SECTION ────────────────────────────────────────── */}
      <section className="relative h-[70vh] flex items-end overflow-hidden">
        <Image
          src={data.heroImage}
          alt={data.title}
          fill
          className="object-cover brightness-75 scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-16">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-white/70 hover:text-amber-400 transition-colors mb-8 text-sm uppercase tracking-widest font-bold"
          >
            <ChevronLeft size={16} /> Back to Home
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 text-amber-400 mb-4">
              <MapPin size={20} />
              <span className="text-sm font-bold uppercase tracking-[0.3em]">{data.location}</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-serif text-white font-bold leading-tight mb-6">
              {data.title.split(' ').map((word, i) => (
                <span key={i} className={i % 2 !== 0 ? "text-amber-400 italic" : ""}>
                  {word}{' '}
                </span>
              ))}
            </h1>
            <p className="text-white/80 text-lg md:text-xl max-w-2xl font-light leading-relaxed">
              {data.shortDesc}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── IMPACT METRICS ──────────────────────────────────────── */}
      <section className="relative z-20 mt-[-60px] max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data.impact.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="bg-white p-10 rounded-[40px] shadow-2xl border border-gray-100 text-center"
            >
              <p className="text-4xl font-serif font-bold text-[#1a5b3a] mb-2">{item.value}</p>
              <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FULL STORY ──────────────────────────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-amber-600 text-xs font-bold uppercase tracking-[0.4em] mb-4 block">The Intervention</span>
            <h2 className="text-4xl md:text-5xl font-serif text-gray-900 leading-tight">
              A Legacy <span className="text-[#1a5b3a] italic">Redefined</span>.
            </h2>
          </motion.div>
          
          <div className="prose prose-lg text-gray-600 font-light leading-loose space-y-6">
            {data.fullStory.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          <div className="flex gap-6 pt-6">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                <Heart size={24} />
              </div>
              <span className="text-[10px] font-bold uppercase text-gray-400">Community</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
                <Zap size={24} />
              </div>
              <span className="text-[10px] font-bold uppercase text-gray-400">Innovation</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                <Globe size={24} />
              </div>
              <span className="text-[10px] font-bold uppercase text-gray-400">Global</span>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative aspect-square rounded-[60px] overflow-hidden shadow-inner border-[12px] border-gray-50"
        >
          <Image
            src={data.heroImage}
            alt="Process image"
            fill
            className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
          />
        </motion.div>
      </section>

      {/* ── CRAFT SPOTLIGHT ─────────────────────────────────────── */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-[#1a5b3a] rounded-[60px] p-12 md:p-20 flex flex-col md:flex-row gap-16 items-center overflow-hidden relative">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
               <Image src="/images/lotus_icon.png" alt="" fill className="object-contain scale-150 rotate-12" />
            </div>

            <div className="w-full md:w-1/2 relative z-10">
              <span className="text-amber-400 text-xs font-bold uppercase tracking-[0.4em] mb-4 block">Craft Spotlight</span>
              <h3 className="text-4xl font-serif text-white mb-6">{data.craftDetails.title}</h3>
              <p className="text-white/70 text-lg leading-relaxed mb-8">
                {data.craftDetails.description}
              </p>
              <div className="flex items-center gap-4 py-6 border-t border-white/10">
                <div className="text-amber-400 font-bold uppercase tracking-widest text-xs">Primary Material:</div>
                <div className="text-white text-sm italic font-serif">{data.craftDetails.material}</div>
              </div>
            </div>

            <div className="w-full md:w-1/2 flex justify-center relative z-10">
               <div className="w-80 h-80 bg-white/10 backdrop-blur-3xl rounded-full flex items-center justify-center border border-white/20">
                  <span className="text-7xl">🏺</span>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER CALL TO ACTION ───────────────────────────────── */}
      <section className="py-32 text-center bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-8 leading-tight">
            Support the Artisans of <span className="text-amber-600 italic">{data.id.charAt(0).toUpperCase() + data.id.slice(1)}</span>
          </h2>
          <p className="text-gray-500 text-lg mb-12 font-light">
            Every product you purchase from this region directly supports the families and clusters mentioned above.
          </p>
          <Link 
            href="/collections"
            className="inline-block bg-[#1a5b3a] text-white px-12 py-5 rounded-full font-bold uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-xl"
          >
            Shop the Collection
          </Link>
        </div>
      </section>
    </div>
  );
}
