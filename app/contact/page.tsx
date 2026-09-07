import type { Metadata } from "next";
import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Meimi&H — premium furniture handcrafted in Foshan, China. Message us on WhatsApp at +86 177 9604 5579, we respond within 24 hours.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Meimi&H | WhatsApp Furniture Enquiries",
    description: "Message Meimi&H on WhatsApp about premium furniture and custom interiors from Foshan.",
    type: "website",
    images: [{ url: "/images/Hero/hero4.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Meimi&H | WhatsApp Furniture Enquiries",
    description: "Message Meimi&H on WhatsApp about premium furniture and custom interiors from Foshan.",
    images: ["/images/Hero/hero4.jpg"],
  },
};

const PHONE = "https://wa.me/8617796045579";

const socialLinks = [
  { platform: "TikTok", href: "https://www.tiktok.com/@meimi_furniture", handle: "@meimi_furniture" },
  { platform: "Instagram", href: "https://www.instagram.com/meimi_furniture_us", handle: "@meimi_furniture_us" },
  { platform: "Facebook", href: "https://www.facebook.com/profile.php?id=61589995301371", handle: "Meimi&H Living US" },
];

export default function ContactPage() {
  return (
    <main className="bg-[#FAF9F6] text-stone-800">
      {/* HEADER */}
      <section className="px-6 pt-32 sm:px-8 lg:px-10 lg:pt-40">
        <FadeIn>
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-medium uppercase tracking-[0.4em] text-stone-400">
              Contact
            </p>
            <h1 className="mt-5 text-4xl font-extralight tracking-tight text-stone-900 sm:text-6xl">
              Get in touch
            </h1>
            <p className="mx-auto mt-8 max-w-md text-base font-light leading-loose text-stone-500">
              We&apos;d love to hear about your space. Reach out and a member of
              our team will respond within 24 hours.
            </p>
            <a
              href={PHONE}
              target="_blank"
              rel="noreferrer"
              className="mt-10 inline-flex items-center gap-2 bg-[#6B2737] px-8 py-3.5 text-sm font-medium tracking-[0.12em] text-white transition-colors duration-300 hover:bg-stone-900"
            >
              WHATSAPP +86 177 9604 5579
              <span>&rarr;</span>
            </a>
          </div>
        </FadeIn>
      </section>

      {/* INFO */}
      <section className="px-6 py-24 sm:px-8 lg:px-10 lg:py-32">
        <div className="mx-auto grid max-w-5xl gap-16 lg:grid-cols-2 lg:gap-24">
          <FadeIn>
            <div className="border-t border-stone-200 pt-8">
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-stone-400">
                Atelier
              </p>
              <h2 className="mt-6 text-2xl font-extralight tracking-tight text-stone-900">
                Meimi&amp;H
              </h2>
              <p className="mt-5 text-base font-light leading-loose text-stone-500">
                Shunde District, Longjiang Town
                <br />
                Foshan, Guangdong, China
              </p>
              <a
                href={PHONE}
                target="_blank"
                rel="noreferrer"
                className="group mt-8 inline-flex items-center gap-2 text-sm font-medium tracking-[0.12em] text-[#6B2737] transition-colors duration-300 hover:text-stone-900"
              >
                +86 177 9604 5579
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  &rarr;
                </span>
              </a>
            </div>
          </FadeIn>

          <FadeIn delay={150}>
            <div className="border-t border-stone-200 pt-8">
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-stone-400">
                Social
              </p>
              <div className="mt-6 space-y-6">
                {socialLinks.map((link) => (
                  <a
                    key={link.platform}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group block"
                  >
                    <p className="text-base font-light tracking-tight text-stone-900 transition-colors duration-300 group-hover:text-[#6B2737]">
                      {link.platform}
                    </p>
                    <p className="mt-1 text-sm font-light leading-relaxed text-stone-500">
                      {link.handle}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="border-t border-stone-200/70 bg-white/60 px-6 py-16 text-center sm:px-8 lg:px-10">
        <h2 className="text-2xl font-extralight tracking-tight text-stone-900 sm:text-3xl">
          Let&apos;s create something refined.
        </h2>
        <a
          href={PHONE}
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-flex items-center gap-2 border-b border-[#6B2737] pb-1 text-sm font-medium tracking-[0.12em] text-[#6B2737] transition-colors duration-300 hover:border-stone-900 hover:text-stone-900"
        >
          START A CONVERSATION
          <span>&rarr;</span>
        </a>
        <div className="mt-10 flex flex-wrap justify-center gap-4 text-sm">
          <Link href="/products" className="inline-flex min-h-10 items-center border border-stone-300 px-5 text-stone-700 transition-colors hover:border-stone-900 hover:text-stone-950">Explore products <span className="ml-2" aria-hidden="true">→</span></Link>
          <Link href="/case-showcase" className="inline-flex min-h-10 items-center border border-stone-300 px-5 text-stone-700 transition-colors hover:border-stone-900 hover:text-stone-950">View case showcase <span className="ml-2" aria-hidden="true">→</span></Link>
          <Link href="/custom" className="inline-flex min-h-10 items-center border border-stone-300 px-5 text-stone-700 transition-colors hover:border-stone-900 hover:text-stone-950">Custom furniture <span className="ml-2" aria-hidden="true">→</span></Link>
        </div>
      </section>
    </main>
  );
}
