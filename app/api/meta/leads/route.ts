import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "edge";

const FIXED_ADMIN_KEY = "2675982129";
type StoredLead = { leadgen_id: string; page_id: string; form_id: string | null; raw_payload: Record<string, unknown>; status: string };
type MetaField = { name?: unknown; values?: unknown };

const databaseUrl = () => [
  process.env.DATABASE_URL, process.env.POSTGRES_URL, process.env.POSTGRES_PRISMA_URL,
  process.env.POSTGRES_URL_NON_POOLING, process.env.POSTGRES_URL_NO_SSL,
  process.env.NEON_DATABASE_URL, process.env.NEON_DATABASE_URL_UNPOOLED,
].map((value) => value?.trim()).find(Boolean) ?? "";

function errorResponse(message: string, status: number, code: string) {
  return NextResponse.json({ ok: false, code, message }, { status });
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function fieldMap(value: unknown) {
  const map: Record<string, string> = {};
  if (!Array.isArray(value)) return map;
  for (const field of value as MetaField[]) {
    const name = text(field?.name).toLowerCase();
    const values = Array.isArray(field?.values) ? field.values : [];
    if (name && values.length) map[name] = text(values[0]);
  }
  return map;
}

function pick(fields: Record<string, string>, names: string[]) {
  return names.map((name) => fields[name]).find(Boolean) ?? "";
}

async function graphLead(leadgenId: string, token: string, version: string) {
  const endpoint = new URL(`https://graph.facebook.com/${version}/${encodeURIComponent(leadgenId)}`);
  endpoint.searchParams.set("fields", "created_time,field_data,id");
  endpoint.searchParams.set("access_token", token);
  const response = await fetch(endpoint, { cache: "no-store" });
  const payload = await response.json().catch(() => ({})) as { id?: unknown; created_time?: unknown; field_data?: unknown; error?: { message?: unknown } };
  if (!response.ok || payload.error) throw new Error(text(payload.error?.message) || "Meta 线索读取失败");
  const fields = fieldMap(payload.field_data);
  return {
    leadgenId,
    createdTime: text(payload.created_time),
    fields,
    name: pick(fields, ["full_name", "name", "姓名", "客户姓名"]),
    phone: pick(fields, ["phone_number", "phone", "mobile", "电话", "手机号"]),
    email: pick(fields, ["email", "邮箱", "e-mail"]),
    country: pick(fields, ["country", "国家", "地区"]),
    company: pick(fields, ["company", "company_name", "公司", "公司名称"]),
  };
}

async function authorizeAdmin(key: string) {
  return Boolean(key && (key === FIXED_ADMIN_KEY || key === process.env.MEIMI_ADMIN_SYNC_KEY?.trim()));
}

export async function POST(request: Request) {
  const key = request.headers.get("x-meimi-admin-key")?.trim() ?? "";
  if (!(await authorizeAdmin(key))) return errorResponse("需要管理员权限才能读取 Meta 线索", 401, "UNAUTHORIZED");
  const url = databaseUrl();
  const token = process.env.META_PAGE_ACCESS_TOKEN?.trim();
  if (!url) return errorResponse("尚未配置云端数据库", 503, "DATABASE_NOT_CONFIGURED");
  if (!token) return errorResponse("尚未配置 Meta Page Access Token", 503, "META_TOKEN_NOT_CONFIGURED");
  const version = (process.env.META_GRAPH_API_VERSION?.trim() || "v24.0").replace(/^v?/, "v");
  try {
    const sql = neon<false, false>(url);
    const rows = await sql`SELECT leadgen_id, page_id, form_id, raw_payload, status FROM meimi_meta_leads WHERE status <> 'imported' ORDER BY received_at ASC LIMIT 50` as unknown as StoredLead[];
    const leads = [];
    let failed = 0;
    for (const row of rows) {
      try {
        const details = await graphLead(row.leadgen_id, token, version);
        await sql`UPDATE meimi_meta_leads SET raw_payload = raw_payload || ${JSON.stringify({ details })}::jsonb, status = 'details_ready', updated_at = NOW() WHERE leadgen_id = ${row.leadgen_id}`;
        leads.push({ ...details, pageId: row.page_id, formId: row.form_id || "" });
      } catch (error) {
        failed += 1;
        await sql`UPDATE meimi_meta_leads SET status = 'read_failed', raw_payload = raw_payload || ${JSON.stringify({ readError: error instanceof Error ? error.message : "Meta 线索读取失败" })}::jsonb, updated_at = NOW() WHERE leadgen_id = ${row.leadgen_id}`;
      }
    }
    return NextResponse.json({ ok: true, fetched: leads.length, failed, remaining: Math.max(0, rows.length - leads.length - failed), leads });
  } catch (error) {
    console.error("Meta lead retrieval failed", error);
    return errorResponse("Meta 线索读取失败，请检查应用权限和 Page Access Token", 503, "META_LEAD_RETRIEVAL_FAILED");
  }
}
