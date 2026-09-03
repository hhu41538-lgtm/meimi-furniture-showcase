import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";

export const metadata: Metadata = {
  title: "Custom Furniture Manufacturer | Bespoke, Made to Order",
  description:
    "Bespoke furniture made to order in our Foshan atelier. Two decades of craftsmanship, factory-direct: custom sofas, dining, bedroom, wardrobes, cabinetry and whole-home interiors, shipped worldwide.",
  alternates: { canonical: "/custom" },
  openGraph: {
    title: "Custom Furniture Manufacturer | Bespoke, Made to Order | Meimi&H",
    description:
      "Bespoke furniture made to order in our Foshan atelier — factory-direct, shipped worldwide.",
    type: "website",
  },
};

const PHONE = "tel:15355787546";

const HERO_IMAGE = encodeURI("/images/explore by space/Vivian sofa/New Arrivals.jpg");

const capabilities = [
  {
    title: "Living & Lounge",
    description: "Custom sofas, sectionals, armchairs and coffee tables, sized and upholstered to your space.",
  },
  {
    title: "Dining",
    description: "Bespoke dining tables and chairs in solid wood, stone and premium finishes.",
  },
  {
    title: "Bedroom",
    description: "Beds, nightstands and dressers — plus our signature hand-tufted mattresses.",
  },
  {
    title: "Wardrobes & Storage",
    description: "Full-height wardrobes and dressing systems with configurable interiors.",
  },
  {
    title: "Kitchen & Cabinetry",
    description: "Turnkey kitchen systems with precise millwork, stone worktops and integrated appliances.",
  },
  {
    title: "Wall Panels & Doors",
    description: "Textured wall panels, statement doors and integrated TV cabinetry as a continuous surface.",
  },
];

const reasons = [
  {
    title: "Factory Direct",
    description:
      "You work with the makers, not a middleman. Transparent production and factory-direct pricing on every piece.",
  },
  {
    title: "Two Decades of Craft",
    description:
      "We began as a furniture factory. In 2020 we opened a dedicated company to bring that workshop directly to clients worldwide.",
  },
  {
    title: "Truly Made to Order",
    description:
      "Dimensions, upholstery, materials and finishes — tailored to your project, not adapted from a catalogue.",
  },
  {
    title: "Shipped Worldwide",
    description:
      "We handle export packing and global logistics, so a bespoke interior from Foshan arrives ready to install.",
  },
];

const steps = [
  {
    n: "01",
    title: "Consultation",
    description: "Share your space, references and requirements by phone. We discuss what's possible.",
  },
  {
    n: "02",
    title: "Design & Quote",
    description: "We prepare drawings, material options and a transparent, factory-direct quote.",
  },
  {
    n: "03",
    title: "Prototype & Sampling",
    description: "Where needed, we produce samples or a prototype so you can approve before full production.",
  },
  {
    n: "04",
    title: "Production",
    description: "Your pieces are handcrafted to order in our Foshan atelier, under our own quality control.",
  },
  {
    n: "05",
    title: "Global Logistics",
    description: "We export-pack and ship worldwide, coordinating delivery to your door or project site.",
  },
];

const residences = [
  {
    eyebrow: "Residence 01",
    title: "Warm Contemporary",
    tagline: "Soft geometry. Clear presence.",
    description:
      "A calm living landscape shaped by continuous storage, warm tones and soft architectural light.",
    hero: "/images/Residences/warm-contemporary/01-hero.jpg",
    gallery: [
      "/images/Residences/warm-contemporary/02-view.jpg",
      "/images/Residences/warm-contemporary/03-view.jpg",
      "/images/Residences/warm-contemporary/04-view.jpg",
    ],
  },
  {
    eyebrow: "Residence 02",
    title: "Soft Minimal",
    tagline: "Light, rhythm and reflection.",
    description:
      "Repeated lines, framed views and a restrained palette establish a calm, continuous architectural language.",
    hero: "/images/Residences/soft-minimal/01-hero.jpg",
    gallery: [
      "/images/Residences/soft-minimal/02-view.jpg",
      "/images/Residences/soft-minimal/03-view.jpg",
    ],
  },
  {
    eyebrow: "Residence 03",
    title: "Dark Tonal",
    tagline: "Structure with warmth.",
    description:
      "Clean geometry softened through material contrast and carefully paced detail — a darker, enveloping interior language.",
    hero: "/images/Residences/dark-tonal/01-hero.jpg",
    gallery: [
      "/images/Residences/dark-tonal/02-view.jpg",
      "/images/Residences/dark-tonal/03-view.jpg",
    ],
  },
  {
    eyebrow: "Modern French",
    title: "Framed Cabinetry",
    tagline: "Classical rhythm. Contemporary restraint.",
    description:
      "Framed fronts, measured symmetry and discreet detailing reinterpret a familiar European language for present-day interiors.",
    hero: "/images/Residences/modern-french/01-hero.jpg",
    gallery: ["/images/Residences/modern-french/02-view.jpg"],
  },
];

export default function CustomPage() {
  return (
    <main className="bg-[#FAF9F6] text-stone-800">
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image src={HERO_IMAGE} alt="Bespoke furniture by Meimi&H" fill priority className="object-cover" />
          <div className="absolute inset-0 bg-stone-950/50" />
        </div>
        <div className="mx-auto flex min-h-[78vh] max-w-4xl flex-col items-center justify-center px-6 py-32 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.4em] text-white/70">
            Custom Furniture
          </p>
          <h1 className="mt-6 text-4xl font-extralight leading-[1.1] tracking-tight text-white sm:text-6xl">
            Bespoke furniture,
            <br className="hidden sm:block" /> made to order in Foshan
          </h1>
          <p className="mt-8 max-w-xl text-base font-light leading-loose text-white/80">
            From a single custom sofa to a whole-home interior — designed with you,
            handcrafted in our atelier, and shipped worldwide.
          </p>
          <a
            href={PHONE}
            className="mt-10 inline-flex items-center gap-2 bg-[#6B2737] px-8 py-3.5 text-sm font-medium tracking-[0.12em] text-white transition-colors duration-300 hover:bg-white hover:text-stone-900"
          >
            START YOUR PROJECT
            <span>&rarr;</span>
          </a>
        </div>
      </section>

      {/* INTRO */}
      <section className="px-6 py-24 sm:px-8 lg:px-10 lg:py-32">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-medium uppercase tracking-[0.4em] text-stone-400">
              Bespoke Manufacturing
            </p>
            <h2 className="mt-5 text-3xl font-extralight tracking-tight text-stone-900 sm:text-4xl">
              A custom furniture manufacturer you work with directly.
            </h2>
            <p className="mt-8 text-base font-light leading-loose text-stone-500 sm:text-lg">
              Meimi&amp;H is a Foshan-based atelier specialising in made-to-order furniture
              for discerning clients around the world. Whether you&apos;re furnishing a single
              room or commissioning an entire residence, every piece is built to your
              specification and finished by hand.
            </p>
          </div>
        </FadeIn>
      </section>

      {/* CAPABILITIES */}
      <section className="border-t border-stone-200/70 px-6 py-24 sm:px-8 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <div className="mb-16 max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-[0.4em] text-stone-400">
                What We Make
              </p>
              <h2 className="mt-4 text-3xl font-extralight tracking-tight text-stone-900 sm:text-4xl">
                Custom across every space
              </h2>
            </div>
          </FadeIn>
          <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((cap, index) => (
              <FadeIn key={cap.title} delay={(index % 3) * 100}>
                <div>
                  <span className="block h-px w-8 bg-[#6B2737]" />
                  <h3 className="mt-6 text-xl font-light tracking-tight text-stone-900">
                    {cap.title}
                  </h3>
                  <p className="mt-3 text-base font-light leading-loose text-stone-500">
                    {cap.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* SELECTED RESIDENCES */}
      <section className="border-t border-stone-200/70 px-6 py-24 sm:px-8 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <div className="mb-16 max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-[0.4em] text-stone-400">
                Selected Residences
              </p>
              <h2 className="mt-4 text-3xl font-extralight tracking-tight text-stone-900 sm:text-4xl">
                Interiors, considered as architecture
              </h2>
              <p className="mt-6 max-w-xl text-base font-light leading-loose text-stone-500">
                A selection of whole-home projects — fitted storage, kitchens and
                wall systems treated as part of the space around them.
              </p>
            </div>
          </FadeIn>
          <div className="space-y-24 lg:space-y-28">
            {residences.map((r, index) => {
              const reversed = index % 2 === 1;
              return (
                <FadeIn key={r.title} delay={80}>
                  <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
                    <div
                      className={`relative aspect-[4/3] overflow-hidden rounded-sm lg:col-span-7 ${
                        reversed ? "lg:order-2" : ""
                      }`}
                    >
                      <Image
                        src={r.hero}
                        alt={`${r.title} residence`}
                        fill
                        className="object-cover transition-transform duration-[1200ms] [transition-timing-function:var(--ease-lux)] hover:scale-[1.04]"
                      />
                    </div>
                    <div className={`lg:col-span-5 ${reversed ? "lg:order-1" : ""}`}>
                      <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-[#6B2737]">
                        {r.eyebrow}
                      </p>
                      <h3 className="mt-4 text-2xl font-extralight tracking-tight text-stone-900 sm:text-3xl">
                        {r.title}
                      </h3>
                      <p className="mt-3 text-lg font-light italic text-stone-500">
                        {r.tagline}
                      </p>
                      <p className="mt-5 max-w-md text-base font-light leading-loose text-stone-500">
                        {r.description}
                      </p>
                    </div>
                  </div>
                  {r.gallery.length > 1 && (
                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {r.gallery.map((src, i) => (
                        <div
                          key={src}
                          className="relative aspect-[4/3] overflow-hidden rounded-sm"
                        >
                          <Image
                            src={src}
                            alt={`${r.title} detail ${i + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="border-t border-stone-200/70 px-6 py-24 sm:px-8 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <div className="mb-16 max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-[0.4em] text-stone-400">
                Why Meimi&amp;H
              </p>
              <h2 className="mt-4 text-3xl font-extralight tracking-tight text-stone-900 sm:text-4xl">
                The workshop, brought directly to you
              </h2>
            </div>
          </FadeIn>
          <div className="grid gap-x-16 gap-y-14 md:grid-cols-2">
            {reasons.map((reason, index) => (
              <FadeIn key={reason.title} delay={(index % 2) * 120}>
                <div className="border-t border-stone-200 pt-8">
                  <h3 className="text-xl font-light tracking-tight text-stone-900">
                    {reason.title}
                  </h3>
                  <p className="mt-4 text-base font-light leading-loose text-stone-500">
                    {reason.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="border-t border-stone-200/70 px-6 py-24 sm:px-8 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-5xl">
          <FadeIn>
            <div className="mb-16 text-center">
              <p className="text-xs font-medium uppercase tracking-[0.4em] text-stone-400">
                How It Works
              </p>
              <h2 className="mt-4 text-3xl font-extralight tracking-tight text-stone-900 sm:text-4xl">
                From first message to final delivery
              </h2>
            </div>
          </FadeIn>
          <div className="space-y-px">
            {steps.map((step, index) => (
              <FadeIn key={step.n} delay={(index % 5) * 60}>
                <div className="grid grid-cols-[auto_1fr] items-start gap-6 border-t border-stone-200 py-8 sm:gap-10">
                  <span className="text-2xl font-extralight tracking-tight text-[#6B2737]">
                    {step.n}
                  </span>
                  <div>
                    <h3 className="text-xl font-light tracking-tight text-stone-900">
                      {step.title}
                    </h3>
                    <p className="mt-2 max-w-2xl text-base font-light leading-loose text-stone-500">
                      {step.description}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* EXPLORE LINK */}
      <section className="border-t border-stone-200/70 px-6 py-24 text-center sm:px-8 lg:px-10">
        <FadeIn>
          <p className="text-xs font-medium uppercase tracking-[0.4em] text-stone-400">
            See Our Work
          </p>
          <h2 className="mt-4 text-2xl font-extralight tracking-tight text-stone-900 sm:text-3xl">
            Explore our collections for inspiration
          </h2>
          <Link
            href="/products"
            className="group mt-8 inline-flex items-center gap-2 text-sm font-medium tracking-[0.12em] text-[#6B2737] transition-colors duration-300 hover:text-stone-900"
          >
            VIEW PRODUCTS
            <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
          </Link>
        </FadeIn>
      </section>

      {/* CTA STRIP */}
      <section className="border-t border-stone-200/70 bg-white/60 px-6 py-20 text-center sm:px-8 lg:px-10">
        <h2 className="text-2xl font-extralight tracking-tight text-stone-900 sm:text-3xl">
          Tell us what you have in mind.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm font-light leading-relaxed text-stone-500">
          Share your space and references — we&apos;ll come back with ideas, materials and a
          factory-direct quote.
        </p>
        <a
          href={PHONE}
          className="mt-8 inline-flex items-center gap-2 bg-[#6B2737] px-8 py-3.5 text-sm font-medium tracking-[0.12em] text-white transition-colors duration-300 hover:bg-stone-900"
        >
          CALL TO DISCUSS YOUR PROJECT
          <span>&rarr;</span>
        </a>
      </section>
    </main>
  );
}
