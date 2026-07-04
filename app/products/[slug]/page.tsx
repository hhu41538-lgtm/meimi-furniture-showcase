import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import FadeIn from "@/components/ui/FadeIn";
import { getProductSlugs, getProductBySlug } from "@/lib/products";

const WHATSAPP_NUMBER = "8617796076275";

export function generateStaticParams() {
  return getProductSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const product = getProductBySlug(params.slug);
  if (!product) {
    return { title: "Product not found | Meimi&H" };
  }
  const title = `${product.name} | Meimi&H`;
  const description = product.description;
  const ogImage = encodeURI(product.mainImage);
  return {
    title,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  if (!product) {
    notFound();
  }

  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hi Meimi&H, I'd like to know more about the ${product.name}.`
  )}`;

  return (
    <main className="bg-[#FAF9F6] text-stone-800">
      {/* BREADCRUMB */}
      <div className="mx-auto max-w-6xl px-6 pt-28 sm:px-8 lg:px-10 lg:pt-32">
        <Link
          href="/#new-arrivals"
          className="group inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.25em] text-stone-400 transition-colors hover:text-stone-700"
        >
          <span className="transition-transform duration-300 group-hover:-translate-x-1">
            &larr;
          </span>
          Collections
        </Link>
      </div>

      {/* HERO IMAGE */}
      <section className="px-6 pt-8 sm:px-8 lg:px-10">
        <FadeIn>
          <div className="relative mx-auto aspect-[16/10] max-w-6xl overflow-hidden rounded-sm">
            <Image
              src={product.mainImage}
              alt={product.name}
              fill
              priority
              className="object-cover"
            />
          </div>
        </FadeIn>
      </section>

      {/* INTRO */}
      <section className="px-6 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-6xl items-start gap-14 lg:grid-cols-2 lg:gap-20">
          <FadeIn>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.4em] text-stone-400">
                New Arrival
              </p>
              <h1 className="mt-5 text-4xl font-extralight tracking-tight text-stone-900 sm:text-5xl">
                {product.name}
              </h1>
              <p className="mt-4 text-lg font-light italic text-[#6B2737]">
                {product.tagline}
              </p>
              <p className="mt-8 max-w-xl text-base font-light leading-loose text-stone-500">
                {product.description}
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={150}>
            <div className="border-t border-stone-200 pt-8">
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-stone-400">
                Details
              </p>
              <ul className="mt-6 space-y-3">
                {product.details.map((line) => (
                  <li
                    key={line}
                    className="text-sm font-light leading-relaxed text-stone-600"
                  >
                    {line}
                  </li>
                ))}
              </ul>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-10 inline-flex items-center gap-2 bg-[#6B2737] px-7 py-3.5 text-sm font-medium tracking-[0.12em] text-white transition-colors duration-300 hover:bg-stone-900"
              >
                ENQUIRE ON WHATSAPP
                <span>&rarr;</span>
              </a>
              <p className="mt-4 text-xs font-light text-stone-400">
                Factory-direct pricing &middot; Made to order &middot; Worldwide shipping
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* GALLERY */}
      {product.detailImages.length > 0 && (
        <section className="px-6 pb-24 sm:px-8 lg:px-10 lg:pb-32">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-5 sm:grid-cols-2">
              {product.detailImages.map((src, index) => (
                <FadeIn key={src} delay={(index % 2) * 100}>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
                    <Image
                      src={src}
                      alt={`${product.name} detail ${index + 1}`}
                      fill
                      className="object-cover transition-transform duration-[900ms] ease-out hover:scale-105"
                    />
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA STRIP */}
      <section className="border-t border-stone-200/70 bg-white/60 px-6 py-16 text-center sm:px-8 lg:px-10">
        <h2 className="text-2xl font-extralight tracking-tight text-stone-900 sm:text-3xl">
          Make it yours.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm font-light leading-relaxed text-stone-500">
          Every Meimi&amp;H piece is built to order and can be tailored in size,
          upholstery, and finish. Talk to us about the {product.name}.
        </p>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-2 border-b border-[#6B2737] pb-1 text-sm font-medium tracking-[0.12em] text-[#6B2737] transition-colors duration-300 hover:border-stone-900 hover:text-stone-900"
        >
          START A CONVERSATION
          <span>&rarr;</span>
        </a>
      </section>
    </main>
  );
}
