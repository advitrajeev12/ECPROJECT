"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { ROUTES } from "@/lib/routes";
import { formatImageUrl } from "@/lib/utils";
import axios from "axios";
import toast from "react-hot-toast";
import { MapPin, CreditCard, CheckCircle2, ShoppingBag, Star, Wallet, ShieldCheck, CheckSquare, CheckCircle, TicketPercent, Lock, ArrowRight } from "lucide-react";

// ─── Load Razorpay SDK script dynamically ──────────────────────────────────────
function loadRazorpayScript() {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

export default function Checkout() {
    const { cartItems, getCartTotal, clearCart } = useCart();
    const { formatPrice } = useCurrency();
    const { user, updateUser, loading } = useAuth();
    const router = useRouter();

    const [step, setStep] = useState(1);
    const [selectedAddressId, setSelectedAddressId] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("COD");

    // Add Address State
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [newAddress, setNewAddress] = useState({ street: '', city: '', state: '', zipCode: '', country: "India", isDefault: false });

    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push(ROUTES.LOGIN);
        } else if (!loading && user) {
            // Auto-select default or first address if available
            if (user?.addresses?.length > 0 && !selectedAddressId) {
                const def = user.addresses.find(a => a.isDefault);
                setSelectedAddressId(def ? def._id : user.addresses[0]._id);
            }
        }
    }, [user, loading, router, selectedAddressId]);

    if (loading || !user) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900 transition-colors">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50/50 px-4">
                <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                    <p className="mb-6">Your bag is empty.</p>
                    <button onClick={() => router.push(ROUTES.HOME)} className="bg-[#ff3e6c] text-white px-8 py-3 rounded font-bold uppercase tracking-wider hover:bg-[#ff2a5f]">Explore Products</button>
                </div>
            </div>
        );
    }

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("/api/users/addresses", newAddress, { withCredentials: true });
            if (res.data.success) {
                updateUser(res.data.user);
                setIsAddingAddress(false);
                setNewAddress({ street: '', city: '', state: '', zipCode: '', country: "India", isDefault: false });
                toast.success("Address added successfully");
                // Select the newly added address
                const newAddrs = res.data.user.addresses;
                if (newAddrs && newAddrs.length > 0) {
                    setSelectedAddressId(newAddrs[newAddrs.length - 1]._id);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add address");
        }
    };

    const deliveryFee = paymentMethod === "COD" ? 10 : 0;

    const handlePlaceOrder = async () => {
        const selectedAddress = user.addresses.find(a => a._id === selectedAddressId);
        if (!selectedAddress) {
            toast.error("Please select an address first.");
            return;
        }

        setIsPlacingOrder(true);
        try {
            const orderItems = cartItems.map(item => ({
                name: item.name,
                qty: item.quantity,
                image: item.image || "/placeholder.jpg",
                price: item.price,
                product: item.id || item._id,
                size: item.size,
                color: item.color
            }));

            const itemsPrice = getCartTotal();
            const totalPrice = itemsPrice + deliveryFee;

            const payload = {
                orderItems,
                shippingAddress: selectedAddress,
                paymentMethod,
                itemsPrice,
                taxPrice: 0,
                shippingPrice: deliveryFee,
                totalPrice,
            };

            if (paymentMethod !== 'COD') {
                // ── Razorpay Online Payment Flow ───────────────────────────────
                // 1. Load Razorpay SDK
                const sdkLoaded = await loadRazorpayScript();
                if (!sdkLoaded) {
                    toast.error("Failed to load payment gateway. Please try again.");
                    return;
                }

                // 2. Create Razorpay order on server
                const createRes = await axios.post('/api/orders/razorpay/create-order', payload, { withCredentials: true });
                if (!createRes.data.success) {
                    toast.error("Could not initiate payment. Please try again.");
                    return;
                }

                const { razorpayOrderId, amount, currency, keyId, dbOrderId } = createRes.data;

                // 3. Open Razorpay checkout modal
                await new Promise((resolve, reject) => {
                    const options = {
                        key: keyId,
                        amount,
                        currency,
                        name: "Baljyoti",
                        description: "Order Payment",
                        order_id: razorpayOrderId,
                        prefill: {
                            name: user.name || "",
                            email: user.email || "",
                            contact: user.phone || "",
                        },
                        theme: { color: "#3395FF" },
                        // Explicitly request UPI + QR — Razorpay will show it if enabled on account
                        method: {
                            upi: true,
                            card: true,
                            netbanking: true,
                            wallet: true,
                        },
                        modal: {
                            ondismiss: () => {
                                reject(new Error("Payment cancelled by user"));
                            },
                        },
                        handler: async (response) => {
                            try {
                                // 4. Verify payment on server
                                const verifyRes = await axios.post('/api/orders/razorpay/verify-payment', {
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature,
                                    dbOrderId,
                                }, { withCredentials: true });

                                if (verifyRes.data.success) {
                                    clearCart();
                                    toast.success("Payment Successful! Order Confirmed 🎉", { duration: 4000 });
                                    router.push(ROUTES.HOME);
                                    resolve();
                                } else {
                                    toast.error("Payment verification failed. Contact support.");
                                    reject(new Error("Verification failed"));
                                }
                            } catch (err) {
                                toast.error("Payment verification failed. Please contact support.");
                                reject(err);
                            }
                        },
                    };

                    const rzp = new window.Razorpay(options);
                    rzp.on("payment.failed", (response) => {
                        toast.error(`Payment failed: ${response.error.description}`);
                        reject(new Error(response.error.description));
                    });
                    rzp.open();
                });

            } else {
                // ── COD Flow ─────────────────────────────────────────────────
                const res = await axios.post('/api/orders', payload, { withCredentials: true });
                if (res.data.success) {
                    clearCart();
                    toast.success("Order Placed Successfully! 🎉", { duration: 3000 });
                    router.push(ROUTES.HOME);
                }
            }
        } catch (error) {
            // User cancelled or payment failed — don't show generic error for cancellation
            if (error.message !== "Payment cancelled by user") {
                toast.error(error.response?.data?.message || error.message || "Failed to place order.");
            }
        } finally {
            setIsPlacingOrder(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-[#282c3f]">
            {/* Top Stepper Header Matches Myntra Style */}
            <header className="border-b border-[#eaeaec] bg-white pt-4 pb-3 sm:pt-6 sm:pb-4 mb-6 sm:mb-8 sticky top-0 z-10 w-full">
                <div className="flex justify-center flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-[11px] font-bold tracking-[2px] text-gray-400 uppercase">
                    <span onClick={() => router.push(ROUTES.CART)} className="cursor-pointer hover:text-black transition-colors">Bag</span>
                    <span className="tracking-[3px] text-gray-300">----------</span>
                    <span onClick={() => { if(step === 2) setStep(1) }} className={step >= 1 ? "text-[#20BEA8] border-b-[2.5px] border-[#20BEA8] pb-1 cursor-pointer" : ""}>Address</span>
                    <span className="tracking-[3px] text-gray-300">----------</span>
                    <span className={step === 2 ? "text-[#20BEA8] border-b-[2.5px] border-[#20BEA8] pb-1" : ""}>Payment</span>
                </div>
            </header>

            <div className="container mx-auto px-4 lg:px-6 max-w-5xl">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6 items-start">
                    
                    {/* Main Content Area */}
                    <div className="print-area space-y-6">

                        {/* Step 1: Address Selection */}
                        {step === 1 && (
                            <div className="animate-fade-in space-y-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-lg font-bold">Select Delivery Address</h2>
                                    {!isAddingAddress && (
                                        <button onClick={() => setIsAddingAddress(true)} className="text-[11px] font-bold text-[#ff3e6c] border border-[rgba(255,62,108,.5)] px-3 py-1.5 rounded hover:bg-[#ff3e6c] hover:text-white transition uppercase tracking-wide">
                                            + Add New Address
                                        </button>
                                    )}
                                </div>

                                {isAddingAddress && (
                                    <form onSubmit={handleAddAddress} className="bg-[#fcfcfc] border border-[#eaeaec] rounded p-6 relative">
                                        <h3 className="font-bold text-[#282c3f] mb-4 text-sm">Add New Address</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="sm:col-span-2">
                                                <input required type="text" placeholder="Street Address" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} className="w-full p-3 text-sm border border-[#d4d5d9] rounded focus:outline-gray-400 transition" />
                                            </div>
                                            <div>
                                                <input required type="text" placeholder="City" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="w-full p-3 text-sm border border-[#d4d5d9] rounded focus:outline-gray-400 transition" />
                                            </div>
                                            <div>
                                                <input required type="text" placeholder="State" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} className="w-full p-3 text-sm border border-[#d4d5d9] rounded focus:outline-gray-400 transition" />
                                            </div>
                                            <div>
                                                <input required type="text" placeholder="Zip Code" value={newAddress.zipCode} onChange={e => setNewAddress({...newAddress, zipCode: e.target.value})} className="w-full p-3 text-sm border border-[#d4d5d9] rounded focus:outline-gray-400 transition" />
                                            </div>
                                            <div>
                                                <input required type="text" placeholder="Country" disabled value={newAddress.country} onChange={e => setNewAddress({...newAddress, country: e.target.value})} className="w-full p-3 text-sm border border-[#d4d5d9] bg-gray-50 rounded focus:outline-gray-400 transition" />
                                            </div>
                                        </div>
                                        <div className="flex gap-4 mt-6">
                                            <button type="submit" className="bg-[#ff3e6c] text-white px-8 py-3 rounded font-bold uppercase tracking-wide text-xs">Save Address</button>
                                            <button type="button" onClick={() => setIsAddingAddress(false)} className="text-gray-500 px-8 py-3 rounded font-bold uppercase tracking-wide text-xs border border-gray-300">Cancel</button>
                                        </div>
                                    </form>
                                )}

                                {!isAddingAddress && user?.addresses?.length > 0 && (
                                    <div className="space-y-4">
                                        {user.addresses.map(addr => (
                                            <div 
                                                key={addr._id} 
                                                role="button"
                                                tabIndex={0}
                                                aria-label={`Select address: ${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}`}
                                                aria-pressed={selectedAddressId === addr._id}
                                                onClick={() => setSelectedAddressId(addr._id)}
                                                onKeyDown={(e) => e.key === 'Enter' && setSelectedAddressId(addr._id)}
                                                className={`p-5 rounded border cursor-pointer transition-all ${selectedAddressId === addr._id ? 'border-[#20BEA8] bg-[#f2fbf9] shadow-sm relative' : 'border-[#eaeaec] hover:border-[#d4d5d9] bg-white relative'}`}
                                            >
                                                {selectedAddressId === addr._id && <CheckCircle size={20} className="text-[#20BEA8] absolute top-5 left-5" fill="#20BEA8" color="white" />}
                                                <div className={`${selectedAddressId === addr._id ? 'ml-8' : 'ml-0'} transition-all`}>
                                                    <div className="flex justify-between items-center mb-2 text-sm">
                                                        <h4 className="font-bold text-[#282c3f] capitalize">{user.name}</h4>
                                                    </div>
                                                    <p className="text-[13px] leading-relaxed text-[#535766] mb-1">{addr.street}</p>
                                                    <p className="text-[13px] leading-relaxed text-[#535766] mb-1">{addr.city}, {addr.state} - {addr.zipCode}</p>
                                                    
                                                    {selectedAddressId === addr._id && (
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); setStep(2); }}
                                                            className="mt-4 bg-[#ff3e6c] text-white px-8 py-3 rounded font-bold uppercase tracking-wider text-[13px] hover:bg-[#ff2a5f] w-full sm:w-auto"
                                                        >
                                                            Deliver Here
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {!isAddingAddress && user?.addresses?.length === 0 && (
                                    <div className="p-8 text-center text-gray-500 bg-gray-50 rounded border border-dashed text-sm">
                                        No addresses saved. Please add one above.
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 2: Payment Section */}
                        {step === 2 && (
                            <div className="animate-fade-in">
                                
                                {/* Bank Offer Block */}
                                <div className="border border-[#eaeaec] rounded mb-6 p-4">
                                    <div className="flex items-center gap-2 font-bold text-sm mb-2 text-[#282c3f]"> 
                                        <TicketPercent size={18} /> Bank Offer
                                    </div>
                                    <p className="text-[13px] text-[#535766] mb-2 leading-relaxed">
                                        10% Instant Discount on Axis Bank Credit Card on min spend of {formatPrice(3500)}
                                    </p>
                                    <button className="text-[13px] font-bold text-[#ff3e6c] hover:underline flex items-center gap-1">
                                        Show More <span className="text-[10px]">▼</span>
                                    </button>
                                </div>

                                <h2 className="font-bold text-lg mb-4 text-[#282c3f]">Choose Payment Mode</h2>
                                
                                <div className="flex flex-col sm:flex-row border border-[#eaeaec] rounded bg-white overflow-hidden shadow-sm">
                                    {/* Left Tabs */}
                                    <div className="sm:w-full md:w-[220px] bg-[#f4f4f5] border-b sm:border-b md:border-b-0 md:border-r border-[#eaeaec] flex-shrink-0 flex sm:flex-row md:flex-col overflow-x-auto">
                                        <div onClick={() => setPaymentMethod('COD')} className={`p-[18px] border-b border-[#eaeaec] flex items-center gap-3 cursor-pointer transition ${paymentMethod === 'COD' ? 'bg-white border-l-[4px] border-[#ff3e6c] font-bold text-[#ff3e6c]' : 'text-[#535766] font-bold hover:bg-white'}`}>
                                            <Star size={16} /> Recommended (COD)
                                        </div>
                                        <div onClick={() => setPaymentMethod('UPI')} className={`p-[18px] border-b border-[#eaeaec] text-[13px] font-bold flex flex-col gap-1 cursor-pointer transition ${paymentMethod === 'UPI' ? 'bg-white border-l-[4px] border-[#ff3e6c] text-[#282c3f]' : 'text-[#535766] hover:bg-white'}`}>
                                            <div className="flex items-center gap-3"><Wallet size={16} /> UPI (Pay via any App)</div>
                                            <span className="text-[11px] font-normal text-gray-400 ml-7">GPay, PhonePe, Paytm</span>
                                        </div>
                                        <div onClick={() => setPaymentMethod('CARD')} className={`p-[18px] border-b border-[#eaeaec] text-[13px] font-bold flex items-center gap-3 cursor-pointer transition ${paymentMethod === 'CARD' ? 'bg-white border-l-[4px] border-[#ff3e6c] text-[#282c3f]' : 'text-[#535766] hover:bg-white'}`}>
                                            <CreditCard size={16} /> Credit/Debit Card
                                        </div>
                                        <div onClick={() => setPaymentMethod('WALLET')} className={`p-[18px] border-b border-[#eaeaec] text-[13px] font-bold flex items-center gap-3 cursor-pointer transition ${paymentMethod === 'WALLET' ? 'bg-white border-l-[4px] border-[#ff3e6c] text-[#282c3f]' : 'text-[#535766] hover:bg-white'}`}>
                                            Wallets
                                        </div>
                                        <div onClick={() => setPaymentMethod('NETBANKING')} className={`p-[18px] text-[13px] font-bold flex items-center gap-3 cursor-pointer transition ${paymentMethod === 'NETBANKING' ? 'bg-white border-l-[4px] border-[#ff3e6c] text-[#282c3f]' : 'text-[#535766] hover:bg-white'}`}>
                                            Net Banking
                                        </div>
                                    </div>

                                    {/* Right Content */}
                                    <div className="flex-1 p-6 bg-white md:min-h-[460px]">
                                        {paymentMethod === 'COD' && (
                                            <>
                                                <h3 className="font-bold text-[#282c3f] mb-6 text-[15px]">Recommended Payment Options</h3>
                                                <div className="border border-[#ff3e6c] bg-[#fffafb] p-5 rounded cursor-pointer transition-all">
                                                    <div className="flex items-start gap-4">
                                                        <div className="h-5 flex items-center">
                                                            <input type="radio" checked readOnly className="w-4 h-4 accent-[#ff3e6c]" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-bold text-[#282c3f] text-sm mb-1 line-clamp-1">Cash on Delivery (Cash/UPI)</h4>
                                                            <p className="text-[12px] text-[#535766] leading-relaxed pt-1 w-[90%]">
                                                                For this option, there is a fee of {formatPrice(10)}. You can Pay online to avoid this.
                                                            </p>
                                                            <div className="mt-6">
                                                                <button onClick={(e) => { e.stopPropagation(); handlePlaceOrder(); }} disabled={isPlacingOrder} className="w-full sm:w-[85%] bg-[#ff3e6c] text-white font-bold py-3.5 rounded text-[13px] uppercase tracking-wider hover:bg-[#ff2a5f] shadow-md shadow-pink-500/20 disabled:opacity-75">
                                                                    {isPlacingOrder ? "Placing Order..." : `Place Order • ${formatPrice(getCartTotal() + deliveryFee)}`}
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="hidden sm:flex border border-gray-200 rounded px-2 py-1 items-center justify-center">
                                                            <Wallet size={20} className="text-gray-500" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {paymentMethod !== 'COD' && (
                                            <>
                                                <h3 className="font-bold text-[#282c3f] mb-6 text-[15px]">Online Payment secured by Razorpay</h3>

                                                {/* Razorpay Info Card */}
                                                <div className="border border-[#3395FF]/20 bg-[#3395FF]/5 rounded-xl p-5 mb-6 flex items-start gap-4">
                                                    <div className="mt-0.5 w-9 h-9 rounded-lg bg-[#3395FF] flex items-center justify-center flex-shrink-0">
                                                        <Lock size={16} className="text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-[#282c3f] mb-1">Secure 256-bit Encrypted Payment</p>
                                                        <p className="text-[12px] text-[#535766] leading-relaxed">
                                                            A Razorpay secure checkout window will open to complete your <span className="font-semibold">{paymentMethod}</span> payment. Supports UPI, Cards, Net Banking &amp; Wallets.
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Accepted methods */}
                                                <div className="flex items-center gap-2 mb-6 flex-wrap">
                                                    {['UPI', 'Visa', 'Mastercard', 'RuPay', 'Net Banking', 'Wallets'].map(m => (
                                                        <span key={m} className="text-[10px] font-bold border border-gray-200 text-gray-500 px-2 py-1 rounded bg-gray-50">{m}</span>
                                                    ))}
                                                </div>

                                                <button
                                                    id="razorpay-pay-btn"
                                                    onClick={handlePlaceOrder}
                                                    disabled={isPlacingOrder}
                                                    className="w-full sm:w-[85%] bg-[#3395FF] text-white font-bold py-4 rounded-lg text-[13px] uppercase tracking-wider hover:bg-[#2277d4] shadow-lg shadow-blue-400/20 disabled:opacity-75 flex items-center justify-center gap-2 transition-all"
                                                >
                                                    {isPlacingOrder ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Lock size={14} />
                                                            Pay Securely • {formatPrice(getCartTotal() + deliveryFee)}
                                                            <ArrowRight size={14} />
                                                        </>
                                                    )}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Have a gift card */}
                                <div className="mt-6 border border-[#eaeaec] p-4 rounded flex justify-between items-center cursor-pointer hover:border-[#d4d5d9] transition">
                                    <div className="flex items-center gap-3 font-bold text-sm text-[#282c3f]">
                                        <ShieldCheck size={18} /> Have a Gift Card?
                                    </div>
                                    <span className="text-[11px] font-bold text-[#ff3e6c] uppercase tracking-wide">Apply Gift Card</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Area (Price Details Sidebar) */}
                    <div className="lg:border-l border-[#eaeaec] lg:pl-6 pt-2 pb-10">
                        <h3 className="text-[12px] font-bold text-[#535766] mb-5 uppercase tracking-wide">Price Details ({cartItems.length} Item)</h3>

                        <div className="space-y-3.5 text-[14px] text-[#282c3f] mb-4 pb-4 border-b border-[#eaeaec]">
                            <div className="flex justify-between">
                                <span>Total MRP</span>
                                <span>{formatPrice(getCartTotal())}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Discount on MRP</span>
                                <span className="text-[#20BEA8]">- {formatPrice(0)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="flex items-center gap-1.5">
                                    Platform Fee
                                    <span className="text-[#ff3e6c] font-bold text-[10px] uppercase cursor-pointer tracking-wide">Know More</span>
                                </span>
                                <span>{formatPrice(0)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="flex items-center gap-1.5 line-clamp-1 truncate mr-2">
                                    Cash/Pay on Delivery Fee
                                    <span className="text-[#ff3e6c] font-bold text-[10px] uppercase cursor-pointer tracking-wide whitespace-nowrap hidden sm:inline">Know More</span>
                                </span>
                                <span className="whitespace-nowrap flex-shrink-0">{formatPrice(deliveryFee)}</span>
                            </div>
                        </div>

                        <div className="flex justify-between font-bold text-[15px] text-[#282c3f] py-1 border-b border-[#eaeaec]">
                            <span>Total Amount</span>
                            <span>{formatPrice(getCartTotal() + deliveryFee)}</span>
                        </div>

                        {step === 1 && (
                            <div className="mt-8 text-[11px] text-gray-500">
                                Make sure to select or add an address perfectly matched with your location for accurate delivery estimates.
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
