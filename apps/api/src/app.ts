import { OpenAPIHono } from "@hono/zod-openapi";
import { requestId, RequestIdVariables } from "@hono/hono/request-id";
import { Logger } from "@/logger.ts";
import { requestLogger } from "@/middleware/request_logger.ts";

export interface AppDeps {
  /** Version of the API, as declared in apps/api/deno.json. */
  readonly version: string;
  /** Structured logger; a JSON logger in production, an in-memory one in tests. */
  readonly logger: Logger;
}

/** Hono environment shared by every route and middleware. */
export type AppEnv = {
  Variables: RequestIdVariables;
};

export function createApp(deps: AppDeps): OpenAPIHono<AppEnv> {
  const app = new OpenAPIHono<AppEnv>();

  app.use(requestId());
  app.use(requestLogger(deps.logger));

  app.get("/", (c) => {
    return c.json({ name: "Luni API", version: deps.version });
  });

  return app;
}
