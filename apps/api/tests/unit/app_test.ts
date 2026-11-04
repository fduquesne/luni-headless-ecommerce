import { assertEquals } from "@std/assert";
import { createApp } from "@/app.ts";
import { createTestDeps } from "./helpers/deps.ts";

Deno.test("GET / returns the api name and version", async () => {
  const app = createApp(createTestDeps());
  const res = await app.request("/");

  assertEquals(res.status, 200);
  assertEquals(await res.json(), { name: "Luni API", version: "0.0.0-test" });
});
