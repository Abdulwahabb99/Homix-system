import axiosRequest from "shared/functions/axiosRequest";
import { markAllLabel, markAllRead } from "./notificationsApi";

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
    expect(axiosRequest.get).toHaveBeenCalledTimes(1);
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
    expect(axiosRequest.get).toHaveBeenCalledTimes(1);
  });
});

describe("markAllLabel", () => {
  it("matches the scope of the action", () => {
    expect(markAllLabel("all")).toBe("تحديد الكل كمقروء");
    expect(markAllLabel("shipments")).toBe("تحديد الشحنات كمقروء");
  });
});
