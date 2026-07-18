"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ArchivePage() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl"
      >
        <span className="inline-block px-4 py-1.5 bg-[#1a5b3a]/10 border border-[#1a5b3a]/20 text-[#1a5b3a] text-xs font-bold uppercase tracking-[0.3em] rounded-full mb-8">
          The Gallery
        </span>
        <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-8 leading-tight">
          Our <span className="text-[#1a5b3a]">Archive</span>.
        </h1>
        <p className="text-lg md:text-xl text-gray-500 font-light mb-12 leading-relaxed">
          We are currently curating our legacy of craftsmanship. This section will soon host our past collections, artisan stories, and the evolution of Bal Jyoti designs.
        </p>
        
        <div className="flex flex-wrap justify-center gap-6">
          <Link 
            href="/"
            className="px-10 py-4 bg-[#1a5b3a] text-white font-bold rounded-full hover:bg-[#1a3a1a] transition-all shadow-xl shadow-[#1a5b3a]/20"
          >
            Back to Home
          </Link>
          <Link 
            href="/collections"
            className="px-10 py-4 border-2 border-gray-900 text-gray-900 font-bold rounded-full hover:bg-gray-50 transition-all"
          >
            Explore Current Shop
          </Link>
        </div>
      </motion.div>
      
      {/* Decorative background elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#1a5b3a]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-400/5 rounded-full blur-[120px]" />
      </div>
    </div>
  );
}
