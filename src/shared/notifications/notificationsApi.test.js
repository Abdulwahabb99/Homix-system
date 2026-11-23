import axiosRequest from "shared/functions/axiosRequest";
import { fetchNotifications, loadMoreNotifications, markAllLabel, markAllRead } from "./notificationsApi";

jest.mock("shared/functions/axiosRequest", () => ({
  __esModule: true,
  default: { get: jest.fn(), put: jest.fn() },
}));

describe("markAllRead", () => {
  beforeEach(() => {
    axiosRequest.get.mockReset().mockResolvedValue({ data: { notifications: [] } });
    axiosRequest.put.mockReset();
  });

  it("sends PUT /notifications with the category, then re-syncs from the server", async () => {
    axiosRequest.put.mockResolvedValue({ data: { status: true } });
    const dispatch = jest.fn();
    await markAllRead(dispatch, "tickets");
    expect(dispatch.mock.calls[0][0]).toMatchObject({ type: "notifications/markCategoryRead", payload: "tickets" });
    expect(axiosRequest.put.mock.calls[0][0]).toMatch(/\/notifications$/);
    expect(axiosRequest.put.mock.calls[0][1]).toEqual({ category: "tickets" });
    // first page of «الكل» and of the tab being cleared, each with the server counts
    expect(axiosRequest.get).toHaveBeenCalledTimes(2);
    expect(axiosRequest.get.mock.calls[0][1].params).toEqual({ limit: 50 });
    expect(axiosRequest.get.mock.calls[1][1].params).toEqual({ limit: 50, category: "tickets" });
    expect(dispatch.mock.calls[1][0].type).toBe("notifications/setNotifications");
  });

  it("sends an empty body for the all tab", async () => {
    axiosRequest.put.mockResolvedValue({});
    await markAllRead(jest.fn(), undefined);
    expect(axiosRequest.put.mock.calls[0][1]).toEqual({});
  });

  it("restores server state and rejects when the request fails", async () => {
    axiosRequest.put.mockRejectedValue(new Error("403"));
    const dispatch = jest.fn();
    await expect(markAllRead(dispatch, "orders")).rejects.toThrow("403");
    expect(axiosRequest.get).toHaveBeenCalledTimes(2);
  });
});

describe("paged notifications", () => {
  beforeEach(() => axiosRequest.get.mockReset());

  it("fetches a bounded first page and stores the server counts with the cursor", async () => {
    axiosRequest.get.mockResolvedValue({
      data: {
        notifications: [{ id: 1 }],
        counts: { orders: 3, shipments: 0, tickets: 1, total: 4 },
        hasMore: true,
        nextCursor: { before: "2026-11-02T09:00:00.000Z", beforeId: 1 },
      },
    });
    const dispatch = jest.fn();
    await fetchNotifications(dispatch);
    expect(axiosRequest.get.mock.calls[0][1].params).toEqual({ limit: 50 });
    expect(dispatch.mock.calls[0][0]).toMatchObject({
      type: "notifications/setNotifications",
      payload: { tab: "all", hasMore: true, counts: { total: 4 } },
    });
  });

  it("loads more with the cursor (and category) and always clears the loading flag", async () => {
    axiosRequest.get.mockResolvedValue({ data: { notifications: [{ id: 0 }], hasMore: false, nextCursor: null } });
    const dispatch = jest.fn();
    const cursor = { before: "2026-11-02T09:00:00.000Z", beforeId: 1 };
    await loadMoreNotifications(dispatch, "tickets", cursor);
    expect(axiosRequest.get.mock.calls[0][1].params).toEqual({
      limit: 50,
      category: "tickets",
      before: cursor.before,
      beforeId: 1,
    });
    expect(dispatch.mock.calls.map(([action]) => action.type)).toEqual([
      "notifications/setLoadingMore",
      "notifications/appendNotifications",
      "notifications/setLoadingMore",
    ]);

    axiosRequest.get.mockRejectedValue(new Error("500"));
    const failing = jest.fn();
    await expect(loadMoreNotifications(failing, "all", cursor)).rejects.toThrow("500");
    expect(failing.mock.calls[failing.mock.calls.length - 1][0]).toMatchObject({
      type: "notifications/setLoadingMore",
      payload: null,
    });
  });

  it("does nothing without a cursor", async () => {
    const dispatch = jest.fn();
    await loadMoreNotifications(dispatch, "all", null);
    expect(dispatch).not.toHaveBeenCalled();
    expect(axiosRequest.get).not.toHaveBeenCalled();
  });
});

describe("markAllLabel", () => {
  it("matches the scope of the action", () => {
    expect(markAllLabel("all")).toBe("تحديد الكل كمقروء");
    expect(markAllLabel("shipments")).toBe("تحديد الشحنات كمقروء");
  });
});
