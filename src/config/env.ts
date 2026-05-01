import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const dialectSchema = z.enum(["postgres", "mysql", "mariadb", "sqlite", "mssql"]);

const envSchema = z.object({
  APP_URL: z.string().url(),
  DB_DIALECT: dialectSchema,
  DB_HOST: z.string().min(1),
  DB_NAME: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
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
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const issues = parsedEnv.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
  throw new Error(`Invalid environment configuration:\n${issues.join("\n")}`);
}

export const env = parsedEnv.data;

export type AppEnv = typeof env;
