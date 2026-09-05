import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { ensureMetaTables, importMetaLeads } from "../processing";

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

function authorized(request: Request) {
  const key = request.headers.get("x-meimi-admin-key")?.trim() ?? "";
  return Boolean(key && (key === FIXED_ADMIN_KEY || key === process.env.MEIMI_ADMIN_SYNC_KEY?.trim()));
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET(request: Request) {
  if (!authorized(request)) return errorResponse("需要管理员权限才能查看待补字段线索", 401, "UNAUTHORIZED");
  const url = databaseUrl();
  if (!url) return errorResponse("尚未配置云端数据库", 503, "DATABASE_NOT_CONFIGURED");
  try {
    const sql = neon<false, false>(url);
    await ensureMetaTables(sql);
    const rows = await sql`SELECT leadgen_id, raw_payload FROM meimi_meta_leads WHERE status = 'needs_mapping' ORDER BY received_at ASC LIMIT 100`;
    const leads = (rows as Array<{ leadgen_id?: unknown; raw_payload?: unknown }>).map((row) => {
      const payload = row.raw_payload && typeof row.raw_payload === "object" ? row.raw_payload as { details?: unknown } : {};
      const details = payload.details && typeof payload.details === "object" ? payload.details as Record<string, unknown> : {};
      return {
        leadgenId: text(row.leadgen_id),
        name: text(details.name),
        country: text(details.country),
        phone: text(details.phone),
        email: text(details.email),
        company: text(details.company),
      };
    });
    return NextResponse.json({ ok: true, leads });
  } catch (error) {
    console.error("Meta pending leads read failed", error);
    return errorResponse("待补字段线索读取失败", 503, "META_PENDING_READ_FAILED");
  }
}

export async function PATCH(request: Request) {
  if (!authorized(request)) return errorResponse("需要管理员权限才能修改 Meta 线索", 401, "UNAUTHORIZED");
  const url = databaseUrl();
  if (!url) return errorResponse("尚未配置云端数据库", 503, "DATABASE_NOT_CONFIGURED");
  let body: { leadgenId?: unknown; country?: unknown; phone?: unknown };
  try { body = await request.json() as typeof body; } catch { return errorResponse("请求格式不正确", 400, "INVALID_JSON"); }
  const leadgenId = text(body.leadgenId);
  const country = text(body.country);
  const phone = text(body.phone);
  if (!leadgenId || leadgenId.length > 200 || !country || country.length > 100 || !/\d/.test(phone) || phone.length > 100) {
    return errorResponse("请补充有效的国家和电话", 400, "MISSING_LEAD_FIELDS");
  }
  try {
    const sql = neon<false, false>(url);
    await ensureMetaTables(sql);
    const rows = await sql`SELECT raw_payload, status FROM meimi_meta_leads WHERE leadgen_id = ${leadgenId} LIMIT 1`;
    if (!rows.length) return errorResponse("找不到这条 Meta 线索", 404, "META_LEAD_NOT_FOUND");
    if (rows[0].status !== "needs_mapping") return errorResponse("这条线索已处理，请刷新列表", 409, "META_LEAD_ALREADY_PROCESSED");
    const payload = rows[0].raw_payload && typeof rows[0].raw_payload === "object" ? rows[0].raw_payload as { details?: unknown } : {};
    const details = payload.details && typeof payload.details === "object" ? payload.details as Record<string, unknown> : {};
    const nextPayload = { ...payload, details: { ...details, country, phone } };
    const updated = await sql`UPDATE meimi_meta_leads SET raw_payload = ${JSON.stringify(nextPayload)}::jsonb, status = 'details_ready', updated_at = NOW()
      WHERE leadgen_id = ${leadgenId} AND status = 'needs_mapping' RETURNING leadgen_id`;
    if (!updated.length) return errorResponse("这条线索已处理，请刷新列表", 409, "META_LEAD_ALREADY_PROCESSED");
    const result = await importMetaLeads(sql, [leadgenId]);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("Meta pending lead update failed", error);
    return errorResponse("Meta 线索字段更新失败", 503, "META_PENDING_UPDATE_FAILED");
  }
}
