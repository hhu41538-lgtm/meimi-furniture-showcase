const values = [
  {
    title: "Premium Materials",
    description: "Hand-selected woods, luxe upholstery, and finishes chosen for durability and beauty.",
  },
  {
    title: "Master Craftsmen",
    description: "Decades of furniture-making expertise, refined through generations of local craftsmanship.",
  },
  {
    title: "Factory Direct",
    description: "Direct sourcing and transparent production, ensuring quality and value at every step.",
  },
];

export default function AboutPage() {
  return (
    <main className="bg-[#FAF9F6] px-6 py-16 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <section className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-stone-500">
            Our atelier
          </p>
          <h1 className="mt-3 font-['var(--font-playfair-display)'] text-4xl font-semibold text-stone-900 sm:text-5xl">
            Our Atelier — Foshan, China
          </h1>
        </section>

        <section className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
          <p className="text-lg leading-8 text-stone-600">
            Founded in 2020 in Shunde District, Longjiang Town, Foshan — the world&apos;s furniture manufacturing heartland — Meimi&H was built on one belief: that beautiful furniture should feel as considered as the finest European houses. We bring together 20+ years of local craftsmanship with a refined global aesthetic, serving clients who believe their home deserves the extraordinary.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {values.map((value) => (
            <article key={value.title} className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-stone-900">{value.title}</h2>
              <p className="mt-3 text-base leading-7 text-stone-600">{value.description}</p>
            </article>
          ))}
        </section>

        <blockquote className="rounded-3xl border border-stone-200 bg-stone-900 px-8 py-10 text-white shadow-sm">
          <p className="text-xl leading-8 sm:text-2xl">
            &quot;Where beauty dwells
, the heart finds.&quot;
 — Meimi&H
          </p>
        </blockquote>
      </div>
    </main>
  );
}
