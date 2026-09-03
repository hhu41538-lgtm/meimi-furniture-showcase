import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const checks = [
  { source: "lib/products.ts", output: "out/app/products" },
  { source: "lib/catalogueStudio.ts", output: "out/app/studio" },
];
const failures = [];
const sitemap = fs.readFileSync(path.join(root, "public/sitemap.xml"), "utf8");

for (const check of checks) {
  const source = fs.readFileSync(path.join(root, check.source), "utf8");
  const slugs = [...source.matchAll(/slug:\s*"([^"]+)"/g)].map((match) => match[1]);
  const missing = slugs.filter((slug) => {
    const direct = path.join(root, check.output, `${slug}.html`);
    const directory = path.join(root, check.output, slug, "index.html");
    return !fs.existsSync(direct) && !fs.existsSync(directory);
  });
  const sitemapPrefix = check.output.endsWith("/products") ? "/app/products/" : "/app/studio/";
  const missingFromSitemap = slugs.filter((slug) => !sitemap.includes(`${sitemapPrefix}${slug}`));
  console.log(`${check.source}: ${slugs.length} source pages, ${slugs.length - missing.length} exported pages`);
  missing.forEach((slug) => failures.push(`${check.output}/${slug}.html`));
  missingFromSitemap.forEach((slug) => failures.push(`public/sitemap.xml (${sitemapPrefix}${slug})`));
}

const staticNotFound = path.join(root, "out", "404.html");
if (!fs.existsSync(staticNotFound)) {
  failures.push("out/404.html");
} else {
  const notFoundHtml = fs.readFileSync(staticNotFound, "utf8");
  if (!notFoundHtml.includes("15355787546") || !notFoundHtml.includes("/app")) {
    failures.push("out/404.html (missing catalogue recovery links)");
  }
}

if (failures.length) {
  console.error("Catalogue export audit failed:");
  failures.forEach((file) => console.error(`- ${file}`));
  process.exitCode = 1;
} else {
  console.log("All catalogue product and studio pages are exported.");
}
