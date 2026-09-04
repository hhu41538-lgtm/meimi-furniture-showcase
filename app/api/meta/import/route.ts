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

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

const countryAliases: Record<string, string> = {
  china: "cn", 中国: "cn", 中国大陆: "cn", 内地: "cn", 大陆: "cn",
  america: "us", usa: "us", 美国: "us", unitedstates: "us",
  india: "in", 印度: "in", unitedkingdom: "gb", 英国: "gb",
  australia: "au", 澳大利亚: "au", singapore: "sg", 新加坡: "sg",
  hongkong: "hk", 香港: "hk", uae: "ae", 阿联酋: "ae", 迪拜: "ae",
  saudiarabia: "sa", 沙特: "sa",
};
const dialingCodes: Record<string, string> = { cn: "86", us: "1", gb: "44", in: "91", au: "61", sg: "65", hk: "852", ae: "971", sa: "966" };

function normalizeCountry(country: string) {
  const value = country.trim().toLowerCase().replace(/[\s._-]+/g, "");
  return countryAliases[value] ?? value;
}

function normalizePhone(country: string, phone: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  const code = dialingCodes[normalizeCountry(country)];
  if (code && digits.startsWith(code) && digits.length > code.length + 6) digits = digits.slice(code.length);
  return digits.replace(/^0+(?=\d{7,}$)/, "");
}

function normalizeOwnerKey(country: string, phone: string) {
  const normalizedCountry = normalizeCountry(country);
  const normalizedPhone = normalizePhone(country, phone);
  return normalizedCountry && normalizedPhone ? `${normalizedCountry}:${normalizedPhone}` : "";
}

type MetaLeadRow = { leadgen_id: string; raw_payload: Record<string, unknown> };
type MetaLeadDetails = { name?: unknown; phone?: unknown; country?: unknown; email?: unknown; company?: unknown; createdTime?: unknown };
type SalesAccountRow = { id: string; name: string };

export async function POST(request: Request) {
  const key = request.headers.get("x-meimi-admin-key")?.trim() ?? "";
  if (!key || (key !== FIXED_ADMIN_KEY && key !== process.env.MEIMI_ADMIN_SYNC_KEY?.trim())) {
    return errorResponse("需要管理员权限才能导入 Meta 线索", 401, "UNAUTHORIZED");
  }
  const url = databaseUrl();
  if (!url) return errorResponse("尚未配置云端数据库", 503, "DATABASE_NOT_CONFIGURED");
  try {
    const sql = neon<false, false>(url);
    const rows = await sql`SELECT leadgen_id, raw_payload FROM meimi_meta_leads WHERE status = 'details_ready' ORDER BY received_at ASC LIMIT 100` as unknown as MetaLeadRow[];
    const salesAccounts = await sql`SELECT id, name FROM meimi_staff_accounts WHERE role = 'sales' AND active = TRUE ORDER BY created_at ASC, id ASC` as unknown as SalesAccountRow[];
    const metaCountRows = await sql`SELECT COUNT(*)::int AS count FROM meimi_customer_owners WHERE record->>'leadSource' = 'meta'` as Array<{ count?: unknown }>;
    const existingMetaCount = Number(metaCountRows[0]?.count) || 0;
    const imported: Array<Record<string, unknown>> = [];
    let skipped = 0;
    let missingFields = 0;
    for (const row of rows) {
      const details = row.raw_payload?.details as MetaLeadDetails | undefined;
      const rawCountry = text(details?.country);
      const rawPhone = text(details?.phone);
      const country = normalizeCountry(rawCountry);
      const phone = normalizePhone(rawCountry, rawPhone);
      if (!country || !phone) {
        missingFields += 1;
        continue;
      }
      const ownerKey = normalizeOwnerKey(country, phone);
      const existing = await sql`SELECT record FROM meimi_customer_owners WHERE owner_key = ${ownerKey} LIMIT 1`;
      if (existing.length) {
        skipped += 1;
        await sql`UPDATE meimi_meta_leads SET status = 'imported_duplicate', updated_at = NOW() WHERE leadgen_id = ${row.leadgen_id}`;
        continue;
      }
      const now = new Date().toISOString();
      const assignee: SalesAccountRow | null = salesAccounts.length ? salesAccounts[(existingMetaCount + imported.length) % salesAccounts.length] : null;
      const record = {
        id: `${ownerKey}:meta:${row.leadgen_id}`,
        country: rawCountry,
        phone: rawPhone,
        client: text(details?.name),
        clientContact: text(details?.company) || text(details?.email),
        ownerAccountId: assignee?.id || "",
        owner: assignee?.name || "待分配",
        ownerContact: "",
        createdAt: now,
        updatedAt: now,
        tier: "B",
        followStatus: "new",
        leadSource: "meta",
        note: `Meta Lead Ads · ${row.leadgen_id}${text(details?.email) ? ` · ${text(details?.email)}` : ""}`,
        privateNote: "",
        nextFollowUpDate: "",
        quoteCount: 0,
        lastQuotedAt: "",
        lastQuoteNo: "",
        lastQuoteTotal: 0,
      };
      await sql`INSERT INTO meimi_customer_owners (owner_key, record) VALUES (${ownerKey}, ${JSON.stringify(record)}::jsonb)`;
      await sql`UPDATE meimi_meta_leads SET status = 'imported', updated_at = NOW() WHERE leadgen_id = ${row.leadgen_id}`;
      imported.push(record);
    }
    return NextResponse.json({ ok: true, imported, importedCount: imported.length, skipped, missingFields });
  } catch (error) {
    console.error("Meta lead import failed", error);
    return errorResponse("Meta 线索导入客户池失败", 503, "META_LEAD_IMPORT_FAILED");
  }
}
