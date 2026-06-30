import Image from "next/image";

import { getRepresentativeImage } from "@/lib/imageAssets";

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

export default function Home() {
  const heroImage = getRepresentativeImage("Hero", "/images/Other/fallback.jpg");
  const categoryCards = categories.map((category) => ({
    ...category,
    image: getRepresentativeImage(category.folder, "/images/Other/fallback.jpg"),
  }));

  return (
    <main className="bg-[#FAF9F6] text-stone-800">
      <section className="relative isolate overflow-hidden px-6 py-20 sm:px-8 lg:px-10">
        <div className="absolute inset-0">
          <Image
            src={heroImage}
            alt="Featured furniture showcase"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-stone-950/55" />
        </div>
        <div className="relative z-10 mx-auto flex min-h-[90vh] max-w-6xl flex-col items-center justify-center text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-stone-200">
            Meimi&H
          </p>
          <h1 className="max-w-4xl font-['var(--font-playfair-display)'] text-5xl leading-tight text-white sm:text-6xl lg:text-7xl">
            Where Beauty Dwells, The Heart Finds
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-stone-200 sm:text-xl">
            Premium furniture, direct from our Foshan atelier. Established 2020.
          </p>
          <a
            href="/products"
            className="mt-10 inline-flex items-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-stone-900 transition hover:bg-stone-100"
          >
            Explore Collections
          </a>
        </div>
      </section>

      <section className="px-6 pb-20 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3">
          {categoryCards.map((category) => (
            <article
              key={category.title}
              className="flex min-h-[260px] flex-col justify-between rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Image
                  src={category.image}
                  alt={`${category.title} showcase`}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="mt-6">
                <h2 className="text-2xl font-semibold text-stone-900">
                  {category.title}
                </h2>
                <p className="mt-3 text-base leading-7 text-stone-600">
                  {category.description}
                </p>
              </div>
            </article>
          ))}
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
