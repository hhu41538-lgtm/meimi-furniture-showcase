import fs from "fs";
import path from "path";

const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);
const FALLBACK = "/images/Other/fallback.jpg";

function collectImageFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) {
    return [];
  }
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return collectImageFiles(fullPath);
    }
    if (entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase())) {
      return [fullPath];
    }
    return [];
  });
}

function toPublicPath(absolutePath: string) {
  const publicRoot = path.join(process.cwd(), "public");
  const relativePath = path.relative(publicRoot, absolutePath);
  return `/${relativePath.split(path.sep).join("/")}`;
}

export function getFolderImagePaths(folderName: string) {
  const folderPath = path.join(process.cwd(), "public", "images", folderName);
  return collectImageFiles(folderPath).map(toPublicPath);
}

export function getRepresentativeImage(folderName: string, fallbackPath = FALLBACK) {
  const images = getFolderImagePaths(folderName);
  return images[0] ?? fallbackPath;
}

export function getDistributedImages(folderName: string, count: number, fallbackPath = FALLBACK) {
  const images = getFolderImagePaths(folderName);
  if (images.length === 0) {
    return Array.from({ length: count }, () => fallbackPath);
  }
  return Array.from({ length: count }, (_, index) => images[index % images.length] ?? fallbackPath);
}

// --- Product (sofa) helpers for the "explore by space" subfolders ---

function leadingNumber(filename: string): number {
  const base = filename.replace(/\.[^.]+$/, "");
  const match = base.match(/\d+/);
  return match ? parseInt(match[0], 10) : Number.MAX_SAFE_INTEGER;
}

export type ProductImages = {
  mainImage: string;
  detailImages: string[];
};

export function getProductImages(subfolder: string, fallbackPath = FALLBACK): ProductImages {
  const folderPath = path.join(process.cwd(), "public", "images", "explore by space", subfolder);
  if (!fs.existsSync(folderPath)) {
    return { mainImage: fallbackPath, detailImages: [] };
  }
  const files = fs
    .readdirSync(folderPath, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase())
    )
    .map((entry) => entry.name);

  const mainName = files.find((name) => /new arrivals/i.test(name));
  const detailNames = files
    .filter((name) => !/new arrivals/i.test(name))
    .sort((a, b) => leadingNumber(a) - leadingNumber(b));

  const toPath = (name: string) => toPublicPath(path.join(folderPath, name));

  const mainImage = mainName
    ? toPath(mainName)
    : detailNames[0]
    ? toPath(detailNames[0])
    : fallbackPath;

  return {
    mainImage,
    detailImages: detailNames.map(toPath),
  };
}
