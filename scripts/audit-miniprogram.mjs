import fs from "node:fs";
import path from "node:path";

const root = path.resolve("miniprogram");
const required = [
  "app.js",
  "app.json",
  "app.wxss",
  "project.config.json",
  "sitemap.json",
  "pages/index/index.js",
  "pages/index/index.json",
  "pages/index/index.wxml",
];
const failures = [];

for (const relative of required) {
  if (!fs.existsSync(path.join(root, relative))) failures.push(`missing ${relative}`);
}
for (const relative of ["app.json", "project.config.json", "sitemap.json", "pages/index/index.json"]) {
  try { JSON.parse(fs.readFileSync(path.join(root, relative), "utf8")); } catch { failures.push(`invalid JSON ${relative}`); }
}
const page = fs.readFileSync(path.join(root, "pages/index/index.js"), "utf8");
const template = fs.readFileSync(path.join(root, "pages/index/index.wxml"), "utf8");
if (!page.includes("https://www.meimifurniture.com/app/")) failures.push("web-view production URL missing");
if (!template.includes("web-view")) failures.push("index page must use web-view");

if (failures.length) {
  console.error("Mini program audit failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`Mini program audit passed (${required.length} files).`);
}
