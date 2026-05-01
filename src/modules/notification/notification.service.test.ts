import { NotFoundError } from "../../shared/errors";
import { NotificationRepository } from "./notification.repo";
import { NotificationService } from "./notification.service";

describe("NotificationService", () => {
  it("returns notifications for a user", async () => {
    const notificationRepository = {
      findAll: jest.fn().mockResolvedValue([{ id: 1, userId: 2 }]),
    } as Pick<NotificationRepository, "findAll"> as NotificationRepository;
    const service = new NotificationService(notificationRepository);

    const result = await service.getNotifications(2);

    expect(result.ok).toBe(true);
    expect(notificationRepository.findAll).toHaveBeenCalledWith({ userId: 2 });
  });

  it("throws when markAsRead updates nothing", async () => {
    const notificationRepository = {
      update: jest.fn().mockResolvedValue(0),
    } as Pick<NotificationRepository, "update"> as NotificationRepository;
    const service = new NotificationService(notificationRepository);

    await expect(service.markAsRead(4)).rejects.toBeInstanceOf(NotFoundError);
  });
});
