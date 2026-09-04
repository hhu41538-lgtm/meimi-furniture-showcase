export async function fetchSharedCustomerOwners(authKey: string) {
  const response = await fetch("/api/customer-owners", {
    method: "POST",
    headers: { "content-type": "application/json", "x-meimi-staff-key": authKey },
    body: JSON.stringify({ action: "list" }),
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({})) as { records?: unknown[]; message?: string };
  if (!response.ok || !Array.isArray(payload.records)) throw new Error(payload.message || "客户归属云端读取失败");
  return payload.records;
}

export async function publishCustomerOwner(authKey: string, ownerKey: string, record: unknown) {
  const response = await fetch("/api/customer-owners", {
    method: "POST",
    headers: { "content-type": "application/json", "x-meimi-staff-key": authKey },
    body: JSON.stringify({ action: "upsert", ownerKey, record }),
  });
  const payload = await response.json().catch(() => ({})) as { code?: string; message?: string };
  if (!response.ok) throw new Error(`${payload.code || "SYNC_FAILED"}:${payload.message || "客户归属云端保存失败"}`);
}
