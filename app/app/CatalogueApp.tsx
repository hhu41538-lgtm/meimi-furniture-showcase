"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Grid2X2,
  Heart,
  Home,
  LayoutGrid,
  MessageCircle,
  Phone,
  Search,
  Share2,
  SlidersHorizontal,
  Sparkles,
  Sofa,
  Trash2,
  X,
} from "lucide-react";
import { isCatalogueCategory, studioItems, type CatalogueCategory } from "@/lib/catalogueStudio";
import { localizeCatalogueName, localizeCatalogueTagline } from "@/lib/catalogueLocale";
import { copyPageLink } from "@/lib/copyPageLink";
import type { ProductCategory } from "@/lib/products";
import { useSavedPieces } from "@/lib/useSavedPieces";
import { useRecentPieces } from "@/lib/useRecentPieces";
import PwaInstallButton from "./PwaInstallButton";

type AppProduct = {
  slug: string;
  productCode: string;
  name: string;
  category: ProductCategory;
  tagline: string;
  image: string;
  searchTerms: string;
};

type CatalogueItem = {
  slug: string;
  href: string;
  productCode?: string;
  name: string;
  category: CatalogueCategory;
  eyebrow: string;
  tagline: string;
  image: string;
  searchTerms: string;
};

type TabId = "home" | "collections" | "custom" | "search" | "saved";
type CatalogueFilter = "all" | CatalogueCategory;
type CustomView = "overview" | "materials";

const tabs: { id: TabId; label: string; icon: typeof Home }[] = [
  { id: "home", label: "首页", icon: Home },
  { id: "collections", label: "图册", icon: LayoutGrid },
  { id: "custom", label: "定制", icon: Sparkles },
  { id: "search", label: "搜索", icon: Search },
  { id: "saved", label: "收藏", icon: Heart },
];

const collections: { id: CatalogueCategory; title: string; caption: string; image: string }[] = [
  { id: "living", title: "客厅", caption: "沙发与休闲椅", image: "/images/explore%20by%20space/Bessel%20sofa/bessel-side-v1.webp" },
  { id: "dining", title: "餐厅", caption: "餐桌与相聚时光", image: "/images/catalogue-app/travertine-table-showroom.jpg" },
  { id: "sleep", title: "睡眠", caption: "床具与床垫", image: "/images/catalogue-app/riviere-bed-showroom.jpg" },
  { id: "storage", title: "收纳", caption: "柜体与展示", image: "/images/catalogue-app/airplane-cabinet-showroom.jpg" },
  { id: "custom", title: "全屋定制", caption: "为你的空间而作", image: "/images/catalogue-app/beijing-residence-interior.jpg" },
  { id: "outdoor", title: "户外", caption: "自然场景生活", image: "/images/catalogue-app/outdoor-collection-hero.jpg" },
];

const fallbackImages: Record<string, string> = {
  living: "/images/explore%20by%20space/Bessel%20sofa/New%20Arrivals.jpg",
  dining: "/images/catalogue-app/travertine-table-showroom.jpg",
  sleep: "/images/catalogue-app/riviere-bed-showroom.jpg",
  storage: "/images/catalogue-app/airplane-cabinet-showroom.jpg",
  custom: "/images/catalogue-app/beijing-residence-interior.jpg",
  outdoor: "/images/catalogue-app/outdoor-collection-hero.jpg",
};

const productCategoryMeta: Record<ProductCategory, { catalogueCategory: CatalogueCategory; eyebrow: string }> = {
  sofa: { catalogueCategory: "living", eyebrow: "客厅系列" },
  mattress: { catalogueCategory: "sleep", eyebrow: "手工床垫系列" },
  dining: { catalogueCategory: "dining", eyebrow: "餐厅系列" },
  outdoor: { catalogueCategory: "outdoor", eyebrow: "户外系列" },
};

const materialDirections = [
  { label: "面料", caption: "圈圈纱 · 雪尼尔 · 天鹅绒", image: "/images/explore%20by%20space/Bessel%20sofa/03.jpg", query: "upholstery", colors: ["#e8dfcf", "#65704d", "#74222e"] },
  { label: "石材", caption: "洞石 · 大理石 · 陶瓷", image: "/images/catalogue-app/travertine-table-showroom.jpg", query: "stone", colors: ["#d8d0c0", "#8e8173", "#3e3a36"] },
  { label: "木饰面", caption: "胡桃木 · 橡木 · 烤漆", image: "/images/catalogue-app/palawan-bar-cabinet.jpg", query: "walnut", colors: ["#6b4937", "#9e7956", "#241e1a"] },
];

function catalogueSearchText(item: CatalogueItem) {
  const categoryTerms: Record<CatalogueCategory, string> = {
    living: "客厅 沙发 休闲椅",
    sleep: "睡眠 床 床垫 卧室",
    dining: "餐厅 餐桌 餐椅",
    storage: "收纳 柜体 储物 展示柜",
    outdoor: "户外 花园 露台",
    custom: "定制 空间 全屋 定制柜",
  };
  return `${item.productCode ?? ""} ${item.name} ${item.tagline} ${item.eyebrow} ${item.searchTerms} ${categoryTerms[item.category]}`.toLocaleLowerCase();
}

function matchesCatalogueSearch(item: CatalogueItem, query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return true;

  const searchable = catalogueSearchText(item);
  if (searchable.includes(normalizedQuery)) return true;

  // A catalogue query is commonly a combination such as "navy bed" or
  // "walnut dining". Match every meaningful term, regardless of order.
  const terms = normalizedQuery.split(/[\s,./&_-]+/).filter(Boolean);
  return terms.length > 1 && terms.every((term) => searchable.includes(term));
}

function catalogueSearchScore(item: CatalogueItem, query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const name = item.name.toLocaleLowerCase();
  const searchable = catalogueSearchText(item);

  if (name === normalizedQuery) return 0;
  if (name.startsWith(normalizedQuery)) return 1;
  if (name.includes(normalizedQuery)) return 2;
  if (searchable.includes(normalizedQuery)) return 3;
  return 4;
}

function isCatalogueFilter(value: string | undefined): value is CatalogueFilter {
  return value === "all" || isCatalogueCategory(value);
}

export default function CatalogueApp({ products }: { products: AppProduct[] }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const requestedCategory = searchParams.get("category") ?? undefined;
  const hasCategoryFilter = isCatalogueFilter(requestedCategory);
  const initialCategory = hasCategoryFilter ? requestedCategory : "all";
  const [tab, setTab] = useState<TabId>(() => hasCategoryFilter ? "collections" : "home");
  const [customView, setCustomView] = useState<CustomView>("overview");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CatalogueFilter>(initialCategory);
  const { saved, toggleSaved, clearSaved } = useSavedPieces();
  const { recent, clearRecent } = useRecentPieces();

  useEffect(() => {
    if (isCatalogueFilter(requestedCategory)) {
      setCategory(requestedCategory);
      setTab("collections");
      return;
    }
    setCategory("all");
  }, [requestedCategory]);

  const updateCatalogueUrl = (nextCategory: CatalogueFilter) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("category", nextCategory);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearCatalogueUrl = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  };

  const catalogueItems = useMemo<CatalogueItem[]>(
    () => [
      ...products.map((product): CatalogueItem => ({
        slug: product.slug,
        href: `/app/products/${product.slug}`,
        productCode: product.productCode,
        name: localizeCatalogueName(product.slug, product.name),
        category: productCategoryMeta[product.category].catalogueCategory,
        eyebrow: productCategoryMeta[product.category].eyebrow,
        tagline: localizeCatalogueTagline(product.slug, product.tagline),
        image: product.image,
        searchTerms: `${product.category} ${product.tagline} ${product.searchTerms}`,
      })),
      ...studioItems.map((item) => ({
        slug: item.slug,
        href: `/app/studio/${item.slug}`,
        name: localizeCatalogueName(item.slug, item.name),
        category: item.category,
        eyebrow: item.eyebrow,
        tagline: localizeCatalogueTagline(item.slug, item.tagline),
        image: item.image,
        searchTerms: `${item.category} ${item.details.join(" ")} ${item.description}`,
      })),
    ],
    [products]
  );

  const filtered = useMemo(() => {
    const results = catalogueItems.filter(
      (product) =>
        (category === "all" || product.category === category) &&
        matchesCatalogueSearch(product, query)
    );
    return query.trim() ? results.sort((first, second) => catalogueSearchScore(first, query) - catalogueSearchScore(second, query)) : results;
  }, [catalogueItems, category, query]);

  const showCollection = (id: CatalogueCategory) => {
    setCustomView("overview");
    setCategory(id);
    setQuery("");
    setTab("collections");
    updateCatalogueUrl(id);
  };

  const showAllCollections = () => {
    setCustomView("overview");
    setCategory("all");
    setQuery("");
    setTab("collections");
    updateCatalogueUrl("all");
  };

  const selectCategory = (id: CatalogueFilter) => {
    setCategory(id);
    updateCatalogueUrl(id);
  };

  const openSearch = () => {
    setCustomView("overview");
    setCategory("all");
    setTab("search");
    clearCatalogueUrl();
  };

  const openSearchFor = (term: string) => {
    setCustomView("overview");
    setCategory("all");
    setQuery(term);
    setTab("search");
    clearCatalogueUrl();
  };

  return (
    <div className="catalogue-app-shell min-h-screen bg-[#e9e7e1] text-[#1d1c1a]">
      <div className="catalogue-app-frame mx-auto min-h-screen max-w-[430px] bg-[#fbfaf7] pb-24 shadow-[0_0_0_1px_rgba(28,28,28,0.06)] sm:min-h-[100svh] sm:shadow-[0_18px_60px_rgba(35,30,24,0.16)]">
        <header className="sticky top-0 z-30 flex items-center justify-between bg-[#fbfaf7]/95 px-5 pb-3 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-stone-400">Meimi&H</p>
            <h1 className="mt-1 text-lg font-medium tracking-[0.02em]">
              {tabs.find((item) => item.id === tab)?.label}
            </h1>
          </div>
            <div className="flex gap-2"><a href="tel:15355787546" aria-label="拨打美觅家居电话 15355787546" title="拨打 15355787546" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#6B2737]/20 bg-[#6B2737] text-white shadow-sm"><Phone size={17} strokeWidth={1.7} /></a><PwaInstallButton /><Link href="/products" aria-label="打开完整产品图册" title="打开完整产品图册" className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-900 shadow-sm"><Grid2X2 size={18} strokeWidth={1.6} /></Link></div>
        </header>

        <main className="px-5 pb-8">
          {tab === "home" && (
            <HomeScreen products={catalogueItems} recent={recent} clearRecent={clearRecent} saved={saved} toggleSaved={toggleSaved} onCollection={showCollection} onViewAll={showAllCollections} onSearch={openSearch} />
          )}
          {tab === "collections" && (
            <CatalogueGrid products={filtered} category={category} setCategory={selectCategory} saved={saved} toggleSaved={toggleSaved} />
          )}
          {tab === "custom" && (customView === "materials" ? <MaterialPaletteScreen onBack={() => setCustomView("overview")} onSearch={openSearchFor} /> : <CustomScreen onBrowse={() => showCollection("custom")} onBrowseFurniture={showAllCollections} onBrowseMaterials={() => setCustomView("materials")} />)}
          {tab === "search" && (
            <SearchScreen query={query} setQuery={setQuery} products={filtered} saved={saved} toggleSaved={toggleSaved} />
          )}
          {tab === "saved" && (
            <SavedScreen products={catalogueItems.filter((product) => saved.includes(product.slug))} toggleSaved={toggleSaved} clearSaved={clearSaved} onBrowse={showAllCollections} />
          )}
        </main>

        <nav className="fixed bottom-0 left-1/2 z-40 flex w-full max-w-[430px] -translate-x-1/2 border-t border-stone-200 bg-[#fbfaf7]/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
          {tabs.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
            <button key={id} type="button" title={label} aria-label={id === "saved" && saved.length ? `${label}, ${saved.length} ${saved.length === 1 ? "piece" : "pieces"}` : label} aria-current={active ? "page" : undefined} onClick={() => { if (id !== "collections") { setCategory("all"); clearCatalogueUrl(); } if (id === "custom") setCustomView("overview"); setTab(id); window.scrollTo({ top: 0, behavior: "auto" }); }} className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition ${active ? "text-[#6B2737]" : "text-stone-400"}`}>
                <span className="relative"><Icon size={20} strokeWidth={active ? 2 : 1.6} />{id === "saved" && saved.length > 0 && <span aria-hidden="true" className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#6B2737] px-1 text-[9px] font-medium leading-none text-white">{saved.length > 9 ? "9+" : saved.length}</span>}</span>
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

function HomeScreen({ products, recent, clearRecent, saved, toggleSaved, onCollection, onViewAll, onSearch }: { products: CatalogueItem[]; recent: string[]; clearRecent: () => void; saved: string[]; toggleSaved: (slug: string) => void; onCollection: (id: CatalogueCategory) => void; onViewAll: () => void; onSearch: () => void }) {
  const featured = products.find((product) => product.slug === "bessel-sofa") ?? products[0];
  const newForms = ["baxter-drop-dining-table", "palawan-bar-cabinet", "outdoor-modular-lounge", "isabel-mattress"].map((slug) => products.find((product) => product.slug === slug)).filter((product): product is CatalogueItem => Boolean(product));
  const curatedNewForms = newForms.length ? newForms : products.slice(-4);
  const recentPieces = recent.map((slug) => products.find((product) => product.slug === slug)).filter((product): product is CatalogueItem => Boolean(product));
  return (
    <>
      <section className="relative -mx-5 overflow-hidden bg-stone-950 text-white">
        <div className="relative aspect-[1.12/1]">
          <Image src={featured.image} alt={featured.name} fill priority className="object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/10 to-transparent" />
          <div className="absolute inset-x-5 bottom-5">
            <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-white/60">交互图册</p>
            <h2 className="mt-2 max-w-[18rem] text-2xl font-light leading-tight">让家具属于你的空间。</h2>
            <Link href={catalogueHref(featured)} className="mt-5 inline-flex items-center gap-2 border-b border-white/60 pb-1 text-xs font-medium uppercase tracking-[0.14em]">查看精选 <ArrowUpRight size={15} /></Link>
          </div>
        </div>
      </section>

      <button type="button" onClick={onSearch} className="mt-5 flex h-12 w-full items-center gap-3 rounded-full bg-[#efede8] px-4 text-left text-sm text-stone-400">
        <Search size={19} strokeWidth={1.7} />
        搜索产品、材质或系列
      </button>

      <section className="mt-8">
        <div className="flex items-end justify-between"><div><p className="text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400">按空间浏览</p><h2 className="mt-2 text-2xl font-light">产品分类</h2></div><button type="button" onClick={onViewAll} className="text-xs font-medium text-[#6B2737]">查看全部</button></div>
        <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-5">
          {collections.map((item) => <button key={item.id} type="button" onClick={() => onCollection(item.id)} className="group text-left"><div className="relative aspect-[1.22] overflow-hidden rounded-[6px] bg-stone-200"><Image src={item.image} alt={item.title} fill className="object-cover transition duration-500 group-hover:scale-105" onError={(event) => { event.currentTarget.src = fallbackImages[item.id]; }} /></div><p className="mt-2 text-sm font-medium">{item.title}</p><p className="mt-0.5 text-[11px] text-stone-400">{item.caption}</p></button>)}
        </div>
      </section>

      {recentPieces.length > 0 && <section className="mt-9"><div className="flex items-end justify-between"><div><p className="text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400">浏览记录</p><h2 className="mt-2 text-2xl font-light">最近浏览</h2></div><button type="button" onClick={clearRecent} aria-label="清除最近浏览" title="清除最近浏览" className="flex h-10 w-10 items-center justify-center text-stone-400 transition hover:text-[#6B2737]"><Trash2 size={17} strokeWidth={1.6} /></button></div><div className="mt-4 space-y-3">{recentPieces.map((product) => <ProductRow key={product.slug} product={product} saved={saved.includes(product.slug)} toggleSaved={toggleSaved} />)}</div></section>}

      <section className="mt-9"><div className="flex items-end justify-between"><div><p className="text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400">为你精选</p><h2 className="mt-2 text-2xl font-light">新品形态</h2></div></div><div className="mt-4 space-y-3">{curatedNewForms.map((product) => <ProductRow key={product.slug} product={product} saved={saved.includes(product.slug)} toggleSaved={toggleSaved} />)}</div></section>
    </>
  );
}

function CatalogueGrid({ products, category, setCategory, saved, toggleSaved }: { products: CatalogueItem[]; category: CatalogueFilter; setCategory: (value: CatalogueFilter) => void; saved: string[]; toggleSaved: (slug: string) => void }) {
  const filters: { id: CatalogueFilter; label: string }[] = [{ id: "all", label: "全部" }, { id: "living", label: "客厅" }, { id: "sleep", label: "睡眠" }, { id: "dining", label: "餐厅" }, { id: "storage", label: "收纳" }, { id: "outdoor", label: "户外" }, { id: "custom", label: "定制" }];
  return <><p className="mt-3 text-sm font-light leading-relaxed text-stone-500">精选家具、材质与结构细节的移动图册。</p><div role="group" aria-label="产品分类" className="catalogue-horizontal-scroll mt-5 flex gap-2 overflow-x-auto pb-1">{filters.map((item) => <button key={item.id} type="button" aria-pressed={category === item.id} onClick={() => setCategory(item.id)} className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium ${category === item.id ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white text-stone-500"}`}>{item.label}</button>)}</div>{products.length ? <><p aria-live="polite" className="mt-5 text-xs text-stone-400">{products.length} 件产品</p><div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-6">{products.map((product) => <ProductTile key={product.slug} product={product} saved={saved.includes(product.slug)} toggleSaved={toggleSaved} />)}</div></> : <div className="mt-14 border-y border-stone-200 px-5 py-12 text-center"><LayoutGrid className="mx-auto text-stone-300" size={34} strokeWidth={1.3} /><p className="mt-4 text-sm text-stone-400">这个分类暂时没有可展示的产品。</p><button type="button" onClick={() => setCategory("all")} className="mt-5 text-xs font-medium text-[#6B2737]">查看全部产品</button></div>}</>;
}

function SearchScreen({ query, setQuery, products, saved, toggleSaved }: { query: string; setQuery: (value: string) => void; products: CatalogueItem[]; saved: string[]; toggleSaved: (slug: string) => void }) {
  const popularSearches = ["沙发", "床垫", "餐桌", "户外"];
  return <><label className="mt-3 flex h-12 items-center gap-3 rounded-full bg-[#efede8] px-4"><Search size={19} /><input autoFocus type="search" enterKeyHint="search" aria-label="搜索产品图册" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Escape") setQuery(""); }} placeholder="搜索产品、空间或材质" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-stone-400" />{query && <button type="button" onClick={() => setQuery("")} aria-label="清除搜索" title="清除搜索" className="-mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-stone-500"><X size={17} /></button>}</label><div className="mt-7">{query ? <><p aria-live="polite" className="text-sm text-stone-500">找到 {products.length} 件产品</p>{products.length ? <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-6">{products.map((product) => <ProductTile key={product.slug} product={product} saved={saved.includes(product.slug)} toggleSaved={toggleSaved} />)}</div> : <div className="pt-14 text-center"><Search className="mx-auto text-stone-300" size={34} strokeWidth={1.3} /><p className="mt-4 text-sm text-stone-400">试试搜索产品名称、空间或材质。</p><button type="button" onClick={() => setQuery("")} className="mt-5 text-xs font-medium text-[#6B2737]">清除搜索</button></div>}</> : <div className="pt-12 text-center"><Search className="mx-auto text-stone-300" size={34} strokeWidth={1.3} /><p className="mt-4 text-sm text-stone-400">按产品名称、空间或材质搜索。</p><div role="group" aria-label="热门搜索" className="mt-6 flex flex-wrap justify-center gap-2">{popularSearches.map((term) => <button key={term} type="button" onClick={() => setQuery(term)} className="rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-medium text-stone-600 transition hover:border-[#6B2737] hover:text-[#6B2737]">{term}</button>)}</div></div>}</div></>;
}

function CustomScreen({ onBrowse, onBrowseFurniture, onBrowseMaterials }: { onBrowse: () => void; onBrowseFurniture: () => void; onBrowseMaterials: () => void }) {
  const projectHref = "tel:15355787546";
  const customLinks = [
    { Icon: Sofa, label: "家具方案", image: "/images/catalogue-app/riviere-bed-showroom.jpg", onClick: onBrowseFurniture },
    { Icon: SlidersHorizontal, label: "材质配色", image: "/images/catalogue-app/travertine-table-showroom.jpg", onClick: onBrowseMaterials },
    { Icon: Grid2X2, label: "空间案例", image: "/images/catalogue-app/airplane-cabinet-showroom.jpg", onClick: onBrowse },
  ];
  return <><section className="relative mt-3 aspect-[0.94] overflow-hidden rounded-[6px] bg-stone-950 text-white"><Image src="/images/catalogue-app/custom-sofa-showroom.jpg" alt="美觅家居定制家具展厅" fill className="object-cover opacity-70" /><div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/10 to-transparent" /><div className="absolute inset-x-5 bottom-5"><p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/60">定制方案</p><h2 className="mt-3 text-3xl font-light leading-tight">从空间出发，塑造专属家具。</h2><p className="mt-3 max-w-[18rem] text-sm font-light leading-relaxed text-white/75">先确定材质方向，再让每件家具适配你的空间比例。</p></div></section><section className="mt-6"><p className="text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400">展厅案例</p><div className="mt-3 grid grid-cols-3 gap-2.5">{customLinks.map(({ Icon, label, image, onClick }) => <button key={label} type="button" onClick={onClick} className="group text-left"><div className="relative aspect-[0.78] overflow-hidden rounded-[6px] bg-stone-100"><Image src={image} alt={label} fill className="object-cover transition duration-500 group-hover:scale-105" /></div><span className="mt-2 flex items-center gap-1.5 text-[11px] font-medium"><Icon size={14} strokeWidth={1.5} />{label}</span></button>)}</div></section><section className="relative mt-6 overflow-hidden rounded-[6px] bg-stone-900 px-5 py-5 text-white"><Image src="/images/catalogue-app/showroom-atmosphere.jpg" alt="美觅家居展厅氛围" fill className="object-cover opacity-35" /><div className="relative"><p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/60">空间方向</p><p className="mt-2 max-w-[16rem] text-lg font-light leading-snug">以产品为起点，建立拥有独特比例与材质语言的空间。</p></div></section><button type="button" onClick={onBrowse} className="mt-6 w-full bg-[#6B2737] py-3.5 text-xs font-medium uppercase tracking-[0.14em] text-white">浏览可定制产品</button><a href={projectHref} className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-[#6B2737]">联系美觅家居 <ArrowUpRight size={15} /></a></>;
}

function MaterialPaletteScreen({ onBack, onSearch }: { onBack: () => void; onSearch: (term: string) => void }) {
  return <section className="mt-3"><div className="flex items-center gap-3"><button type="button" onClick={onBack} aria-label="返回定制" title="返回定制" className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-900"><ArrowLeft size={18} strokeWidth={1.6} /></button><div><p className="text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400">定制方向</p><h2 className="mt-1 text-2xl font-light">材质配色</h2></div></div><div className="mt-7 space-y-6">{materialDirections.map((direction) => <button key={direction.label} type="button" onClick={() => onSearch(direction.query)} className="group grid w-full grid-cols-[minmax(0,1fr)_7.5rem] overflow-hidden border-y border-stone-200 text-left"><div className="py-5 pr-5"><p className="text-lg font-light text-stone-900">{direction.label}</p><p className="mt-1 text-xs text-stone-400">{direction.caption}</p><div className="mt-5 flex gap-2">{direction.colors.map((color) => <span key={color} aria-hidden="true" className="h-5 w-5 rounded-full border border-white ring-1 ring-stone-200" style={{ backgroundColor: color }} />)}</div></div><div className="relative min-h-36 overflow-hidden bg-stone-100"><Image src={direction.image} alt={direction.label} fill className="object-cover transition duration-500 group-hover:scale-105" /></div></button>)}</div></section>;
}

function SavedScreen({ products, toggleSaved, clearSaved, onBrowse }: { products: CatalogueItem[]; toggleSaved: (slug: string) => void; clearSaved: () => void; onBrowse: () => void }) {
  const [shareState, setShareState] = useState<"idle" | "copied" | "shared">("idle");
  if (!products.length) return <div className="pt-20 text-center"><Heart className="mx-auto text-stone-300" size={34} strokeWidth={1.3} /><h2 className="mt-4 text-xl font-light">收藏喜欢的产品</h2><p className="mx-auto mt-2 max-w-[18rem] text-sm leading-relaxed text-stone-400">你的收藏会成为下一次项目沟通的起点。</p><button type="button" onClick={onBrowse} className="mt-6 border-b border-[#6B2737] pb-1 text-xs font-medium text-[#6B2737]">浏览产品图册</button></div>;

  const phoneHref = "tel:15355787546";
  const shareSelection = async () => {
    const text = `美觅家居产品清单：${products.map((product) => `${product.name} - ${window.location.origin}${catalogueHref(product)}`).join("；")}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "美觅家居产品清单", text });
        setShareState("shared");
        window.setTimeout(() => setShareState("idle"), 2200);
      } else if (await copyPageLink(text)) {
        setShareState("copied");
        window.setTimeout(() => setShareState("idle"), 2200);
      }
    } catch {
      // Sharing can be dismissed by the user without changing the shortlist.
    }
  };
  return <><div className="mt-3 flex items-end justify-between"><div><p className="text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400">项目清单</p><h2 className="mt-2 text-2xl font-light">我的收藏</h2></div><button type="button" onClick={clearSaved} aria-label="清空收藏" title="清空收藏" className="flex h-10 w-10 items-center justify-center text-stone-400 transition hover:text-[#6B2737]"><Trash2 size={17} strokeWidth={1.6} /></button></div><div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-6">{products.map((product) => <ProductTile key={product.slug} product={product} saved toggleSaved={toggleSaved} />)}</div><div className="mt-8 grid grid-cols-2 gap-2"><button type="button" onClick={shareSelection} className="flex min-h-12 items-center justify-center gap-2 border border-stone-300 px-3 text-[10px] font-medium uppercase tracking-[0.1em] text-stone-700"><Share2 size={16} /> {shareState === "copied" ? "已复制" : shareState === "shared" ? "已分享" : "分享清单"}</button><a href={phoneHref} className="flex min-h-12 items-center justify-center gap-2 bg-[#6B2737] px-3 text-[10px] font-medium uppercase tracking-[0.1em] text-white"><MessageCircle size={16} /> 联系我们</a></div></>;
}

function ProductTile({ product, saved, toggleSaved }: { product: CatalogueItem; saved: boolean; toggleSaved: (slug: string) => void }) {
  const savedAction = `${saved ? "取消收藏" : "加入收藏"} ${product.name}`;
  return <article><Link href={catalogueHref(product)} className="group block"><div className="relative aspect-[0.9] overflow-hidden rounded-[6px] bg-stone-100"><Image src={product.image} alt={product.name} fill className="object-cover transition duration-500 group-hover:scale-105" />{product.productCode && <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[9px] font-medium tracking-[0.08em] text-stone-700 shadow-sm">{product.productCode}</span>}</div><p className="mt-2.5 text-sm font-medium">{product.name}</p><p className="mt-1 line-clamp-1 text-[11px] text-stone-400">{product.eyebrow}</p></Link><button type="button" aria-label={savedAction} title={savedAction} aria-pressed={saved} onClick={() => toggleSaved(product.slug)} className={`mt-2 flex h-10 w-10 items-center justify-center rounded-full border ${saved ? "border-[#6B2737] bg-[#6B2737] text-white" : "border-stone-200 bg-white text-stone-500"}`}><Heart size={15} fill={saved ? "currentColor" : "none"} /></button></article>;
}

function ProductRow({ product, saved, toggleSaved }: { product: CatalogueItem; saved: boolean; toggleSaved: (slug: string) => void }) {
  const savedAction = `${saved ? "取消收藏" : "加入收藏"} ${product.name}`;
  return <article className="flex gap-3"><Link href={catalogueHref(product)} className="relative block h-24 w-28 shrink-0 overflow-hidden rounded-[6px] bg-stone-100"><Image src={product.image} alt={product.name} fill className="object-cover" /></Link><div className="min-w-0 flex-1 py-1"><p className="text-[10px] font-medium uppercase tracking-[0.16em] text-stone-400">{product.productCode ? `${product.productCode} · ${product.eyebrow}` : product.eyebrow}</p><Link href={catalogueHref(product)} className="mt-1 block text-base font-medium">{product.name}</Link><p className="mt-1 line-clamp-2 text-xs font-light leading-relaxed text-stone-500">{product.tagline}</p></div><button type="button" onClick={() => toggleSaved(product.slug)} aria-label={savedAction} title={savedAction} aria-pressed={saved} className="h-10 w-10 shrink-0 text-stone-500"><Heart size={18} fill={saved ? "currentColor" : "none"} className={saved ? "text-[#6B2737]" : ""} /></button></article>;
}

function catalogueHref(product: CatalogueItem) {
  return `${product.href}?category=${product.category}`;
}
