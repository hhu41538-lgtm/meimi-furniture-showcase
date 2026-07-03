import { getFolderImagePaths } from "@/lib/imageAssets";
import FadeIn from "@/components/ui/FadeIn";

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

  return (
    <main className="bg-[#FAF9F6] px-6 py-16 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-14">
        <FadeIn>
          <section className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-stone-500">
              The Art of Refined Living
            </p>
            <h1 className="mt-3 font-['var(--font-playfair-display)'] text-4xl font-semibold text-stone-900 sm:text-5xl">
              Our Atelier &mdash; Foshan, China
            </h1>
            <span className="mt-4 block h-0.5 w-16 bg-[#6B2737]" />
            <p className="mt-5 text-lg italic leading-8 text-stone-600 sm:text-xl">
              Creating refinement, one piece at a time.
            </p>
          </section>
        </FadeIn>

        <FadeIn>
          <section className="overflow-hidden rounded-3xl border border-stone-200 bg-stone-100 shadow-sm">
            <div className="relative aspect-[16/9] w-full">
              <img
                src={atelierImage}
                alt="Meimi&H atelier in Foshan"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </section>
        </FadeIn>

        <FadeIn>
          <section className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
            <p className="text-lg leading-8 text-stone-600">
              Founded in 2020 in Shunde District, Longjiang Town, Foshan &mdash; the
              world&apos;s furniture manufacturing heartland &mdash; Meimi&amp;H was
              built on one belief: that beautiful furniture should feel as
              considered as the finest European houses. We bring together 20+ years
              of local craftsmanship with a refined global aesthetic, serving
              clients who believe their home deserves the extraordinary.
            </p>
          </section>
        </FadeIn>

        <FadeIn>
          <section className="grid gap-8 md:grid-cols-2">
            <div className="group overflow-hidden rounded-3xl border border-stone-200 bg-stone-100 shadow-sm transition-all duration-300 hover:shadow-xl">
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <img
                  src={craftImage}
                  alt="Craft detail"
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-stone-500">
                Signature craft
              </p>
              <h2 className="mt-3 font-['var(--font-playfair-display)'] text-3xl font-semibold text-stone-900 sm:text-4xl">
                Detail is our discipline.
              </h2>
              <span className="mt-4 block h-0.5 w-12 bg-[#6B2737]" />
              <p className="mt-5 text-base leading-8 text-stone-600 sm:text-lg">
                Every piece leaves our workshop only after passing through the
                hands of makers who have spent a lifetime learning how wood, stone
                and textile behave. The difference is in the millimetres you never
                see.
              </p>
            </div>
          </section>
        </FadeIn>

        <section className="grid gap-6 md:grid-cols-3">
          {values.map((value, index) => (
            <FadeIn key={value.title} delay={index * 100}>
              <article className="group h-full rounded-3xl border border-stone-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <h2 className="inline-block text-xl font-semibold text-stone-900">
                  {value.title}
                  <span className="mt-1 block h-px w-0 bg-[#6B2737] transition-all duration-300 group-hover:w-full" />
                </h2>
                <p className="mt-3 text-base leading-7 text-stone-600">
                  {value.description}
                </p>
              </article>
            </FadeIn>
          ))}
        </section>

        <FadeIn>
          <section className="overflow-hidden rounded-3xl border border-stone-200 bg-stone-100 shadow-sm">
            <div className="relative aspect-[21/9] w-full">
              <img
                src={showroomImage}
                alt="Meimi&H showroom"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </section>
        </FadeIn>

        <FadeIn>
          <blockquote className="rounded-3xl border-l-4 border-[#6B2737] bg-stone-900 px-8 py-10 text-white shadow-sm">
            <p className="text-xl leading-8 sm:text-2xl">
              &quot;Where beauty dwells, the heart finds.&quot; &mdash; Meimi&amp;H
            </p>
          </blockquote>
        </FadeIn>
      </div>
    </main>
  );
}
