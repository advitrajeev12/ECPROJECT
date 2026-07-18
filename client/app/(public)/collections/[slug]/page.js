import ProductListing from "@/components/features/products/listing/ProductListing";
import { formatImageUrl } from "@/lib/utils";

// Map collection slugs to readable titles
const COLLECTION_TITLES = {
    "best-sellers":       "Best Sellers",
    "just-arrival":       "Just Arrived",
    "sustainable-living": "Sustainable Living",
    "bamboo":             "Bamboo Crafts",
    "rugs":               "Rugs & Dhurries",
    "moonj-sikki":        "Moonj & Sikki",
    "apparel":            "Apparel",
    "painting":           "Painting",
};

export default async function CollectionPage({ params }) {
    const { slug } = await params;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

    const title = COLLECTION_TITLES[slug] || (slug ? slug.replace(/-/g, " ") : "Collection");

    let collectionProducts = [];

    try {
        const res = await fetch(`${API_URL}/api/products`, { cache: "no-store" });
        const data = await res.json();

        if (data.success && Array.isArray(data.data)) {
            const allProducts = data.data.map(p => ({
                ...p,
                image: formatImageUrl(p.image || (p.images && p.images[0]) || ""),
                images: (p.images || []).map(formatImageUrl),
            }));

            if (slug === "best-sellers") {
                // Show all products sorted by newest (most recently added first)
                collectionProducts = [...allProducts].reverse();
            } else if (slug === "just-arrival") {
                // Show products added most recently (last 10)
                collectionProducts = [...allProducts].reverse().slice(0, 10);
            } else if (slug === "sustainable-living") {
                // Show all products (eco-friendly nature applies to all)
                collectionProducts = allProducts;
            } else {
                // Filter by category matching the slug
                collectionProducts = allProducts.filter(
                    p => p.category && p.category.toLowerCase() === slug.toLowerCase()
                );
            }
        }
    } catch (error) {
        console.error("Failed to fetch collection products:", error);
    }

    return <ProductListing title={title} products={collectionProducts} category={slug} />;
}
