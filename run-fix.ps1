# ===== 新建 lib/seo-config.ts =====
New-Item -ItemType Directory -Path "lib" -Force | Out-Null
$b64_1 = @'
ZXhwb3J0IGNvbnN0IHNpdGVDb25maWcgPSB7CiAgbmFtZTogIk1laW1pJkgiLAogIHVybDogImh0dHBzOi8vbWVpbWktZnVybml0dXJlLXNob3djYXNlLnZlcmNlbC5hcHAiLAogIHRpdGxlOiAiTWVpbWkmSCAtIFByZW1pdW0gRnVybml0dXJlIGZyb20gRm9zaGFuIiwKICBkZXNjcmlwdGlvbjoKICAgICJIaWdoLWVuZCBmdXJuaXR1cmUgZGlyZWN0IGZyb20gb3VyIEZvc2hhbiBhdGVsaWVyLiBTb2ZhcywgY3VzdG9tIGludGVyaW9ycywgYmVkcywgZGluaW5nIGFuZCBtb3JlLiBFc3QuIDIwMjAuIiwKICBvZ0ltYWdlOiAiL2ltYWdlcy9IZXJvLzcxNGVhM2NmLTg4YmItNDQ3My1iYjNiLTBkMzIwZGE5ZDMzNC5qcGciLAogIGtleXdvcmRzOiBbCiAgICAiTWVpbWkmSCIsCiAgICAiRm9zaGFuIGZ1cm5pdHVyZSBtYW51ZmFjdHVyZXIiLAogICAgImN1c3RvbSBmdXJuaXR1cmUgQ2hpbmEiLAogICAgImhpZ2gtZW5kIGZ1cm5pdHVyZSBzdXBwbGllciIsCiAgICAiaGFuZG1hZGUgbWF0dHJlc3MgbWFudWZhY3R1cmVyIiwKICAgICJPRU0gZnVybml0dXJlIEZvc2hhbiIsCiAgXSwKfTsKCmV4cG9ydCB0eXBlIFNpdGVDb25maWcgPSB0eXBlb2Ygc2l0ZUNvbmZpZzsK
'@
[System.IO.File]::WriteAllBytes("lib\seo-config.ts", [System.Convert]::FromBase64String($b64_1))
Write-Host "lib/seo-config.ts written"

# ===== 新建 app/robots.ts =====
$b64_2 = @'
aW1wb3J0IHR5cGUgeyBNZXRhZGF0YVJvdXRlIH0gZnJvbSAibmV4dCI7CmltcG9ydCB7IHNpdGVDb25maWcgfSBmcm9tICJAL2xpYi9zZW8tY29uZmlnIjsKCmV4cG9ydCBjb25zdCBkeW5hbWljID0gImZvcmNlLXN0YXRpYyI7CgpleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByb2JvdHMoKTogTWV0YWRhdGFSb3V0ZS5Sb2JvdHMgewogIHJldHVybiB7CiAgICBydWxlczogewogICAgICB1c2VyQWdlbnQ6ICIqIiwKICAgICAgYWxsb3c6ICIvIiwKICAgIH0sCiAgICBzaXRlbWFwOiBgJHtzaXRlQ29uZmlnLnVybH0vc2l0ZW1hcC54bWxgLAogIH07Cn0K
'@
[System.IO.File]::WriteAllBytes("app\robots.ts", [System.Convert]::FromBase64String($b64_2))
Write-Host "app/robots.ts written"

# ===== 新建 app/sitemap.ts =====
$b64_3 = @'
aW1wb3J0IHR5cGUgeyBNZXRhZGF0YVJvdXRlIH0gZnJvbSAibmV4dCI7CmltcG9ydCB7IHNpdGVDb25maWcgfSBmcm9tICJAL2xpYi9zZW8tY29uZmlnIjsKCmV4cG9ydCBjb25zdCBkeW5hbWljID0gImZvcmNlLXN0YXRpYyI7CgpleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBzaXRlbWFwKCk6IE1ldGFkYXRhUm91dGUuU2l0ZW1hcCB7CiAgY29uc3Qgcm91dGVzID0gWyIiLCAiL2Fib3V0IiwgIi9jYXNlLXNob3djYXNlIiwgIi9jb250YWN0IiwgIi9wcml2YWN5IiwgIi9wcm9kdWN0cyJdOwoKICByZXR1cm4gcm91dGVzLm1hcCgocm91dGUpID0+ICh7CiAgICB1cmw6IGAke3NpdGVDb25maWcudXJsfSR7cm91dGV9YCwKICAgIGxhc3RNb2RpZmllZDogbmV3IERhdGUoKSwKICAgIGNoYW5nZUZyZXF1ZW5jeTogIm1vbnRobHkiIGFzIGNvbnN0LAogICAgcHJpb3JpdHk6IHJvdXRlID09PSAiIiA/IDEgOiAwLjgsCiAgfSkpOwp9Cg==
'@
[System.IO.File]::WriteAllBytes("app\sitemap.ts", [System.Convert]::FromBase64String($b64_3))
Write-Host "app/sitemap.ts written"

# ===== 新建 app/manifest.ts =====
$b64_4 = @'
aW1wb3J0IHR5cGUgeyBNZXRhZGF0YVJvdXRlIH0gZnJvbSAibmV4dCI7CmltcG9ydCB7IHNpdGVDb25maWcgfSBmcm9tICJAL2xpYi9zZW8tY29uZmlnIjsKCmV4cG9ydCBjb25zdCBkeW5hbWljID0gImZvcmNlLXN0YXRpYyI7CgpleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBtYW5pZmVzdCgpOiBNZXRhZGF0YVJvdXRlLk1hbmlmZXN0IHsKICByZXR1cm4gewogICAgbmFtZTogc2l0ZUNvbmZpZy5uYW1lLAogICAgc2hvcnRfbmFtZTogc2l0ZUNvbmZpZy5uYW1lLAogICAgZGVzY3JpcHRpb246IHNpdGVDb25maWcuZGVzY3JpcHRpb24sCiAgICBzdGFydF91cmw6ICIvIiwKICAgIGRpc3BsYXk6ICJzdGFuZGFsb25lIiwKICAgIGJhY2tncm91bmRfY29sb3I6ICIjRkNGQkY3IiwKICAgIHRoZW1lX2NvbG9yOiAiIzZCMjczNyIsCiAgICBpY29uczogWwogICAgICB7CiAgICAgICAgc3JjOiAiL2Zhdmljb24uaWNvIiwKICAgICAgICBzaXplczogImFueSIsCiAgICAgICAgdHlwZTogImltYWdlL3gtaWNvbiIsCiAgICAgIH0sCiAgICBdLAogIH07Cn0K
'@
[System.IO.File]::WriteAllBytes("app\manifest.ts", [System.Convert]::FromBase64String($b64_4))
Write-Host "app/manifest.ts written"

# ===== 精准编辑 app/layout.tsx（只改metadata块，其余不动）=====
$layoutPath = "app\layout.tsx"
$content = Get-Content -Path $layoutPath -Raw

$oldImport = 'import Footer from "@/components/layout/Footer";'
$newImport = $oldImport + "`r`n" + 'import { siteConfig } from "@/lib/seo-config";'
$content = $content.Replace($oldImport, $newImport)

$oldMetadata = @'
export const metadata: Metadata = {
  title: "Meimi&H - Premium Furniture from Foshan",
  description: "High-end furniture direct from our Foshan atelier. Sofas, custom interiors, beds, dining and more. Est. 2020.",
};
'@

$newMetadata = @'
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

$content = $content.Replace($oldMetadata, $newMetadata)

$oldBodyTag = '<body className="min-h-screen bg-[#FCFBF7] text-stone-800 antialiased">'
$newBodyTag = @'
<body className="min-h-screen bg-[#FCFBF7] text-stone-800 antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
'@
$content = $content.Replace($oldBodyTag, $newBodyTag)

[System.IO.File]::WriteAllText($layoutPath, $content, (New-Object System.Text.UTF8Encoding $false))

if ($content -match "metadataBase" -and $content -match "organizationJsonLd") {
  Write-Host "layout.tsx 更新成功" -ForegroundColor Green
} else {
  Write-Host "警告：layout.tsx 替换可能没生效，请手动检查文件" -ForegroundColor Red
}