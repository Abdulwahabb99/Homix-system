"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dashboard_service_1 = require("./dashboard.service");
describe("DashboardService", () => {
    const dateRange = {
        endDate: "2026-05-02T23:59:59.000Z",
        startDate: "2026-05-01T00:00:00.000Z",
    };
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
        };
        const service = new dashboard_service_1.DashboardService(dashboardRepository);
        const result = await service.getCards(dateRange, { userType: "1" }, null);
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
        };
        const service = new dashboard_service_1.DashboardService(dashboardRepository);
        const result = await service.getCards(dateRange, { userType: "2" }, 17);
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.data.role).toBe("vendor");
            expect(result.data.cards[3]?.key).toBe("activeProducts");
        }
    });
    it("returns performance series with sales summary", async () => {
        const dashboardRepository = {
            getPerformanceSeries: jest.fn().mockResolvedValue([{ date: "2026-05-01", orders: 3, sales: 900 }]),
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
        };
        const service = new dashboard_service_1.DashboardService(dashboardRepository);
        const result = await service.getPerformance(dateRange, { userType: "1" }, null);
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.data.series).toHaveLength(1);
            expect(result.data.summary.key).toBe("totalSales");
        }
    });
    it("returns quick actions for vendor users", async () => {
        const dashboardRepository = {};
        const service = new dashboard_service_1.DashboardService(dashboardRepository);
        const result = await service.getQuickActions({ userType: "2" }, 12);
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.data.role).toBe("vendor");
            expect(result.data.items[0]?.key).toBe("add-product");
        }
    });
    it("returns goals progress using role-specific metrics", async () => {
        const dashboardRepository = {
            getDeliveredOrdersCount: jest.fn().mockResolvedValue(25),
            getSnapshot: jest.fn().mockResolvedValue({
                activeMakers: 8,
                activeProducts: 0,
                pendingOrders: 3,
                totalOrders: 120,
                totalSales: 200000,
            }),
        };
        const service = new dashboard_service_1.DashboardService(dashboardRepository);
        const result = await service.getGoalsProgress(dateRange, { userType: "1" }, null);
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.data.items).toHaveLength(4);
            expect(result.data.items[0]?.key).toBe("salesTarget");
            expect(result.data.items[3]?.currentValue).toBe(25);
        }
    });
    it("normalizes date-only ranges to inclusive day boundaries", async () => {
        const getSnapshot = jest
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
        });
        const dashboardRepository = {
            getSnapshot,
        };
        const service = new dashboard_service_1.DashboardService(dashboardRepository);
        await service.getCards({
            endDate: "2026-05-01",
            startDate: "2026-05-01",
        }, { userType: "1" }, null);
        expect(getSnapshot).toHaveBeenNthCalledWith(1, expect.objectContaining({
            endDate: "2026-05-01T23:59:59.999Z",
            startDate: "2026-05-01T00:00:00.000Z",
        }));
        expect(getSnapshot).toHaveBeenNthCalledWith(2, expect.objectContaining({
            endDate: "2026-04-30T23:59:59.999Z",
            startDate: "2026-04-30T00:00:00.000Z",
        }));
    });
});
//# sourceMappingURL=dashboard.service.test.js.map