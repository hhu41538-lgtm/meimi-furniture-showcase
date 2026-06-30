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
  { title: "Wardrobes & Storage", description: "Tailored wardrobe systems, closets, and finished storage solutions." },
  { title: "Kitchen Cabinetry", description: "Elegant turnkey cabinetry for contemporary kitchens and service spaces." },
  { title: "Wall Panels & Doors", description: "Textured wall panels and statement doors crafted to suit your interiors." },
];

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
    imageSrc: customImages.length > 0 ? customImages[i % customImages.length] : FALLBACK,
  }));

  return (
    <ProductsClient products={productsWithImages} customCategories={customWithImages} />
  );
}
