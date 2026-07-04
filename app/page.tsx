import Image from "next/image";
import Link from "next/link";
import { getFolderImagePaths, getRepresentativeImage } from "@/lib/imageAssets";
import { getProducts } from "@/lib/products";
import HeroCarousel from "./HeroCarousel";
import FadeIn from "@/components/ui/FadeIn";

const FALLBACK = "/images/Other/fallback.jpg";

const categories = [
  {
    title: "Living Room",
    description: "Sofas, lounge chairs, coffee tables",
    folder: "Living Room",
  },
  {
    title: "Dining & Bedroom",
    description: "Dining tables, chairs, beds, nightstands",
    folder: "Dining",
  },
  {
    title: "Custom Interiors",
    description: "Wardrobes, cabinetry, wall panels, doors",
    folder: "Custom Interiors",
  },
];

export default function Home() {
  const heroImages = getFolderImagePaths("Hero");
  const heroSlides = heroImages.length > 0 ? heroImages : [FALLBACK];
  const ethosImage = getRepresentativeImage("Living Room", FALLBACK);
  const categoryCards = categories.map((category) => ({
    ...category,
    image: getRepresentativeImage(category.folder, FALLBACK),
  }));
  const newArrivals = getProducts();

  return (
    <main className="bg-[#FAF9F6] text-stone-800">
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <HeroCarousel images={heroSlides} />
        <div className="relative z-10 mx-auto flex min-h-[92vh] max-w-5xl flex-col items-center justify-center px-6 text-center">
          <p className="hero-rise mb-8 text-xs font-medium uppercase tracking-[0.5em] text-white/70" style={{ animationDelay: "0.1s" }}>
            Meimi&H
          </p>
          <h1 className="hero-rise max-w-4xl text-[2.75rem] font-extralight leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-[5rem]" style={{ animationDelay: "0.25s" }}>
            Where beauty dwells,
            <br className="hidden sm:block" /> the heart finds
          </h1>
          <p className="hero-rise mt-8 max-w-md text-base font-light leading-relaxed tracking-wide text-white/80" style={{ animationDelay: "0.45s" }}>
            Refined furniture, made to feel like home.
          </p>
          <a
            href="/products"
            className="hero-rise group mt-12 inline-flex items-center gap-2 border-b border-white/50 pb-1 text-sm font-medium tracking-[0.15em] text-white transition-colors duration-300 hover:border-white"
            style={{ animationDelay: "0.65s" }}
          >
            EXPLORE COLLECTIONS
            <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
          </a>
        </div>
      </section>

      {/* BRAND ETHOS */}
      <section className="px-6 py-28 sm:px-8 lg:px-10 lg:py-40">
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <FadeIn>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.4em] text-stone-400">
                Our Philosophy
              </p>
              <h2 className="mt-6 text-4xl font-extralight leading-[1.15] tracking-tight text-stone-900 sm:text-5xl">
                Furniture made to feel like home.
              </h2>
              <p className="mt-8 max-w-md text-base font-light leading-loose text-stone-500">
                Every piece can be tailored to your space and built by hand in our
                Foshan atelier &mdash; where twenty years of craft meet a quieter,
                more considered idea of luxury.
              </p>
              <a
                href="/about"
                className="group mt-10 inline-flex items-center gap-2 text-sm font-medium tracking-[0.12em] text-[#6B2737] transition-colors duration-300 hover:text-stone-900"
              >
                OUR STORY
                <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
              </a>
            </div>
          </FadeIn>
          <FadeIn delay={150}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
              <Image
                src={ethosImage}
                alt="Meimi&H interior"
                fill
                className="object-cover"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CATEGORIES - full-image magazine cards */}
      <section className="px-6 pb-28 sm:px-8 lg:px-10 lg:pb-40">
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <div className="mb-14 max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-[0.4em] text-stone-400">
                Collections
              </p>
              <h2 className="mt-4 text-3xl font-extralight tracking-tight text-stone-900 sm:text-4xl">
                Explore by space
              </h2>
            </div>
          </FadeIn>
          <div className="grid gap-6 md:grid-cols-3">
            {categoryCards.map((category, index) => (
              <FadeIn key={category.title} delay={index * 120}>
                <a
                  href="/products"
                  className="group relative block aspect-[3/4] overflow-hidden rounded-sm"
                >
                  <Image
                    src={category.image}
                    alt={`${category.title} showcase`}
                    fill
                    className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-7">
                    <h3 className="text-xl font-light tracking-tight text-white">
                      {category.title}
                    </h3>
                    <p className="mt-1.5 max-w-[16rem] text-sm font-light leading-relaxed text-white/0 transition-all duration-500 group-hover:text-white/75">
                      {category.description}
                    </p>
                    <span className="mt-3 block h-px w-8 bg-white/60 transition-all duration-500 group-hover:w-14" />
                  </div>
                </a>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section id="new-arrivals" className="scroll-mt-24 border-t border-stone-200/70 px-6 py-28 sm:px-8 lg:px-10 lg:py-36">
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <div className="mb-14 flex flex-col items-center text-center">
              <p className="text-xs font-medium uppercase tracking-[0.4em] text-stone-400">
                Just In
              </p>
              <h2 className="mt-4 text-4xl font-extralight tracking-tight text-stone-900 sm:text-5xl">
                New Arrivals
              </h2>
            </div>
          </FadeIn>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {newArrivals.map((product, index) => (
              <FadeIn key={product.slug} delay={index * 100}>
                <Link href={`/products/${product.slug}`} className="group block">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-sm">
                    <Image
                      src={product.mainImage}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
                    />
                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-800 backdrop-blur">
                      New
                    </span>
                  </div>
                  <div className="mt-5">
                    <h3 className="text-base font-light tracking-tight text-stone-900 transition-colors duration-300 group-hover:text-[#6B2737]">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-sm font-light text-stone-400">
                      {product.tagline}
                    </p>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER STRIP */}
      <section className="border-t border-stone-200/70 bg-white/60 px-6 py-10 text-center sm:px-8 lg:px-10">
        <p className="text-xs font-medium uppercase tracking-[0.35em] text-stone-500">
          Factory Direct &middot; Premium Materials &middot; Custom Orders Welcome &middot; Est. 2020
        </p>
      </section>
    </main>
  );
}
