
// Wait, RootLayout is server component. Providers are client components.
// The imports I'm using are Providers. They should be "use client" inside them.
// AuthProvider, CurrencyProvider, etc. all have "use client" verified.
// So layout.js does NOT need "use client".
import "./globals.css";
import Navigation from "@/components/layout/Navigation/Navigation";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import Footer from "@/components/layout/Footer/Footer";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Bal Jyoti Design",
  description: "Handcrafted fashion",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Inter, Playfair_Display } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <CurrencyProvider>
              <WishlistProvider>
                <CartProvider>
                  <Navigation />
                  {children}
                  <Footer />
                  <Toaster
                    position="bottom-right"
                    toastOptions={{
                      style: {
                        background: '#333',
                        color: '#fff',
                        borderRadius: '10px',
                      },
                      success: {
                        iconTheme: {
                          primary: '#ff3e6c',
                          secondary: '#fff',
                        },
                      }
                    }}
                  />
                </CartProvider>
              </WishlistProvider>
            </CurrencyProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
