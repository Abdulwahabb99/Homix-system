import dotenv from "dotenv";
import { Client } from "pg";
import { z } from "zod";

dotenv.config();

const connectionSchema = z.object({
  database: z.string().min(1),
  host: z.string().min(1),
  password: z.string().min(1),
  port: z.coerce.number().int().positive().default(5432),
  user: z.string().min(1),
});

const parityEnvSchema = z.object({
  DB_HOST: z.string().min(1),
  DB_NAME: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive().default(5432).optional(),
  DB_USER: z.string().min(1),
  PARITY_SOURCE_DB_HOST: z.string().min(1),
  PARITY_SOURCE_DB_NAME: z.string().min(1),
  PARITY_SOURCE_DB_PASSWORD: z.string().min(1),
  PARITY_SOURCE_DB_PORT: z.coerce.number().int().positive().default(5432).optional(),
  PARITY_SOURCE_DB_USER: z.string().min(1),
});

type DbConnection = z.infer<typeof connectionSchema>;

type SchemaSnapshot = {
  columns: string[];
  constraints: string[];
  indexes: string[];
  tables: string[];
};

type PgClientConfig = DbConnection & {
  ssl?: {
    rejectUnauthorized: boolean;
    require: boolean;
  };
};

type ColumnRow = {
  column_default: string;
  column_name: string;
  data_type: string;
  is_nullable: string;
  table_name: string;
};

type IndexRow = {
  index_definition: string;
  index_name: string;
  table_name: string;
};

type ConstraintRow = {
  constraint_definition: string;
  constraint_name: string;
  constraint_type: string;
  table_name: string;
};

type TableRow = {
  table_name: string;
};

const COLUMN_QUERY = `
  SELECT
    table_name,
    column_name,
    data_type,
    is_nullable,
    COALESCE(column_default, '') AS column_default
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name IN (
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    )
  ORDER BY table_name, ordinal_position;
`;

const INDEX_QUERY = `
  SELECT
    tablename AS table_name,
    indexname AS index_name,
    indexdef AS index_definition
  FROM pg_indexes
  WHERE schemaname = 'public'
  ORDER BY tablename, indexname;
`;

const CONSTRAINT_QUERY = `
  SELECT
    c.conrelid::regclass::text AS table_name,
    c.conname AS constraint_name,
    c.contype AS constraint_type,
    pg_get_constraintdef(c.oid, true) AS constraint_definition
  FROM pg_constraint c
  JOIN pg_namespace n ON n.oid = c.connamespace
  WHERE n.nspname = 'public'
    AND c.contype IN ('p', 'u', 'f')
  ORDER BY c.conrelid::regclass::text, c.conname;
`;

const TABLE_QUERY = `
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  ORDER BY table_name;
`;

const normalizeWhitespace = (value: string): string => value.replace(/\s+/g, " ").trim();
const normalizeQuotedIdentifier = (value: string): string => value.replace(/"/g, "");
const normalizePublicPrefix = (value: string): string => value.replace(/\bpublic\./g, "");

const shouldUseSsl = (host: string): boolean => {
  return host !== "localhost" && host !== "127.0.0.1";
};

const toDiffKey = (parts: string[]): string => normalizeWhitespace(parts.join(" | "));

const normalizeIndexDefinition = (indexDefinition: string): string => {
  const compactDefinition = normalizePublicPrefix(normalizeQuotedIdentifier(normalizeWhitespace(indexDefinition)));
  return compactDefinition.replace(
    /^CREATE\s+(UNIQUE\s+)?INDEX\s+\S+\s+ON\s+\S+\s+USING\s+/i,
    (_match, uniqueClause: string | undefined) => `${uniqueClause ? "UNIQUE " : ""}USING `,
  );
};

const normalizeConstraintDefinition = (definition: string): string => {
  return normalizePublicPrefix(normalizeQuotedIdentifier(normalizeWhitespace(definition)));
};

const toUniqueSortedArray = (values: string[]): string[] => [...new Set(values)].sort();

const getConnectionFromEnv = (
  prefix: "PARITY_SOURCE_" | "TARGET_",
  env: z.infer<typeof parityEnvSchema>,
): DbConnection => {
  if (prefix === "PARITY_SOURCE_") {
    return connectionSchema.parse({
      database: env.PARITY_SOURCE_DB_NAME,
      host: env.PARITY_SOURCE_DB_HOST,
      password: env.PARITY_SOURCE_DB_PASSWORD,
      port: env.PARITY_SOURCE_DB_PORT ?? 5432,
      user: env.PARITY_SOURCE_DB_USER,
    });
  }

  return connectionSchema.parse({
    database: env.DB_NAME,
    host: env.DB_HOST,
    password: env.DB_PASSWORD,
    port: env.DB_PORT ?? 5432,
    user: env.DB_USER,
  });
};

const loadSnapshot = async (connection: DbConnection): Promise<SchemaSnapshot> => {
  const clientConfig: PgClientConfig = shouldUseSsl(connection.host)
    ? {
        ...connection,
        ssl: {
          rejectUnauthorized: false,
          require: true,
        },
      }
    : connection;
  const client = new Client(clientConfig);
  await client.connect();

  try {
    const [columnsResult, indexesResult, constraintsResult, tablesResult] = await Promise.all([
      client.query(COLUMN_QUERY),
      client.query(INDEX_QUERY),
      client.query(CONSTRAINT_QUERY),
      client.query(TABLE_QUERY),
    ]);

    return {
      columns: toUniqueSortedArray((columnsResult.rows as ColumnRow[]).map((row) =>
        toDiffKey([
          row.table_name,
          row.column_name,
          row.data_type,
          row.is_nullable,
          row.column_default,
        ]),
      )),
      constraints: toUniqueSortedArray((constraintsResult.rows as ConstraintRow[]).map((row) =>
        toDiffKey([
          row.table_name,
          row.constraint_type,
          normalizeConstraintDefinition(row.constraint_definition),
        ]),
      )),
      indexes: toUniqueSortedArray((indexesResult.rows as IndexRow[]).map((row) =>
        toDiffKey([row.table_name, normalizeIndexDefinition(row.index_definition)]),
      )),
      tables: toUniqueSortedArray((tablesResult.rows as TableRow[]).map((row) => String(row.table_name))),
    };
  } finally {
    await client.end();
  }
};

const getMissingEntries = (source: string[], target: string[]): string[] => {
  const targetSet = new Set(target);
  return source.filter((entry) => !targetSet.has(entry));
};

const printSection = (title: string, items: string[]): void => {
  if (items.length === 0) {
    console.log(`${title}: 0`);
    return;
  }

  console.log(`${title}: ${items.length}`);
  for (const item of items.slice(0, 25)) {
    console.log(`  - ${item}`);
  }

  if (items.length > 25) {
    console.log(`  ... and ${items.length - 25} more`);
  }
};

const main = async (): Promise<void> => {
  const parsedEnv = parityEnvSchema.safeParse(process.env);
  if (!parsedEnv.success) {
    const issues = parsedEnv.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
    throw new Error(`Invalid parity environment configuration:\n${issues.join("\n")}`);
  }

  const source = getConnectionFromEnv("PARITY_SOURCE_", parsedEnv.data);
  const target = getConnectionFromEnv("TARGET_", parsedEnv.data);

  console.log(`Comparing source ${source.host}/${source.database} -> target ${target.host}/${target.database}`);

  const [sourceSnapshot, targetSnapshot] = await Promise.all([
    loadSnapshot(source),
    loadSnapshot(target),
  ]);

  const missingTables = getMissingEntries(sourceSnapshot.tables, targetSnapshot.tables);
  const extraTables = getMissingEntries(targetSnapshot.tables, sourceSnapshot.tables);
  const missingColumns = getMissingEntries(sourceSnapshot.columns, targetSnapshot.columns);
  const extraColumns = getMissingEntries(targetSnapshot.columns, sourceSnapshot.columns);
  const missingIndexes = getMissingEntries(sourceSnapshot.indexes, targetSnapshot.indexes);
  const extraIndexes = getMissingEntries(targetSnapshot.indexes, sourceSnapshot.indexes);
  const missingConstraints = getMissingEntries(sourceSnapshot.constraints, targetSnapshot.constraints);
  const extraConstraints = getMissingEntries(targetSnapshot.constraints, sourceSnapshot.constraints);

  printSection("Missing tables in target", missingTables);
  printSection("Extra tables in target", extraTables);
  printSection("Missing columns in target", missingColumns);
  printSection("Extra columns in target", extraColumns);
  printSection("Missing indexes in target", missingIndexes);
  printSection("Extra indexes in target", extraIndexes);
  printSection("Missing constraints in target", missingConstraints);
  printSection("Extra constraints in target", extraConstraints);

  const totalDiffs =
    missingTables.length +
    extraTables.length +
    missingColumns.length +
    extraColumns.length +
    missingIndexes.length +
    extraIndexes.length +
    missingConstraints.length +
    extraConstraints.length;

  if (totalDiffs > 0) {
    process.exitCode = 1;
    console.log(`Schema parity failed with ${totalDiffs} differences.`);
    return;
  }

  console.log("Schema parity check passed.");
};

void main();
