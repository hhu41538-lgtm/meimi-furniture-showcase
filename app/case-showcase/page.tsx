import Image from "next/image";

import { getFolderImagePaths } from "@/lib/imageAssets";
import FadeIn from "@/components/ui/FadeIn";

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
      <section className="px-6 py-20 sm:px-8 lg:px-10">
        <FadeIn>
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-stone-500">
              Case Showcase
            </p>
            <h1 className="mt-4 font-['var(--font-playfair-display)'] text-4xl text-stone-900 sm:text-5xl">
              Real Visits, Real Spaces
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-stone-600">
              A look inside how we welcome and work with clients from around the
              world, from factory visits to finished interiors. Full case
              studies are coming soon.
            </p>
          </div>
        </FadeIn>
      </section>

      <section className="px-6 pb-24 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map((item, index) => (
            <FadeIn key={item.id} delay={index * 80}>
              <article className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="relative h-72 w-full overflow-hidden bg-white sm:h-80">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-contain p-3 transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                </div>
                <div className="border-t border-stone-100 p-5">
                  <h2 className="inline-block text-lg font-semibold text-stone-900">
                    {item.title}
                    <span className="mt-1 block h-px w-0 bg-[#6B2737] transition-all duration-300 group-hover:w-full" />
                  </h2>
                  <p className="mt-1 text-sm text-stone-500">{item.location}</p>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </section>
    </main>
  );
}