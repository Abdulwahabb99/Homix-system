import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const dialectSchema = z.enum(["postgres", "mysql", "mariadb", "sqlite", "mssql"]);
const booleanFromEnv = z
  .union([z.boolean(), z.string()])
  .transform((value, context) => {
    if (typeof value === "boolean") {
      return value;
    }

    const normalizedValue = value.trim().toLowerCase();

    if (["true", "1", "yes", "on"].includes(normalizedValue)) {
      return true;
    }

    if (["false", "0", "no", "off", ""].includes(normalizedValue)) {
      return false;
    }

    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Expected boolean-like env value",
    });

    return z.NEVER;
  });

const envSchema = z.object({
  APP_URL: z.string().url(),
  DB_DIALECT: dialectSchema,
  DB_HOST: z.string().min(1),
  DB_NAME: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_SYNC: booleanFromEnv.default(false),
  DB_SYNC_ALTER: booleanFromEnv.default(false),
  DB_SYNC_FORCE: booleanFromEnv.default(false),
  DB_USER: z.string().min(1),
  DEFAULT_ADMIN_PASSWORD: z.string().min(1),
  DEFAULT_PASSWORD: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NODE_PORT: z.coerce.number().int().positive().default(3000),
  SHOPIFY_APP_KEY: z.string().min(1),
  SHOPIFY_APP_SECRET: z.string().min(1),
  SHOPIFY_STORE: z.string().min(1),
  SHOPIFY_TOKEN: z.string().min(1),
  UPLOADS_DIR: z.string().min(1).default("uploads"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const issues = parsedEnv.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
  throw new Error(`Invalid environment configuration:\n${issues.join("\n")}`);
}

export const env = parsedEnv.data;

export type AppEnv = typeof env;
