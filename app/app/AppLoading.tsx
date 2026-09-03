export default function AppLoading() {
  return (
    <div className="catalogue-app-shell min-h-screen bg-[#e9e7e1]">
      <div aria-busy="true" aria-label="正在加载产品图册" className="catalogue-app-frame mx-auto min-h-screen max-w-[430px] bg-[#fbfaf7] px-5 pt-5 shadow-[0_0_0_1px_rgba(28,28,28,0.06)] sm:shadow-[0_18px_60px_rgba(35,30,24,0.16)]">
        <div className="h-3 w-16 animate-pulse bg-stone-200" />
        <div className="mt-3 h-6 w-28 animate-pulse bg-stone-200" />
        <div className="mt-8 aspect-[1.12/1] animate-pulse bg-stone-200" />
        <div className="mt-6 h-12 animate-pulse rounded-full bg-stone-100" />
        <div className="mt-8 grid grid-cols-2 gap-3"><div className="aspect-[1.22] animate-pulse bg-stone-200" /><div className="aspect-[1.22] animate-pulse bg-stone-200" /></div>
      </div>
    </div>
  );
}
