import {
  countUnread,
  filterByTab,
  formatBadge,
  formatRelativeTime,
  getNotificationCategory,
  getNotificationRoute,
  getNotificationTitle,
} from "./notificationCategories";

describe("notification categories", () => {
  it("derives the category like the backend", () => {
    expect(getNotificationCategory({ entityType: "order" })).toBe("orders");
    expect(getNotificationCategory({ entityType: "vendor" })).toBe("orders");
    expect(getNotificationCategory({ entityType: "shipment" })).toBe("shipments");
    expect(getNotificationCategory({ entityType: "ticket" })).toBe("tickets");
    expect(getNotificationCategory({ orderId: 4 })).toBe("orders");
    expect(getNotificationCategory({ category: "tickets", entityType: "order" })).toBe("tickets");
  });

  it("counts unread per tab and filters lists", () => {
    const items = [
      { id: 1, entityType: "order", readAt: null },
      { id: 2, entityType: "order", readAt: "2026-01-01" },
      { id: 3, entityType: "shipment", readAt: null },
      { id: 4, entityType: "ticket", readAt: null },
      { id: 5, entityType: "ticket", readAt: null },
    ];
    expect(countUnread(items)).toEqual({ all: 4, orders: 1, shipments: 1, tickets: 2 });
    expect(filterByTab(items, "tickets").map((n) => n.id)).toEqual([4, 5]);
    expect(filterByTab(items, "all")).toHaveLength(5);
  });

  it("routes to the order, shipment or ticket", () => {
    expect(getNotificationRoute({ entityType: "order", entityId: 7 })).toBe("/orders/7");
    expect(getNotificationRoute({ orderId: 9 })).toBe("/orders/9");
    expect(getNotificationRoute({ entityType: "shipment", entityId: 3 })).toBe("/shipments/3");
    expect(getNotificationRoute({ entityType: "ticket", entityId: 5 })).toBe("/tickets/5");
    expect(getNotificationRoute({ entityType: "vendor", entityId: 5 })).toBeNull();
  });

  it("builds titles, relative time and badges", () => {
    expect(getNotificationTitle({ text: "تم اضافة طلب جديد رقم 5", entityType: "order" })).toBe("تم اضافة طلب جديد");
    expect(getNotificationTitle({ text: "x", entityType: "ticket" })).toBe("إشعار تذكرة");
    const now = Date.parse("2026-01-10T12:00:00Z");
    expect(formatRelativeTime("2026-01-10T11:59:50Z", now)).toBe("دلوقتي");
    expect(formatRelativeTime("2026-01-10T11:30:00Z", now)).toBe("من 30 دقيقة");
    expect(formatRelativeTime("2026-01-10T09:00:00Z", now)).toBe("من 3 ساعة");
    expect(formatRelativeTime("2026-01-09T09:00:00Z", now)).toBe("امبارح");
    expect(formatBadge(12)).toBe("9+");
    expect(formatBadge(4)).toBe("4");
  });
});
