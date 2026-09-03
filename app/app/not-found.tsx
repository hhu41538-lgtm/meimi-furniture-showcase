import { ArrowLeft, Phone } from "lucide-react";

export default function CatalogueNotFound() {
  return (
    <main className="catalogue-app-shell flex min-h-screen items-center justify-center bg-[#e9e7e1] px-5 text-[#1d1c1a]">
      <section className="catalogue-app-frame w-full max-w-[430px] bg-[#fbfaf7] px-6 py-16 text-center shadow-[0_18px_60px_rgba(35,30,24,0.16)]">
        <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-stone-400">Meimi&amp;H</p>
        <p className="mt-5 text-5xl font-light text-[#6B2737]">404</p>
        <h1 className="mt-4 text-2xl font-light">没有找到这件内容</h1>
        <p className="mx-auto mt-3 max-w-[18rem] text-sm font-light leading-relaxed text-stone-500">链接可能已经更新，返回图册继续浏览其他产品与空间方案。</p>
        <div className="mt-8 grid grid-cols-2 gap-2">
          <a href="/app" className="flex min-h-12 items-center justify-center gap-2 bg-stone-900 px-3 text-xs font-medium text-white">
            <ArrowLeft size={16} strokeWidth={1.7} /> 返回图册
          </a>
          <a href="tel:15355787546" className="flex min-h-12 items-center justify-center gap-2 border border-stone-300 px-3 text-xs font-medium text-stone-700">
            <Phone size={16} strokeWidth={1.7} /> 联系我们
          </a>
        </div>
      </section>
    </main>
  );
}
