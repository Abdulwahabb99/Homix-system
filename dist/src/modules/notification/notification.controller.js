"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const result_1 = require("../../shared/result");
class NotificationController {
    notificationService;
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    clearNotifications = async (request, response) => {
        const result = await this.notificationService.clearNotifications(request.user.id);
        response.status(200).json((0, result_1.unwrap)(result));
    };
    getNotifications = async (request, response) => {
        const result = await this.notificationService.getNotifications(request.user.id);
        response.status(200).json((0, result_1.unwrap)(result));
    };
    markAsRead = async (request, response) => {
        const result = await this.notificationService.markAsRead(request.user.id);
        response.status(200).json((0, result_1.unwrap)(result));
    };
}
exports.NotificationController = NotificationController;
//# sourceMappingURL=notification.controller.js.map