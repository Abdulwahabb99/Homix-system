import { NotFoundError } from "../../shared/errors";
import type { Result } from "../../shared/result";
import { success } from "../../shared/result";
import { NotificationRepository } from "./notification.repo";
import type {
  CreateNotificationInput,
  NotificationActionResponse,
  NotificationAttributes,
  NotificationResponse,
} from "./notification.types";

export interface NotificationServiceContract {
  clearNotifications(userId: number): Promise<Result<NotificationActionResponse>>;
  createNotification(payload: CreateNotificationInput): Promise<Result<NotificationAttributes>>;
  getNotifications(userId: number): Promise<Result<NotificationResponse>>;
  markAsRead(userId: number): Promise<Result<NotificationActionResponse>>;
}

const NOTIFICATIONS_CLEARED_MESSAGE = "Notifications cleared";
const NOTIFICATIONS_MARKED_AS_READ_MESSAGE = "Notifications marked as read";

export class NotificationService implements NotificationServiceContract {
  public constructor(private readonly notificationRepository: NotificationRepository) {}

  public async clearNotifications(userId: number): Promise<Result<NotificationActionResponse>> {
    const deletedRows = await this.notificationRepository.delete({ userId });

    if (deletedRows < 1) {
      throw new NotFoundError("Notifications not found");
    }

    return success({
      message: NOTIFICATIONS_CLEARED_MESSAGE,
      status: true,
    });
  }

  public async createNotification(
    payload: CreateNotificationInput,
  ): Promise<Result<NotificationAttributes>> {
    const notification = await this.notificationRepository.create(payload);
    return success(notification);
  }

  public async getNotifications(userId: number): Promise<Result<NotificationResponse>> {
    const notifications = await this.notificationRepository.findAll({ userId });

    return success({
      notifications,
      status: true,
    });
  }

  public async markAsRead(userId: number): Promise<Result<NotificationActionResponse>> {
    const updatedRows = await this.notificationRepository.update(
      { readAt: null, userId },
      { readAt: new Date() },
    );

    if (updatedRows < 1) {
      throw new NotFoundError("Unread notifications not found");
    }

    return success({
      message: NOTIFICATIONS_MARKED_AS_READ_MESSAGE,
      status: true,
    });
  }
}
