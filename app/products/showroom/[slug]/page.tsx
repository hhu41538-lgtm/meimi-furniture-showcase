import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowUpRight, MessageCircle } from "lucide-react";
import { showroomProducts } from "../data";
import { siteConfig } from "@/lib/seo-config";

const PHONE = "https://wa.me/8617796045579";

export function generateStaticParams() {
  return showroomProducts.map((product) => ({ slug: product.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(({ slug }) => {
    const product = showroomProducts.find((candidate) => candidate.slug === slug);
    if (!product) return { title: "Product not found | Meimi&H" };
    return {
      title: product.name,
      description: product.description,
      alternates: { canonical: `/products/showroom/${product.slug}` },
      openGraph: {
        title: `${product.name} | Meimi&H`,
        description: product.description,
        type: "website",
        images: [{ url: encodeURI(product.image) }],
      },
    };
  });
}

export default async function ShowroomProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = showroomProducts.find((candidate) => candidate.slug === slug);
  if (!product) notFound();

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: [`${siteConfig.url}${encodeURI(product.image)}`],
    category: "Lounge chair",
    url: `${siteConfig.url}/products/showroom/${product.slug}`,
    brand: { "@type": "Brand", name: "Meimi&H" },
  };

  return (
    <main className="bg-[#f8f7f3] text-stone-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-24 sm:px-8 lg:px-10 lg:pb-28 lg:pt-32">
        <Link href="/products#lounge-chairs" className="inline-flex min-h-11 items-center gap-2 text-sm text-stone-600 transition-colors hover:text-stone-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6B2737]">
          <ArrowLeft size={17} aria-hidden="true" />
          Back to lounge chairs
        </Link>

        <section className="mt-9 grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)] lg:items-end lg:gap-16">
          <div>
            <h1 className="max-w-3xl text-5xl font-light leading-[0.98] tracking-[-0.035em] text-stone-950 sm:text-6xl">{product.name}</h1>
            <p className="mt-6 max-w-2xl text-lg font-light leading-8 text-[#6B2737]">{product.tagline}</p>
          </div>
          <a href={PHONE} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center gap-3 bg-[#6B2737] px-5 text-sm font-medium text-white transition-colors hover:bg-stone-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6B2737]">
            <MessageCircle size={16} aria-hidden="true" />
            Discuss this piece
          </a>
        </section>

        <section className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(17rem,0.55fr)] lg:gap-12">
          <div className="relative aspect-[4/5] overflow-hidden bg-stone-200 lg:aspect-[16/11]">
            <Image src={product.image} alt={product.name} fill priority sizes="(max-width: 1024px) 100vw, 65vw" className="object-cover" />
          </div>
          <div className="border-t border-stone-300 pt-6 lg:self-end">
            <p className="text-base font-light leading-8 text-stone-700">{product.description}</p>
            <ul className="mt-8 space-y-3 border-t border-stone-200 pt-6">
              {product.details.map((detail) => <li key={detail} className="text-sm font-light leading-6 text-stone-600">{detail}</li>)}
            </ul>
          </div>
        </section>

        <section className="mt-16 flex flex-col justify-between gap-6 bg-stone-950 px-7 py-9 text-white sm:flex-row sm:items-end sm:px-10 lg:mt-24 lg:px-14 lg:py-12">
          <div>
            <h2 className="text-2xl font-light tracking-[-0.02em] sm:text-3xl">Ready to specify this piece?</h2>
            <p className="mt-3 max-w-xl text-sm font-light leading-7 text-stone-300">Confirm dimensions, finishes and project quantities with our Foshan team.</p>
          </div>
          <a href={PHONE} target="_blank" rel="noreferrer" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 border border-white px-5 text-sm font-medium transition-colors hover:bg-white hover:text-stone-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
            WhatsApp +86 177 9604 5579
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </section>
      </div>
    </main>
  );
}
