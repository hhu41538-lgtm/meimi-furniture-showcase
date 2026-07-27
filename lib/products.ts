import { getProductImages, type ProductImages } from "@/lib/imageAssets";

export type ProductCategory = "sofa" | "mattress";

export type Product = {
  slug: string;
  name: string;
  folder: string;
  category: ProductCategory;
  tagline: string;
  description: string;
  details: string[];
};

export type HydratedProduct = Product & ProductImages;

// Shared enquiry-style spec lines for the mattress collection. Exact
// dimensions and construction are confirmed at enquiry stage (see catalogue).
const mattressDetails = [
  "Sizes — confirmed at enquiry (mm or inches)",
  "Construction — comfort feel and layers on request",
  "Cover — cover and finish options available",
  "Handmade to order in our workshop",
  "Custom sizing, packaging and compliance on request",
];

const products: Product[] = [
  {
    slug: "bamboo-sofa",
    name: "Bamboo Sofa",
    folder: "Bamboo sofa",
    category: "sofa",
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
    category: "sofa",
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
    category: "sofa",
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
    category: "sofa",
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
    category: "sofa",
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
    category: "sofa",
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
    category: "sofa",
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

  // --- Mattress Collection (01 SLEEP) ---
  {
    slug: "elizabeth",
    name: "Elizabeth",
    folder: "Elizabeth mattress",
    category: "mattress",
    tagline: "Quietly tailored.",
    description:
      "Elizabeth is defined by the relationship between its upper surface, tailored perimeter and composed overall profile — a balanced silhouette with an assured, timeless presence. Poise in every line, made to sit at the calm centre of a considered bedroom.",
    details: mattressDetails,
  },
  {
    slug: "isabel",
    name: "Isabel",
    folder: "Isabel mattress",
    category: "mattress",
    tagline: "Softly architectural.",
    description:
      "Clean lines and subtle depth give Isabel a calm, contemporary character. A restrained surface and defined edge create a crisp visual rhythm — considered from every side and free of unnecessary ornament.",
    details: mattressDetails,
  },
  {
    slug: "margaret",
    name: "Margaret",
    folder: "Margaret mattress",
    category: "mattress",
    tagline: "Classic poise, reinterpreted.",
    description:
      "Measured detail meets a clean overall silhouette. Margaret reads as quietly classic — its surface, border and edge treated as one composed whole, refined rather than decorative.",
    details: mattressDetails,
  },
  {
    slug: "sophia",
    name: "Sophia",
    folder: "Sophia mattress",
    category: "mattress",
    tagline: "Quiet and balanced.",
    description:
      "Part of a paired study with Louise, Sophia leans into calm — an even, understated surface and a gentle profile made for restful, uncluttered rooms.",
    details: mattressDetails,
  },
  {
    slug: "louise",
    name: "Louise",
    folder: "Louise mattress",
    category: "mattress",
    tagline: "Expressive in detail.",
    description:
      "The more characterful half of its pairing with Sophia, Louise brings depth through detail — a richer surface texture and a defined perimeter that give it a confident, tactile presence.",
    details: mattressDetails,
  },
  {
    slug: "ms-233b",
    name: "MS-233B",
    folder: "MS-233B mattress",
    category: "mattress",
    tagline: "Less decoration. More presence.",
    description:
      "Part of the Contemporary Edit, the MS-233B places the emphasis on proportion, texture and visual restraint — a clean, modern profile with quiet structural confidence.",
    details: mattressDetails,
  },
  {
    slug: "ms-3d",
    name: "MS-3D",
    folder: "MS-3D mattress",
    category: "mattress",
    tagline: "Structure you can feel.",
    description:
      "From the Contemporary Edit, the MS-3D pairs a clear silhouette with layered, breathable support — restraint on the surface, considered construction beneath.",
    details: mattressDetails,
  },
  {
    slug: "experts-choice-125",
    name: "Expert's Choice 125",
    folder: "Experts Choice 125 mattress",
    category: "mattress",
    tagline: "Considered, through and through.",
    description:
      "The most detailed profile in the Contemporary Edit, Expert's Choice 125 balances a refined tufted surface with a composed overall form — presence without excess.",
    details: mattressDetails,
  },
  {
    slug: "stina",
    name: "Stina",
    folder: "Stina mattress",
    category: "mattress",
    tagline: "One design. Multiple expressions.",
    description:
      "A single, clean profile offered across a coordinated palette for different interior moods. Understood through its parts — bed box, base and top layer — each element is considered and quietly resolved.",
    details: [
      "Colours — Navy Plaid · Red & White · Blue & White · Yellow & Grey · Coffee & Ivory · Dark Coffee · White Plaid · Blush & Ivory · Blue & Grey",
      ...mattressDetails,
    ],
  },
];

export function getProducts(): HydratedProduct[] {
  return products.map((product) => ({
    ...product,
    ...getProductImages(product.folder),
  }));
}

export function getProductsByCategory(category: ProductCategory): HydratedProduct[] {
  return getProducts().filter((product) => product.category === category);
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
