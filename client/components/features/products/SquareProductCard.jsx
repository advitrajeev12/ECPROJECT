"use client";
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCurrency } from "@/context/CurrencyContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { ROUTES } from "@/lib/routes";
import { formatImageUrl } from "@/lib/utils";
import { Heart, ShoppingBag, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const SquareProductCard = ({ product }) => {
    const router = useRouter();
    const { formatPrice } = useCurrency();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { addToCart } = useCart();

    if (!product) return null;

    const isWishlisted = isInWishlist(product._id || product.id);

    const rawImage = product.image || (product.images && product.images.length > 0 ? product.images[0] : null);
    const imageUrl = formatImageUrl(rawImage
        ? (rawImage.startsWith("http") || rawImage.startsWith("data:")
            ? rawImage
            : (rawImage.startsWith('/') ? rawImage : `/${rawImage}`))
        : "/placeholder.jpg");

    const [imgSrc, setImgSrc] = React.useState(imageUrl);

    React.useEffect(() => {
        setImgSrc(imageUrl);
    }, [imageUrl]);

    const handleCardClick = () => {
        router.push(`${ROUTES.PRODUCT}/${product._id || product.id}`);
    };

    const handleWishlistClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(product._id || product.id);
    };

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            viewport={{ once: true }}
            transition={{ 
                duration: 0.5,
                y: { type: "spring", stiffness: 300, damping: 25 }
            }}
            onClick={handleCardClick} 
            className="group/card block cursor-pointer bg-white border border-gray-200 hover:border-amber-600 transition-all duration-500 overflow-hidden"
        >
            <div className="relative overflow-hidden aspect-square bg-gray-50 group-hover/card:border-amber-200/50 transition-all duration-500">
                <Image
                    fill
                    src={imgSrc}
                    alt={product.name || "Product"}
                    className="object-cover transition-transform duration-1000 group-hover/card:scale-110"
                    unoptimized={imgSrc?.startsWith("http")}
                    onError={() => { setImgSrc("/placeholder.jpg"); }}
                />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.discount && (
                        <span className="bg-amber-600 text-white text-[9px] px-2.5 py-1 uppercase font-black tracking-widest shadow-sm">
                            {product.discount}
                        </span>
                    )}
                    {product.isNew && (
                        <span className="bg-emerald-600 text-white text-[9px] px-2.5 py-1 uppercase font-black tracking-widest shadow-sm">
                            New
                        </span>
                    )}
                </div>
                
                {/* Wishlist Button */}
                <button
                    onClick={handleWishlistClick}
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-md rounded-full text-gray-400 shadow-sm hover:text-rose-500 hover:bg-white transition-all duration-300 z-10 scale-0 group-hover/card:scale-100"
                >
                    <Heart
                        className={`w-3.5 h-3.5 transition-colors ${isWishlisted ? 'text-rose-500' : ''}`}
                        fill={isWishlisted ? "currentColor" : "none"}
                    />
                </button>

                {/* Quick Action Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/5 transition-all duration-500 flex flex-col justify-end p-4">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addToCart(product);
                        }}
                        className="w-full py-3 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] translate-y-8 opacity-0 group-hover/card:translate-y-0 group-hover/card:opacity-100 transition-all duration-500 flex items-center justify-center gap-2 hover:bg-[#1a5b3a]"
                    >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Quick Add
                    </button>
                </div>
            </div>

            <div className="flex flex-col items-center text-center space-y-2 px-3 py-5">
                <p className="text-[9px] font-black text-amber-700 uppercase tracking-[0.25em]">
                    {product.category || "Authentic Craft"}
                </p>
                <h3 className="text-[13px] md:text-sm font-bold text-gray-900 line-clamp-2 min-h-[2.5rem] group-hover/card:text-amber-800 transition-colors leading-tight">
                    {product.name}
                </h3>
                
                <div className="flex items-center justify-center gap-3 pt-1">
                    <span className="text-base font-black text-gray-900 tracking-tight">
                        {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-xs font-medium text-gray-400 line-through">
                            {formatPrice(product.originalPrice)}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default SquareProductCard;
