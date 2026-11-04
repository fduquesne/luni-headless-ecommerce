import denoConfig from "../deno.json" with { type: "json" };
import { createApp } from "@/app.ts";
import { Config, ConfigError, loadConfig } from "@/config.ts";
import { createJsonLogger } from "@/logger.ts";

/** Signals that trigger a graceful shutdown. SIGTERM is not available on Windows. */
const SHUTDOWN_SIGNALS: Deno.Signal[] = Deno.build.os === "windows"
  ? ["SIGINT", "SIGBREAK"]
  : ["SIGINT", "SIGTERM"];

/** Loads the configuration, or exits with a readable message if it is invalid. */
function readConfigOrExit(): Config {
  try {
    return loadConfig();
  } catch (error) {
    if (error instanceof ConfigError) {
      console.error(error.message);
      Deno.exit(1);
    }
    throw error;
  }
}

async function main(): Promise<void> {
  const config = readConfigOrExit();
  const version = denoConfig.version;
  const logger = createJsonLogger();
  const app = createApp({ version, logger });

  const server = Deno.serve({
    hostname: "0.0.0.0",
    port: config.port,
    onListen: ({ port }) => {
      logger.info(`Luni API v${version} listening on http://localhost:${port}`);
    },
  }, app.fetch);

  // Graceful shutdown: stop accepting connections, let in-flight requests finish.
  let shuttingDown = false;
  const handlers = SHUTDOWN_SIGNALS.map((signal) => {
    const handler = () => {
      if (shuttingDown) return;
      shuttingDown = true;
      logger.info(`${signal} received, shutting down...`);
      void server.shutdown();
    };
    Deno.addSignalListener(signal, handler);
    return { signal, handler };
  });

  await server.finished;

  for (const { signal, handler } of handlers) {
    Deno.removeSignalListener(signal, handler);
  }

  logger.info("Luni API stopped");
}

if (import.meta.main) {
  await main();
}
