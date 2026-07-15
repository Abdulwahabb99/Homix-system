import { DataTypes } from "sequelize";

import { connectToDb, sequelize } from "../infrastructure/database";

const queryInterface = sequelize.getQueryInterface();

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

  await ensureColumn("orders", "priority", {
    allowNull: false,
    defaultValue: 1,
    type: DataTypes.INTEGER,
  });

  await sequelize.query(`
    UPDATE orders
    SET "priority" = 1
    WHERE "deletedAt" IS NULL
      AND ("priority" IS NULL OR "priority" NOT IN (1, 2, 3));
  `);

  await sequelize.query(`
    ALTER TABLE orders
    ALTER COLUMN "priority" SET DEFAULT 1;
  `);

  await ensureIndex("orders", "orders_priority_idx", ["priority"]);

  // eslint-disable-next-line no-console
  console.log("Order priority column is ready.");
};

run()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error("Failed to setup order priority column", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
