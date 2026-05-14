require("dotenv").config();

const { DataTypes, Sequelize } = require("sequelize");

const sslDialectOptions = process.env.NODE_ENV !== "test"
  ? {
      ssl: {
        rejectUnauthorized: false,
        require: true,
      },
    }
  : undefined;

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  dialect: process.env.DB_DIALECT,
  dialectOptions: sslDialectOptions,
  host: process.env.DB_HOST,
  logging: false,
});

async function ensureColumn(queryInterface, tableName, columnName, definition) {
  const table = await queryInterface.describeTable(tableName);
  if (!table[columnName]) {
    await queryInterface.addColumn(tableName, columnName, definition);
    console.log(`Added ${tableName}.${columnName}`);
  } else {
    console.log(`${tableName}.${columnName} already exists`);
  }
}

async function main() {
  const queryInterface = sequelize.getQueryInterface();

  try {
    await sequelize.authenticate();

    await ensureColumn(queryInterface, "vendors", "accountManagerUserId", {
      allowNull: true,
      references: {
        key: "id",
        model: "users",
      },
      type: DataTypes.INTEGER,
    });

    await ensureColumn(queryInterface, "orders", "fine", {
      allowNull: true,
      defaultValue: 0,
      type: DataTypes.DECIMAL,
    });

    await ensureColumn(queryInterface, "orders", "deliveryBy", {
      allowNull: true,
      type: DataTypes.INTEGER,
    });

    await ensureColumn(queryInterface, "dashboardDailyMetrics", "inProgressOrders", {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.INTEGER,
    });

    await ensureColumn(queryInterface, "dashboardDailyMetrics", "canceledOrRefundedOrders", {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.INTEGER,
    });

    await queryInterface.changeColumn("orders", "deliveryBy", {
      allowNull: true,
      type: DataTypes.INTEGER,
    }).catch(() => console.log("orders.deliveryBy type already updated"));

    await queryInterface.addIndex("vendors", ["accountManagerUserId"], {
      name: "vendors_accountManagerUserId_idx",
    }).catch(() => console.log("vendors_accountManagerUserId_idx already exists"));

    await queryInterface.addIndex("orders", ["fine"], {
      name: "orders_fine_idx",
    }).catch(() => console.log("orders_fine_idx already exists"));

    await queryInterface.addIndex("orders", ["deliveryBy"], {
      name: "orders_deliveryBy_idx",
    }).catch(() => console.log("orders_deliveryBy_idx already exists"));

    console.log("Migration completed successfully");
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("Migration failed", error);
    await sequelize.close().catch(() => undefined);
    process.exit(1);
  }
}

main();
