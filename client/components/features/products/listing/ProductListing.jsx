"use client";
import React, { useState } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import ProductCard from "@/components/features/products/ProductCard";

const ProductListing = ({ title, products = [] }) => {
    const { formatPrice } = useCurrency();
    const [sort, setSort] = useState("popularity");

    const sortedProducts = [...products].sort((a, b) => {
        if (sort === "priceLow") return a.price - b.price;
        if (sort === "priceHigh") return b.price - a.price;
        return 0;
    });

    return (
        <div className="w-full bg-white transition-colors duration-300">
            <div className="container mx-auto px-4 py-8 md:py-12 max-w-[1600px]">
                
                {/* Title Section */}
                <div className="flex flex-col items-center mb-10 text-center">
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-[0.3em] mb-3">
                        Curated Heritage Collection
                    </span>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight capitalize">
                        {title}
                    </h2>
                </div>

                {/* Grid Container */}
                <div className="w-full">
                    
                    {/* Minimal Toolbar */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b border-gray-100/80 gap-4">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest order-2 sm:order-1">
                            Showing {sortedProducts.length} Treasures
                        </span>
                        
                        <div className="flex items-center gap-4 order-1 sm:order-2">
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Sort By:</span>
                                <select
                                    className="border-none bg-transparent py-1 px-1 text-xs font-bold text-gray-900 focus:ring-0 cursor-pointer hover:text-amber-600 transition-colors bg-white"
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value)}
                                >
                                    <option value="popularity">Popularity</option>
                                    <option value="priceLow">Price: Low to High</option>
                                    <option value="priceHigh">Price: High to Low</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* High-Density Grid */}
                    {sortedProducts.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-4 gap-y-10">
                            {sortedProducts.map((product) => (
                                <ProductCard key={product._id || product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 text-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
                            <div className="bg-white p-6 rounded-full shadow-sm mb-6">
                                <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Collection is expanding</h3>
                            <p className="text-gray-500 max-w-sm px-6">We&apos;re currently onboarding new artisans for this category. Check back soon!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductListing;
