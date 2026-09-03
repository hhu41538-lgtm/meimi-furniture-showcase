import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductSlugs, getProductBySlug } from "@/lib/products";
import { siteConfig } from "@/lib/seo-config";
import ProductExperience from "./ProductExperience";

const PHONE_NUMBER = "15355787546";

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
      alternates: { canonical: `/products/${product.slug}` },
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

  const phoneHref = `tel:${PHONE_NUMBER}`;
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: [`${siteConfig.url}${encodeURI(product.mainImage)}`],
    category: product.category,
    url: `${siteConfig.url}/products/${product.slug}`,
    brand: {
      "@type": "Brand",
      name: "Meimi&H",
    },
    additionalProperty: product.details.map((detail) => ({
      "@type": "PropertyValue",
      value: detail,
    })),
  };

  return (
    <main className="bg-[#FAF9F6] text-stone-800">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
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
    </main>
  );
}
