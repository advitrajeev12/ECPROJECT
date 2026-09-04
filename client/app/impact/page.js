import ImpactContent from "./ImpactContent";

export const metadata = {
  title: "Our Impact",
  description:
    "Explore the real-world impact of Bal Jyoti Design. From empowering women artisans to preserving biodegradable crafts, discover how every purchase creates lasting change in rural India.",
  keywords: [
    "Bal Jyoti impact",
    "artisan empowerment India",
    "sustainable handcrafts",
    "women empowerment Bihar",
    "ethical handmade products",
    "social enterprise India",
  ],
  openGraph: {
    title: "Our Impact — Bal Jyoti Design",
    description:
      "From 500 artisans in 15 Bihar villages — the real impact of choosing handmade.",
    images: ["/images/about_heros.png"],
  },
  alternates: {
    canonical: "/impact",
  },
};

export default function ImpactPage() {
  return <ImpactContent />;
}
