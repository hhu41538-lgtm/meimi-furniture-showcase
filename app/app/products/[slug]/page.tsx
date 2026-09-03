import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import AppLoading from "../../AppLoading";
import { getProductBySlug, getProductsByCategory, getProductSlugs } from "@/lib/products";
import MobileProductDetail from "./MobileProductDetail";

export function generateStaticParams() {
  return getProductSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  const title = product.name;
  const description = product.tagline;
  const canonical = `/products/${product.slug}`;
  const shareUrl = `/app/products/${product.slug}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { url: shareUrl, title, description, images: [{ url: product.mainImage, alt: product.name }] },
    twitter: { title, description, images: [product.mainImage] },
  };
}

export default async function MobileProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();
  const relatedProducts = getProductsByCategory(product.category).filter((entry) => entry.slug !== product.slug).slice(0, 2);
  return <Suspense fallback={<AppLoading />}><MobileProductDetail product={product} relatedProducts={relatedProducts} /></Suspense>;
}
