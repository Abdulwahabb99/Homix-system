import type { BaseRepository } from "../../shared/repository";
import type {
  CreateNotificationInput,
  NotificationAttributes,
} from "./notification.types";

type LegacyNotificationModel = {
  create: (payload: CreateNotificationInput) => Promise<{ toJSON: () => NotificationAttributes }>;
  destroy: (options: { where: Readonly<Record<string, unknown>> }) => Promise<number>;
  findAll: (options: {
    order?: ReadonlyArray<readonly [string, string]>;
    where?: Readonly<Record<string, unknown>>;
  }) => Promise<Array<{ toJSON: () => NotificationAttributes } | NotificationAttributes>>;
  update: (
    payload: Partial<CreateNotificationInput> & { readAt?: Date | null },
    options: { where: Readonly<Record<string, unknown>> },
  ) => Promise<[number]>;
};

const notificationModel = require("../../../app/modules/notification/notification.model") as LegacyNotificationModel;

const toNotification = (
  notification: { toJSON: () => NotificationAttributes } | NotificationAttributes,
): NotificationAttributes => {
  return "toJSON" in notification ? notification.toJSON() : notification;
};

export class NotificationRepository
  implements BaseRepository<NotificationAttributes, CreateNotificationInput, Partial<CreateNotificationInput>>
{
  public async create<TResult = NotificationAttributes>(
    payload: CreateNotificationInput,
  ): Promise<TResult> {
    const createdNotification = await notificationModel.create(payload);
    return toNotification(createdNotification) as TResult;
  }

  public async findAll<TResult = NotificationAttributes>(
    filters: Readonly<Record<string, unknown>> = {},
  ): Promise<TResult[]> {
    const notifications = await notificationModel.findAll({
      order: [["createdAt", "DESC"]],
      where: filters,
    });

    return notifications.map((notification) => toNotification(notification) as TResult);
  }

  public async update<TResult = number>(
    filters: Readonly<Record<string, unknown>>,
    payload: Partial<CreateNotificationInput> & { readAt?: Date | null },
  ): Promise<TResult> {
    const [affectedRows] = await notificationModel.update(payload, { where: filters });
    return affectedRows as TResult;
  }

  public async delete<TResult = number>(
    filters: Readonly<Record<string, unknown>>,
  ): Promise<TResult> {
    const deletedRows = await notificationModel.destroy({ where: filters });
    return deletedRows as TResult;
  }
}
