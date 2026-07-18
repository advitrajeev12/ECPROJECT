import ProductListing from "@/components/features/products/listing/ProductListing";

export default async function ProductListingPage({ params }) {
    // Await params in Next.js 15+
    const { slug } = await params;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

    let categoryProducts = [];
    try {
        const res = await fetch(`${API_URL}/api/products`, { cache: 'no-store' }); // Ensure fresh data
        const data = await res.json();
        if (data.success) {
            // Filter products by category slug (case-insensitive)
            categoryProducts = data.data.filter(product => {
                const cat = product.category?.toLowerCase() || '';
                const reqSlug = slug.toLowerCase();
                return cat === reqSlug || 
                       (reqSlug === 'sikki-moonj' && cat === 'moonj-sikki') ||
                       (reqSlug === 'moonj-sikki' && cat === 'sikki-moonj');
            });
        }
    } catch (error) {
        console.error("Failed to fetch products:", error);
    }

    const title = slug ? slug.replace(/-/g, " ") : "Products";

    return <ProductListing title={title} products={categoryProducts} category={slug} />;
}
