/** Extra structured data attached to a log entry. */
export type LogFields = Record<string, unknown>;

export type LogLevel = "info" | "warn" | "error";

export interface Logger {
  info(message: string, fields?: LogFields): void;
  warn(message: string, fields?: LogFields): void;
  error(message: string, fields?: LogFields): void;
}

/** Logger writing one JSON object per line, ready for log collectors. */
export function createJsonLogger(write: (line: string) => void = console.log): Logger {
  const log = (level: LogLevel, message: string, fields: LogFields = {}) => {
    write(JSON.stringify({ time: new Date().toISOString(), level, message, ...fields }));
  };
  return {
    info: (message, fields) => log("info", message, fields),
    warn: (message, fields) => log("warn", message, fields),
    error: (message, fields) => log("error", message, fields),
  };
}
