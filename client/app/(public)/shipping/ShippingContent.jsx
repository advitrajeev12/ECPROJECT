"use client";
import React from 'react';
import { motion } from "framer-motion";
import { Truck, RotateCcw, ShieldCheck, Box, Clock, HelpCircle } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function ShippingPage() {
  const sections = [
    {
      id: "shipping",
      title: "Shipping Policy",
      icon: Truck,
      content: [
        { h: "Order Processing", p: "Every Bal Jyoti product is handcrafted. Orders are processed within 1–3 business days after confirmation. For custom or large items, processing may take up to 7 days." },
        { h: "Delivery Timeline", p: "Standard domestic delivery takes 5–10 business days. International shipping varies by location, typically arriving within 10–21 days." },
        { h: "Shipping Charges", p: "Shipping is calculated at checkout based on weight and volume. We offer free shipping on domestic orders above ₹5,000." },
        { h: "Tracking Your Art", p: "Once dispatched, you will receive a tracking link via SMS and Email to follow your heritage piece home." }
      ]
    },
    {
      id: "returns",
      title: "Returns & Exchanges",
      icon: RotateCcw,
      content: [
        { h: "7-Day Return Window", p: "We accept returns within 7 days of delivery for damaged, defective, or incorrect items. Please record an unboxing video to assist the verification process." },
        { h: "Non-Returnable Items", p: "Customized products, final sale items, and products showing signs of usage cannot be returned. Minor artisan variations are signatures of handwork, not defects." },
        { h: "Refund Process", p: "Approved refunds are processed within 5–7 business days to your original payment method. For COD orders, we provide store credit or UPI transfer." }
      ]
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
            Shipping & <span className="text-amber-600 italic">Returns</span>
          </motion.h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Everything you need to know about how your heritage pieces travel from our 
            artisan clusters to your doorstep.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Sidebar Nav */}
          <div className="lg:col-span-3 hidden lg:block">
            <div className="sticky top-32 space-y-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">Support Center</p>
              <Link href={ROUTES.SHIPPING} className="block px-6 py-3 bg-white shadow-sm border-l-4 border-amber-500 text-amber-700 font-bold rounded-r-xl">Shipping & Returns</Link>
              <Link href={ROUTES.PRIVACY} className="block px-6 py-3 text-gray-500 hover:text-amber-600 transition-all font-medium">Privacy Policy</Link>
              <Link href={ROUTES.TERMS} className="block px-6 py-3 text-gray-500 hover:text-amber-600 transition-all font-medium">Terms of Service</Link>
              <Link href={ROUTES.CONTACT} className="block px-6 py-3 text-gray-500 hover:text-amber-600 transition-all font-medium">Contact Support</Link>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-9 space-y-16">
            {sections.map((section) => (
              <motion.section 
                key={section.id}
                variants={fadeIn}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-4 mb-10 border-b border-gray-50 pb-8">
                  <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                    <section.icon size={28} />
                  </div>
                  <h2 className="text-3xl font-serif font-bold text-gray-900">{section.title}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {section.content.map((item, i) => (
                    <div key={i} className="space-y-3">
                      <h3 className="text-lg font-bold text-gray-800">{item.h}</h3>
                      <p className="text-gray-500 leading-relaxed text-sm">{item.p}</p>
                    </div>
                  ))}
                </div>
              </motion.section>
            ))}

            {/* Help Card */}
            <div className="bg-gray-900 rounded-[2rem] p-10 md:p-16 text-center text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full group-hover:bg-amber-500/20 transition-all" />
               <HelpCircle className="mx-auto text-amber-400 mb-6" size={48} />
               <h2 className="text-3xl font-serif font-bold mb-4">Still need answers?</h2>
               <p className="text-white/60 mb-8 max-w-xl mx-auto">
                 Our support team is intimately familiar with every craft process. 
                 We're here to help you with sizing, care instructions, or shipment delays.
               </p>
               <Link 
                href={ROUTES.CONTACT}
                className="inline-block px-10 py-4 bg-amber-500 text-gray-900 font-bold rounded-full hover:bg-amber-400 transition-all"
               >
                 Contact Our Team
               </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
