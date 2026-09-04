import "./globals.css";
import Navigation from "@/components/layout/Navigation/Navigation";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import Footer from "@/components/layout/Footer/Footer";
import { Toaster } from "react-hot-toast";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://baljyotidesign.com";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Bal Jyoti Design — Authentic Indian Handcrafts",
    template: "%s | Bal Jyoti Design",
  },
  description:
    "Discover handmade treasures from rural India — bamboo crafts, sikki baskets, handloom rugs & more. Every product supports a real artisan family and preserves a centuries-old heritage.",
  keywords: [
    "Indian handcrafts",
    "bamboo crafts",
    "sikki baskets",
    "moonj grass",
    "handloom rugs",
    "artisan products",
    "ethical fashion",
    "sustainable gifts",
    "Bihar crafts",
    "buy handmade India",
  ],
  authors: [{ name: "Bal Jyoti Design", url: SITE_URL }],
  creator: "Bal Jyoti Design",
  publisher: "Bal Jyoti Design",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "Bal Jyoti Design",
    title: "Bal Jyoti Design — Authentic Indian Handcrafts",
    description:
      "Handcrafted bamboo, sikki, moonj & handloom products from rural Bihar. Supporting 500+ artisans across 15 villages.",
    images: [
      {
        url: `${SITE_URL}/images/og-cover.jpg`,
        width: 1200,
        height: 630,
        alt: "Bal Jyoti Design — Authentic Indian Handcrafts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bal Jyoti Design — Authentic Indian Handcrafts",
    description:
      "Handcrafted bamboo, sikki, moonj & handloom products from rural Bihar.",
    images: [`${SITE_URL}/images/og-cover.jpg`],
    creator: "@baljyotidesign",
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  // Allow user zoom for accessibility — WCAG 1.4.4
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
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Bal Jyoti Design",
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    description:
      "Authentic Indian handcraft brand from Bihar, empowering 500+ artisans across 15 villages with bamboo crafts, sikki baskets, handloom rugs and more.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bihar",
      addressCountry: "IN",
    },
    sameAs: [
      "https://www.facebook.com/baljyotidesign",
      "https://www.instagram.com/baljyotidesign",
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
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
