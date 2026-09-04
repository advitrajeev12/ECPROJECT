const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://baljyotidesign.com";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/user/checkout",
          "/user/payment",
          "/user/profile",
          "/user/cart",
          "/user/wishlist",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
