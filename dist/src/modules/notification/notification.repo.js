"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRepository = void 0;
const notificationModel = require("../../../app/modules/notification/notification.model");
const toNotification = (notification) => {
    return "toJSON" in notification ? notification.toJSON() : notification;
};
class NotificationRepository {
    async create(payload) {
        const createdNotification = await notificationModel.create(payload);
        return toNotification(createdNotification);
    }
    async findAll(filters = {}) {
        const notifications = await notificationModel.findAll({
            order: [["createdAt", "DESC"]],
            where: filters,
        });
        return notifications.map((notification) => toNotification(notification));
    }
    async update(filters, payload) {
        const [affectedRows] = await notificationModel.update(payload, { where: filters });
        return affectedRows;
    }
    async delete(filters) {
        const deletedRows = await notificationModel.destroy({ where: filters });
        return deletedRows;
    }
}
exports.NotificationRepository = NotificationRepository;
//# sourceMappingURL=notification.repo.js.map