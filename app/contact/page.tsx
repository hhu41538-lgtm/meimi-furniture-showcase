const socialLinks = [
  { platform: "TikTok", handle: "@meimi_LincoIn / @meimi_furniture3 / @meimi_furniture" },
  { platform: "Instagram", handle: "@Meimi&H Living India / @Meimi&H Living US" },
  { platform: "Facebook", handle: "Meimi&H Living US / Meimi&H Living Global / Meimi&H Living India" },
];

export default function ContactPage() {
  return (
    <main className="bg-[#FAF9F6] px-6 py-16 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <section>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-stone-500">
            Contact
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-stone-900 sm:text-5xl">
            Get in Touch
          </h1>
        </section>

        <a
          href="https://wa.me/8617796076275"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-full bg-stone-900 px-6 py-4 text-center text-base font-semibold text-white transition hover:bg-stone-700 sm:text-lg"
        >
          Chat on WhatsApp — We respond within 24 hours
        </a>

        <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-stone-900">Meimi&H</h2>
          <p className="mt-4 text-lg leading-8 text-stone-600">
            佛山市美觅家居科技有限公司
            <br />
            Shunde District, Longjiang Town, Foshan, Guangdong, China
          </p>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-stone-900">Social</h2>
          <div className="mt-4 space-y-3 text-stone-600">
            {socialLinks.map((link) => (
              <div key={link.platform}>
                <p className="font-semibold text-stone-900">{link.platform}</p>
                <p className="mt-1 text-base">{link.handle}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
