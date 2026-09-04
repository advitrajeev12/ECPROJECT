"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";

const AuthContext = createContext();
const API_URL = "";

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

    // ── STEP 1: Send OTP via Fast2SMS ──────────────────────────────────────────
    const sendOtp = async (mobile) => {
        try {
            const res = await axios.post(`${API_URL}/api/users/send-otp`, { mobile });
            return { 
                success: true, 
                message: res.data.message || "OTP sent successfully", 
                devOtp: res.data.devOtp 
            };
        } catch (error) {
            console.error("[AuthContext] sendOtp error:", error.response?.data?.message || error.message);
            return { 
                success: false, 
                message: error.response?.data?.message || error.message || "Failed to send OTP" 
            };
        }
    };

    // ── STEP 1b: Resend OTP ────────────────────────────────────────────────────
    const resendOtp = async (mobile) => {
        return sendOtp(mobile);
    };

    // ── STEP 2: Verify Fast2SMS OTP + Backend Login ────────────────────────────
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
                message: error.response?.data?.message || error.message || "OTP verification failed"
            };
        }
    };

    // ── Signup: Send OTP (same as sendOtp) ────────────────────────────────────
    const sendSignupOtp = async (mobile) => sendOtp(mobile);

    // ── Signup: Verify Fast2SMS OTP + Backend Account Creation ───────────────
    const signup = async (userData) => {
        try {
            const res = await axios.post(
                `${API_URL}/api/users/signup`,
                userData,
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
