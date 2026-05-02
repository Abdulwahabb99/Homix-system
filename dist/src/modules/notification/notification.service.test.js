"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../../shared/errors");
const notification_service_1 = require("./notification.service");
describe("NotificationService", () => {
    it("returns notifications for a user", async () => {
        const notificationRepository = {
            findAll: jest.fn().mockResolvedValue([{ id: 1, userId: 2 }]),
        };
        const service = new notification_service_1.NotificationService(notificationRepository);
        const result = await service.getNotifications(2);
        expect(result.ok).toBe(true);
        expect(notificationRepository.findAll).toHaveBeenCalledWith({ userId: 2 });
    });
    it("throws when markAsRead updates nothing", async () => {
        const notificationRepository = {
            update: jest.fn().mockResolvedValue(0),
        };
        const service = new notification_service_1.NotificationService(notificationRepository);
        await expect(service.markAsRead(4)).rejects.toBeInstanceOf(errors_1.NotFoundError);
    });
});
//# sourceMappingURL=notification.service.test.js.map