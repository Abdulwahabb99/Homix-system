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

const run = async (): Promise<void> => {
  await connectToDb();

  await ensureColumn("orders", "orderSource", {
    allowNull: true,
    defaultValue: 1,
    type: DataTypes.INTEGER,
  });

  await sequelize.query(`
    UPDATE orders
    SET "orderSource" = CASE
      WHEN COALESCE(NULLIF(TRIM("shopifyId"), ''), 'custom') <> 'custom' THEN 2
      ELSE 1
    END
    WHERE "deletedAt" IS NULL
      AND ("orderSource" IS NULL OR "orderSource" NOT IN (1, 2));
  `);

  await sequelize.query(`
    ALTER TABLE orders
    ALTER COLUMN "orderSource" SET DEFAULT 1;
  `);

  console.log("Order source column is ready.");
};

run()
  .catch((error) => {
    console.error("Failed to setup order source column", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
