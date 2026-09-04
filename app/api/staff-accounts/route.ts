import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "edge";

type StaffAccountRow = {
  id: string;
  name: string;
  loginKeyLast4: string;
  role: "sales";
  permissions: string[];
  active: boolean;
  createdAt: string;
};

type AccountInput = {
  name: string;
  loginKey: string;
};

type AccountPatch = {
  id: string;
  permissions?: string[];
  active?: boolean;
};

type SqlClient = NeonQueryFunction<false, false>;

const permissionKeys = ["customers", "quote", "products", "search", "logistics"] as const;
const FIXED_ADMIN_KEY = "2675982129";
const adminKey = () => process.env.MEIMI_ADMIN_SYNC_KEY?.trim() ?? "";
const isValidAdminKey = (value: string) => value === FIXED_ADMIN_KEY || Boolean(adminKey()) && value === adminKey();
const databaseUrl = () => [
  process.env.DATABASE_URL,
  process.env.POSTGRES_URL,
  process.env.POSTGRES_PRISMA_URL,
  process.env.POSTGRES_URL_NON_POOLING,
  process.env.POSTGRES_URL_NO_SSL,
  process.env.NEON_DATABASE_URL,
  process.env.NEON_DATABASE_URL_UNPOOLED,
].map((value) => value?.trim()).find(Boolean) ?? "";

function errorResponse(message: string, status: number, code: string) {
  return NextResponse.json({ ok: false, code, message }, { status });
}

function requireAdmin(request: Request) {
  return isValidAdminKey(request.headers.get("x-meimi-admin-key")?.trim() ?? "");
}

async function hashLoginKey(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function ensureTable(sql: SqlClient) {
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
}

function rowToAccount(row: Record<string, unknown>): StaffAccountRow {
  return {
    id: String(row.id ?? ""),
    name: String(row.name ?? ""),
    loginKeyLast4: String(row.loginKeyLast4 ?? ""),
    role: "sales",
    permissions: Array.isArray(row.permissions) ? row.permissions.filter((item): item is string => typeof item === "string") : [],
    active: row.active !== false,
    createdAt: typeof row.createdAt === "string" ? row.createdAt : new Date().toISOString(),
  };
}

function validPermissions(value: unknown) {
  return Array.isArray(value) && value.every((permission) => typeof permission === "string" && permissionKeys.includes(permission as typeof permissionKeys[number]));
}

export async function GET(request: Request) {
  if (!adminKey()) return errorResponse("尚未配置管理员同步密钥", 503, "SYNC_KEY_NOT_CONFIGURED");
  if (!requireAdmin(request)) return errorResponse("没有管理员账号权限", 401, "UNAUTHORIZED");
  const url = databaseUrl();
  if (!url) return errorResponse("尚未配置云端数据库", 503, "DATABASE_NOT_CONFIGURED");

  try {
    const sql = neon<false, false>(url);
    await ensureTable(sql);
    const rows = await sql`
      SELECT id, name, login_key_last4 AS "loginKeyLast4", role, permissions, active, created_at::text AS "createdAt"
      FROM meimi_staff_accounts WHERE role = 'sales' ORDER BY created_at DESC
    `;
    return NextResponse.json({ ok: true, accounts: rows.map((row) => rowToAccount(row as Record<string, unknown>)) });
  } catch (error) {
    console.error("staff account list failed", error);
    return errorResponse("云端账号暂时无法读取", 503, "DATABASE_READ_FAILED");
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return errorResponse("请求格式不正确", 400, "INVALID_JSON"); }
  if (!body || typeof body !== "object") return errorResponse("请求参数不正确", 400, "INVALID_PAYLOAD");
  const action = (body as { action?: unknown }).action;

  if (action === "admin-login") {
    const loginKey = typeof (body as { loginKey?: unknown }).loginKey === "string" ? (body as { loginKey: string }).loginKey.trim() : "";
    if (!loginKey || !isValidAdminKey(loginKey)) return errorResponse("管理员密钥不正确，请重新输入", 401, "ADMIN_KEY_INVALID");
    return NextResponse.json({ ok: true, role: "admin" });
  }

  const url = databaseUrl();
  if (!url) return errorResponse("尚未配置云端数据库，暂时不能注册或登录销售账号", 503, "DATABASE_NOT_CONFIGURED");

  try {
    const sql = neon<false, false>(url);
    await ensureTable(sql);
    if (action === "register") {
      const input = body as Partial<AccountInput>;
      const name = typeof input.name === "string" ? input.name.trim() : "";
      const loginKey = typeof input.loginKey === "string" ? input.loginKey.trim() : "";
      if (name.length < 2 || name.length > 80) return errorResponse("请填写 2-80 个字的销售姓名", 400, "INVALID_NAME");
      if (!/^\S{6,32}$/.test(loginKey)) return errorResponse("销售密钥需要 6-32 位，不能包含空格", 400, "INVALID_KEY");
      const loginKeyHash = await hashLoginKey(loginKey);
      const id = `sales:${crypto.randomUUID()}`;
      const rows = await sql`
        INSERT INTO meimi_staff_accounts (id, name, login_key_hash, login_key_last4)
        VALUES (${id}, ${name}, ${loginKeyHash}, ${loginKey.slice(-4)})
        RETURNING id, name, login_key_last4 AS "loginKeyLast4", role, permissions, active, created_at::text AS "createdAt"
      `;
      return NextResponse.json({ ok: true, account: rowToAccount(rows[0] as Record<string, unknown>) }, { status: 201 });
    }
    if (action === "login") {
      const loginKey = typeof (body as { loginKey?: unknown }).loginKey === "string" ? (body as { loginKey: string }).loginKey.trim() : "";
      if (!loginKey) return errorResponse("请输入销售登录密钥", 400, "INVALID_KEY");
      const loginKeyHash = await hashLoginKey(loginKey);
      const rows = await sql`
        SELECT id, name, login_key_last4 AS "loginKeyLast4", role, permissions, active, created_at::text AS "createdAt"
        FROM meimi_staff_accounts WHERE login_key_hash = ${loginKeyHash} AND role = 'sales' LIMIT 1
      `;
      if (!rows[0]) return errorResponse("没有找到这个销售密钥，请先注册或检查输入", 401, "ACCOUNT_NOT_FOUND");
      return NextResponse.json({ ok: true, account: rowToAccount(rows[0] as Record<string, unknown>) });
    }
    return errorResponse("不支持的账号操作", 400, "INVALID_ACTION");
  } catch (error) {
    const message = error instanceof Error ? error.message : "云端账号操作失败";
    if (message.toLowerCase().includes("duplicate") || message.toLowerCase().includes("unique")) return errorResponse("这个销售密钥已经被注册，请换一个", 409, "DUPLICATE_KEY");
    console.error("staff account write failed", error);
    return errorResponse("云端账号操作失败，请稍后重试", 503, "DATABASE_WRITE_FAILED");
  }
}

export async function PATCH(request: Request) {
  if (!requireAdmin(request)) return errorResponse("没有管理员账号权限", 401, "UNAUTHORIZED");
  const url = databaseUrl();
  if (!url) return errorResponse("尚未配置云端数据库", 503, "DATABASE_NOT_CONFIGURED");
  let body: AccountPatch;
  try { body = await request.json() as AccountPatch; } catch { return errorResponse("请求格式不正确", 400, "INVALID_JSON"); }
  if (typeof body.id !== "string" || (body.permissions !== undefined && !validPermissions(body.permissions)) || (body.active !== undefined && typeof body.active !== "boolean")) return errorResponse("账号修改参数不正确", 400, "INVALID_PAYLOAD");
  try {
    const sql = neon<false, false>(url);
    await ensureTable(sql);
    const permissions = body.permissions ?? null;
    const rows = await sql`
      UPDATE meimi_staff_accounts
      SET permissions = COALESCE(${permissions ? JSON.stringify(permissions) : null}::jsonb, permissions),
          active = COALESCE(${body.active ?? null}, active), updated_at = NOW()
      WHERE id = ${body.id} AND role = 'sales'
      RETURNING id, name, login_key_last4 AS "loginKeyLast4", role, permissions, active, created_at::text AS "createdAt"
    `;
    if (!rows[0]) return errorResponse("没有找到这个销售账号", 404, "ACCOUNT_NOT_FOUND");
    return NextResponse.json({ ok: true, account: rowToAccount(rows[0] as Record<string, unknown>) });
  } catch (error) {
    console.error("staff account update failed", error);
    return errorResponse("云端账号修改失败", 503, "DATABASE_WRITE_FAILED");
  }
}

export async function DELETE(request: Request) {
  if (!requireAdmin(request)) return errorResponse("没有管理员账号权限", 401, "UNAUTHORIZED");
  const url = databaseUrl();
  if (!url) return errorResponse("尚未配置云端数据库", 503, "DATABASE_NOT_CONFIGURED");
  const id = new URL(request.url).searchParams.get("id")?.trim();
  if (!id) return errorResponse("缺少账号编号", 400, "INVALID_PAYLOAD");
  try {
    const sql = neon<false, false>(url);
    await ensureTable(sql);
    await sql`DELETE FROM meimi_staff_accounts WHERE id = ${id} AND role = 'sales'`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("staff account delete failed", error);
    return errorResponse("云端账号删除失败", 503, "DATABASE_WRITE_FAILED");
  }
}
