require("dotenv").config();

const { Sequelize } = require("sequelize");

const databaseUrl = process.env.DATABASE_URL
  || process.env.POSTGRES_URL
  || process.env.POSTGRES_PRISMA_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL or POSTGRES_URL is required");
}

const isLocalHostname = (hostname) => ["localhost", "127.0.0.1", "::1"].includes(hostname);

const buildSequelizeOptions = () => {
  const options = {
    dialect: "postgres",
    logging: false,
  };

  if (process.env.NODE_ENV === "test") {
    return options;
  }

  try {
    const { hostname } = new URL(databaseUrl);
    if (!isLocalHostname(hostname)) {
      options.dialectOptions = {
        ssl: {
          rejectUnauthorized: false,
          require: true,
        },
      };
    }
  } catch (_error) {
    options.dialectOptions = {
      ssl: {
        rejectUnauthorized: false,
        require: true,
      },
    };
  }

  return options;
};

const sequelize = new Sequelize(databaseUrl, buildSequelizeOptions());

const addColumnIfMissing = async (tableName, columnName, definition, transaction) => {
  const [columns] = await sequelize.query(
    `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = :tableName
        AND column_name = :columnName
    `,
    {
      replacements: { columnName, tableName },
      transaction,
    },
  );

  if (Array.isArray(columns) && columns.length > 0) {
    console.log(`- ${tableName}.${columnName} already exists`);
    return;
  }

  await sequelize.getQueryInterface().addColumn(tableName, columnName, definition, { transaction });
  console.log(`+ added ${tableName}.${columnName}`);
};

const run = async () => {
  await sequelize.authenticate();
  const transaction = await sequelize.transaction();

  try {
    await addColumnIfMissing("factories", "contactPersonRole", { type: Sequelize.STRING }, transaction);
    await addColumnIfMissing("factories", "joinDate", { type: Sequelize.DATEONLY }, transaction);
    await addColumnIfMissing("factories", "bankName", { type: Sequelize.STRING }, transaction);
    await addColumnIfMissing("factories", "bankAccountType", { type: Sequelize.STRING }, transaction);
    await addColumnIfMissing("factories", "bankAccountHolderName", { type: Sequelize.STRING }, transaction);
    await addColumnIfMissing("factories", "bankAccountNumber", { type: Sequelize.STRING }, transaction);
    await addColumnIfMissing("factories", "walletNumber", { type: Sequelize.STRING }, transaction);
    await addColumnIfMissing("factories", "walletProvider", { type: Sequelize.STRING }, transaction);
    await addColumnIfMissing("factories", "instapayNumber", { type: Sequelize.STRING }, transaction);

    await addColumnIfMissing("attachments", "attachmentType", { type: Sequelize.INTEGER }, transaction);
    await addColumnIfMissing("attachments", "verificationStatus", { type: Sequelize.INTEGER }, transaction);
    await addColumnIfMissing("attachments", "issuedAt", { type: Sequelize.DATEONLY }, transaction);
    await addColumnIfMissing("attachments", "expiresAt", { type: Sequelize.DATEONLY }, transaction);

    await transaction.commit();
    console.log("Factory profile fields migration completed");
  } catch (error) {
    await transaction.rollback();
    throw error;
  } finally {
    await sequelize.close();
  }
};

run().catch((error) => {
  console.error("Factory profile fields migration failed");
  console.error(error);
  process.exitCode = 1;
});
