"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { ROUTES } from "@/lib/routes";
import { formatImageUrl } from "@/lib/utils";
import { Heart, Trash2, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

export default function Wishlist() {
    const { wishlistItems, removeFromWishlist } = useWishlist();
    const { formatPrice } = useCurrency();
    const { user, loading } = useAuth();
    const router = useRouter();

    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push(ROUTES.LOGIN);
        }
    }, [user, loading, router]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get("/api/products");
                if (res.data && res.data.success) {
                    setProducts(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setLoadingProducts(false);
            }
        };
        fetchProducts();
    }, []);

    if (loading || !user) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900 transition-colors">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    const stringifiedWishlist = wishlistItems.map(String);
    const displayProducts = products.filter(p => stringifiedWishlist.includes(String(p.id || p._id)));

    if (displayProducts.length === 0 && !loadingProducts) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-900/50 px-4 transition-colors">
                <div className="bg-white dark:bg-gray-800 p-12 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center max-w-lg w-full text-center hover:shadow-md transition-shadow">
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-[#ff3e6c]/20 rounded-full blur-xl animate-pulse"></div>
                        <div className="relative w-24 h-24 bg-rose-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center text-[#ff3e6c]">
                            <Heart size={40} className="fill-current" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 tracking-tight">Your Wishlist is Empty</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-10 leading-relaxed max-w-sm">
                        Save your favorite items here. Discover the elegance of our handcrafted collections and move them to your bag anytime.
                    </p>
                    <Link
                        href={ROUTES.HOME}
                        className="group flex flex-row gap-2 items-center bg-[#ff3e6c] text-white px-8 py-3.5 rounded-full text-sm font-bold uppercase tracking-wider hover:bg-[#ff3e6c]/90 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#ff3e6c]/30 transition-all duration-300 w-full justify-center sm:w-auto"
                    >
                        <ShoppingBag size={18} className="group-hover:rotate-12 transition-transform duration-300" />
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    if (loadingProducts) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-7xl animate-pulse">
                <div className="flex items-center gap-2 mb-8">
                    <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded"></div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
                    {[1, 2, 3, 4, 5].map((n) => (
                        <div key={n} className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
                            <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-700 w-full mb-3"></div>
                            <div className="p-3 space-y-3 pb-4">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="flex items-center gap-2 mb-8">
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 uppercase">My Wishlist</h1>
                <span className="text-gray-500 dark:text-gray-400 font-medium">{loadingProducts ? wishlistItems.length : displayProducts.length} items</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 lg:gap-8">
                <AnimatePresence mode="popLayout">
                    {displayProducts.map((product) => (
                        <motion.div
                            key={product.id || product._id}
                            layout
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                            className="group flex flex-col bg-white dark:bg-gray-800 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-gray-200/50 dark:hover:shadow-black/40 border border-transparent hover:border-gray-100 dark:hover:border-gray-700 transition-all duration-500 transform hover:-translate-y-2"
                        >
                            {/* Image Container */}
                            <div className="relative aspect-[4/5] bg-gray-50 dark:bg-gray-900 overflow-hidden">
                                <Image
                                    fill
                                    src={formatImageUrl(product.image || "/placeholder.jpg")}
                                    alt={product.name}
                                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                                    unoptimized={(product.image || "").startsWith("http")}
                                />

                                {/* Top Actions Overlay */}
                                <div className="absolute top-0 left-0 right-0 p-3 flex justify-end items-start opacity-0 -translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out z-10">
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            removeFromWishlist(product.id || product._id);
                                        }}
                                        className="p-2.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-full text-gray-400 hover:text-rose-500 hover:bg-white shadow-sm transition-all duration-200 hover:scale-110"
                                        title="Remove from Wishlist"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                {/* Bottom Actions Overlay (Slide Up) */}
                                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400 ease-out flex justify-center z-10">
                                    <Link
                                        href={`${ROUTES.PRODUCT}/${product.id || product._id}`}
                                        className="w-full flex items-center justify-center gap-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md text-[#ff3e6c] py-3 px-4 font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-lg hover:bg-[#ff3e6c] hover:text-white transition-all duration-300"
                                    >
                                        <ShoppingBag size={16} className="shrink-0" />
                                        <span>Move to Bag</span>
                                    </Link>
                                </div>

                                {/* Subtle gradient overlay to ensure text/buttons are visible */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                            </div>

                            {/* Product Info */}
                            <div className="p-4 flex flex-col flex-1 bg-white dark:bg-gray-800 z-20">
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate group-hover:text-[#ff3e6c] transition-colors duration-300">
                                    {product.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-base font-bold text-gray-900 dark:text-gray-100">
                                        {formatPrice(product.price)}
                                    </span>
                                    {product.originalPrice && product.originalPrice > product.price && (
                                        <span className="text-xs font-medium text-gray-400 dark:text-gray-500 line-through decoration-gray-300 dark:decoration-gray-600">
                                            {formatPrice(product.originalPrice)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
