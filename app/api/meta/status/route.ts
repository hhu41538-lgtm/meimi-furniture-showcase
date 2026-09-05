import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { ensureMetaTables } from "../processing";

export const dynamic = "force-dynamic";
export const runtime = "edge";

const FIXED_ADMIN_KEY = "2675982129";
const databaseUrl = () => [
  process.env.DATABASE_URL, process.env.POSTGRES_URL, process.env.POSTGRES_PRISMA_URL,
  process.env.POSTGRES_URL_NON_POOLING, process.env.POSTGRES_URL_NO_SSL,
  process.env.NEON_DATABASE_URL, process.env.NEON_DATABASE_URL_UNPOOLED,
].map((value) => value?.trim()).find(Boolean) ?? "";

function errorResponse(message: string, status: number, code: string) {
  return NextResponse.json({ ok: false, code, message }, { status });
}

export async function GET(request: Request) {
  const key = request.headers.get("x-meimi-admin-key")?.trim() ?? "";
  if (!key || (key !== FIXED_ADMIN_KEY && key !== process.env.MEIMI_ADMIN_SYNC_KEY?.trim())) {
    return errorResponse("需要管理员权限才能检查 Meta 接入配置", 401, "UNAUTHORIZED");
  }
  const url = databaseUrl();
  const config = {
    database: Boolean(url),
    webhookVerifyToken: Boolean(process.env.META_WEBHOOK_VERIFY_TOKEN?.trim()),
    appSecret: Boolean(process.env.META_APP_SECRET?.trim()),
    pageAccessToken: Boolean(process.env.META_PAGE_ACCESS_TOKEN?.trim()),
  };
  let pending = 0;
  let imported = 0;
  let needsMapping = 0;
  let readFailed = 0;
  let duplicates = 0;
  let databaseReachable = false;
  let latestReceivedAt: string | null = null;
  if (url) {
    try {
      const sql = neon<false, false>(url);
      await ensureMetaTables(sql);
      const rows = await sql`SELECT status, COUNT(*)::int AS count FROM meimi_meta_leads GROUP BY status`;
      const latestRows = await sql`SELECT MAX(received_at)::text AS latest_received_at FROM meimi_meta_leads`;
      latestReceivedAt = (latestRows[0] as { latest_received_at?: unknown } | undefined)?.latest_received_at as string || null;
      databaseReachable = true;
      for (const row of rows as Array<{ status?: unknown; count?: unknown }>) {
        if (row.status === "imported") imported += Number(row.count) || 0;
        else if (row.status === "imported_duplicate") duplicates += Number(row.count) || 0;
        else {
          pending += Number(row.count) || 0;
          if (row.status === "needs_mapping") needsMapping += Number(row.count) || 0;
          if (row.status === "read_failed") readFailed += Number(row.count) || 0;
        }
      }
    } catch {
      databaseReachable = false;
    }
  }
  return NextResponse.json({
    ok: true, config, databaseReachable,
    readyForWebhook: databaseReachable && config.webhookVerifyToken && config.appSecret && config.pageAccessToken,
    readyForRetrieval: databaseReachable && config.pageAccessToken,
    pending, needsMapping, readFailed, imported, duplicates, latestReceivedAt,
  });
}
