import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getFolderImagePaths } from "@/lib/imageAssets";
import { siteConfig } from "@/lib/seo-config";
import FadeIn from "@/components/ui/FadeIn";

export const metadata: Metadata = {
  title: "About us",
  description:
    "Meimi&H is a premium furniture atelier in Foshan, China — 20+ years of craftsmanship meeting a refined global aesthetic. The art of refined living.",
  alternates: { canonical: "/about/" },
  openGraph: {
    title: "About Meimi&H | Foshan Furniture Atelier",
    description: "Discover the craftsmanship and refined global aesthetic behind Meimi&H furniture.",
    type: "website",
    images: [{ url: "/images/Hero/hero4.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Meimi&H | Foshan Furniture Atelier",
    description: "Discover the craftsmanship and refined global aesthetic behind Meimi&H furniture.",
    images: ["/images/Hero/hero4.jpg"],
  },
};

const FALLBACK = "/images/Other/fallback.jpg";

const values = [
  {
    title: "Premium Materials",
    description:
      "Hand-selected woods, luxe upholstery, and finishes chosen for durability and beauty.",
  },
  {
    title: "Master Craftsmen",
    description:
      "Decades of furniture-making expertise, refined through generations of local craftsmanship.",
  },
  {
    title: "Factory Direct",
    description:
      "Direct sourcing and transparent production, ensuring quality and value at every step.",
  },
];

export default function AboutPage() {
  const otherImages = getFolderImagePaths("Other");
  const pick = (i: number) =>
    otherImages.length > 0 ? otherImages[i % otherImages.length] : FALLBACK;

  const atelierImage = pick(0);
  const craftImage = pick(1);
  const showroomImage = pick(2);
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Meimi&H",
    url: siteConfig.url,
    description: "Premium furniture atelier and custom interior manufacturer in Foshan, China.",
    sameAs: [
      "https://www.tiktok.com/@meimi_furniture",
      "https://www.instagram.com/meimi_furniture_us",
      "https://www.facebook.com/profile.php?id=61589995301371",
    ],
    address: { "@type": "PostalAddress", addressLocality: "Foshan", addressRegion: "Guangdong", addressCountry: "CN" },
  };

  return (
    <main className="bg-[#FAF9F6] text-stone-800">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      {/* HEADER */}
      <section className="px-6 pt-32 sm:px-8 lg:px-10 lg:pt-40">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-medium uppercase tracking-[0.4em] text-stone-400">
              The Art of Refined Living
            </p>
            <h1 className="mt-5 text-4xl font-extralight tracking-tight text-stone-900 sm:text-6xl">
              Our atelier &mdash; Foshan, China
            </h1>
            <p className="mt-8 text-lg font-light italic leading-relaxed text-[#6B2737] sm:text-xl">
              Creating refinement, one piece at a time.
            </p>
          </div>
        </FadeIn>
      </section>

      {/* WIDE IMAGE */}
      <section className="px-6 pt-16 sm:px-8 lg:px-10">
        <FadeIn>
          <div className="relative mx-auto aspect-[16/9] max-w-6xl overflow-hidden rounded-sm">
            <Image
              src={atelierImage}
              alt="Meimi&H atelier in Foshan"
              fill
              priority
              className="object-cover"
            />
          </div>
        </FadeIn>
      </section>

      {/* STORY */}
      <section className="px-6 py-24 sm:px-8 lg:px-10 lg:py-32">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-base font-light leading-loose text-stone-500 sm:text-lg">
              Founded in 2020 in Shunde District, Longjiang Town, Foshan &mdash;
              the world&apos;s furniture manufacturing heartland &mdash;
              Meimi&amp;H was built on one belief: that beautiful furniture should
              feel as considered as the finest European houses. We bring together
              20+ years of local craftsmanship with a refined global aesthetic,
              serving clients who believe their home deserves the extraordinary.
            </p>
          </div>
        </FadeIn>
      </section>

      {/* SIGNATURE CRAFT */}
      <section className="px-6 pb-24 sm:px-8 lg:px-10 lg:pb-32">
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <FadeIn>
            <div className="group relative aspect-[4/3] overflow-hidden rounded-sm">
              <Image
                src={craftImage}
                alt="Craft detail"
                fill
                className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
              />
            </div>
          </FadeIn>
          <FadeIn delay={150}>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.4em] text-stone-400">
                Signature Craft
              </p>
              <h2 className="mt-6 text-3xl font-extralight leading-[1.15] tracking-tight text-stone-900 sm:text-4xl">
                Detail is our discipline.
              </h2>
              <p className="mt-8 max-w-md text-base font-light leading-loose text-stone-500">
                Every piece leaves our workshop only after passing through the
                hands of makers who have spent a lifetime learning how wood, stone
                and textile behave. The difference is in the millimetres you never
                see.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* VALUES */}
      <section className="border-t border-stone-200/70 px-6 py-24 sm:px-8 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 md:grid-cols-3 md:gap-8">
            {values.map((value, index) => (
              <FadeIn key={value.title} delay={index * 100}>
                <div>
                  <span className="block h-px w-8 bg-[#6B2737]" />
                  <h3 className="mt-6 text-xl font-light tracking-tight text-stone-900">
                    {value.title}
                  </h3>
                  <p className="mt-3 text-base font-light leading-loose text-stone-500">
                    {value.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* SHOWROOM WIDE IMAGE */}
      <section className="px-6 pb-24 sm:px-8 lg:px-10 lg:pb-32">
        <FadeIn>
          <div className="relative mx-auto aspect-[21/9] max-w-6xl overflow-hidden rounded-sm">
            <Image
              src={showroomImage}
              alt="Meimi&H showroom"
              fill
              className="object-cover"
            />
          </div>
        </FadeIn>
      </section>

      {/* QUOTE */}
      <section className="border-t border-stone-200/70 bg-white/60 px-6 py-24 text-center sm:px-8 lg:px-10">
        <FadeIn>
          <blockquote className="mx-auto max-w-3xl">
            <p className="text-2xl font-extralight leading-relaxed tracking-tight text-stone-900 sm:text-3xl">
              &ldquo;Where beauty dwells, the heart finds.&rdquo;
            </p>
            <footer className="mt-6 text-xs font-medium uppercase tracking-[0.3em] text-stone-400">
              Meimi&amp;H
            </footer>
          </blockquote>
        </FadeIn>
      </section>

      <section className="border-t border-stone-200/70 px-6 py-20 text-center sm:px-8 lg:px-10">
        <FadeIn>
          <p className="text-xs font-medium uppercase tracking-[0.4em] text-stone-400">Continue exploring</p>
          <h2 className="mt-4 text-2xl font-extralight tracking-tight text-stone-900 sm:text-3xl">Find the right direction for your space.</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/products" className="inline-flex min-h-11 items-center gap-2 bg-[#6B2737] px-6 text-sm font-medium text-white transition-colors hover:bg-stone-900">Explore products <span aria-hidden="true">→</span></Link>
            <Link href="/case-showcase" className="inline-flex min-h-11 items-center gap-2 border border-stone-300 px-6 text-sm font-medium text-stone-700 transition-colors hover:border-stone-900 hover:text-stone-950">View case showcase <span aria-hidden="true">→</span></Link>
            <Link href="/contact" className="inline-flex min-h-11 items-center gap-2 border-b border-[#6B2737] px-1 text-sm font-medium text-[#6B2737] transition-colors hover:border-stone-900 hover:text-stone-900">Contact us <span aria-hidden="true">→</span></Link>
          </div>
        </FadeIn>
      </section>
    </main>
  );
}
