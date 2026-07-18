"use client";
import {
  Search, User, ShoppingCart, ChevronDown,
  Heart, LogOut, Menu, X, Sparkles, Globe,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

import Link from "next/link";
import Image from "next/image";
import { useCurrency } from "@/context/CurrencyContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { ROUTES, NAV_LINKS } from "@/lib/routes";

const REGIONS = [
  { name: "India Region", code: "INR", symbol: "₹" },
  { name: "Worldwide", code: "USD", symbol: "$" },
];

// Brand palette pulled from the logo itself — green + warm gold —
// instead of the generic blue the rest of the nav previously used.
const BRAND = {
  green: "#2d6a2d",
  greenSoft: "rgba(45,106,45,0.08)",
  greenSofter: "rgba(45,106,45,0.05)",
  gold: "#a9762f",
};

export default function Navigation() {
  const [dropdown, setDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDropdown, setMobileDropdown] = useState(null);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const { currency, changeCurrency } = useCurrency();
  const { getCartCount } = useCart();
  const { user, logout } = useAuth();
  const { wishlistTotal } = useWishlist();
  const cartCount = getCartCount();

  const handleLogoClick = () => {
    // Scroll to the very top smoothly on every logo click.
    // Next.js Link handles the actual navigation — no refresh needed.
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isActive = (href) =>
    href === ROUTES.HOME ? pathname === href : pathname === href || pathname?.startsWith(`${href}/`);

  const searchRef = useRef(null);

  // Scroll-aware shadow / blur & auto-close menus
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      if (window.scrollY > 50) {
        setMobileMenuOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  // Close dropdowns on outside click for currency
  useEffect(() => {
    if (!currencyOpen) return;
    const handler = () => setCurrencyOpen(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [currencyOpen]);

  // Escape closes search / mobile menu — small but real usability win
  useEffect(() => {
    const handler = (e) => {
      if (e.key !== "Escape") return;
      setSearchOpen(false);
      setMobileMenuOpen(false);
      setCurrencyOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Auto-close menu and search when navigating
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Little "pop" cue whenever cart or wishlist counts change
  const [cartPop, setCartPop] = useState(false);
  const [wishPop, setWishPop] = useState(false);
  const prevCart = useRef(cartCount);
  const prevWish = useRef(wishlistTotal);
  useEffect(() => {
    if (cartCount !== prevCart.current) {
      setCartPop(true);
      prevCart.current = cartCount;
      const t = setTimeout(() => setCartPop(false), 400);
      return () => clearTimeout(t);
    }
  }, [cartCount]);
  useEffect(() => {
    if (wishlistTotal !== prevWish.current) {
      setWishPop(true);
      prevWish.current = wishlistTotal;
      const t = setTimeout(() => setWishPop(false), 400);
      return () => clearTimeout(t);
    }
  }, [wishlistTotal]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`${ROUTES.SEARCH}?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const titleCase = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

  return (
    <>
      {/* ── Decorative top border ─────────────────────────────── */}
      <div
        className="w-full"
        style={{
          height: "24px",
          backgroundImage: "url('/images/border_icon.png')",
          backgroundRepeat: "repeat-x",
          backgroundSize: "auto 100%",
          backgroundPosition: "center",
          backgroundColor: "#f5f0e8",
        }}
      />

      {/* ── Sticky Nav ────────────────────────────────────────── */}
      <div
        className={`
          w-full sticky top-0 left-0 right-0 z-50
          transition-all duration-300
          ${scrolled ? "shadow-lg bg-white/95 backdrop-blur-md" : "shadow-sm bg-white"}
        `}
        style={{ borderBottom: scrolled ? "1px solid rgba(45,106,45,0.1)" : "1px solid transparent" }}
      >
        {/* ── Search overlay (click-away backdrop + centered pill) ──── */}
        {searchOpen && (
          <div
            className="fixed inset-0 top-0 z-40"
            style={{ background: "rgba(20,20,15,0.25)", animation: "fadeIn 0.15s ease both" }}
            onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
          />
        )}
        <div
          className={`
            relative z-50 overflow-hidden transition-all duration-300 ease-in-out
            ${searchOpen ? "max-h-24 py-3 border-b border-gray-100" : "max-h-0"}
          `}
        >
          <form
            onSubmit={handleSearchSubmit}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-3 px-5 py-2.5 max-w-xl mx-auto bg-white rounded-full shadow-md border border-gray-100 mt-1"
            style={{ boxShadow: "0 8px 30px rgba(45,106,45,0.08)" }}
          >
            <Search className="w-4.5 h-4.5 shrink-0" style={{ color: BRAND.green }} />
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, categories…"
              className="flex-1 outline-none text-gray-700 text-sm placeholder-gray-400 bg-transparent"
            />
            <button
              type="button"
              onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close search"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* ── Main Nav Row ──────────────────────────────────── */}
        <nav className="flex items-center justify-between px-4 md:px-[20px] py-1.5 relative">

          {/* Responsive Logo */}
          <Link
            href={ROUTES.HOME}
            onClick={handleLogoClick}
            className="flex items-center gap-2 md:gap-3 shrink-0 group transition-all duration-500 ease-out logo-entrance"
          >
            <div className="relative transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-green-900/10 group-hover:drop-shadow-xl">
              <Image
                src="/images/logo.png"
                alt="Bal Jyoti Design"
                width={70}
                height={28}
                className="h-7 md:h-9 w-auto mix-blend-multiply"
                priority
              />
              <Sparkles
                className="absolute -top-1.5 -right-2.5 w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ color: BRAND.gold }}
                strokeWidth={2}
              />
            </div>
            <div className="flex flex-col leading-none transition-all duration-500 group-hover:translate-x-1">
              <span className="text-base md:text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#2d6a2d] via-[#4a8a4a] to-[#2d6a2d] drop-shadow-sm animate-gradient-x">
                Bal Jyoti
              </span>
              <span className="text-[7px] md:text-[10px] font-bold tracking-[0.3em] uppercase text-[#7c5a2a] opacity-80 group-hover:opacity-100 group-hover:tracking-[0.4em] transition-all duration-500">
                Design
              </span>
            </div>
          </Link>

          {/* ── Desktop Nav Links (center) ─────────────────── */}
          <ul className="hidden lg:flex items-center gap-1 xl:gap-2">
            {NAV_LINKS.map((item) => {
              const active = isActive(item.href);
              return (
                <li
                  key={item.name}
                  className="relative group"
                  onMouseEnter={() => setDropdown(item.name)}
                  onMouseLeave={() => setDropdown(null)}
                >
                  <div className="flex items-center gap-0.5">
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      aria-expanded={item.children ? dropdown === item.name : undefined}
                      className={`
                        relative flex items-center gap-1
                        px-2.5 py-2
                        text-[14px] font-medium tracking-normal normal-case
                        rounded-md
                        transition-all duration-200
                        focus-visible:outline-none focus-visible:ring-2
                        ${active ? "font-semibold" : ""}
                      `}
                      style={{
                        textTransform: "none",
                        color: active ? BRAND.green : "#374151",
                        background: active ? BRAND.greenSoft : "transparent",
                      }}
                      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = BRAND.greenSofter; }}
                      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
                    >
                      {titleCase(item.name)}

                      {item.children && (
                        <ChevronDown
                          className="w-3 h-3 transition-transform duration-200"
                          style={{ color: dropdown === item.name ? BRAND.green : "#9CA3AF", transform: dropdown === item.name ? "rotate(180deg)" : "none" }}
                        />
                      )}

                      {/* Animated underline — always on for the active route, on hover otherwise */}
                      <span
                        className={`absolute bottom-1 left-2.5 right-2.5 h-[1.5px] rounded-full origin-left transition-transform duration-200 ${active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}
                        style={{ background: BRAND.green }}
                      />
                    </Link>
                  </div>

                  {/* Dropdown */}
                  {item.children && dropdown === item.name && (
                    <div
                      className="absolute top-full left-0 mt-1 min-w-[200px] bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50"
                      style={{ animation: "fadeSlideDown 0.15s ease both" }}
                    >
                      <div className="absolute -top-1.5 left-5 w-3 h-3 bg-white border-t border-l border-gray-100 rotate-45" />

                      {item.children.map((child, ci) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          onClick={() => setDropdown(null)}
                          className={`
                            flex items-center gap-2 px-4 py-2 text-sm text-gray-700 normal-case
                            hover:bg-[#2d6a2d]/5 transition-colors
                            ${ci < item.children.length - 1 ? "border-b border-gray-50" : ""}
                          `}
                          style={{ textTransform: "none" }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = BRAND.green; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = ""; }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: `${BRAND.green}66` }} />
                          {titleCase(child.name)}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {/* ── Right Actions ──────────────────────────────── */}
          <div className="flex items-center gap-1 sm:gap-2">

            {/* Currency picker */}
            <div className="relative hidden md:block" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setCurrencyOpen(!currencyOpen)}
                aria-expanded={currencyOpen}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium capitalize tracking-normal text-gray-600 rounded-md transition-all focus-visible:outline-none focus-visible:ring-2"
                onMouseEnter={(e) => { e.currentTarget.style.background = BRAND.greenSofter; e.currentTarget.style.color = BRAND.green; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = ""; }}
              >
                <Globe className="w-3.5 h-3.5" strokeWidth={1.75} />
                {(() => {
                  const name = REGIONS.find((r) => r.code === currency)?.name || currency;
                  return titleCase(name);
                })()}
                <ChevronDown className={`w-3 h-3 transition-transform ${currencyOpen ? "rotate-180" : ""}`} />
              </button>
              {currencyOpen && (
                <div
                  className="absolute top-full right-0 mt-2 w-44 bg-white rounded-xl shadow-2xl border border-gray-100 py-1.5 z-50"
                  style={{ animation: "fadeSlideDown 0.15s ease both" }}
                >
                  {REGIONS.map((r) => (
                    <button
                      key={r.code}
                      onClick={() => { changeCurrency(r.code); setCurrencyOpen(false); }}
                      className="w-full text-left px-4 py-2 text-xs transition-colors flex items-center justify-between"
                      style={currency === r.code
                        ? { color: BRAND.green, fontWeight: 700, background: BRAND.greenSoft }
                        : { color: "#4B5563" }}
                      onMouseEnter={(e) => { if (currency !== r.code) e.currentTarget.style.background = "#F9FAFB"; }}
                      onMouseLeave={(e) => { if (currency !== r.code) e.currentTarget.style.background = "transparent"; }}
                    >
                      <span>{r.name}</span>
                      <span className="text-gray-400">{r.symbol}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              aria-expanded={searchOpen}
              aria-label="Search"
              className="p-2 rounded-md text-gray-600 transition-all focus-visible:outline-none focus-visible:ring-2"
              onMouseEnter={(e) => { e.currentTarget.style.background = BRAND.greenSofter; e.currentTarget.style.color = BRAND.green; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = ""; }}
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist - Desktop Only */}
            <Link
              href={ROUTES.WISHLIST}
              className="hidden lg:flex p-2 text-gray-700 hover:text-rose-500 transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" strokeWidth={1.5} />
              {wishlistTotal > 0 && (
                <span
                  key={wishlistTotal}
                  className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full"
                  style={{ animation: wishPop ? "badgePop 0.4s ease" : "none" }}
                >
                  {wishlistTotal}
                </span>
              )}
            </Link>

            {/* Profile - Desktop Only */}
            <Link
              href={user ? ROUTES.PROFILE : ROUTES.LOGIN}
              className="hidden lg:flex p-2 text-gray-700 hover:text-amber-600 transition-colors"
              aria-label={user ? "My profile" : "Sign in"}
            >
              <User className="w-5 h-5" strokeWidth={1.5} />
            </Link>

            {/* Cart */}
            <Link
              href={ROUTES.CART}
              className="relative p-2 rounded-md text-gray-600 transition-all focus-visible:outline-none focus-visible:ring-2"
              aria-label="Cart"
              onMouseEnter={(e) => { e.currentTarget.style.background = BRAND.greenSofter; e.currentTarget.style.color = BRAND.green; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = ""; }}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span
                  key={cartCount}
                  className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-white text-[10px] font-bold rounded-full"
                  style={{ background: BRAND.green, animation: cartPop ? "badgePop 0.4s ease" : "none" }}
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 rounded-md text-gray-700 transition-all focus-visible:outline-none focus-visible:ring-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
              onMouseEnter={(e) => { e.currentTarget.style.background = BRAND.greenSofter; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <div className="relative w-5 h-5">
                <Menu className={`w-5 h-5 absolute inset-0 transition-all duration-200 ${mobileMenuOpen ? "opacity-0 rotate-90" : "opacity-100 rotate-0"}`} />
                <X className={`w-5 h-5 absolute inset-0 transition-all duration-200 ${mobileMenuOpen ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"}`} />
              </div>
            </button>
          </div>
        </nav>

        {/* ── Mobile Menu ─────────────────────────────────────── */}
        <div
          className={`
            lg:hidden overflow-hidden transition-all duration-300 ease-in-out
            border-t border-gray-100 bg-white
            ${mobileMenuOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"}
          `}
        >
          <div className="overflow-y-auto max-h-[80vh] px-4 py-2">
            {/* Mobile Account Links */}
            <div className="flex flex-col py-4 border-b border-gray-100">
              <Link
                href={ROUTES.WISHLIST}
                className="flex items-center gap-3 px-2 py-3 text-gray-800 hover:text-rose-500 transition-colors rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Heart className="w-5 h-5 text-rose-500" strokeWidth={1.5} />
                <span className="text-sm font-medium capitalize tracking-normal">My Wishlist</span>
                {wishlistTotal > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full ml-auto">
                    {wishlistTotal}
                  </span>
                )}
              </Link>
              <Link
                href={user ? ROUTES.PROFILE : ROUTES.LOGIN}
                className="flex items-center gap-3 px-2 py-3 text-gray-800 hover:text-amber-600 transition-colors rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="w-5 h-5 text-amber-600" strokeWidth={1.5} />
                <span className="text-sm font-medium capitalize tracking-normal">
                  {user ? "My Profile" : "Login / Register"}
                </span>
              </Link>
            </div>

            {/* Mobile currency */}
            <div className="flex flex-col gap-2 py-3 border-b border-gray-100 mb-1">
              <span className="text-xs text-gray-400 capitalize tracking-normal flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> Select Region
              </span>
              <div className="flex flex-col gap-2">
                {REGIONS.map((r) => (
                  <button
                    key={r.code}
                    onClick={() => { changeCurrency(r.code); setMobileMenuOpen(false); }}
                    className="text-sm px-4 py-2.5 rounded-lg border text-left flex justify-between items-center transition-all"
                    style={currency === r.code
                      ? { background: BRAND.green, borderColor: BRAND.green, color: "#fff", fontWeight: 700 }
                      : { borderColor: "#E5E7EB", color: "#374151" }}
                  >
                    <span>{r.name}</span>
                    <span className={currency === r.code ? "text-white/80" : "text-gray-400"}>{r.symbol}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile nav links */}
            <ul className="flex flex-col">
              {NAV_LINKS.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.name} className="border-b border-gray-50 last:border-0">
                    <div className="flex items-center justify-between">
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className="flex-1 py-3 text-base font-medium transition-colors"
                        style={{ color: active ? BRAND.green : "#1F2937" }}
                        onClick={() => { if (!item.children) setMobileMenuOpen(false); }}
                      >
                        {titleCase(item.name)}
                      </Link>
                      {item.children && (
                        <button
                          onClick={() => setMobileDropdown(mobileDropdown === item.name ? null : item.name)}
                          aria-expanded={mobileDropdown === item.name}
                          className="p-2 text-gray-400 transition-colors"
                          style={{ color: mobileDropdown === item.name ? BRAND.green : undefined }}
                        >
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${mobileDropdown === item.name ? "rotate-180" : ""}`}
                          />
                        </button>
                      )}
                    </div>

                    {item.children && mobileDropdown === item.name && (
                      <ul className="pl-4 pb-3 space-y-2" style={{ animation: "fadeSlideDown 0.15s ease both" }}>
                        {item.children.map((child) => (
                          <li key={child.name}>
                            <Link
                              href={child.href}
                              className="flex items-center gap-2 py-1.5 text-sm text-gray-500 transition-colors"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                              {titleCase(child.name)}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Mobile user actions */}
            <div className="flex items-center gap-3 py-4 mt-1 border-t border-gray-100">
              {user ? (
                <>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: BRAND.green }}>
                    {user.name?.[0]?.toUpperCase() ?? "U"}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors"
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </>
              ) : (
                <Link
                  href={ROUTES.LOGIN}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-sm font-medium"
                  style={{ color: BRAND.green }}
                >
                  <User className="w-4 h-4" /> Sign In / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Global animation keyframes ───────────────────────── */}
      <style jsx global>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 6s ease infinite;
        }
        @keyframes logo-entrance {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .logo-entrance {
          animation: logo-entrance 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes badgePop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.35); }
          100% { transform: scale(1); }
        }
        :focus-visible {
          outline: none;
        }
        .focus-visible\\:ring-2:focus-visible {
          box-shadow: 0 0 0 2px rgba(45,106,45,0.35);
        }
        @media (prefers-reduced-motion: reduce) {
          .logo-entrance, .animate-gradient-x, * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
    </>
  );
}