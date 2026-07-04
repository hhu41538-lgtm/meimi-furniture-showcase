# ---- about/page.tsx ----
$p1 = "app\about\page.tsx"
$c1 = Get-Content -Path $p1 -Raw
$c1 = 'import type { Metadata } from "next";' + "`r`n" + $c1
$anchor1 = 'import FadeIn from "@/components/ui/FadeIn";'
$block1 = @'
import FadeIn from "@/components/ui/FadeIn";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Discover the story behind Meimi&H - premium materials and master craftsmanship from our Foshan furniture atelier, creating refined living spaces since 2020.",
};
'@
$c1 = $c1.Replace($anchor1, $block1)
[System.IO.File]::WriteAllText($p1, $c1, (New-Object System.Text.UTF8Encoding $false))
if ($c1 -match "export const metadata") { Write-Host "about/page.tsx OK" -ForegroundColor Green } else { Write-Host "about/page.tsx FAILED" -ForegroundColor Red }

# ---- case-showcase/page.tsx ----
$p2 = "app\case-showcase\page.tsx"
$c2 = Get-Content -Path $p2 -Raw
$c2 = 'import type { Metadata } from "next";' + "`r`n" + $c2
$anchor2 = 'import FadeIn from "@/components/ui/FadeIn";'
$block2 = @'
import FadeIn from "@/components/ui/FadeIn";

export const metadata: Metadata = {
  title: "Case Studies",
  description:
    "Explore real-world interior projects and custom furniture case studies from Meimi&H, a premium furniture manufacturer based in Foshan, China.",
};
'@
$c2 = $c2.Replace($anchor2, $block2)
[System.IO.File]::WriteAllText($p2, $c2, (New-Object System.Text.UTF8Encoding $false))
if ($c2 -match "export const metadata") { Write-Host "case-showcase/page.tsx OK" -ForegroundColor Green } else { Write-Host "case-showcase/page.tsx FAILED" -ForegroundColor Red }

# ---- contact/page.tsx ----
$p3 = "app\contact\page.tsx"
$c3 = Get-Content -Path $p3 -Raw
$c3 = 'import type { Metadata } from "next";' + "`r`n" + $c3
$anchor3 = 'import FadeIn from "@/components/ui/FadeIn";'
$block3 = @'
import FadeIn from "@/components/ui/FadeIn";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Meimi&H via WhatsApp, TikTok, Instagram or Facebook. Foshan-based premium furniture manufacturer ready to help with your project.",
};
'@
$c3 = $c3.Replace($anchor3, $block3)
[System.IO.File]::WriteAllText($p3, $c3, (New-Object System.Text.UTF8Encoding $false))
if ($c3 -match "export const metadata") { Write-Host "contact/page.tsx OK" -ForegroundColor Green } else { Write-Host "contact/page.tsx FAILED" -ForegroundColor Red }

# ---- privacy/page.tsx (没有import行，直接在文件最前面插入) ----
$p4 = "app\privacy\page.tsx"
$c4 = Get-Content -Path $p4 -Raw
$prefix4 = @'
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read Meimi&H's privacy policy covering how we collect, use and protect your information as a Foshan-based furniture manufacturer.",
};

'@
$c4 = $prefix4 + $c4
[System.IO.File]::WriteAllText($p4, $c4, (New-Object System.Text.UTF8Encoding $false))
if ($c4 -match "export const metadata") { Write-Host "privacy/page.tsx OK" -ForegroundColor Green } else { Write-Host "privacy/page.tsx FAILED" -ForegroundColor Red }

# ---- products/page.tsx ----
$p5 = "app\products\page.tsx"
$c5 = Get-Content -Path $p5 -Raw
$c5 = 'import type { Metadata } from "next";' + "`r`n" + $c5
$anchor5 = 'import ProductsClient from "./ProductsClient";'
$block5 = @'
import ProductsClient from "./ProductsClient";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Browse Meimi&H's Ready-Made Collections, Custom Interiors and Handmade Mattresses - premium furniture crafted in our Foshan atelier.",
};
'@
$c5 = $c5.Replace($anchor5, $block5)
[System.IO.File]::WriteAllText($p5, $c5, (New-Object System.Text.UTF8Encoding $false))
if ($c5 -match "export const metadata") { Write-Host "products/page.tsx OK" -ForegroundColor Green } else { Write-Host "products/page.tsx FAILED" -ForegroundColor Red }

Write-Host "`n全部5个页面处理完毕，请运行 npm.cmd run build 验证" -ForegroundColor Cyan