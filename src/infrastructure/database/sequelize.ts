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

export const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
  dialect: env.DB_DIALECT,
  dialectOptions: sslDialectOptions,
  host: env.DB_HOST,
  logging: false,
});

export const connectToDatabase = async (): Promise<void> => {
  await sequelize.authenticate();
  logger.info("Database connected successfully");
};
