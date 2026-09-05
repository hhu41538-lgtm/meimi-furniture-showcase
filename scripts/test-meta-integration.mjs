import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { mkdirSync, mkdtempSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";

const root = process.cwd();
const require = createRequire(import.meta.url);
const cache = path.join(root, "node_modules", ".cache");
mkdirSync(cache, { recursive: true });
const output = mkdtempSync(path.join(cache, "meta-tests-"));
const compiled = spawnSync(process.execPath, [require.resolve("typescript/bin/tsc"),
  "app/api/meta/webhook/route.ts", "app/api/meta/pending/route.ts", "app/api/meta/status/route.ts",
  "app/api/customer-owners/route.ts", "app/api/staff-accounts/route.ts",
  "--outDir", output, "--rootDir", root, "--module", "commonjs", "--moduleResolution", "node",
  "--target", "es2022", "--lib", "es2022,dom", "--esModuleInterop", "--strict", "--skipLibCheck",
], { encoding: "utf8" });
assert.equal(compiled.status, 0, compiled.stdout + compiled.stderr);
const webhook = require(path.join(output, "app/api/meta/webhook/route.js"));
const customers = require(path.join(output, "app/api/customer-owners/route.js"));
const staff = require(path.join(output, "app/api/staff-accounts/route.js"));
const pending = require(path.join(output, "app/api/meta/pending/route.js"));
const status = require(path.join(output, "app/api/meta/status/route.js"));
const { neonConfig } = require("@neondatabase/serverless");

const adminKey = "meta-test-admin";
const appSecret = "meta-test-signature-secret";
const pageToken = "meta-test-page-token";
const fixture = (id = "lead-001") => ({ object: "page", entry: [{ id: "page-001", changes: [{
  field: "leadgen", value: { leadgen_id: id, page_id: "page-001", form_id: "form-001", ad_id: "ad-001", created_time: 1788560000 },
}] }] });
const fields = [
  { name: "full_name", values: ["Test Customer"] },
  { name: "country", values: ["India"] },
  { name: "phone_number", values: ["+91 9000000000"] },
  { name: "email", values: ["test@example.invalid"] },
];
function notification(payload = fixture()) {
  const body = JSON.stringify(payload);
  return new Request("https://crm.example.invalid/api/meta/webhook/", { method: "POST", body, headers: {
    "content-type": "application/json",
    "x-hub-signature-256": `sha256=${createHmac("sha256", appSecret).update(body).digest("hex")}`,
  } });
}
async function listCustomers(key = adminKey) {
  const response = await customers.POST(new Request("https://crm.example.invalid/api/customer-owners/", {
    method: "POST", headers: { "content-type": "application/json", "x-meimi-staff-key": key },
    body: JSON.stringify({ action: "list" }),
  }));
  assert.equal(response.status, 200);
  return (await response.json()).records;
}

function customerRequest(action, data = {}, key = adminKey) {
  return new Request("https://crm.example.invalid/api/customer-owners/", { method: "POST",
    headers: { "content-type": "application/json", "x-meimi-staff-key": key },
    body: JSON.stringify({ action, ...data }),
  });
}

await test("Meta form delivery to the administrator inbox", async (suite) => {
  const db = new PGlite();
  const originalFetch = globalThis.fetch;
  const originalDbFetch = neonConfig.fetchFunction;
  const savedEnv = { ...process.env };
  let salesId;
  let graphFailure = false;
  let graphFields = fields;
  process.env.DATABASE_URL = "postgresql://test:test@db.example.invalid/test";
  process.env.MEIMI_ADMIN_SYNC_KEY = adminKey;
  process.env.META_APP_SECRET = appSecret;
  process.env.META_PAGE_ACCESS_TOKEN = pageToken;
  process.env.META_WEBHOOK_VERIFY_TOKEN = "meta-test-verify";
  // Only the external database transport is replaced; all SQL runs on real Postgres.
  neonConfig.fetchFunction = async (_url, init) => {
    const input = JSON.parse(init.body);
    const run = async ({ query, params }) => {
      const result = await db.query(query, params);
      return { fields: result.fields, rows: result.rows.map((row) => result.fields.map(({ name }) => {
        const value = row[name];
        return value == null ? null : typeof value === "object" ? JSON.stringify(value) : String(value);
      })), rowCount: result.affectedRows ?? result.rows.length };
    };
    return Response.json(input.queries ? { results: await Promise.all(input.queries.map(run)) } : await run(input));
  };
  globalThis.fetch = async (url, init) => {
    assert.equal(new URL(url).hostname, "graph.facebook.com");
    assert.equal(new URL(url).searchParams.has("access_token"), false);
    assert.equal(init.headers.Authorization, `Bearer ${pageToken}`);
    if (graphFailure) return Response.json({ error: { code: 190 } }, { status: 400 });
    return Response.json({ id: new URL(url).pathname.split("/").pop(), created_time: "2026-09-05T00:00:00+0000", field_data: graphFields });
  };
  try {
    await suite.test("a signed form submission reaches the unassigned inbox without clicking import", async () => {
      assert.equal((await webhook.POST(notification())).status, 200);
      const records = await listCustomers();
      assert.equal(records.length, 1);
      assert.equal(records[0].client, "Test Customer");
      assert.equal(records[0].ownerAccountId, "");
      assert.equal(records[0].leadSource, "meta");
      assert.equal(records[0].metaFormId, "form-001");
    });
    await suite.test("a salesperson cannot claim an administrator's pending lead", async () => {
      const registered = await staff.POST(new Request("https://crm.example.invalid/api/staff-accounts/", {
        method: "POST", body: JSON.stringify({ action: "register", name: "Test Sales", loginKey: "test-sales-login" }),
      }));
      assert.equal(registered.status, 201);
      salesId = (await registered.json()).account.id;
      const record = (await listCustomers())[0];
      const response = await customers.POST(customerRequest("upsert", { ownerKey: "in:9000000000", record }, "test-sales-login"));
      assert.equal(response.status, 409);
      assert.equal((await listCustomers())[0].ownerAccountId, "");
    });
    await suite.test("only an administrator can assign leads; duplicates preserve the assigned salesperson", async () => {
      assert.equal((await listCustomers("test-sales-login")).length, 0);
      const assignment = { salesAccountId: salesId, quantity: 1 };
      assert.equal((await customers.POST(customerRequest("assign-pending", assignment, "test-sales-login"))).status, 400);
      const response = await customers.POST(customerRequest("assign-pending", assignment));
      assert.equal(response.status, 200);
      assert.equal((await response.json()).assigned, 1);
      assert.equal((await listCustomers("test-sales-login")).length, 1);
      assert.equal((await webhook.POST(notification())).status, 200);
      assert.equal((await webhook.POST(notification(fixture("lead-duplicate")))).status, 200);
      const records = await listCustomers();
      assert.equal(records.length, 1);
      assert.equal(records[0].ownerAccountId, salesId);
      assert.equal(records[0].metaLeadId, "lead-001");
      assert.equal(records[0].metaFormId, "form-001");
    });
    await suite.test("invalid signatures and missing secrets cannot create customer data", async () => {
      const request = notification(fixture("lead-invalid"));
      request.headers.set("x-hub-signature-256", "sha256=invalid");
      assert.equal((await webhook.POST(request)).status, 403);
      delete process.env.META_APP_SECRET;
      assert.equal((await webhook.POST(notification(fixture("lead-no-secret")))).status, 503);
      process.env.META_APP_SECRET = appSecret;
      assert.equal((await listCustomers()).length, 1);
    });
    await suite.test("a Graph failure remains retryable and is imported only once after recovery", async () => {
      graphFailure = true;
      assert.equal((await webhook.POST(notification(fixture("lead-retry")))).status, 503);
      assert.equal((await listCustomers()).length, 1);
      graphFailure = false;
      graphFields = fields.map((field) => field.name === "phone_number" ? { ...field, values: ["+91 9000000001"] } : field);
      assert.equal((await webhook.POST(notification(fixture("lead-retry")))).status, 200);
      assert.equal((await webhook.POST(notification(fixture("lead-retry")))).status, 200);
      assert.equal((await listCustomers()).length, 2);
      assert.equal((await listCustomers("test-sales-login")).length, 1);
    });
    await suite.test("missing country stays pending; administrator correction imports immediately and cannot rewrite terminal leads", async () => {
      graphFields = fields.filter((field) => field.name !== "country").map((field) => field.name === "phone_number" ? { ...field, values: ["+91 9000000002"] } : field);
      assert.equal((await webhook.POST(notification(fixture("lead-mapping")))).status, 200);
      assert.equal((await listCustomers()).length, 2);
      const request = () => new Request("https://crm.example.invalid/api/meta/pending/", {
        method: "PATCH", headers: { "x-meimi-admin-key": adminKey },
        body: JSON.stringify({ leadgenId: "lead-mapping", country: "India", phone: "+91 9000000002" }),
      });
      assert.equal((await pending.PATCH(request())).status, 200);
      assert.equal((await listCustomers()).length, 3);
      assert.equal((await pending.PATCH(request())).status, 409);
    });
    await suite.test("configuration status separates readiness from actual deliveries and duplicates", async () => {
      const request = () => new Request("https://crm.example.invalid/api/meta/status/", { headers: { "x-meimi-admin-key": adminKey } });
      const ready = await (await status.GET(request())).json();
      assert.equal(ready.databaseReachable, true);
      assert.equal(ready.imported, 3);
      assert.equal(ready.duplicates, 1);
      assert.equal(ready.pending, 0);
      delete process.env.META_APP_SECRET;
      const incomplete = await (await status.GET(request())).json();
      assert.equal(incomplete.readyForWebhook, false);
      process.env.META_APP_SECRET = appSecret;
    });
  } finally {
    globalThis.fetch = originalFetch;
    neonConfig.fetchFunction = originalDbFetch;
    for (const key of ["DATABASE_URL", "MEIMI_ADMIN_SYNC_KEY", "META_APP_SECRET", "META_PAGE_ACCESS_TOKEN", "META_WEBHOOK_VERIFY_TOKEN"]) {
      if (savedEnv[key] === undefined) delete process.env[key];
      else process.env[key] = savedEnv[key];
    }
    await db.close();
  }
});
