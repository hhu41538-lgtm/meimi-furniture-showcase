import { getProductImages, type ProductImages } from "@/lib/imageAssets";

export type Product = {
  slug: string;
  name: string;
  folder: string;
  tagline: string;
  description: string;
  details: string[];
};

export type HydratedProduct = Product & ProductImages;

const products: Product[] = [
  {
    slug: "bamboo-sofa",
    name: "Bamboo Sofa",
    folder: "Bamboo sofa",
    tagline: "Grounded calm, quietly organic.",
    description:
      "Built around a sense of ease, the Bamboo Sofa pairs clean horizontal lines with deep, yielding cushions. Its restrained silhouette settles into a room rather than commanding it — made for long, unhurried afternoons and the slow rhythm of home.",
    details: [
      "Configuration — [2-seater / 3-seater / sectional]",
      "Dimensions — [W___ × D___ × H___ cm]",
      "Upholstery — [available fabrics & leathers]",
      "Handcrafted to order in our Foshan atelier",
      "Custom sizing and materials on request",
    ],
  },
  {
    slug: "bessel-sofa",
    name: "Bessel Sofa",
    folder: "Bessel sofa",
    tagline: "A single, sculptural curve.",
    description:
      "The Bessel Sofa is drawn in one continuous gesture — a low, sweeping form that softens the architecture around it. Generous in depth and quietly confident, it turns a seat into a centrepiece without ever raising its voice.",
    details: [
      "Configuration — [2-seater / 3-seater / curved sectional]",
      "Dimensions — [W___ × D___ × H___ cm]",
      "Upholstery — [available fabrics & leathers]",
      "Handcrafted to order in our Foshan atelier",
      "Custom sizing and materials on request",
    ],
  },
  {
    slug: "brera-sofa",
    name: "Brera Sofa",
    folder: "Brera sofa",
    tagline: "Milanese restraint, tailored lines.",
    description:
      "Named for Milan's quiet design quarter, the Brera Sofa is an exercise in precision — crisp seams, a considered profile, and proportions that feel effortlessly resolved. Refined enough for a formal room, relaxed enough to live in every day.",
    details: [
      "Configuration — [2-seater / 3-seater / sectional]",
      "Dimensions — [W___ × D___ × H___ cm]",
      "Upholstery — [available fabrics & leathers]",
      "Handcrafted to order in our Foshan atelier",
      "Custom sizing and materials on request",
    ],
  },
  {
    slug: "coupe-sofa",
    name: "Coupe Sofa",
    folder: "Coupe sofa",
    tagline: "Low, architectural, sculptural.",
    description:
      "The Coupe Sofa sits low and wide, its clean planes reading almost like architecture. Deep seats and a grounded stance make it as much a sculpture as a place to gather — a piece designed to anchor an open, contemporary space.",
    details: [
      "Configuration — [2-seater / 3-seater / sectional]",
      "Dimensions — [W___ × D___ × H___ cm]",
      "Upholstery — [available fabrics & leathers]",
      "Handcrafted to order in our Foshan atelier",
      "Custom sizing and materials on request",
    ],
  },
  {
    slug: "rogers-sofa",
    name: "Roger's Sofa",
    folder: "Roger's sofa",
    tagline: "Generous, relaxed, timeless.",
    description:
      "Roger's Sofa is an invitation to settle in. Soft, full cushions and a welcoming depth give it an easy, lived-in warmth, while balanced proportions keep the look composed. A classic lounge form, quietly perfected.",
    details: [
      "Configuration — [2-seater / 3-seater / sectional]",
      "Dimensions — [W___ × D___ × H___ cm]",
      "Upholstery — [available fabrics & leathers]",
      "Handcrafted to order in our Foshan atelier",
      "Custom sizing and materials on request",
    ],
  },
  {
    slug: "vincent-sofa",
    name: "Vincent Sofa",
    folder: "Vincent sofa",
    tagline: "Structured, tailored, modern.",
    description:
      "The Vincent Sofa is defined by its tailoring — clean edges, a firm and supportive seat, and a silhouette that holds its shape beautifully over the years. Modern and self-assured, it brings quiet structure to a living space.",
    details: [
      "Configuration — [2-seater / 3-seater / sectional]",
      "Dimensions — [W___ × D___ × H___ cm]",
      "Upholstery — [available fabrics & leathers]",
      "Handcrafted to order in our Foshan atelier",
      "Custom sizing and materials on request",
    ],
  },
  {
    slug: "vivian-sofa",
    name: "Vivian Sofa",
    folder: "Vivian sofa",
    tagline: "Soft, enveloping, quietly glamorous.",
    description:
      "The Vivian Sofa wraps you in comfort — plush, rounded volumes and a deep, cloud-like seat that feels indulgent the moment you sink in. Understated glamour for the rooms where you truly unwind.",
    details: [
      "Configuration — [2-seater / 3-seater / sectional]",
      "Dimensions — [W___ × D___ × H___ cm]",
      "Upholstery — [available fabrics & leathers]",
      "Handcrafted to order in our Foshan atelier",
      "Custom sizing and materials on request",
    ],
  },
];

export function getProducts(): HydratedProduct[] {
  return products.map((product) => ({
    ...product,
    ...getProductImages(product.folder),
  }));
}

export function getProductSlugs(): string[] {
  return products.map((product) => product.slug);
}

export function getProductBySlug(slug: string): HydratedProduct | null {
  const product = products.find((item) => item.slug === slug);
  if (!product) {
    return null;
  }
  return { ...product, ...getProductImages(product.folder) };
}
