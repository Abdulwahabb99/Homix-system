import { createSlice } from "@reduxjs/toolkit";
import { getNotificationCategory } from "shared/notifications/notificationCategories";

/**
 * The API pages notifications (50 at a time), so the loaded items are only a window of the history.
 * Unread badges therefore come from the server (`counts`, computed over ALL unread rows) and are adjusted
 * optimistically here; they are never derived from the loaded items once the server has answered.
 *
 * `pages.all` is the «الكل» tab. A category tab gets its own server-side page (filtered by category) the first
 * time it is opened, so a tab never shows only the tickets that happen to be inside the latest 50 notifications.
 */
const TABS = ["all", "orders", "shipments", "tickets"];

const emptyPage = () => ({ items: [], hasMore: false, nextCursor: null, loaded: false });

export const initialNotificationsState = () => ({
  counts: null,
  loadingMore: null,
  pages: {
    all: emptyPage(),
    orders: emptyPage(),
    shipments: emptyPage(),
    tickets: emptyPage(),
  },
});

const normalizeDate = (value) => value instanceof Date ? value.toISOString() : value ?? null;

const normalizeNotification = (notification) => ({
  ...notification,
  readAt: normalizeDate(notification?.readAt),
  createdAt: normalizeDate(notification?.createdAt),
  category: getNotificationCategory(notification),
});

const normalizeCounts = (counts) => counts && typeof counts === "object"
  ? {
      orders: Number(counts.orders) || 0,
      shipments: Number(counts.shipments) || 0,
      tickets: Number(counts.tickets) || 0,
      total: Number(counts.total) || 0,
    }
  : null;

const isLocal = (n) => String(n.id).startsWith("local-");

let localSeq = 0;

/** A refresh (first page) must not throw away older pages the user already scrolled through. */
const mergeFirstPage = (page, incoming) => {
  const ids = new Set(incoming.items.map((n) => String(n.id)));
  const lastIncoming = incoming.items[incoming.items.length - 1];
  const keepOlder = incoming.hasMore && lastIncoming
    ? page.items.filter(
        (n) => !isLocal(n) && !ids.has(String(n.id)) && String(n.createdAt) <= String(lastIncoming.createdAt),
      )
    : [];

  if (keepOlder.length === 0) {
    return { ...incoming, loaded: true };
  }
  return {
    items: [...incoming.items, ...keepOlder],
    hasMore: page.hasMore,
    nextCursor: page.nextCursor,
    loaded: true,
  };
};

const toIncomingPage = (payload) => ({
  items: (payload.notifications ?? []).map(normalizeNotification),
  hasMore: Boolean(payload.hasMore),
  nextCursor: payload.nextCursor ?? null,
});

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: initialNotificationsState(),
  reducers: {
    // payload: { tab?, notifications, counts?, hasMore?, nextCursor? } - or a bare array (items of «الكل» only)
    setNotifications: (state, action) => {
      const payload = Array.isArray(action.payload)
        ? { notifications: action.payload }
        : action.payload ?? {};
      const tab = TABS.includes(payload.tab) ? payload.tab : "all";
      state.pages[tab] = mergeFirstPage(state.pages[tab], toIncomingPage(payload));
      const counts = normalizeCounts(payload.counts);
      if (counts) state.counts = counts;
    },
    // "load more": older items are appended (de-duplicated by id)
    appendNotifications: (state, action) => {
      const payload = action.payload ?? {};
      const tab = TABS.includes(payload.tab) ? payload.tab : "all";
      const incoming = toIncomingPage(payload);
      const page = state.pages[tab];
      const ids = new Set(page.items.map((n) => String(n.id)));
      page.items = [...page.items, ...incoming.items.filter((n) => !ids.has(String(n.id)))];
      page.hasMore = incoming.hasMore;
      page.nextCursor = incoming.nextCursor;
      page.loaded = true;
      const counts = normalizeCounts(payload.counts);
      if (counts) state.counts = counts;
    },
    // payload: the tab being loaded, or null when done
    setLoadingMore: (state, action) => {
      state.loadingMore = action.payload ?? null;
    },
    // Real-time payloads have no id/readAt/createdAt yet; give them local ones so they
    // land in the right tab immediately. The list is re-fetched afterwards for real ids.
    addNotification: (state, action) => {
      const notification = Array.isArray(action.payload) ? action.payload[0] : action.payload;
      if (!notification) return;
      localSeq += 1;
      const item = normalizeNotification({
        ...notification,
        id: notification.id ?? `local-${Date.now()}-${localSeq}`,
        readAt: notification.readAt ?? null,
        createdAt: notification.createdAt ?? new Date().toISOString(),
        entityId: notification.entityId ?? notification.orderId ?? null,
        entityType: notification.entityType ?? (notification.orderId != null ? "order" : undefined),
      });
      state.pages.all.items.unshift(item);
      if (state.pages[item.category].loaded) state.pages[item.category].items.unshift(item);
      if (state.counts && !item.readAt) {
        state.counts[item.category] += 1;
        state.counts.total += 1;
      }
    },
    markNotificationRead: (state, action) => {
      const id = String(action.payload);
      const readAt = new Date().toISOString();
      let category = null;
      for (const tab of TABS) {
        for (const n of state.pages[tab].items) {
          if (String(n.id) === id && !n.readAt) {
            n.readAt = readAt;
            category = category ?? n.category;
          }
        }
      }
      if (category && state.counts) {
        state.counts[category] = Math.max(0, state.counts[category] - 1);
        state.counts.total = Math.max(0, state.counts.total - 1);
      }
    },
    // payload: a category, or undefined/null for every notification
    markCategoryRead: (state, action) => {
      const category = action.payload;
      const readAt = new Date().toISOString();
      for (const tab of TABS) {
        for (const n of state.pages[tab].items) {
          if (!n.readAt && (!category || getNotificationCategory(n) === category)) n.readAt = readAt;
        }
      }
      if (state.counts) {
        if (category) {
          state.counts.total = Math.max(0, state.counts.total - state.counts[category]);
          state.counts[category] = 0;
        } else {
          state.counts = { orders: 0, shipments: 0, tickets: 0, total: 0 };
        }
      }
    },
    clearNotifications: () => initialNotificationsState(),
  },
});

export const {
  setNotifications,
  appendNotifications,
  setLoadingMore,
  addNotification,
  markNotificationRead,
  markCategoryRead,
  clearNotifications,
} = notificationsSlice.actions;
export default notificationsSlice.reducer;
