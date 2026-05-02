import { Sequelize } from "sequelize";

import { env } from "../../config/env";
import { logger } from "../../shared/logger/logger";

const sslDialectOptions = env.NODE_ENV !== "test"
  ? {
      ssl: {
        rejectUnauthorized: false,
        require: true,
      },
    }
  : undefined;

export { Sequelize };

export const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
  dialect: env.DB_DIALECT,
  dialectOptions: sslDialectOptions,
  host: env.DB_HOST,
  logging: false,
});

export const connectToDb = async (): Promise<void> => {
  await sequelize.authenticate();
};

export const connectToDatabase = async (): Promise<void> => {
  await connectToDb();
  logger.info("Database connected successfully");

  if (!env.DB_SYNC) {
    return;
  }

  await sequelize.sync({
    alter: env.DB_SYNC_ALTER,
    force: env.DB_SYNC_FORCE,
  });
  logger.info(
    {
      alter: env.DB_SYNC_ALTER,
      force: env.DB_SYNC_FORCE,
    },
    "Database schema synchronized",
  );
};
