import ShippingContent from "./ShippingContent";

export const metadata = {
  title: "Shipping & Returns",
  description:
    "Learn about Bal Jyoti Design's shipping policy, delivery timelines, and hassle-free returns process for all handcrafted products.",
  keywords: [
    "shipping policy India",
    "handcraft delivery",
    "returns policy",
    "free shipping handmade",
  ],
  openGraph: {
    title: "Shipping & Returns — Bal Jyoti Design",
    description:
      "Shipping policy, delivery timelines, and return process for Bal Jyoti Design products.",
  },
  alternates: {
    canonical: "/shipping",
  },
};

export default function ShippingPage() {
  return <ShippingContent />;
}
