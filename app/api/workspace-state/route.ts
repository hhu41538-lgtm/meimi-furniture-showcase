import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "edge";

type WorkspaceStateRow = {
  id: string;
  entries: unknown;
  pricingRules: unknown;
  workflowPricingRuleId: string;
  initialized: boolean;
  version: number;
  updatedAt: string;
  updatedBy: string;
};

type WorkspaceStateInput = {
  entries: unknown[];
  pricingRules: unknown[];
  workflowPricingRuleId: string;
  version: number;
  updatedBy: string;
};

type SqlClient = NeonQueryFunction<false, false>;

function databaseUrl() {
  return [
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL_NON_POOLING,
    process.env.POSTGRES_URL_NO_SSL,
    process.env.NEON_DATABASE_URL,
    process.env.NEON_DATABASE_URL_UNPOOLED,
  ].map((value) => value?.trim()).find(Boolean) ?? "";
}

function errorResponse(message: string, status: number, code: string) {
  return NextResponse.json({ ok: false, code, message }, { status });
}

async function ensureTable(sql: SqlClient) {
  await sql`
    CREATE TABLE IF NOT EXISTS meimi_workspace_state (
      id TEXT PRIMARY KEY,
      entries JSONB NOT NULL DEFAULT '[]'::jsonb,
      pricing_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
      workflow_pricing_rule_id TEXT NOT NULL DEFAULT '',
      initialized BOOLEAN NOT NULL DEFAULT FALSE,
      version INTEGER NOT NULL DEFAULT 1,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_by TEXT NOT NULL DEFAULT 'system'
    )
  `;
  await sql`
    INSERT INTO meimi_workspace_state (id)
    VALUES ('main')
    ON CONFLICT (id) DO NOTHING
  `;
}

function rowToState(row: Record<string, unknown>): WorkspaceStateRow {
  return {
    id: String(row.id ?? "main"),
    entries: Array.isArray(row.entries) ? row.entries : [],
    pricingRules: Array.isArray(row.pricingRules) ? row.pricingRules : [],
    workflowPricingRuleId: typeof row.workflowPricingRuleId === "string" ? row.workflowPricingRuleId : "",
    initialized: row.initialized === true,
    version: Number(row.version) || 1,
    updatedAt: typeof row.updatedAt === "string" ? row.updatedAt : new Date().toISOString(),
    updatedBy: typeof row.updatedBy === "string" ? row.updatedBy : "system",
  };
}

async function readState(sql: SqlClient) {
  const rows = await sql`
    SELECT
      id,
      entries,
      pricing_rules AS "pricingRules",
      workflow_pricing_rule_id AS "workflowPricingRuleId",
      initialized,
      version,
      updated_at::text AS "updatedAt",
      updated_by AS "updatedBy"
    FROM meimi_workspace_state
    WHERE id = 'main'
    LIMIT 1
  `;
  return rowToState((rows[0] ?? {}) as Record<string, unknown>);
}

function validInput(value: unknown): value is WorkspaceStateInput {
  if (!value || typeof value !== "object") return false;
  const input = value as Partial<WorkspaceStateInput>;
  return Array.isArray(input.entries)
    && input.entries.length <= 500
    && Array.isArray(input.pricingRules)
    && input.pricingRules.length <= 100
    && typeof input.workflowPricingRuleId === "string"
    && input.workflowPricingRuleId.length <= 120
    && Number.isInteger(input.version)
    && Number(input.version) >= 1
    && typeof input.updatedBy === "string"
    && input.updatedBy.trim().length > 0
    && input.updatedBy.length <= 120;
}

export async function GET() {
  const url = databaseUrl();
  if (!url) return errorResponse("尚未配置云端数据库", 503, "DATABASE_NOT_CONFIGURED");

  try {
    const sql = neon<false, false>(url);
    await ensureTable(sql);
    const state = await readState(sql);
    return NextResponse.json({ ok: true, state });
  } catch (error) {
    console.error("workspace state read failed", error);
    return errorResponse("云端资料暂时无法读取", 503, "DATABASE_READ_FAILED");
  }
}

export async function PUT(request: Request) {
  const expectedAdminKey = process.env.MEIMI_ADMIN_SYNC_KEY?.trim();
  if (!expectedAdminKey) return errorResponse("尚未配置管理员同步密钥", 503, "SYNC_KEY_NOT_CONFIGURED");
  if (request.headers.get("x-meimi-admin-key")?.trim() !== expectedAdminKey) {
    return errorResponse("没有管理员同步权限", 401, "UNAUTHORIZED");
  }

  const url = databaseUrl();
  if (!url) return errorResponse("尚未配置云端数据库", 503, "DATABASE_NOT_CONFIGURED");

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return errorResponse("同步数据格式不正确", 400, "INVALID_JSON");
  }
  if (!validInput(input)) return errorResponse("同步数据未通过校验", 400, "INVALID_PAYLOAD");

  try {
    const sql = neon<false, false>(url);
    await ensureTable(sql);
    const rows = await sql`
      UPDATE meimi_workspace_state
      SET
        entries = ${JSON.stringify(input.entries)}::jsonb,
        pricing_rules = ${JSON.stringify(input.pricingRules)}::jsonb,
        workflow_pricing_rule_id = ${input.workflowPricingRuleId},
        initialized = TRUE,
        version = version + 1,
        updated_at = NOW(),
        updated_by = ${input.updatedBy.trim()}
      WHERE id = 'main' AND version = ${input.version}
      RETURNING
        id,
        entries,
        pricing_rules AS "pricingRules",
        workflow_pricing_rule_id AS "workflowPricingRuleId",
        initialized,
        version,
        updated_at::text AS "updatedAt",
        updated_by AS "updatedBy"
    `;
    if (!rows[0]) return errorResponse("云端已有更新，请刷新后再保存", 409, "VERSION_CONFLICT");
    return NextResponse.json({ ok: true, state: rowToState(rows[0] as Record<string, unknown>) });
  } catch (error) {
    console.error("workspace state write failed", error);
    return errorResponse("云端资料暂时无法保存", 503, "DATABASE_WRITE_FAILED");
  }
}
