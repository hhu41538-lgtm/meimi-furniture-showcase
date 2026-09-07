import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#FAF9F6] px-6 py-20 text-stone-900">
      <section className="w-full max-w-xl text-center">
        <p className="font-[family-name:var(--font-jost)] text-xs font-medium uppercase tracking-[0.28em] text-[#6B2737]">Meimi&amp;H</p>
        <p className="mt-6 text-7xl font-light tracking-tight text-stone-300">404</p>
        <h1 className="mt-4 text-3xl font-light">页面暂时不存在</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-stone-500">链接可能已经更新。你可以返回首页、打开移动产品图册，或直接联系美觅家居。</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="inline-flex min-h-12 items-center gap-2 bg-stone-900 px-5 text-xs font-medium text-white">
            <ArrowLeft size={16} strokeWidth={1.7} /> 返回首页
          </Link>
          <Link href="/app" className="inline-flex min-h-12 items-center gap-2 border border-stone-300 px-5 text-xs font-medium text-stone-700">
            打开产品图册
          </Link>
          <a href="https://wa.me/8617796045579" target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center gap-2 border border-[#6B2737] px-5 text-xs font-medium text-[#6B2737]">
            <MessageCircle size={16} strokeWidth={1.7} /> WhatsApp +86 177 9604 5579
          </a>
        </div>
      </section>
    </main>
  );
}
