import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import FadeIn from "@/components/ui/FadeIn";
import { getProductsByCategory } from "@/lib/products";

const WHATSAPP = "https://wa.me/8617796076275";
const HERO = "/images/Mattress Collection/01-hero.jpg";

export const metadata: Metadata = {
  title: "Mattress Collection",
  description:
    "The Meimi&H mattress collection — hand-tufted, hand-stitched mattresses built layer by layer in our own workshop. Elizabeth, Isabel, Margaret, Stina and the Contemporary Edit. Factory-direct from Foshan.",
  alternates: { canonical: "/mattresses" },
  openGraph: {
    title: "Mattress Collection | Meimi&H",
    description:
      "Softly tailored classics and clean contemporary profiles — handmade mattresses, made to order in our Foshan workshop.",
    type: "website",
    images: [{ url: encodeURI(HERO) }],
  },
};

export default function MattressesPage() {
  const mattresses = getProductsByCategory("mattress");

  const enquiryHref = `${WHATSAPP}?text=${encodeURIComponent(
    "Hi Meimi&H, I'd like to enquire about your mattress collection."
  )}`;

  return (
    <main className="bg-[#FAF9F6] text-stone-800">
      {/* HERO */}
      <section className="relative isolate flex min-h-[68vh] items-end overflow-hidden">
        <Image
          src={HERO}
          alt="Meimi&H mattress collection"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/20 to-stone-950/10" />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-16 sm:px-8 lg:px-10 lg:pb-20">
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-[0.5em] text-white/70">
              01 — Sleep
            </p>
            <h1 className="mt-5 max-w-2xl text-4xl font-extralight leading-[1.1] tracking-tight text-white sm:text-6xl">
              The Mattress Collection
            </h1>
            <p className="mt-6 max-w-xl text-base font-light leading-relaxed text-white/80">
              Softly tailored classics and clean contemporary profiles —
              hand-tufted and hand-stitched, built layer by layer in our own
              workshop.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* INTRO */}
      <section className="px-6 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-[0.4em] text-stone-400">
              Distinct profiles. One point of view.
            </p>
            <h2 className="mt-6 text-3xl font-extralight leading-snug tracking-tight text-stone-900 sm:text-4xl">
              Designed for rest. Tailored for living.
            </h2>
            <p className="mt-6 text-base font-light leading-loose text-stone-500">
              A considered edit of mattresses — from softly tailored classics to
              clean contemporary profiles. Dimensions, construction and
              market-specific requirements are confirmed at enquiry stage.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* GRID */}
      <section className="px-6 pb-24 sm:px-8 lg:px-10 lg:pb-32">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {mattresses.map((product, index) => (
              <FadeIn key={product.slug} delay={(index % 3) * 100}>
                <Link href={`/products/${product.slug}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-white">
                    <Image
                      src={product.mainImage}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-[900ms] [transition-timing-function:var(--ease-lux)] group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-5">
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400">
                      Mattress
                    </p>
                    <h3 className="mt-2 text-lg font-light tracking-tight text-stone-900 transition-colors duration-300 group-hover:text-[#6B2737]">
                      {product.name}
                    </h3>
                    <p className="mt-1.5 text-sm font-light italic leading-relaxed text-stone-500">
                      {product.tagline}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.15em] text-[#6B2737]">
                      View details
                      <span className="transition-transform duration-300 group-hover:translate-x-1">
                        &rarr;
                      </span>
                    </span>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ENQUIRY CTA */}
      <section className="border-t border-stone-200/70 bg-white/60 px-6 py-20 text-center sm:px-8 lg:px-10">
        <FadeIn>
          <p className="text-xs font-medium uppercase tracking-[0.4em] text-stone-400">
            Plan your mattress enquiry
          </p>
          <h2 className="mx-auto mt-5 max-w-xl text-2xl font-extralight tracking-tight text-stone-900 sm:text-3xl">
            The right information leads to a clearer quote.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-sm font-light leading-relaxed text-stone-500">
            Share the model, exact dimensions, quantity and destination market,
            and we&apos;ll confirm specification, availability and pricing in
            writing.
          </p>
          <a
            href={enquiryHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 bg-[#6B2737] px-7 py-3.5 text-sm font-medium tracking-[0.12em] text-white transition-colors duration-300 hover:bg-stone-900"
          >
            ENQUIRE ON WHATSAPP
            <span>&rarr;</span>
          </a>
        </FadeIn>
      </section>
    </main>
  );
}
