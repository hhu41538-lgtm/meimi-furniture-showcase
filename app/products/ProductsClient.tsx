"use client";

import Image from "next/image";
import FadeIn from "@/components/ui/FadeIn";

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

const inquireLink =
  "group/cta mt-4 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.15em] text-[#6B2737] transition-colors duration-300 hover:text-stone-900";

export default function ProductsClient(props: {
  products: Product[];
  customCategories: CustomCategory[];
  otherSpaces: OtherSpaces;
  mattress: Mattress;
}) {
  const { products, customCategories, otherSpaces, mattress } = props;

  return (
    <main className="bg-[#FAF9F6] text-stone-800">
      <div className="mx-auto max-w-6xl px-6 pt-32 sm:px-8 lg:px-10 lg:pt-40">
        {/* READY-MADE */}
        <section id="ready-made" className="scroll-mt-24">
          <FadeIn>
            <div className="mb-16 text-center">
              <p className="text-xs font-medium uppercase tracking-[0.4em] text-stone-400">
                Ready-made Collections
              </p>
              <h1 className="mt-5 text-4xl font-extralight tracking-tight text-stone-900 sm:text-6xl">
                Ready-Made Collections
              </h1>
            </div>
          </FadeIn>

          <div className="space-y-24">
            {readyMadeSubs.map((sub) => {
              const items = products.filter((p) => p.category === sub.category);
              return (
                <div key={sub.id} id={sub.id} className="scroll-mt-24">
                  <FadeIn>
                    <div className="mb-10">
                      <h2 className="text-2xl font-extralight tracking-tight text-stone-900 sm:text-3xl">
                        {sub.title}
                      </h2>
                      <span className="mt-4 block h-px w-10 bg-[#6B2737]" />
                    </div>
                  </FadeIn>
                  <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((product, index) => (
                      <FadeIn key={product.name} delay={(index % 3) * 100}>
                        <article className="group">
                          <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
                            <Image
                              src={product.imageSrc}
                              alt={product.name}
                              fill
                              className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
                            />
                        </div>
                        <div className="mt-5">
                          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400">
                            {product.category}
                          </p>
                          <h3 className="mt-2 text-lg font-light tracking-tight text-stone-900">
                            {product.name}
                          </h3>
                          <a
                            href={WHATSAPP}
                            target="_blank"
                            rel="noreferrer"
                            className={inquireLink}
                          >
                            Inquire on WhatsApp
                            <span className="transition-transform duration-300 group-hover/cta:translate-x-1">
                              &rarr;
                            </span>
                          </a>
                        </div>
                      </article>
                    </FadeIn>
                  ))}
                  </div>
                </div>
              );
            })}

            {/* OTHER SPACES */}
            <div id={otherSpaces.id} className="scroll-mt-24">
              <FadeIn>
                <div className="mb-10">
                  <h2 className="text-2xl font-extralight tracking-tight text-stone-900 sm:text-3xl">
                    {otherSpaces.title}
                  </h2>
                  <span className="mt-4 block h-px w-10 bg-[#6B2737]" />
                </div>
                <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                  <div className="group relative aspect-[4/3] overflow-hidden rounded-sm">
                    <Image
                      src={otherSpaces.imageSrc}
                      alt={otherSpaces.title}
                      fill
                      className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.3em] text-stone-400">
                      Coming Soon
                    </p>
                    <h3 className="mt-4 text-2xl font-extralight tracking-tight text-stone-900">
                      {otherSpaces.title}
                    </h3>
                    <p className="mt-5 max-w-md text-base font-light leading-loose text-stone-500">
                      {otherSpaces.description}
                    </p>
                    <a
                      href={WHATSAPP}
                      target="_blank"
                      rel="noreferrer"
                      className={inquireLink}
                    >
                      Enquire about upcoming pieces
                      <span>&rarr;</span>
                    </a>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* CUSTOM INTERIORS */}
        <section id="custom" className="scroll-mt-24 pt-24 lg:pt-32">
          <FadeIn>
            <div className="mb-16 text-center">
              <p className="text-xs font-medium uppercase tracking-[0.4em] text-stone-400">
                Bespoke Solutions
              </p>
              <h2 className="mt-5 text-4xl font-extralight tracking-tight text-stone-900 sm:text-6xl">
                Custom Interiors
              </h2>
            </div>
          </FadeIn>
          <div className="grid gap-x-6 gap-y-12 md:grid-cols-2">
            {customCategories.map((category, index) => (
              <FadeIn key={category.id} delay={(index % 2) * 120}>
                <article id={category.id} className="group scroll-mt-24">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
                    <Image
                      src={category.imageSrc}
                      alt={category.title}
                      fill
                      className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-6">
                    <h3 className="text-xl font-light tracking-tight text-stone-900">
                      {category.title}
                    </h3>
                    <p className="mt-3 max-w-md text-base font-light leading-loose text-stone-500">
                      {category.description}
                    </p>
                    <a
                      href={WHATSAPP}
                      target="_blank"
                      rel="noreferrer"
                      className={inquireLink}
                    >
                      Discuss your project
                      <span>&rarr;</span>
                    </a>
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* HANDMADE MATTRESS */}
        <section id="mattress" className="scroll-mt-24 py-24 lg:py-32">
          <FadeIn>
            <div className="mb-16 text-center">
              <p className="text-xs font-medium uppercase tracking-[0.4em] text-stone-400">
                Signature Craft
              </p>
              <h2 className="mt-5 text-4xl font-extralight tracking-tight text-stone-900 sm:text-6xl">
                Handmade Mattress
              </h2>
            </div>
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="group relative aspect-[4/3] overflow-hidden rounded-sm">
                <Image
                  src={mattress.imageSrc}
                  alt={mattress.title}
                  fill
                  className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
                />
              </div>
              <div>
                <h3 className="text-2xl font-extralight tracking-tight text-stone-900 sm:text-3xl">
                  {mattress.title}
                </h3>
                <span className="mt-4 block h-px w-10 bg-[#6B2737]" />
                <p className="mt-6 max-w-md text-base font-light leading-loose text-stone-500">
                  {mattress.description}
                </p>
                <a
                  href={WHATSAPP}
                  target="_blank"
                  rel="noreferrer"
                  className={inquireLink}
                >
                  Request the mattress catalogue
                  <span>&rarr;</span>
                </a>
              </div>
            </div>
          </FadeIn>
        </section>
      </div>
    </main>
  );
}
