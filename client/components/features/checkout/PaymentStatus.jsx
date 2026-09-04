"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { CheckCircle2, XCircle, ShoppingBag, ArrowRight, RefreshCw } from "lucide-react";
import { useCart } from "@/context/CartContext";

// This page is kept for any direct navigation to /user/payment/status.
// With Razorpay's modal flow, payment verification is handled inline in Checkout.jsx.
// This page simply reflects the status passed via query params (?status=success|failed).

function StatusContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const statusParam = searchParams.get("status"); // "success" | "failed"
    const { clearCart } = useCart();

    const [countdown, setCountdown] = useState(5);

    const status = statusParam === "success" ? "success" : statusParam === "failed" ? "failed" : null;

    // If no status param, redirect to profile
    useEffect(() => {
        if (!status) {
            router.push(ROUTES.PROFILE);
        }
    }, [status, router]);

    // Clear cart on success
    useEffect(() => {
        if (status === "success") {
            clearCart();
        }
    }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

    // Countdown auto-redirect after success
    useEffect(() => {
        if (status !== "success") return;
        if (countdown <= 0) {
            router.push(ROUTES.HOME);
            return;
        }
        const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [status, countdown, router]);

    if (!status) return null;

    return (
        <div className="min-h-[80vh] flex flex-col justify-center items-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 max-w-md w-full overflow-hidden">

                {/* Success State */}
                {status === "success" && (
                    <div className="flex flex-col items-center text-center">
                        {/* Green Header Band */}
                        <div className="w-full bg-gradient-to-br from-emerald-500 to-teal-500 py-10 px-6 flex flex-col items-center gap-3">
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-12 h-12 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Payment Successful!</h2>
                            <p className="text-emerald-100 text-sm">Your order has been placed &amp; confirmed.</p>
                        </div>

                        <div className="p-8 w-full flex flex-col items-center gap-6">
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <ShoppingBag size={16} />
                                <span>
                                    Redirecting to home in{" "}
                                    <span className="font-bold text-gray-800">{countdown}s</span>
                                </span>
                            </div>

                            <button
                                onClick={() => router.push(ROUTES.HOME)}
                                className="w-full bg-gradient-to-r from-[#3395FF] to-[#5badff] text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                            >
                                Go to Home <ArrowRight size={16} />
                            </button>

                            <button
                                onClick={() => router.push(ROUTES.PROFILE)}
                                className="text-sm text-gray-500 hover:text-gray-800 transition-colors underline underline-offset-2"
                            >
                                View My Orders
                            </button>
                        </div>
                    </div>
                )}

                {/* Failed State */}
                {status === "failed" && (
                    <div className="flex flex-col items-center text-center">
                        {/* Red Header Band */}
                        <div className="w-full bg-gradient-to-br from-rose-500 to-red-500 py-10 px-6 flex flex-col items-center gap-3">
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                                <XCircle className="w-12 h-12 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Payment Failed</h2>
                            <p className="text-rose-100 text-sm">We couldn&apos;t process your payment.</p>
                        </div>

                        <div className="p-8 w-full flex flex-col items-center gap-5">
                            <div className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs text-gray-500 leading-relaxed">
                                If any amount was deducted from your account, it will be automatically refunded within{" "}
                                <span className="font-semibold text-gray-700">3–5 business days</span> by Razorpay.
                            </div>

                            <button
                                onClick={() => router.push(ROUTES.CHECKOUT)}
                                className="w-full bg-gradient-to-r from-[#ff3e6c] to-[#ff6b8a] text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                            >
                                <RefreshCw size={16} /> Try Again
                            </button>

                            <button
                                onClick={() => router.push(ROUTES.HOME)}
                                className="text-sm text-gray-500 hover:text-gray-800 transition-colors underline underline-offset-2"
                            >
                                Return to Home
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function PaymentStatus() {
    return (
        <Suspense
            fallback={
                <div className="min-h-[80vh] flex justify-center items-center bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3395FF]" />
                </div>
            }
        >
            <StatusContent />
        </Suspense>
    );
}
