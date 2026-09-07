import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/seo-config";

export const metadata: Metadata = {
  title: "Luxury Series | Meimi&H",
  description:
    "Explore verified pieces from the Meimi&H Luxury Series, including sculptural dining tables and upholstered bedroom furniture made to order in Foshan.",
  alternates: { canonical: "/products/luxury-series" },
  openGraph: {
    title: "Luxury Series | Meimi&H",
    description: "Verified dining and bedroom pieces from the Meimi&H Luxury Series, made to order in Foshan.",
    type: "website",
    images: [{ url: "/images/luxury-series/wd001-jason-dining-table.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luxury Series | Meimi&H",
    description: "Verified dining and bedroom pieces from the Meimi&H Luxury Series, made to order in Foshan.",
    images: ["/images/luxury-series/wd001-jason-dining-table.png"],
  },
};

const PHONE = "https://wa.me/8617796045579";

const products = [
  {
    code: "WD001",
    name: "Jason Dining Table",
    category: "Dining Table",
    image: "/images/luxury-series/wd001-jason-dining-table.png",
    description: "A round marble dining table with a sculptural base and a refined, statement-making presence.",
  },
  {
    code: "WD002",
    name: "Atlantic Table",
    category: "Dining Table",
    image: "/images/luxury-series/wd002-atlantic-table.png",
    description: "A dark, polished dining table shaped around a calm oval profile and a generous central base.",
  },
  {
    code: "WD013",
    name: "Alford Table",
    category: "Dining Table",
    image: "/images/luxury-series/wd013-alford-table.png",
    description: "A long dining table pairing a light stone surface with rich timber detailing for considered interiors.",
  },
  {
    code: "WD003",
    name: "Madeley Table",
    category: "Dining Table",
    image: "/images/luxury-series/wd003-madeley-table.png",
    description: "A softly rounded dining table with a bright, balanced composition for contemporary dining spaces.",
  },
  {
    code: "WD005B",
    name: "Whitby Table",
    category: "Dining Table",
    image: "/images/luxury-series/wd005b-whitby-table.png",
    description: "A warm wood dining table with a tailored pedestal base and a radial surface detail.",
  },
  {
    code: "WD006",
    name: "Windsor Table",
    category: "Dining Table",
    image: "/images/luxury-series/wd006-windsor-table.png",
    description: "A round dining table with a layered stone centre and a graphic fluted base.",
  },
  {
    code: "WD007",
    name: "Darlington Table",
    category: "Dining Table",
    image: "/images/luxury-series/wd007-darlington-table.png",
    description: "A round dining table with a warm wood surround, marble centre and a crisp architectural base.",
  },
  {
    code: "WD008",
    name: "Cameron Table",
    category: "Dining Table",
    image: "/images/luxury-series/wd008-cameron-table.png",
    description: "An oval dining table with a light stone top and a sculptural warm-toned base.",
  },
  {
    code: "WD008B",
    name: "Camden Table",
    category: "Dining Table",
    image: "/images/luxury-series/wd008b-camden-table.png",
    description: "A round dining table with a marble top and dark sculptural supports, tailored for refined interiors.",
  },
  {
    code: "WD009D1A",
    name: "Madeley Table · Dark Edition",
    category: "Dining Table",
    image: "/images/luxury-series/wd009d1a-madeley-table-dark.png",
    description: "A darker Madeley variation with a layered top and curved architectural base.",
  },
  {
    code: "WD005",
    name: "Ambleside Bed",
    category: "Bed",
    image: "/images/luxury-series/wd005-ambleside-bed.png",
    description: "An upholstered bed with a softly rounded headboard and a composed, quietly luxurious bedroom setting.",
  },
];

export default function LuxurySeriesPage() {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Meimi&H Luxury Series",
    url: `${siteConfig.url}/products/luxury-series`,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: product.name,
      url: `${siteConfig.url}/products/luxury-series#${product.code.toLowerCase()}`,
      image: `${siteConfig.url}${product.image}`,
    })),
  };

  return (
    <main className="bg-[#FAF9F6] text-stone-800">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      <section className="px-6 pb-16 pt-28 sm:px-8 lg:px-10 lg:pb-24 lg:pt-36">
        <div className="mx-auto max-w-6xl">
          <Link href="/products" className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-stone-400 transition-colors hover:text-stone-900">← Product catalogue</Link>
          <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-end lg:gap-20">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.4em] text-[#6B2737]">Luxury Series</p>
              <h1 className="mt-5 max-w-4xl text-4xl font-extralight leading-[1.08] tracking-tight text-stone-950 sm:text-6xl">Statement pieces with a quieter kind of presence.</h1>
            </div>
            <p className="max-w-sm text-base font-light leading-8 text-stone-600">A first selection from the Meimi&H Luxury Series, verified against the supplied catalogue. Dimensions, materials and finish options are confirmed at enquiry.</p>
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 sm:px-8 lg:px-10 lg:pb-32">
        <div className="mx-auto max-w-6xl grid gap-x-6 gap-y-16 sm:grid-cols-2">
          {products.map((product, index) => (
            <article id={product.code.toLowerCase()} key={product.code} className={index === 0 ? "sm:col-span-2 scroll-mt-24" : "scroll-mt-24"}>
              <div className={`relative overflow-hidden bg-stone-200 ${index === 0 ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
                <Image src={product.image} alt={`${product.name}, ${product.code}`} fill priority={index === 0} sizes={index === 0 ? "(max-width: 640px) 100vw, 100vw" : "(max-width: 640px) 100vw, 50vw"} className="object-cover" />
              </div>
              <div className="border-t border-stone-300 pt-5">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#6B2737]">{product.category}</p>
                    <h2 className="mt-3 text-2xl font-light tracking-tight text-stone-950">{product.name}</h2>
                  </div>
                  <span className="text-xs font-medium tracking-[0.12em] text-stone-400">{product.code}</span>
                </div>
                <p className="mt-4 max-w-xl text-sm font-light leading-7 text-stone-600">{product.description}</p>
                <a href={PHONE} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 border-b border-[#6B2737] pb-1 text-xs font-medium uppercase tracking-[0.14em] text-[#6B2737] transition-colors hover:border-stone-950 hover:text-stone-950">Request specification <span aria-hidden="true">→</span></a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-stone-200/70 bg-white/60 px-6 py-16 text-center sm:px-8 lg:px-10 lg:py-24">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-stone-400">Continue exploring</p>
        <h2 className="mt-4 text-3xl font-extralight tracking-tight text-stone-900">Looking for a complete room direction?</h2>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/products" className="inline-flex min-h-11 items-center gap-2 bg-[#6B2737] px-6 text-sm font-medium text-white transition-colors hover:bg-stone-900">View all products <span aria-hidden="true">→</span></Link>
          <Link href="/custom" className="inline-flex min-h-11 items-center gap-2 border border-stone-300 px-6 text-sm font-medium text-stone-700 transition-colors hover:border-stone-900 hover:text-stone-950">Explore custom furniture <span aria-hidden="true">→</span></Link>
        </div>
      </section>
    </main>
  );
}
