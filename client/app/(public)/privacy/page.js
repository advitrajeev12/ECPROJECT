import PrivacyContent from "./PrivacyContent";

export const metadata = {
  title: "Privacy Policy",
  description:
    "Read Bal Jyoti Design's privacy policy. We are committed to protecting your personal data and explaining how we collect, use, and safeguard your information.",
  robots: { index: true, follow: false },
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
