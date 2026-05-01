import pino from "pino";

import { env } from "../../config/env";

export const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  name: "homix-api",
  redact: ["req.headers.authorization"],
});
