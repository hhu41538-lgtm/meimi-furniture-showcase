import fs from "fs";
import path from "path";

const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

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

export function getRepresentativeImage(folderName: string, fallbackPath = "/images/Other/观景01.jpg") {
  const images = getFolderImagePaths(folderName);

  return images[0] ?? fallbackPath;
}

export function getDistributedImages(folderName: string, count: number, fallbackPath = "/images/Other/观景01.jpg") {
  const images = getFolderImagePaths(folderName);

  if (images.length === 0) {
    return Array.from({ length: count }, () => fallbackPath);
  }

  return Array.from({ length: count }, (_, index) => images[index % images.length] ?? fallbackPath);
}
