"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCurrency } from "@/context/CurrencyContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { formatImageUrl } from "@/lib/utils";
import { Heart, ChevronLeft, ChevronRight, Leaf, Globe, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
// ─── Accordion Helper ──────────────────────────────────────────────────────────
function Accordion({ title, children, defaultOpen = false }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-gray-100 dark:border-gray-800">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex justify-between items-center py-4 text-left group"
            >
                <span className="text-[12px] font-bold text-gray-900 dark:text-gray-100 uppercase tracking-widest">
                    {title}
                </span>
                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
                    <ChevronDown className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                </motion.div>
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="pb-5 text-[13px] text-gray-600 dark:text-gray-400 leading-relaxed space-y-2">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function ProductDetails({ product, similarProducts = [] }) {
    const { formatPrice } = useCurrency();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { addToCart } = useCart();
    const router = useRouter();
    const colors = product.colors?.length > 0 ? product.colors : [];

    const [selectedColor, setSelectedColor] = useState(colors[0] || "");
    const [quantity, setQuantity] = useState(1);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const thumbnailContainerRef = useRef(null);

    const isWishlisted = isInWishlist(product.id || product._id);

    const displayImages = product.images?.length > 0
        ? product.images
        : [product.image || "/placeholder.jpg"];

    const handlePrevImage = () => setActiveImageIndex(prev => Math.max(0, prev - 1));
    const handleNextImage = () => setActiveImageIndex(prev => Math.min(displayImages.length - 1, prev + 1));

    useEffect(() => {
        const container = thumbnailContainerRef.current;
        if (!container) return;
        const thumb = container.children[activeImageIndex];
        if (!thumb) return;
        const elLeft = thumb.offsetLeft - container.offsetLeft;
        const elW = thumb.clientWidth;
        if (elLeft < container.scrollLeft) {
            container.scrollTo({ left: Math.max(0, elLeft - 16), behavior: "smooth" });
        } else if (elLeft + elW > container.scrollLeft + container.clientWidth) {
            container.scrollTo({ left: elLeft + elW - container.clientWidth + 16, behavior: "smooth" });
        }
    }, [activeImageIndex]);

    // ── Product detail fields from DB ─────────────────────────────────────────
    const dimensions = product.dimensions || 'Please refer to product description for size details';
    const components = product.components || '1× Handcrafted item as shown';
    const material = product.material || product.craft || 'Natural fibres';
    const countryOfOrigin = product.countryOfOrigin || 'India';
    const artisanImageSrc = formatImageUrl(
        product.artisanImage || 'https://images.unsplash.com/photo-1605286978633-2dec93ff66b9?w=800&q=80'
    );

    // Eco features: split by newline from admin, or use defaults
    const ecoFeaturesList = product.ecoFeatures && product.ecoFeatures.trim()
        ? product.ecoFeatures.split('\n').map(f => f.trim()).filter(Boolean)
        : [
            '100% natural, biodegradable materials — zero synthetic components',
            'No harmful dyes or chemical treatments used in production',
            'Supports sustainable harvesting practices by local communities',
            'Carbon-neutral packaging made from recycled materials',
            'Every purchase contributes to planting 1 tree via our Green Initiative',
        ];

    return (
        <div className="w-full">

            {/* ── MAIN PRODUCT SECTION ───────────────────────────────────────── */}
            <div className="container mx-auto px-4 py-8 md:py-14 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-20 items-start">

                    {/* ── IMAGE GALLERY ─────────────────────────────────────── */}
                    <div className="flex flex-col gap-4">
                        <div className="relative w-full aspect-square bg-[#f5f5f5] dark:bg-gray-900 overflow-hidden">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeImageIndex}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="absolute inset-0"
                                >
                                    <Image
                                        fill
                                        src={formatImageUrl(displayImages[activeImageIndex])}
                                        alt={`${product.name} – view ${activeImageIndex + 1}`}
                                        className="object-cover"
                                        unoptimized={displayImages[activeImageIndex]?.startsWith("http")}
                                        priority
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        {displayImages.length > 0 && (
                            <div className="flex items-center justify-center gap-3 w-full">
                                {displayImages.length > 1 && (
                                    <button onClick={handlePrevImage} disabled={activeImageIndex === 0}
                                        className={`p-1 flex-shrink-0 transition-colors ${activeImageIndex === 0 ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:text-black dark:hover:text-white"}`}>
                                        <ChevronLeft className="w-5 h-5" strokeWidth={1} />
                                    </button>
                                )}
                                <div
                                    ref={thumbnailContainerRef}
                                    className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden py-1 justify-center"
                                    style={{ scrollbarWidth: "none" }}
                                >
                                    {displayImages.map((img, i) => (
                                        <button key={i} onClick={() => setActiveImageIndex(i)}
                                            className={`relative flex-shrink-0 w-[72px] h-[72px] bg-[#f5f5f5] dark:bg-gray-900 transition-all ${activeImageIndex === i ? "border border-gray-900 dark:border-white opacity-100" : "border border-transparent opacity-50 hover:opacity-80"}`}>
                                            <Image fill src={formatImageUrl(img)} alt={`thumb-${i}`} className="object-cover" unoptimized={img?.startsWith("http")} />
                                        </button>
                                    ))}
                                </div>
                                {displayImages.length > 1 && (
                                    <button onClick={handleNextImage} disabled={activeImageIndex === displayImages.length - 1}
                                        className={`p-1 flex-shrink-0 transition-colors ${activeImageIndex === displayImages.length - 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:text-black dark:hover:text-white"}`}>
                                        <ChevronRight className="w-5 h-5" strokeWidth={1} />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── PRODUCT INFO ───────────────────────────────────────── */}
                    <div className="flex flex-col gap-5 sticky top-[88px]">

                        {/* Name & Price */}
                        <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 leading-snug mb-3">
                                {product.name}
                            </h1>
                            <div className="flex items-baseline gap-3 flex-wrap">
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {formatPrice(product.price)}
                                </span>
                                {product.originalPrice && (
                                    <span className="text-base text-gray-400 line-through">
                                        {formatPrice(product.originalPrice)}
                                    </span>
                                )}
                                {product.discount && (
                                    <span className="text-sm text-emerald-600 font-semibold">{product.discount} off</span>
                                )}
                            </div>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-wider">Taxes included</p>
                        </div>

                        {/* Color */}
                        {colors.length > 0 && (
                            <div>
                                <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">
                                    Color — <span className="text-gray-900 dark:text-white">{selectedColor}</span>
                                </p>
                                <div className="flex gap-2 flex-wrap">
                                    {colors.map(color => (
                                        <button key={color} onClick={() => setSelectedColor(color)}
                                            className={`px-4 py-2 border text-[12px] tracking-wide transition-all rounded-none ${selectedColor === color
                                                ? "border-gray-900 dark:border-white text-gray-900 dark:text-white"
                                                : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-500"}`}>
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity */}
                        <div>
                            <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">Quantity</p>
                            <div className="inline-flex items-center border border-gray-300 dark:border-gray-700 rounded-none overflow-hidden">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xl font-light">
                                    −
                                </button>
                                <span className="w-12 text-center text-sm font-medium text-gray-900 dark:text-white border-x border-gray-200 dark:border-gray-700 h-10 flex items-center justify-center">
                                    {quantity}
                                </span>
                                <button onClick={() => setQuantity(quantity + 1)}
                                    className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xl font-light">
                                    +
                                </button>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col gap-3 pt-1">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => addToCart(product, quantity, undefined, selectedColor)}
                                className="w-full border border-gray-900 dark:border-gray-200 text-gray-900 dark:text-gray-100 text-[12px] font-bold uppercase tracking-widest py-4 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-colors">
                                Add to Cart
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => { addToCart(product, quantity, undefined, selectedColor); router.push(ROUTES.CHECKOUT); }}
                                className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[12px] font-bold uppercase tracking-widest py-4 hover:bg-black dark:hover:bg-gray-100 transition-colors">
                                Buy it Now
                            </motion.button>
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => toggleWishlist(product.id || product._id)}
                                className={`flex items-center justify-center gap-2 text-[11px] uppercase font-bold tracking-widest pt-2 transition-colors ${isWishlisted ? "text-gray-900 dark:text-white" : "text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}>
                                <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
                                {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
                            </motion.button>
                        </div>

                        {/* Shipping */}
                        <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-1">
                            <p className="text-[13px] text-gray-700 dark:text-gray-300 font-medium">Free Shipping Across India</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-500 font-semibold tracking-widest uppercase">
                                Standard Delivery: Within 5–8 Working Days
                            </p>
                        </div>

                        {/* ── ACCORDIONS ──────────────────────────────────────── */}
                        <div className="mt-2 border-t border-gray-100 dark:border-gray-800">

                            <Accordion title="Product Overview" defaultOpen>
                                <p className="text-gray-600 dark:text-gray-400">{product.description || "A beautifully handcrafted product made with traditional artisan techniques passed down through generations."}</p>
                                <div className="mt-4 space-y-2">
                                    <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Specifications</p>
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[12px]">
                                        <div className="flex flex-col">
                                            <span className="text-gray-400 dark:text-gray-500 text-[10px] uppercase tracking-wider">Dimensions</span>
                                            <span className="text-gray-800 dark:text-gray-200 font-medium">{dimensions}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-gray-400 dark:text-gray-500 text-[10px] uppercase tracking-wider">Components</span>
                                            <span className="text-gray-800 dark:text-gray-200 font-medium">{components}</span>
                                        </div>
                                    </div>
                                </div>
                            </Accordion>

                            <Accordion title="Material Used">
                                <div className="flex items-start gap-3">
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-800 dark:text-gray-200 capitalize">{material}</p>
                                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                                            All materials are responsibly sourced from local communities. Natural variations in colour and texture are inherent to handmade items and are a mark of authenticity.
                                        </p>
                                    </div>
                                </div>
                            </Accordion>

                            <Accordion title="Eco-Friendly Green Features">
                                <div className="space-y-3">
                                    {ecoFeaturesList.map((point, i) => (
                                        <div key={i} className="flex items-start gap-2">
                                            <Leaf className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                                            <span>{point}</span>
                                        </div>
                                    ))}
                                </div>
                            </Accordion>

                            <Accordion title="Country of Origin">
                                <div className="flex items-center gap-3">
                                    <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">{countryOfOrigin}</p>
                                        <p className="text-gray-500 dark:text-gray-400 mt-0.5">
                                            Handcrafted by skilled artisans in India, supporting local economies and traditional craft heritage.
                                        </p>
                                    </div>
                                </div>
                            </Accordion>

                        </div>
                    </div>
                </div>
            </div>

            {/* ── YOU MAY ALSO LIKE ──────────────────────────────────────────── */}
            {similarProducts.length > 0 && (
                <section className="bg-[#faf9f7] dark:bg-gray-950 py-14 border-t border-gray-100 dark:border-gray-800">
                    <div className="container mx-auto px-4 max-w-7xl">
                        <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-8 text-center">You May Also Like</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                            {similarProducts.map(item => {
                                const itemImage = formatImageUrl(item.image || (item.images && item.images[0]) || '');
                                return (
                                    <Link href={`/product/${item._id}`} key={item._id} className="group block">
                                        <div className="relative aspect-square bg-[#f0efec] dark:bg-gray-900 overflow-hidden mb-3">
                                            <img
                                                src={itemImage}
                                                alt={item.name}
                                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                                            />
                                        </div>
                                        <p className="text-[12px] text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">{item.category}</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">{item.name}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">₹{Number(item.price).toLocaleString('en-IN')}</p>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* ── ARTISAN SPOTLIGHT ──────────────────────────────────────────── */}
            <section className="container mx-auto px-4 py-16 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="relative aspect-[4/5] bg-gray-100 dark:bg-gray-900 overflow-hidden">
                        {/* Use plain img to reliably render any admin-entered external URL */}
                        <img
                            src={artisanImageSrc}
                            alt="Artisan crafting the product"
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        <span className="absolute bottom-5 left-5 text-white text-[10px] uppercase tracking-widest font-bold">
                            Handcrafted with care
                        </span>
                    </div>
                    <div className="flex flex-col gap-5 justify-center">
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest">Meet the Maker</p>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white leading-snug">
                            Crafted by hand.<br />Made with heart.
                        </h2>
                        <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed">
                            Each piece is the result of hours of patient, skilled work by artisans whose families have practised these crafts for generations. Rooted in the villages of rural India, their hands give life to natural materials — transforming them into objects of lasting beauty.
                        </p>
                        <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed">
                            By choosing this product, you are directly supporting the livelihoods of these craftspeople and helping to keep ancient traditions alive.
                        </p>
                        <div className="grid grid-cols-3 gap-4 mt-2 border-t border-gray-100 dark:border-gray-800 pt-6">
                            {[["500+", "Artisans"], ["15+", "Villages"], ["25+", "Craft Forms"]].map(([num, label]) => (
                                <div key={label}>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{num}</p>
                                    <p className="text-[11px] text-gray-400 uppercase tracking-widest">{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
