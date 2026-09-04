import ContactContent from "./ContactContent";

export const metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Bal Jyoti Design. Whether you have questions about our handcrafted products, bulk orders, or artisan partnerships — we'd love to hear from you.",
  keywords: [
    "contact Bal Jyoti Design",
    "handcraft enquiry India",
    "bulk order handmade",
    "artisan partnership",
  ],
  openGraph: {
    title: "Contact Us — Bal Jyoti Design",
    description:
      "Reach out to Bal Jyoti Design for product enquiries, bulk orders, or artisan partnerships.",
  },
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return <ContactContent />;
}
