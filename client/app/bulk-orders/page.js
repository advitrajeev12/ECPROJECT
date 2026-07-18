"use client";
import React, { useState } from "react";
import { Mail, Phone, Building, User, FileText, Send } from "lucide-react";

export default function BulkOrdersPage() {
    const [formData, setFormData] = useState({
        name: "",
        company: "",
        email: "",
        phone: "",
        productInterest: "",
        quantity: "",
        message: "",
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would typically send the data to your backend
        console.log("Bulk Order Query:", formData);
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 px-4">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-fade-in">
                    <Send size={40} />
                </div>
                <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4 text-center">Inquiry Received!</h2>
                <p className="text-gray-600 text-center max-w-md mb-8">
                    Thank you for your interest in bulk purchasing. Our team will review your requirements and get back to you within 24-48 hours.
                </p>
                <button
                    onClick={() => setSubmitted(false)}
                    className="text-primary font-medium hover:underline"
                >
                    Submit another inquiry
                </button>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-serif font-bold text-primary mb-4">Bulk & Corporate Orders</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Looking for unique, handcrafted gifts for your employees, clients, or special events?
                        We offer customized solutions for bulk orders with competitive pricing.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="grid md:grid-cols-5 h-full">
                        {/* Left Side: Contact Info / Image */}
                        <div className="md:col-span-2 bg-primary text-white p-8 flex flex-col justify-between relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold mb-6">Why Partner With Us?</h3>
                                <ul className="space-y-4 text-white/90 text-sm">
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0"></div>
                                        <span>Authentic indigenous, handcrafted products</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0"></div>
                                        <span>Customization options available</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0"></div>
                                        <span>Support local artisans and communities</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0"></div>
                                        <span>Competitive bulk pricing</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="relative z-10 mt-12">
                                <h4 className="font-bold mb-4">Contact Directly</h4>
                                <div className="space-y-3 text-sm text-white/90">
                                    <div className="flex items-center gap-3">
                                        <Mail size={16} />
                                        <span>bulk@baljyoti.com</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Phone size={16} />
                                        <span>+91 98765 43210</span>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative circles */}
                            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
                        </div>

                        {/* Right Side: Form */}
                        <div className="md:col-span-3 p-8 md:p-10">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="name"
                                                required
                                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                                placeholder="John Doe"
                                                value={formData.name}
                                                onChange={handleChange}
                                            />
                                            <User size={18} className="absolute left-3 top-3 text-gray-400" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Company (Optional)</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="company"
                                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                                placeholder="Company Ltd."
                                                value={formData.company}
                                                onChange={handleChange}
                                            />
                                            <Building size={18} className="absolute left-3 top-3 text-gray-400" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                name="email"
                                                required
                                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                                placeholder="john@example.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                            />
                                            <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                        <div className="relative">
                                            <input
                                                type="tel"
                                                name="phone"
                                                required
                                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                                placeholder="+91 98765 00000"
                                                value={formData.phone}
                                                onChange={handleChange}
                                            />
                                            <Phone size={18} className="absolute left-3 top-3 text-gray-400" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Interest & Quantity</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="productInterest"
                                            required
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                            placeholder="e.g., 50 Bamboo Baskets"
                                            value={formData.productInterest}
                                            onChange={handleChange}
                                        />
                                        <FileText size={18} className="absolute left-3 top-3 text-gray-400" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Message / Specific Requirements</label>
                                    <textarea
                                        name="message"
                                        rows="4"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none"
                                        placeholder="Tell us more about your requirements..."
                                        value={formData.message}
                                        onChange={handleChange}
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-primary/20 hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200"
                                >
                                    Request Quote
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
