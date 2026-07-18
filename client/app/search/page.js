"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductListing from "@/components/features/products/listing/ProductListing";
import { formatImageUrl } from "@/lib/utils";
import { Search, Loader2 } from "lucide-react";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAndFilter() {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      
      try {
        const res = await fetch(`${API_URL}/api/products`);
        const data = await res.json();

        if (data.success && Array.isArray(data.data)) {
          const allProducts = data.data.map(p => ({
            ...p,
            image: formatImageUrl(p.image || (p.images && p.images[0]) || ""),
            images: (p.images || []).map(formatImageUrl),
          }));

          // Filtering logic: Name, Category, Style, Material, or Description
          const filtered = allProducts.filter(p => {
            const searchStr = `${p.name} ${p.category} ${p.style} ${p.material} ${p.description}`.toLowerCase();
            return searchStr.includes(query.toLowerCase());
          });

          setProducts(filtered);
        } else {
          setError("Failed to load products.");
        }
      } catch (err) {
        console.error("Search fetch error:", err);
        setError("An error occurred while searching.");
      } finally {
        setLoading(false);
      }
    }

    fetchAndFilter();
  }, [query]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-amber-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Searching our heritage collection...</p>
      </div>
    );
  }

  if (error) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="bg-red-50 p-6 rounded-full mb-4">
                <Search className="w-10 h-10 text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h3>
            <p className="text-gray-500 max-w-sm mb-6">{error}</p>
            <button 
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-gray-900 text-white font-bold rounded-full hover:bg-amber-600 transition-all"
            >
                Try Again
            </button>
        </div>
    );
  }

  const title = query ? `Results for "${query}"` : "Search Our Collection";

  return (
    <div className="bg-white min-h-screen pb-20">
      <ProductListing 
        title={title} 
        products={products} 
        category="search" 
      />
      
      {products.length === 0 && (
          <div className="max-w-xl mx-auto text-center px-6 -mt-10">
              <p className="text-gray-400 text-sm mb-8">
                  Try searching for something else like "Bamboo", "Jute Rug", or "Madhubani".
              </p>
          </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="w-10 h-10 text-amber-600 animate-spin mb-4" />
        </div>
    }>
      <SearchResults />
    </Suspense>
  );
}
