"use client";

type Product = { name: string; category: string; imageSrc: string };
type CustomCategory = { id: string; title: string; description: string; imageSrc: string };
type OtherSpaces = { id: string; title: string; description: string; imageSrc: string };
type Mattress = { id: string; title: string; description: string; imageSrc: string };

const readyMadeSubs = [
  { id: "living-room", title: "Living Room", category: "Living Room" },
  { id: "dining", title: "Dining", category: "Dining" },
  { id: "bedroom", title: "Bedroom", category: "Bedroom" },
];

const WHATSAPP = "https://wa.me/8617796076275";

export default function ProductsClient(props: {
  products: Product[];
  customCategories: CustomCategory[];
  otherSpaces: OtherSpaces;
  mattress: Mattress;
}) {
  const { products, customCategories, otherSpaces, mattress } = props;

  return (
    <main className="bg-[#FAF9F6] px-6 py-16 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-24">
        <section id="ready-made" className="scroll-mt-24">
          <div className="mb-12 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-stone-500">
              Ready-made collections
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-stone-900 sm:text-5xl">
              Ready-Made Collections
            </h1>
          </div>

          <div className="space-y-20">
            {readyMadeSubs.map((sub) => {
              const items = products.filter((p) => p.category === sub.category);
              return (
                <div key={sub.id} id={sub.id} className="scroll-mt-24">
                  <h2 className="mb-8 text-2xl font-semibold text-stone-900 sm:text-3xl">
                    {sub.title}
                  </h2>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {items.map((product) => (
                      <article
                        key={product.name}
                        className="flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
                      >
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
                          <img
                            src={product.imageSrc}
                            alt={product.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
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
                            href={WHATSAPP}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-5 inline-flex w-fit rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:border-stone-900"
                          >
                            Inquire via WhatsApp
                          </a>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              );
            })}

            <div id={otherSpaces.id} className="scroll-mt-24">
              <h2 className="mb-8 text-2xl font-semibold text-stone-900 sm:text-3xl">
                {otherSpaces.title}
              </h2>
              <article className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm md:grid md:grid-cols-2">
                <div className="relative aspect-[4/3] overflow-hidden bg-stone-100 md:aspect-auto md:h-full">
                  <img
                    src={otherSpaces.imageSrc}
                    alt={otherSpaces.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-8 sm:p-10">
                  <span className="inline-block w-fit rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-stone-600">
                    Coming soon
                  </span>
                  <h3 className="mt-4 text-xl font-semibold text-stone-900 sm:text-2xl">
                    {otherSpaces.title}
                  </h3>
                  <p className="mt-3 text-base leading-7 text-stone-600">
                    {otherSpaces.description}
                  </p>
                  <a
                    href={WHATSAPP}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-flex w-fit rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:border-stone-900"
                  >
                    Enquire about upcoming pieces
                  </a>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="custom" className="scroll-mt-24">
          <div className="mb-12 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-stone-500">
              Bespoke solutions
            </p>
            <h2 className="mt-3 text-4xl font-semibold text-stone-900 sm:text-5xl">
              Custom Interiors
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {customCategories.map((category) => (
              <article
                key={category.id}
                id={category.id}
                className="scroll-mt-24 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                  <img
                    src={category.imageSrc}
                    alt={category.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-semibold text-stone-900 sm:text-2xl">
                    {category.title}
                  </h3>
                  <p className="mt-3 text-base leading-7 text-stone-600">
                    {category.description}
                  </p>
                  <a
                    href={WHATSAPP}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-flex w-fit rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:border-stone-900"
                  >
                    Discuss your project
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="mattress" className="scroll-mt-24">
          <div className="mb-12 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-stone-500">
              Signature craft
            </p>
            <h2 className="mt-3 text-4xl font-semibold text-stone-900 sm:text-5xl">
              Handmade Mattress
            </h2>
          </div>
          <article className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm md:grid md:grid-cols-2">
            <div className="relative aspect-[4/3] overflow-hidden bg-stone-100 md:aspect-auto md:h-full">
              <img
                src={mattress.imageSrc}
                alt={mattress.title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-8 sm:p-12">
              <h3 className="text-2xl font-semibold text-stone-900 sm:text-3xl">
                {mattress.title}
              </h3>
              <p className="mt-4 text-base leading-7 text-stone-600 sm:text-lg">
                {mattress.description}
              </p>
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex w-fit rounded-full border border-stone-300 px-6 py-3 text-sm font-medium text-stone-700 hover:border-stone-900"
              >
                Request the mattress catalogue
              </a>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
