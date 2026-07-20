"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";

const AuthContext = createContext();
const API_URL = "";

// OTP is verified entirely server-side (Twilio Verify), so there are NO OTP
// provider credentials or SDKs in the browser. The client just:
//   1. POST /api/users/send-otp   { mobile }
//   2. POST /api/users/verify-otp { mobile, otp }   (login)
//      POST /api/users/signup     { ...details, otp } (signup)

export const AuthProvider = ({ children }) => {
    const [user, setUser]       = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkUserLoggedIn();
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

    // ── STEP 1: Send OTP (backend → Twilio Verify) ────────────────────────────
    const sendOtp = async (mobile) => {
        try {
            const res = await axios.post(
                `${API_URL}/api/users/send-otp`,
                { mobile },
                { withCredentials: true }
            );
            return { success: true, mock: res.data?.mock === true, message: res.data?.message };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Failed to send OTP"
            };
        }
    };

    const resendOtp = async (mobile) => sendOtp(mobile);
    const sendSignupOtp = async (mobile) => sendOtp(mobile);

    // ── STEP 2: Verify OTP + Login ────────────────────────────────────────────
    const loginWithOtp = async (mobile, otp) => {
        try {
            const res = await axios.post(
                `${API_URL}/api/users/verify-otp`,
                { mobile, otp },
                { withCredentials: true }
            );
            setUser(res.data.user);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "OTP verification failed"
            };
        }
    };

    // ── Signup: create account after OTP verification ─────────────────────────
    const signup = async (userData) => {
        try {
            const res = await axios.post(
                `${API_URL}/api/users/signup`,
                {
                    name: userData.name,
                    email: userData.email,
                    password: userData.password,
                    mobile: userData.mobile,
                    otp: userData.otp,
                },
                { withCredentials: true }
            );
            return { success: true, message: res.data.message };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Signup failed"
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
