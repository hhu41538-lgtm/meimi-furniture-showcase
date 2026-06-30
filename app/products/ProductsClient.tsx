"use client";
import { useState } from "react";
type Product = { name: string; category: string; imageSrc: string; };
type CustomCategory = { title: string; description: string; imageSrc: string; };
const tabs = ["All", "Living Room", "Dining", "Bedroom"];
export default function ProductsClient(props: { products: Product[]; customCategories: CustomCategory[]; }) {
  const { products, customCategories } = props;
  const [activeTab, setActiveTab] = useState("All");
  const filtered = activeTab === "All" ? products : products.filter((p) => p.category === activeTab);
  return (
    <main className="bg-[#FAF9F6] px-6 py-16 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-16">
        <section>
          <div className="mb-10 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-stone-500">Ready-made collections</p>
            <h1 className="mt-3 text-4xl font-semibold text-stone-900 sm:text-5xl">Ready-Made Collections</h1>
          </div>
          <div className="mb-10 flex flex-wrap gap-3">
            {tabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={tab === activeTab ? "rounded-full border px-4 py-2 text-sm font-medium border-stone-900 bg-stone-900 text-white" : "rounded-full border px-4 py-2 text-sm font-medium border-stone-300 bg-white text-stone-700 hover:border-stone-900"}>{tab}</button>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((product) => (
              <article key={product.name} className="flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
                  <img src={product.imageSrc} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <span className="inline-block w-fit rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-stone-600">{product.category}</span>
                  <h3 className="mt-4 text-xl font-semibold text-stone-900">{product.name}</h3>
                  <a href="https://wa.me/8617796076275" target="_blank" rel="noreferrer" className="mt-5 inline-flex w-fit rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:border-stone-900">Inquire via WhatsApp</a>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section>
          <div className="mb-8 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-stone-500">Bespoke solutions</p>
            <h2 className="mt-3 text-3xl font-semibold text-stone-900 sm:text-4xl">Custom Interiors</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {customCategories.map((category) => (
              <article key={category.title} className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-stone-100">
                  <img src={category.imageSrc} alt={category.title} className="h-full w-full object-cover" loading="lazy" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-stone-900">{category.title}</h3>
                <p className="mt-3 text-base leading-7 text-stone-600">{category.description}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}