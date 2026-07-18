"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const HeartOfArtisans = () => {
  return (
    <div
      className="relative overflow-hidden flex items-center justify-center"
      style={{
        minHeight: "420px",
        background: "#f5f0e8", // 👈 Cultre beige background
      }}
    >

      {/* Subtle gradient overlay (very light, not dark) */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#f5f0e8]/80 z-0" />

      {/* Lotus watermarks (lighter + aesthetic) */}
      <div className="absolute bottom-[-30px] left-[-30px] w-52 h-52 pointer-events-none opacity-10 -rotate-12">
        <Image src="/images/lotus_icon.png" alt="" fill className="object-contain" />
      </div>
      <div className="absolute top-[-20px] right-[-20px] w-40 h-40 pointer-events-none opacity-10 rotate-12">
        <Image src="/images/lotus_icon.png" alt="" fill className="object-contain" />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-16">
        <span className="text-[#1a5b3a] text-xs font-semibold uppercase tracking-[0.25em] mb-4">
          Our Mission
        </span>

        <h2 className="text-4xl md:text-6xl font-serif text-[#1a5b3a] mb-5 leading-tight">
          Heart of <span className="text-amber-500">Artisans</span>
        </h2>

        <p className="text-gray-600 text-base md:text-lg max-w-xl mb-10 font-light leading-relaxed">
          Connecting rural craftsmanship with the modern world.
          Every purchase lights up a home.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/about"
            className="bg-[#1a5b3a] hover:bg-[#14442b] text-white font-bold px-10 py-3 rounded-full transition-all duration-200 hover:scale-105 shadow-lg uppercase tracking-wide text-sm"
          >
            Join the Movement
          </Link>

          <Link
            href="/collections"
            className="border border-[#1a5b3a]/40 text-[#1a5b3a] hover:bg-[#1a5b3a]/10 font-medium px-10 py-3 rounded-full transition-all duration-200 uppercase tracking-wide text-sm"
          >
            Shop Crafts
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeartOfArtisans;