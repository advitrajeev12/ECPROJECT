"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ROUTES } from "@/lib/routes";
import { formatImageUrl } from "@/lib/utils";
import { User, Package, Heart, LogOut, MapPin, ChevronRight, ShoppingBag, Settings, Camera, Trash2, ShieldCheck, X, CheckCircle2, Clock, Truck, CreditCard, Wallet, Phone, Mail } from "lucide-react";
import { useWishlist } from "../../../context/WishlistContext";
import Link from "next/link";
import { generateInvoice } from "@/lib/invoiceGenerator";
import axios from "axios";

const ProfileDashboard = () => {
    const { user, updateUser, logout, loading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("profile");
    const { wishlistItems, removeFromWishlist } = useWishlist();

    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);

    // Profile Edit State
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editName, setEditName] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editMobile, setEditMobile] = useState("");
    const [emailChanged, setEmailChanged] = useState(false);

    // Address State
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [newAddress, setNewAddress] = useState({ street: '', city: '', state: '', zipCode: '', country: "India", isDefault: false });

    // Orders State
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Email OTP Verification State
    const [sendingOtp, setSendingOtp] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [emailOtp, setEmailOtp] = useState(['', '', '', '', '', '']); // 6-digit array
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    const otpRefs = React.useRef([]);

    // Handle segmented OTP input change
    const handleOtpChange = (index, value) => {
        // Only allow numbers
        if (value && !/^\d+$/.test(value)) return;

        const newOtp = [...emailOtp];
        
        // Handle paste
        if (value.length > 1) {
            const pastedData = value.substring(0, 6).split('');
            for (let i = 0; i < 6; i++) {
                if (pastedData[i]) newOtp[i] = pastedData[i];
            }
            setEmailOtp(newOtp);
            // Focus last filled box or last box
            const lastIndex = Math.min(index + pastedData.length - 1, 5);
            otpRefs.current[lastIndex]?.focus();
            return;
        }

        newOtp[index] = value;
        setEmailOtp(newOtp);

        // Move to next input if value is entered
        if (value && index < 5) {
            otpRefs.current[index + 1].focus();
        }
    };

    // Handle backspace
    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !emailOtp[index] && index > 0) {
            otpRefs.current[index - 1].focus();
        }
    };

    // Join OTP for submission
    const getFullOtp = () => emailOtp.join('');

    // Handle Resend OTP Timer
    React.useEffect(() => {
        let timer;
        if (resendTimer > 0) {
            timer = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendTimer]);


    React.useEffect(() => {
        // Only sync from the user object when NOT in edit mode.
        // Without this guard, any context update (cart, wishlist, etc.) that
        // causes a new `user` reference will wipe whatever the user has typed.
        if (user && !isEditingProfile) {
            setEditName(user.name || "");
            setEditEmail(user.email || "");
            setEditMobile(user.mobile || "");
        }
    }, [user, isEditingProfile]);

    const handleSaveProfile = async () => {
        try {
            const payload = { name: editName, mobile: editMobile };
            // Only send email if user actually changed it
            if (editEmail.trim() && editEmail.trim().toLowerCase() !== user.email.toLowerCase()) {
                payload.email = editEmail.trim();
            }
            const res = await axios.put("/api/users/profile", payload, { withCredentials: true });
            if (res.data.success) {
                const emailWasChanged = payload.email && payload.email !== user.email;
                updateUser(res.data.user);
                setIsEditingProfile(false);
                if (emailWasChanged) {
                    setEmailChanged(true);
                    setOtpSent(false);
                    setEmailOtp(['', '', '', '', '', '']);
                    toast.success("Email updated! Please verify your new address.");
                } else {
                    toast.success("Profile updated successfully");
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update profile");
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("/api/users/addresses", newAddress, { withCredentials: true });
            if (res.data.success) {
                updateUser(res.data.user);
                setIsAddingAddress(false);
                setNewAddress({ street: '', city: '', state: '', zipCode: '', country: "India", isDefault: false });
                toast.success("Address added successfully");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add address");
        }
    };

    const handleDeleteAddress = async (id) => {
        try {
            const res = await axios.delete(`/api/users/addresses/${id}`, { withCredentials: true });
            if (res.data.success) {
                updateUser(res.data.user);
                toast.success("Address removed");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete address");
        }
    };

    const handleSendEmailOtp = async () => {
        if (sendingOtp || resendTimer > 0) return; // Prevent concurrent calls or calling during cooldown
        
        setSendingOtp(true);
        try {
            const res = await axios.post('/api/users/send-email-otp', {}, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);
                setOtpSent(true);
                setEmailOtp(['', '', '', '', '', '']);
                setResendTimer(30); // Start 30s cooldown
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            if (error.response?.status === 429) {
                // If OTP was already sent, just move to the OTP input screen
                // instead of showing a blocking error
                toast.success('OTP has already been sent. Please check your inbox!');
                setOtpSent(true);
                setResendTimer(30);
            } else {
                toast.error(error.response?.data?.message || 'Failed to send OTP');
            }
        } finally {
            setSendingOtp(false);
        }
    };

    const handleVerifyEmailOtp = async () => {
        const fullOtp = getFullOtp();
        if (fullOtp.length !== 6) {
            toast.error('Please enter the 6-digit OTP');
            return;
        }
        setVerifyingOtp(true);
        try {
            const res = await axios.post('/api/users/verify-email-otp', { otp: fullOtp }, { withCredentials: true });
            if (res.data.success) {
                updateUser(res.data.user);
                setOtpSent(false);
                setEmailOtp(['', '', '', '', '', '']);
                toast.success('🎉 Email verified successfully!');
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Verification failed');
        } finally {
            setVerifyingOtp(false);
        }
    };

    React.useEffect(() => {
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

    React.useEffect(() => {
        if (activeTab === "orders" && orders.length === 0) {
            const fetchOrders = async () => {
                setLoadingOrders(true);
                try {
                    const res = await axios.get("/api/orders/myorders", { withCredentials: true });
                    if (res.data.success) {
                        setOrders(res.data.orders);
                    }
                } catch (error) {
                    toast.error("Failed to fetch order history");
                } finally {
                    setLoadingOrders(false);
                }
            };
            fetchOrders();
        }
    }, [activeTab]);

    const stringifiedWishlist = wishlistItems.map(String);
    const wishlistProducts = products.filter(product => stringifiedWishlist.includes(String(product.id || product._id)));

    React.useEffect(() => {
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

    const navItems = [
        { id: "profile", icon: User, label: "My Profile" },
        { id: "orders", icon: Package, label: "My Orders" },
        { id: "wishlist", icon: Heart, label: "Wishlist", badge: (!loadingProducts && wishlistProducts.length > 0) ? wishlistProducts.length : null },
        { id: "address", icon: MapPin, label: "Addresses" },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case "profile":
                return (
                    <div className="animate-fade-in">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* Cover Banner */}
                            <div className="h-32 bg-gradient-to-r from-primary/80 to-primary/40 relative"></div>

                            <div className="px-5 sm:px-8 pb-5 sm:pb-8">
                                <div className="relative flex flex-col sm:flex-row justify-between items-center sm:items-end -mt-12 mb-6 gap-4 sm:gap-0">
                                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3 sm:gap-4 w-full sm:w-auto">
                                        <div className="relative shrink-0">
                                            <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg">
                                                <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-primary text-3xl font-bold uppercase">
                                                    {user.name?.charAt(0) || "U"}
                                                </div>
                                            </div>
                                            <button className="absolute bottom-0 right-1 p-1.5 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors shadow-md">
                                                <Camera size={14} />
                                            </button>
                                        </div>
                                        <div className="mb-0 sm:mb-2 text-center sm:text-left flex flex-col items-center sm:items-start w-full">
                                            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
                                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{user.name}</h2>
                                                {user.isEmailVerified && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold" title="Email Verified">
                                                        <ShieldCheck size={14} />
                                                        <span className="hidden sm:inline">Verified Account</span>
                                                        <span className="sm:hidden">Verified</span>
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm sm:text-base text-gray-500 break-all">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="mt-2 sm:mt-0 w-full sm:w-auto flex justify-center sm:justify-end">
                                        {isEditingProfile ? (
                                            <div className="flex gap-2 w-full sm:w-auto">
                                                <button
                                                    onClick={() => {
                                                        setIsEditingProfile(false);
                                                        setEditName(user.name);
                                                        setEditEmail(user.email || "");
                                                        setEditMobile(user.mobile || "");
                                                        setEmailChanged(false);
                                                    }}
                                                    className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleSaveProfile}
                                                    className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
                                                >
                                                    Save
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    // Seed fields fresh from the current user at open-time
                                                    setEditName(user.name || "");
                                                    setEditEmail(user.email || "");
                                                    setEditMobile(user.mobile || "");
                                                    setIsEditingProfile(true);
                                                }}
                                                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
                                            >
                                                Edit Profile
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Full Name</label>
                                                {isEditingProfile ? (
                                                    <input
                                                        type="text"
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                                    />
                                                ) : (
                                                    <p className="text-gray-900 font-medium mt-1">{user.name}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Address</label>
                                                <div className="mt-1">
                                                    {isEditingProfile ? (
                                                        <div className="space-y-2">
                                                            <input
                                                                type="email"
                                                                value={editEmail}
                                                                onChange={(e) => setEditEmail(e.target.value)}
                                                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm"
                                                                placeholder="Enter new email address"
                                                            />
                                                            {editEmail.trim().toLowerCase() !== user.email.toLowerCase() && editEmail.trim() && (
                                                                <p className="text-[11px] text-amber-600 flex items-center gap-1">
                                                                    ⚠️ Changing your email will require re-verification of the new address.
                                                                </p>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-3">
                                                            <p className="text-gray-900 font-medium">{user.email}</p>
                                                            {user.isEmailVerified ? (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wide">
                                                                    ✓ Verified
                                                                </span>
                                                            ) : (
                                                                <button
                                                                    onClick={handleSendEmailOtp}
                                                                    disabled={sendingOtp || resendTimer > 0}
                                                                    className="text-primary text-xs font-bold hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
                                                                >
                                                                    {sendingOtp ? 'Sending OTP...' : otpSent ? (resendTimer > 0 ? `Resend OTP (${resendTimer}s)` : 'Resend OTP') : 'Verify Email'}
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Re-verify nudge shown after email change */}
                                                    {emailChanged && !isEditingProfile && !user.isEmailVerified && (
                                                        <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                                                            <span className="text-amber-500 text-sm mt-0.5">📧</span>
                                                            <div>
                                                                <p className="text-xs text-amber-800 font-semibold">New email saved — verification required</p>
                                                                <p className="text-[11px] text-amber-600 mt-0.5">Click <strong>Verify Email</strong> above to verify <strong>{user.email}</strong>.</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Segmented OTP Input — shown after OTP is sent */}
                                                    {!user.isEmailVerified && otpSent && (
                                                        <div className="mt-3 p-4 bg-green-50/50 border border-green-200 rounded-xl space-y-4">
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-xs text-green-800 font-medium">
                                                                    📧 Verification code sent to your email
                                                                </p>
                                                                <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">
                                                                    Expires in 10m
                                                                </p>
                                                            </div>
                                                            
                                                            <div className="flex flex-col sm:flex-row gap-4">
                                                                <div className="flex gap-1.5 sm:gap-2 flex-1 justify-between max-w-full sm:max-w-[280px]">
                                                                    {emailOtp.map((digit, idx) => (
                                                                        <input
                                                                            key={idx}
                                                                            ref={(el) => (otpRefs.current[idx] = el)}
                                                                            type="text"
                                                                            inputMode="numeric"
                                                                            maxLength={idx === 0 ? 6 : 1}
                                                                            value={digit}
                                                                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                                                                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                                                            className="flex-1 sm:flex-none w-full sm:w-10 h-11 text-center text-lg sm:text-xl font-bold border border-green-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white transition-all shadow-sm max-w-[48px]"
                                                                        />
                                                                    ))}
                                                                </div>
                                                                <button
                                                                    onClick={handleVerifyEmailOtp}
                                                                    disabled={verifyingOtp || getFullOtp().length !== 6}
                                                                    className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
                                                                >
                                                                    {verifyingOtp ? 'Verifying...' : 'Verify Email'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mobile Number</label>
                                                {isEditingProfile ? (
                                                    <input
                                                        type="text"
                                                        value={editMobile}
                                                        onChange={(e) => setEditMobile(e.target.value)}
                                                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                                    />
                                                ) : (
                                                    <p className="text-gray-900 font-medium mt-1">{user.mobile || "Not provided"}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Account Settings</h3>
                                        <div className="space-y-3">
                                            <button className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors group">
                                                <span className="text-gray-700 font-medium">Change Password</span>
                                                <ChevronRight size={18} className="text-gray-400 group-hover:text-primary transition-colors" />
                                            </button>
                                            <button className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors group">
                                                <span className="text-gray-700 font-medium">Notification Preferences</span>
                                                <ChevronRight size={18} className="text-gray-400 group-hover:text-primary transition-colors" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case "orders":
                return (
                    <div className="animate-fade-in space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-bold text-gray-900">My Orders</h3>
                            <button className="text-sm text-primary font-medium hover:underline">View All Orders</button>
                        </div>

                        {loadingOrders ? (
                            <div className="space-y-4 animate-pulse">
                                {[1, 2].map(n => <div key={n} className="h-40 bg-gray-200 rounded-2xl"></div>)}
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                                <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Package size={40} />
                                </div>
                                <h4 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h4>
                                <p className="text-gray-500 mb-8 max-w-sm mx-auto">Looks like you haven&apos;t discovered our amazing collection yet. Start browsing to find something you love!</p>
                                <button
                                    onClick={() => router.push(ROUTES.HOME)}
                                    className="px-8 py-3 bg-primary text-white font-medium rounded-full shadow-lg shadow-primary/30 hover:bg-primary/90 hover:scale-105 transition-all duration-200 flex items-center gap-2 mx-auto"
                                >
                                    <ShoppingBag size={20} /> Start Shopping
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map(order => (
                                    <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-6 hover:border-primary/30 transition-colors">
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Order #{order._id.substring(0, 8)}</p>
                                                    <p className="text-sm text-gray-900 font-medium">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                    order.status === 'Processing' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {order.orderItems.map((item, i) => (
                                                    <div key={i} className="relative w-16 h-16 rounded-xl border border-gray-100 overflow-hidden bg-gray-50">
                                                        <Image src={formatImageUrl(item.image)} alt={item.name} fill className="object-cover" unoptimized={item.image?.startsWith("http")} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="md:w-48 md:border-l md:pl-6 flex flex-col justify-center space-y-3 border-t md:border-t-0 pt-4 md:pt-0">
                                            <div>
                                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Amount</p>
                                                <p className="text-xl font-bold text-gray-900">₹{order.totalPrice}</p>
                                            </div>
                                            <div className="space-y-2 w-full pt-1">
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="w-full py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
                                                >
                                                    View Details
                                                </button>
                                                <button 
                                                    onClick={() => generateInvoice(order, user)}
                                                    className="w-full py-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors flex items-center justify-center gap-1.5"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                                                    Invoice
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case "wishlist":
                return (
                    <div className="animate-fade-in space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-bold text-gray-900">My Wishlist</h3>
                            <span className="text-gray-500">{loadingProducts ? wishlistItems.length : wishlistProducts.length} Items</span>
                        </div>

                        {wishlistItems.length > 0 && loadingProducts ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                                {[1, 2, 3].map(n => (
                                    <div key={n} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm h-80 flex flex-col">
                                        <div className="flex-1 bg-gray-100"></div>
                                        <div className="p-4 bg-white space-y-3">
                                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : wishlistProducts.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                                <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Heart size={40} />
                                </div>
                                <h4 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h4>
                                <p className="text-gray-500 mb-8">Save items you want to see later. They will appear here.</p>
                                <button
                                    onClick={() => router.push(ROUTES.HOME)}
                                    className="px-8 py-3 bg-primary text-white font-medium rounded-full shadow-lg shadow-primary/30 hover:bg-primary/90 hover:scale-105 transition-all duration-200"
                                >
                                    Explore Products
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {wishlistProducts.map((product) => (
                                    <div key={product.id || product._id} className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                        <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                                            <Image
                                                fill
                                                src={formatImageUrl(product.image)}
                                                alt={product.name}
                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                unoptimized={product.image?.startsWith("http")}
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                                            <button
                                                onClick={() => removeFromWishlist(product.id || product._id)}
                                                className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-rose-500 shadow-sm hover:bg-red-500 hover:text-white transition-all duration-200"
                                                title="Remove"
                                            >
                                                <Heart className="w-4 h-4 fill-current" />
                                            </button>
                                            {/* Quick Actions Overlay */}
                                            <div className="absolute bottom-4 left-4 right-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                                <Link
                                                    href={`${ROUTES.PRODUCT}/${product.id || product._id}`}
                                                    className="block w-full text-center bg-white/90 backdrop-blur text-gray-900 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary hover:text-white transition-colors shadow-lg"
                                                >
                                                    View Product
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="text-base font-semibold text-gray-900 truncate flex-1" title={product.name}>{product.name}</h4>
                                            </div>
                                            <p className="text-sm font-bold text-primary">₹{product.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case "address":
                const addresses = user?.addresses || [];
                return (
                    <div className="animate-fade-in space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-bold text-gray-900">Saved Addresses</h3>
                            {!isAddingAddress && (
                                <button
                                    onClick={() => setIsAddingAddress(true)}
                                    className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                                >
                                    + Add New Address
                                </button>
                            )}
                        </div>

                        {isAddingAddress ? (
                            <form onSubmit={handleAddAddress} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-4">
                                <h4 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Add New Location</h4>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Street Address</label>
                                    <input required type="text" value={newAddress.street} onChange={e => setNewAddress({ ...newAddress, street: e.target.value })} className="w-full mt-1 p-2 border rounded-lg focus:ring-primary focus:border-primary" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase">City</label>
                                        <input required type="text" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} className="w-full mt-1 p-2 border rounded-lg focus:ring-primary focus:border-primary" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase">State</label>
                                        <input required type="text" value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} className="w-full mt-1 p-2 border rounded-lg focus:ring-primary focus:border-primary" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Zip Code</label>
                                        <input required type="text" value={newAddress.zipCode} onChange={e => setNewAddress({ ...newAddress, zipCode: e.target.value })} className="w-full mt-1 p-2 border rounded-lg focus:ring-primary focus:border-primary" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Country</label>
                                        <input required type="text" value={newAddress.country} onChange={e => setNewAddress({ ...newAddress, country: e.target.value })} className="w-full mt-1 p-2 border rounded-lg focus:ring-primary focus:border-primary" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-4">
                                    <input type="checkbox" id="isDefault" checked={newAddress.isDefault} onChange={e => setNewAddress({ ...newAddress, isDefault: e.target.checked })} className="rounded text-primary focus:ring-primary" />
                                    <label htmlFor="isDefault" className="text-sm font-medium text-gray-700">Make this my default address</label>
                                </div>
                                <div className="flex gap-4 pt-4 border-t mt-4">
                                    <button type="button" onClick={() => setIsAddingAddress(false)} className="flex-1 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                                    <button type="submit" className="flex-1 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90">Save Address</button>
                                </div>
                            </form>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {addresses.length === 0 ? (
                                    <div className="col-span-full bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                                        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <MapPin size={40} />
                                        </div>
                                        <h4 className="text-xl font-bold text-gray-900 mb-2">No addresses saved</h4>
                                        <p className="text-gray-500 mb-6">Add an address to speed up your checkout process.</p>
                                    </div>
                                ) : (
                                    addresses.map((addr) => (
                                        <div key={addr._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative group hover:border-primary/50 transition-colors">
                                            {addr.isDefault && (
                                                <span className="absolute -top-3 left-6 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase rounded-full shadow-sm">Default</span>
                                            )}
                                            <div className="mt-2 text-gray-600 space-y-1 text-sm">
                                                <p className="font-semibold text-gray-900 text-base">{user.name}</p>
                                                <p>{addr.street}</p>
                                                <p>{addr.city}, {addr.state} {addr.zipCode}</p>
                                                <p>{addr.country}</p>
                                            </div>
                                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                                <button onClick={() => handleDeleteAddress(addr._id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    // ── Order Detail Modal ────────────────────────────────────────────
    const OrderDetailModal = ({ order, onClose }) => {
        if (!order) return null;
        const addr = order.shippingAddress || {};
        const isDelivered = order.status === "Delivered";
        const isCOD = order.paymentMethod === "COD";

        const statusConfig = {
            Delivered:  { icon: CheckCircle2, color: "text-green-600",  bg: "bg-green-50",  border: "border-green-200",  label: "Delivered" },
            Processing: { icon: Clock,        color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200", label: "Processing" },
            Shipped:    { icon: Truck,         color: "text-blue-600",  bg: "bg-blue-50",   border: "border-blue-200",   label: "Shipped" },
        };
        const sc = statusConfig[order.status] || statusConfig["Processing"];
        const StatusIcon = sc.icon;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                <div
                    className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Order Details</p>
                            <h2 className="text-lg font-bold text-gray-900">#{order._id?.slice(-10).toUpperCase()}</h2>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">

                        {/* Status Banner */}
                        <div className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl border ${sc.bg} ${sc.border}`}>
                            <div className="flex items-center gap-3">
                                <StatusIcon size={28} className={sc.color} />
                                <div>
                                    <p className={`font-bold text-base ${sc.color}`}>{sc.label}</p>
                                    {isDelivered && order.deliveredAt ? (
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Delivered on {new Date(order.deliveredAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                                        </p>
                                    ) : (
                                        <p className="text-xs text-gray-500 mt-0.5">Estimated delivery in 5–7 business days</p>
                                    )}
                                </div>
                            </div>
                            <span className="sm:ml-auto text-[10px] sm:text-xs text-gray-400 shrink-0 pl-10 sm:pl-0">
                                Placed {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                        </div>

                        {/* Items */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Items Ordered</h3>
                            <div className="space-y-3">
                                {order.orderItems?.map((item, i) => (
                                    <div key={i} className="flex gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-white border border-gray-200">
                                            <Image
                                                src={formatImageUrl(item.image)}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                                unoptimized={item.image?.startsWith("http")}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
                                            {item.size  && <p className="text-xs text-gray-500 mt-0.5">Size: {item.size}</p>}
                                            {item.color && <p className="text-xs text-gray-500">Color: {item.color}</p>}
                                            <p className="text-xs text-gray-500 mt-1">Qty: {item.qty || 1}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="font-bold text-gray-900">₹{(Number(item.price) * (item.qty || 1)).toFixed(2)}</p>
                                            <p className="text-xs text-gray-400">₹{Number(item.price).toFixed(2)} each</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Deliver To */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Deliver To</h3>
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                                <p className="font-semibold text-gray-900">{order.user?.name || user?.name}</p>
                                {user?.mobile && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Phone size={13} className="text-gray-400" />
                                        +91 {user.mobile}
                                    </div>
                                )}
                                {user?.email && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Mail size={13} className="text-gray-400" />
                                        {user.email}
                                    </div>
                                )}
                                <div className="flex items-start gap-2 text-sm text-gray-600 pt-1">
                                    <MapPin size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                    <span>{addr.street}, {addr.city}, {addr.state} – {addr.zipCode}, {addr.country}</span>
                                </div>
                            </div>
                        </div>

                        {/* Price Summary */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Price Summary</h3>
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Items Total</span>
                                    <span>₹{Number(order.itemsPrice || (order.totalPrice - (order.shippingPrice || 0))).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span>{order.shippingPrice > 0 ? `₹${Number(order.shippingPrice).toFixed(2)}` : "Free"}</span>
                                </div>
                                {order.taxPrice > 0 && (
                                    <div className="flex justify-between text-gray-600">
                                        <span>Tax</span>
                                        <span>₹{Number(order.taxPrice).toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-200">
                                    <span>Total</span>
                                    <span>₹{Number(order.totalPrice).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className={`flex items-center gap-3 p-4 rounded-2xl border ${
                            isCOD ? "bg-orange-50 border-orange-200" : "bg-purple-50 border-purple-200"
                        }`}>
                            {isCOD
                                ? <Wallet size={20} className="text-orange-500 flex-shrink-0" />
                                : <CreditCard size={20} className="text-purple-500 flex-shrink-0" />}
                            <div>
                                <p className={`font-bold text-sm ${isCOD ? "text-orange-700" : "text-purple-700"}`}>
                                    {isCOD ? "Pay on Delivery (COD)" : "Prepaid – Online Payment"}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {isCOD ? "Pay when your order arrives at your door" : "Payment completed at checkout"}
                                </p>
                            </div>
                        </div>

                        {/* Download Invoice */}
                        <button
                            onClick={() => generateInvoice(order, user)}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                            Download Invoice
                        </button>
                    </div>
                </div>
            </div>
        );
    };
    // ────────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-gray-50/50">
            {selectedOrder && <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <div className="w-full md:w-80 flex-shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden md:sticky md:top-24 z-10 transition-all">
                            <div className="hidden md:block p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-b border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 shrink-0 rounded-full bg-white flex items-center justify-center text-primary text-xl font-bold shadow-sm border border-gray-100">
                                        {user.name?.charAt(0) || "U"}
                                    </div>
                                    <div className="overflow-hidden">
                                        <h2 className="font-bold text-gray-900 truncate">{user.name}</h2>
                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                        <div className={`mt-2 inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                                            user.isEmailVerified
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-amber-100 text-amber-700'
                                        }`}>
                                            {user.isEmailVerified ? 'Verified Account' : 'Email Unverified'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <nav className="p-2 md:p-4 flex flex-row md:flex-col overflow-x-auto md:overflow-visible space-x-2 md:space-x-0 md:space-y-1.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                <p className="hidden md:block px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Menu</p>
                                {navItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`shrink-0 flex items-center justify-center md:justify-between px-4 py-2.5 md:px-3 md:py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${activeTab === item.id
                                            ? "bg-primary text-white shadow-lg shadow-primary/25"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 bg-gray-50 md:bg-transparent"
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 md:gap-3">
                                            <item.icon size={18} className={`md:w-5 md:h-5 ${activeTab === item.id ? "text-white" : "text-gray-400 group-hover:text-primary transition-colors"}`} />
                                            <span className="whitespace-nowrap">{item.label}</span>
                                        </div>
                                        {item.badge && (
                                            <span className={`ml-2 md:ml-0 px-2 py-0.5 rounded-full text-[10px] md:text-xs font-bold ${activeTab === item.id ? "bg-white/20 text-white" : "bg-rose-100 text-rose-600"
                                                }`}>
                                                {item.badge}
                                            </span>
                                        )}
                                    </button>
                                ))}

                                <div className="hidden md:block my-4 border-t border-gray-100 mx-3"></div>

                                <button
                                    onClick={logout}
                                    className="shrink-0 flex items-center gap-2 md:gap-3 px-4 py-2.5 md:px-3 md:py-3 text-sm font-medium text-rose-600 rounded-xl hover:bg-rose-50 bg-rose-50/50 md:bg-transparent transition-colors group"
                                >
                                    <LogOut size={18} className="md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
                                    <span className="whitespace-nowrap">Logout</span>
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 min-h-[600px] transition-all duration-300">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileDashboard;
