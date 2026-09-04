import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "edge";

const FIXED_ADMIN_KEY = "2675982129";
type SqlClient = NeonQueryFunction<false, false>;

const databaseUrl = () => [
  process.env.DATABASE_URL, process.env.POSTGRES_URL, process.env.POSTGRES_PRISMA_URL,
  process.env.POSTGRES_URL_NON_POOLING, process.env.POSTGRES_URL_NO_SSL,
  process.env.NEON_DATABASE_URL, process.env.NEON_DATABASE_URL_UNPOOLED,
].map((value) => value?.trim()).find(Boolean) ?? "";

function errorResponse(message: string, status: number, code: string) {
  return NextResponse.json({ ok: false, code, message }, { status });
}

async function hashLoginKey(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function ensureTables(sql: SqlClient) {
  await sql`
    CREATE TABLE IF NOT EXISTS meimi_staff_accounts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      login_key_hash TEXT NOT NULL UNIQUE,
      login_key_last4 TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'sales',
      permissions JSONB NOT NULL DEFAULT '["customers","quote","products","search","logistics"]'::jsonb,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS meimi_customer_owners (
      owner_key TEXT PRIMARY KEY,
      record JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

async function authorize(sql: SqlClient, key: string) {
  if (key === FIXED_ADMIN_KEY || key === process.env.MEIMI_ADMIN_SYNC_KEY?.trim()) return { role: "admin" as const };
  const hash = await hashLoginKey(key);
  const rows = await sql`SELECT id, name FROM meimi_staff_accounts WHERE login_key_hash = ${hash} AND role = 'sales' AND active = TRUE LIMIT 1`;
  return rows[0] ? { role: "sales" as const, id: String(rows[0].id), name: String(rows[0].name) } : null;
}

export async function POST(request: Request) {
  const url = databaseUrl();
  if (!url) return errorResponse("尚未配置云端数据库", 503, "DATABASE_NOT_CONFIGURED");
  const key = request.headers.get("x-meimi-staff-key")?.trim() ?? "";
  if (!key) return errorResponse("缺少销售账号验证信息", 401, "UNAUTHORIZED");
  let body: { action?: unknown; ownerKey?: unknown; record?: unknown; records?: unknown };
  try { body = await request.json() as typeof body; } catch { return errorResponse("请求格式不正确", 400, "INVALID_JSON"); }
  try {
    const sql = neon<false, false>(url);
    await ensureTables(sql);
    const identity = await authorize(sql, key);
    if (!identity) return errorResponse("销售账号验证失败，请重新登录", 401, "UNAUTHORIZED");
    if (body.action === "list") {
      const rows = await sql`SELECT record FROM meimi_customer_owners ORDER BY updated_at DESC`;
      return NextResponse.json({ ok: true, records: rows.map((row) => row.record) });
    }
    if (body.action === "replace" && identity.role === "admin" && Array.isArray(body.records) && body.records.length <= 500) {
      await sql`DELETE FROM meimi_customer_owners`;
      for (const item of body.records) {
        if (!item || typeof item !== "object") continue;
        const itemData = item as { ownerKey?: unknown; record?: unknown };
        const ownerKey = typeof itemData.ownerKey === "string" ? itemData.ownerKey.trim() : "";
        const source = itemData.record && typeof itemData.record === "object" ? itemData.record as Record<string, unknown> : null;
        if (!ownerKey) continue;
        if (!source) continue;
        const record: Record<string, unknown> = { ...source, privateNote: "" };
        await sql`INSERT INTO meimi_customer_owners (owner_key, record) VALUES (${ownerKey}, ${JSON.stringify(record)}::jsonb)`;
      }
      return NextResponse.json({ ok: true });
    }
    if (body.action === "upsert" && typeof body.ownerKey === "string" && body.ownerKey.length <= 200 && body.record && typeof body.record === "object") {
      const record: Record<string, unknown> = { ...(body.record as Record<string, unknown>), privateNote: "" };
      if (identity.role === "sales") {
        record.ownerAccountId = identity.id;
        record.owner = identity.name;
      }
      const existingRows = await sql`SELECT record FROM meimi_customer_owners WHERE owner_key = ${body.ownerKey} LIMIT 1`;
      const existingRecord = existingRows[0]?.record as Record<string, unknown> | undefined;
      if (identity.role === "sales" && existingRecord?.ownerAccountId && existingRecord.ownerAccountId !== identity.id) {
        return errorResponse(`该客户已被销售“${String(existingRecord.owner || "其他销售")}”录入`, 409, "OWNER_CONFLICT");
      }
      await sql`INSERT INTO meimi_customer_owners (owner_key, record) VALUES (${body.ownerKey}, ${JSON.stringify(record)}::jsonb) ON CONFLICT (owner_key) DO UPDATE SET record = EXCLUDED.record, updated_at = NOW()`;
      return NextResponse.json({ ok: true });
    }
    return errorResponse("不支持的客户归属操作", 400, "INVALID_ACTION");
  } catch (error) {
    console.error("customer owner sync failed", error);
    return errorResponse("客户归属云端同步失败", 503, "DATABASE_WRITE_FAILED");
  }
}
