import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductSlugs, getProductBySlug, getProducts } from "@/lib/products";
import { siteConfig } from "@/lib/seo-config";
import ProductExperience from "./ProductExperience";

const PHONE_NUMBER = "8617796045579";

export function generateStaticParams() {
  return getProductSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  return params.then(({ slug }) => {
    const product = getProductBySlug(slug);
    if (!product) {
      return { title: "Product not found | Meimi&H" };
    }
    const title = product.name;
    const ogTitle = `${product.name} | Meimi&H`;
    const description = product.description;
    const ogImage = encodeURI(product.mainImage);
    return {
      title,
      description,
      alternates: { canonical: `/products/${product.slug}/` },
      openGraph: {
        title: ogTitle,
        description,
        type: "website",
        images: [{ url: ogImage }],
      },
      twitter: {
        card: "summary_large_image",
        title: ogTitle,
        description,
        images: [ogImage],
      },
    };
  });
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) {
    notFound();
  }

  const phoneHref = `https://wa.me/${PHONE_NUMBER}`;
  const relatedProducts = getProducts().filter((candidate) => candidate.category === product.category && candidate.slug !== product.slug).slice(0, 3);
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: [product.mainImage, ...product.detailImages].map((image) => `${siteConfig.url}${encodeURI(image)}`),
    category: product.category,
    url: `${siteConfig.url}/products/${product.slug}`,
    brand: {
      "@type": "Brand",
      name: "Meimi&H",
    },
    ...(product.productCode ? { sku: product.productCode } : {}),
    additionalProperty: product.details.map((detail) => ({
      "@type": "PropertyValue",
      value: detail,
    })),
  };
  const categoryAnchors: Record<string, string> = {
    sofa: "sofas",
    dining: "dining-tables",
    mattress: "beds-mattresses",
    outdoor: "outdoor",
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Products", item: `${siteConfig.url}/products` },
      { "@type": "ListItem", position: 2, name: product.category, item: `${siteConfig.url}/products#${categoryAnchors[product.category] ?? product.category}` },
      { "@type": "ListItem", position: 3, name: product.name, item: `${siteConfig.url}/products/${product.slug}` },
    ],
  };

  return (
    <main className="bg-[#FAF9F6] text-stone-800">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <div className="mx-auto max-w-6xl px-6 pt-28 sm:px-8 lg:px-10 lg:pt-32">
        <Link
          href="/products"
          className="group inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.25em] text-stone-400 transition-colors hover:text-stone-700"
        >
          <span className="transition-transform duration-300 group-hover:-translate-x-1">
            &larr;
          </span>
          Product catalogue
        </Link>
      </div>
      <ProductExperience product={product} phoneHref={phoneHref} />
      {relatedProducts.length > 0 ? (
        <section className="border-t border-stone-200/70 px-6 py-16 sm:px-8 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-wrap items-end justify-between gap-5 border-b border-stone-300 pb-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-400">Continue browsing</p>
                <h2 className="mt-4 text-3xl font-light tracking-tight text-stone-950">More from this collection</h2>
              </div>
              <Link href="/products" className="text-xs font-medium uppercase tracking-[0.16em] text-[#6B2737] transition-colors hover:text-stone-900">View all products <span aria-hidden="true">→</span></Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {relatedProducts.map((related) => (
                <Link key={related.slug} href={`/products/${related.slug}`} className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6B2737]">
                  <div className="relative aspect-[4/5] overflow-hidden bg-stone-200"><Image src={related.mainImage} alt={related.name} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover transition duration-700 ease-out group-hover:scale-[1.035]" /></div>
                  <h3 className="mt-4 text-xl font-light tracking-tight text-stone-950">{related.name}</h3>
                  <p className="mt-2 text-sm font-light text-stone-500">{related.tagline}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
