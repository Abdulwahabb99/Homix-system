import http from "http";

import cron from "node-cron";
import { Server } from "socket.io";

import { env } from "./config/env";
import { createApp } from "./app";
import { connectToDatabase } from "./infrastructure/database";
import { logger } from "./shared/logger/logger";

const createDefaultData = require("../config/defaultData.seeder");
require("../config/shopify");

const userModel = require("../app/modules/user/user.model");
const orderService = require("../app/modules/order/order.service");

type LegacyUserRecord = {
  save: () => Promise<void>;
  socketIds?: string[];
};

const app = createApp();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    methods: ["GET", "POST"],
    origin: "*",
  },
});

const registerSocketHandlers = (): void => {
  io.on("connection", (socket) => {
    logger.info({ socketId: socket.id }, "Socket client connected");

    socket.on("subscribe", async (payload: { userId?: number }) => {
      if (!payload.userId) {
        return;
      }

      const user = (await userModel.findByPk(payload.userId)) as LegacyUserRecord | null;
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

      const user = (await userModel.findByPk(userId)) as LegacyUserRecord | null;
      if (!user) {
        return;
      }

      user.socketIds = (user.socketIds ?? []).filter((id) => id !== socket.id);
      await user.save();
    });
  });
};

const registerCronJobs = (): void => {
  cron.schedule(
    "0 */2 * * *",
    async () => {
      logger.info({ operationName: "saveMissingOrders" }, "Cron started");
      await orderService.saveMissingOrders();
      logger.info({ operationName: "saveMissingOrders" }, "Cron completed");
    },
    {
      timezone: "Africa/Cairo",
    },
  );

  cron.schedule(
    "0 0 * * *",
    async () => {
      logger.info({ operationName: "recalculateDailyFines" }, "Cron started");
      const result = await orderService.recalculateDailyFines();
      logger.info(
        {
          operationName: "recalculateDailyFines",
          updatedCount: result?.updatedCount ?? 0,
        },
        "Cron completed",
      );
    },
    {
      timezone: "Africa/Cairo",
    },
  );
};

const bootstrap = async (): Promise<void> => {
  await connectToDatabase();
  registerSocketHandlers();
  registerCronJobs();
  await createDefaultData();

  server.listen(env.NODE_PORT, () => {
    logger.info({ port: env.NODE_PORT }, "Server running");
  });
};

void bootstrap().catch((error: unknown) => {
  logger.error({ err: error }, "Failed to start server");
  process.exitCode = 1;
});
