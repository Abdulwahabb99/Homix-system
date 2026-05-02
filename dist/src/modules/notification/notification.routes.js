"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRouter = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = require("../../shared/http");
const notification_controller_1 = require("./notification.controller");
const notification_repo_1 = require("./notification.repo");
const notification_schemas_1 = require("./notification.schemas");
const notification_service_1 = require("./notification.service");
const verifyToken = require("../../../app/middlewares/protectApi");
const notificationRepository = new notification_repo_1.NotificationRepository();
const notificationService = new notification_service_1.NotificationService(notificationRepository);
const notificationController = new notification_controller_1.NotificationController(notificationService);
exports.notificationRouter = express_1.default.Router();
exports.notificationRouter.get("/", verifyToken, (0, http_1.asyncHandler)(notificationController.getNotifications));
exports.notificationRouter.delete("/", verifyToken, (0, http_1.validateRequest)({ body: notification_schemas_1.emptyNotificationPayloadSchema }), (0, http_1.asyncHandler)(notificationController.clearNotifications));
exports.notificationRouter.put("/", verifyToken, (0, http_1.validateRequest)({ body: notification_schemas_1.emptyNotificationPayloadSchema }), (0, http_1.asyncHandler)(notificationController.markAsRead));
//# sourceMappingURL=notification.routes.js.map