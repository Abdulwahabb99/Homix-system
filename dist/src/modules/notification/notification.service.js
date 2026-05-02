"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const errors_1 = require("../../shared/errors");
const result_1 = require("../../shared/result");
const NOTIFICATIONS_CLEARED_MESSAGE = "Notifications cleared";
const NOTIFICATIONS_MARKED_AS_READ_MESSAGE = "Notifications marked as read";
class NotificationService {
    notificationRepository;
    constructor(notificationRepository) {
        this.notificationRepository = notificationRepository;
    }
    async clearNotifications(userId) {
        const deletedRows = await this.notificationRepository.delete({ userId });
        if (deletedRows < 1) {
            throw new errors_1.NotFoundError("Notifications not found");
        }
        return (0, result_1.success)({
            message: NOTIFICATIONS_CLEARED_MESSAGE,
            status: true,
        });
    }
    async createNotification(payload) {
        const notification = await this.notificationRepository.create(payload);
        return (0, result_1.success)(notification);
    }
    async getNotifications(userId) {
        const notifications = await this.notificationRepository.findAll({ userId });
        return (0, result_1.success)({
            notifications,
            status: true,
        });
    }
    async markAsRead(userId) {
        const updatedRows = await this.notificationRepository.update({ readAt: null, userId }, { readAt: new Date() });
        if (updatedRows < 1) {
            throw new errors_1.NotFoundError("Unread notifications not found");
        }
        return (0, result_1.success)({
            message: NOTIFICATIONS_MARKED_AS_READ_MESSAGE,
            status: true,
        });
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=notification.service.js.map