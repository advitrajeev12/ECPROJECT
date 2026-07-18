"use client";

import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState([]);

    // Load wishlist from localStorage on mount
    useEffect(() => {
        const savedWishlist = localStorage.getItem("wishlist");
        if (savedWishlist) {
            try {
                setWishlistItems(JSON.parse(savedWishlist));  
            } catch (e) {
                console.error("Failed to parse wishlist from localStorage", e);
            }
        }
    }, []);

    // Update localStorage whenever wishlist changes
    useEffect(() => {
        localStorage.setItem("wishlist", JSON.stringify(wishlistItems));
    }, [wishlistItems]);

    const addToWishlist = (productId) => {
        let added = false;
        setWishlistItems((prev) => {
            if (!prev.includes(productId)) {
                added = true;
                return [...prev, productId];
            }
            return prev;
        });
        if (added || true) { // Because setWishlistItems is async in react, we can just trigger it.
            // actually, it's safer to just toast instantly because we know it was called
            toast.success("Added to Wishlist", { icon: "❤️" });
        }
    };

    const removeFromWishlist = (productId) => {
        setWishlistItems((prev) => prev.filter((id) => id !== productId));
        toast.success("Removed from Wishlist");
    };

    const toggleWishlist = (productId) => {
        if (isInWishlist(productId)) {
            removeFromWishlist(productId);
        } else {
            addToWishlist(productId);
        }
    };

    const isInWishlist = (productId) => {
        return wishlistItems.includes(productId);
    };

    return (
        <WishlistContext.Provider value={{ wishlistItems, addToWishlist, removeFromWishlist, toggleWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    return useContext(WishlistContext);
};
