export type AuthRole = "admin" | "sales";

export type PermissionKey = "customers" | "quote" | "products" | "search" | "logistics";

export type StaffAccount = {
  id: string;
  name: string;
  loginKey: string;
  role: "sales";
  permissions: PermissionKey[];
  active: boolean;
  createdAt: string;
};

export type AuthSession = {
  accountId: string;
  name: string;
  role: AuthRole;
  permissions: PermissionKey[];
};

export const AUTH_ACCOUNTS_STORAGE_KEY = "meimih-workbench-sales-accounts-v1";
export const AUTH_SESSION_STORAGE_KEY = "meimih-workbench-session-v1";

export const SALES_PERMISSION_OPTIONS: Array<{ key: PermissionKey; label: string; detail: string }> = [
  { key: "customers", label: "客户池", detail: "查询归属、维护自己的客户资源" },
  { key: "quote", label: "报价流程", detail: "选择公式、选品并生成报价单" },
  { key: "products", label: "产品仓库", detail: "浏览、搜索已上架产品并加入报价" },
  { key: "logistics", label: "汇率物流", detail: "换算货币和粗估物流" },
];

export const DEFAULT_SALES_PERMISSIONS: PermissionKey[] = SALES_PERMISSION_OPTIONS.map((item) => item.key);

export function accountToSession(account: StaffAccount): AuthSession {
  return {
    accountId: account.id,
    name: account.name,
    role: "sales",
    permissions: account.permissions,
  };
}

export function normalizeStaffAccount(value: unknown): StaffAccount | null {
  if (!value || typeof value !== "object") return null;
  const account = value as Partial<StaffAccount>;
  if (typeof account.id !== "string" || typeof account.name !== "string" || typeof account.loginKey !== "string") return null;
  if (account.role !== "sales" || typeof account.active !== "boolean") return null;
  const permissions = Array.isArray(account.permissions)
    ? account.permissions.filter((permission): permission is PermissionKey => DEFAULT_SALES_PERMISSIONS.includes(permission as PermissionKey) || permission === "search")
    : [];
  return {
    id: account.id,
    name: account.name.trim(),
    loginKey: account.loginKey.trim(),
    role: "sales",
    permissions: Array.from(new Set(permissions)),
    active: account.active,
    createdAt: typeof account.createdAt === "string" ? account.createdAt : new Date().toISOString(),
  };
}

export function isPermissionKey(value: string): value is PermissionKey {
  return DEFAULT_SALES_PERMISSIONS.includes(value as PermissionKey) || value === "search";
}
