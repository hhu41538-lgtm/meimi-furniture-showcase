"use client";

import { useEffect, useState } from "react";
import { ArrowRight, KeyRound, LogIn, ShieldCheck, UserPlus, UsersRound } from "lucide-react";
import AdminConsole, { type ManagedEntry } from "./AdminConsole";
import {
  accountToSession,
  ADMIN_LOGIN_KEY,
  AUTH_ACCOUNTS_STORAGE_KEY,
  AUTH_SESSION_STORAGE_KEY,
  DEFAULT_SALES_PERMISSIONS,
  normalizeStaffAccount,
  type AuthSession,
  type StaffAccount,
} from "./auth";

type AuthMode = "admin" | "sales";
type SalesAction = "login" | "register";

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
  const [authReady, setAuthReady] = useState(false);
  const [mode, setMode] = useState<AuthMode>("sales");
  const [salesAction, setSalesAction] = useState<SalesAction>("login");
  const [name, setName] = useState("");
  const [loginKey, setLoginKey] = useState("");
  const [confirmKey, setConfirmKey] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    try {
      const storedAccounts = localStorage.getItem(AUTH_ACCOUNTS_STORAGE_KEY);
      if (storedAccounts) {
        const parsedAccounts = JSON.parse(storedAccounts) as unknown;
        if (Array.isArray(parsedAccounts)) {
          setAccounts(parsedAccounts.map(normalizeStaffAccount).filter((account): account is StaffAccount => Boolean(account)));
        }
      }
      const storedSession = localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
      if (storedSession) {
        const parsedSession = JSON.parse(storedSession) as Partial<AuthSession>;
        if (parsedSession.role === "admin" && parsedSession.accountId === "admin") {
          setSession(adminSession());
        } else if (parsedSession.role === "sales" && typeof parsedSession.accountId === "string") {
          const restoredAccounts: StaffAccount[] = (JSON.parse(storedAccounts ?? "[]") as unknown[]).map(normalizeStaffAccount).filter((item: StaffAccount | null): item is StaffAccount => item !== null);
          const account = restoredAccounts.find((item) => item.id === parsedSession.accountId && item.active);
          if (account) setSession(accountToSession(account));
        }
      }
    } catch {
      setStatus("账号资料读取失败，请重新登录");
    } finally {
      setAuthReady(true);
    }
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

  function loginAsAdmin() {
    if (loginKey.trim() !== ADMIN_LOGIN_KEY) {
      setStatus("管理员密钥不正确，请重新输入");
      return;
    }
    enterSession(adminSession());
  }

  function loginAsSales() {
    const account = accounts.find((item) => item.loginKey === loginKey.trim());
    if (!account) {
      setStatus("没有找到这个销售密钥，请先注册或检查输入");
      return;
    }
    if (!account.active) {
      setStatus("这个销售账号已被管理员停用，请联系管理员");
      return;
    }
    enterSession(accountToSession(account));
  }

  function registerSales() {
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
    if (accounts.some((account) => account.loginKey === trimmedKey)) {
      setStatus("这个销售密钥已经被注册，请换一个");
      return;
    }
    const account: StaffAccount = {
      id: `sales:${Date.now()}`,
      name: trimmedName,
      loginKey: trimmedKey,
      role: "sales",
      permissions: [...DEFAULT_SALES_PERMISSIONS],
      active: true,
      createdAt: new Date().toISOString(),
    };
    saveAccounts([...accounts, account]);
    enterSession(accountToSession(account));
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === "admin") loginAsAdmin();
    else if (salesAction === "register") registerSales();
    else loginAsSales();
  }

  function logout() {
    localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    setSession(null);
    setLoginKey("");
    setConfirmKey("");
    setStatus("已退出当前账号");
  }

  function updateSalesAccount(id: string, patch: Partial<Pick<StaffAccount, "permissions" | "active">>) {
    if (session?.role !== "admin") return;
    const nextAccounts = accounts.map((account) => account.id === id ? { ...account, ...patch } : account);
    saveAccounts(nextAccounts);
  }

  function deleteSalesAccount(id: string) {
    if (session?.role !== "admin") return;
    const account = accounts.find((item) => item.id === id);
    if (!account || !window.confirm(`确定删除销售账号“${account.name}”吗？`)) return;
    saveAccounts(accounts.filter((item) => item.id !== id));
  }

  if (!authReady) {
    return <main className="auth-gate auth-gate-loading"><span className="auth-gate-loader" />正在读取工作台账号…</main>;
  }

  if (session) {
    return <AdminConsole initialEntries={initialEntries} session={session} salesAccounts={accounts} onUpdateSalesAccount={updateSalesAccount} onDeleteSalesAccount={deleteSalesAccount} onLogout={logout} />;
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
          <button className="auth-gate-submit" type="submit">
            {mode === "admin" || salesAction === "login" ? <LogIn size={17} /> : <UserPlus size={17} />}
            {mode === "admin" || salesAction === "login" ? "进入工作台" : "注册并进入"}
            <ArrowRight size={16} />
          </button>
        </form>
        <div className="auth-gate-note">
          <strong>{mode === "admin" ? "管理员可以做什么？" : "销售登录后可以做什么？"}</strong>
          <span>{mode === "admin" ? "添加 / 下架产品、删除旧产品、维护报价公式、统一销售端价格和分配销售权限。" : "客户归属、报价流程、产品浏览、产品搜索和汇率物流，具体权限由管理员分配。"}</span>
        </div>
        <small className="auth-gate-local-note">当前版本账号和工作资料保存在本浏览器。部署到正式服务器时，建议接入统一账号和数据库。</small>
      </section>
    </main>
  );
}
