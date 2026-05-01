export interface NotificationAttributes {
  createdAt?: Date;
  entityId: number;
  entityType: string;
  id: number;
  readAt: Date | null;
  text: string;
  updatedAt?: Date;
  userId: number | null;
}

export interface CreateNotificationInput {
  entityId: number;
  entityType: string;
  text: string;
  userId: number | null;
}

export interface NotificationResponse {
  notifications: NotificationAttributes[];
  status: true;
}

export interface NotificationActionResponse {
  message: string;
  status: true;
}
