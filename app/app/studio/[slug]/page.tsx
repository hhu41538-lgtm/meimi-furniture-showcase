import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import AppLoading from "../../AppLoading";
import { studioItems } from "@/lib/catalogueStudio";
import StudioDetail from "./StudioDetail";

export function generateStaticParams() {
  return studioItems.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = studioItems.find((entry) => entry.slug === slug);
  if (!item) return {};
  const title = item.name;
  const description = item.tagline;
  const canonical = `/app/studio/${item.slug}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { url: canonical, title, description, images: [{ url: item.image, alt: item.name }] },
    twitter: { title, description, images: [item.image] },
  };
}

export default async function StudioItemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = studioItems.find((entry) => entry.slug === slug);
  if (!item) notFound();
  return <Suspense fallback={<AppLoading />}><StudioDetail item={item} /></Suspense>;
}
