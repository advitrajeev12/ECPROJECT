const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://baljyotidesign.com";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

/** Static pages with their SEO priority and change frequency */
const STATIC_ROUTES = [
  { path: "/",             priority: 1.0, changeFrequency: "daily" },
  { path: "/about",        priority: 0.8, changeFrequency: "monthly" },
  { path: "/collections",  priority: 0.9, changeFrequency: "weekly" },
  { path: "/artisans",     priority: 0.7, changeFrequency: "monthly" },
  { path: "/impact",       priority: 0.7, changeFrequency: "monthly" },
  { path: "/contact",      priority: 0.6, changeFrequency: "yearly" },
  { path: "/bulk-orders",  priority: 0.7, changeFrequency: "monthly" },
  { path: "/archive",      priority: 0.6, changeFrequency: "weekly" },
  { path: "/shipping",     priority: 0.4, changeFrequency: "yearly" },
  { path: "/privacy",      priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms",        priority: 0.3, changeFrequency: "yearly" },
  { path: "/login",        priority: 0.3, changeFrequency: "yearly" },
  { path: "/register",     priority: 0.3, changeFrequency: "yearly" },
  { path: "/search",       priority: 0.5, changeFrequency: "daily" },
];

const CATEGORY_SLUGS = [
  "bamboo", "rugs", "moonj-sikki", "wood", "apparel", "painting",
];

export default async function sitemap() {
  const now = new Date().toISOString();

  // Static pages
  const staticEntries = STATIC_ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  // Category collection pages
  const categoryEntries = CATEGORY_SLUGS.map((slug) => ({
    url: `${SITE_URL}/collections/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Dynamic product pages
  let productEntries = [];
  try {
    const res = await fetch(`${API_URL}/api/products`, {
      next: { revalidate: 3600 }, // revalidate hourly
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      productEntries = data.data.map((product) => ({
        url: `${SITE_URL}/product/${product._id}`,
        lastModified: product.updatedAt || now,
        changeFrequency: "weekly",
        priority: 0.7,
      }));
    }
  } catch {
    // Non-fatal — ship static entries without products if API is down
  }

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
