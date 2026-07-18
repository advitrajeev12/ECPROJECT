"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { ROUTES } from "@/lib/routes";
import { formatImageUrl } from "@/lib/utils";
import toast from "react-hot-toast";
import axios from "axios";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Cart() {
    const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
    const { formatPrice } = useCurrency();
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const handleCheckout = () => {
        if (!user) {
            toast.error("Please login to proceed with checkout.");
            router.push(ROUTES.LOGIN);
            return;
        }
        setIsCheckingOut(true);
        router.push(ROUTES.CHECKOUT);
    };

    useEffect(() => {
        if (!loading && !user) {
            router.push(ROUTES.LOGIN);
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900 transition-colors">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-900/50 px-4 transition-colors">
                <div className="bg-white dark:bg-gray-800 p-12 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center max-w-lg w-full text-center hover:shadow-md transition-shadow">
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-[#ff3e6c]/20 rounded-full blur-xl animate-pulse"></div>
                        <div className="relative w-24 h-24 bg-rose-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center text-[#ff3e6c]">
                            <ShoppingBag size={40} className="fill-current" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 tracking-tight">Your Bag is Empty</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-10 leading-relaxed max-w-sm">
                        Looks like you haven&apos;t added anything to your bag yet. Explore our handcrafted collections today.
                    </p>
                    <Link
                        href={ROUTES.HOME}
                        className="group flex flex-row gap-2 items-center bg-[#ff3e6c] text-white px-8 py-3.5 rounded-full text-sm font-bold uppercase tracking-wider hover:bg-[#ff3e6c]/90 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#ff3e6c]/30 transition-all duration-300 w-full justify-center sm:w-auto"
                    >
                        <ShoppingBag size={18} className="group-hover:rotate-12 transition-transform duration-300" />
                        Explore Products
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 lg:py-12 max-w-6xl">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 border-b dark:border-gray-800 pb-4">Shopping Bag</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-6">
                    <AnimatePresence mode="popLayout">
                        {cartItems.map((item) => (
                            <motion.div
                                key={`${item.id || item._id}-${item.size}-${item.color}`}
                                layout
                                initial={{ opacity: 0, scale: 0.95, x: -20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="flex flex-col sm:flex-row gap-6 bg-white dark:bg-gray-800 p-6 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow relative group"
                            >
                                <button
                                    onClick={() => removeFromCart(item.id || item._id, item.size, item.color)}
                                    className="absolute top-4 right-4 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={18} />
                                </button>

                                <div className="w-32 h-40 relative flex-shrink-0 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
                                    <Image
                                        fill
                                        src={formatImageUrl(item.image || "/placeholder.jpg")}
                                        alt={item.name}
                                        className="object-cover"
                                        unoptimized={(item.image || "").startsWith("http")}
                                    />
                                </div>

                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1 leading-tight">{item.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 truncate max-w-md">{item.description}</p>

                                        <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-300 mb-4 bg-gray-50 dark:bg-gray-900 p-2 border dark:border-gray-700 inline-flex rounded">
                                            {item.size && (
                                                <span className="flex items-center gap-1 font-medium">
                                                    Size: <strong className="text-gray-900 dark:text-white uppercase">{item.size}</strong>
                                                </span>
                                            )}
                                            {item.color && (
                                                <span className="flex items-center gap-1 font-medium border-l border-gray-300 dark:border-gray-700 pl-4">
                                                    Color: <strong className="text-gray-900 dark:text-white capitalize">{item.color}</strong>
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-end justify-between mt-auto">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Qty</span>
                                            <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded overflow-hidden">
                                                <button
                                                    onClick={() => updateQuantity(item.id || item._id, item.size, item.color, Math.max(1, item.quantity - 1))}
                                                    className="w-8 h-8 flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors active:scale-95"
                                                >
                                                    -
                                                </button>
                                                <span className="w-10 text-center font-semibold text-sm dark:text-gray-200">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id || item._id, item.size, item.color, item.quantity + 1)}
                                                    className="w-8 h-8 flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors active:scale-95"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                            {formatPrice(item.price * item.quantity)}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <div className="lg:col-span-1 border border-gray-200 dark:border-gray-800 rounded-xl p-6 bg-gray-50 dark:bg-gray-900 sticky top-24">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 uppercase tracking-wide">Price Details ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</h3>

                    <div className="space-y-4 mb-6 border-b border-gray-200 dark:border-gray-800 pb-6">
                        {/* Itemized Billing List */}
                        {cartItems.map((item) => (
                            <div key={`summary-${item.id || item._id}-${item.size}-${item.color}`} className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                <span className="truncate max-w-[180px]" title={item.name}>
                                    {item.quantity} x {item.name}
                                </span>
                                <span>{formatPrice(item.price * item.quantity)}</span>
                            </div>
                        ))}

                        <div className="flex justify-between text-gray-800 dark:text-gray-300 font-medium pt-3 mt-3 border-t border-dashed border-gray-200 dark:border-gray-700">
                            <span>Total MRP</span>
                            <span>{formatPrice(getCartTotal())}</span>
                        </div>
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                            <span>Discount on MRP</span>
                            <span className="text-green-500 dark:text-[#4ade80] font-medium">- {formatPrice(0)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                            <span>Convenience Fee</span>
                            <span className="text-green-500 dark:text-[#4ade80] font-medium tracking-wide">FREE</span>
                        </div>
                    </div>

                    <div className="flex justify-between font-bold text-xl text-gray-900 dark:text-gray-100 mb-8">
                        <span>Total Amount</span>
                        <span>{formatPrice(getCartTotal())}</span>
                    </div>

                    <button
                        onClick={handleCheckout}
                        disabled={isCheckingOut}
                        className="w-full bg-[#ff3e6c] hover:bg-[#ff2a5f] text-white py-4 rounded-md font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-[#ff3e6c]/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                        {isCheckingOut ? "Processing..." : (
                            <>Place Order <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
