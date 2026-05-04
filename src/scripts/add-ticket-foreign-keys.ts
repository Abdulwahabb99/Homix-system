import dotenv from "dotenv";
import pg from "pg";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  DB_HOST: z.string().min(1),
  DB_NAME: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive().default(5432).optional(),
  DB_USER: z.string().min(1),
});

const constraintNames = {
  assignee: "tickets_assignedToUserId_fkey",
  creator: "tickets_createdByUserId_fkey",
  order: "tickets_orderId_fkey",
} as const;

const createClient = (env: z.infer<typeof envSchema>): PgClient =>
  new Client({
    database: env.DB_NAME,
    host: env.DB_HOST,
    password: env.DB_PASSWORD,
    port: env.DB_PORT ?? 5432,
    ssl: env.DB_HOST === "localhost" || env.DB_HOST === "127.0.0.1"
      ? undefined
      : { rejectUnauthorized: false, require: true },
    user: env.DB_USER,
  });

const countOrphans = async (client: PgClient, query: string): Promise<number> => {
  const result = await client.query(query);
  return Number((result.rows[0] as { count?: string } | undefined)?.count ?? 0);
};

const constraintExists = async (client: PgClient, constraintName: string): Promise<boolean> => {
  const result = await client.query(
    `
      SELECT EXISTS (
        SELECT 1
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace
        WHERE n.nspname = 'public'
          AND t.relname = 'tickets'
          AND c.conname = $1
      ) AS exists
    `,
    [constraintName],
  );
  return ((result.rows[0] as { exists?: boolean } | undefined)?.exists) ?? false;
};

const main = async (): Promise<void> => {
  const env = envSchema.parse(process.env);
  const client = createClient(env);

  await client.connect();

  try {
    const [assignedOrphans, createdOrphans, orderOrphans] = await Promise.all([
      countOrphans(
        client,
        `
          SELECT COUNT(*)::text AS count
          FROM tickets t
          LEFT JOIN users u ON u.id = t."assignedToUserId"
          WHERE t."assignedToUserId" IS NOT NULL
            AND u.id IS NULL
        `,
      ),
      countOrphans(
        client,
        `
          SELECT COUNT(*)::text AS count
          FROM tickets t
          LEFT JOIN users u ON u.id = t."createdByUserId"
          WHERE t."createdByUserId" IS NOT NULL
            AND u.id IS NULL
        `,
      ),
      countOrphans(
        client,
        `
          SELECT COUNT(*)::text AS count
          FROM tickets t
          LEFT JOIN orders o ON o.id = t."orderId"
          WHERE o.id IS NULL
        `,
      ),
    ]);

    if (assignedOrphans > 0 || createdOrphans > 0 || orderOrphans > 0) {
      throw new Error(
        `Ticket FK migration blocked by orphan rows: assigned=${assignedOrphans}, creator=${createdOrphans}, order=${orderOrphans}`,
      );
    }

    await client.query("BEGIN");

    if (!(await constraintExists(client, constraintNames.order))) {
      await client.query(`
        ALTER TABLE "tickets"
        ADD CONSTRAINT "tickets_orderId_fkey"
        FOREIGN KEY ("orderId") REFERENCES "orders" ("id")
        ON UPDATE CASCADE ON DELETE CASCADE;
      `);
    }

    if (!(await constraintExists(client, constraintNames.assignee))) {
      await client.query(`
        ALTER TABLE "tickets"
        ADD CONSTRAINT "tickets_assignedToUserId_fkey"
        FOREIGN KEY ("assignedToUserId") REFERENCES "users" ("id")
        ON UPDATE CASCADE ON DELETE SET NULL;
      `);
    }

    if (!(await constraintExists(client, constraintNames.creator))) {
      await client.query(`
        ALTER TABLE "tickets"
        ADD CONSTRAINT "tickets_createdByUserId_fkey"
        FOREIGN KEY ("createdByUserId") REFERENCES "users" ("id")
        ON UPDATE CASCADE ON DELETE SET NULL;
      `);
    }

    await client.query("COMMIT");
    console.log("Ticket foreign keys are in place.");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    await client.end();
  }
};

void main();
const { Client } = pg;
type PgClient = InstanceType<typeof Client>;
