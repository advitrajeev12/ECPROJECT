"use client";

import { createContext, useContext, useState, useEffect } from "react";

const CurrencyContext = createContext();

const EXCHANGE_RATES = {
    INR: 1,
    USD: 0.012,
    EUR: 0.011,
    GBP: 0.0095,
    JPY: 1.76,
};

const SYMBOLS = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
};

export const CurrencyProvider = ({ children }) => {
    const [currency, setCurrency] = useState("INR");

    // Optional: Persist currency in localStorage
    useEffect(() => {
        const savedCurrency = localStorage.getItem("currency");
        if (savedCurrency) {
            setCurrency(savedCurrency);  
        }
    }, []);

    const changeCurrency = (newCurrency) => {
        setCurrency(newCurrency);
        localStorage.setItem("currency", newCurrency);
    };

    const formatPrice = (amount) => {
        if (amount === undefined || amount === null) return "";
        const converted = Math.round(amount * EXCHANGE_RATES[currency]);
        return `${SYMBOLS[currency]}${converted.toLocaleString()}`;
    };

    return (
        <CurrencyContext.Provider value={{ currency, changeCurrency, formatPrice }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    return useContext(CurrencyContext);
};
