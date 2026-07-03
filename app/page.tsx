import Image from "next/image";
import { getFolderImagePaths, getRepresentativeImage } from "@/lib/imageAssets";
import HeroCarousel from "./HeroCarousel";
import FadeIn from "@/components/ui/FadeIn";
const FALLBACK = "/images/Other/fallback.jpg";
const categories = [
  {
    title: "Living Room",
    description: "Sofas, Lounge Chairs, Coffee Tables",
    folder: "Living Room",
  },
  {
    title: "Dining & Bedroom",
    description: "Dining Tables, Dining Chairs, Beds, Nightstands",
    folder: "Dining",
  },
  {
    title: "Custom Interiors",
    description: "Wardrobes, Cabinetry, Wall Panels, Doors, TV Units",
    folder: "Custom Interiors",
  },
];
const newArrivalFolders = [
  { label: "New Arrival 01", folder: "Bedroom" },
  { label: "New Arrival 02", folder: "Dining" },
  { label: "New Arrival 03", folder: "Living Room" },
  { label: "New Arrival 04", folder: "Custom Interiors" },
];
export default function Home() {
  const heroImages = getFolderImagePaths("Hero");
  const heroSlides = heroImages.length > 0 ? heroImages : [FALLBACK];
  const categoryCards = categories.map((category) => ({
    ...category,
    image: getRepresentativeImage(category.folder, FALLBACK),
  }));
  const newArrivals = newArrivalFolders.map((item) => {
    const list = getFolderImagePaths(item.folder);
    const image = list.length > 1 ? list[1] : list[0] ?? FALLBACK;
    return { ...item, image };
  });
  return (
    <main className="bg-[#FAF9F6] text-stone-800">
      <section className="relative isolate overflow-hidden px-6 py-20 sm:px-8 lg:px-10">
        <HeroCarousel images={heroSlides} />
        <div className="relative z-10 mx-auto flex min-h-[90vh] max-w-6xl flex-col items-center justify-center text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-stone-200">
            Meimi&H
          </p>
          <div className="mb-6 h-px w-12 bg-[#C99A9A]" />
          <h1 className="max-w-4xl font-['var(--font-playfair-display)'] text-5xl leading-tight text-white sm:text-6xl lg:text-7xl">
            Where Beauty Dwells, The Heart Finds
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-stone-200 sm:text-xl">
            Creating refinement, one piece at a time.
          </p>
          <a
            href="/products"
            className="mt-10 inline-flex items-center rounded-full border border-white bg-white px-7 py-3 text-sm font-semibold text-stone-900 transition-all duration-300 hover:border-[#6B2737] hover:bg-[#6B2737] hover:text-white"
          >
            Explore Collections
          </a>
        </div>
      </section>
      <section className="px-6 pb-20 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3">
          {categoryCards.map((category, index) => (
            <FadeIn key={category.title} delay={index * 100}>
              <article className="group flex min-h-[260px] flex-col justify-between rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                  <Image
                    src={category.image}
                    alt={`${category.title} showcase`}
                    fill
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                </div>
                <div className="mt-6">
                  <h2 className="inline-block text-2xl font-semibold text-stone-900">
                    {category.title}
                    <span className="mt-1 block h-px w-0 bg-[#6B2737] transition-all duration-300 group-hover:w-full" />
                  </h2>
                  <p className="mt-3 text-base leading-7 text-stone-600">
                    {category.description}
                  </p>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </section>
      <section className="border-t border-stone-200 px-6 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <div className="mb-10 flex flex-col items-center text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-stone-500">
                Just In
              </p>
              <h2 className="mt-3 font-['var(--font-playfair-display)'] text-4xl text-stone-900 sm:text-5xl">
                New Arrivals
              </h2>
            </div>
          </FadeIn>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {newArrivals.map((item, index) => (
              <FadeIn key={item.label} delay={index * 100}>
                <article className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.label}
                      fill
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    <span className="absolute left-4 top-4 rounded-full bg-[#6B2737] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                      New
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="inline-block text-lg font-semibold text-stone-900">
                      {item.label}
                      <span className="mt-1 block h-px w-0 bg-[#6B2737] transition-all duration-300 group-hover:w-full" />
                    </h3>
                    <p className="mt-1 text-sm text-stone-500">Coming soon</p>
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
      <section className="border-t border-stone-200 bg-white/70 px-6 py-6 text-center sm:px-8 lg:px-10">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-stone-600">
          Factory Direct · Premium Materials · Custom Orders Welcome · Est. 2020
        </p>
      </section>
    </main>
  );
}
