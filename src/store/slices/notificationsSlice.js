// store/notificationsSlice.js
import { createSlice } from "@reduxjs/toolkit";

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: [],
  reducers: {
    addNotification: (state, action) => {
      state.unshift(action.payload);
    },
    clearNotifications: () => [],
  },
});

export const { addNotification, clearNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;
