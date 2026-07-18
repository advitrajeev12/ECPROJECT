"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";

const AuthContext = createContext();
const API_URL = "";

// ─── MSG91 Config ───────────────────────────────────────────────────────────────
const MSG91_WIDGET_ID  = process.env.NEXT_PUBLIC_MSG91_WIDGET_ID  || "366770713237323830393539";
const MSG91_TOKEN_AUTH = process.env.NEXT_PUBLIC_MSG91_TOKEN_AUTH || "551060T6Xda2sFUz6a59e623P1";

const MSG91_SDK_URLS = [
    "https://verify.msg91.com/otp-provider.js",
    "https://verify.phone91.com/otp-provider.js"
];

// ─── Format mobile helper ────────────────────────────────────────────────────────
const formatMobileForMsg91 = (mobile) => {
    const digits = String(mobile).replace(/\D/g, "");
    if (digits.length === 10) return `91${digits}`;
    if (digits.length === 12 && digits.startsWith("91")) return digits;
    return digits;
};

// ─── Bootstrap MSG91 Widget ─────────────────────────────────────────────────────
const bootstrapMsg91Widget = () => {
    if (typeof window === "undefined") return;

    const configuration = {
        widgetId: MSG91_WIDGET_ID,
        tokenAuth: MSG91_TOKEN_AUTH,
        exposeMethods: true,
        success: (data) => {
            console.log("[MSG91 Widget] Verification success callback:", data);
        },
        failure: (error) => {
            console.error("[MSG91 Widget] Verification failure callback:", error);
        }
    };

    // Already loaded
    if (typeof window.initSendOTP === "function") {
        window.initSendOTP(configuration);
        console.log("[MSG91] Widget initialized.");
        return;
    }

    let urlIndex = 0;

    const onScriptLoaded = () => {
        if (typeof window.initSendOTP === "function") {
            window.initSendOTP(configuration);
            console.log("[MSG91] Widget loaded & initialized.");
        } else {
            console.warn("[MSG91] Script loaded but initSendOTP function not found.");
        }
    };

    const loadNext = () => {
        if (urlIndex >= MSG91_SDK_URLS.length) {
            console.error("[MSG91] All SDK URLs failed to load.");
            return;
        }

        const url = MSG91_SDK_URLS[urlIndex];
        const existing = document.querySelector(`script[src="${url}"]`);
        if (existing) {
            if (typeof window.initSendOTP === "function") {
                onScriptLoaded();
            } else {
                existing.addEventListener("load", onScriptLoaded, { once: true });
            }
            return;
        }

        const script = document.createElement("script");
        script.src = url;
        script.async = true;
        script.onload = onScriptLoaded;
        script.onerror = () => {
            urlIndex++;
            loadNext();
        };
        document.head.appendChild(script);
    };

    loadNext();
};

// ─── Wait for SDK method helper ────────────────────────────────────────────────
const waitForMethod = (methodName, maxAttempts = 35) => {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const interval = setInterval(() => {
            if (typeof window[methodName] === "function") {
                clearInterval(interval);
                resolve(window[methodName]);
            } else if (++attempts >= maxAttempts) {
                clearInterval(interval);
                reject(new Error(`MSG91 '${methodName}' not ready. Check your Widget configuration.`));
            }
        }, 100);
    });
};

export const AuthProvider = ({ children }) => {
    const [user, setUser]       = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkUserLoggedIn();
        bootstrapMsg91Widget();
    }, []);

    // ── Check if user is already logged in (via JWT cookie) ───────────────────
    const checkUserLoggedIn = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/users/check-auth`, {
                withCredentials: true
            });
            setUser(res.data.user);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // ── Password Login ─────────────────────────────────────────────────────────
    const loginWithPassword = async (identifier, password) => {
        try {
            const res = await axios.post(
                `${API_URL}/api/users/login`,
                { email: identifier, password },
                { withCredentials: true }
            );
            setUser(res.data.user);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Login failed"
            };
        }
    };

    // ── STEP 1: Send OTP via Widget Method ────────────────────────────────────
    const sendOtp = async (mobile) => {
        const formattedMobile = formatMobileForMsg91(mobile);
        try {
            const sendOtpFn = await waitForMethod("sendOtp");
            return await new Promise((resolve) => {
                sendOtpFn(
                    formattedMobile,
                    (data) => {
                        console.log("[MSG91 SDK] Send OTP success:", data);
                        resolve({ success: true, data });
                    },
                    (error) => {
                        console.error("[MSG91 SDK] Send OTP failure:", error);
                        resolve({ success: false, message: error?.message || "Failed to send OTP" });
                    }
                );
            });
        } catch (error) {
            console.error("[AuthContext] sendOtp error:", error.message);
            return { success: false, message: error.message };
        }
    };

    // ── STEP 1b: Resend OTP via Widget Method ─────────────────────────────────
    const resendOtp = async (mobile) => {
        return sendOtp(mobile);
    };

    // ── Helper to verify OTP via Widget and return Access Token ────────────────
    const verifyOtpAndGetToken = async (otp) => {
        const verifyOtpFn = await waitForMethod("verifyOtp");
        return await new Promise((resolve, reject) => {
            verifyOtpFn(
                otp,
                (data) => {
                    console.log("[MSG91 SDK] Verify OTP success:", data);
                    // Extract access token
                    const token = data?.token || data?.accessToken || (typeof data === "string" ? data : null);
                    if (!token) {
                        reject(new Error("OTP verified, but access token not found in response."));
                    } else {
                        resolve(token);
                    }
                },
                (error) => {
                    console.error("[MSG91 SDK] Verify OTP failure:", error);
                    reject(new Error(error?.message || "Invalid OTP. Please try again."));
                }
            );
        });
    };

    // ── STEP 2: Verify Widget OTP + Backend Login ──────────────────────────────
    const loginWithOtp = async (mobile, otp) => {
        try {
            const accessToken = await verifyOtpAndGetToken(otp);
            const res = await axios.post(
                `${API_URL}/api/users/verify-msg91-otp`,
                { accessToken },
                { withCredentials: true }
            );
            setUser(res.data.user);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || error.message || "OTP verification failed"
            };
        }
    };

    // ── Signup: Send OTP (same as sendOtp) ────────────────────────────────────
    const sendSignupOtp = async (mobile) => sendOtp(mobile);

    // ── Signup: Verify Widget OTP + Backend Account Creation ─────────────────
    const signup = async (userData) => {
        try {
            const accessToken = await verifyOtpAndGetToken(userData.otp);
            const res = await axios.post(
                `${API_URL}/api/users/signup`,
                { ...userData, msg91AccessToken: accessToken },
                { withCredentials: true }
            );
            return { success: true, message: res.data.message };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || error.message || "Signup failed"
            };
        }
    };

    // ── Logout ─────────────────────────────────────────────────────────────────
    const logout = async () => {
        try {
            await axios.get(`${API_URL}/api/users/logout`, { withCredentials: true });
            setUser(null);
            router.push(ROUTES.HOME);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                updateUser: setUser,
                login: loginWithPassword,
                loginWithOtp,
                sendOtp,
                resendOtp,
                sendSignupOtp,
                signup,
                logout,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
