import { DataTypes } from "sequelize";

import { connectToDb, sequelize } from "../infrastructure/database";

const queryInterface = sequelize.getQueryInterface();

const ensureTable = async (
  tableName: string,
  columns: Record<string, object>,
): Promise<void> => {
  const tables = await queryInterface.showAllTables();
  const tableNames = tables.map((table) => String(table));
  if (!tableNames.includes(tableName)) {
    await queryInterface.createTable(tableName, columns as never);
  }
};

const ensureIndex = async (tableName: string, indexName: string, fields: string[]): Promise<void> => {
  const indexes = (await queryInterface.showIndex(tableName)) as Array<{ name?: string }>;
  if (!indexes.some((index) => index.name === indexName)) {
    await queryInterface.addIndex(tableName, fields, { name: indexName });
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

const run = async (): Promise<void> => {
  await connectToDb();

  await ensureTable("shipmentInventoryItems", {
    id: { allowNull: false, autoIncrement: true, primaryKey: true, type: DataTypes.INTEGER },
    productId: { allowNull: true, type: DataTypes.INTEGER },
    productCode: { allowNull: false, type: DataTypes.STRING },
    color: { allowNull: true, defaultValue: "", type: DataTypes.STRING },
    size: { allowNull: true, defaultValue: "", type: DataTypes.STRING },
    quantity: { allowNull: false, defaultValue: 0, type: DataTypes.INTEGER },
    costPrice: { allowNull: false, defaultValue: 0, type: DataTypes.DECIMAL },
    status: { allowNull: false, defaultValue: 1, type: DataTypes.INTEGER },
    createdAt: { allowNull: false, type: DataTypes.DATE },
    updatedAt: { allowNull: false, type: DataTypes.DATE },
    deletedAt: { allowNull: true, type: DataTypes.DATE },
  });

  await ensureColumn("shipmentInventoryItems", "productId", {
    allowNull: true,
    type: DataTypes.INTEGER,
  });

  await ensureTable("shipmentExpenses", {
    id: { allowNull: false, autoIncrement: true, primaryKey: true, type: DataTypes.INTEGER },
    type: { allowNull: false, type: DataTypes.STRING },
    amount: { allowNull: false, defaultValue: 0, type: DataTypes.DECIMAL },
    reason: { allowNull: false, type: DataTypes.TEXT },
    accountingStatus: { allowNull: false, defaultValue: 1, type: DataTypes.INTEGER },
    accountingDate: { allowNull: true, type: DataTypes.DATE },
    createdAt: { allowNull: false, type: DataTypes.DATE },
    updatedAt: { allowNull: false, type: DataTypes.DATE },
    deletedAt: { allowNull: true, type: DataTypes.DATE },
  });

  await ensureTable("shipmentReturns", {
    id: { allowNull: false, autoIncrement: true, primaryKey: true, type: DataTypes.INTEGER },
    orderId: { allowNull: false, type: DataTypes.INTEGER },
    returnType: { allowNull: false, type: DataTypes.INTEGER },
    status: { allowNull: false, type: DataTypes.INTEGER },
    reason: { allowNull: true, type: DataTypes.TEXT },
    returnDate: { allowNull: true, type: DataTypes.DATE },
    startedAt: { allowNull: false, type: DataTypes.DATE },
    completedAt: { allowNull: true, type: DataTypes.DATE },
    createdAt: { allowNull: false, type: DataTypes.DATE },
    updatedAt: { allowNull: false, type: DataTypes.DATE },
    deletedAt: { allowNull: true, type: DataTypes.DATE },
  });

  await sequelize.query(`
    ALTER TABLE "shipmentInventoryItems"
    ALTER COLUMN "status" TYPE INTEGER
    USING (
      CASE
        WHEN "status"::text IN ('1', '2') THEN "status"::integer
        WHEN LOWER(COALESCE("status"::text, '')) = 'instock' THEN 1
        WHEN LOWER(COALESCE("status"::text, '')) = 'outofstock' THEN 2
        ELSE 1
      END
    );
  `);

  await sequelize.query(`
    ALTER TABLE "shipmentInventoryItems"
    ALTER COLUMN "status" SET DEFAULT 1;
  `);

  await sequelize.query(`
    ALTER TABLE "shipmentExpenses"
    ALTER COLUMN "accountingStatus" TYPE INTEGER
    USING (
      CASE
        WHEN "accountingStatus"::text IN ('1', '2') THEN "accountingStatus"::integer
        WHEN LOWER(COALESCE("accountingStatus"::text, '')) = 'pending' THEN 1
        WHEN LOWER(COALESCE("accountingStatus"::text, '')) = 'settled' THEN 2
        ELSE 1
      END
    );
  `);

  await sequelize.query(`
    ALTER TABLE "shipmentExpenses"
    ALTER COLUMN "accountingStatus" SET DEFAULT 1;
  `);

  await sequelize.query(`
    DO $$
    DECLARE
      has_product_name_column boolean;
    BEGIN
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'shipmentInventoryItems'
          AND column_name = 'productName'
      ) INTO has_product_name_column;

      IF has_product_name_column THEN
        UPDATE "shipmentInventoryItems" AS inventory
        SET "productId" = product.id
        FROM products AS product
        WHERE inventory."productId" IS NULL
          AND inventory."deletedAt" IS NULL
          AND product."deletedAt" IS NULL
          AND (
            EXISTS (
              SELECT 1
              FROM json_array_elements(COALESCE(product.variants, '[]'::json)) AS variant
              WHERE LOWER(COALESCE(variant->>'sku', '')) = LOWER(COALESCE(inventory."productCode", ''))
            )
            OR LOWER(COALESCE(product.title, '')) = LOWER(COALESCE(inventory."productName", ''))
          );
      ELSE
        UPDATE "shipmentInventoryItems" AS inventory
        SET "productId" = product.id
        FROM products AS product
        WHERE inventory."productId" IS NULL
          AND inventory."deletedAt" IS NULL
          AND product."deletedAt" IS NULL
          AND EXISTS (
            SELECT 1
            FROM json_array_elements(COALESCE(product.variants, '[]'::json)) AS variant
            WHERE LOWER(COALESCE(variant->>'sku', '')) = LOWER(COALESCE(inventory."productCode", ''))
          );
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
        WHERE conname = 'shipment_inventory_items_product_id_fkey'
      ) THEN
        ALTER TABLE "shipmentInventoryItems"
        ADD CONSTRAINT shipment_inventory_items_product_id_fkey
        FOREIGN KEY ("productId") REFERENCES products(id)
        ON UPDATE CASCADE ON DELETE SET NULL;
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
        WHERE conname = 'shipment_returns_order_id_fkey'
      ) THEN
        ALTER TABLE "shipmentReturns"
        ADD CONSTRAINT shipment_returns_order_id_fkey
        FOREIGN KEY ("orderId") REFERENCES orders(id)
        ON UPDATE CASCADE ON DELETE CASCADE;
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
        WHERE conname = 'shipment_returns_order_type_key'
      ) THEN
        ALTER TABLE "shipmentReturns"
        ADD CONSTRAINT shipment_returns_order_type_key
        UNIQUE ("orderId", "returnType");
      END IF;
    END
    $$;
  `);

  await ensureIndex("shipmentInventoryItems", "shipment_inventory_product_id_idx", ["productId"]);
  await ensureIndex("shipmentInventoryItems", "shipment_inventory_product_code_idx", ["productCode"]);
  await ensureIndex("shipmentInventoryItems", "shipment_inventory_status_idx", ["status"]);
  await ensureIndex("shipmentExpenses", "shipment_expenses_type_idx", ["type"]);
  await ensureIndex("shipmentExpenses", "shipment_expenses_accounting_status_idx", ["accountingStatus"]);
  await ensureIndex("shipmentExpenses", "shipment_expenses_accounting_date_idx", ["accountingDate"]);
  await ensureIndex("shipmentReturns", "shipment_returns_order_type_idx", ["orderId", "returnType"]);
  await ensureIndex("shipmentReturns", "shipment_returns_status_idx", ["status"]);
  await ensureIndex("shipmentReturns", "shipment_returns_type_idx", ["returnType"]);
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
