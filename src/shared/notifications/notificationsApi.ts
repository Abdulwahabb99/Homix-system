import axiosRequest from "shared/functions/axiosRequest";
import {
  appendNotifications,
  markCategoryRead,
  setLoadingMore,
  setNotifications,
} from "store/slices/notificationsSlice";
import { CATEGORY_LABELS } from "./notificationCategories";
import type { NotificationCategory, NotificationTab } from "./notificationCategories";

const base = () => `${process.env.REACT_APP_API_URL}/notifications`;

/** The API returns a bounded page (it used to return the user's whole history, ~18k rows per call). */
export const NOTIFICATIONS_PAGE_SIZE = 50;

export type NotificationCursor = { before: string; beforeId: number };

const pageParams = (tab: NotificationTab, cursor?: NotificationCursor | null) => ({
  limit: NOTIFICATIONS_PAGE_SIZE,
  ...(tab !== "all" ? { category: tab } : {}),
  ...(cursor ? { before: cursor.before, beforeId: cursor.beforeId } : {}),
});

/**
 * Loads the newest page of the signed-in user's notifications (the API only ever returns their own) together with
 * the server-computed unread counts for the badges. `tab` loads a single category's page instead of «الكل».
 */
export const fetchNotifications = (dispatch: (action: unknown) => unknown, tab: NotificationTab = "all") =>
  axiosRequest.get(base(), { params: pageParams(tab) }).then(({ data }) => {
    dispatch(
      setNotifications({
        tab,
        notifications: data?.notifications ?? [],
        counts: data?.counts,
        hasMore: data?.hasMore,
        nextCursor: data?.nextCursor,
      })
    );
  });

/** «عرض المزيد»: the next (older) page of a tab, appended to the loaded list. */
export const loadMoreNotifications = async (
  dispatch: (action: unknown) => unknown,
  tab: NotificationTab,
  cursor: NotificationCursor | null | undefined
): Promise<void> => {
  if (!cursor) return;
  dispatch(setLoadingMore(tab));
  try {
    const { data } = await axiosRequest.get(base(), { params: pageParams(tab, cursor) });
    dispatch(
      appendNotifications({
        tab,
        notifications: data?.notifications ?? [],
        counts: data?.counts,
        hasMore: data?.hasMore,
        nextCursor: data?.nextCursor,
      })
    );
  } finally {
    dispatch(setLoadingMore(null));
  }
};

export const markNotificationReadRequest = (id: string | number) =>
  axiosRequest.put(`${base()}/${encodeURIComponent(String(id))}/read`, {});

/** No category = every tab. */
export const markCategoryReadRequest = (category?: NotificationCategory) =>
  axiosRequest.put(base(), category ? { category } : {});

/**
 * Mark-all flow shared by the panel: the badges drop immediately (optimistic), then the
 * server answer decides. Whatever happens the first page and the counts are re-fetched afterwards
 * so the cache always reflects the DB; a failed request therefore brings the unread items and the
 * badges back and rejects so the caller can tell the user.
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
    if (category) await fetchNotifications(dispatch, category).catch(() => {});
  }
}

/** Label of the mark-all action: «الكل» marks everything, any other tab only its category. */
export function markAllLabel(tab: "all" | NotificationCategory): string {
  return tab === "all" ? "تحديد الكل كمقروء" : `تحديد ${CATEGORY_LABELS[tab]} كمقروء`;
}
