import fs from "fs";
import path from "path";

import dotenv from "dotenv";
import { Client } from "pg";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
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
  constraint_type: "f" | "p" | "u";
  table_name: string;
};

type MissingConstraint = ConstraintRow & {
  normalizedDefinition: string;
  normalizedKey: string;
};

type PlannedConstraint = {
  details: string;
  sql: string;
  status: "blocked_nulls" | "blocked_orphans" | "blocked_duplicates" | "safe_now" | "unsupported";
  tableName: string;
  constraintType: "f" | "p" | "u";
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

const normalizeWhitespace = (value: string): string => value.replace(/\s+/g, " ").trim();
const normalizeIdentifierQuotes = (value: string): string => value.replace(/"/g, "");
const normalizePublicPrefix = (value: string): string => value.replace(/\bpublic\./g, "");
const normalizeDefinition = (value: string): string =>
  normalizePublicPrefix(normalizeIdentifierQuotes(normalizeWhitespace(value)));
const normalizeTableName = (value: string): string =>
  normalizePublicPrefix(normalizeIdentifierQuotes(normalizeWhitespace(value)));
const quoteIdentifier = (value: string): string => `"${value.replace(/"/g, "\"\"")}"`;
const shouldUseSsl = (host: string): boolean => host !== "localhost" && host !== "127.0.0.1";
const toCount = (value: unknown): number => Number.parseInt(String(value ?? "0"), 10) || 0;

const getDbConnection = (env: z.infer<typeof envSchema>, source: boolean): DbConnection => {
  if (source) {
    return {
      database: env.PARITY_SOURCE_DB_NAME,
      host: env.PARITY_SOURCE_DB_HOST,
      password: env.PARITY_SOURCE_DB_PASSWORD,
      port: env.PARITY_SOURCE_DB_PORT ?? 5432,
      user: env.PARITY_SOURCE_DB_USER,
    };
  }

  return {
    database: env.DB_NAME,
    host: env.DB_HOST,
    password: env.DB_PASSWORD,
    port: env.DB_PORT ?? 5432,
    user: env.DB_USER,
  };
};

const createClient = (connection: DbConnection): PgClient => {
  return new Client(
    shouldUseSsl(connection.host)
      ? { ...connection, ssl: { rejectUnauthorized: false, require: true } }
      : connection,
  ) as PgClient;
};

const getNormalizedKey = (row: ConstraintRow): string => {
  return [normalizeTableName(row.table_name), row.constraint_type, normalizeDefinition(row.constraint_definition)].join(" | ");
};

const loadConstraints = async (connection: DbConnection): Promise<ConstraintRow[]> => {
  const client = createClient(connection);
  await client.connect();
  try {
    const result = await client.query(CONSTRAINT_QUERY);
    const normalizedConstraints = (result.rows as ConstraintRow[]).map((row) => ({
      ...row,
      constraint_definition: normalizeDefinition(row.constraint_definition),
      constraint_name: normalizeIdentifierQuotes(row.constraint_name),
      table_name: normalizeTableName(row.table_name),
    }));

    const uniqueConstraints = new Map<string, ConstraintRow>();
    for (const constraint of normalizedConstraints) {
      uniqueConstraints.set(getNormalizedKey(constraint), constraint);
    }

    return [...uniqueConstraints.values()];
  } finally {
    await client.end();
  }
};

const splitColumns = (value: string): string[] => value.split(",").map((part) => part.trim()).filter(Boolean);
const buildCanonicalName = (constraint: MissingConstraint): string => {
  if (constraint.constraint_type === "p") return `${constraint.table_name}_pkey`;
  if (constraint.constraint_type === "u") {
    return `${constraint.table_name}_${extractColumns(constraint.constraint_definition).join("_")}_key`;
  }
  const parsed = parseForeignKeyDefinition(constraint.constraint_definition);
  return parsed ? `${constraint.table_name}_${parsed.columns.join("_")}_fkey` : constraint.constraint_name;
};

const extractColumns = (definition: string): string[] => {
  const match = definition.match(/\(([^)]+)\)/);
  return match ? splitColumns(match[1] ?? "") : [];
};

const parseForeignKeyDefinition = (
  definition: string,
): { columns: string[]; referencedColumns: string[]; referencedTable: string } | null => {
  const match = definition.match(
    /^FOREIGN KEY \(([^)]+)\) REFERENCES\s+([^( ]+)\s*\(([^)]+)\)/i,
  );
  if (!match) return null;
  return {
    columns: splitColumns(match[1] ?? ""),
    referencedColumns: splitColumns(match[3] ?? ""),
    referencedTable: normalizeTableName(match[2] ?? ""),
  };
};

const buildSql = (constraint: MissingConstraint): string => {
  if (constraint.constraint_type === "p") {
    const columns = extractColumns(constraint.constraint_definition).map(quoteIdentifier).join(", ");
    return `ALTER TABLE ${quoteIdentifier(constraint.table_name)} ADD CONSTRAINT ${quoteIdentifier(buildCanonicalName(constraint))} PRIMARY KEY (${columns});`;
  }

  if (constraint.constraint_type === "u") {
    const columns = extractColumns(constraint.constraint_definition).map(quoteIdentifier).join(", ");
    return `ALTER TABLE ${quoteIdentifier(constraint.table_name)} ADD CONSTRAINT ${quoteIdentifier(buildCanonicalName(constraint))} UNIQUE (${columns});`;
  }

  const foreignKey = parseForeignKeyDefinition(constraint.constraint_definition);
  if (!foreignKey) {
    return `ALTER TABLE ${quoteIdentifier(constraint.table_name)} ADD CONSTRAINT ${quoteIdentifier(buildCanonicalName(constraint))} ${constraint.constraint_definition};`;
  }

  const localColumns = foreignKey.columns.map(quoteIdentifier).join(", ");
  const referencedColumns = foreignKey.referencedColumns.map(quoteIdentifier).join(", ");
  const matchType = constraint.constraint_definition.match(/\bMATCH\s+\w+/i)?.[0] ?? "";
  const onUpdate =
    constraint.constraint_definition.match(/\bON UPDATE\s+(?:RESTRICT|CASCADE|SET NULL|SET DEFAULT|NO ACTION)/i)?.[0] ?? "";
  const onDelete =
    constraint.constraint_definition.match(/\bON DELETE\s+(?:RESTRICT|CASCADE|SET NULL|SET DEFAULT|NO ACTION)/i)?.[0] ?? "";
  const suffix = [matchType, onUpdate, onDelete].filter(Boolean).join(" ");

  return `ALTER TABLE ${quoteIdentifier(constraint.table_name)} ADD CONSTRAINT ${quoteIdentifier(buildCanonicalName(constraint))} FOREIGN KEY (${localColumns}) REFERENCES ${quoteIdentifier(foreignKey.referencedTable)}(${referencedColumns})${suffix ? ` ${suffix}` : ""};`;
};

const countNulls = async (client: PgClient, tableName: string, columns: string[]): Promise<number> => {
  const nullCondition = columns.map((column) => `${quoteIdentifier(column)} IS NULL`).join(" OR ");
  const result = await client.query(`SELECT COUNT(*) AS count FROM ${quoteIdentifier(tableName)} WHERE ${nullCondition}`);
  return toCount(result.rows[0]?.count);
};

const countDuplicateGroups = async (client: PgClient, tableName: string, columns: string[]): Promise<number> => {
  const quotedColumns = columns.map(quoteIdentifier).join(", ");
  const result = await client.query(
    `SELECT COUNT(*) AS count FROM (SELECT ${quotedColumns} FROM ${quoteIdentifier(tableName)} GROUP BY ${quotedColumns} HAVING COUNT(*) > 1) duplicate_groups`,
  );
  return toCount(result.rows[0]?.count);
};

const countOrphans = async (
  client: PgClient,
  tableName: string,
  columns: string[],
  referencedTable: string,
  referencedColumns: string[],
): Promise<number> => {
  const notNullCondition = columns.map((column) => `child.${quoteIdentifier(column)} IS NOT NULL`).join(" AND ");
  const joinCondition = columns
    .map((column, index) => `child.${quoteIdentifier(column)} = parent.${quoteIdentifier(referencedColumns[index] ?? "")}`)
    .join(" AND ");
  const result = await client.query(
    `SELECT COUNT(*) AS count
     FROM ${quoteIdentifier(tableName)} child
     WHERE ${notNullCondition}
       AND NOT EXISTS (
         SELECT 1 FROM ${quoteIdentifier(referencedTable)} parent
         WHERE ${joinCondition}
       )`,
  );
  return toCount(result.rows[0]?.count);
};

const classifyConstraint = async (client: PgClient, constraint: MissingConstraint): Promise<PlannedConstraint> => {
  const sql = buildSql(constraint);
  if (constraint.constraint_type === "p") {
    const columns = extractColumns(constraint.constraint_definition);
    const nullCount = await countNulls(client, constraint.table_name, columns);
    if (nullCount > 0) return { constraintType: "p", details: `${nullCount} rows with NULL PK columns`, sql, status: "blocked_nulls", tableName: constraint.table_name };
    const duplicateGroups = await countDuplicateGroups(client, constraint.table_name, columns);
    if (duplicateGroups > 0) return { constraintType: "p", details: `${duplicateGroups} duplicate PK groups`, sql, status: "blocked_duplicates", tableName: constraint.table_name };
    return { constraintType: "p", details: `PRIMARY KEY (${columns.join(", ")}) can be added`, sql, status: "safe_now", tableName: constraint.table_name };
  }
  if (constraint.constraint_type === "u") {
    const columns = extractColumns(constraint.constraint_definition);
    const duplicateGroups = await countDuplicateGroups(client, constraint.table_name, columns);
    if (duplicateGroups > 0) return { constraintType: "u", details: `${duplicateGroups} duplicate unique groups`, sql, status: "blocked_duplicates", tableName: constraint.table_name };
    return { constraintType: "u", details: `UNIQUE (${columns.join(", ")}) can be added`, sql, status: "safe_now", tableName: constraint.table_name };
  }
  const foreignKey = parseForeignKeyDefinition(constraint.constraint_definition);
  if (!foreignKey) return { constraintType: "f", details: "Could not parse foreign key definition", sql, status: "unsupported", tableName: constraint.table_name };
  const orphanCount = await countOrphans(
    client,
    constraint.table_name,
    foreignKey.columns,
    foreignKey.referencedTable,
    foreignKey.referencedColumns,
  );
  if (orphanCount > 0) return { constraintType: "f", details: `${orphanCount} orphan referencing rows`, sql, status: "blocked_orphans", tableName: constraint.table_name };
  return { constraintType: "f", details: `FOREIGN KEY (${foreignKey.columns.join(", ")}) can be added`, sql, status: "safe_now", tableName: constraint.table_name };
};

const CONSTRAINT_TYPE_ORDER: Record<PlannedConstraint["constraintType"], number> = {
  p: 0,
  u: 1,
  f: 2,
};

const sortPlannedConstraints = (constraints: PlannedConstraint[]): PlannedConstraint[] => {
  return [...constraints].sort((left, right) => {
    const typeDifference = CONSTRAINT_TYPE_ORDER[left.constraintType] - CONSTRAINT_TYPE_ORDER[right.constraintType];
    if (typeDifference !== 0) {
      return typeDifference;
    }

    const tableDifference = left.tableName.localeCompare(right.tableName);
    if (tableDifference !== 0) {
      return tableDifference;
    }

    return left.sql.localeCompare(right.sql);
  });
};

const printGroup = (title: string, items: PlannedConstraint[]): void => {
  console.log(`${title}: ${items.length}`);
  for (const item of items.slice(0, 25)) {
    console.log(`  - ${item.tableName}: ${item.details}`);
  }
  if (items.length > 25) console.log(`  ... and ${items.length - 25} more`);
};

const main = async (): Promise<void> => {
  const parsedEnv = envSchema.parse(process.env);
  const sourceConstraints = await loadConstraints(getDbConnection(parsedEnv, true));
  const targetConstraints = await loadConstraints(getDbConnection(parsedEnv, false));
  const targetKeys = new Set(targetConstraints.map((constraint) => getNormalizedKey(constraint)));
  const missingConstraints = sourceConstraints
    .map((constraint) => ({
      ...constraint,
      normalizedDefinition: normalizeDefinition(constraint.constraint_definition),
      normalizedKey: getNormalizedKey(constraint),
    }))
    .filter((constraint) => !targetKeys.has(constraint.normalizedKey));

  const client = createClient(getDbConnection(parsedEnv, false));
  await client.connect();
  try {
    const plannedConstraints: PlannedConstraint[] = [];
    for (const constraint of missingConstraints) {
      plannedConstraints.push(await classifyConstraint(client, constraint));
    }

    const safeNow = plannedConstraints.filter((item) => item.status === "safe_now");
    const blockedDuplicates = plannedConstraints.filter((item) => item.status === "blocked_duplicates");
    const blockedNulls = plannedConstraints.filter((item) => item.status === "blocked_nulls");
    const blockedOrphans = plannedConstraints.filter((item) => item.status === "blocked_orphans");
    const unsupported = plannedConstraints.filter((item) => item.status === "unsupported");

    printGroup("Safe constraints to add now", safeNow);
    printGroup("Blocked by duplicate data", blockedDuplicates);
    printGroup("Blocked by null primary key data", blockedNulls);
    printGroup("Blocked by orphan foreign key data", blockedOrphans);
    printGroup("Unsupported/needs manual review", unsupported);

    const sqlOutputPath = path.join(process.cwd(), "migrations", "generated-constraint-hardening.sql");
    const uniqueSafeSql = [...new Set(sortPlannedConstraints(safeNow).map((item) => item.sql))];
    const sqlBody = uniqueSafeSql.join("\n");
    fs.writeFileSync(sqlOutputPath, `${sqlBody}\n`, "utf8");
    console.log(`Generated SQL for safe constraints: ${sqlOutputPath}`);

    if (blockedDuplicates.length > 0 || blockedNulls.length > 0 || blockedOrphans.length > 0 || unsupported.length > 0) {
      process.exitCode = 1;
    }
  } finally {
    await client.end();
  }
};

void main();
