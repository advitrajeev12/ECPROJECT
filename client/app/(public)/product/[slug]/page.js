import ProductDetails from "@/components/features/products/ProductDetails";

export default async function ProductDetailPage({ params }) {
    const { slug } = await params;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

    let product = null;
    let similarProducts = [];

    try {
        // Fetch the main product
        const res = await fetch(`${API_URL}/api/products/${slug}`, { cache: 'no-store' });
        const data = await res.json();
        if (data.success && data.data) {
            product = data.data;
        }
    } catch (error) {
        console.error("Failed to fetch product details:", error);
    }

    if (!product) {
        return <div className="p-10 text-center text-xl font-bold mt-20">Product not found</div>;
    }

    try {
        // Fetch all products and filter by same category, excluding current product
        const allRes = await fetch(`${API_URL}/api/products`, { cache: 'no-store' });
        const allData = await allRes.json();
        if (allData.success && Array.isArray(allData.data)) {
            similarProducts = allData.data
                .filter(p => p.category === product.category && String(p._id) !== String(product._id))
                .slice(0, 4); // Show max 4
        }
    } catch (error) {
        console.error("Failed to fetch similar products:", error);
    }

    return <ProductDetails product={product} similarProducts={similarProducts} />;
}
