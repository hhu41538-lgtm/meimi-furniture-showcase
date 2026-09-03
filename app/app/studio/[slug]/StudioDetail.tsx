"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, Heart, Maximize2, MessageCircle, Share2, X } from "lucide-react";
import type { StudioItem } from "@/lib/catalogueStudio";
import { isCatalogueCategory, studioItems } from "@/lib/catalogueStudio";
import { copyPageLink } from "@/lib/copyPageLink";
import { useSavedPieces } from "@/lib/useSavedPieces";
import { useRecentPieces } from "@/lib/useRecentPieces";

const studioLabelMap: Record<string, string> = {
  "Showroom piece": "展厅单品",
  "Custom interiors": "全屋定制",
  "Residential case study": "住宅案例",
  "Kitchen case study": "厨房案例",
  "Joinery case study": "柜体案例",
  "Bedroom collection": "卧室系列",
  "Handcrafted mattress collection": "手工床垫系列",
  "Svisbedy mattress collection": "Svisbedy 床垫系列",
  "Dining collection": "餐厅系列",
  "Storage collection": "收纳系列",
  "Outdoor collection": "户外系列",
  "Showroom reference": "展厅参考",
  "Project reference": "项目参考",
  "Bedroom reference": "卧室参考",
  "Product reference": "产品参考",
  "Scene collection": "场景系列",
  "Outdoor scene": "户外场景",
  "Construction study": "结构示意",
  "Art wall detail": "艺术墙细节",
  "Dining setting": "餐厅场景",
  "Living room": "客厅空间",
  "Bedroom": "卧室空间",
  "Open-plan interior": "开放式空间",
  "Lounge detail": "休闲区细节",
  "Lounge view": "休闲区视角",
  "Bathroom joinery": "卫浴柜体",
  "Framed wardrobe": "框景衣柜",
  "Bedroom joinery": "卧室柜体",
  "Dining and kitchen": "餐厨空间",
  "Kitchen joinery": "厨房柜体",
  "Wardrobe interior": "衣柜内部",
  "Hand-tufted surface": "手工绗缝表面",
  "Side fastening detail": "侧面固定细节",
  "Tufted mattress profile": "绗缝床垫轮廓",
  "Tailored side panel": "定制侧板",
  "Formal dining view": "正式餐厅视角",
  "Oval top and seating": "椭圆台面与座椅",
  "Petal base detail": "花瓣底座细节",
  "Upholstered bed base": "软包床架",
  "Mattress profile": "床垫轮廓",
  "Tufted topper": "绗缝床垫层",
  "Space - open-plan dining and living": "空间 - 开放式餐客厅",
  "Joinery - fitted kitchen and display storage": "柜体 - 定制厨房与展示收纳",
  "Furniture - dining and lounge coordinated together": "家具 - 餐厅与休闲区整体协调",
  "Materials - specified to the project palette": "材质 - 按项目配色方案确定",
  "Configuration - adapted to plan": "配置 - 按平面方案调整",
  "Upholstery - selected at specification": "软包 - 按规格选择",
  "Dimensions - confirmed per project": "尺寸 - 按项目确认",
  "Materials - coordinated dark timber, stone and textiles": "材质 - 深色木饰面、石材与织物协调",
  "Cabinetry - framed upper and lower units": "柜体 - 框景式上下柜组合",
  "Island - central preparation and storage zone": "中岛 - 中央备餐与收纳区域",
  "Hardware - warm metal detail": "五金 - 温暖金属细节",
  "Materials - selected to the project palette": "材质 - 按项目配色选择",
  "Joinery - integrated shelves and full-height storage": "柜体 - 一体化层板与通高收纳",
  "Work surface - made to the room dimensions": "台面 - 按空间尺寸定制",
  "Lighting - recessed shelf illumination": "灯光 - 层板嵌入式照明",
  "Materials - pale oak and stone direction": "材质 - 浅橡木与石材方向",
  "Space - open living area": "空间 - 开放式客厅",
  "Joinery - media wall and timber ceiling detail": "柜体 - 电视墙与木饰面顶面细节",
  "Furniture - tailored modular seating": "家具 - 定制模块化座椅",
  "Materials - warm timber, stone and upholstered textiles": "材质 - 温润木饰面、石材与软包织物",
  "Bed size - confirmed at enquiry": "床体尺寸 - 咨询时确认",
  "Headboard - upholstery options available": "床头 - 提供软包面料选择",
  "Bedside integration - on request": "床头柜一体化 - 可按需配置",
  "Collection - Elizabeth": "系列 - Elizabeth",
  "Construction - layered handcrafted comfort": "结构 - 多层手工舒适系统",
  "Bed base - coordinated upholstery available": "床架 - 可搭配同系列软包",
  "Size - confirmed for the project": "尺寸 - 按项目确认",
  "Collection - Isabel": "系列 - Isabel",
  "Surface - quilted comfort layer": "表层 - 绗缝舒适层",
  "Side panel - hand-tufted upholstery": "侧板 - 手工绗缝软包",
  "Size - tailored to seating plan": "尺寸 - 按座席方案定制",
  "Top - natural stone selection": "台面 - 天然石材选择",
  "Base - finish options available": "底座 - 提供饰面选择",
  "Size - tailored to the seating plan": "尺寸 - 按座席方案定制",
  "Model - WD001": "型号 - WD001",
  "Table height - 750 mm": "桌高 - 750 mm",
  "Diameter - 2400 mm shown": "直径 - 展示尺寸 2400 mm",
  "Finish and dimensions - confirmed at specification": "饰面与尺寸 - 按规格确认",
  "Base - sculptural petal form": "底座 - 雕塑感花瓣造型",
  "Top - finish selected at specification": "台面 - 按规格选择饰面",
  "Seating - coordinated dining chairs available": "座椅 - 可搭配同系列餐椅",
  "Timber - finish selected at specification": "木饰面 - 按规格选择",
  "Frame - metal finish options": "框架 - 提供金属饰面选择",
  "Internal layout - configured per use": "内部布局 - 按使用需求配置",
  "Model - WD037S26": "型号 - WD037S26",
  "Size shown - 1000 × 500 × 1900 mm": "展示尺寸 - 1000 × 500 × 1900 mm",
  "Storage - glass display and bar service": "功能 - 玻璃展示与酒水服务收纳",
  "Finish - specified per project": "饰面 - 按项目规格确定",
  "Upholstery - navy checker weave": "软包 - 藏蓝格纹织物",
  "Mattress - handcrafted collection": "床垫 - 手工床垫系列",
  "Bedroom scheme - coordinated on request": "卧室方案 - 可按需协调",
  "Table - outdoor timber finish": "餐桌 - 户外木饰面",
  "Seating - woven weather-resistant material": "座椅 - 耐候编织材质",
  "Layout - scaled to terrace plan": "布局 - 按露台方案调整",
  "Configuration - modular seating system": "配置 - 模块化座椅系统",
  "Upholstery - weather-ready selection": "软包 - 户外耐候材质选择",
  "Frame - outdoor material finish": "框架 - 户外材质饰面",
  "Layout - tailored to the space": "布局 - 按空间定制",
};

const localizeStudioLabel = (label: string) => studioLabelMap[label] ?? label;

const studioCopyMap: Record<string, { tagline: string; description: string }> = {
  "custom-curve-sofa": {
    tagline: "低矮线条与克制有序的模块节奏。",
    description: "美觅家居展厅中的弧形定制沙发方案，用于沟通空间比例、面料与组合方式。",
  },
  "beijing-residence-interior": {
    tagline: "覆盖餐厅、厨房与客厅的完整材质方向。",
    description: "以雕塑感餐厅、定制厨房、展示柜体与软体家具组成的住宅空间参考，适合作为整体规划建筑、家具与饰面的起点。",
  },
  "dark-tonal-residence": {
    tagline: "深色肌理、低照度与沉静有序的休闲区。",
    description: "以炭色柜体、深色石材地面和舒展软体家具构成的住宅客厅方案，让材质肌理与家具轮廓成为空间重点。",
  },
  "modern-french-kitchen": {
    tagline: "经典比例，为当代生活重新定制。",
    description: "象牙白框景柜体、深绿色地柜、浅色石材台面与低调黄铜五金组合而成的厨房参考，兼顾正式气质与日常实用性。",
  },
  "soft-minimal-study": {
    tagline: "由光线、橡木与石材塑造的安静工作区。",
    description: "以整合式层架、整块工作台与通高柜体构成的极简书房，展示定制柜体如何把紧凑工作区转化为平静的建筑式空间。",
  },
  "warm-contemporary-living": {
    tagline: "温润木质建筑中的柔和模块客厅。",
    description: "定制模块沙发、框景电视墙与连续木质吊顶共同构成的住宅客厅参考，让柜体与活动家具保持整体统一。",
  },
  "riviere-bed": {
    tagline: "柔和定制床头与安静的建筑感。",
    description: "以宽阔床头与细节克制的床头柜场景构成的卧室方案，可作为定制卧室空间的参考。",
  },
  "elizabeth-mattress": {
    tagline: "层次舒适感与清晰定制质感。",
    description: "柔和卧室场景中的全高手工床垫参考，层叠结构与绗缝表面适合作为完整睡眠方案的起点。",
  },
  "isabel-mattress": {
    tagline: "深度手工绗缝侧面与双色定制床垫。",
    description: "柔和绗缝睡眠表面、藏蓝手工绗缝侧板与暖色包边组成的床垫参考，让床垫本身成为空间中的工艺焦点。",
  },
  "travertine-dining-table": {
    tagline: "石材、暖金属与雕塑感底座。",
    description: "天然石材台面与成对支撑底座构成的精致餐桌方案，适合定制餐厅与酒店式待客空间。",
  },
  "jason-dining-table": {
    tagline: "带有图案石材嵌件的宽阔餐厅中心。",
    description: "轻奢系列餐桌参考，以完整餐厅场景呈现定制座椅与材质层次，适合尺度充足的住宅餐厅。",
  },
  "maxim-petal-dining-table": {
    tagline: "雕塑花瓣底座上的椭圆台面。",
    description: "柔和椭圆轮廓与层叠花瓣底座组成的餐桌方案，适合正式餐厅与酒店式待客空间。",
  },
  "airplane-cabinet": {
    tagline: "温润木饰面、反射边框与精准收纳。",
    description: "以丰富木纹主体结合金属反射边框的柜体方案，既可作为独立收纳家具，也可延展为更大的定制柜体方向。",
  },
  "palawan-bar-cabinet": {
    tagline: "烤漆、木饰面与反射玻璃构成的展示收纳。",
    description: "温润木质外观、黑色烤漆边框与带灯玻璃展示区组成的独立酒柜，适合餐厅、休闲区与私人待客空间。",
  },
  "stina-upholstered-bed": {
    tagline: "沉静卧室中的藏蓝织物质感。",
    description: "将手工床垫置于石材与橡木构成的安静卧室中，可作为床具、织物与床头柜饰面的整体方向。",
  },
  "terrace-dining-setting": {
    tagline: "自然木材、编织肌理与户外用餐。",
    description: "宽阔木质餐桌、编织座椅与耐候材质组成的轻松户外餐厅，适合露台、花园房与酒店项目。",
  },
  "outdoor-modular-lounge": {
    tagline: "为户外生活而设的柔和模块座椅。",
    description: "在多种组合中展示的户外模块座椅系统，从宽阔休闲区到紧凑弧形沙发均可适配，适合露台、泳池平台与有顶花园。",
  },
};

type ViewerImage = { image: string; alt: string; label: string };

export default function StudioDetail({ item }: { item: StudioItem }) {
  const searchParams = useSearchParams();
  const [shared, setShared] = useState(false);
  const [viewerImage, setViewerImage] = useState<ViewerImage | null>(null);
  const viewerTriggerRef = useRef<HTMLButtonElement | null>(null);
  const imageCloseRef = useRef<HTMLButtonElement>(null);
  const imageWasExpanded = useRef(false);
  const { isSaved, toggleSaved } = useSavedPieces();
  const { recordRecent } = useRecentPieces();
  const requestedCategory = searchParams.get("category");
  const backHref = isCatalogueCategory(requestedCategory ?? undefined) ? `/app?category=${requestedCategory}` : "/app";
  const phoneHref = `tel:15355787546`;
  const relatedItems = studioItems.filter((entry) => entry.category === item.category && entry.slug !== item.slug).slice(0, 2);
  const saved = isSaved(item.slug);

  useEffect(() => {
    recordRecent(item.slug);
  }, [item.slug, recordRecent]);

  const openViewer = (viewer: ViewerImage, trigger: HTMLButtonElement) => {
    viewerTriggerRef.current = trigger;
    setViewerImage(viewer);
  };

  useEffect(() => {
    if (!viewerImage) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => imageCloseRef.current?.focus());
    const handleImageViewerKeys = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setViewerImage(null);
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
  }, [viewerImage]);

  useEffect(() => {
    if (viewerImage) {
      imageWasExpanded.current = true;
      return;
    }
    if (imageWasExpanded.current) {
      viewerTriggerRef.current?.focus();
      imageWasExpanded.current = false;
    }
  }, [viewerImage]);

  const sharePiece = async () => {
    const shareData = { title: `Meimi&H | ${item.name}`, text: item.tagline, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else if (!(await copyPageLink(window.location.href))) return;
      setShared(true);
      window.setTimeout(() => setShared(false), 1800);
    } catch {
      // The native share sheet can be dismissed without treating it as an error.
    }
  };

  return (
    <div className="catalogue-app-shell min-h-screen bg-[#e9e7e1] text-[#1d1c1a]">
      <main className="catalogue-app-frame mx-auto min-h-screen max-w-[430px] bg-[#fbfaf7] pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0_0_0_1px_rgba(28,28,28,0.06)] sm:shadow-[0_18px_60px_rgba(35,30,24,0.16)]">
        <section className="relative aspect-[0.92] bg-stone-100">
          <Image src={item.image} alt={item.name} fill priority className="object-cover" />
          <button
            type="button"
            onClick={(event) => openViewer({ image: item.image, alt: `${item.name} enlarged`, label: item.name }, event.currentTarget)}
            aria-label="查看大图"
            title="查看大图"
            className="absolute inset-0 z-[1] cursor-zoom-in"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/35 to-transparent" />
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4 pt-[max(1rem,env(safe-area-inset-top))]">
            <Link href={backHref} aria-label="返回产品图册" title="返回产品图册" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-stone-900 shadow-sm">
              <ArrowLeft size={19} />
            </Link>
            <div className="flex gap-2">
              <button type="button" aria-label={shared ? "链接已复制" : "分享案例"} title={shared ? "链接已复制" : "分享案例"} onClick={() => void sharePiece()} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-stone-900 shadow-sm">
                {shared ? <Check size={17} /> : <Share2 size={17} />}
              </button>
              <button type="button" aria-label={saved ? "取消收藏" : "加入收藏"} title={saved ? "取消收藏" : "加入收藏"} aria-pressed={saved} onClick={() => toggleSaved(item.slug)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-stone-900 shadow-sm">
                <Heart size={18} fill={saved ? "#6B2737" : "none"} className={saved ? "text-[#6B2737]" : ""} />
              </button>
            </div>
          </div>
          <span className="absolute bottom-4 left-4 z-10 bg-stone-900/80 px-3 py-2 text-[10px] font-medium uppercase tracking-[0.16em] text-white">{localizeStudioLabel(item.imageLabel)}</span>
          <button type="button" onClick={(event) => openViewer({ image: item.image, alt: `${item.name} enlarged`, label: item.name }, event.currentTarget)} aria-label="查看大图" title="查看大图" className="absolute bottom-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-stone-900 shadow-sm"><Maximize2 size={17} strokeWidth={1.7} /></button>
        </section>

        {viewerImage && (
          <div role="dialog" aria-modal="true" aria-label={`${item.name} 图片查看器`} className="fixed inset-0 z-[60] bg-stone-950">
            <Image src={viewerImage.image} alt={viewerImage.alt} fill priority className="object-contain" />
            <button ref={imageCloseRef} type="button" onClick={() => setViewerImage(null)} aria-label="关闭图片查看器" title="关闭图片查看器" className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-stone-900">
              <X size={20} />
            </button>
            <p className="absolute inset-x-5 bottom-[max(1.5rem,env(safe-area-inset-bottom))] text-center text-xs font-medium uppercase tracking-[0.16em] text-white">{localizeStudioLabel(viewerImage.label)}</p>
          </div>
        )}

        <div className="px-5 pb-5 pt-5">
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-stone-400">{localizeStudioLabel(item.eyebrow)}</p>
          <h1 className="mt-2 text-3xl font-light leading-tight">{item.name}</h1>
          <p className="mt-2 text-sm font-light italic text-[#6B2737]">{studioCopyMap[item.slug]?.tagline ?? item.tagline}</p>
          <p className="mt-6 border-t border-stone-200 pt-5 text-sm font-light leading-relaxed text-stone-600">{studioCopyMap[item.slug]?.description ?? item.description}</p>

          {item.gallery?.length ? (
            <section className="mt-6 border-t border-stone-200 pt-5">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400">项目图册</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {item.gallery.map((entry) => (
                  <button key={entry.image} type="button" onClick={(event) => openViewer({ image: entry.image, alt: `${item.name} ${entry.label}`, label: entry.label }, event.currentTarget)} className="group text-left">
                    <div className="relative aspect-[1.16] overflow-hidden rounded-[6px] bg-stone-100">
                      <Image src={entry.image} alt={entry.label} fill className="object-cover transition duration-500 group-hover:scale-105" />
                    </div>
                    <span className="mt-2 block text-xs font-medium text-stone-600">{localizeStudioLabel(entry.label)}</span>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          <section className="mt-6 border-t border-stone-200 pt-5">
            <p className="text-sm font-medium">定制方向</p>
            <ul className="mt-4 space-y-2.5">
              {item.details.map((detail) => <li key={detail} className="text-xs font-light leading-relaxed text-stone-500">{localizeStudioLabel(detail)}</li>)}
            </ul>
          </section>

          {relatedItems.length > 0 && (
            <section className="mt-7 border-t border-stone-200 pt-5">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400">更多空间案例</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {relatedItems.map((related) => (
                  <Link key={related.slug} href={`/app/studio/${related.slug}?category=${related.category}`} className="group">
                    <div className="relative aspect-[1.1] overflow-hidden rounded-[6px] bg-stone-100">
                      <Image src={related.image} alt={related.name} fill className="object-cover transition duration-500 group-hover:scale-105" />
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm font-medium leading-snug">{related.name}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="sticky bottom-0 border-t border-stone-200 bg-[#fbfaf7]/95 px-5 py-3 backdrop-blur">
          <a href={phoneHref} className="flex w-full items-center justify-center gap-2 bg-[#6B2737] py-3.5 text-xs font-medium uppercase tracking-[0.14em] text-white">
            <MessageCircle size={17} /> 联系美觅家居 15355787546
          </a>
        </div>
      </main>
    </div>
  );
}
