import Image from "next/image";

import { getDistributedImages } from "@/lib/imageAssets";

const readyMadeProducts = [
  { name: "Groundpiece", category: "Living Room" },
  { name: "Vivienne", category: "Living Room" },
  { name: "Lawrence", category: "Living Room" },
  { name: "Perry", category: "Living Room" },
  { name: "Camelot", category: "Living Room" },
  { name: "Bessel", category: "Living Room" },
  { name: "Vivienne Chair", category: "Living Room" },
  { name: "Aston", category: "Living Room" },
  { name: "Beverly", category: "Living Room" },
  { name: "Anrun", category: "Dining" },
  { name: "Olivia", category: "Dining" },
  { name: "Mashi", category: "Dining" },
  { name: "Dragon Bone", category: "Dining" },
  { name: "Senke Dining Table", category: "Dining" },
  { name: "Travertine Dining Table", category: "Dining" },
  { name: "Youqu", category: "Bedroom" },
  { name: "Nianbi", category: "Bedroom" },
  { name: "Aman", category: "Bedroom" },
  { name: "Stone", category: "Bedroom" },
];

const customCategories = [
  {
    title: "Wardrobes & Storage",
    description: "Tailored wardrobe systems, closets, and finished storage solutions.",
  },
  {
    title: "Kitchen Cabinetry",
    description: "Elegant turnkey cabinetry for contemporary kitchens and service spaces.",
  },
  {
    title: "Wall Panels & Doors",
    description: "Textured wall panels and statement doors crafted to suit your interiors.",
  },
];

const tabs = ["All", "Living Room", "Dining", "Bedroom"];

export default function ProductsPage() {
  const livingRoomCount = readyMadeProducts.filter(
    (product) => product.category === "Living Room"
  ).length;
  const diningCount = readyMadeProducts.filter(
    (product) => product.category === "Dining"
  ).length;
  const bedroomCount = readyMadeProducts.filter(
    (product) => product.category === "Bedroom"
  ).length;

  const imageSources = {
    "Living Room": getDistributedImages("Living Room", livingRoomCount),
    Dining: getDistributedImages("Dining & Bedroom", diningCount),
    Bedroom: getDistributedImages("Dining & Bedroom", bedroomCount),
  };

  const productsWithImages = readyMadeProducts.map((product) => {
    const categoryKey =
      product.category === "Living Room"
        ? "Living Room"
        : product.category === "Dining"
          ? "Dining"
          : "Bedroom";

    const categoryProducts = readyMadeProducts.filter(
      (entry) => entry.category === product.category
    );
    const categoryIndex = categoryProducts.findIndex(
      (entry) => entry.name === product.name && entry.category === product.category
    );
    const imageList = imageSources[categoryKey as keyof typeof imageSources];
    const imageSrc = imageList?.[categoryIndex % imageList.length] ?? "/images/Other/观景01.jpg";

    return {
      ...product,
      imageSrc,
    };
  });

  const customCategoryImages = getDistributedImages(
    "Custom Interiors",
    customCategories.length,
    "/images/Other/观景01.jpg"
  );

  return (
    <main className="bg-[#FAF9F6] px-6 py-16 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-16">
        <section>
          <div className="mb-10 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-stone-500">
              Ready-made collections
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-stone-900 sm:text-5xl">
              Ready-Made Collections
            </h1>
          </div>

          <div className="mb-10 flex flex-wrap gap-3">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  tab === "All"
                    ? "border-stone-900 bg-stone-900 text-white"
                    : "border-stone-300 bg-white text-stone-700 hover:border-stone-900 hover:text-stone-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {productsWithImages.map((product) => (
              <article
                key={product.name}
                className="flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
              >
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={product.imageSrc}
                    alt={`${product.name} showcase`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <span className="inline-block w-fit rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-stone-600">
                    {product.category}
                  </span>
                  <h3 className="mt-4 text-xl font-semibold text-stone-900">
                    {product.name}
                  </h3>
                  <a
                    href="https://wa.me/8617796076275"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex w-fit rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-900 hover:text-stone-900"
                  >
                    Inquire via WhatsApp
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-8 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-stone-500">
              Bespoke solutions
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-stone-900 sm:text-4xl">
              Custom Interiors
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {customCategories.map((category, index) => (
              <article
                key={category.title}
                className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                  <Image
                    src={customCategoryImages[index] ?? "/images/Other/观景01.jpg"}
                    alt={`${category.title} showcase`}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-stone-900">
                  {category.title}
                </h3>
                <p className="mt-3 text-base leading-7 text-stone-600">
                  {category.description}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
