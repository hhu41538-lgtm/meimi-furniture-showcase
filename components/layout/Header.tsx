import Link from "next/link";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-[#FAF9F6] shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="font-['var(--font-playfair-display)'] text-xl font-semibold tracking-[0.2em] text-stone-900"
        >
          Meimi&H
        </Link>

        <nav className="flex items-center gap-8 text-sm font-medium text-stone-700">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="transition hover:text-stone-950"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
