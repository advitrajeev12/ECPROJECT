import ArtisansContent from "./ArtisansContent";

export const metadata = {
  title: "Our Artisans",
  description:
    "Meet the master craftspeople behind every Bal Jyoti product. 500+ artisans across 15 villages in Bihar keep centuries-old bamboo, sikki, and moonj weaving traditions alive.",
  keywords: [
    "Indian artisans",
    "Bihar craftspeople",
    "bamboo weavers India",
    "sikki grass artisans",
    "handloom weavers Bihar",
    "rural Indian craftsmen",
  ],
  openGraph: {
    title: "Our Artisans — Bal Jyoti Design",
    description:
      "Meet the 500+ master craftspeople keeping Bihar's handcraft traditions alive.",
    images: ["/images/about_heros.png"],
  },
  alternates: {
    canonical: "/artisans",
  },
};

export default function ArtisansPage() {
  return <ArtisansContent />;
}
