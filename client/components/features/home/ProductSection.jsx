"use client";
import React, { useRef, useState, useEffect } from 'react';
import Link from "next/link";
import ProductCard from "@/components/features/products/ProductCard";

const ProductSection = ({ title, products, slug }) => {
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
        // Small delay so DOM has painted
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
        el.scrollBy({ left: dir * (cardW + 20), behavior: 'smooth' });
    };

    if (!products || products.length === 0) return null;

    return (
        <div className="w-full">

            {/* ── Header ── */}
            <div className="flex flex-col items-center justify-center text-center gap-2 mb-6 px-1">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">
                    {slug ? (
                        <Link
                            href={`/collections/${slug}`}
                            className="hover:text-primary transition-colors"
                        >
                            {title}
                        </Link>
                    ) : title}
                </h2>
                {slug && (
                    <Link
                        href={`/collections/${slug}`}
                        className="text-primary font-medium hover:underline decoration-1 underline-offset-4 text-sm uppercase tracking-wider"
                    >
                        View All
                    </Link>
                )}
            </div>

            {/* ── Carousel wrapper (relative so arrows are positioned against it) ── */}
            <div className="relative group">

                {/* ◄ LEFT ARROW — overlaps left edge */}
                <button
                    onClick={() => scroll(-1)}
                    aria-label="Previous"
                    className={`
                        absolute left-[-18px] top-1/2 -translate-y-1/2 z-20
                        w-10 h-10 rounded-full bg-white border border-gray-200 shadow-md
                        flex items-center justify-center
                        transition-all duration-200
                        ${canPrev
                            ? 'opacity-100 cursor-pointer hover:bg-gray-900 hover:border-gray-900 hover:text-white hover:shadow-lg'
                            : 'opacity-0 pointer-events-none'}
                    `}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                    </svg>
                </button>

                {/* ► RIGHT ARROW — overlaps right edge */}
                <button
                    onClick={() => scroll(1)}
                    aria-label="Next"
                    className={`
                        absolute right-[-18px] top-1/2 -translate-y-1/2 z-20
                        w-10 h-10 rounded-full bg-white border border-gray-200 shadow-md
                        flex items-center justify-center
                        transition-all duration-200
                        ${canNext
                            ? 'opacity-100 cursor-pointer hover:bg-gray-900 hover:border-gray-900 hover:text-white hover:shadow-lg'
                            : 'opacity-0 pointer-events-none'}
                    `}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                </button>

                {/* ── Scrollable track ── */}
                <div
                    ref={trackRef}
                    className="flex gap-5 overflow-x-auto pb-2"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {products.map((product) => (
                        <div
                            key={product._id || product.id}
                            className="flex-shrink-0"
                            style={{ width: 'clamp(200px, 22vw, 270px)' }}
                        >
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductSection;
