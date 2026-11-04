import { OpenAPIHono } from "@hono/zod-openapi";

export interface AppDeps {
  readonly version: string;
}

export type AppEnv = {
  Variables: Record<string, string>;
};

export function createApp(deps: AppDeps): OpenAPIHono<AppEnv> {
  const app = new OpenAPIHono<AppEnv>();

  app.get("/", (c) => {
    return c.json({ name: "Luni API", version: deps.version });
  });

  return app;
}
