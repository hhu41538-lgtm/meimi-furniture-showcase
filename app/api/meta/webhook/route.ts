import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "edge";

type SqlClient = NeonQueryFunction<false, false>;
type MetaLeadEvent = {
  leadgenId: string;
  pageId: string;
  formId: string;
  adId: string;
  adsetId: string;
  campaignId: string;
  createdTime: string;
  raw: Record<string, unknown>;
};

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

function parseLeadEvents(value: unknown): MetaLeadEvent[] {
  if (!value || typeof value !== "object") return [];
  const body = value as { object?: unknown; entry?: unknown };
  if (body.object !== "page" || !Array.isArray(body.entry)) return [];
  const events: MetaLeadEvent[] = [];
  for (const entry of body.entry) {
    if (!entry || typeof entry !== "object") continue;
    const pageId = text((entry as { id?: unknown }).id);
    const changes = (entry as { changes?: unknown }).changes;
    if (!Array.isArray(changes)) continue;
    for (const change of changes) {
      if (!change || typeof change !== "object") continue;
      const item = (change as { field?: unknown; value?: unknown });
      if (item.field !== "leadgen" || !item.value || typeof item.value !== "object") continue;
      const lead = item.value as Record<string, unknown>;
      const leadgenId = text(lead.leadgen_id);
      if (!leadgenId || !pageId) continue;
      events.push({
        leadgenId,
        pageId,
        formId: text(lead.form_id),
        adId: text(lead.ad_id),
        adsetId: text(lead.adset_id),
        campaignId: text(lead.campaign_id),
        createdTime: text(lead.created_time),
        raw: { field: item.field, value: lead },
      });
    }
  }
  return events;
}

async function hasValidSignature(body: string, signature: string | null) {
  const secret = process.env.META_APP_SECRET?.trim();
  if (!secret) return true;
  if (!signature?.startsWith("sha256=")) return false;
  const expectedKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign("HMAC", expectedKey, new TextEncoder().encode(body));
  const expected = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  const received = signature.slice("sha256=".length).toLowerCase();
  return received.length === expected.length && received.split("").every((character, index) => character === expected[index]);
}

async function ensureTable(sql: SqlClient) {
  await sql`
    CREATE TABLE IF NOT EXISTS meimi_meta_leads (
      leadgen_id TEXT PRIMARY KEY,
      page_id TEXT NOT NULL,
      form_id TEXT,
      ad_id TEXT,
      adset_id TEXT,
      campaign_id TEXT,
      created_time TEXT,
      raw_payload JSONB NOT NULL,
      status TEXT NOT NULL DEFAULT 'received',
      received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const expected = process.env.META_WEBHOOK_VERIFY_TOKEN?.trim();
  if (!expected) return errorResponse("尚未配置 Meta Webhook 验证令牌", 503, "META_WEBHOOK_NOT_CONFIGURED");
  if (mode === "subscribe" && token === expected && challenge) return new Response(challenge, { status: 200 });
  return errorResponse("Meta Webhook 验证失败", 403, "META_WEBHOOK_VERIFY_FAILED");
}

export async function POST(request: Request) {
  const url = databaseUrl();
  if (!url) return errorResponse("尚未配置云端数据库", 503, "DATABASE_NOT_CONFIGURED");
  const body = await request.text();
  if (!(await hasValidSignature(body, request.headers.get("x-hub-signature-256")))) {
    return errorResponse("Meta Webhook 签名校验失败", 403, "META_WEBHOOK_SIGNATURE_INVALID");
  }
  let payload: unknown;
  try { payload = JSON.parse(body) as unknown; } catch { return errorResponse("Meta Webhook 请求格式不正确", 400, "INVALID_JSON"); }
  const events = parseLeadEvents(payload);
  if (!events.length) return NextResponse.json({ ok: true, accepted: 0 });
  try {
    const sql = neon<false, false>(url);
    await ensureTable(sql);
    for (const event of events) {
      await sql`
        INSERT INTO meimi_meta_leads (leadgen_id, page_id, form_id, ad_id, adset_id, campaign_id, created_time, raw_payload)
        VALUES (${event.leadgenId}, ${event.pageId}, ${event.formId || null}, ${event.adId || null}, ${event.adsetId || null}, ${event.campaignId || null}, ${event.createdTime || null}, ${JSON.stringify(event.raw)}::jsonb)
        ON CONFLICT (leadgen_id) DO UPDATE SET raw_payload = EXCLUDED.raw_payload, updated_at = NOW()
      `;
    }
    return NextResponse.json({ ok: true, accepted: events.length });
  } catch (error) {
    console.error("Meta lead webhook failed", error);
    return errorResponse("Meta 线索已接收但云端写入失败", 503, "META_LEAD_STORAGE_FAILED");
  }
}
