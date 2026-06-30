import Link from "next/link";

const socialLinks = [
  { label: "TikTok", href: "https://www.tiktok.com" },
  { label: "Instagram", href: "https://www.instagram.com" },
  { label: "Facebook", href: "https://www.facebook.com" },
];

export default function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-[#FAF9F6]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 text-sm text-stone-600 sm:px-8 lg:flex-row lg:items-start lg:justify-between lg:px-10">
        <div>
          <p className="font-['var(--font-playfair-display)'] text-xl font-semibold tracking-[0.12em] text-stone-900">
            Meimi&H
          </p>
          <p className="mt-2 text-base text-stone-700">
            Where Beauty Dwells, The Heart Finds
          </p>
          <p className="mt-3">佛山市美觅家居科技有限公司 · Foshan, China</p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-4">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-stone-700 transition hover:text-stone-950"
              >
                {link.label}
              </a>
            ))}
          </div>
          <Link
            href="https://wa.me/8617796076275"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-stone-700 transition hover:text-stone-950"
          >
            WhatsApp
          </Link>
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
            © 2025 Meimi&H. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
