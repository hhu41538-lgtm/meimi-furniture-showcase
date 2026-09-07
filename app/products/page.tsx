import type { Metadata } from "next";
import { studioItems } from "@/lib/catalogueStudio";
import { getProducts } from "@/lib/products";
import ProductsClient from "./ProductsClient";
import { siteConfig } from "@/lib/seo-config";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Explore verified Meimi&H furniture collections — sofas, lounge chairs, dining tables, coffee tables, beds, cabinets, outdoor furniture and handmade mattresses. Factory-direct from Foshan.",
  alternates: { canonical: "/products" },
  openGraph: {
    title: "Products | Meimi&H",
    description: "Explore verified Meimi&H furniture collections, made to order in Foshan.",
    type: "website",
    images: [{ url: "/images/catalogue-app/bamboo-sofa-construction-v1.webp" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Products | Meimi&H",
    description: "Explore verified Meimi&H furniture collections, made to order in Foshan.",
    images: ["/images/catalogue-app/bamboo-sofa-construction-v1.webp"],
  },
};

type CatalogueCard = {
  id: string;
  name: string;
  imageSrc: string;
  href: string;
  detail: string;
  code?: string;
};

const productCard = (product: ReturnType<typeof getProducts>[number]): CatalogueCard => ({
  id: product.slug,
  name: product.name,
  imageSrc: product.mainImage,
  href: `/products/${product.slug}`,
  detail: product.tagline,
  code: product.productCode,
});

const studioCard = (slug: string): CatalogueCard => {
  const item = studioItems.find((candidate) => candidate.slug === slug);
  if (!item) throw new Error(`Missing verified studio item: ${slug}`);
  return { id: item.slug, name: item.name, imageSrc: item.image, href: `/products/studio/${item.slug}`, detail: item.tagline };
};

export default function ProductsPage() {
  const products = getProducts();
  const bySlug = (slug: string) => {
    const product = products.find((candidate) => candidate.slug === slug);
    if (!product) throw new Error(`Missing verified product: ${slug}`);
    return productCard(product);
  };

  const collections = [
    { id: "sofas", title: "Sofas", description: "Made-to-order seating for living rooms, lounges and hospitality projects.", products: products.filter((product) => product.category === "sofa").map(productCard) },
    { id: "lounge-chairs", title: "Lounge Chairs", description: "Verified showroom selections for reading corners, lounges and conversation areas.", products: [
      { id: "lillian-lounge-chair", name: "Lillian Lounge Chair", imageSrc: "/images/showroom-products/lounge-chairs/lillian-lounge-chair.webp", href: "/products/showroom/lillian-lounge-chair", detail: "Showroom piece · specification available on request" },
      { id: "lounge-chair-collection", name: "Lounge Chair Collection", imageSrc: "/images/showroom-products/lounge-chairs/lounge-chair-collection.webp", href: "/products/showroom/lounge-chair-collection", detail: "Showroom selection · individual models confirmed at enquiry" },
    ] },
    { id: "dining-tables", title: "Dining Tables", description: "Dining tables selected for material character, generous gathering and tailored scale.", products: [
      ...products.filter((product) => product.category === "dining" && product.slug !== "square-coffee-table").map(productCard), studioCard("travertine-dining-table"), studioCard("jason-dining-table"), studioCard("maxim-petal-dining-table"),
    ] },
    { id: "coffee-tables", title: "Coffee Tables", description: "Low tables designed to complete a seating composition without competing with it.", products: [bySlug("square-coffee-table")] },
    { id: "beds-mattresses", title: "Beds & Mattresses", description: "Upholstered beds and handmade mattresses for a complete sleep specification.", products: [studioCard("riviere-bed"), studioCard("stina-upholstered-bed"), ...products.filter((product) => product.category === "mattress").map(productCard)] },
    { id: "cabinets", title: "Cabinets & Storage", description: "Freestanding storage and display pieces with finish and internal layout tailored to use.", products: [studioCard("airplane-cabinet"), studioCard("palawan-bar-cabinet")] },
    { id: "outdoor", title: "Outdoor Furniture", description: "Weather-ready seating and dining pieces for terraces, pool decks and garden rooms.", products: products.filter((product) => product.category === "outdoor").map(productCard) },
  ];

  const productList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Meimi&H Verified Furniture Collection",
    url: `${siteConfig.url}/products`,
    numberOfItems: collections.reduce((total, collection) => total + collection.products.length, 0),
    itemListElement: collections.flatMap((collection) => collection.products).map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: product.name,
      url: `${siteConfig.url}${product.href}`,
      image: `${siteConfig.url}${product.imageSrc}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productList) }} />
      <ProductsClient collections={collections} />
    </>
  );
}
