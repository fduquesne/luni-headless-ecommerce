import { assertEquals } from "@std/assert";
import { createJsonLogger } from "@/logger.ts";

Deno.test("createJsonLogger writes one JSON object per entry", () => {
  const lines: string[] = [];
  const logger = createJsonLogger((line) => lines.push(line));

  logger.warn("low stock", { variant: "LU-1001-BLK" });

  const entry = JSON.parse(lines[0]);
  assertEquals(entry.level, "warn");
  assertEquals(entry.message, "low stock");
  assertEquals(entry.variant, "LU-1001-BLK");
});
