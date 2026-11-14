import axiosRequest from "shared/functions/axiosRequest";
import { setNotifications } from "store/slices/notificationsSlice";
import type { NotificationCategory } from "./notificationCategories";

const base = () => `${process.env.REACT_APP_API_URL}/notifications`;

/** Loads the signed-in user's notifications (the API only ever returns their own). */
export const fetchNotifications = (dispatch: (action: unknown) => unknown) =>
  axiosRequest.get(base()).then(({ data }) => {
    dispatch(setNotifications(data?.notifications ?? []));
  });

export const markNotificationReadRequest = (id: string | number) =>
  axiosRequest.put(`${base()}/${encodeURIComponent(String(id))}/read`, {});

/** No category = every tab. */
export const markCategoryReadRequest = (category?: NotificationCategory) =>
  axiosRequest.put(base(), category ? { category } : {});
