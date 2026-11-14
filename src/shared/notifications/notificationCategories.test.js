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

  it("puts real-time socket payloads of the new producers in the right tab and route", () => {
    // backend socket payload: { entityId, entityType, text, userId: null } (no category, no orderId)
    const shipment = { entityId: 8, entityType: "shipment", text: "تم تغيير حالة الشحنة #SH8 إلى تم التسليم", userId: null };
    const ticket = { entityId: 4, entityType: "ticket", text: "تم إنشاء تذكرة جديدة رقم #4", userId: null };
    expect(getNotificationCategory(shipment)).toBe("shipments");
    expect(getNotificationCategory(ticket)).toBe("tickets");
    expect(getNotificationRoute(shipment)).toBe("/shipments/8");
    expect(getNotificationRoute(ticket)).toBe("/tickets/4");
    expect(countUnread([shipment, ticket, ticket])).toEqual({ all: 3, orders: 0, shipments: 1, tickets: 2 });
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
    expect(getNotificationTitle({ text: "تم تغيير حالة الشحنة #SH12273 إلى تم التسليم", entityType: "shipment" })).toBe("تم تغيير حالة الشحنة");
    expect(getNotificationTitle({ text: "تم تغيير حالة 5 شحنة إلى تم التسليم", entityType: "shipment" })).toBe("تم تغيير حالة 5 شحنة");
    expect(getNotificationTitle({ text: "تم جدولة الشحنة #SH1 بتاريخ 2026-12-01", entityType: "shipment" })).toBe("تم جدولة الشحنة");
    expect(getNotificationTitle({ text: "تم إنشاء تذكرة جديدة رقم #12", entityType: "ticket" })).toBe("تم إنشاء تذكرة جديدة");
    expect(getNotificationTitle({ text: "تم إسناد التذكرة رقم #12 إليك", entityType: "ticket" })).toBe("تم إسناد التذكرة");
    expect(getNotificationTitle({ text: "تم تغيير حالة التذكرة رقم #12 إلى مغلقة", entityType: "ticket" })).toBe("تم تغيير حالة التذكرة");
    expect(getNotificationTitle({ text: "تم إضافة رد جديد على التذكرة رقم #12", entityType: "ticket" })).toBe("تم إضافة رد جديد على التذكرة");
    const now = Date.parse("2026-01-10T12:00:00Z");
    expect(formatRelativeTime("2026-01-10T11:59:50Z", now)).toBe("دلوقتي");
    expect(formatRelativeTime("2026-01-10T11:30:00Z", now)).toBe("من 30 دقيقة");
    expect(formatRelativeTime("2026-01-10T09:00:00Z", now)).toBe("من 3 ساعة");
    expect(formatRelativeTime("2026-01-09T09:00:00Z", now)).toBe("امبارح");
    expect(formatBadge(12)).toBe("9+");
    expect(formatBadge(4)).toBe("4");
  });
});
