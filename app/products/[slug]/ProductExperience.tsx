"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Maximize2, X } from "lucide-react";
import type { HydratedProduct } from "@/lib/products";

type ViewId = "front" | "side" | "detail" | "construction";

const collectionLabels = { sofa: "Interactive catalogue", mattress: "Mattress collection", dining: "Dining collection", outdoor: "Outdoor collection" } as const;

const desktopHotspotLabels = {
  sofa: ["Upholstery", "Seam detail", "Seat cushion"],
  mattress: ["Cover detail", "Edge binding", "Quilted surface"],
  dining: ["Surface finish", "Edge profile", "Base detail"],
  outdoor: ["Upholstery", "Frame detail", "Woven detail"],
} as const;

export default function ProductExperience({
  product,
  phoneHref,
}: {
  product: HydratedProduct;
  phoneHref: string;
}) {
  const [view, setView] = useState<ViewId>("front");
  const [finish, setFinish] = useState("original");
  const [selectedDetail, setSelectedDetail] = useState<number | null>(null);
  const [imageExpanded, setImageExpanded] = useState(false);
  const detailTriggerRef = useRef<HTMLButtonElement | null>(null);
  const detailCloseRef = useRef<HTMLButtonElement>(null);
  const detailWasOpen = useRef(false);
  const imageTriggerRef = useRef<HTMLButtonElement | null>(null);
  const imageCloseRef = useRef<HTMLButtonElement>(null);
  const imageWasExpanded = useRef(false);

  useEffect(() => {
    setView("front");
    setFinish("original");
    setSelectedDetail(null);
    setImageExpanded(false);
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
    return () => window.removeEventListener("keydown", handleDetailKeys);
  }, [selectedDetail]);

  useEffect(() => {
    if (!imageExpanded) {
      if (imageWasExpanded.current) {
        imageTriggerRef.current?.focus();
        imageWasExpanded.current = false;
      }
      return;
    }
    imageWasExpanded.current = true;
    window.requestAnimationFrame(() => imageCloseRef.current?.focus());
    const handleImageKeys = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setImageExpanded(false);
      } else if (event.key === "Tab") {
        event.preventDefault();
        imageCloseRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleImageKeys);
    return () => window.removeEventListener("keydown", handleImageKeys);
  }, [imageExpanded]);

  const views = useMemo(() => {
    const images = product.detailImages;
    return {
      front: {
        label: "Front",
        image: product.catalogueViews?.front ?? product.mainImage,
        ready: true,
      },
      side: {
        label: "Side",
        image: product.catalogueViews?.side ?? images[0] ?? product.mainImage,
        ready: true,
      },
      detail: {
        label: "Detail",
        image: product.catalogueViews?.detail ?? images[1] ?? images[0] ?? product.mainImage,
        ready: true,
      },
      construction: {
        label: "Construction",
        image: product.constructionImage ?? images[2] ?? product.mainImage,
        ready: Boolean(product.constructionImage),
      },
    };
  }, [product]);

  const current = views[view];
  const viewOptions = (["front", ...(product.catalogueViews?.side || product.detailImages[0] ? ["side"] : []), ...(product.catalogueViews?.detail || product.detailImages[1] ? ["detail"] : []), ...(product.constructionImage ? ["construction"] : [])] as ViewId[]);
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
    window.requestAnimationFrame(() => document.getElementById(`${product.slug}-desktop-view-${nextView}`)?.focus());
  };
  const isMattress = product.category === "mattress";
  // The first gallery image normally supplies the alternate angle. Keep the
  // material points paired with the closer follow-up photography.
  const hotspotImages = product.detailImages.length > 1 ? product.detailImages.slice(1) : product.detailImages;
  const finishOptions = [
    { id: "original", label: isMattress ? "Original configuration" : "Signature upholstery", color: "#e8dfcf" },
    ...(product.catalogueFinishPreviews ?? []),
  ];
  const changeFinishWithKeyboard = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const nextIndex = event.key === "Home"
      ? 0
      : event.key === "End"
        ? finishOptions.length - 1
        : event.key === "ArrowRight" || event.key === "ArrowDown"
          ? (index + 1) % finishOptions.length
          : event.key === "ArrowLeft" || event.key === "ArrowUp"
            ? (index - 1 + finishOptions.length) % finishOptions.length
            : null;
    if (nextIndex === null) return;
    event.preventDefault();
    const nextFinish = finishOptions[nextIndex];
    setFinish(nextFinish.id);
    window.requestAnimationFrame(() => document.getElementById(`${product.slug}-desktop-finish-${nextFinish.id}`)?.focus());
  };
  const selectedFinish = finishOptions.find((option) => option.id === finish) ?? finishOptions[0];
  const finishPreview = view === "front" && finish !== "original" ? product.catalogueFinishPreviews?.find((option) => option.id === finish)?.image : undefined;
  const displayImage =
    view === "construction"
      ? current.image
      : finishPreview ?? current.image;
  const openDetail = (index: number, trigger: HTMLButtonElement) => {
    detailTriggerRef.current = trigger;
    setSelectedDetail(index);
  };

  return (
    <>
      <section className="px-6 pb-16 pt-8 sm:px-8 lg:px-10 lg:pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-9 grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-stone-400">
                {collectionLabels[product.category]}
              </p>
              <h1 className="mt-4 text-4xl font-extralight text-stone-900 sm:text-6xl">
                {product.name}
              </h1>
              <p className="mt-4 text-lg font-light italic text-[#6B2737]">{product.tagline}</p>
            </div>
            <p className="max-w-sm text-sm font-light leading-relaxed text-stone-500">
              {hotspotImages.length ? "Select a view, then open the material points on the image for a closer product read." : "Select a view to see the product from its available angles."}
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_290px]">
            <div>
              <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Product views">
                {viewOptions.map((id, index) => (
                  <button
                    key={id}
                    id={`${product.slug}-desktop-view-${id}`}
                    type="button"
                    role="tab"
                    aria-controls={`${product.slug}-desktop-view-panel`}
                    aria-selected={view === id}
                    tabIndex={view === id ? 0 : -1}
                    onClick={() => setView(id)}
                    onKeyDown={(event) => changeViewWithKeyboard(event, index)}
                    className={`border px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] transition-colors ${
                      view === id
                        ? "border-stone-900 bg-stone-900 text-white"
                        : "border-stone-200 bg-white text-stone-500 hover:border-stone-500 hover:text-stone-900"
                    }`}
                  >
                    {views[id].label}
                  </button>
                ))}
              </div>

              <div id={`${product.slug}-desktop-view-panel`} role="tabpanel" aria-labelledby={`${product.slug}-desktop-view-${view}`} className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                <Image src={displayImage} alt={`${product.name} ${current.label} view`} fill priority className={view === "construction" ? "object-contain bg-stone-100" : "object-cover"} />
                {view === "front" && hotspotImages.length > 0 && desktopHotspotLabels[product.category].map((label, index) => {
                  const positions = [
                    { left: "35%", top: "55%" },
                    { left: "58%", top: "40%" },
                    { left: "69%", top: "66%" },
                  ];
                  const position = positions[index];
                  return (
                  <button
                    key={label}
                    type="button"
                    aria-label={`Open ${label.toLowerCase()}`}
                    title={label}
                    onClick={(event) => openDetail(index % hotspotImages.length, event.currentTarget)}
                    className="absolute flex h-9 w-9 items-center justify-center rounded-full border border-white bg-stone-900/80 text-base text-white shadow-md transition hover:scale-110"
                    style={position}
                  >
                    +
                  </button>
                  );
                })}
                <button ref={imageTriggerRef} type="button" onClick={() => setImageExpanded(true)} aria-label="Expand product image" title="Expand product image" className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-stone-900 shadow-sm backdrop-blur transition hover:bg-white">
                  <Maximize2 size={17} strokeWidth={1.7} />
                </button>
              </div>
            </div>

            <aside className="border-t border-stone-200 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-400">Make it yours</p>
              {finishOptions.length > 1 ? <div className="mt-6">
                <div className="flex items-baseline justify-between gap-3"><p className="text-sm font-light text-stone-700">Finish preview</p><p aria-live="polite" className="text-xs text-stone-400">{selectedFinish.label}</p></div>
                <div role="radiogroup" aria-label={`${product.name} finish preview`} className="mt-3 flex flex-wrap gap-3">
                  {finishOptions.map((option, index) => (
                    <button
                      key={option.id}
                      id={`${product.slug}-desktop-finish-${option.id}`}
                      type="button"
                      role="radio"
                      title={option.label}
                      aria-label={option.label}
                      aria-checked={finish === option.id}
                      tabIndex={finish === option.id ? 0 : -1}
                      onClick={() => setFinish(option.id)}
                      onKeyDown={(event) => changeFinishWithKeyboard(event, index)}
                      className={`h-9 w-9 rounded-full border-2 transition ${finish === option.id ? "border-stone-900 ring-2 ring-stone-300" : "border-white ring-1 ring-stone-300"}`}
                      style={{ backgroundColor: option.color }}
                    />
                  ))}
                </div>
              </div> : <div className="mt-6"><p className="text-sm font-light text-stone-700">Finish direction</p><p className="mt-3 text-xs font-light leading-relaxed text-stone-500">Material, colour and dimensions are selected during specification. Verified visual previews are added only for approved product combinations.</p></div>}
              <p className="mt-7 text-xs font-light leading-relaxed text-stone-400">
                Preview selections are controlled catalogue combinations. Select Front to view a finish preview; final materials and dimensions are confirmed with the sales team.
              </p>
              <a href={phoneHref} className="mt-7 inline-flex w-full items-center justify-center bg-[#6B2737] px-4 py-3 text-xs font-medium uppercase tracking-[0.12em] text-white transition-colors hover:bg-stone-900">
                Call 15355787546
              </a>
            </aside>
          </div>
        </div>
      </section>

      <section className="border-y border-stone-200 bg-white/60 px-6 py-16 sm:px-8 lg:px-10 lg:py-20">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-400">Product brief</p>
            <p className="mt-6 max-w-xl text-base font-light leading-loose text-stone-600">{product.description}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-stone-400">Details</p>
            <ul className="mt-5 space-y-3">
              {product.details.map((line) => <li key={line} className="text-sm font-light leading-relaxed text-stone-600">{line}</li>)}
            </ul>
          </div>
        </div>
      </section>

      {selectedDetail !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-950/80 p-5" role="dialog" aria-modal="true" aria-label="Product detail image" onClick={() => setSelectedDetail(null)}>
          <div className="relative h-[min(78vh,720px)] w-[min(92vw,980px)]" onClick={(event) => event.stopPropagation()}>
            <Image src={hotspotImages[selectedDetail]} alt={`${product.name} material detail`} fill className="object-contain" />
            <button ref={detailCloseRef} type="button" onClick={() => setSelectedDetail(null)} className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center bg-white text-lg text-stone-900" aria-label="Close detail">&#215;</button>
          </div>
        </div>
      )}
      {imageExpanded && (
        <div className="fixed inset-0 z-[65] bg-stone-950" role="dialog" aria-modal="true" aria-label={`${product.name} image viewer`}>
          <Image src={displayImage} alt={`${product.name} enlarged ${current.label} view`} fill priority className="object-contain" />
          <button ref={imageCloseRef} type="button" onClick={() => setImageExpanded(false)} aria-label="Close image viewer" title="Close image viewer" className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-stone-900">
            <X size={20} />
          </button>
          <p className="absolute inset-x-6 bottom-8 text-center text-xs font-medium uppercase tracking-[0.16em] text-white">{product.name} · {current.label}</p>
        </div>
      )}
    </>
  );
}
