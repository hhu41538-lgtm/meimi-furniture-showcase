import Link from "next/link";

const socialLinks = [
  { label: "TikTok", href: "https://www.tiktok.com/@meimi_furniture" },
  { label: "Instagram", href: "https://www.instagram.com/meimi_furniture_us" },
  { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61589995301371" },
];

export default function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-[#FAF9F6]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 text-sm text-stone-600 sm:px-8 lg:flex-row lg:items-start lg:justify-between lg:px-10">
        <div>
          <p className="font-[family-name:var(--font-jost)] text-xl font-medium tracking-[0.12em] text-stone-900">
            Meimi&H
          </p>
          <p className="mt-2 text-base text-stone-700">Where Beauty Dwells, The Heart Finds</p>
          <p className="mt-3">Shunde District, Longjiang Town, Foshan, Guangdong, China</p>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-4">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-stone-700 transition-colors duration-300 hover:text-[#6B2737]"
              >
                {link.label}
              </a>
            ))}
          </div>
          <Link
            href="https://wa.me/8617796076275"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-stone-700 transition-colors duration-300 hover:text-[#6B2737]"
          >
            WhatsApp
          </Link>
          <Link
            href="/privacy"
            className="font-medium text-stone-500 transition-colors duration-300 hover:text-[#6B2737]"
          >
            Privacy Policy
          </Link>
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
            &copy; 2025 Meimi&H. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
