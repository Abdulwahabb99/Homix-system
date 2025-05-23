import { createSlice } from "@reduxjs/toolkit";

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: [],
  reducers: {
    setNotifications: (state, action) => {
      return action.payload;
    },
    addNotification: (state, action) => {
      const notification = Array.isArray(action.payload) ? action.payload[0] : action.payload;
      return [notification, ...state];
    },
    clearNotifications: () => [],
  },
});

export const { setNotifications, addNotification, clearNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;
