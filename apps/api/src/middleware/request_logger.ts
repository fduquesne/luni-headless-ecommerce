import { createMiddleware } from "@hono/hono/factory";
import { AppEnv } from "@/app.ts";
import { Logger } from "@/logger.ts";

/** Logs one structured line per request, once the response is ready. */
export function requestLogger(logger: Logger) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const start = performance.now();
    await next();
    logger.info("request completed", {
      requestId: c.get("requestId"),
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      durationMs: Math.round((performance.now() - start) * 10) / 10,
    });
  });
}
