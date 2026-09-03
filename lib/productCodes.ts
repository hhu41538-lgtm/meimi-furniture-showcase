type CodeableItem = {
  category: string;
  name: string;
  type?: "product" | "studio";
};

const categoryPrefixes: Record<string, string> = {
  sofa: "SF",
  dining: "DT",
  mattress: "MT",
  outdoor: "OD",
  studio: "ST",
};

export function productCodePrefix(item: CodeableItem) {
  const normalized = `${item.category} ${item.name}`.toLowerCase();
  if (normalized.includes("coffee")) return "CT";
  if (normalized.includes("chair")) return "AC";
  if (normalized.includes("bed")) return "BD";
  if (normalized.includes("cabinet")) return "CB";
  return categoryPrefixes[item.category] ?? (item.type === "studio" ? "ST" : "PR");
}

export function assignCatalogueProductCodes<T extends CodeableItem>(items: T[]) {
  const counters: Record<string, number> = {};
  return items.map((item) => {
    const prefix = productCodePrefix(item);
    counters[prefix] = (counters[prefix] ?? 0) + 1;
    return {
      ...item,
      productCode: `MH-${prefix}-${String(counters[prefix]).padStart(3, "0")}`,
    };
  });
}
