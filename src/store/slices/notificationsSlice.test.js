import reducer, {
  addNotification,
  appendNotifications,
  markCategoryRead,
  markNotificationRead,
  setNotifications,
} from "./notificationsSlice";

const counts = { orders: 40, shipments: 5, tickets: 2, total: 47 };
const item = (id, entityType = "order", createdAt = `2026-11-0${id}T10:00:00.000Z`, readAt = null) => ({
  id,
  entityType,
  createdAt,
  readAt,
});

const loaded = () =>
  reducer(
    undefined,
    setNotifications({
      notifications: [item(3), item(2, "ticket")],
      counts,
      hasMore: true,
      nextCursor: { before: "2026-11-02T10:00:00.000Z", beforeId: 2 },
    })
  );

describe("notifications slice (paged)", () => {
  it("keeps the server counts even though only a page is loaded", () => {
    const state = loaded();
    expect(state.pages.all.items).toHaveLength(2);
    expect(state.counts).toEqual(counts);
    expect(state.pages.all.hasMore).toBe(true);
    expect(state.pages.all.nextCursor.beforeId).toBe(2);
  });

  it("appends older pages without duplicates and updates the cursor", () => {
    const state = reducer(
      loaded(),
      appendNotifications({ notifications: [item(2, "ticket"), item(1)], hasMore: false, nextCursor: null })
    );
    expect(state.pages.all.items.map((n) => n.id)).toEqual([3, 2, 1]);
    expect(state.pages.all.hasMore).toBe(false);
    expect(state.pages.all.nextCursor).toBeNull();
  });

  it("a refresh keeps older pages the user already loaded", () => {
    let state = reducer(
      loaded(),
      appendNotifications({ notifications: [item(1)], hasMore: false, nextCursor: null })
    );
    state = reducer(
      state,
      setNotifications({
        notifications: [item(4), item(3), item(2, "ticket")],
        counts,
        hasMore: true,
        nextCursor: { before: "2026-11-02T10:00:00.000Z", beforeId: 2 },
      })
    );
    expect(state.pages.all.items.map((n) => n.id)).toEqual([4, 3, 2, 1]);
    expect(state.pages.all.hasMore).toBe(false);
  });

  it("marking one notification read lowers only its category badge and the total", () => {
    const state = reducer(loaded(), markNotificationRead(2));
    expect(state.counts).toEqual({ orders: 40, shipments: 5, tickets: 1, total: 46 });
    expect(state.pages.all.items.find((n) => n.id === 2).readAt).toBeTruthy();
    // idempotent: an already-read item does not lower the badge again
    expect(reducer(state, markNotificationRead(2)).counts.total).toBe(46);
  });

  it("mark all (no category) zeroes every badge, not just the loaded items", () => {
    const state = reducer(loaded(), markCategoryRead(undefined));
    expect(state.counts).toEqual({ orders: 0, shipments: 0, tickets: 0, total: 0 });
    expect(state.pages.all.items.every((n) => n.readAt)).toBe(true);
  });

  it("mark a category zeroes that badge and subtracts it from the total", () => {
    const state = reducer(loaded(), markCategoryRead("orders"));
    expect(state.counts).toEqual({ orders: 0, shipments: 5, tickets: 2, total: 7 });
    expect(state.pages.all.items.find((n) => n.id === 2).readAt).toBeNull();
  });

  it("a real-time notification bumps the matching badge", () => {
    const state = reducer(loaded(), addNotification({ text: "x", entityType: "shipment", entityId: 9 }));
    expect(state.counts).toEqual({ orders: 40, shipments: 6, tickets: 2, total: 48 });
    expect(state.pages.all.items[0].category).toBe("shipments");
  });

  it("a category tab is its own page", () => {
    const state = reducer(
      loaded(),
      setNotifications({ tab: "tickets", notifications: [item(2, "ticket")], hasMore: false, counts })
    );
    expect(state.pages.tickets.loaded).toBe(true);
    expect(state.pages.tickets.items).toHaveLength(1);
    expect(state.pages.orders.loaded).toBe(false);
  });
});
