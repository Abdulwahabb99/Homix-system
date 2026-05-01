import express from "express";

import { asyncHandler, validateRequest } from "../../shared/http";
import { NotificationController } from "./notification.controller";
import { NotificationRepository } from "./notification.repo";
import { emptyNotificationPayloadSchema } from "./notification.schemas";
import { NotificationService } from "./notification.service";

const verifyToken = require("../../../app/middlewares/protectApi");

const notificationRepository = new NotificationRepository();
const notificationService = new NotificationService(notificationRepository);
const notificationController = new NotificationController(notificationService);

export const notificationRouter = express.Router();

notificationRouter.get(
  "/",
  verifyToken,
  asyncHandler(notificationController.getNotifications),
);

notificationRouter.delete(
  "/",
  verifyToken,
  validateRequest({ body: emptyNotificationPayloadSchema }),
  asyncHandler(notificationController.clearNotifications),
);

notificationRouter.put(
  "/",
  verifyToken,
  validateRequest({ body: emptyNotificationPayloadSchema }),
  asyncHandler(notificationController.markAsRead),
);
