"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ROUTES } from '@/lib/routes';
import { motion } from 'framer-motion';

const PrecisionBanner = () => {
  return (
    <div className="w-full bg-white relative flex items-center min-h-[300px] sm:min-h-[340px] md:min-h-[400px] overflow-hidden">

      {/* Blue horizontal band — Centered and Responsive */}
      <div className="absolute left-0 right-0 bg-[#5C7FCA] z-0 h-[100px] sm:h-[120px] md:h-[150px] top-1/2 -translate-y-1/2" />

      {/* Dot texture */}
      <div className="absolute left-0 right-0 z-0 opacity-10 h-[100px] sm:h-[120px] md:h-[150px] top-1/2 -translate-y-1/2"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '18px 18px',
        }}
      />

      {/* Image — Optimized for Mobile Responsiveness */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute left-[-15px] sm:left-2 md:left-24 bottom-0 z-10 w-[150px] xs:w-[180px] sm:w-[260px] md:w-[420px] lg:w-[540px] h-[80%] xs:h-[85%] md:h-full opacity-70 sm:opacity-90 md:opacity-100 transition-all duration-500"
      >
        <Image
          src="/images/loom_icon.png"
          alt="Artisan working on loom"
          fill
          className="object-contain object-bottom"
          priority
        />
      </motion.div>

      {/* Story Content — Fully Responsive */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="absolute right-4 xs:right-6 sm:right-12 md:right-24 top-1/2 -translate-y-1/2 z-20 flex flex-col items-end text-right"
      >
        <div className="max-w-[140px] xs:max-w-[170px] sm:max-w-xs md:max-w-xl lg:max-w-2xl space-y-2 md:space-y-6">
          <p className="text-[10px] sm:text-xs font-bold text-[#1a5b3a] uppercase tracking-[0.2em] opacity-80">Craftsmanship Second to None</p>
          <h3 className="text-gray-900 text-xs xs:text-sm sm:text-xl md:text-3xl lg:text-4xl font-serif tracking-wide leading-tight italic">
            "Crafted with Precision. Heritage Modernized for <span className="font-bold text-[#1a5b3a] not-italic">Today</span>."
          </h3>

          <div className="flex flex-row flex-wrap items-center justify-end gap-2 md:gap-4 pt-2 md:pt-4">
            <Link
              href={ROUTES.COLLECTIONS}
              className="bg-amber-400 text-gray-900 text-[8px] xs:text-[10px] md:text-[12px] font-bold uppercase tracking-widest px-3 xs:px-5 md:px-8 py-2 md:py-3.5 rounded-none shadow-lg hover:bg-amber-300 transition-all duration-300 transform hover:-translate-y-1"
            >
              Explore
            </Link>
            <Link
              href={ROUTES.IMPACT}
              className="border-2 border-[#1a5b3a] text-[#1a5b3a] text-[8px] xs:text-[10px] md:text-[12px] font-bold uppercase tracking-widest px-3 xs:px-5 md:px-8 py-2 md:py-3.5 rounded-none hover:bg-emerald-50 transition-all duration-300 transform hover:-translate-y-1"
            >
              Impact
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PrecisionBanner;
