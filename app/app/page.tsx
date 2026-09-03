import type { Metadata } from "next";
import { getProducts } from "@/lib/products";
import { Suspense } from "react";
import AppLoading from "./AppLoading";
import CatalogueApp from "./CatalogueApp";

export const metadata: Metadata = {
  title: "美觅家居产品图册",
  description: "美觅家居家具、定制与空间方案移动产品图册。",
  alternates: { canonical: "/app" },
  openGraph: { url: "/app", title: "美觅家居产品图册", description: "美觅家居家具、定制与空间方案移动产品图册。" },
};

export default function CatalogueAppPage() {
  const products = getProducts().map((product) => ({
    slug: product.slug,
    productCode: product.productCode,
    name: product.name,
    category: product.category,
    tagline: product.tagline,
    image: product.mainImage,
    searchTerms: [
      product.description,
      ...product.details,
      ...(product.catalogueFinishPreviews?.map((finish) => finish.label) ?? []),
    ].join(" "),
  }));

  return <Suspense fallback={<AppLoading />}><CatalogueApp products={products} /></Suspense>;
}
