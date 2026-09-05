import type { NeonQueryFunction } from "@neondatabase/serverless";

type SqlClient = NeonQueryFunction<false, false>;
type LeadRow = { leadgen_id: string; page_id: string; form_id: string; ad_id: string; campaign_id: string; raw_payload: Record<string, unknown> };
type LeadDetails = { name: string; country: string; phone: string; email: string; company: string; fields: Record<string, string>; createdTime: string };

export const databaseUrl = () => [
  process.env.DATABASE_URL, process.env.POSTGRES_URL, process.env.POSTGRES_PRISMA_URL,
  process.env.POSTGRES_URL_NON_POOLING, process.env.POSTGRES_URL_NO_SSL,
  process.env.NEON_DATABASE_URL, process.env.NEON_DATABASE_URL_UNPOOLED,
].map((value) => value?.trim()).find(Boolean) ?? "";

export function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function ensureMetaTables(sql: SqlClient) {
  await sql`CREATE TABLE IF NOT EXISTS meimi_meta_leads (
    leadgen_id TEXT PRIMARY KEY, page_id TEXT NOT NULL, form_id TEXT, ad_id TEXT,
    adset_id TEXT, campaign_id TEXT, created_time TEXT, raw_payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'received', received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS meimi_customer_owners (
    owner_key TEXT PRIMARY KEY, record JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
}

async function graphLead(leadId: string, token: string, version: string): Promise<LeadDetails> {
  const endpoint = new URL(`https://graph.facebook.com/${version}/${encodeURIComponent(leadId)}`);
  endpoint.searchParams.set("fields", "id,created_time,field_data");
  const response = await fetch(endpoint, {
    headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(6000),
  });
  const payload = await response.json() as { id?: unknown; created_time?: unknown; field_data?: unknown; error?: { code?: number } };
  if (!response.ok || payload.error) throw new Error(`META_READ_FAILED_${payload.error?.code ?? response.status}`);
  if (text(payload.id) !== leadId || !Array.isArray(payload.field_data)) throw new Error("META_INVALID_LEAD");
  const fields: Record<string, string> = {};
  for (const field of payload.field_data as Array<{ name?: unknown; values?: unknown }>) {
    const name = text(field?.name).toLowerCase();
    if (name && Array.isArray(field.values)) fields[name] = field.values.map(text).filter(Boolean).join(", ");
  }
  const pick = (...names: string[]) => names.map((name) => fields[name]).find(Boolean) ?? "";
  return {
    createdTime: text(payload.created_time), fields,
    name: pick("full_name", "name", "姓名", "客户姓名") || [pick("first_name"), pick("last_name")].filter(Boolean).join(" "),
    phone: pick("phone_number", "phone", "mobile", "电话", "手机号"),
    email: pick("email", "邮箱", "e-mail"), country: pick("country", "国家", "地区"),
    company: pick("company", "company_name", "公司", "公司名称"),
  };
}

export async function readMetaLeads(sql: SqlClient, leadIds: string[] | null = null) {
  await ensureMetaTables(sql);
  const token = process.env.META_PAGE_ACCESS_TOKEN?.trim();
  if (!token) throw new Error("META_TOKEN_NOT_CONFIGURED");
  const version = (process.env.META_GRAPH_API_VERSION?.trim() || "v24.0").replace(/^v?/, "v");
  if (!/^v\d+\.\d+$/.test(version)) throw new Error("META_VERSION_INVALID");
  // Bound each delivery so Meta can retry a retained inbox batch after a timeout.
  const rows = await sql`SELECT * FROM meimi_meta_leads
    WHERE status IN ('received', 'read_failed')
      AND (${leadIds}::text[] IS NULL OR leadgen_id = ANY(${leadIds}::text[]))
    ORDER BY received_at ASC, leadgen_id ASC LIMIT 10` as LeadRow[];
  let fetched = 0;
  let failed = 0;
  for (let offset = 0; offset < rows.length; offset += 4) {
    await Promise.all(rows.slice(offset, offset + 4).map(async (row) => {
      try {
        const details = await graphLead(row.leadgen_id, token, version);
        const updated = await sql`UPDATE meimi_meta_leads
          SET raw_payload = (raw_payload - 'readError') || ${JSON.stringify({ details })}::jsonb,
              status = 'details_ready', updated_at = NOW()
          WHERE leadgen_id = ${row.leadgen_id} AND status IN ('received', 'read_failed') RETURNING leadgen_id`;
        fetched += updated.length;
      } catch (error) {
        failed += 1;
        const readError = error instanceof Error && /^META_/.test(error.message) ? error.message : "META_READ_UNAVAILABLE";
        await sql`UPDATE meimi_meta_leads SET status = 'read_failed',
          raw_payload = raw_payload || ${JSON.stringify({ readError })}::jsonb, updated_at = NOW()
          WHERE leadgen_id = ${row.leadgen_id} AND status IN ('received', 'read_failed')`;
      }
    }));
  }
  const remaining = await countUnreadLeads(sql, leadIds);
  return { fetched, failed, remaining };
}

export async function countUnreadLeads(sql: SqlClient, leadIds: string[] | null = null) {
  const rows = await sql`SELECT COUNT(*)::int AS count FROM meimi_meta_leads
    WHERE status IN ('received', 'read_failed')
      AND (${leadIds}::text[] IS NULL OR leadgen_id = ANY(${leadIds}::text[]))`;
  return Number(rows[0]?.count) || 0;
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

function ownerKey(country: string, phone: string) {
  const countryText = country.toLowerCase().replace(/[\s._-]+/g, "");
  const countryCode = countryAliases[countryText] ?? countryText;
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  const dialingCode = dialingCodes[countryCode];
  if (dialingCode && digits.startsWith(dialingCode) && digits.length > dialingCode.length + 6) digits = digits.slice(dialingCode.length);
  digits = digits.replace(/^0+(?=\d{7,}$)/, "");
  return countryCode && digits ? `${countryCode}:${digits}` : "";
}

export async function importMetaLeads(sql: SqlClient, leadIds: string[] | null = null) {
  await ensureMetaTables(sql);
  const rows = await sql`SELECT * FROM meimi_meta_leads WHERE status = 'details_ready'
    AND (${leadIds}::text[] IS NULL OR leadgen_id = ANY(${leadIds}::text[]))
    ORDER BY received_at ASC, leadgen_id ASC LIMIT 100` as LeadRow[];
  const imported: Array<Record<string, unknown>> = [];
  let skipped = 0;
  let missingFields = 0;
  for (const row of rows) {
    const details = row.raw_payload?.details as Partial<LeadDetails> | undefined;
    const country = text(details?.country);
    const phone = text(details?.phone);
    const key = ownerKey(country, phone);
    if (!key) {
      const updated = await sql`UPDATE meimi_meta_leads SET status = 'needs_mapping', updated_at = NOW()
        WHERE leadgen_id = ${row.leadgen_id} AND status = 'details_ready' RETURNING leadgen_id`;
      missingFields += updated.length;
      continue;
    }
    const now = new Date().toISOString();
    const record = {
      id: `${key}:meta:${row.leadgen_id}`, country, phone, client: text(details?.name),
      clientContact: text(details?.company) || text(details?.email),
      ownerAccountId: "", owner: "待分配", ownerContact: "", createdAt: now, updatedAt: now,
      tier: "B", followStatus: "new", leadSource: "meta",
      note: `Meta Lead Ads · ${row.leadgen_id}${text(details?.email) ? ` · ${text(details?.email)}` : ""}`,
      privateNote: "", nextFollowUpDate: "", quoteCount: 0, lastQuotedAt: "", lastQuoteNo: "", lastQuoteTotal: 0,
      metaLeadId: row.leadgen_id, metaFormId: row.form_id || "", metaAdId: row.ad_id || "",
      metaCampaignId: row.campaign_id || "", metaFields: details?.fields ?? {},
    };
    // Customer creation and inbox acknowledgement commit together. Existing owners win.
    const updated = await sql`WITH inserted AS (
      INSERT INTO meimi_customer_owners (owner_key, record)
      VALUES (${key}, ${JSON.stringify(record)}::jsonb)
      ON CONFLICT (owner_key) DO NOTHING RETURNING owner_key
    ) UPDATE meimi_meta_leads SET
      status = CASE WHEN EXISTS (SELECT 1 FROM inserted) THEN 'imported' ELSE 'imported_duplicate' END,
      updated_at = NOW()
      WHERE leadgen_id = ${row.leadgen_id} AND status = 'details_ready' RETURNING status`;
    if (updated[0]?.status === "imported") imported.push(record);
    else if (updated[0]?.status === "imported_duplicate") skipped += 1;
  }
  return { imported, importedCount: imported.length, skipped, missingFields };
}
