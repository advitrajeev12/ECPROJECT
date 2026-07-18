"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Facebook, Instagram, Twitter, Youtube,
  Mail, ArrowUpRight, ChevronUp, CheckCircle2,
  MapPin, Phone, Globe
} from "lucide-react";
import { ROUTES } from "@/lib/routes";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 5000);
      setEmail("");
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-gradient-to-b from-[#0f172a] to-[#020617] text-white overflow-hidden pt-16 pb-8">
      {/* Decorative Lotus Watermark (Bottom Right) */}
      <div className="absolute bottom-[-40px] right-[-40px] w-64 h-64 pointer-events-none opacity-[0.03] rotate-12">
        <Image src="/images/lotus_icon.png" alt="" fill className="object-contain" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">

          {/* Brand & Mission (4 columns) */}
          <div className="md:col-span-4 space-y-6">
            <Link
              href="/"
              className="flex items-center gap-3 shrink-0 group transition-all duration-500 ease-out logo-entrance"
            >
              <div className="relative transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-green-900/10 group-hover:drop-shadow-xl p-1 bg-white/90 rounded-xl">
                <Image
                  src="/images/logo.png"
                  alt="Bal Jyoti Design"
                  width={100}
                  height={40}
                  className="h-10 w-auto mix-blend-multiply"
                  priority
                />
              </div>
              <div className="flex flex-col leading-none transition-all duration-500 group-hover:translate-x-1">
                <span className="text-xl md:text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#2d6a2d] via-[#4a8a4a] to-[#2d6a2d] drop-shadow-sm animate-gradient-x">
                  Bal Jyoti
                </span>
                <span className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase text-[#7c5a2a] opacity-80 group-hover:opacity-100 group-hover:tracking-[0.4em] transition-all duration-500">
                  Design
                </span>
              </div>
            </Link>

            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              The premier destination for handcrafted Indian heritage collections.
              We bridge rural craftsmanship with modern sustainable designs,
              bringing a piece of India's soul to your home.
            </p>

            <div className="flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-500/60">Follow Us</span>
              <div className="h-px flex-1 bg-white/10 max-w-[40px]" />
              <div className="flex gap-4">
                {[
                  { Icon: Facebook, color: "hover:text-[#1877F2]", href: "#" },
                  { Icon: Instagram, color: "hover:text-[#E4405F]", href: "#" },
                  { Icon: Twitter, color: "hover:text-[#1DA1F2]", href: "#" },
                  { Icon: Youtube, color: "hover:text-[#FF0000]", href: "#" }
                ].map((social, i) => (
                  <a
                    key={i}
                    href={social.href}
                    className={`text-gray-500 transition-all duration-300 transform hover:scale-125 ${social.color}`}
                  >
                    <social.Icon size={18} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links (2 columns) */}
          <div className="md:col-span-2 space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-white/90">Experience</h4>
            <ul className="space-y-4">
              {[
                { name: "About Us", href: ROUTES.ABOUT },
                { name: "Our Artisans", href: ROUTES.ARTISANS },
                { name: "Collections", href: ROUTES.COLLECTIONS },
                { name: "Our Impact", href: ROUTES.IMPACT },
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 text-[11px] uppercase tracking-widest hover:text-amber-500 hover:translate-x-1 transition-all flex items-center gap-2 group">
                    <span className="w-1 h-px bg-white/20 group-hover:w-2 group-hover:bg-amber-500 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support (2 columns) */}
          <div className="md:col-span-2 space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-white/90">Support</h4>
            <ul className="space-y-4">
              {[
                { name: "Shipping & Returns", href: ROUTES.SHIPPING },
                { name: "Privacy Policy", href: ROUTES.PRIVACY },
                { name: "Terms of Service", href: ROUTES.TERMS },
                { name: "Contact Us", href: ROUTES.CONTACT },
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 text-[11px] uppercase tracking-widest hover:text-amber-500 hover:translate-x-1 transition-all flex items-center gap-2 group">
                    <span className="w-1 h-px bg-white/20 group-hover:w-2 group-hover:bg-amber-500 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter (4 columns) */}
          <div className="md:col-span-4 space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-white/90">Join Our Circle</h4>
            <p className="text-gray-400 text-xs leading-relaxed">
              Subscribe to get early access to new collections,
              artisan stories, and exclusive festive offers.
            </p>

            <form onSubmit={handleSubscribe} className="relative group">
              <div className="flex items-center border-b border-white/20 focus-within:border-amber-500 transition-all py-2">
                <Mail size={16} className="text-gray-500 mr-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your Email Address"
                  className="bg-transparent border-none focus:outline-none text-sm flex-1 placeholder:text-gray-600"
                  required
                />
                <button
                  type="submit"
                  className="text-amber-500 hover:text-amber-400 transform transition-transform group-hover:translate-x-1"
                >
                  <ArrowUpRight size={20} />
                </button>
              </div>

              {/* Newsletter Message Overlay */}
              {subscribed && (
                <div className="absolute top-full left-0 mt-3 flex items-center gap-2 text-emerald-400 text-xs animate-in fade-in slide-in-from-top-1 duration-300">
                  <CheckCircle2 size={14} />
                  <span>Welcome to the circle! Check your inbox.</span>
                </div>
              )}
            </form>

            <div className="pt-4 space-y-3">
              <div className="flex items-center gap-3 text-gray-400 text-xs">
                <MapPin size={14} className="text-amber-500/60" />
                <span>Bihar, India — Heritage Craft Center</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 text-xs">
                <Globe size={14} className="text-amber-500/60" />
                <span>Shipping Worldwide</span>
              </div>
            </div>
          </div>

        </div>

        {/* Divider & Social Bottom */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-gray-500">
            <span>Handcrafted in India</span>
            <span className="w-1 h-1 rounded-full bg-amber-500/50" />
            <span>Sustainable Heritage</span>
            <span className="w-1 h-1 rounded-full bg-amber-500/50" />
            <span>Empowering Rural Artisans</span>
          </div>

          <p className="text-gray-600 text-[10px] uppercase tracking-widest">
            © {new Date().getFullYear()} Bal Jyoti Design. All rights reserved.
          </p>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/50 hover:text-amber-500 transition-colors group"
          >
            Back to Top
            <div className="p-2 rounded-full border border-white/10 group-hover:border-amber-500 transition-all">
              <ChevronUp size={12} />
            </div>
          </button>
        </div>
      </div>
    </footer>
  );
}

