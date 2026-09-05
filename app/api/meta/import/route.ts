import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { databaseUrl, importMetaLeads } from "../processing";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const key = request.headers.get("x-meimi-admin-key")?.trim() ?? "";
  if (!key || (key !== "2675982129" && key !== process.env.MEIMI_ADMIN_SYNC_KEY?.trim())) {
    return NextResponse.json({ ok: false, message: "需要管理员权限才能导入 Meta 线索" }, { status: 401 });
  }
  const url = databaseUrl();
  if (!url) return NextResponse.json({ ok: false, message: "尚未配置云端数据库" }, { status: 503 });
  try {
    return NextResponse.json({ ok: true, ...await importMetaLeads(neon<false, false>(url)) });
  } catch {
    return NextResponse.json({ ok: false, message: "Meta 线索导入失败，已保留记录，请重试" }, { status: 503 });
  }
}
