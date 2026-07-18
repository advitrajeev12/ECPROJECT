"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ROUTES } from '@/lib/routes';
import { motion } from 'framer-motion';

const VisionBanner = () => {
  return (
    <div className="w-full bg-white relative flex items-center h-[70vh] md:h-[100vh] overflow-hidden">

      {/* Blue horizontal band */}
      <div className="absolute left-0 right-0 bg-[#5C7FCA] z-0 h-[200px] md:h-[300px] top-1/2 -translate-y-1/2" />

      {/* Dot texture */}
      <div
        className="absolute left-0 right-0 z-0 opacity-10 h-[200px] md:h-[300px] top-1/2 -translate-y-1/2"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '18px 18px',
        }}
      />

      {/* Image */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="absolute left-6 md:left-32 bottom-0 z-10 w-[240px] sm:w-[340px] md:w-[520px] h-[95%]"
      >
        <Image
          src="/images/women_icon1.png"
          alt="Woman working on crafts"
          fill
          className="object-contain object-bottom"
          priority
        />
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="absolute right-6 md:right-24 top-1/2 -translate-y-1/2 z-20 flex flex-col items-end text-right"
      >
        <div className="max-w-sm md:max-w-2xl space-y-6 md:space-y-10">

          <p className="text-xs font-bold text-[#1a5b3a] uppercase tracking-[0.2em] opacity-80">
            Our Founding Story
          </p>

          <h3 className="text-lg sm:text-2xl md:text-4xl lg:text-5xl font-serif leading-tight italic">
            "One Vision. 3 Craft Clusters. Founded on{" "}
            <span className="font-bold text-[#1a5b3a] not-italic">
              Authentic Traditions
            </span>."
          </h3>

          <div className="flex gap-4 pt-4">
            <Link
              href={ROUTES.COLLECTIONS}
              className="bg-amber-400 text-gray-900 text-xs md:text-sm font-bold uppercase px-6 md:px-8 py-3 md:py-4 shadow-lg hover:bg-amber-300 transition"
            >
              Explore
            </Link>

            <Link
              href={ROUTES.IMPACT}
              className="border-2 border-[#1a5b3a] text-[#1a5b3a] text-xs md:text-sm font-bold uppercase px-6 md:px-8 py-3 md:py-4 hover:bg-emerald-50 transition"
            >
              Impact
            </Link>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default VisionBanner;