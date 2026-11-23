import axiosRequest from "shared/functions/axiosRequest";
import { markCategoryRead, setNotifications } from "store/slices/notificationsSlice";
import { CATEGORY_LABELS } from "./notificationCategories";
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

/**
 * Mark-all flow shared by the panel: the badges drop immediately (optimistic), then the
 * server answer decides. Whatever happens the list is re-fetched afterwards so the cache
 * always reflects the DB; a failed request therefore brings the unread items back and
 * rejects so the caller can tell the user.
 */
export async function markAllRead(
  dispatch: (action: unknown) => unknown,
  category?: NotificationCategory
): Promise<void> {
  dispatch(markCategoryRead(category));
  try {
    await markCategoryReadRequest(category);
  } finally {
    await fetchNotifications(dispatch).catch(() => {});
  }
}

/** Label of the mark-all action: «الكل» marks everything, any other tab only its category. */
export function markAllLabel(tab: "all" | NotificationCategory): string {
  return tab === "all" ? "تحديد الكل كمقروء" : `تحديد ${CATEGORY_LABELS[tab]} كمقروء`;
}
