"use client";
import React, { useRef, useState, useEffect } from 'react';
import Link from "next/link";
import SquareProductCard from "@/components/features/products/SquareProductCard";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const SquareProductSection = ({ title, products, slug, subtitle }) => {
    const trackRef = useRef(null);
    const [canPrev, setCanPrev] = useState(false);
    const [canNext, setCanNext] = useState(false);

    const checkScroll = () => {
        const el = trackRef.current;
        if (!el) return;
        setCanPrev(el.scrollLeft > 4);
        setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };

    useEffect(() => {
        const el = trackRef.current;
        if (!el) return;
        const t = setTimeout(checkScroll, 100);
        el.addEventListener('scroll', checkScroll, { passive: true });
        window.addEventListener('resize', checkScroll);
        return () => {
            clearTimeout(t);
            el.removeEventListener('scroll', checkScroll);
            window.removeEventListener('resize', checkScroll);
        };
    }, [products]);

    const scroll = (dir) => {
        const el = trackRef.current;
        if (!el) return;
        const cardW = el.querySelector('div')?.offsetWidth || 280;
        el.scrollBy({ left: dir * (cardW + 16), behavior: 'smooth' });
    };

    if (!products || products.length === 0) return null;

    return (
        <section className="w-full py-16 bg-white dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-[1400px] mx-auto px-4 md:px-[20px]">

                {/* Section Header */}
                <div className="flex flex-col items-center justify-center text-center gap-4 mb-12">
                    {slug ? (
                        <Link href={`/collections/${slug}`} className="group flex flex-col items-center space-y-2">
                            {subtitle && (
                                <span className="text-amber-700 dark:text-amber-500 text-xs font-bold uppercase tracking-[0.4em] block transition-colors group-hover:text-amber-600">
                                    {subtitle}
                                </span>
                            )}
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white uppercase font-serif tracking-tight transition-colors group-hover:text-amber-700">
                                {title}
                            </h2>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 group-hover:text-amber-600 transition-colors flex items-center gap-2 mt-1">
                                Explore Collection <ArrowRight className="w-3 h-3 transform transition-transform group-hover:translate-x-1" />
                            </span>
                        </Link>
                    ) : (
                        <div className="flex flex-col items-center space-y-2">
                            {subtitle && (
                                <span className="text-amber-700 dark:text-amber-500 text-xs font-bold uppercase tracking-[0.4em] block">
                                    {subtitle}
                                </span>
                            )}
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white uppercase font-serif tracking-tight">
                                {title}
                            </h2>
                        </div>
                    )}
                </div>

                {/* Carousel Container with Arrow Buttons */}
                <div className="relative group/carousel">
                    {/* Left Arrow Button */}
                    <button
                        onClick={() => scroll(-1)}
                        aria-label="Previous products"
                        className={`
                            absolute left-[-20px] top-1/2 -translate-y-1/2 z-20
                            w-12 h-12 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md
                            flex items-center justify-center text-gray-950 dark:text-white
                            transition-all duration-300
                            ${canPrev
                                ? 'opacity-100 cursor-pointer hover:bg-amber-700 hover:border-amber-700 hover:text-white hover:shadow-lg dark:hover:bg-amber-600 dark:hover:border-amber-600'
                                : 'opacity-0 pointer-events-none'}
                        `}
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    {/* Right Arrow Button */}
                    <button
                        onClick={() => scroll(1)}
                        aria-label="Next products"
                        className={`
                            absolute right-[-20px] top-1/2 -translate-y-1/2 z-20
                            w-12 h-12 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md
                            flex items-center justify-center text-gray-950 dark:text-white
                            transition-all duration-300
                            ${canNext
                                ? 'opacity-100 cursor-pointer hover:bg-amber-700 hover:border-amber-700 hover:text-white hover:shadow-lg dark:hover:bg-amber-600 dark:hover:border-amber-600'
                                : 'opacity-0 pointer-events-none'}
                        `}
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Scrollable Track */}
                    <div
                        ref={trackRef}
                        className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        onScroll={checkScroll}
                    >
                        {products.map((product) => (
                            <div
                                key={product._id || product.id}
                                className="flex-shrink-0 w-[280px]"
                            >
                                <SquareProductCard product={product} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Centered View More Button for all screen sizes */}
                {slug && (
                    <div className="mt-12 flex justify-center">
                        <Link
                            href={`/collections/${slug}`}
                            className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-gray-950 dark:border-white text-gray-950 dark:text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-950 hover:text-white dark:hover:bg-white dark:hover:text-gray-950 transition-all duration-300 hover:scale-105 group/btn rounded-full"
                        >
                            View More Products
                            <ArrowRight className="w-4 h-4 transform transition-transform group-hover/btn:translate-x-1.5" />
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
};

export default SquareProductSection;
