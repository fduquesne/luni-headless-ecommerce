import { AppDeps } from "@/app.ts";
import { LogFields, Logger, LogLevel } from "@/logger.ts";

export interface LogEntry {
  level: LogLevel;
  message: string;
  fields: LogFields;
}

/** Logger that keeps entries in memory so tests can inspect them. */
export function createMemoryLogger(): Logger & { entries: LogEntry[] } {
  const entries: LogEntry[] = [];
  const push = (level: LogLevel) => (message: string, fields: LogFields = {}) => {
    entries.push({ level, message, fields });
  };
  return { entries, info: push("info"), warn: push("warn"), error: push("error") };
}

/** Default dependencies for tests; override only what a test cares about. */
export function createTestDeps(overrides: Partial<AppDeps> = {}): AppDeps {
  return { version: "0.0.0-test", logger: createMemoryLogger(), ...overrides };
}
