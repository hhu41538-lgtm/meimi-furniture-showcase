import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { databaseUrl, readMetaLeads } from "../processing";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const key = request.headers.get("x-meimi-admin-key")?.trim() ?? "";
  if (!key || (key !== "2675982129" && key !== process.env.MEIMI_ADMIN_SYNC_KEY?.trim())) {
    return NextResponse.json({ ok: false, message: "需要管理员权限才能读取 Meta 线索" }, { status: 401 });
  }
  const url = databaseUrl();
  if (!url) return NextResponse.json({ ok: false, message: "尚未配置云端数据库" }, { status: 503 });
  if (!process.env.META_PAGE_ACCESS_TOKEN?.trim()) return NextResponse.json({ ok: false, message: "尚未配置 Meta 主页授权令牌" }, { status: 503 });
  try {
    return NextResponse.json({ ok: true, ...await readMetaLeads(neon<false, false>(url)) });
  } catch {
    return NextResponse.json({ ok: false, message: "Meta 线索读取失败，请检查授权后重试" }, { status: 503 });
  }
}
