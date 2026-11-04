import { assertEquals, assertMatch, assertNotEquals } from "@std/assert";
import { createApp } from "@/app.ts";
import { createMemoryLogger, createTestDeps } from "../unit/helpers/deps.ts";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

Deno.test("a request id is generated when non is sent", async () => {
  const res = await createApp(createTestDeps()).request("/");
  assertMatch(res.headers.get("X-Request-Id") ?? "", UUID);
});

Deno.test("an incoming request id is echoed back", async () => {
  const res = await createApp(createTestDeps()).request("/", {
    headers: { "X-Request-Id": "checkout-42" },
  });
  assertEquals(res.headers.get("X-Request-Id"), "checkout-42");
});

Deno.test("an invalid incoming request id is replaced", async () => {
  const res = await createApp(createTestDeps()).request("/", {
    headers: { "X-Request-Id": "bad id with spaces" },
  });
  assertNotEquals(res.headers.get("X-Request-Id"), "bad id with spaces");
});

Deno.test("each request is logged with its request id and status", async () => {
  const logger = createMemoryLogger();
  await createApp(createTestDeps({ logger })).request("/", {
    headers: { "X-Request-Id": "log-me" },
  });

  assertEquals(logger.entries.length, 1);

  const [entry] = logger.entries;
  assertEquals(entry.message, "request completed");
  assertEquals(entry.fields.requestId, "log-me");
  assertEquals(entry.fields.method, "GET");
  assertEquals(entry.fields.path, "/");
  assertEquals(entry.fields.status, 200);
});
