import { assertEquals, assertThrows } from "@std/assert";
import { ConfigError, parseConfig } from "@/config.ts";

Deno.test("parseConfig applies defaults when nothing is set", () => {
  assertEquals(parseConfig({}), { port: 8000, allowedOrigins: [], kvPath: "./data/luni.sqlite3" });
});

Deno.test("parseConfig reads and convert every variable", () => {
  const config = parseConfig({
    PORT: "9000",
    ALLOWED_ORIGINS: "http://localhost:3000, https://shop.luni.example",
    KV_PATH: ":memory:",
  });

  assertEquals(config, {
    port: 9000,
    allowedOrigins: ["http://localhost:3000", "https://shop.luni.example"],
    kvPath: ":memory:",
  });
});

Deno.test("parseConfig rejects an out-of-range port", () => {
  assertThrows(() => parseConfig({ PORT: "700000" }), ConfigError, "PORT");
});

Deno.test("parseConfig rejects a non-numeric port", () => {
  assertThrows(() => parseConfig({ PORT: "abc" }), ConfigError, "PORT");
});

Deno.test("parseConfig rejects an origin with a path", () => {
  assertThrows(
    () => parseConfig({ ALLOWED_ORIGINS: "https://shop.luni.example/path" }),
    ConfigError,
    "ALLOWED_ORIGINS",
  );
});
