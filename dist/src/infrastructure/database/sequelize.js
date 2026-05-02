"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDatabase = exports.connectToDb = exports.sequelize = exports.Sequelize = void 0;
const sequelize_1 = require("sequelize");
Object.defineProperty(exports, "Sequelize", { enumerable: true, get: function () { return sequelize_1.Sequelize; } });
const env_1 = require("../../config/env");
const logger_1 = require("../../shared/logger/logger");
const sslDialectOptions = env_1.env.NODE_ENV !== "test"
    ? {
        ssl: {
            rejectUnauthorized: false,
            require: true,
        },
    }
    : undefined;
exports.sequelize = new sequelize_1.Sequelize(env_1.env.DB_NAME, env_1.env.DB_USER, env_1.env.DB_PASSWORD, {
    dialect: env_1.env.DB_DIALECT,
    dialectOptions: sslDialectOptions,
    host: env_1.env.DB_HOST,
    logging: false,
});
const connectToDb = async () => {
    await exports.sequelize.authenticate();
};
exports.connectToDb = connectToDb;
const connectToDatabase = async () => {
    await (0, exports.connectToDb)();
    logger_1.logger.info("Database connected successfully");
    if (!env_1.env.DB_SYNC) {
        return;
    }
    await exports.sequelize.sync({
        alter: env_1.env.DB_SYNC_ALTER,
        force: env_1.env.DB_SYNC_FORCE,
    });
    logger_1.logger.info({
        alter: env_1.env.DB_SYNC_ALTER,
        force: env_1.env.DB_SYNC_FORCE,
    }, "Database schema synchronized");
};
exports.connectToDatabase = connectToDatabase;
//# sourceMappingURL=sequelize.js.map