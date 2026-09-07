"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Check, Heart, MessageCircle, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import FadeIn from "@/components/ui/FadeIn";

type CatalogueCard = {
  id: string;
  name: string;
  imageSrc: string;
  href: string;
  detail: string;
  code?: string;
};

type Collection = {
  id: string;
  title: string;
  description: string;
  products: CatalogueCard[];
};

const PHONE = "https://wa.me/8617796045579";
const SHORTLIST_KEY = "meimi-public-product-shortlist";

export default function ProductsClient({ collections }: { collections: Collection[] }) {
  const [query, setQuery] = useState("");
  const [shortlist, setShortlist] = useState<string[]>([]);
  const [shortlistReady, setShortlistReady] = useState(false);
  const normalizedQuery = query.trim().toLowerCase();
  const visibleCollections = useMemo(() => collections.map((collection) => ({
    ...collection,
    products: collection.products.filter((product) => !normalizedQuery || `${product.name} ${product.code ?? ""} ${product.detail} ${collection.title}`.toLowerCase().includes(normalizedQuery)),
  })).filter((collection) => collection.products.length > 0), [collections, normalizedQuery]);
  const visibleCount = visibleCollections.reduce((count, collection) => count + collection.products.length, 0);
  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(SHORTLIST_KEY) ?? "[]");
      if (Array.isArray(saved)) setShortlist(saved.filter((id): id is string => typeof id === "string"));
    } catch {
      // A blocked or malformed local store should never block product browsing.
    } finally {
      setShortlistReady(true);
    }
  }, []);

  useEffect(() => {
    if (!shortlistReady) return;
    try {
      window.localStorage.setItem(SHORTLIST_KEY, JSON.stringify(shortlist));
    } catch {
      // Product browsing and enquiry must still work when storage is unavailable.
    }
  }, [shortlist, shortlistReady]);

  const toggleShortlist = (id: string) => {
    setShortlist((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  return (
    <main className="bg-[#f8f7f3] text-stone-900">
      <section className="border-b border-stone-200 px-6 pb-14 pt-24 sm:px-8 lg:px-10 lg:pb-20 lg:pt-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end lg:gap-20">
              <div>
                <h1 className="max-w-4xl text-5xl font-light leading-[0.98] tracking-[-0.035em] text-stone-950 sm:text-6xl lg:text-7xl">
                  Find the piece that holds the room together.
                </h1>
                <p className="mt-7 max-w-2xl text-base font-light leading-8 text-stone-600 sm:text-lg">
                  Every product below is paired with its verified name and image. Choose a collection, open the product, then speak with our team about dimensions, materials and project quantity.
                </p>
              </div>
              <div className="border-t border-stone-300 pt-5 lg:pb-1">
                <p className="text-sm leading-6 text-stone-600">Looking for a tailored size, finish or full-room proposal?</p>
                <a href={PHONE} target="_blank" rel="noreferrer" className="mt-5 inline-flex min-h-11 items-center gap-3 bg-[#6B2737] px-5 text-sm font-medium text-white transition-colors hover:bg-stone-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6B2737]">
                  <MessageCircle size={16} aria-hidden="true" />
                  Talk to Meimi&H
                </a>
              </div>
          </div>

          {visibleCollections.length ? (
            <nav aria-label="Browse product categories" className="sticky top-[72px] z-30 mt-12 -mx-6 flex gap-2 overflow-x-auto border-y border-stone-200 bg-[#f8f7f3] px-6 py-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10">
              {visibleCollections.map((collection) => (
                <a key={collection.id} href={`#${collection.id}`} className="shrink-0 rounded-full border border-stone-300 px-4 py-2 text-sm text-stone-700 transition-colors hover:border-stone-900 hover:bg-stone-900 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B2737]">
                  {collection.title}
                </a>
              ))}
            </nav>
          ) : null}
          <div className="mt-5 flex min-h-12 items-center gap-3 border-b border-stone-300 pb-5">
            <Search size={18} className="shrink-0 text-stone-500" aria-hidden="true" />
            <label htmlFor="product-search" className="sr-only">Search products</label>
            <input id="product-search" type="search" inputMode="search" enterKeyHint="search" autoComplete="off" aria-describedby="product-search-result-count" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by product name, code or material" className="min-w-0 flex-1 bg-transparent text-sm text-stone-900 outline-none placeholder:text-stone-400" />
            {query ? <button type="button" onClick={() => setQuery("")} className="flex h-10 w-10 shrink-0 items-center justify-center text-stone-500 transition-colors hover:text-stone-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B2737]" aria-label="Clear product search"><X size={17} /></button> : null}
            <span id="product-search-result-count" aria-live="polite" className="hidden shrink-0 text-xs text-stone-500 sm:inline">{query ? `${visibleCount} matching pieces` : `${visibleCount} verified pieces`}</span>
          </div>
          <Link href="/products/luxury-series" className="group mt-5 flex flex-wrap items-center justify-between gap-4 border-b border-stone-300 pb-5 text-sm text-stone-700 transition-colors hover:text-[#6B2737]">
            <span><span className="font-medium text-stone-900">New: Luxury Series</span><span className="ml-2 font-light text-stone-500">Verified dining and bedroom pieces from the latest catalogue.</span></span>
            <span className="shrink-0 text-xs font-medium uppercase tracking-[0.14em]">Explore series <ArrowUpRight size={14} className="ml-1 inline transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
          </Link>
          {shortlist.length > 0 ? <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#6B2737]/30 pb-4 text-sm">
            <span className="inline-flex items-center gap-2 text-stone-700"><Heart size={16} className="text-[#6B2737]" fill="currentColor" aria-hidden="true" /> {shortlist.length} piece{shortlist.length === 1 ? "" : "s"} saved for this project</span>
            <a href={PHONE} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-[#6B2737] transition-colors hover:text-stone-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B2737]">Discuss shortlist <ArrowUpRight size={14} aria-hidden="true" /></a>
          </div> : null}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10 lg:py-24">
        {visibleCollections.length ? <div className="space-y-24 lg:space-y-32">
          {visibleCollections.map((collection) => (
            <section id={collection.id} key={collection.id} className="scroll-mt-24">
              <FadeIn>
                <div className="grid gap-5 border-t border-stone-300 pt-6 md:grid-cols-[minmax(0,1fr)_minmax(15rem,0.55fr)] md:items-end md:gap-16">
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                    <h2 className="text-3xl font-light tracking-[-0.025em] text-stone-950 sm:text-4xl">{collection.title}</h2>
                    <span className="text-xs font-medium uppercase tracking-[0.12em] text-stone-400">{collection.products.length} verified pieces</span>
                  </div>
                  <p className="max-w-md text-sm font-light leading-6 text-stone-600">{collection.description}</p>
                </div>
              </FadeIn>

              <div className="mt-8 grid gap-x-5 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
                {collection.products.map((product, index) => (
                  <FadeIn key={product.id} delay={(index % 3) * 90}>
                    <article className="group h-full">
                      <Link href={product.href} className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6B2737]">
                        <div className="relative aspect-[4/5] overflow-hidden bg-stone-200">
                          <Image src={product.imageSrc} alt={product.name} fill priority={collection.id === "sofas" && index === 0} sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover transition duration-700 ease-out group-hover:scale-[1.035]" />
                          <span className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                          <span className="absolute bottom-4 right-4 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-white text-stone-900 opacity-0 shadow-sm transition duration-300 group-hover:translate-y-0 group-hover:opacity-100" aria-hidden="true">
                            <ArrowUpRight size={18} />
                          </span>
                        </div>
                      </Link>
                      <div className="pt-4">
                        <div className="flex items-start justify-between gap-4">
                          <Link href={product.href} className="min-w-0 text-xl font-light tracking-[-0.02em] text-stone-950 hover:text-[#6B2737] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B2737]">{product.name}</Link>
                          <div className="flex shrink-0 items-center gap-3">
                            {product.code ? <span className="pt-1 text-[11px] font-medium tracking-[0.08em] text-stone-400">{product.code}</span> : null}
                            <button type="button" onClick={() => toggleShortlist(product.id)} aria-pressed={shortlist.includes(product.id)} aria-label={shortlist.includes(product.id) ? `Remove ${product.name} from shortlist` : `Save ${product.name} to shortlist`} title={shortlist.includes(product.id) ? "Remove from shortlist" : "Save to shortlist"} className={`flex h-10 w-10 items-center justify-center border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B2737] ${shortlist.includes(product.id) ? "border-[#6B2737] bg-[#6B2737] text-white" : "border-stone-300 text-stone-500 hover:border-[#6B2737] hover:text-[#6B2737]"}`}>
                              {shortlist.includes(product.id) ? <Check size={16} aria-hidden="true" /> : <Heart size={16} aria-hidden="true" />}
                            </button>
                          </div>
                        </div>
                          <p className="mt-2 text-sm font-light leading-6 text-stone-600">{product.detail}</p>
                          <Link href={product.href} className="mt-4 inline-flex items-center gap-2 border-b border-[#6B2737] pb-1 text-xs font-medium uppercase tracking-[0.12em] text-[#6B2737] transition-colors group-hover:border-stone-950 group-hover:text-stone-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B2737]">
                            {product.href === "/contact" ? "Request specification" : "View product"}
                            <ArrowUpRight size={14} aria-hidden="true" />
                          </Link>
                        </div>
                    </article>
                  </FadeIn>
                ))}
              </div>
            </section>
          ))}
        </div> : <section className="border-y border-stone-300 py-20 text-center">
          <h2 className="text-3xl font-light tracking-[-0.025em] text-stone-950">No matching product yet</h2>
          <p className="mx-auto mt-4 max-w-md text-sm font-light leading-7 text-stone-600">Try a product name or code, or speak with our team about a made-to-order alternative.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => setQuery("")} className="inline-flex min-h-11 items-center gap-2 border border-stone-300 px-5 text-sm font-medium text-stone-800 transition-colors hover:border-stone-950 hover:bg-stone-950 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6B2737]">Clear search</button>
            <a href={PHONE} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 bg-[#6B2737] px-5 text-sm font-medium text-white transition-colors hover:bg-stone-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6B2737]">Talk to Meimi&H <ArrowUpRight size={15} /></a>
          </div>
        </section>}

        <section className="mt-24 bg-stone-950 px-7 py-10 text-white sm:px-10 lg:mt-32 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-16 lg:px-14 lg:py-14">
          <div>
            <h2 className="max-w-2xl text-3xl font-light tracking-[-0.025em] sm:text-4xl">Have a reference, floor plan or a product in mind?</h2>
            <p className="mt-5 max-w-xl text-sm font-light leading-7 text-stone-300">Our Foshan team can confirm the right model, dimensions, finish options and project quantities before you specify.</p>
          </div>
          <div className="mt-7 flex flex-wrap gap-3 lg:mt-0">
            <a href={PHONE} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center gap-3 border border-white px-5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-stone-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              WhatsApp +86 177 9604 5579
              <ArrowDown size={16} className="-rotate-90" aria-hidden="true" />
            </a>
            <Link href="/contact" className="inline-flex min-h-12 items-center justify-center gap-3 border border-stone-700 px-5 text-sm font-medium text-stone-200 transition-colors hover:border-white hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              View contact options
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
