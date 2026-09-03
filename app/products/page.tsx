import type { Metadata } from "next";
import { getFolderImagePaths } from "@/lib/imageAssets";
import { getProductsByCategory } from "@/lib/products";
import ProductsClient from "./ProductsClient";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Explore Meimi&H collections — ready-made living, dining and bedroom furniture, custom interiors, and our signature handmade mattresses. Factory-direct from Foshan.",
  alternates: { canonical: "/products" },
};

const FALLBACK = "/images/Other/fallback.jpg";

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

export default function ProductsPage() {
  const productsWithImages = [
    ...getProductsByCategory("sofa").map((product) => ({ slug: product.slug, name: product.name, category: "Living Room", imageSrc: product.mainImage || FALLBACK })),
    ...getProductsByCategory("dining").map((product) => ({ slug: product.slug, name: product.name, category: "Dining", imageSrc: product.mainImage || FALLBACK })),
    ...getProductsByCategory("outdoor").map((product) => ({ slug: product.slug, name: product.name, category: "Outdoor", imageSrc: product.mainImage || FALLBACK })),
  ];

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
