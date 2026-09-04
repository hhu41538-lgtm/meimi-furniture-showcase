import type { Metadata } from "next";
import { getProducts } from "@/lib/products";
import { studioItems } from "@/lib/catalogueStudio";
import { assignCatalogueProductCodes } from "@/lib/productCodes";
import AdminAuthGate from "./AdminAuthGate";
import { type ManagedEntry } from "./AdminConsole";

export const metadata: Metadata = {
  title: "产品资料工作台",
  manifest: "/admin/manifest.webmanifest",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  const entries = assignCatalogueProductCodes([
    ...getProducts().map((product) => {
      return {
        id: `product:${product.slug}`,
        type: "product" as const,
        slug: product.slug,
        factoryModel: "",
        pricingRuleId: "manual-review",
        basePrice: 0,
        stockStatus: "made-to-order" as const,
        warehouseLocation: "Catalogue warehouse",
        warehouseNote: "默认按图册定制口径，现货库存需管理员确认。",
        name: product.name,
        category: product.category,
        tagline: product.tagline,
        image: product.mainImage,
        visible: true,
      };
    }),
    ...studioItems.map((item) => {
      return {
        id: `studio:${item.slug}`,
        type: "studio" as const,
        slug: item.slug,
        factoryModel: "",
        pricingRuleId: "manual-review",
        basePrice: 0,
        stockStatus: "made-to-order" as const,
        warehouseLocation: "Catalogue warehouse",
        warehouseNote: "空间方案默认按项目定制口径，库存和组合需管理员确认。",
        name: item.name,
        category: item.category,
        tagline: item.tagline,
        image: item.image,
        visible: true,
      };
    }),
  ]) satisfies ManagedEntry[];

  return <AdminAuthGate initialEntries={entries} />;
}
