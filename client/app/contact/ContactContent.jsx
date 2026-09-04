"use client";
import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Mail, Phone, MapPin, Send,
  MessageSquare, Clock, Globe,
  Facebook, Instagram, Twitter
} from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* ── Hero Section ────────────────────────────────────────── */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/contact_hero.png"
          alt="Contact us"
          fill
          className="object-cover brightness-50"
          priority
        />
        <div className="relative z-10 text-center text-white px-4">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-5xl md:text-7xl font-serif font-bold mb-4"
          >
            We're Here <span className="text-amber-400 italic">to Help</span>.
          </motion.h1>
          <p className="text-lg md:text-xl font-light opacity-90 max-w-2xl mx-auto">
            Whether you have a question about our crafts, an order, or just want
            to say hello, we'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

          {/* ── Contact Info (4 Columns) ────────────────────────── */}
          <div className="lg:col-span-4 space-y-12">
            <motion.div variants={fadeIn} initial="initial" whileInView="animate" viewport={{ once: true }}>
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8">Reach Out Directly</h2>

              <div className="space-y-8">
                <div className="flex items-start gap-5 group">
                  <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Call Us</p>
                    <p className="text-lg font-bold text-gray-800">+91 8008315201</p>
                    <p className="text-sm text-gray-500">Mon - Sat, 10am - 7pm IST</p>
                  </div>
                </div>

                <div className="flex items-start gap-5 group">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Email Us</p>
                    <p className="text-lg font-bold text-gray-800">info@baljyotidesign.com</p>
                    <p className="text-sm text-gray-500">We respond within 24 hours.</p>
                  </div>
                </div>

                <div className="flex items-start gap-5 group">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Visit Us</p>
                    <p className="text-lg font-bold text-gray-800">Heritage Craft Center</p>
                    <p className="text-sm text-gray-500">Bodhgaya, India — Artisan Hub</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeIn} initial="initial" whileInView="animate" viewport={{ once: true }} className="pt-8 border-t border-gray-100">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Connect with the Community</h3>
              <div className="flex gap-4">
                {[Facebook, Instagram, Twitter].map((Icon, i) => (
                  <button key={i} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-900 hover:text-white transition-all">
                    <Icon size={18} />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── Contact Form (8 Columns) ────────────────────────── */}
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gray-50 p-8 md:p-12 rounded-[2.5rem] border border-gray-100"
            >
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8">Send Us a Message</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:border-amber-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                      className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:border-amber-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Inquiry about custom rug"
                    className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:border-amber-500 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Message</label>
                  <textarea
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={6}
                    placeholder="Tell us how we can help..."
                    className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:border-amber-500 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`
                    w-full py-5 rounded-full font-bold text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all
                    ${submitted
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-900 text-white hover:bg-emerald-700 active:scale-95"}
                  `}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : submitted ? (
                    "Message Sent Successfully"
                  ) : (
                    <>Send Message <Send size={16} /></>
                  )}
                </button>
              </form>
            </motion.div>
          </div>

        </div>
      </section>

      {/* ── FAQ Quick Access ────────────────────────────────────── */}
      <section className="bg-gray-900 py-24 px-6 overflow-hidden relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              Icon: Clock,
              title: "Order Status",
              desc: "Check the status of your handcrafted order in real-time."
            },
            {
              Icon: MessageSquare,
              title: "Custom Queries",
              desc: "Have a specific design in mind? Let's discuss a custom order."
            },
            {
              Icon: Globe,
              title: "Bulk & B2B",
              desc: "For corporate gifting or hospitality interior projects."
            },
          ].map((item, i) => (
            <div key={i} className="p-8 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all cursor-pointer group">
              <item.Icon className="text-amber-400 mb-6 group-hover:scale-110 transition-transform" size={32} />
              <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
