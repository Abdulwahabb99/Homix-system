import express from "express";

import { asyncHandler, validateRequest } from "../../shared/http";
import { NotificationController } from "./notification.controller";
import { NotificationRepository } from "./notification.repo";
import { emptyNotificationPayloadSchema } from "./notification.schemas";
import { NotificationService } from "./notification.service";

const verifyToken = require("../../../app/middlewares/protectApi");
const requirePermission = require("../../../app/middlewares/requirePermission");

const notificationRepository = new NotificationRepository();
const notificationService = new NotificationService(notificationRepository);
const notificationController = new NotificationController(notificationService);

export const notificationRouter = express.Router();

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
notificationRouter.get(
  "/",
  verifyToken,
  requirePermission("notifications_view"),
  asyncHandler(notificationController.getNotifications),
);

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
notificationRouter.delete(
  "/",
  verifyToken,
  requirePermission("notifications_manage"),
  validateRequest({ body: emptyNotificationPayloadSchema }),
  asyncHandler(notificationController.clearNotifications),
);

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
notificationRouter.put(
  "/",
  verifyToken,
  requirePermission("notifications_manage"),
  validateRequest({ body: emptyNotificationPayloadSchema }),
  asyncHandler(notificationController.markAsRead),
);
