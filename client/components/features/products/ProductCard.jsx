"use client";
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCurrency } from "@/context/CurrencyContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { ROUTES } from "@/lib/routes";
import { formatImageUrl } from "@/lib/utils";
import { Heart, ShoppingBag } from "lucide-react";

/**
 * ProductCard component redesigned for a high-end, high-density grid.
 * Focuses on cinematic visuals and refined typography.
 */
const ProductCard = ({ product }) => {
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
        <div 
            onClick={handleCardClick} 
            className="group/card block cursor-pointer bg-white transition-all duration-300"
        >
            <div className="relative overflow-hidden aspect-[3/4] mb-3 bg-gray-50 rounded-lg group-hover/card:shadow-md transition-all duration-500">
                <Image
                    fill
                    src={imgSrc}
                    alt={product.name || "Product"}
                    className="object-cover transition-transform duration-700 group-hover/card:scale-105"
                    unoptimized={imgSrc?.startsWith("http")}
                    onError={() => { setImgSrc("/placeholder.jpg"); }}
                />
                
                {product.discount && (
                    <span className="absolute top-2 left-2 bg-amber-600 text-white text-[10px] px-2 py-0.5 uppercase font-bold tracking-widest rounded-sm shadow-sm">
                        {product.discount}
                    </span>
                )}
                
                <button
                    onClick={handleWishlistClick}
                    className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-md rounded-full text-gray-400 shadow-sm hover:text-rose-500 hover:bg-white transition-all duration-300 z-10"
                    title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                    <Heart
                        className={`w-[14px] h-[14px] transition-colors ${isWishlisted ? 'text-rose-500' : ''}`}
                        fill={isWishlisted ? "currentColor" : "none"}
                    />
                </button>

                {/* Add to Bag: Modern, minimal overlay */}
                <div className="absolute left-0 right-0 bottom-0 translate-y-2 opacity-0 group-hover/card:translate-y-0 group-hover/card:opacity-100 transition-all duration-300 w-full z-20 p-2">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addToCart(product);
                        }}
                        className="w-full py-2 bg-gray-900/95 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider hover:bg-amber-600 flex items-center justify-center gap-2 transition-all rounded shadow-lg"
                    >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Quick Add
                    </button>
                </div>
            </div>

            <div className="flex flex-col items-center text-center space-y-1">
                <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest line-clamp-1 h-3.5 opacity-80 group-hover/card:opacity-100 transition-opacity">
                    {product.category || "Heritage"}
                </p>
                <h3 className="text-sm font-bold text-gray-900 line-clamp-1 px-1 group-hover/card:text-amber-700 transition-colors">
                    {product.name}
                </h3>
                
                <div className="flex items-center justify-center gap-2 pt-0.5">
                    <span className="text-sm font-extrabold text-gray-900">
                        {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-[11px] font-medium text-gray-400 line-through">
                            {formatPrice(product.originalPrice)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
