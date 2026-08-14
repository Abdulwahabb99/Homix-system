import { createSlice } from "@reduxjs/toolkit";

const normalizeDate = (value) => value instanceof Date ? value.toISOString() : value ?? null;

const normalizeNotification = (notification) => ({
  ...notification,
  readAt: normalizeDate(notification?.readAt),
  createdAt: normalizeDate(notification?.createdAt),
});

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: [],
  reducers: {
    setNotifications: (state, action) => {
      return Array.isArray(action.payload)
        ? action.payload.map(normalizeNotification)
        : [];
    },
    addNotification: (state, action) => {
      const notification = Array.isArray(action.payload) ? action.payload[0] : action.payload;
      return notification ? [normalizeNotification(notification), ...state] : state;
    },
    clearNotifications: () => [],
  },
});

export const { setNotifications, addNotification, clearNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;
