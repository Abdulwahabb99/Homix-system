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

    await ensureColumn(queryInterface, "users", "roleName", {
      allowNull: true,
      type: DataTypes.STRING,
    });
    await ensureColumn(queryInterface, "users", "accountStatus", {
      allowNull: false,
      defaultValue: "active",
      type: DataTypes.STRING,
    });
    await ensureColumn(queryInterface, "users", "phoneNumber", {
      allowNull: true,
      type: DataTypes.STRING,
    });
    await ensureColumn(queryInterface, "users", "jobTitle", {
      allowNull: true,
      type: DataTypes.STRING,
    });
    await ensureColumn(queryInterface, "users", "salary", {
      allowNull: true,
      type: DataTypes.DECIMAL,
    });
    await ensureColumn(queryInterface, "users", "bankName", {
      allowNull: true,
      type: DataTypes.STRING,
    });
    await ensureColumn(queryInterface, "users", "bankAccountType", {
      allowNull: true,
      type: DataTypes.STRING,
    });
    await ensureColumn(queryInterface, "users", "bankAccountHolderName", {
      allowNull: true,
      type: DataTypes.STRING,
    });
    await ensureColumn(queryInterface, "users", "bankAccountNumber", {
      allowNull: true,
      type: DataTypes.STRING,
    });
    await ensureColumn(queryInterface, "users", "walletNumber", {
      allowNull: true,
      type: DataTypes.STRING,
    });
    await ensureColumn(queryInterface, "users", "instaPayNumber", {
      allowNull: true,
      type: DataTypes.STRING,
    });
    await ensureColumn(queryInterface, "users", "permissions", {
      allowNull: false,
      defaultValue: {},
      type: DataTypes.JSON,
    });
    await ensureColumn(queryInterface, "users", "lastSeenAt", {
      allowNull: true,
      type: DataTypes.DATE,
    });
    await ensureColumn(queryInterface, "users", "lastPasswordChangeAt", {
      allowNull: true,
      type: DataTypes.DATE,
    });

    await queryInterface.addIndex("users", ["accountStatus"], {
      name: "users_accountStatus_idx",
    }).catch(() => console.log("users_accountStatus_idx already exists"));

    console.log("User profile migration completed successfully");
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("User profile migration failed", error);
    await sequelize.close().catch(() => undefined);
    process.exit(1);
  }
}

main();
