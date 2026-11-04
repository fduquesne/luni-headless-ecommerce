import { z } from "zod";

/** Environment variables read by the API. */
export const CONFIG_ENV_KEYS = ["PORT", "ALLOWED_ORIGINS", "KV_PATH"] as const;

type ConfigEnvKey = (typeof CONFIG_ENV_KEYS)[number];
export type RawEnv = Partial<Record<ConfigEnvKey, string>>;

const DEFAULT_PORT = 8000;
const DEFAULT_KV_PATH = "./data/luni.sqlite3";

/** True when the value is exactly an origin. */
function isOrigin(value: string): boolean {
  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") && url.origin === value;
  } catch {
    return false;
  }
}

const ConfigSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(DEFAULT_PORT),
  ALLOWED_ORIGINS: z.string().default("").transform((value) =>
    value.split(",").map((origin) => origin.trim()).filter((origin) => origin.length > 0)
  ).pipe(
    z.array(z.string().refine(isOrigin, { message: "must be a comma-separated list of origins" })),
  ),
  KV_PATH: z.string().min(1).default(DEFAULT_KV_PATH),
}).transform((env) => {
  return { port: env.PORT, allowedOrigins: env.ALLOWED_ORIGINS, kvPath: env.KV_PATH };
});

/** Validated configuration of the API. */
export type Config = z.output<typeof ConfigSchema>;

/** Raised when the environment does not describe a valid configuration. */
export class ConfigError extends Error {
  override name = "ConfigError";
}

/** Validates raw environment values. Pure: no access to Deno.env. */
export function parseConfig(env: RawEnv): Config {
  const result = ConfigSchema.safeParse(env);
  if (!result.success) {
    throw new ConfigError(`Invalid configuration:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

/** Reads the configuration from the process environment. */
export function loadConfig(): Config {
  const env: RawEnv = {};
  for (const key of CONFIG_ENV_KEYS) {
    const value = Deno.env.get(key);
    if (value !== undefined) env[key] = value;
  }
  return parseConfig(env);
}
