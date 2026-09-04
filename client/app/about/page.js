import AboutContent from "./AboutContent";

export const metadata = {
  title: "Our Story",
  description:
    "Learn how Bal Jyoti Design was founded in 2018 in rural Bihar to preserve centuries-old Indian handcraft traditions and empower 500+ artisan families across 15 villages.",
  keywords: [
    "about Bal Jyoti Design",
    "Indian handcraft story",
    "Bihar artisans",
    "handcraft heritage India",
    "women empowerment crafts",
    "sustainable fashion India",
  ],
  openGraph: {
    title: "Our Story — Bal Jyoti Design",
    description:
      "From a small village in Bihar to global homes — discover the story behind Bal Jyoti Design and our 500+ artisan partners.",
    images: ["/images/about_heros.png"],
  },
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return <AboutContent />;
}