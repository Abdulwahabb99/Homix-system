import { DashboardService } from "./dashboard.service";

describe("DashboardService", () => {
  it("returns admin cards with active makers", async () => {
    const dashboardRepository = {
      getSnapshot: jest
        .fn()
        .mockResolvedValueOnce({
          activeMakers: 5,
          activeProducts: 0,
          pendingOrders: 3,
          totalOrders: 10,
          totalSales: 1000,
        })
        .mockResolvedValueOnce({
          activeMakers: 4,
          activeProducts: 0,
          pendingOrders: 2,
          totalOrders: 8,
          totalSales: 800,
        }),
    } as never;
    const service = new DashboardService(dashboardRepository);

    const result = await service.getCards(
      {
        endDate: "2026-05-02T23:59:59.000Z",
        startDate: "2026-05-01T00:00:00.000Z",
      },
      { userType: "1" },
      null,
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.cards).toHaveLength(4);
      expect(result.data.cards[3]?.key).toBe("activeMakers");
    }
  });

  it("returns vendor cards with active products", async () => {
    const dashboardRepository = {
      getSnapshot: jest
        .fn()
        .mockResolvedValueOnce({
          activeMakers: 0,
          activeProducts: 7,
          pendingOrders: 6,
          totalOrders: 12,
          totalSales: 1500,
        })
        .mockResolvedValueOnce({
          activeMakers: 0,
          activeProducts: 5,
          pendingOrders: 4,
          totalOrders: 9,
          totalSales: 1000,
        }),
    } as never;
    const service = new DashboardService(dashboardRepository);

    const result = await service.getCards(
      {
        endDate: "2026-05-02T23:59:59.000Z",
        startDate: "2026-05-01T00:00:00.000Z",
      },
      { userType: "2" },
      17,
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.role).toBe("vendor");
      expect(result.data.cards[3]?.key).toBe("activeProducts");
    }
  });
});
