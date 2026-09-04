import ProductDetails from "@/components/features/products/ProductDetails";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://baljyotidesign.com";

async function getProduct(slug) {
  try {
    const res = await fetch(`${API_URL}/api/products/${slug}`, { cache: "no-store" });
    const data = await res.json();
    return data.success && data.data ? data.data : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  const image =
    product.images?.[0] ||
    product.image ||
    `${SITE_URL}/images/og-cover.jpg`;

  const imageUrl = image.startsWith("http") ? image : `${SITE_URL}${image}`;

  return {
    title: product.name,
    description:
      product.description?.slice(0, 155) ||
      `Buy ${product.name} — handcrafted by artisans in rural India. Made with ${product.material || "natural materials"}.`,
    keywords: [
      product.name,
      product.category,
      product.craft,
      "handmade India",
      "buy handcrafted",
      "artisan product",
    ].filter(Boolean),
    openGraph: {
      title: `${product.name} | Bal Jyoti Design`,
      description:
        product.description?.slice(0, 155) ||
        `Handcrafted ${product.name} — supporting rural artisans in India.`,
      images: [{ url: imageUrl, width: 800, height: 800, alt: product.name }],
      type: "website",
    },
    alternates: {
      canonical: `/product/${slug}`,
    },
  };
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  let product = null;
  let similarProducts = [];

  try {
    const res = await fetch(`${API_URL}/api/products/${slug}`, { cache: "no-store" });
    const data = await res.json();
    if (data.success && data.data) {
      product = data.data;
    }
  } catch (error) {
    console.error("Failed to fetch product details:", error);
  }

  if (!product) {
    return (
      <div className="p-10 text-center text-xl font-bold mt-20">
        Product not found
      </div>
    );
  }

  try {
    const allRes = await fetch(`${API_URL}/api/products`, { cache: "no-store" });
    const allData = await allRes.json();
    if (allData.success && Array.isArray(allData.data)) {
      similarProducts = allData.data
        .filter(
          (p) =>
            p.category === product.category &&
            String(p._id) !== String(product._id)
        )
        .slice(0, 4);
    }
  } catch (error) {
    console.error("Failed to fetch similar products:", error);
  }

  // JSON-LD Product structured data
  const imageUrl =
    product.images?.[0] || product.image
      ? (product.images?.[0] || product.image).startsWith("http")
        ? product.images?.[0] || product.image
        : `${SITE_URL}${product.images?.[0] || product.image}`
      : `${SITE_URL}/images/og-cover.jpg`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || `Handcrafted ${product.name} by rural Indian artisans.`,
    image: imageUrl,
    sku: String(product._id),
    brand: {
      "@type": "Brand",
      name: "Bal Jyoti Design",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Bal Jyoti Design",
      },
    },
    countryOfOrigin: {
      "@type": "Country",
      name: product.countryOfOrigin || "India",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetails product={product} similarProducts={similarProducts} />
    </>
  );
}
