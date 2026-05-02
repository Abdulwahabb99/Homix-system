import type { Sequelize as SequelizeType } from "sequelize";

import { env } from "../../config/env";
import { logger } from "../../shared/logger/logger";

type LegacyDatabaseModule = {
  Sequelize: typeof import("sequelize");
  connectToDb: () => Promise<void>;
  sequelize: SequelizeType;
};

const legacyDatabaseModule = require("../../../config/db.config") as LegacyDatabaseModule;

export const sequelize = legacyDatabaseModule.sequelize;

export const connectToDatabase = async (): Promise<void> => {
  await legacyDatabaseModule.connectToDb();
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
