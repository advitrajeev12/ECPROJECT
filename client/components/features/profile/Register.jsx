"use client";
import React, { useState } from "react";
import { AiOutlineClose, AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import { ROUTES } from "@/lib/routes";

const Register = () => {
    const { signup, sendSignupOtp } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        mobile: "",
        email: "",
        password: "",
        otp: ""
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState(1); // 1 = details, 2 = otp
    const [successMsg, setSuccessMsg] = useState("");
    const [generalError, setGeneralError] = useState("");

    // ── Validation ──────────────────────────────────────────────────────────────
    const validateStep1 = () => {
        const newErrors = {};
        const { name, mobile, email, password } = formData;

        if (!name.trim()) newErrors.name = "Full Name is required!";
        if (!mobile) {
            newErrors.mobile = "Mobile number is required!";
        } else if (!/^[6-9]\d{9}$/.test(mobile)) {
            newErrors.mobile = "Enter a valid 10-digit Indian mobile number!";
        }
        if (!email) {
            newErrors.email = "Email is required!";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Enter a valid email address!";
        }
        if (!password) {
            newErrors.password = "Password is required!";
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters!";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors = {};
        if (!formData.otp || formData.otp.length < 6) {
            newErrors.otp = "Enter a valid 6-digit OTP";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ── Handlers ────────────────────────────────────────────────────────────────
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
        setFormData({ ...formData, [name]: value });
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        if (!validateStep1()) return;

        setLoading(true);
        setGeneralError("");
        setSuccessMsg("");
        try {
            const res = await sendSignupOtp(formData.mobile);
            if (res.success) {
                setStep(2);
                setSuccessMsg(res.devOtp ? `OTP sent to +91 ${formData.mobile} (Dev OTP: ${res.devOtp})` : `OTP sent to +91 ${formData.mobile}`);
            } else {
                setGeneralError(res.message || "Failed to send OTP.");
            }
        } catch (error) {
            setGeneralError("Error sending OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep2()) return;

        setLoading(true);
        setGeneralError("");
        setSuccessMsg("");
        try {
            const res = await signup(formData);
            if (res.success) {
                router.push(ROUTES.LOGIN);
            } else {
                setGeneralError(res.message || "Registration failed.");
            }
        } catch (error) {
            setGeneralError(error.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            {/* Backdrop — no click-away; use ✕ button to close */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />

            {/* Modal Content */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden flex flex-col transform transition-all scale-100 animate-fadeIn">

                {/* Close Button */}
                <button
                    type="button"
                    className="absolute top-4 right-4 z-20 p-2 bg-gray-100/50 hover:bg-gray-100 text-gray-500 hover:text-gray-900 rounded-full transition-colors"
                    onClick={() => router.push(ROUTES.HOME)}
                    aria-label="Close registration"
                >
                    <AiOutlineClose size={20} />
                </button>

                {/* Header */}
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-8 text-center pb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
                    <p className="text-gray-500 text-sm mt-1">
                        {step === 1 ? "Join Baljyoti and start shopping" : "Verify your mobile number"}
                    </p>
                </div>

                <div className="p-8 pt-0">
                    <form onSubmit={step === 1 ? handleSendOTP : handleSubmit} className="space-y-4 mt-6">
                        {step === 1 ? (
                            <>
                                {/* Name */}
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="John Doe"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>

                                {/* Mobile */}
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mobile Number</label>
                                    <div className="flex bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                                        <span className="px-3 py-3 text-gray-500 font-medium border-r border-gray-200 bg-gray-100 text-sm">+91</span>
                                        <input
                                            type="tel"
                                            name="mobile"
                                            placeholder="98765 43210"
                                            className="flex-1 bg-transparent px-4 py-3 outline-none text-gray-900 placeholder:text-gray-400"
                                            value={formData.mobile}
                                            onChange={handleChange}
                                            maxLength="10"
                                        />
                                    </div>
                                    {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
                                </div>

                                {/* Email */}
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="john@example.com"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>

                                {/* Password */}
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            placeholder="Min 6 chars"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all pr-10"
                                            value={formData.password}
                                            onChange={handleChange}
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-gray-800 hover:-translate-y-0.5 transition-all duration-300 mt-2 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                                >
                                    {loading ? "Please wait..." : "Continue to OTP Verification"}
                                </button>
                            </>
                        ) : (
                            <>
                                {/* OTP */}
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Enter OTP</label>
                                    <p className="text-sm text-gray-600 mb-2">Code sent to <b>+91 {formData.mobile}</b></p>
                                    <input
                                        type="text"
                                        name="otp"
                                        placeholder="6-digit OTP"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-center tracking-widest text-lg font-bold text-gray-900"
                                        value={formData.otp}
                                        onChange={handleChange}
                                        maxLength="6"
                                    />
                                    {errors.otp && <p className="text-red-500 text-xs mt-1 text-center">{errors.otp}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-gray-800 hover:-translate-y-0.5 transition-all duration-300 mt-2 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                                >
                                    {loading ? "Verifying..." : "Verify & Create Account"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => { setStep(1); setErrors({}); setGeneralError(""); }}
                                    className="w-full text-center text-sm font-medium text-gray-500 hover:text-primary mt-2"
                                >
                                    Back to details
                                </button>
                            </>
                        )}
                    </form>

                    {/* Inline messages */}
                    {successMsg && (
                        <div className="mt-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl text-center font-medium">
                            ✅ {successMsg}
                        </div>
                    )}
                    {generalError && (
                        <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl text-center font-medium">
                            {generalError}
                        </div>
                    )}

                    <div className="text-center mt-6 pt-4 border-t border-gray-100">
                        <p className="text-gray-500 text-sm">
                            Already have an account?{" "}
                            <Link href={ROUTES.LOGIN} className="text-primary font-bold hover:underline">
                                Login Here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

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

export default Register;
