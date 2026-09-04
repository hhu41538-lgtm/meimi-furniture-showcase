"use client";

import { useEffect, useState } from "react";
import { ArrowRight, KeyRound, LogIn, ShieldCheck, UserPlus, UsersRound } from "lucide-react";
import AdminConsole, { type ManagedEntry } from "./AdminConsole";
import {
  accountToSession,
  AUTH_ACCOUNTS_STORAGE_KEY,
  AUTH_SESSION_STORAGE_KEY,
  DEFAULT_SALES_PERMISSIONS,
  normalizeStaffAccount,
  type AuthSession,
  type StaffAccount,
} from "./auth";

type AuthMode = "admin" | "sales";
type SalesAction = "login" | "register";

type CloudAccount = Omit<StaffAccount, "loginKey"> & { loginKeyLast4: string };
const FIXED_ADMIN_KEY = "2675982129";
const STAFF_SYNC_KEY_SESSION_STORAGE_KEY = "meimih-staff-sync-key-session-v1";

function cloudAccountToStaff(account: CloudAccount): StaffAccount {
  return { ...account, loginKey: `••••${account.loginKeyLast4}` };
}

function adminSession(): AuthSession {
  return {
    accountId: "admin",
    name: "系统管理员",
    role: "admin",
    permissions: [...DEFAULT_SALES_PERMISSIONS],
  };
}

export default function AdminAuthGate({ initialEntries }: { initialEntries: ManagedEntry[] }) {
  const [accounts, setAccounts] = useState<StaffAccount[]>([]);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [adminSyncKey, setAdminSyncKey] = useState("");
  const [staffSyncKey, setStaffSyncKey] = useState("");
  const [authReady, setAuthReady] = useState(false);
  const [mode, setMode] = useState<AuthMode>("sales");
  const [salesAction, setSalesAction] = useState<SalesAction>("login");
  const [name, setName] = useState("");
  const [loginKey, setLoginKey] = useState("");
  const [confirmKey, setConfirmKey] = useState("");
  const [status, setStatus] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const updateOnlineState = () => setIsOnline(navigator.onLine);
    updateOnlineState();
    window.addEventListener("online", updateOnlineState);
    window.addEventListener("offline", updateOnlineState);
    try {
      const storedAccounts = localStorage.getItem(AUTH_ACCOUNTS_STORAGE_KEY);
      if (storedAccounts) {
        const parsedAccounts = JSON.parse(storedAccounts) as unknown;
        if (Array.isArray(parsedAccounts)) {
          setAccounts(parsedAccounts.map(normalizeStaffAccount).filter((account): account is StaffAccount => Boolean(account)));
        }
      }
      const storedSession = localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
      setStaffSyncKey(sessionStorage.getItem(STAFF_SYNC_KEY_SESSION_STORAGE_KEY) ?? "");
      if (storedSession) {
        const parsedSession = JSON.parse(storedSession) as Partial<AuthSession>;
        if (parsedSession.role === "sales" && typeof parsedSession.accountId === "string") {
          const restoredAccounts: StaffAccount[] = (JSON.parse(storedAccounts ?? "[]") as unknown[]).map(normalizeStaffAccount).filter((item: StaffAccount | null): item is StaffAccount => item !== null);
          const account = restoredAccounts.find((item) => item.id === parsedSession.accountId && item.active);
          if (account) setSession(accountToSession(account));
        }
      }
    } catch {
      setStatus("账号资料读取失败，请重新登录");
    } finally { setAuthReady(true); }
    return () => {
      window.removeEventListener("online", updateOnlineState);
      window.removeEventListener("offline", updateOnlineState);
    };
  }, []);

  function saveAccounts(nextAccounts: StaffAccount[]) {
    setAccounts(nextAccounts);
    localStorage.setItem(AUTH_ACCOUNTS_STORAGE_KEY, JSON.stringify(nextAccounts));
  }

  function enterSession(nextSession: AuthSession) {
    setSession(nextSession);
    localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(nextSession));
    setStatus("");
  }

  async function loginAsAdmin() {
    const trimmedKey = loginKey.trim();
    if (!trimmedKey) {
      setStatus("请输入管理员密钥");
      return;
    }
    setStatus("正在验证管理员密钥…");
    try {
      const response = await fetch("/api/staff-accounts", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "admin-login", loginKey: trimmedKey }) });
      const payload = await response.json().catch(() => ({})) as { ok?: boolean; message?: string };
      if (!response.ok || payload.ok !== true) {
        if (trimmedKey === FIXED_ADMIN_KEY) {
          setAdminSyncKey(trimmedKey);
          enterSession(adminSession());
          setStatus("管理员已进入本地工作台；云端校验暂不可用，恢复网络后可继续同步");
          return;
        }
        setStatus(payload.message || "管理员密钥不正确，请重新输入");
        return;
      }
      setAdminSyncKey(trimmedKey);
      enterSession(adminSession());
      try {
        const accountResponse = await fetch("/api/staff-accounts", { headers: { "x-meimi-admin-key": trimmedKey }, cache: "no-store" });
        const accountPayload = await accountResponse.json().catch(() => ({})) as { accounts?: CloudAccount[]; message?: string };
        if (accountResponse.ok && Array.isArray(accountPayload.accounts)) saveAccounts(accountPayload.accounts.map(cloudAccountToStaff));
        else if (accountPayload.message) setStatus(`管理员已进入，但账号云端列表读取失败：${accountPayload.message}`);
      } catch { setStatus("管理员已进入，云端账号列表暂时无法读取"); }
    } catch {
      if (trimmedKey === FIXED_ADMIN_KEY) {
        setAdminSyncKey(trimmedKey);
        enterSession(adminSession());
        setStatus("管理员已进入本地工作台；云端校验暂不可用，恢复网络后可继续同步");
        return;
      }
      setStatus("管理员验证服务暂时不可用，请稍后重试");
    }
  }

  async function loginAsSales() {
    if (!navigator.onLine) {
      setStatus("当前没有网络，销售账号需要联网验证；本机已保存的工作资料不会丢失");
      return;
    }
    setStatus("正在验证云端销售账号…");
    try {
      const response = await fetch("/api/staff-accounts", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "login", loginKey: loginKey.trim() }) });
      const payload = await response.json().catch(() => ({})) as { account?: CloudAccount; message?: string };
      if (!response.ok || !payload.account) { setStatus(payload.message || "云端账号验证失败，请稍后重试"); return; }
      const account = cloudAccountToStaff(payload.account);
      if (!account.active) { setStatus("这个销售账号已被管理员停用，请联系管理员"); return; }
      setStaffSyncKey(loginKey.trim());
      sessionStorage.setItem(STAFF_SYNC_KEY_SESSION_STORAGE_KEY, loginKey.trim());
      saveAccounts(accounts.some((item) => item.id === account.id) ? accounts.map((item) => item.id === account.id ? account : item) : [account, ...accounts]);
      enterSession(accountToSession(account));
    } catch { setStatus("云端账号服务暂时不可用，请检查数据库配置"); }
  }

  async function registerSales() {
    if (!navigator.onLine) {
      setStatus("当前没有网络，暂时无法注册云端销售账号");
      return;
    }
    const trimmedName = name.trim();
    const trimmedKey = loginKey.trim();
    if (trimmedName.length < 2) {
      setStatus("请填写至少 2 个字的销售姓名");
      return;
    }
    if (!/^\S{6,32}$/.test(trimmedKey)) {
      setStatus("销售密钥需要 6-32 位，不能包含空格");
      return;
    }
    if (trimmedKey !== confirmKey.trim()) {
      setStatus("两次输入的销售密钥不一致");
      return;
    }
    setStatus("正在把销售账号保存到云端…");
    try {
      const response = await fetch("/api/staff-accounts", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "register", name: trimmedName, loginKey: trimmedKey }) });
      const payload = await response.json().catch(() => ({})) as { account?: CloudAccount; message?: string };
      if (!response.ok || !payload.account) { setStatus(payload.message || "云端注册失败，请稍后重试"); return; }
      const account = cloudAccountToStaff(payload.account);
      setStaffSyncKey(trimmedKey);
      sessionStorage.setItem(STAFF_SYNC_KEY_SESSION_STORAGE_KEY, trimmedKey);
      saveAccounts([account, ...accounts.filter((item) => item.id !== account.id)]);
      enterSession(accountToSession(account));
    } catch { setStatus("云端账号服务暂时不可用，账号未注册"); }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (mode === "admin") {
        await loginAsAdmin();
      } else if (salesAction === "register") await registerSales();
      else await loginAsSales();
    } finally {
      setIsSubmitting(false);
    }
  }

  function logout() {
    localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    setSession(null);
    setAdminSyncKey("");
    setStaffSyncKey("");
    sessionStorage.removeItem(STAFF_SYNC_KEY_SESSION_STORAGE_KEY);
    setLoginKey("");
    setConfirmKey("");
    setStatus("已退出当前账号");
  }

  async function updateSalesAccount(id: string, patch: Partial<Pick<StaffAccount, "permissions" | "active">>) {
    if (session?.role !== "admin") return;
    try {
      const response = await fetch("/api/staff-accounts", { method: "PATCH", headers: { "content-type": "application/json", "x-meimi-admin-key": adminSyncKey }, body: JSON.stringify({ id, ...patch }) });
      const payload = await response.json().catch(() => ({})) as { account?: CloudAccount; message?: string };
      if (!response.ok || !payload.account) { setStatus(payload.message || "云端账号修改失败"); return; }
      const account = cloudAccountToStaff(payload.account);
      saveAccounts(accounts.map((item) => item.id === id ? account : item));
    } catch { setStatus("云端账号服务暂时不可用"); }
  }

  async function deleteSalesAccount(id: string) {
    if (session?.role !== "admin") return;
    const account = accounts.find((item) => item.id === id);
    if (!account || !window.confirm(`确定删除销售账号“${account.name}”吗？`)) return;
    try {
      const response = await fetch(`/api/staff-accounts?id=${encodeURIComponent(id)}`, { method: "DELETE", headers: { "x-meimi-admin-key": adminSyncKey } });
      if (!response.ok) { const payload = await response.json().catch(() => ({})) as { message?: string }; setStatus(payload.message || "云端账号删除失败"); return; }
      saveAccounts(accounts.filter((item) => item.id !== id));
    } catch { setStatus("云端账号服务暂时不可用"); }
  }

  if (!authReady) {
    return <main className="auth-gate auth-gate-loading"><span className="auth-gate-loader" />正在读取工作台账号…</main>;
  }

  if (session) {
    return <AdminConsole initialEntries={initialEntries} session={session} adminSyncKey={adminSyncKey} staffSyncKey={staffSyncKey} salesAccounts={accounts} onUpdateSalesAccount={updateSalesAccount} onDeleteSalesAccount={deleteSalesAccount} onLogout={logout} />;
  }

  return (
    <main className="auth-gate">
      <section className="auth-gate-panel" aria-labelledby="auth-title">
        <div className="auth-gate-brand">
          <span className="auth-gate-mark">M</span>
          <div>
            <strong>MEIMI&H</strong>
            <span>内部员工报价工作台</span>
          </div>
        </div>
        <div className="auth-gate-heading">
          <h1 id="auth-title">进入内部报价工作台</h1>
          <p>选择工作版本后，用对应密钥进入客户、产品和报价工具。</p>
          <p className="auth-gate-storage-note" role="status">{isOnline ? "当前网络可用 · 登录时会验证云端账号，工作资料同时保存到本机" : "当前离线 · 本机工作资料仍可读取，登录账号需联网验证"}</p>
        </div>
        <div className="auth-gate-mode-tabs" role="tablist" aria-label="工作版本">
          <button className={mode === "sales" ? "is-active" : ""} type="button" role="tab" aria-selected={mode === "sales"} onClick={() => { setMode("sales"); setStatus(""); }}>
            <UsersRound size={17} />销售版
          </button>
          <button className={mode === "admin" ? "is-active" : ""} type="button" role="tab" aria-selected={mode === "admin"} onClick={() => { setMode("admin"); setStatus(""); }}>
            <ShieldCheck size={17} />管理员版
          </button>
        </div>
        <form className="auth-gate-form" onSubmit={submit}>
          {mode === "sales" ? (
            <div className="auth-gate-action-tabs" role="tablist" aria-label="销售账号操作">
              <button className={salesAction === "login" ? "is-active" : ""} type="button" onClick={() => { setSalesAction("login"); setStatus(""); }}>已有账号登录</button>
              <button className={salesAction === "register" ? "is-active" : ""} type="button" onClick={() => { setSalesAction("register"); setStatus(""); }}>注册销售账号</button>
            </div>
          ) : null}
          {mode === "sales" && salesAction === "register" ? (
            <label>销售姓名<input value={name} onChange={(event) => setName(event.target.value)} placeholder="例如：张三" autoComplete="name" /></label>
          ) : null}
          <label>
            <span>{mode === "admin" ? "管理员密钥" : "销售登录密钥"}</span>
            <span className="auth-gate-input-wrap"><KeyRound size={16} /><input type="password" value={loginKey} onChange={(event) => setLoginKey(event.target.value)} placeholder={mode === "admin" ? "输入管理员密钥" : "输入销售密钥"} autoComplete="current-password" /></span>
          </label>
          {mode === "sales" && salesAction === "register" ? (
            <label>确认销售密钥<input type="password" value={confirmKey} onChange={(event) => setConfirmKey(event.target.value)} placeholder="再次输入销售密钥" autoComplete="new-password" /></label>
          ) : null}
          {status ? <p className="auth-gate-status" role="alert">{status}</p> : null}
          <button className="auth-gate-submit" type="submit" disabled={isSubmitting} aria-disabled={isSubmitting}>
            {mode === "admin" || salesAction === "login" ? <LogIn size={17} /> : <UserPlus size={17} />}
            {isSubmitting ? "正在验证…" : mode === "admin" || salesAction === "login" ? "进入工作台" : "注册并进入"}
            <ArrowRight size={16} />
          </button>
        </form>
        <div className="auth-gate-note">
          <strong>{mode === "admin" ? "管理员可以做什么？" : "销售登录后可以做什么？"}</strong>
          <span>{mode === "admin" ? "添加 / 下架产品、删除旧产品、维护报价公式、统一销售端价格和分配销售权限。" : "客户归属、报价流程、产品仓库（含搜索）和汇率物流，具体权限由管理员分配。"}</span>
        </div>
        <small className="auth-gate-local-note">销售账号注册与登录以云端数据库为准；本浏览器仅缓存当前登录状态，换设备不会丢失账号。</small>
      </section>
    </main>
  );
}
