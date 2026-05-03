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
/**
 * @swagger
 * /notifications:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Notifications
 *     summary: Get current user's notifications
 *     description: Returns the authenticated user's notification feed ordered by the latest activity.
 *     responses:
 *       200:
 *         description: Notification list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationListResponse'
 *             examples:
 *               default:
 *                 value:
 *                   data:
 *                     - id: 17
 *                       message: طلب جديد رقم 31668
 *                       type: order
 *                       isRead: false
 *                       createdAt: 2026-05-02T00:45:00.000Z
 *                   status: true
 *       401:
 *         description: Missing or invalid bearer token
 */
exports.notificationRouter.get("/", verifyToken, (0, http_1.asyncHandler)(notificationController.getNotifications));
/**
 * @swagger
 * /notifications:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Notifications
 *     summary: Clear current user's notifications
 *     description: Deletes all notifications for the authenticated user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmptyObject'
 *           examples:
 *             empty:
 *               value: {}
 *     responses:
 *       200:
 *         description: Notifications removed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenericMessageResponse'
 *             examples:
 *               cleared:
 *                 value:
 *                   message: Notifications cleared successfully
 *                   status: true
 *                   statusCode: 200
 *       401:
 *         description: Missing or invalid bearer token
 */
exports.notificationRouter.delete("/", verifyToken, (0, http_1.validateRequest)({ body: notification_schemas_1.emptyNotificationPayloadSchema }), (0, http_1.asyncHandler)(notificationController.clearNotifications));
/**
 * @swagger
 * /notifications:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Notifications
 *     summary: Mark all notifications as read
 *     description: Marks the authenticated user's notification feed as read.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmptyObject'
 *           examples:
 *             empty:
 *               value: {}
 *     responses:
 *       200:
 *         description: Notifications marked as read
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenericMessageResponse'
 *             examples:
 *               updated:
 *                 value:
 *                   message: Notifications marked as read successfully
 *                   status: true
 *                   statusCode: 200
 *       401:
 *         description: Missing or invalid bearer token
 */
exports.notificationRouter.put("/", verifyToken, (0, http_1.validateRequest)({ body: notification_schemas_1.emptyNotificationPayloadSchema }), (0, http_1.asyncHandler)(notificationController.markAsRead));
//# sourceMappingURL=notification.routes.js.map