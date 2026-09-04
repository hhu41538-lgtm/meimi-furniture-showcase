export type CloudWorkspaceState = {
  entries: unknown[];
  pricingRules: unknown[];
  workflowPricingRuleId: string;
  initialized: boolean;
  version: number;
  updatedAt: string;
  updatedBy: string;
};

type WorkspaceApiResponse = {
  ok?: boolean;
  code?: string;
  message?: string;
  state?: CloudWorkspaceState;
};

const SYNC_REQUEST_TIMEOUT_MS = 12_000;

export type WorkspaceReadResult =
  | { kind: "ready"; state: CloudWorkspaceState }
  | { kind: "unconfigured"; message: string };

export type WorkspaceWriteResult =
  | { kind: "saved"; state: CloudWorkspaceState }
  | { kind: "unconfigured"; message: string }
  | { kind: "conflict"; message: string }
  | { kind: "failed"; message: string };

function normalizedState(value: unknown): CloudWorkspaceState | null {
  if (!value || typeof value !== "object") return null;
  const state = value as Partial<CloudWorkspaceState>;
  if (!Array.isArray(state.entries) || !Array.isArray(state.pricingRules)) return null;
  return {
    entries: state.entries,
    pricingRules: state.pricingRules,
    workflowPricingRuleId: typeof state.workflowPricingRuleId === "string" ? state.workflowPricingRuleId : "",
    initialized: state.initialized === true,
    version: Number.isInteger(state.version) && Number(state.version) > 0 ? Number(state.version) : 1,
    updatedAt: typeof state.updatedAt === "string" ? state.updatedAt : "",
    updatedBy: typeof state.updatedBy === "string" ? state.updatedBy : "system",
  };
}

async function responsePayload(response: Response) {
  return await response.json().catch(() => ({})) as WorkspaceApiResponse;
}

export async function fetchSharedWorkspaceState(): Promise<WorkspaceReadResult> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), SYNC_REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch("/api/workspace-state", { cache: "no-store", signal: controller.signal });
    const payload = await responsePayload(response);
    if (response.status === 503 && (payload.code === "DATABASE_NOT_CONFIGURED" || payload.code === "SYNC_KEY_NOT_CONFIGURED")) {
      return { kind: "unconfigured", message: "云端数据库尚未配置，当前使用本地资料" };
    }
    if (!response.ok || !payload.state) throw new Error(payload.message || "云端资料读取失败");
    const state = normalizedState(payload.state);
    if (!state) throw new Error("云端资料格式不正确");
    return { kind: "ready", state };
  } catch (error) {
    const message = error instanceof Error && error.name === "AbortError"
      ? "云端资料请求超时，当前使用本地资料"
      : error instanceof Error ? error.message : "云端资料不可用，当前使用本地资料";
    return { kind: "unconfigured", message };
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export async function publishSharedWorkspaceState({
  entries,
  pricingRules,
  workflowPricingRuleId,
  version,
  updatedBy,
  adminKey,
}: {
  entries: unknown[];
  pricingRules: unknown[];
  workflowPricingRuleId: string;
  version: number;
  updatedBy: string;
  adminKey: string;
}): Promise<WorkspaceWriteResult> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), SYNC_REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch("/api/workspace-state", {
      method: "PUT",
      headers: { "content-type": "application/json", "x-meimi-admin-key": adminKey },
      body: JSON.stringify({ entries, pricingRules, workflowPricingRuleId, version, updatedBy }),
      signal: controller.signal,
    });
    const payload = await responsePayload(response);
    if (response.status === 503 && (payload.code === "DATABASE_NOT_CONFIGURED" || payload.code === "SYNC_KEY_NOT_CONFIGURED")) {
      return { kind: "unconfigured", message: "云端数据库尚未配置，已保存到本地" };
    }
    if (response.status === 409) return { kind: "conflict", message: payload.message || "云端已有更新，请刷新后再保存" };
    if (!response.ok || !payload.state) return { kind: "failed", message: payload.message || "云端保存失败，已保存到本地" };
    const state = normalizedState(payload.state);
    if (!state) return { kind: "failed", message: "云端返回资料格式不正确，已保存到本地" };
    return { kind: "saved", state };
  } catch (error) {
    const message = error instanceof Error && error.name === "AbortError"
      ? "云端保存超时，已保存到本地，稍后自动重试"
      : error instanceof Error ? error.message : "云端保存失败，已保存到本地";
    return { kind: "failed", message };
  } finally {
    window.clearTimeout(timeoutId);
  }
}
