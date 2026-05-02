"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const dialectSchema = zod_1.z.enum(["postgres", "mysql", "mariadb", "sqlite", "mssql"]);
const booleanFromEnv = zod_1.z
    .union([zod_1.z.boolean(), zod_1.z.string()])
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
        code: zod_1.z.ZodIssueCode.custom,
        message: "Expected boolean-like env value",
    });
    return zod_1.z.NEVER;
});
const envSchema = zod_1.z.object({
    APP_URL: zod_1.z.string().url(),
    DB_DIALECT: dialectSchema,
    DB_HOST: zod_1.z.string().min(1),
    DB_NAME: zod_1.z.string().min(1),
    DB_PASSWORD: zod_1.z.string().min(1),
    DB_SYNC: booleanFromEnv.default(false),
    DB_SYNC_ALTER: booleanFromEnv.default(false),
    DB_SYNC_FORCE: booleanFromEnv.default(false),
    DB_USER: zod_1.z.string().min(1),
    DEFAULT_ADMIN_PASSWORD: zod_1.z.string().min(1),
    DEFAULT_PASSWORD: zod_1.z.string().min(1),
    JWT_SECRET: zod_1.z.string().min(1),
    NODE_ENV: zod_1.z.enum(["development", "test", "production"]).default("development"),
    NODE_PORT: zod_1.z.coerce.number().int().positive().default(3000),
    SHOPIFY_APP_KEY: zod_1.z.string().min(1),
    SHOPIFY_APP_SECRET: zod_1.z.string().min(1),
    SHOPIFY_STORE: zod_1.z.string().min(1),
    SHOPIFY_TOKEN: zod_1.z.string().min(1),
});
const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
    const issues = parsedEnv.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
    throw new Error(`Invalid environment configuration:\n${issues.join("\n")}`);
}
exports.env = parsedEnv.data;
//# sourceMappingURL=env.js.map