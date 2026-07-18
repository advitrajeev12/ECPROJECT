"use client";
import React, { useState } from "react";
import { AiOutlineClose, AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import { ROUTES } from "@/lib/routes";

const Login = () => {
    const { loginWithOtp, sendOtp, login: loginWithPassword } = useAuth();
    const router = useRouter();

    // Login Method state
    const [loginMethod, setLoginMethod] = useState("otp"); // 'otp' or 'password'

    // OTP State
    const [mobile, setMobile] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);

    // Password State
    const [passwordForm, setPasswordForm] = useState({
        identifier: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);

    // Common State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [otpSuccessMsg, setOtpSuccessMsg] = useState("");

    // ── OTP Handlers ────────────────────────────────────────────────────────────
    const handleGetOTP = async (e) => {
        if (e) e.preventDefault();

        if (!/^[6-9]\d{9}$/.test(mobile)) {
            setError("Enter a valid 10-digit Indian mobile number");
            return;
        }

        setLoading(true);
        setError("");
        setOtpSuccessMsg("");
        try {
            const res = await sendOtp(mobile);
            if (res.success) {
                setOtpSent(true);
                setOtpSuccessMsg(`OTP sent to +91 ${mobile}`);
            } else {
                setError(res.message || "Failed to send OTP");
            }
        } catch (err) {
            setError(err.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        if (e) e.preventDefault();

        if (otp.length < 4) {
            setError("Enter a valid OTP");
            return;
        }

        setLoading(true);
        setError("");
        try {
            const res = await loginWithOtp(mobile, otp);
            if (res.success) {
                router.push(ROUTES.HOME);
            } else {
                setError(res.message);
            }
        } catch (err) {
            setError(err.message || "Verification failed");
        } finally {
            setLoading(false);
        }
    };

    // ── Password Handlers ───────────────────────────────────────────────────────
    const handlePasswordChange = (e) => {
        setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
        setError("");
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (!passwordForm.identifier || !passwordForm.password) {
            setError("Please fill in all fields");
            return;
        }

        setLoading(true);
        setError("");
        try {
            const res = await loginWithPassword(passwordForm.identifier, passwordForm.password);
            if (res.success) {
                router.push(ROUTES.HOME);
            } else {
                setError(res.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    // ── Form submit dispatcher for OTP form ─────────────────────────────────────
    const handleOtpFormSubmit = (e) => {
        e.preventDefault();
        if (!otpSent) {
            handleGetOTP();
        } else {
            handleVerifyOTP();
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-3 sm:p-4">
            {/* Backdrop — no click-away; use ✕ button to close */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />

            {/* Modal Content */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden flex flex-col transform transition-all scale-100">

                {/* Close Button */}
                <button
                    type="button"
                    className="absolute top-4 right-4 z-20 p-2 bg-gray-100/50 hover:bg-gray-100 text-gray-500 hover:text-gray-900 rounded-full transition-colors"
                    onClick={() => router.push(ROUTES.HOME)}
                >
                    <AiOutlineClose size={20} />
                </button>

                {/* Header */}
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 md:p-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
                    <p className="text-gray-500 text-sm mt-1">
                        {loginMethod === "otp" ? "Login with your mobile number" : "Login with your credentials"}
                    </p>
                </div>

                <div className="p-6 md:p-8 pt-6">
                    {/* Toggle Switch */}
                    <div className="flex p-1 bg-gray-100 rounded-xl mb-8 relative">
                        <div
                            className={`absolute inset-y-1 w-1/2 bg-white rounded-lg shadow-sm transition-all duration-300 ease-out transform ${loginMethod === "password" ? "translate-x-full left-auto right-1" : "left-1"}`}
                        />
                        <button
                            type="button"
                            className={`flex-1 relative z-10 py-2.5 text-sm font-medium transition-colors duration-300 ${loginMethod === "otp" ? "text-gray-900" : "text-gray-500"}`}
                            onClick={() => { setLoginMethod("otp"); setError(""); }}
                        >
                            OTP Login
                        </button>
                        <button
                            type="button"
                            className={`flex-1 relative z-10 py-2.5 text-sm font-medium transition-colors duration-300 ${loginMethod === "password" ? "text-gray-900" : "text-gray-500"}`}
                            onClick={() => { setLoginMethod("password"); setError(""); }}
                        >
                            Password
                        </button>
                    </div>

                    {loginMethod === "otp" ? (
                        /* ── OTP Login Form ─────────────────────────────────── */
                        <form onSubmit={handleOtpFormSubmit} className="space-y-5 animate-fadeIn">
                            {!otpSent ? (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mobile Number</label>
                                        <div className="flex bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                                            <span className="px-4 py-3 text-gray-500 font-medium border-r border-gray-200">+91</span>
                                            <input
                                                type="text"
                                                placeholder="98765 43210"
                                                className="flex-1 bg-transparent px-4 py-3 outline-none text-gray-900 font-medium placeholder:text-gray-400"
                                                value={mobile}
                                                onChange={(e) => setMobile(e.target.value)}
                                                maxLength="10"
                                            />
                                        </div>
                                    </div>
                                    {error && <p className="text-red-500 text-sm flex items-center gap-1">⚠️ {error}</p>}
                                    {otpSuccessMsg && (
                                        <p className="text-green-600 text-sm flex items-center gap-1 font-medium">✅ {otpSuccessMsg}</p>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-gray-800 hover:-translate-y-0.5 transition-all duration-300 ${loading ? "opacity-70" : ""}`}
                                    >
                                        {loading ? "Sending OTP..." : "Get OTP"}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="text-center mb-4">
                                        <p className="text-sm text-gray-600">Enter the code sent to</p>
                                        <p className="font-bold text-gray-900 text-lg">+91 {mobile}</p>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="• • • • • •"
                                        className="w-full text-center text-3xl tracking-widest py-4 border-b-2 border-gray-200 focus:border-primary outline-none focus:ring-0 transition-colors bg-transparent"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        maxLength="6"
                                    />
                                    {error && <p className="text-red-500 text-sm mt-2 text-center">⚠️ {error}</p>}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`w-full bg-primary text-white py-3.5 rounded-xl font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-300 mt-6 ${loading ? "opacity-70" : ""}`}
                                    >
                                        {loading ? "Verifying..." : "Verify & Login"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setOtpSent(false); setOtp(""); setError(""); setOtpSuccessMsg(""); }}
                                        className="w-full text-gray-500 text-sm mt-4 hover:text-gray-800 transition-colors"
                                    >
                                        Change Number
                                    </button>
                                </>
                            )}
                        </form>
                    ) : (
                        /* ── Password Login Form ────────────────────────────── */
                        <form onSubmit={handlePasswordSubmit} className="space-y-5 animate-fadeIn">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email or Mobile</label>
                                <input
                                    type="text"
                                    name="identifier"
                                    placeholder="Enter your email"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    value={passwordForm.identifier}
                                    onChange={handlePasswordChange}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="••••••••"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all pr-10"
                                        value={passwordForm.password}
                                        onChange={handlePasswordChange}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                                    </button>
                                </div>
                                <div className="text-right">
                                    <a href="#" className="text-xs text-primary font-medium hover:underline">Forgot Password?</a>
                                </div>
                            </div>

                            {error && <p className="text-red-500 text-sm flex items-center gap-1 bg-red-50 p-3 rounded-lg">⚠️ {error}</p>}

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-gray-800 hover:-translate-y-0.5 transition-all duration-300 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                            >
                                {loading ? "Logging in..." : "Login Securely"}
                            </button>
                        </form>
                    )}

                    <div className="text-center mt-8 pt-6 border-t border-gray-100">
                        <p className="text-gray-500 text-sm">
                            Don&apos;t have an account?{" "}
                            <Link href={ROUTES.REGISTER} className="text-primary font-bold hover:underline">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Simple CSS Animation for fade in */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default Login;
