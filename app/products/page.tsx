import { getFolderImagePaths } from "@/lib/imageAssets";
import ProductsClient from "./ProductsClient";

const FALLBACK = "/images/Other/fallback.jpg";

const readyMadeProducts = [
  { name: "Groundpiece", category: "Living Room", image: "" },
  { name: "Vivienne", category: "Living Room", image: "" },
  { name: "Lawrence", category: "Living Room", image: "" },
  { name: "Perry", category: "Living Room", image: "" },
  { name: "Camelot", category: "Living Room", image: "" },
  { name: "Bessel", category: "Living Room", image: "" },
  { name: "Vivienne Chair", category: "Living Room", image: "" },
  { name: "Aston", category: "Living Room", image: "" },
  { name: "Beverly", category: "Living Room", image: "" },
  { name: "Anrun", category: "Dining", image: "" },
  { name: "Olivia", category: "Dining", image: "" },
  { name: "Mashi", category: "Dining", image: "" },
  { name: "Dragon Bone", category: "Dining", image: "" },
  { name: "Senke Dining Table", category: "Dining", image: "" },
  { name: "Travertine Dining Table", category: "Dining", image: "" },
  { name: "Youqu", category: "Bedroom", image: "" },
  { name: "Nianbi", category: "Bedroom", image: "" },
  { name: "Aman", category: "Bedroom", image: "" },
  { name: "Stone", category: "Bedroom", image: "" },
];

const customCategories = [
  {
    id: "wall-panels",
    title: "Wall Panels, Doors & TV Cabinets",
    description:
      "Textured wall panels, statement doors and integrated TV cabinetry, crafted as a continuous surface for living and reception spaces.",
    image: "",
  },
  {
    id: "kitchen",
    title: "Kitchen Cabinetry",
    description:
      "Turnkey kitchen systems combining precise millwork, stone worktops and integrated appliances for modern cooking and service areas.",
    image: "",
  },
  {
    id: "wardrobes",
    title: "Wardrobes",
    description:
      "Full-height wardrobe and dressing systems tailored to bedrooms and walk-in closets, with configurable interiors.",
    image: "",
  },
];

const otherSpacesCategory = {
  id: "other-spaces",
  title: "Other Spaces",
  description:
    "Ready-made furniture for tea rooms, home offices, entryways and other areas of the home. New collections are being added to this range.",
  image: "",
};

const mattressCategory = {
  id: "mattress",
  title: "Handmade Mattress",
  description:
    "Hand-tufted, hand-stitched mattresses built layer by layer in our own workshop — a signature craft of the Meimi&H factory.",
  image: "",
};

const folderMap: Record<string, string> = {
  "Living Room": "Living Room",
  Dining: "Dining",
  Bedroom: "Bedroom",
};

export default function ProductsPage() {
  const imagesByFolder: Record<string, string[]> = {
    "Living Room": getFolderImagePaths("Living Room"),
    Dining: getFolderImagePaths("Dining"),
    Bedroom: getFolderImagePaths("Bedroom"),
  };

  const counters: Record<string, number> = { "Living Room": 0, Dining: 0, Bedroom: 0 };

  const productsWithImages = readyMadeProducts.map((product) => {
    if (product.image) {
      return { ...product, imageSrc: product.image };
    }
    const folder = folderMap[product.category] ?? "Living Room";
    const list = imagesByFolder[folder] ?? [];
    const idx = counters[folder] ?? 0;
    counters[folder] = idx + 1;
    const imageSrc = list.length > 0 ? list[idx % list.length] : FALLBACK;
    return { ...product, imageSrc };
  });

  const customImages = getFolderImagePaths("Custom Interiors");
  const customWithImages = customCategories.map((cat, i) => ({
    ...cat,
    imageSrc:
      cat.image || (customImages.length > 0 ? customImages[i % customImages.length] : FALLBACK),
  }));

  const otherImages = getFolderImagePaths("Other");
  const otherSpacesWithImage = {
    ...otherSpacesCategory,
    imageSrc:
      otherSpacesCategory.image ||
      (otherImages.length > 0 ? otherImages[0] : FALLBACK),
  };

  const mattressImages = getFolderImagePaths("Handmade mattress");
  const mattressWithImage = {
    ...mattressCategory,
    imageSrc:
      mattressCategory.image || (mattressImages.length > 0 ? mattressImages[0] : FALLBACK),
  };

  return (
    <ProductsClient
      products={productsWithImages}
      customCategories={customWithImages}
      otherSpaces={otherSpacesWithImage}
      mattress={mattressWithImage}
    />
  );
}
