import { createSlice } from "@reduxjs/toolkit";
import { getNotificationCategory } from "shared/notifications/notificationCategories";

const normalizeDate = (value) => value instanceof Date ? value.toISOString() : value ?? null;

const normalizeNotification = (notification) => ({
  ...notification,
  readAt: normalizeDate(notification?.readAt),
  createdAt: normalizeDate(notification?.createdAt),
  category: getNotificationCategory(notification),
});

let localSeq = 0;

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: [],
  reducers: {
    setNotifications: (state, action) => {
      return Array.isArray(action.payload)
        ? action.payload.map(normalizeNotification)
        : [];
    },
    // Real-time payloads have no id/readAt/createdAt yet; give them local ones so they
    // land in the right tab immediately. The list is re-fetched afterwards for real ids.
    addNotification: (state, action) => {
      const notification = Array.isArray(action.payload) ? action.payload[0] : action.payload;
      if (!notification) return state;
      localSeq += 1;
      return [
        normalizeNotification({
          ...notification,
          id: notification.id ?? `local-${Date.now()}-${localSeq}`,
          readAt: notification.readAt ?? null,
          createdAt: notification.createdAt ?? new Date().toISOString(),
          entityId: notification.entityId ?? notification.orderId ?? null,
          entityType: notification.entityType ?? (notification.orderId != null ? "order" : undefined),
        }),
        ...state,
      ];
    },
    markNotificationRead: (state, action) =>
      state.map((n) => (String(n.id) === String(action.payload) && !n.readAt
        ? { ...n, readAt: new Date().toISOString() }
        : n)),
    // payload: a category, or undefined/null for every notification
    markCategoryRead: (state, action) => {
      const category = action.payload;
      const readAt = new Date().toISOString();
      return state.map((n) =>
        !n.readAt && (!category || getNotificationCategory(n) === category) ? { ...n, readAt } : n);
    },
    clearNotifications: () => [],
  },
});

export const {
  setNotifications,
  addNotification,
  markNotificationRead,
  markCategoryRead,
  clearNotifications,
} = notificationsSlice.actions;
export default notificationsSlice.reducer;
