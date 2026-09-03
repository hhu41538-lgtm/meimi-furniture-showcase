"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, ChevronDown, Heart, Maximize2, MessageCircle, Share2, X } from "lucide-react";
import type { HydratedProduct } from "@/lib/products";
import { isCatalogueCategory } from "@/lib/catalogueStudio";
import { localizeCatalogueName, localizeCatalogueTagline } from "@/lib/catalogueLocale";
import { copyPageLink } from "@/lib/copyPageLink";
import { useSavedPieces } from "@/lib/useSavedPieces";
import { useRecentPieces } from "@/lib/useRecentPieces";

type ViewId = "front" | "side" | "detail" | "construction";

const productCollectionMeta = {
  sofa: { label: "客厅系列", related: "living", catalogueCategory: "living" },
  mattress: { label: "手工床垫系列", related: "sleep", catalogueCategory: "sleep" },
  dining: { label: "餐厅系列", related: "dining", catalogueCategory: "dining" },
  outdoor: { label: "户外系列", related: "outdoor", catalogueCategory: "outdoor" },
} as const;

const relatedLabels = { living: "客厅系列", sleep: "睡眠系列", dining: "餐厅系列", outdoor: "户外系列" } as const;

const mobileHotspotLabels = {
  sofa: ["面料细节", "缝线细节"],
  mattress: ["表层细节", "包边细节"],
  dining: ["台面细节", "边缘轮廓"],
  outdoor: ["面料细节", "框架细节"],
} as const;

export default function MobileProductDetail({ product, relatedProducts }: { product: HydratedProduct; relatedProducts: HydratedProduct[] }) {
  const searchParams = useSearchParams();
  const [view, setView] = useState<ViewId>("front");
  const [finish, setFinish] = useState("original");
  const [shared, setShared] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<number | null>(null);
  const [imageExpanded, setImageExpanded] = useState(false);
  const detailTriggerRef = useRef<HTMLButtonElement | null>(null);
  const detailCloseRef = useRef<HTMLButtonElement>(null);
  const detailWasOpen = useRef(false);
  const imageTriggerRef = useRef<HTMLButtonElement | null>(null);
  const imageCloseRef = useRef<HTMLButtonElement>(null);
  const imageWasExpanded = useRef(false);
  const { isSaved, toggleSaved } = useSavedPieces();
  const { recordRecent } = useRecentPieces();
  const requestedCategory = searchParams.get("category");
  const backHref = isCatalogueCategory(requestedCategory ?? undefined) ? `/app?category=${requestedCategory}` : "/app";

  useEffect(() => {
    if (!imageExpanded) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => imageCloseRef.current?.focus());
    const handleImageViewerKeys = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setImageExpanded(false);
      } else if (event.key === "Tab") {
        event.preventDefault();
        imageCloseRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleImageViewerKeys);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleImageViewerKeys);
    };
  }, [imageExpanded]);

  useEffect(() => {
    setView("front");
    setFinish("original");
    setSelectedDetail(null);
  }, [product.slug]);

  useEffect(() => {
    if (selectedDetail === null) {
      if (detailWasOpen.current) {
        detailTriggerRef.current?.focus();
        detailWasOpen.current = false;
      }
      return;
    }
    detailWasOpen.current = true;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => detailCloseRef.current?.focus());
    const handleDetailKeys = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedDetail(null);
      } else if (event.key === "Tab") {
        event.preventDefault();
        detailCloseRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleDetailKeys);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleDetailKeys);
    };
  }, [selectedDetail]);

  useEffect(() => {
    recordRecent(product.slug);
  }, [product.slug, recordRecent]);

  useEffect(() => {
    if (imageExpanded) {
      imageWasExpanded.current = true;
      return;
    }
    if (imageWasExpanded.current) {
      imageTriggerRef.current?.focus();
      imageWasExpanded.current = false;
    }
  }, [imageExpanded]);

  const views = useMemo(() => {
    const details = product.detailImages;
    return {
      front: product.catalogueViews?.front ?? product.mainImage,
      side: product.catalogueViews?.side ?? details[0] ?? product.mainImage,
      detail: product.catalogueViews?.detail ?? details[1] ?? details[0] ?? product.mainImage,
      construction: product.constructionImage ?? details[2] ?? product.mainImage,
    };
  }, [product]);
  const viewOptions = (["front", ...(product.catalogueViews?.side || product.detailImages[0] ? ["side"] : []), ...(product.catalogueViews?.detail || product.detailImages[1] ? ["detail"] : []), ...(product.constructionImage ? ["construction"] : [])] as ViewId[]);
  const viewLabels: Record<ViewId, string> = { front: "正面", side: "侧面", detail: "细节", construction: "结构" };
  const changeViewWithKeyboard = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const nextIndex = event.key === "Home"
      ? 0
      : event.key === "End"
        ? viewOptions.length - 1
        : event.key === "ArrowRight" || event.key === "ArrowDown"
          ? (index + 1) % viewOptions.length
          : event.key === "ArrowLeft" || event.key === "ArrowUp"
            ? (index - 1 + viewOptions.length) % viewOptions.length
            : null;
    if (nextIndex === null) return;
    event.preventDefault();
    const nextView = viewOptions[nextIndex];
    setView(nextView);
    window.requestAnimationFrame(() => document.getElementById(`${product.slug}-view-${nextView}`)?.focus());
  };

  const availableFinishes = [
    { id: "original", label: product.category === "mattress" ? "Original configuration" : "Signature upholstery", color: "#e8dfcf" },
    ...(product.catalogueFinishPreviews ?? []),
  ];
  const changeFinishWithKeyboard = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const nextIndex = event.key === "Home"
      ? 0
      : event.key === "End"
        ? availableFinishes.length - 1
        : event.key === "ArrowRight" || event.key === "ArrowDown"
          ? (index + 1) % availableFinishes.length
          : event.key === "ArrowLeft" || event.key === "ArrowUp"
            ? (index - 1 + availableFinishes.length) % availableFinishes.length
            : null;
    if (nextIndex === null) return;
    event.preventDefault();
    const nextFinish = availableFinishes[nextIndex];
    setFinish(nextFinish.id);
    window.requestAnimationFrame(() => document.getElementById(`${product.slug}-finish-${nextFinish.id}`)?.focus());
  };
  const selectedFinish = availableFinishes.find((option) => option.id === finish) ?? availableFinishes[0];
  const preview = view === "front" && finish !== "original" ? product.catalogueFinishPreviews?.find((option) => option.id === finish)?.image : undefined;
  const image = view === "construction" ? views.construction : preview ?? views[view];
  // The first gallery image is generally the alternate angle used by the
  // Side tab. Prioritize the tighter follow-up images for material hotspots.
  const hotspotImages = product.detailImages.length > 1 ? product.detailImages.slice(1) : product.detailImages;
  const activeDetailImage = selectedDetail === null ? undefined : hotspotImages[selectedDetail % hotspotImages.length];
  const openDetail = (index: number, trigger: HTMLButtonElement) => {
    detailTriggerRef.current = trigger;
    setSelectedDetail(index);
  };
  const openImageViewer = (trigger: HTMLButtonElement) => {
    imageTriggerRef.current = trigger;
    setImageExpanded(true);
  };
  const saved = isSaved(product.slug);
  const collection = productCollectionMeta[product.category];
  const displayName = localizeCatalogueName(product.slug, product.name);
  const displayTagline = localizeCatalogueTagline(product.slug, product.tagline);
  const phoneHref = "tel:15355787546";
  const shareProduct = async () => {
    const shareData = { title: `美觅家居 | ${displayName}`, text: displayTagline, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else if (!(await copyPageLink(window.location.href))) return;
      setShared(true);
      window.setTimeout(() => setShared(false), 1800);
    } catch { }
  };

  return (
    <div className="catalogue-app-shell min-h-screen bg-[#e9e7e1] text-[#1d1c1a]">
      <main className="catalogue-app-frame mx-auto min-h-screen max-w-[430px] bg-[#fbfaf7] pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0_0_0_1px_rgba(28,28,28,0.06)] sm:shadow-[0_18px_60px_rgba(35,30,24,0.16)]">
        <section id={`${product.slug}-view-panel`} role="tabpanel" aria-labelledby={`${product.slug}-view-${view}`} className="relative aspect-[0.92] bg-stone-100">
          <Image src={image} alt={`${displayName} ${viewLabels[view]}`} fill priority className={view === "construction" ? "object-contain bg-stone-100" : "object-cover"} />
          <button type="button" onClick={(event) => openImageViewer(event.currentTarget)} aria-label="查看大图" title="查看大图" className="absolute inset-0 z-[1] cursor-zoom-in" />
          {view === "front" && hotspotImages.length > 0 && mobileHotspotLabels[product.category].map((label, index) => <button key={label} type="button" aria-label={`查看${label}`} title={label} onClick={(event) => openDetail(index, event.currentTarget)} className="absolute z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white bg-stone-900/80 text-base text-white shadow-md" style={index === 0 ? { left: "31%", top: "57%" } : { left: "66%", top: "45%" }}>+</button>)}
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4 pt-[max(1rem,env(safe-area-inset-top))]">
            <Link href={backHref} aria-label="返回产品图册" title="返回产品图册" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-stone-900 shadow-sm backdrop-blur"><ArrowLeft size={19} /></Link>
            <div className="flex gap-2"><button type="button" aria-label={shared ? "链接已复制" : "分享产品"} title={shared ? "链接已复制" : "分享产品"} onClick={() => void shareProduct()} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-stone-900 shadow-sm backdrop-blur">{shared ? <Check size={17} /> : <Share2 size={17} />}</button><button type="button" aria-label={saved ? "取消收藏" : "加入收藏"} title={saved ? "取消收藏" : "加入收藏"} aria-pressed={saved} onClick={() => toggleSaved(product.slug)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-stone-900 shadow-sm backdrop-blur"><Heart size={18} fill={saved ? "#6B2737" : "none"} className={saved ? "text-[#6B2737]" : ""} /></button></div>
          </div>
          {view === "construction" && product.constructionImage && <span className="absolute bottom-4 left-4 z-10 bg-stone-900/80 px-3 py-2 text-[10px] font-medium uppercase tracking-[0.16em] text-white">结构示意</span>}
          <button type="button" onClick={(event) => openImageViewer(event.currentTarget)} aria-label="查看大图" title="查看大图" className="absolute bottom-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-stone-900 shadow-sm backdrop-blur"><Maximize2 size={17} strokeWidth={1.7} /></button>
        </section>

        {imageExpanded && <div role="dialog" aria-modal="true" aria-label={`${displayName} 图片查看器`} className="fixed inset-0 z-[60] bg-stone-950"><Image src={image} alt={`${displayName} ${viewLabels[view]} 放大视图`} fill priority className="object-contain" /><button ref={imageCloseRef} type="button" onClick={() => setImageExpanded(false)} aria-label="关闭图片查看器" title="关闭图片查看器" className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-stone-900"><X size={20} /></button><p className="absolute inset-x-5 bottom-[max(1.5rem,env(safe-area-inset-bottom))] text-center text-xs font-medium uppercase tracking-[0.16em] text-white">{displayName} · {viewLabels[view]}</p></div>}
        {selectedDetail !== null && activeDetailImage && <div role="dialog" aria-modal="true" aria-label={`${displayName} ${mobileHotspotLabels[product.category][selectedDetail % mobileHotspotLabels[product.category].length]}`} className="fixed inset-0 z-[60] bg-stone-950"><Image src={activeDetailImage} alt={`${displayName} 特写细节`} fill priority className="object-contain" /><button ref={detailCloseRef} type="button" onClick={() => setSelectedDetail(null)} aria-label="关闭细节查看器" title="关闭细节查看器" className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-stone-900"><X size={20} /></button><p className="absolute inset-x-5 bottom-[max(1.5rem,env(safe-area-inset-bottom))] text-center text-xs font-medium uppercase tracking-[0.16em] text-white">{mobileHotspotLabels[product.category][selectedDetail % mobileHotspotLabels[product.category].length]}</p></div>}

        <div className="px-5 pb-5 pt-5">
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-stone-400">{product.productCode} · {collection.label}</p>
          <div className="mt-2 flex items-start justify-between gap-4"><div><h1 className="text-3xl font-light leading-tight">{displayName}</h1><p className="mt-2 text-sm font-light italic text-[#6B2737]">{displayTagline}</p></div><span className="mt-1 rounded-full border border-stone-200 px-3 py-1.5 text-[10px] font-medium tracking-[0.12em] text-stone-500">可按需定制</span></div>

          <div className="catalogue-horizontal-scroll mt-6 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="产品视图">
            {viewOptions.map((id, index) => <button key={id} id={`${product.slug}-view-${id}`} type="button" role="tab" aria-controls={`${product.slug}-view-panel`} aria-selected={view === id} tabIndex={view === id ? 0 : -1} onClick={() => setView(id)} onKeyDown={(event) => changeViewWithKeyboard(event, index)} className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium ${view === id ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 bg-white text-stone-500"}`}>{viewLabels[id]}</button>)}
          </div>

          <section className="mt-7 border-t border-stone-200 pt-5">
            <div className="flex items-center justify-between gap-4"><p className="text-sm font-medium">{availableFinishes.length > 1 ? "材质效果预览" : "材质方向"}</p>{availableFinishes.length > 1 && <p aria-live="polite" className="text-right text-xs text-stone-400">{selectedFinish.label}</p>}</div>
            {availableFinishes.length > 1 ? <><div role="radiogroup" aria-label={`${displayName} 材质预览`} className="catalogue-horizontal-scroll mt-3 flex gap-3 overflow-x-auto pb-1">{availableFinishes.map((item, index) => <button key={item.id} id={`${product.slug}-finish-${item.id}`} type="button" role="radio" aria-label={item.label} aria-checked={finish === item.id} tabIndex={finish === item.id ? 0 : -1} onClick={() => setFinish(item.id)} onKeyDown={(event) => changeFinishWithKeyboard(event, index)} className={`h-10 w-10 shrink-0 rounded-full border-2 transition ${finish === item.id ? "border-stone-900 ring-2 ring-stone-300" : "border-white ring-1 ring-stone-300"}`} style={{ backgroundColor: item.color }} />)}</div><p className="mt-3 text-xs font-light leading-relaxed text-stone-400">预生成的材质组合仅用于效果参考。选择“正面”可查看对应预览，最终面料与颜色将在规格确认时确定。</p></> : <p className="mt-3 text-xs font-light leading-relaxed text-stone-400">材质、颜色与尺寸将在规格确认时确定。只有完成验证的材质方案才会提供效果预览。</p>}
          </section>

          <section className="mt-7 border-t border-stone-200"><button type="button" aria-expanded={detailsOpen} aria-controls={`${product.slug}-details`} onClick={() => setDetailsOpen((value) => !value)} className="flex w-full items-center justify-between py-5 text-left"><span className="text-sm font-medium">产品详情</span><ChevronDown size={18} className={`transition ${detailsOpen ? "rotate-180" : ""}`} /></button>{detailsOpen && <div id={`${product.slug}-details`} className="border-t border-stone-100 pb-5 pt-4"><p className="text-xs font-medium uppercase tracking-[0.16em] text-[#6B2737]">Product ID {product.productCode}</p><p className="mt-3 text-sm font-light leading-relaxed text-stone-600">{product.description}</p><ul className="mt-4 space-y-2">{product.details.map((item) => <li key={item} className="text-xs font-light leading-relaxed text-stone-500">{item}</li>)}</ul></div>}</section>

          {relatedProducts.length > 0 && <section className="mt-7 border-t border-stone-200 pt-5"><p className="text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400">更多{relatedLabels[collection.related]}</p><div className="mt-3 grid grid-cols-2 gap-3">{relatedProducts.map((related) => { const relatedName = localizeCatalogueName(related.slug, related.name); return <Link key={related.slug} href={`/app/products/${related.slug}?category=${productCollectionMeta[related.category].catalogueCategory}`} className="group"><div className="relative aspect-[1.1] overflow-hidden rounded-[6px] bg-stone-100"><Image src={related.mainImage} alt={relatedName} fill className="object-cover transition duration-500 group-hover:scale-105" /></div><p className="mt-2 line-clamp-2 text-sm font-medium leading-snug">{relatedName}</p></Link>; })}</div></section>}
        </div>

        <div className="sticky bottom-0 border-t border-stone-200 bg-[#fbfaf7]/95 px-5 py-3 backdrop-blur"><a href={phoneHref} className="flex w-full items-center justify-center gap-2 bg-[#6B2737] py-3.5 text-xs font-medium uppercase tracking-[0.14em] text-white"><MessageCircle size={17} /> 联系美觅家居 15355787546</a></div>
      </main>
    </div>
  );
}
