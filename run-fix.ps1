$layoutPath = "app\layout.tsx"
$content = Get-Content -Path $layoutPath -Raw

# 1. 加 import siteConfig（如果还没有）
if ($content -notmatch "seo-config") {
  $oldImport = 'import Footer from "@/components/layout/Footer";'
  $newImport = $oldImport + "`r`n" + 'import { siteConfig } from "@/lib/seo-config";'
  $content = $content.Replace($oldImport, $newImport)
}

# 2. 替换整个 metadata 块（当前是精简版）
$oldMeta = @'
export const metadata: Metadata = {
  title: "Meimi&H - Premium Furniture from Foshan",
  description: "High-end furniture direct from our Foshan atelier. Sofas, custom interiors, beds, dining and more. Est. 2020.",
};
'@

$newMeta = @'
export const metadata: Metadata = {
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
    locale: "en_US",
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
  verification: {
    google: "2tC8uAIByQggv6N-iHMRdCVREsQtG2uxrHKP_flhFoU",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.url,
  logo: `${siteConfig.url}/favicon.ico`,
  description: siteConfig.description,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Foshan",
    addressRegion: "Guangdong",
    addressCountry: "CN",
  },
};
'@

$content = $content.Replace($oldMeta, $newMeta)

# 3. 插入 JSON-LD script 标签（在 body 开头）
$oldBody = '<body className="min-h-screen bg-[#FCFBF7] text-stone-800 antialiased">'
$newBody = @'
<body className="min-h-screen bg-[#FCFBF7] text-stone-800 antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
'@
$content = $content.Replace($oldBody, $newBody)

[System.IO.File]::WriteAllText($layoutPath, $content, (New-Object System.Text.UTF8Encoding $false))

# 验证
Write-Host "===== 检查结果 =====" -ForegroundColor Cyan
$check = Get-Content $layoutPath -Raw
if ($check -match "metadataBase") { Write-Host "[OK] metadataBase" -ForegroundColor Green } else { Write-Host "[FAIL] metadataBase" -ForegroundColor Red }
if ($check -match "openGraph") { Write-Host "[OK] Open Graph" -ForegroundColor Green } else { Write-Host "[FAIL] Open Graph" -ForegroundColor Red }
if ($check -match "2tC8uAIByQggv6N") { Write-Host "[OK] Google verification" -ForegroundColor Green } else { Write-Host "[FAIL] verification" -ForegroundColor Red }
if ($check -match "organizationJsonLd") { Write-Host "[OK] JSON-LD" -ForegroundColor Green } else { Write-Host "[FAIL] JSON-LD" -ForegroundColor Red }
if ($check -match "seo-config") { Write-Host "[OK] siteConfig import" -ForegroundColor Green } else { Write-Host "[FAIL] import" -ForegroundColor Red }