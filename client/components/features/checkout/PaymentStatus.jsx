"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { CheckCircle2, XCircle, ShoppingBag, ArrowRight, RefreshCw } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

function StatusContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const transactionId = searchParams.get("transactionId");
    const isSimulated = searchParams.get("sim") === "1";

    const { user, loading } = useAuth();
    const { clearCart } = useCart();

    const [status, setStatus] = useState("processing"); // processing | success | failed
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        if (!transactionId) {
            router.push(ROUTES.PROFILE);
            return;
        }

        const checkStatus = async () => {
            try {
                const url = `/api/orders/razorpay/status/${transactionId}${isSimulated ? "?sim=1" : ""}`;
                const res = await axios.get(url, { withCredentials: true });

                if (res.data.success) {
                    setStatus("success");
                    clearCart(); // Clear cart on successful payment
                } else {
                    setStatus("failed");
                }
            } catch (error) {
                console.error("Payment status check failed", error);
                setStatus("failed");
            }
        };

        if (user && !loading) {
            checkStatus();
        }
    }, [transactionId, user, loading]); // eslint-disable-line react-hooks/exhaustive-deps

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

    return (
        <div className="min-h-[80vh] flex flex-col justify-center items-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 max-w-md w-full overflow-hidden">

                {/* Processing State */}
                {status === "processing" && (
                    <div className="p-10 flex flex-col items-center gap-5 text-center">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full border-4 border-gray-100 flex items-center justify-center">
                                <div className="w-16 h-16 rounded-full border-4 border-t-[#5f259f] border-r-[#5f259f] border-b-transparent border-l-transparent animate-spin" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-2">Verifying Payment</h2>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Please wait while we confirm your transaction.<br />
                                <span className="font-medium text-gray-700">Do not refresh or close this page.</span>
                            </p>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#5f259f] to-[#8b44d4] rounded-full animate-pulse w-3/4" />
                        </div>
                    </div>
                )}

                {/* Success State */}
                {status === "success" && (
                    <div className="flex flex-col items-center text-center">
                        {/* Green Header Band */}
                        <div className="w-full bg-gradient-to-br from-emerald-500 to-teal-500 py-10 px-6 flex flex-col items-center gap-3">
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center animate-bounce-once">
                                <CheckCircle2 className="w-12 h-12 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Payment Successful!</h2>
                            <p className="text-emerald-100 text-sm">Your order has been placed & confirmed.</p>
                        </div>

                        <div className="p-8 w-full flex flex-col items-center gap-6">
                            {isSimulated && (
                                <div className="w-full bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 font-medium">
                                    🧪 Simulated payment — order marked as paid (no real transaction)
                                </div>
                            )}

                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <ShoppingBag size={16} />
                                <span>
                                    Redirecting to home in{" "}
                                    <span className="font-bold text-gray-800">{countdown}s</span>
                                </span>
                            </div>

                            <button
                                onClick={() => router.push(ROUTES.HOME)}
                                className="w-full bg-gradient-to-r from-[#5f259f] to-[#8b44d4] text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
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
                            <p className="text-rose-100 text-sm">We couldn&apos;t verify your transaction.</p>
                        </div>

                        <div className="p-8 w-full flex flex-col items-center gap-5">
                            <div className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs text-gray-500 leading-relaxed">
                                If any amount was deducted from your account, it will be automatically refunded within{" "}
                                <span className="font-semibold text-gray-700">3–5 business days</span>.
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

            {/* Transaction ID footnote */}
            {transactionId && (
                <p className="mt-6 text-xs text-gray-400 font-mono">
                    Transaction ID: {transactionId}
                </p>
            )}
        </div>
    );
}

export default function PaymentStatus() {
    return (
        <Suspense
            fallback={
                <div className="min-h-[80vh] flex justify-center items-center bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5f259f]" />
                </div>
            }
        >
            <StatusContent />
        </Suspense>
    );
}
