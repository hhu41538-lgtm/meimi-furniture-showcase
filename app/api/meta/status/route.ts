import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

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
  if (url) {
    try {
      const sql = neon<false, false>(url);
      const rows = await sql`SELECT status, COUNT(*)::int AS count FROM meimi_meta_leads GROUP BY status`;
      for (const row of rows as Array<{ status?: unknown; count?: unknown }>) {
        if (row.status === "imported" || row.status === "imported_duplicate") imported += Number(row.count) || 0;
        else {
          pending += Number(row.count) || 0;
          if (row.status === "needs_mapping") needsMapping += Number(row.count) || 0;
        }
      }
    } catch {
      // The webhook creates this table lazily; configuration status remains useful before first delivery.
    }
  }
  return NextResponse.json({ ok: true, config, readyForWebhook: config.database && config.webhookVerifyToken, readyForRetrieval: config.database && config.pageAccessToken, pending, needsMapping, imported });
}
