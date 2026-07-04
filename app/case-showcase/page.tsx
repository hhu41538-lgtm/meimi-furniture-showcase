import type { Metadata } from "next";
import Image from "next/image";
import { getFolderImagePaths } from "@/lib/imageAssets";
import FadeIn from "@/components/ui/FadeIn";

export const metadata: Metadata = {
  title: "Case Showcase | Meimi&H",
  description:
    "Real visits, real spaces — a look inside how Meimi&H welcomes clients worldwide, from factory visits to finished interiors. Full case studies coming soon.",
  alternates: { canonical: "/case-showcase" },
};

const FALLBACK = "/images/Other/fallback.jpg";

const placeholderCases = [
  { id: "case-01", title: "Case Study 01", location: "Coming soon" },
  { id: "case-02", title: "Case Study 02", location: "Coming soon" },
  { id: "case-03", title: "Case Study 03", location: "Coming soon" },
  { id: "case-04", title: "Case Study 04", location: "Coming soon" },
  { id: "case-05", title: "Case Study 05", location: "Coming soon" },
  { id: "case-06", title: "Case Study 06", location: "Coming soon" },
];

export default function CaseShowcasePage() {
  const images = getFolderImagePaths("Case Showcase");

  const cases = placeholderCases.map((item, index) => ({
    ...item,
    image: images.length > 0 ? images[index % images.length] : FALLBACK,
  }));

  return (
    <main className="bg-[#FAF9F6] text-stone-800">
      {/* HEADER */}
      <section className="px-6 pt-32 sm:px-8 lg:px-10 lg:pt-40">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-medium uppercase tracking-[0.4em] text-stone-400">
              Case Showcase
            </p>
            <h1 className="mt-5 text-4xl font-extralight tracking-tight text-stone-900 sm:text-6xl">
              Real visits, real spaces
            </h1>
            <p className="mx-auto mt-8 max-w-xl text-base font-light leading-loose text-stone-500">
              A look inside how we welcome and work with clients from around the
              world &mdash; from factory visits to finished interiors. Full case
              studies are coming soon.
            </p>
          </div>
        </FadeIn>
      </section>

      {/* GRID */}
      <section className="px-6 py-24 sm:px-8 lg:px-10 lg:py-32">
        <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map((item, index) => (
            <FadeIn key={item.id} delay={(index % 3) * 100}>
              <article className="group relative block aspect-[16/9] overflow-hidden rounded-sm">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-7">
                  <h2 className="text-lg font-light tracking-tight text-white">
                    {item.title}
                  </h2>
                  <p className="mt-1 text-sm font-light text-white/70">
                    {item.location}
                  </p>
                  <span className="mt-3 block h-px w-8 bg-white/60 transition-all duration-500 group-hover:w-14" />
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="border-t border-stone-200/70 bg-white/60 px-6 py-16 text-center sm:px-8 lg:px-10">
        <h2 className="text-2xl font-extralight tracking-tight text-stone-900 sm:text-3xl">
          Visit us, or bring us your project.
        </h2>
        <a
          href="https://wa.me/8617796076275"
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-flex items-center gap-2 border-b border-[#6B2737] pb-1 text-sm font-medium tracking-[0.12em] text-[#6B2737] transition-colors duration-300 hover:border-stone-900 hover:text-stone-900"
        >
          START A CONVERSATION
          <span>&rarr;</span>
        </a>
      </section>
    </main>
  );
}
