import ProductListing from "@/components/features/products/listing/ProductListing";

export default async function SubProductListingPage({ params }) {
    // Await params in Next.js 15+
    const { slug, subslug } = await params;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

    let categoryProducts = [];
    try {
        const res = await fetch(`${API_URL}/api/products`, { cache: 'no-store' }); // Ensure fresh data
        const data = await res.json();
        if (data.success) {
            // Filter products by category slug (case-insensitive) and subslug
            categoryProducts = data.data.filter(product => {
                const cat = product.category?.toLowerCase() || '';
                const reqSlug = slug.toLowerCase();
                const isCategoryMatch = cat === reqSlug || 
                                        (reqSlug === 'sikki-moonj' && cat === 'moonj-sikki') ||
                                        (reqSlug === 'moonj-sikki' && cat === 'sikki-moonj');
                
                const exactSubCategoryMatch = product.subCategory?.toLowerCase() === subslug.toLowerCase();
                
                const subcategoryClean = subslug.replace(/-/g, ' ').toLowerCase();
                const isFallbackMatch = (product.name && product.name.toLowerCase().includes(subcategoryClean)) || 
                                        (product.description && product.description.toLowerCase().includes(subcategoryClean));
                                        
                return isCategoryMatch && (exactSubCategoryMatch || isFallbackMatch);
            });
        }
    } catch (error) {
        console.error("Failed to fetch products:", error);
    }

    // Capitalize titles
    const capitalize = (s) => typeof s === 'string' ? s.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : s;

    const categoryTitle = slug ? capitalize(slug.replace(/-/g, " ")) : "Products";
    const subcategoryTitle = subslug ? capitalize(subslug.replace(/-/g, " ")) : "";
    const title = `${categoryTitle} - ${subcategoryTitle}`;

    // Reusing the ProductListing component, passing the refined subcategory list
    return <ProductListing title={title} products={categoryProducts} category={slug} />;
}
