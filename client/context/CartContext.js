"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

import { useAuth } from "./AuthContext";

const CartContext = createContext();

export function CartProvider({ children }) {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [isCartLoaded, setIsCartLoaded] = useState(false);

    // Get the correct storage key based on authentication
    const getStorageKey = () => {
        return user && user._id ? `cart_${user._id}` : "cart_guest";
    };

    // Load cart from localStorage when component mounts or user changes
    useEffect(() => {
        const storageKey = getStorageKey();
        const savedCart = localStorage.getItem(storageKey);

        if (savedCart) {
            try {
                setCartItems(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart from localStorage", e);
                setCartItems([]);
            }
        } else {
            setCartItems([]);
        }
        setIsCartLoaded(true);
         
    }, [user]);

    // Save cart to localStorage whenever it logically changes (but wait until first load completes)
    useEffect(() => {
        if (isCartLoaded) {
            const storageKey = getStorageKey();
            try {
                // Clean huge base64 strings before storing to prevent QuotaExceededError
                const cleanItems = cartItems.map(item => {
                    const cleaned = { ...item };
                    if (cleaned.image && cleaned.image.startsWith('data:image')) {
                        cleaned.image = '/placeholder.jpg';
                    }
                    if (cleaned.images && Array.isArray(cleaned.images)) {
                        cleaned.images = cleaned.images.map(img => 
                            img && img.startsWith('data:image') ? '/placeholder.jpg' : img
                        );
                    }
                    return cleaned;
                });
                localStorage.setItem(storageKey, JSON.stringify(cleanItems));
            } catch (error) {
                console.error("Failed to save cart to localStorage (QuotaExceeded?):", error);
            }
        }
         
    }, [cartItems, isCartLoaded, user]);

    const addToCart = (product, quantity = 1, size = null, color = null) => {
        setCartItems((prevItems) => {
            const productId = product.id || product._id;
            const existingItemIndex = prevItems.findIndex(
                (item) => (item.id || item._id) === productId && item.size === size && item.color === color
            );

            // Clean huge base64 strings to prevent memory & storage bloat
            const cleanProduct = { ...product };
            if (cleanProduct.image && cleanProduct.image.startsWith("data:image")) {
                cleanProduct.image = "/placeholder.jpg";
            }
            if (cleanProduct.images && Array.isArray(cleanProduct.images)) {
                cleanProduct.images = cleanProduct.images.map(img => 
                    img && img.startsWith("data:image") ? "/placeholder.jpg" : img
                );
            }

            if (existingItemIndex > -1) {
                // Item exists, increase quantity
                const newItems = [...prevItems];
                newItems[existingItemIndex] = {
                    ...newItems[existingItemIndex],
                    quantity: newItems[existingItemIndex].quantity + quantity
                };
                return newItems;
            } else {
                // New item
                return [...prevItems, { ...cleanProduct, id: productId, quantity, size, color }];
            }
        });
        toast.success("Added to Bag", { icon: "🛍️" });
    };

    const removeFromCart = (productId, size = null, color = null) => {
        setCartItems((prevItems) =>
            prevItems.filter((item) => !((item.id || item._id) === productId && item.size === size && item.color === color))
        );
        toast.success("Removed from Bag");
    };

    const updateQuantity = (productId, size, color, quantity) => {
        if (quantity < 1) return;
        setCartItems((prevItems) => {
            return prevItems.map((item) =>
                (item.id || item._id) === productId && item.size === size && item.color === color
                    ? { ...item, quantity: Number(quantity) }
                    : item
            );
        });
        toast.success("Cart Updated", { id: "cart-update", duration: 1500 });
    };

    const getCartCount = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const clearCart = () => {
        setCartItems([]);
    };

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                getCartCount,
                getCartTotal,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
