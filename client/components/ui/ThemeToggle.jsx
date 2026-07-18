"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    // Prevent hydration mismatch by only rendering after mount
    useEffect(() => {
         
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-8 h-8" />; // Placeholder with same dimensions
    }

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full text-gray-500 hover:text-primary hover:bg-gray-100 dark:text-gray-400 dark:hover:text-[#ff3e6c] dark:hover:bg-gray-800 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label="Toggle Dark Mode"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
            {theme === "dark" ? (
                <Sun className="w-5 h-5" />
            ) : (
                <Moon className="w-5 h-5" />
            )}
        </button>
    );
}
