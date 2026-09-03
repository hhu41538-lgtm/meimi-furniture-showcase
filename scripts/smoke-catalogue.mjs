const baseUrl = process.env.CATALOGUE_URL ?? "http://127.0.0.1:3000";
const routes = [
  "/app",
  "/app/",
  "/app?category=sleep",
  "/app?category=living",
  "/app?category=dining",
  "/app?category=storage",
  "/app?category=custom",
  "/app?category=outdoor",
  "/admin",
  "/app/products/bessel-sofa",
  "/app/products/bessel-sofa/",
  "/app/studio/riviere-bed",
  "/app/studio/riviere-bed/",
  "/app/studio/outdoor-modular-lounge",
  "/manifest.webmanifest",
  "/app-icon-192.png",
  "/app-icon-512.png",
  "/sw.js",
  "/offline.html",
  "/sitemap.xml",
  "/robots.txt",
];

const failures = [];

for (const route of routes) {
  try {
    const response = await fetch(`${baseUrl}${route}`);
    const body = await response.text();
    if (!response.ok) {
      failures.push(`${route}: HTTP ${response.status}`);
      continue;
    }
    if (route === "/manifest.webmanifest" && !body.includes('"start_url": "/app/"')) {
      failures.push(`${route}: missing /app/ start_url`);
    }
    if (route === "/manifest.webmanifest" && !/manifest\+json|application\/json/i.test(response.headers.get("content-type") ?? "")) {
      failures.push(`${route}: invalid content type`);
    }
    if (route === "/manifest.webmanifest") {
      try {
        const manifest = JSON.parse(body);
        if (manifest.lang !== "zh-CN" || manifest.display !== "standalone" || manifest.id !== "/app/" || manifest.scope !== "/app/") {
          failures.push(`${route}: invalid mobile app manifest settings`);
        }
        for (const icon of manifest.icons ?? []) {
          if (!body.includes(`"src": "${icon.src}"`)) failures.push(`${route}: icon missing from manifest`);
        }
      } catch {
        failures.push(`${route}: invalid JSON`);
      }
    }
    if (route === "/offline.html" && !body.includes("重新连接")) {
      failures.push(`${route}: offline fallback copy missing`);
    }
    if (route === "/sitemap.xml") {
      const productUrls = (body.match(/\/app\/products\//g) ?? []).length;
      const studioUrls = (body.match(/\/app\/studio\//g) ?? []).length;
      if (productUrls < 24 || studioUrls < 17 || !body.includes("https://www.meimifurniture.com/app</loc>")) {
        failures.push(`${route}: catalogue URL coverage is incomplete`);
      }
    }
    if (route === "/robots.txt" && (!body.includes("Allow: /") || !body.includes("/sitemap.xml"))) {
      failures.push(`${route}: catalogue crawl directives are incomplete`);
    }
    if (route === "/sw.js" && !body.includes("meimih-catalogue-v9")) {
      failures.push(`${route}: cache version mismatch`);
    }
    if (route === "/sw.js" && !/javascript/i.test(response.headers.get("content-type") ?? "")) {
      failures.push(`${route}: invalid content type`);
    }
    if (/^\/app-icon-\d+\.png$/.test(route) && !/image\/png/i.test(response.headers.get("content-type") ?? "")) {
      failures.push(`${route}: invalid content type`);
    }
    const isAppRoute = route === "/app" || route.startsWith("/app/") || route.startsWith("/app?");
    if (route === "/admin" && (!body.includes("产品资料工作台") || !body.includes("noindex"))) {
      failures.push(`${route}: admin login markers missing`);
    }
    if (isAppRoute && !body.includes("15355787546")) {
      failures.push(`${route}: domestic contact link missing`);
    }
    if (isAppRoute && /whatsapp|wa\.me/i.test(body)) {
      failures.push(`${route}: legacy WhatsApp contact found`);
    }
    console.log(`PASS ${route} (${response.status})`);
  } catch (error) {
    failures.push(`${route}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (failures.length) {
  console.error("Catalogue smoke check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`Catalogue smoke check passed for ${routes.length} routes.`);
}
