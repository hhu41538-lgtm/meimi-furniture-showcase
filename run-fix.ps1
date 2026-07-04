# ===== public/robots.txt =====
$robots = @"
User-agent: *
Allow: /

Sitemap: https://meimi-furniture-showcase.vercel.app/sitemap.xml
"@
[System.IO.File]::WriteAllText("public\robots.txt", $robots, (New-Object System.Text.UTF8Encoding $false))
Write-Host "public/robots.txt written" -ForegroundColor Green

# ===== public/sitemap.xml =====
$today = Get-Date -Format "yyyy-MM-dd"
$sitemap = @"
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://meimi-furniture-showcase.vercel.app/</loc>
    <lastmod>$today</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://meimi-furniture-showcase.vercel.app/about</loc>
    <lastmod>$today</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://meimi-furniture-showcase.vercel.app/case-showcase</loc>
    <lastmod>$today</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://meimi-furniture-showcase.vercel.app/contact</loc>
    <lastmod>$today</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://meimi-furniture-showcase.vercel.app/products</loc>
    <lastmod>$today</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://meimi-furniture-showcase.vercel.app/privacy</loc>
    <lastmod>$today</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>
"@
[System.IO.File]::WriteAllText("public\sitemap.xml", $sitemap, (New-Object System.Text.UTF8Encoding $false))
Write-Host "public/sitemap.xml written" -ForegroundColor Green

# ===== public/manifest.webmanifest =====
$manifest = @"
{
  "name": "Meimi&H",
  "short_name": "Meimi&H",
  "description": "High-end furniture direct from our Foshan atelier. Sofas, custom interiors, beds, dining and more. Est. 2020.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FCFBF7",
  "theme_color": "#6B2737",
  "icons": [
    {
      "src": "/favicon.ico",
      "sizes": "any",
      "type": "image/x-icon"
    }
  ]
}
"@
[System.IO.File]::WriteAllText("public\manifest.webmanifest", $manifest, (New-Object System.Text.UTF8Encoding $false))
Write-Host "public/manifest.webmanifest written" -ForegroundColor Green

Write-Host "`n三个静态文件已写入 public 目录，请运行 npm.cmd run build 验证" -ForegroundColor Cyan