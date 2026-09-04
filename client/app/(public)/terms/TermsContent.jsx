"use client";
import React from 'react';
import { motion } from "framer-motion";
import { Gavel, ShoppingBag, CreditCard, PackageX, ScrollText, HelpCircle } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function TermsPage() {
  const sections = [
    {
      id: "terms-intro",
      title: "1. Use of Website",
      icon: ScrollText,
      content: "By accessing Bal Jyoti Design, you agree to use our site for lawful purposes only. You must be at least 18 years old or using the site under adult supervision."
    },
    {
      id: "products",
      title: "2. Products & Handcrafting",
      icon: ShoppingBag,
      content: "We sell handcrafted products made by rural artisans. Due to the handmade nature, slight variations in color, texture, and size may occur and are celebrated as marks of authenticity."
    },
    {
      id: "payments",
      title: "3. Pricing & Payments",
      icon: CreditCard,
      iconColor: "text-blue-600",
      content: "All prices are in INR (₹) or USD ($) as per your selection. We reserve the right to change prices. Payments must be made through our secure integrated payment gateways."
    },
    {
      id: "orders",
      title: "4. Orders & Cancellation",
      icon: PackageX,
      content: "We reserve the right to accept or reject any order. Cancellations are only permitted before the order has been dispatched from our artisan clusters."
    },
    {
      id: "governing-law",
      title: "5. Governing Law",
      icon: Gavel,
      content: "These terms are governed by the laws of India. Any disputes will be subject to the exclusive jurisdiction of the courts in Bihar, India."
    }
  ];

  return (
    <div className="bg-[#fcfaf7] min-h-screen pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-6"
          >
            Terms & <span className="text-amber-600 italic">Conditions</span>
          </motion.h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Please read these terms carefully before starting your heritage shopping journey 
            with Bal Jyoti Design.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Sidebar Nav */}
          <div className="lg:col-span-3 hidden lg:block">
            <div className="sticky top-32 space-y-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">Support Center</p>
              <Link href={ROUTES.SHIPPING} className="block px-6 py-3 text-gray-500 hover:text-amber-600 transition-all font-medium">Shipping & Returns</Link>
              <Link href={ROUTES.PRIVACY} className="block px-6 py-3 text-gray-500 hover:text-amber-600 transition-all font-medium">Privacy Policy</Link>
              <Link href={ROUTES.TERMS} className="block px-6 py-3 bg-white shadow-sm border-l-4 border-amber-500 text-amber-700 font-bold rounded-r-xl">Terms of Service</Link>
              <Link href={ROUTES.CONTACT} className="block px-6 py-3 text-gray-500 hover:text-amber-600 transition-all font-medium">Contact Support</Link>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-9 space-y-8">
            {sections.map((section) => (
              <motion.section 
                key={section.id}
                variants={fadeIn}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="bg-white rounded-[1.5rem] p-8 shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600`}>
                    <section.icon size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">{section.title}</h2>
                </div>
                <p className="text-gray-600 leading-relaxed pl-14">
                  {section.content}
                </p>
              </motion.section>
            ))}

            {/* Help Card */}
            <div className="bg-gray-100/50 rounded-[1.5rem] p-10 text-center mt-12 border border-dashed border-gray-300">
               <HelpCircle className="mx-auto text-gray-400 mb-4" size={32} />
               <p className="text-gray-500 mb-6 max-w-lg mx-auto italic font-medium">
                 "By shopping with us, you acknowledge and respect the slow, 
                 artisanal nature of our heritage crafts."
               </p>
               <Link 
                href={ROUTES.CONTACT}
                className="inline-block px-10 py-3 border-2 border-gray-900 text-gray-900 font-bold rounded-full hover:bg-gray-900 hover:text-white transition-all uppercase tracking-widest text-xs"
               >
                 Need Clarification?
               </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
