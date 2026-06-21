import { DataTypes } from "sequelize";

import { connectToDb, sequelize } from "../infrastructure/database";

const queryInterface = sequelize.getQueryInterface();

const ensureTable = async (tableName: string, columns: Record<string, object>): Promise<void> => {
  const tables = await queryInterface.showAllTables();
  const tableNames = tables.map((table) => String(table));
  if (!tableNames.includes(tableName)) {
    await queryInterface.createTable(tableName, columns as never);
  }
};

const ensureColumn = async (
  tableName: string,
  columnName: string,
  columnDefinition: object,
): Promise<void> => {
  const definition = await queryInterface.describeTable(tableName);
  if (!(columnName in definition)) {
    await queryInterface.addColumn(tableName, columnName, columnDefinition as never);
  }
};

const ensureIndex = async (tableName: string, indexName: string, fields: string[]): Promise<void> => {
  const indexes = (await queryInterface.showIndex(tableName)) as Array<{ name?: string }>;
  if (!indexes.some((index) => index.name === indexName)) {
    await queryInterface.addIndex(tableName, fields, { name: indexName });
  }
};

const run = async (): Promise<void> => {
  await connectToDb();

  await ensureTable("shippingCompanies", {
    id: { allowNull: false, autoIncrement: true, primaryKey: true, type: DataTypes.INTEGER },
    name: { allowNull: false, type: DataTypes.STRING, unique: true },
    createdAt: { allowNull: false, type: DataTypes.DATE },
    updatedAt: { allowNull: false, type: DataTypes.DATE },
    deletedAt: { allowNull: true, type: DataTypes.DATE },
  });

  await sequelize.query(`
    INSERT INTO "shippingCompanies" ("name", "createdAt", "updatedAt")
    SELECT source."name", NOW(), NOW()
    FROM (
      SELECT MIN(TRIM("shippingCompany")) AS "name"
      FROM orders
      WHERE "shippingCompany" IS NOT NULL
        AND TRIM("shippingCompany") <> ''
        AND "deletedAt" IS NULL
      GROUP BY LOWER(TRIM("shippingCompany"))
    ) AS source
    WHERE NOT EXISTS (
      SELECT 1
      FROM "shippingCompanies" company
      WHERE LOWER(company."name") = LOWER(source."name")
        AND company."deletedAt" IS NULL
    );
  `);

  await sequelize.query(`
    UPDATE orders AS "Order"
    SET "shippingCompany" = company."name"
    FROM "shippingCompanies" company
    WHERE "Order"."deletedAt" IS NULL
      AND company."deletedAt" IS NULL
      AND "Order"."shippingCompany" IS NOT NULL
      AND TRIM("Order"."shippingCompany") <> ''
      AND LOWER(TRIM("Order"."shippingCompany")) = LOWER(company."name");
  `);

  await sequelize.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'orders_shipping_company_fkey'
      ) THEN
        ALTER TABLE orders DROP CONSTRAINT orders_shipping_company_fkey;
      END IF;
    END
    $$;
  `);

  await sequelize.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'orders_shipping_company_fkey'
      ) THEN
        ALTER TABLE orders
        ADD CONSTRAINT orders_shipping_company_fkey
        FOREIGN KEY ("shippingCompany") REFERENCES "shippingCompanies"("name")
        ON UPDATE CASCADE ON DELETE SET NULL;
      END IF;
    END
    $$;
  `);

  await ensureIndex("shippingCompanies", "shipping_companies_name_idx", ["name"]);
  await ensureIndex("orders", "orders_shipping_company_idx", ["shippingCompany"]);

  // eslint-disable-next-line no-console
  console.log("Shipping companies migration completed");
};

run()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  });
