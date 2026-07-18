"use client";
import React from 'react';
import AliceCarousel from 'react-alice-carousel';
import 'react-alice-carousel/lib/alice-carousel.css';
import Image from 'next/image';
import Link from 'next/link';

/**
 * HeroCarousel - A dynamic hero section featuring high-quality banners
 * and artisan-focused storytelling.
 */
const HeroCarousel = () => {
  const items = [
    <div key="bamboo" className="relative w-full h-[520px] overflow-hidden group">
      <Image 
        src="/images/bamboo_banner.png" 
        alt="Bamboo Crafts" 
        fill 
        className="object-cover transition-transform duration-[10s] group-hover:scale-105"
        priority
      />
      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg">
          Authentic <span className="text-amber-400">Bamboo Crafts</span>
        </h2>
        <p className="text-white/90 text-lg md:text-xl max-w-2xl mb-8 font-light">
          Handcrafted by rural artisans, bringing nature's elegance to your home.
        </p>
        <Link 
          href="/collections/bamboo"
          className="bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold px-10 py-3 rounded-none transition-all duration-200 shadow-xl hover:scale-105"
        >
          Shop Collection
        </Link>
      </div>
    </div>,
    <div key="rugs" className="relative w-full h-[520px] overflow-hidden group">
      <Image 
        src="/images/rugs_banner.png" 
        alt="Handloom Rugs" 
        fill 
        className="object-cover transition-transform duration-[10s] group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg">
          Exquisite <span className="text-amber-400">Handloom Rugs</span>
        </h2>
        <p className="text-white/90 text-lg md:text-xl max-w-2xl mb-8 font-light">
          Timeless weaving traditions from the heart of India's craft clusters.
        </p>
        <Link 
          href="/collections/rugs"
          className="bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold px-10 py-3 rounded-none transition-all duration-200 shadow-xl hover:scale-105"
        >
          Explore Rugs
        </Link>
      </div>
    </div>,
    <div key="khadi" className="relative w-full h-[520px] overflow-hidden group">
      <Image 
        src="/images/khadi_banner.png" 
        alt="Traditional Khadi" 
        fill 
        className="object-cover transition-transform duration-[10s] group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg">
          Traditional <span className="text-amber-400">Khadi & Silk</span>
        </h2>
        <p className="text-white/90 text-lg md:text-xl max-w-2xl mb-8 font-light">
          Experience the heritage of Indian textiles through every thread.
        </p>
        <Link 
          href="/collections/apparel"
          className="bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold px-10 py-3 rounded-none transition-all duration-200 shadow-xl hover:scale-105"
        >
          View Collection
        </Link>
      </div>
    </div>
  ];

  return (
    <div className="w-full relative overflow-hidden h-[520px] bg-gray-900">
      <AliceCarousel
        items={items}
        disableButtonsControls={false}
        autoPlay
        autoPlayInterval={6000}
        infinite
        animationDuration={1000}
        disableDotsControls={false}
        renderPrevButton={() => (
           <button className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center rounded-none bg-white/20 hover:bg-white/40 text-white transition-all hover:scale-110">
             <span className="text-2xl">‹</span>
           </button>
        )}
        renderNextButton={() => (
           <button className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center rounded-none bg-white/20 hover:bg-white/40 text-white transition-all hover:scale-110">
             <span className="text-2xl">›</span>
           </button>
        )}
      />
      <style jsx global>{`
        .alice-carousel__dots {
          position: absolute !important;
          bottom: 20px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          margin: 0 !important;
        }
        .alice-carousel__dots-item {
          background-color: rgba(255, 255, 255, 0.4) !important;
          width: 10px !important;
          height: 10px !important;
        }
        .alice-carousel__dots-item.__active {
          background-color: #fbbf24 !important;
          width: 30px !important;
          border-radius: 0 !important;
        }
      `}</style>
    </div>
  );
};

export default HeroCarousel;
