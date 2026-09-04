"use client";
import React from 'react';
import { motion } from "framer-motion";
import { Shield, Eye, Lock, RefreshCw, HelpCircle } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function PrivacyPage() {
  const sections = [
    {
      id: "data-collection",
      title: "1. Information We Collect",
      icon: Eye,
      content: "We collect information that you provide directly to us, such as when you create an account, place an order, subscribe to our newsletter, or contact customer support. This may include your name, email address, phone number, shipping address, and payment details."
    },
    {
      id: "data-usage",
      title: "2. How We Use Your Information",
      icon: RefreshCw,
      content: "The information we collect is used to process and fulfill your orders, communicate with you about your account and purchases, provide customer support, and send you promotional offers if you have opted in. We also use your data to improve our website and services."
    },
    {
      id: "data-security",
      title: "3. Data Sharing and Security",
      icon: Lock,
      content: "We do not sell or rent your personal information to third parties. We may share necessary data with trusted service providers (such as shipping partners and payment processors) strictly for fulfilling your orders. We implement industry-standard security measures to protect your personal information against unauthorized access or disclosure."
    },
    {
      id: "your-rights",
      title: "4. Your Rights",
      icon: Shield,
      content: "You have the right to access, update, or delete your personal information. If you wish to exercise any of these rights or have questions about our privacy practices, please contact us at info@baljyotidesign.com."
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
            Privacy <span className="text-amber-600 italic">Policy</span>
          </motion.h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            At Bal Jyoti Design, we protect your personal information with the same care 
            we give to our handcrafted heritage pieces.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Sidebar Nav */}
          <div className="lg:col-span-3 hidden lg:block">
            <div className="sticky top-32 space-y-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">Support Center</p>
              <Link href={ROUTES.SHIPPING} className="block px-6 py-3 text-gray-500 hover:text-amber-600 transition-all font-medium">Shipping & Returns</Link>
              <Link href={ROUTES.PRIVACY} className="block px-6 py-3 bg-white shadow-sm border-l-4 border-amber-500 text-amber-700 font-bold rounded-r-xl">Privacy Policy</Link>
              <Link href={ROUTES.TERMS} className="block px-6 py-3 text-gray-500 hover:text-amber-600 transition-all font-medium">Terms of Service</Link>
              <Link href={ROUTES.CONTACT} className="block px-6 py-3 text-gray-500 hover:text-amber-600 transition-all font-medium">Contact Support</Link>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-9 space-y-10">
            {sections.map((section) => (
              <motion.section 
                key={section.id}
                variants={fadeIn}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="bg-white rounded-[1.5rem] p-8 md:p-10 shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                    <section.icon size={24} />
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-gray-900">{section.title}</h2>
                </div>
                <p className="text-gray-600 leading-relaxed text-base">
                  {section.content}
                </p>
              </motion.section>
            ))}

            {/* Help Card */}
            <div className="bg-gray-50 rounded-[1.5rem] p-8 md:p-10 text-center border border-gray-100 mt-16">
               <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4 italic">"Protecting your heritage, protecting your data."</h2>
               <p className="text-gray-500 mb-6 max-w-xl mx-auto">
                 Questions about your data? Reach out to our privacy team.
               </p>
               <Link 
                href={ROUTES.CONTACT}
                className="inline-block px-8 py-3 bg-gray-900 text-white font-bold rounded-full hover:bg-[#1a5b3a] transition-all"
               >
                 Contact Privacy Team
               </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
