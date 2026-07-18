"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ROUTES } from "@/lib/routes";
import { ArrowRight, Sparkles, Box, Hammer, Shirt, Paintbrush } from "lucide-react";

const collections = [
    {
        id: "rugs",
        name: "Handwoven Rugs",
        description: "Experience the warmth of traditional craftsmanship with our exquisite handwoven rugs.",
        image: "/images/jute_rug.png",
        count: "12 Items",
        icon: Box,
        color: "bg-amber-500"
    },
    {
        id: "bamboo",
        name: "Bamboo Creations",
        description: "Sustainable and stylish bamboo products for eco-friendly living.",
        image: "/images/bamboo_spotlight.png",
        count: "8 Items",
        icon: Hammer,
        color: "bg-emerald-500"
    },
    {
        id: "moonj-sikki",
        name: "Moonj & Sikki Crafts",
        description: "Golden grass weaves that tell stories of ancient art.",
        image: "/images/moonj_sikki.png",
        count: "Coming Soon",
        icon: Sparkles,
        color: "bg-yellow-500"
    },
    {
        id: "painting",
        name: "Folk Paintings",
        description: "Vibrant Madhubani and tribal art to adorn your walls.",
        image: "/images/folk_painting.png",
        count: "Coming Soon",
        icon: Paintbrush,
        color: "bg-blue-500"
    },
    {
        id: "apparel",
        name: "Ethereal Apparels",
        description: "A fusion of tradition and contemporary fashion.",
        image: "/images/ethereal_apparels.png",
        count: "New Arrivals",
        icon: Shirt,
        color: "bg-rose-500"
    }
];

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 30 },
    show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

export default function CollectionsPage() {
    return (
        <div className="bg-[#fcf8f3] min-h-screen">
            {/* ── Hero Header ────────────────────────────────────────── */}
            <section className="relative pt-32 pb-20 px-6 text-center overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-radial from-amber-100/50 to-transparent opacity-60 blur-3xl pointer-events-none" />
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="relative z-10"
                >
                    <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-[0.4em] rounded-full mb-6">
                        Curated Heritage
                    </span>
                    <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-6 tracking-tight">
                        Our <span className="text-amber-600 italic">Collections</span>
                    </h1>
                    <p className="text-gray-500 max-w-2xl mx-auto text-lg md:text-xl font-light leading-relaxed">
                        Discover our diverse range of indigenous products, each handcrafted 
                        with love and keeping sustainability at heart.
                    </p>
                </motion.div>
            </section>

            {/* ── Collections Grid ────────────────────────────────────── */}
            <section className="max-w-7xl mx-auto px-6 pb-32">
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12"
                >
                    {collections.map((collection) => (
                        <motion.div key={collection.id} variants={itemVariants}>
                            <Link
                                href={`${ROUTES.PRODUCT_CATEGORIES}/${collection.id}`}
                                className="group block relative h-[250px] sm:h-[300px] md:h-[500px] w-full rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl shadow-gray-200/50"
                            >
                                {/* Image Layer */}
                                <div className="absolute inset-0 z-0">
                                    <Image
                                        src={collection.image}
                                        alt={collection.name}
                                        fill
                                        className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110 group-hover:rotate-1"
                                    />
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-90" />
                                </div>

                                {/* Content Layer */}
                                <div className="absolute inset-0 z-10 p-6 md:p-10 flex flex-col justify-end text-white">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`p-1.5 md:p-2 rounded-xl ${collection.color} text-white shadow-lg`}>
                                            <collection.icon className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">
                                            {collection.count}
                                        </span>
                                    </div>
                                    
                                    <h3 className="text-3xl md:text-4xl font-serif font-bold mb-4 transform transition-transform duration-500 group-hover:-translate-y-2">
                                        {collection.name}
                                    </h3>
                                    
                                    <p className="text-gray-200 text-sm leading-relaxed mb-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100 line-clamp-3">
                                        {collection.description}
                                    </p>
                                    
                                    <div className="flex items-center gap-3 text-white font-bold text-xs uppercase tracking-widest opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-200">
                                        Explore Collection 
                                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-gray-900 transition-all">
                                            <ArrowRight className="w-3.5 h-3.5 md:w-[14px] md:h-[14px]" />
                                        </div>
                                    </div>
                                </div>

                                {/* Glass decorative border on hover */}
                                <div className="absolute inset-4 border border-white/10 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* ── Bottom Section ────────────────────────────────────────── */}
            <section className="bg-gray-900 py-24 px-6 text-center">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-8">
                        Can't find what you're looking for?
                    </h2>
                    <p className="text-white/60 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
                        We also accept customized bulk orders for corporate gifting, weddings, 
                        and interior designers. Every custom piece sustains our artisan community.
                    </p>
                    <Link 
                        href={ROUTES.BULK_ORDERS}
                        className="inline-flex items-center gap-3 px-12 py-5 bg-amber-500 text-gray-900 font-bold rounded-full hover:bg-amber-400 transition-all transform hover:scale-105 active:scale-95"
                    >
                        Bulk Order Inquiry
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </section>
        </div>
    );
}
