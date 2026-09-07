import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";
import { caseStudies } from "./data";

const showcaseImage = caseStudies.find((item) => item.featured)?.image ?? "/images/Hero/hero4.jpg";

export const metadata: Metadata = {
  title: "Case Showcase",
  description:
    "Explore Meimi&H custom furniture and interior projects across China, from tailored kitchens and cabinetry to complete residential spaces.",
  alternates: { canonical: "/case-showcase" },
  openGraph: {
    title: "Case Showcase | Meimi&H",
    description: "Explore Meimi&H custom furniture and interior projects across China.",
    type: "website",
    images: [{ url: showcaseImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Case Showcase | Meimi&H",
    description: "Explore Meimi&H custom furniture and interior projects across China.",
    images: [showcaseImage],
  },
};

const PHONE = "https://wa.me/8617796045579";

export default function CaseShowcasePage() {
  const featured = caseStudies.find((item) => item.featured) ?? caseStudies[0];
  const supportingCases = caseStudies.filter((item) => item.id !== featured.id);

  return (
    <main className="bg-[#FAF9F6] text-stone-800">
      <section className="px-6 pb-16 pt-32 sm:px-8 lg:px-10 lg:pb-24 lg:pt-40">
        <FadeIn>
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-medium uppercase tracking-[0.4em] text-stone-400">Case Showcase</p>
            <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-end lg:gap-20">
              <h1 className="max-w-4xl text-4xl font-extralight leading-[1.08] tracking-tight text-stone-900 sm:text-6xl">Custom spaces, made around the way people live.</h1>
              <p className="max-w-sm text-base font-light leading-8 text-stone-500">A selection of residential projects shaped through tailored furniture, cabinetry and material decisions from the Meimi&H atelier.</p>
            </div>
            <nav aria-label="Jump to project" className="mt-10 flex gap-3 overflow-x-auto border-y border-stone-200 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {caseStudies.map((item) => (
                <a key={item.id} href={`#${item.id}`} className="shrink-0 text-xs font-medium uppercase tracking-[0.12em] text-stone-500 transition-colors hover:text-[#6B2737] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6B2737]">{item.title}</a>
              ))}
            </nav>
          </div>
        </FadeIn>
      </section>

      <section className="px-6 pb-24 sm:px-8 lg:px-10 lg:pb-32">
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <Link id={featured.id} href={`/case-showcase/${featured.id}`} className="group block border-t border-stone-300 pt-6 scroll-mt-28 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6B2737]">
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)] lg:items-end lg:gap-16">
                <div className="relative aspect-[16/10] overflow-hidden bg-stone-200"><Image src={featured.image} alt={`${featured.title} custom interior`} fill priority sizes="(max-width: 1024px) 100vw, 65vw" className="object-cover transition duration-700 ease-out group-hover:scale-[1.03]" /></div>
                <div className="pb-1">
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#6B2737]">Featured project</p>
                  <h2 className="mt-4 text-3xl font-light tracking-tight text-stone-950 sm:text-4xl">{featured.title}</h2>
                  <p className="mt-3 text-sm font-medium text-stone-500">{featured.location}</p>
                  <p className="mt-6 text-base font-light leading-7 text-stone-600">{featured.description}</p>
                  <span className="mt-7 inline-flex items-center gap-2 border-b border-[#6B2737] pb-1 text-xs font-medium uppercase tracking-[0.14em] text-[#6B2737]">Explore project <span aria-hidden="true">→</span></span>
                </div>
              </div>
            </Link>
          </FadeIn>

          <div className="mt-24 grid gap-x-6 gap-y-16 sm:grid-cols-2 lg:mt-32 lg:grid-cols-3">
            {supportingCases.map((item, index) => (
              <FadeIn key={item.id} delay={(index % 3) * 100}>
                <Link href={`/case-showcase/${item.id}`} className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6B2737]">
                  <div id={item.id} className="relative aspect-[4/3] scroll-mt-28 overflow-hidden bg-stone-200"><Image src={item.image} alt={`${item.title} custom interior`} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition duration-700 ease-out group-hover:scale-[1.035]" /></div>
                  <div className="border-t border-stone-300 pt-5">
                    <h2 className="text-xl font-light tracking-tight text-stone-950">{item.title}</h2>
                    <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-stone-400">{item.location}</p>
                    <p className="mt-4 text-sm font-light leading-6 text-stone-600">{item.description}</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-[#6B2737]">View case <span aria-hidden="true">→</span></span>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>

          <div className="mt-24 border-y border-stone-200 py-10 lg:mt-32 lg:py-12">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-20">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-400">From reference to room</p>
                <h2 className="mt-4 text-3xl font-light tracking-tight text-stone-950">A clear path to your custom project.</h2>
              </div>
              <div className="grid gap-8 sm:grid-cols-3">
                {[
                  ["01", "Share the brief", "Send your floor plan, reference images or the room you want to shape."],
                  ["02", "Refine the direction", "We discuss dimensions, materials, furniture and the right project scope."],
                  ["03", "Build the collection", "Your approved direction becomes a coordinated furniture plan for the space."],
                ].map(([number, title, description]) => (
                  <div key={number}>
                    <p className="text-xs font-medium tracking-[0.18em] text-[#6B2737]">{number}</p>
                    <h3 className="mt-3 text-lg font-light text-stone-950">{title}</h3>
                    <p className="mt-3 text-sm font-light leading-6 text-stone-600">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-stone-200/70 bg-white/60 px-6 py-16 text-center sm:px-8 lg:px-10">
        <h2 className="text-2xl font-extralight tracking-tight text-stone-900 sm:text-3xl">Have a space in mind?</h2>
        <p className="mx-auto mt-4 max-w-lg text-sm font-light leading-7 text-stone-500">Share your floor plan, reference images or room brief and we can discuss the right custom direction.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/custom" className="inline-flex min-h-11 items-center gap-2 bg-[#6B2737] px-6 text-sm font-medium text-white transition-colors hover:bg-stone-900">Explore custom furniture <span aria-hidden="true">→</span></Link>
          <a href={PHONE} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 border border-stone-300 px-6 text-sm font-medium text-stone-700 transition-colors hover:border-stone-900 hover:text-stone-950">WhatsApp +86 177 9604 5579</a>
        </div>
      </section>
    </main>
  );
}
