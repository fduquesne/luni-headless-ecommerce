import { assertEquals } from "@std/assert";
import { createApp } from "@/app.ts";

Deno.test("GET / returns the api name and version", async () => {
  const app = createApp({ version: "0.0.0-test" });
  const res = await app.request("/");

  assertEquals(res.status, 200);
  assertEquals(await res.json(), { name: "Luni API", version: "0.0.0-test" });
});
