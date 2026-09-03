export default function StudioDetailLoading() {
  return (
    <main aria-busy="true" aria-label="正在加载空间案例" className="catalogue-app-shell min-h-screen bg-[#e9e7e1]">
      <div className="catalogue-app-frame mx-auto min-h-screen max-w-[430px] bg-[#fbfaf7] pb-8 shadow-[0_0_0_1px_rgba(28,30,24,0.06)]">
        <div className="relative aspect-[0.92] animate-pulse bg-stone-200">
          <div className="absolute left-4 top-5 h-10 w-10 rounded-full bg-white/70" />
          <div className="absolute right-4 top-5 h-10 w-10 rounded-full bg-white/70" />
        </div>
        <div className="space-y-4 px-5 pt-6">
          <div className="h-3 w-28 animate-pulse bg-stone-200" />
          <div className="h-10 w-56 animate-pulse bg-stone-200" />
          <div className="h-4 w-64 animate-pulse bg-stone-100" />
          <div className="h-px w-full bg-stone-200" />
          <div className="h-24 w-full animate-pulse bg-stone-100" />
          <div className="grid grid-cols-2 gap-3"><div className="aspect-[1.16] animate-pulse bg-stone-100" /><div className="aspect-[1.16] animate-pulse bg-stone-100" /></div>
        </div>
      </div>
    </main>
  );
}
