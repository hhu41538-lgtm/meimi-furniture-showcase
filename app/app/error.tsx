"use client";

import { RefreshCw, Phone } from "lucide-react";

export default function CatalogueError({ reset }: { reset: () => void }) {
  return (
    <main className="catalogue-app-shell flex min-h-screen items-center justify-center bg-[#e9e7e1] px-5 text-[#1d1c1a]">
      <section role="alert" className="catalogue-app-frame w-full max-w-[430px] bg-[#fbfaf7] px-6 py-16 text-center shadow-[0_18px_60px_rgba(35,30,24,0.16)]">
        <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-stone-400">Meimi&amp;H</p>
        <h1 className="mt-4 text-2xl font-light">图册暂时无法打开</h1>
        <p className="mx-auto mt-3 max-w-[18rem] text-sm font-light leading-relaxed text-stone-500">请重新尝试加载，或直接联系美觅家居获取产品资料。</p>
        <div className="mt-8 grid grid-cols-2 gap-2">
          <button type="button" onClick={reset} className="flex min-h-12 items-center justify-center gap-2 border border-stone-300 px-3 text-xs font-medium text-stone-700">
            <RefreshCw size={16} strokeWidth={1.7} /> 重新加载
          </button>
          <a href="tel:15355787546" className="flex min-h-12 items-center justify-center gap-2 bg-[#6B2737] px-3 text-xs font-medium text-white">
            <Phone size={16} strokeWidth={1.7} /> 联系我们
          </a>
        </div>
        <a href="/app" className="mt-6 inline-flex border-b border-[#6B2737] pb-1 text-xs font-medium text-[#6B2737]">返回产品图册</a>
      </section>
    </main>
  );
}
