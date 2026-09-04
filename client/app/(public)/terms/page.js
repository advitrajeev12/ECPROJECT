import TermsContent from "./TermsContent";

export const metadata = {
  title: "Terms of Service",
  description:
    "Read Bal Jyoti Design's terms of service. Understand your rights and responsibilities when purchasing handcrafted products from our platform.",
  robots: { index: true, follow: false },
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return <TermsContent />;
}
