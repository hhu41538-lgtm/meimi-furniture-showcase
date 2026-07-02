import type { Metadata } from "next";
import { Inter, Playfair_Display, Bodoni_Moda } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
  display: "swap",
});

const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni-moda",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Meimi Furniture",
  description: "Elegant furniture solutions crafted for modern living.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfairDisplay.variable} ${bodoniModa.variable}`}
    >
      <body className="min-h-screen bg-[#FCFBF7] text-stone-800 antialiased">
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>

        <a
          href="https://wa.me/8617796076275"
          target="_blank"
          rel="noreferrer"
          aria-label="Contact us on WhatsApp"
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-emerald-900/20 transition hover:scale-105"
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.166-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.149-.174.199-.297.298-.495.099-.198.049-.372-.025-.521-.074-.149-.669-1.611-.916-2.206-.241-.579-.486-.5-.669-.51-.173-.008-.372-.01-.57-.01-.198 0-.521.074-.793.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.49 1.694.627.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.287.173-1.413-.074-.126-.272-.198-.57-.347Z" />
          </svg>
        </a>
      </body>
    </html>
  );
}
