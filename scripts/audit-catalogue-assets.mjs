import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourceRoots = ["app", "components", "lib"];
const extensions = new Set([".ts", ".tsx", ".js", ".jsx"]);
const imageReference = /["'`](\/images\/[^"'`\s]+)["'`]/g;
const references = new Map();

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(absolute);
    return extensions.has(path.extname(entry.name).toLowerCase()) ? [absolute] : [];
  });
}

for (const sourceRoot of sourceRoots) {
  for (const file of walk(path.join(root, sourceRoot))) {
    const source = fs.readFileSync(file, "utf8");
    for (const match of source.matchAll(imageReference)) {
      const reference = match[1];
      const list = references.get(reference) ?? [];
      list.push(path.relative(root, file));
      references.set(reference, list);
    }
  }
}

const missing = [...references.entries()].filter(([reference]) => {
  const relative = decodeURIComponent(reference.slice(1)).replaceAll("/", path.sep);
  return !fs.existsSync(path.join(root, "public", relative));
});

console.log(`Checked ${references.size} unique image references across ${sourceRoots.length} source roots.`);
if (missing.length) {
  console.error(`Missing ${missing.length} image references:`);
  for (const [reference, files] of missing) {
    console.error(`- ${reference} (${files.join(", ")})`);
  }
  process.exitCode = 1;
} else {
  console.log("All referenced catalogue images exist.");
}
