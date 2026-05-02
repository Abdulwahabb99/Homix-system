"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const node_cron_1 = __importDefault(require("node-cron"));
const socket_io_1 = require("socket.io");
const env_1 = require("./config/env");
const app_1 = require("./app");
const database_1 = require("./infrastructure/database");
const logger_1 = require("./shared/logger/logger");
const createDefaultData = require("../config/defaultData.seeder");
require("../config/shopify");
const userModel = require("../app/modules/user/user.model");
const orderService = require("../app/modules/order/order.service");
const app = (0, app_1.createApp)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        methods: ["GET", "POST"],
        origin: "*",
    },
});
const registerSocketHandlers = () => {
    io.on("connection", (socket) => {
        logger_1.logger.info({ socketId: socket.id }, "Socket client connected");
        socket.on("subscribe", async (payload) => {
            if (!payload.userId) {
                return;
            }
            const user = (await userModel.findByPk(payload.userId));
            if (!user) {
                return;
            }
            user.socketIds = [...(user.socketIds ?? []), socket.id];
            await user.save();
            socket.emit("notification", {
                message: "Successfully subscribed to notifications",
            });
        });
        socket.on("disconnect", async () => {
            const userId = socket.handshake.query.userId;
            if (typeof userId !== "string") {
                return;
            }
            const user = (await userModel.findByPk(userId));
            if (!user) {
                return;
            }
            user.socketIds = (user.socketIds ?? []).filter((id) => id !== socket.id);
            await user.save();
        });
    });
};
const registerCronJobs = () => {
    node_cron_1.default.schedule("0 */2 * * *", async () => {
        logger_1.logger.info({ operationName: "saveMissingOrders" }, "Cron started");
        await orderService.saveMissingOrders();
        logger_1.logger.info({ operationName: "saveMissingOrders" }, "Cron completed");
    }, {
        timezone: "Africa/Cairo",
    });
};
const bootstrap = async () => {
    await (0, database_1.connectToDatabase)();
    registerSocketHandlers();
    registerCronJobs();
    await createDefaultData();
    await orderService.saveMissingOrders();
    server.listen(env_1.env.NODE_PORT, () => {
        logger_1.logger.info({ port: env_1.env.NODE_PORT }, "Server running");
    });
};
void bootstrap().catch((error) => {
    logger_1.logger.error({ err: error }, "Failed to start server");
    process.exitCode = 1;
});
//# sourceMappingURL=server.js.map