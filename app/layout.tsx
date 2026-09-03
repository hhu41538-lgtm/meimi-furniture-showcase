import type { Metadata, Viewport } from "next";
import { Jost } from "next/font/google";
import Script from "next/script";
import { Phone } from "lucide-react";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/ui/PageTransition";
import PwaRegistration from "@/components/PwaRegistration";
import { siteConfig } from "@/lib/seo-config";

const jost = Jost({ subsets: ["latin"], variable: "--font-jost", display: "swap" });

export const metadata: Metadata = {
  manifest: "/manifest.webmanifest",
  applicationName: "美觅家居产品图册",
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: "%s | Meimi&H",
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
    locale: "zh_CN",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/app-icon-192.png",
    apple: "/app-icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "美觅家居",
  },
  formatDetection: {
    telephone: false,
  },
  verification: {
    google: [
      "2tC8uAIByQggv6N-iHMRdCVREsQtG2uxrHKP_flhFoU",
      "-DUMehVe_ejD7TXI1aUqrbXyy-sRFuRGBXme0T2VhG0",
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#6B2737",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.url,
  logo: `${siteConfig.url}/app-icon-512.png`,
  description: siteConfig.description,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Foshan",
    addressRegion: "Guangdong",
    addressCountry: "CN",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className={jost.variable}>
      <body className="min-h-screen bg-[#FCFBF7] text-stone-800 antialiased">
        {/* Google Analytics 4 (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-8EGKLN2KDW"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-8EGKLN2KDW');
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <noscript>
          {/* The Facebook fallback must remain a literal image for no-script clients. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img height="1" width="1" style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=3027824810758006&ev=PageView&noscript=1" alt="" />
        </noscript>
        <div className="flex min-h-screen flex-col">
          <Header />
          <div className="flex-1">
            <PageTransition>{children}</PageTransition>
          </div>
          <Footer />
        </div>
        <a href="tel:15355787546" aria-label="拨打美觅家居电话 15355787546" title="拨打 15355787546"
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#6B2737] text-white shadow-lg shadow-stone-900/20 transition hover:scale-105">
          <Phone className="h-7 w-7" strokeWidth={1.7} />
        </a>
        <Script src="/mp.js" strategy="afterInteractive" />
        <PwaRegistration />
      </body>
    </html>
  );
}
