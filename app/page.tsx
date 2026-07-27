import Image from "next/image";
import Link from "next/link";
import { getFolderImagePaths, getRepresentativeImage } from "@/lib/imageAssets";
import { getProductsByCategory } from "@/lib/products";
import HeroCarousel from "./HeroCarousel";
import FadeIn from "@/components/ui/FadeIn";
import HeroTitle from "@/components/ui/HeroTitle";
import ParallaxImage from "@/components/ui/ParallaxImage";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

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
  const newArrivals = getProductsByCategory("sofa");

  return (
    <main className="bg-[#FAF9F6] text-stone-800">
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <HeroCarousel images={heroSlides} />
        <div className="relative z-10 mx-auto flex min-h-[92vh] max-w-5xl flex-col items-center justify-center px-6 text-center">
          <p className="hero-rise mb-8 text-xs font-medium uppercase tracking-[0.5em] text-white/70" style={{ animationDelay: "0.1s" }}>
            Meimi&H
          </p>
          <HeroTitle lines={["Refined Living", "Crafted For You"]} startDelay={0.25} />
          <p className="hero-rise mt-8 max-w-lg text-base font-light leading-relaxed tracking-wide text-white/80" style={{ animationDelay: "1.1s" }}>
            Bespoke furniture, made to order in our Foshan atelier.
          </p>
          <a
            href="/products"
            className="hero-rise group mt-12 inline-flex items-center gap-2 border-b border-white/50 pb-1 text-sm font-medium tracking-[0.15em] text-white transition-colors duration-300 hover:border-white"
            style={{ animationDelay: "1.3s" }}
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
            <ParallaxImage
              src={ethosImage}
              alt="Meimi&H interior"
              className="aspect-[4/5] rounded-sm"
            />
          </FadeIn>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="border-t border-stone-200/70 bg-white/60 px-6 py-20 sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-6">
          <AnimatedCounter target={20} suffix="+" label="Years of Craft" delay={0} />
          <AnimatedCounter target={100} suffix="%" label="Factory Direct" delay={150} />
          <AnimatedCounter target={2020} label="Atelier Est." delay={300} />
        </div>
      </section>

      {/* CATEGORIES - full-image magazine cards */}
      <section className="px-6 py-28 sm:px-8 lg:px-10 lg:py-40">
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
                    className="object-cover transition-transform duration-[1100ms] [transition-timing-function:var(--ease-lux)] group-hover:scale-[1.08]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/10 to-transparent transition-all duration-500 group-hover:from-stone-950/90 group-hover:via-stone-950/25" />
                  <div className="absolute inset-x-0 bottom-0 p-7">
                    <h3 className="text-xl font-light tracking-tight text-white transition-transform duration-500 [transition-timing-function:var(--ease-lux)] group-hover:-translate-y-1">
                      {category.title}
                    </h3>
                    <p className="mt-1.5 max-w-[16rem] translate-y-1 text-sm font-light leading-relaxed text-white/0 transition-all duration-500 group-hover:translate-y-0 group-hover:text-white/75">
                      {category.description}
                    </p>
                    <span className="mt-3 block h-px w-8 bg-white/60 transition-all duration-500 [transition-timing-function:var(--ease-lux)] group-hover:w-16" />
                  </div>
                </a>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS - editorial alternating layout */}
      <section id="new-arrivals" className="scroll-mt-24 border-t border-stone-200/70 px-6 py-28 sm:px-8 lg:px-10 lg:py-36">
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <div className="mb-16 flex flex-wrap items-end justify-between gap-6 lg:mb-24">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.4em] text-stone-400">
                  Just In
                </p>
                <h2 className="mt-4 text-4xl font-extralight tracking-tight text-stone-900 sm:text-5xl">
                  New Arrivals
                </h2>
              </div>
              <a
                href="/products"
                className="group hidden items-center gap-2 pb-2 text-xs font-medium uppercase tracking-[0.25em] text-stone-500 transition-colors duration-300 hover:text-[#6B2737] sm:inline-flex"
              >
                All Products
                <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
              </a>
            </div>
          </FadeIn>
          <div className="space-y-24 lg:space-y-28">
            {newArrivals.map((product, index) => {
              const reversed = index % 2 === 1;
              const number = String(index + 1).padStart(2, "0");
              return (
                <FadeIn key={product.slug} delay={100}>
                  <Link
                    href={`/products/${product.slug}`}
                    className="group grid items-center gap-10 lg:grid-cols-12 lg:gap-12"
                  >
                    <div
                      className={`relative aspect-[4/3] overflow-hidden rounded-sm lg:col-span-7 ${
                        reversed ? "lg:order-2" : "lg:order-1"
                      }`}
                    >
                      <Image
                        src={product.mainImage}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-[1200ms] [transition-timing-function:var(--ease-lux)] group-hover:scale-[1.05]"
                      />
                    </div>
                    <div
                      className={`relative lg:col-span-5 ${
                        reversed ? "lg:order-1" : "lg:order-2"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -left-3 -top-24 z-0 hidden select-none font-extralight leading-none text-transparent lg:block lg:text-[9rem]"
                        style={{ WebkitTextStroke: "1.5px rgba(107,39,55,0.16)" }}
                      >
                        {number}
                      </span>
                      <div className="relative z-10">
                        <span className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.3em] text-[#6B2737]">
                          <span className="h-px w-7 bg-[#6B2737]/70" />
                          New Arrival
                        </span>
                        <h3 className="mt-5 text-3xl font-extralight tracking-tight text-stone-900 transition-colors duration-300 group-hover:text-[#6B2737] sm:text-4xl">
                          {product.name}
                        </h3>
                        <p className="mt-4 max-w-md text-base italic font-light leading-relaxed text-stone-500">
                          {product.tagline}
                        </p>
                        <span className="relative mt-8 inline-flex w-fit items-center gap-2 pb-1 text-sm font-medium tracking-[0.12em] text-[#6B2737]">
                          VIEW DETAILS
                          <span className="transition-transform duration-300 group-hover:translate-x-1">
                            &rarr;
                          </span>
                          <span className="absolute bottom-0 left-0 h-px w-0 bg-[#6B2737] transition-all duration-500 [transition-timing-function:var(--ease-lux)] group-hover:w-full" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </FadeIn>
              );
            })}
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
