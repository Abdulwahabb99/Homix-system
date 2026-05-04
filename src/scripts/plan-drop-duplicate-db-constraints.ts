import fs from "fs";
import path from "path";

import dotenv from "dotenv";
import { Client } from "pg";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PARITY_SOURCE_DB_HOST: z.string().min(1),
  PARITY_SOURCE_DB_NAME: z.string().min(1),
  PARITY_SOURCE_DB_PASSWORD: z.string().min(1),
  PARITY_SOURCE_DB_PORT: z.coerce.number().int().positive().default(5432).optional(),
  PARITY_SOURCE_DB_USER: z.string().min(1),
});

type DbConnection = {
  database: string;
  host: string;
  password: string;
  port: number;
  user: string;
};

type PgClient = {
  connect: () => Promise<void>;
  end: () => Promise<void>;
  query: (queryText: string) => Promise<{ rows: Array<Record<string, unknown>> }>;
};

type ConstraintRow = {
  constraint_definition: string;
  constraint_name: string;
  constraint_type: string;
  table_name: string;
};

type IndexRow = {
  index_definition: string;
  index_name: string;
  table_name: string;
};

type DuplicateGroup = {
  dropStatements: string[];
  itemType: "constraint" | "index";
  keepName: string;
  normalizedDefinition: string;
  tableName: string;
};

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

const INDEX_QUERY = `
  SELECT
    tablename AS table_name,
    indexname AS index_name,
    indexdef AS index_definition
  FROM pg_indexes
  WHERE schemaname = 'public'
  ORDER BY tablename, indexname;
`;

const normalizeWhitespace = (value: string): string => value.replace(/\s+/g, " ").trim();
const normalizeIdentifierQuotes = (value: string): string => value.replace(/"/g, "");
const normalizePublicPrefix = (value: string): string => value.replace(/\bpublic\./g, "");
const normalizeDefinition = (value: string): string =>
  normalizePublicPrefix(normalizeIdentifierQuotes(normalizeWhitespace(value)));
const normalizeTableName = (value: string): string =>
  normalizePublicPrefix(normalizeIdentifierQuotes(normalizeWhitespace(value)));
const quoteIdentifier = (value: string): string => `"${value.replace(/"/g, "\"\"")}"`;
const shouldUseSsl = (host: string): boolean => host !== "localhost" && host !== "127.0.0.1";

const normalizeIndexDefinition = (indexDefinition: string): string => {
  return normalizeDefinition(indexDefinition).replace(
    /^CREATE\s+(UNIQUE\s+)?INDEX\s+\S+\s+ON\s+\S+\s+USING\s+/i,
    (_match, uniqueClause: string | undefined) => `${uniqueClause ? "UNIQUE " : ""}USING `,
  );
};

const createClient = (connection: DbConnection): PgClient => {
  return new Client(
    shouldUseSsl(connection.host)
      ? { ...connection, ssl: { rejectUnauthorized: false, require: true } }
      : connection,
  ) as PgClient;
};

const getSourceConnection = (env: z.infer<typeof envSchema>): DbConnection => {
  return {
    database: env.PARITY_SOURCE_DB_NAME,
    host: env.PARITY_SOURCE_DB_HOST,
    password: env.PARITY_SOURCE_DB_PASSWORD,
    port: env.PARITY_SOURCE_DB_PORT ?? 5432,
    user: env.PARITY_SOURCE_DB_USER,
  };
};

const loadConstraints = async (client: PgClient): Promise<ConstraintRow[]> => {
  const result = await client.query(CONSTRAINT_QUERY);
  return (result.rows as ConstraintRow[]).map((row) => ({
    ...row,
    constraint_definition: normalizeDefinition(row.constraint_definition),
    constraint_name: normalizeIdentifierQuotes(row.constraint_name),
    table_name: normalizeTableName(row.table_name),
  }));
};

const loadIndexes = async (client: PgClient): Promise<IndexRow[]> => {
  const result = await client.query(INDEX_QUERY);
  return (result.rows as IndexRow[]).map((row) => ({
    ...row,
    index_definition: normalizeIndexDefinition(row.index_definition),
    index_name: normalizeIdentifierQuotes(row.index_name),
    table_name: normalizeTableName(row.table_name),
  }));
};

const buildConstraintDrop = (tableName: string, constraintName: string): string => {
  return `ALTER TABLE ${quoteIdentifier(tableName)} DROP CONSTRAINT ${quoteIdentifier(constraintName)};`;
};

const buildIndexDrop = (indexName: string): string => {
  return `DROP INDEX IF EXISTS ${quoteIdentifier(indexName)};`;
};

const chooseCanonicalName = (names: string[]): string => {
  return [...names].sort((left, right) => {
    const leftScore = /\d+$/.test(left) ? 1 : 0;
    const rightScore = /\d+$/.test(right) ? 1 : 0;
    if (leftScore !== rightScore) {
      return leftScore - rightScore;
    }

    return left.localeCompare(right);
  })[0] ?? names[0] ?? "";
};

const getConstraintDuplicates = (constraints: ConstraintRow[]): DuplicateGroup[] => {
  const groups = new Map<string, ConstraintRow[]>();

  for (const constraint of constraints) {
    const groupKey = [constraint.table_name, constraint.constraint_type, constraint.constraint_definition].join(" | ");
    const group = groups.get(groupKey) ?? [];
    group.push(constraint);
    groups.set(groupKey, group);
  }

  return [...groups.values()]
    .filter((group) => group.length > 1)
    .map((group) => {
      const keepName = chooseCanonicalName(group.map((item) => item.constraint_name));
      return {
        dropStatements: group
          .filter((item) => item.constraint_name !== keepName)
          .map((item) => buildConstraintDrop(item.table_name, item.constraint_name)),
        itemType: "constraint" as const,
        keepName,
        normalizedDefinition: group[0]?.constraint_definition ?? "",
        tableName: group[0]?.table_name ?? "",
      };
    });
};

const getIndexDuplicates = (indexes: IndexRow[]): DuplicateGroup[] => {
  const groups = new Map<string, IndexRow[]>();

  for (const index of indexes) {
    const groupKey = [index.table_name, index.index_definition].join(" | ");
    const group = groups.get(groupKey) ?? [];
    group.push(index);
    groups.set(groupKey, group);
  }

  return [...groups.values()]
    .filter((group) => group.length > 1)
    .map((group) => {
      const keepName = chooseCanonicalName(group.map((item) => item.index_name));
      return {
        dropStatements: group
          .filter((item) => item.index_name !== keepName)
          .map((item) => buildIndexDrop(item.index_name)),
        itemType: "index" as const,
        keepName,
        normalizedDefinition: group[0]?.index_definition ?? "",
        tableName: group[0]?.table_name ?? "",
      };
    });
};

const printGroups = (title: string, groups: DuplicateGroup[]): void => {
  console.log(`${title}: ${groups.length}`);
  for (const group of groups.slice(0, 25)) {
    console.log(`  - ${group.tableName}: keep ${group.keepName}`);
    console.log(`    ${group.normalizedDefinition}`);
  }
  if (groups.length > 25) {
    console.log(`  ... and ${groups.length - 25} more`);
  }
};

const main = async (): Promise<void> => {
  const parsedEnv = envSchema.parse(process.env);
  const client = createClient(getSourceConnection(parsedEnv));
  await client.connect();

  try {
    const [constraints, indexes] = await Promise.all([loadConstraints(client), loadIndexes(client)]);
    const duplicateConstraints = getConstraintDuplicates(constraints);
    const duplicateIndexes = getIndexDuplicates(indexes);

    printGroups("Duplicate constraints in source", duplicateConstraints);
    printGroups("Duplicate indexes in source", duplicateIndexes);

    const sqlStatements = [
      ...duplicateConstraints.flatMap((group) => group.dropStatements),
      ...duplicateIndexes.flatMap((group) => group.dropStatements),
    ];

    const sqlOutputPath = path.join(process.cwd(), "migrations", "generated-drop-duplicate-constraints.sql");
    fs.writeFileSync(sqlOutputPath, `${sqlStatements.join("\n")}\n`, "utf8");
    console.log(`Generated duplicate cleanup SQL: ${sqlOutputPath}`);
  } finally {
    await client.end();
  }
};

void main();
