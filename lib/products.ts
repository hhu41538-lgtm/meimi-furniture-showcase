import { getFolderImagePaths, getProductImages, type ProductImages } from "@/lib/imageAssets";
import { assignCatalogueProductCodes } from "@/lib/productCodes";

export type ProductCategory = "sofa" | "mattress" | "dining" | "outdoor";

export type FinishPreview = {
  id: string;
  label: string;
  color: string;
  image: string;
};

export type Product = {
  slug: string;
  productCode?: string;
  name: string;
  folder?: string;
  imageFolder?: string;
  imageSet?: ProductImages;
  category: ProductCategory;
  constructionImage?: string;
  catalogueViews?: Partial<Record<"front" | "side" | "detail", string>>;
  catalogueFinishPreviews?: FinishPreview[];
  tagline: string;
  description: string;
  details: string[];
};

export type HydratedProduct = Product & ProductImages & { productCode: string };

// Shared enquiry-style spec lines for the mattress collection. Exact
// dimensions and construction are confirmed at enquiry stage (see catalogue).
const mattressDetails = [
  "Sizes — confirmed at enquiry (mm or inches)",
  "Construction — comfort feel and layers on request",
  "Cover — cover and finish options available",
  "Handmade to order in our workshop",
  "Custom sizing, packaging and compliance on request",
];

const diningDetails = [
  "Dimensions - confirmed for the selected configuration",
  "Top - material and finish selected at specification",
  "Base - finish options available",
  "Handcrafted to order in our Foshan atelier",
  "Custom sizing and materials on request",
];

const outdoorDetails = [
  "Configuration - selected to suit the outdoor layout",
  "Upholstery - weather-ready material selection",
  "Frame - outdoor finish confirmed at specification",
  "Dimensions - confirmed for the selected configuration",
  "Custom sizing, materials and project quantities on request",
];

const products: Product[] = [
  {
    slug: "bamboo-sofa",
    name: "Bamboo Sofa",
    folder: "Bamboo sofa",
    category: "sofa",
    constructionImage: "/images/catalogue-app/bamboo-sofa-construction-v1.webp",
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
    constructionImage:
      "/images/explore%20by%20space/Bessel%20sofa/bessel-construction-v1.webp",
    catalogueViews: {
      side: "/images/explore%20by%20space/Bessel%20sofa/bessel-side-v1.webp",
    },
    catalogueFinishPreviews: [
      { id: "moss-chenille", label: "Moss chenille", color: "#65704d", image: "/images/explore%20by%20space/Bessel%20sofa/bessel-moss-chenille-v1.webp" },
      { id: "bordeaux-velvet", label: "Bordeaux velvet", color: "#74222e", image: "/images/explore%20by%20space/Bessel%20sofa/bessel-bordeaux-velvet-v1.webp" },
    ],
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
    constructionImage: "/images/catalogue-app/brera-sofa-construction-v1.webp",
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
    constructionImage: "/images/catalogue-app/coupe-sofa-construction-v1.webp",
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
    constructionImage: "/images/catalogue-app/rogers-sofa-construction-v1.webp",
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
    constructionImage: "/images/catalogue-app/vincent-sofa-construction-v1.webp",
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
    constructionImage: "/images/catalogue-app/vivian-sofa-construction-v1.webp",
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

  // --- Dining Collection ---
  {
    slug: "baxter-drop-dining-table",
    name: "Baxter Drop Dining Table",
    imageSet: {
      mainImage: "/images/catalogue-app/baxter-drop-dining-table-1.jpg",
      detailImages: ["/images/catalogue-app/baxter-drop-dining-table-2.jpg", "/images/catalogue-app/baxter-drop-dining-table-3.jpg"],
    },
    category: "dining",
    constructionImage: "/images/catalogue-app/baxter-drop-construction-v1.webp",
    tagline: "A softened silhouette with a sculptural, fluid base.",
    description:
      "A water-drop dining table study defined by its soft outline and grounded sculptural base. The form offers a refined focal point for dining rooms that favour tactile materiality over decoration.",
    details: diningDetails,
  },
  {
    slug: "hourglass-dining-table",
    name: "Hourglass Dining Table",
    imageSet: {
      mainImage: "/images/catalogue-app/hourglass-dining-table-1.jpg",
      detailImages: ["/images/catalogue-app/hourglass-dining-table-2.jpg", "/images/catalogue-app/hourglass-dining-table-3.jpg"],
    },
    category: "dining",
    constructionImage: "/images/catalogue-app/hourglass-construction-v1.webp",
    tagline: "A balanced table profile, shaped around a central hourglass form.",
    description:
      "A dining table with a composed hourglass base and a generous top. Its central geometry keeps the perimeter open for seating while giving the table a clear architectural presence.",
    details: diningDetails,
  },
  {
    slug: "walnut-long-dining-table",
    name: "Walnut Long Dining Table",
    imageSet: {
      mainImage: "/images/catalogue-app/walnut-long-dining-table-1.jpg",
      detailImages: ["/images/catalogue-app/walnut-long-dining-table-2.jpg", "/images/catalogue-app/walnut-long-dining-table-3.jpg"],
  },
  category: "dining",
  constructionImage: "/images/catalogue-app/walnut-long-dining-table-construction-v1.webp",
  tagline: "Long-grain warmth for rooms made to gather.",
    description:
      "A generously proportioned walnut dining table intended for long gatherings and substantial residential spaces. The material-led expression keeps the silhouette quiet while allowing the timber character to lead.",
    details: diningDetails,
  },
  {
    slug: "square-coffee-table",
    name: "Square Coffee Table",
    imageSet: {
      mainImage: "/images/catalogue-app/square-coffee-table-1.jpg",
      detailImages: ["/images/catalogue-app/square-coffee-table-2.jpg", "/images/catalogue-app/square-coffee-table-3.jpg"],
    },
    category: "dining",
    tagline: "A compact, grounded companion for the living room.",
    description:
      "A square occasional table with a balanced, low profile. It is designed to sit comfortably among lounge seating, where the material finish and scale can be tailored to the surrounding furniture.",
    details: diningDetails,
  },

  // --- Outdoor Collection ---
  {
    slug: "woven-garden-lounge",
    name: "Woven Garden Lounge",
    category: "outdoor",
    imageSet: { mainImage: "/images/catalogue-app/outdoor-woven-garden-lounge.jpg", detailImages: [] },
    tagline: "Woven texture and soft volume for a shaded garden room.",
    description:
      "An outdoor lounge reference combining deep upholstered seating with an expressive woven surround. The collection is suited to covered terraces and garden settings where tactile materiality is central to the space.",
    details: outdoorDetails,
  },
  {
    slug: "modular-terrace-lounge",
    name: "Modular Terrace Lounge",
    category: "outdoor",
    imageSet: { mainImage: "/images/catalogue-app/outdoor-modular-terrace-lounge.jpg", detailImages: [] },
    tagline: "A flexible outdoor seating system with a relaxed, architectural line.",
    description:
      "A modular outdoor lounge composition with generous cushions, woven arm details and low occasional tables. It is designed to scale from intimate terraces to substantial covered entertaining areas.",
    details: outdoorDetails,
  },
  {
    slug: "poolside-daybed",
    name: "Poolside Daybed",
    category: "outdoor",
    imageSet: { mainImage: "/images/catalogue-app/outdoor-poolside-daybed.jpg", detailImages: [] },
    constructionImage: "/images/catalogue-app/poolside-daybed-construction-v1.webp",
    tagline: "A circular retreat for long, open-air afternoons.",
    description:
      "A round outdoor daybed reference with a generous cushioned surface, woven perimeter and integrated side table. It is intended for pool decks, garden lawns and resort-style terraces.",
    details: outdoorDetails,
  },
  {
    slug: "terrace-conversation-set",
    name: "Terrace Conversation Set",
    category: "outdoor",
    imageSet: { mainImage: "/images/catalogue-app/outdoor-conversation-set.jpg", detailImages: [] },
    tagline: "Low, social seating arranged around a quiet centre.",
    description:
      "A composed outdoor conversation setting that combines lounge seating, armchairs and low tables. Its adaptable arrangement makes it suitable for residential terraces and hospitality environments.",
    details: outdoorDetails,
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
    constructionImage: "/images/explore%20by%20space/Stina%20mattress/stina-construction-v1.webp",
    tagline: "One design. Multiple expressions.",
    description:
      "A single, clean profile offered across a coordinated palette for different interior moods. Understood through its parts — bed box, base and top layer — each element is considered and quietly resolved.",
    details: [
      "Colours — Navy Plaid · Red & White · Blue & White · Yellow & Grey · Coffee & Ivory · Dark Coffee · White Plaid · Blush & Ivory · Blue & Grey",
      ...mattressDetails,
    ],
    catalogueFinishPreviews: [
      { id: "navy-plaid", label: "Navy plaid", color: "#27375c", image: "/images/explore%20by%20space/Stina%20mattress/05-05.jpg" },
      { id: "red-white", label: "Red & white", color: "#b53942", image: "/images/explore%20by%20space/Stina%20mattress/06-06.jpg" },
      { id: "blue-white", label: "Blue & white", color: "#52668f", image: "/images/explore%20by%20space/Stina%20mattress/07-07.jpg" },
      { id: "yellow-grey", label: "Yellow & grey", color: "#b29d57", image: "/images/explore%20by%20space/Stina%20mattress/08-08.jpg" },
      { id: "coffee-ivory", label: "Coffee & ivory", color: "#d6d1c8", image: "/images/explore%20by%20space/Stina%20mattress/09-09.jpg" },
      { id: "dark-coffee", label: "Dark coffee", color: "#4e3b36", image: "/images/explore%20by%20space/Stina%20mattress/10-10.jpg" },
      { id: "white-plaid", label: "White plaid", color: "#e3e3e0", image: "/images/explore%20by%20space/Stina%20mattress/11-11.jpg" },
      { id: "blush-ivory", label: "Blush & ivory", color: "#d5b9bb", image: "/images/explore%20by%20space/Stina%20mattress/12-12.jpg" },
      { id: "blue-grey", label: "Blue & grey", color: "#6d7588", image: "/images/explore%20by%20space/Stina%20mattress/13-13.jpg" },
    ],
  },
];

export function getProducts(): HydratedProduct[] {
  return assignCatalogueProductCodes(products).map((product) => ({
    ...product,
    ...(product.imageSet ?? (product.imageFolder ? getImagesFromFolder(product.imageFolder) : getProductImages(product.folder ?? ""))),
  }));
}

export function getProductsByCategory(category: ProductCategory): HydratedProduct[] {
  return getProducts().filter((product) => product.category === category);
}

export function getProductSlugs(): string[] {
  return products.map((product) => product.slug);
}

export function getProductBySlug(slug: string): HydratedProduct | null {
  const product = assignCatalogueProductCodes(products).find((item) => item.slug === slug);
  if (!product) {
    return null;
  }
  return { ...product, ...(product.imageSet ?? (product.imageFolder ? getImagesFromFolder(product.imageFolder) : getProductImages(product.folder ?? ""))) };
}

function getImagesFromFolder(folder: string): ProductImages {
  const images = getFolderImagePaths(folder).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  return { mainImage: images[0] ?? "/images/Other/fallback.jpg", detailImages: images.slice(1) };
}
