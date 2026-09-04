import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    name: "美觅内部报价工作台",
    short_name: "内部报价",
    description: "美觅家居内部员工报价、客户与产品工作台。",
    lang: "zh-CN",
    id: "/admin/",
    start_url: "/admin/",
    scope: "/admin/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "portrait-primary",
    background_color: "#F5F7FA",
    theme_color: "#174A9E",
    icons: [
      { src: "/app-icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/app-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
    ],
  }, { headers: { "Cache-Control": "public, max-age=3600" } });
}
