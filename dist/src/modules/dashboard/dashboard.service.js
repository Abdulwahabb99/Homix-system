"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const result_1 = require("../../shared/result");
const dashboard_constants_1 = require("./dashboard.constants");
const dashboard_helpers_1 = require("./dashboard.helpers");
class DashboardService {
    dashboardRepository;
    constructor(dashboardRepository) {
        this.dashboardRepository = dashboardRepository;
    }
    async getCards(range, user, vendorId) {
        const role = (0, dashboard_helpers_1.getRole)(user, vendorId);
        const normalizedRange = (0, dashboard_helpers_1.normalizeDateRange)(range);
        const currentInput = this.buildMetricsInput(normalizedRange, role, vendorId);
        const previousInput = this.buildMetricsInput((0, dashboard_helpers_1.getPreviousRange)(normalizedRange), role, vendorId);
        const [currentSnapshot, previousSnapshot] = await Promise.all([
            this.dashboardRepository.getSnapshot(currentInput),
            this.dashboardRepository.getSnapshot(previousInput),
        ]);
        return (0, result_1.success)({
            cards: this.buildCardsForRole(role, currentSnapshot, previousSnapshot),
            endDate: normalizedRange.endDate,
            role,
            startDate: normalizedRange.startDate,
        });
    }
    async getSingleCard(key, range, user, vendorId) {
        const cardsResult = await this.getCards(range, user, vendorId);
        if (!cardsResult.ok) {
            return cardsResult;
        }
        const card = cardsResult.data.cards.find((item) => item.key === key);
        return (0, result_1.success)(card);
    }
    async getPerformance(range, user, vendorId) {
        const role = (0, dashboard_helpers_1.getRole)(user, vendorId);
        const normalizedRange = (0, dashboard_helpers_1.normalizeDateRange)(range);
        const currentInput = this.buildMetricsInput(normalizedRange, role, vendorId);
        const [summaryResult, series] = await Promise.all([
            this.getSingleCard("totalSales", normalizedRange, user, vendorId),
            this.dashboardRepository.getPerformanceSeries(currentInput),
        ]);
        if (!summaryResult.ok) {
            return summaryResult;
        }
        return (0, result_1.success)({
            endDate: normalizedRange.endDate,
            role,
            series,
            startDate: normalizedRange.startDate,
            summary: summaryResult.data,
        });
    }
    async getActivities(range, user, vendorId) {
        const role = (0, dashboard_helpers_1.getRole)(user, vendorId);
        const normalizedRange = (0, dashboard_helpers_1.normalizeDateRange)(range);
        const items = await this.dashboardRepository.getActivities(this.buildMetricsInput(normalizedRange, role, vendorId), user.id ?? 0);
        return (0, result_1.success)({ items, role });
    }
    async getLatestOrders(range, user, vendorId) {
        const role = (0, dashboard_helpers_1.getRole)(user, vendorId);
        const normalizedRange = (0, dashboard_helpers_1.normalizeDateRange)(range);
        const items = await this.dashboardRepository.getLatestOrders(this.buildMetricsInput(normalizedRange, role, vendorId));
        return (0, result_1.success)({ items, role });
    }
    async getLeaderboard(range, user, vendorId) {
        const role = (0, dashboard_helpers_1.getRole)(user, vendorId);
        const normalizedRange = (0, dashboard_helpers_1.normalizeDateRange)(range);
        const items = await this.dashboardRepository.getLeaderboard(this.buildMetricsInput(normalizedRange, role, vendorId));
        return (0, result_1.success)({ items, role });
    }
    async getQuickActions(user, vendorId) {
        const role = (0, dashboard_helpers_1.getRole)(user, vendorId);
        return (0, result_1.success)({ items: dashboard_constants_1.QUICK_ACTIONS[role], role });
    }
    async getSalesDistribution(range, user, vendorId) {
        const role = (0, dashboard_helpers_1.getRole)(user, vendorId);
        const normalizedRange = (0, dashboard_helpers_1.normalizeDateRange)(range);
        const items = await this.dashboardRepository.getSalesDistribution(this.buildMetricsInput(normalizedRange, role, vendorId));
        return (0, result_1.success)({
            items: (0, dashboard_helpers_1.collapseDistribution)(items, dashboard_constants_1.OTHER_DISTRIBUTION_ITEM),
            role,
        });
    }
    async getGoalsProgress(range, user, vendorId) {
        const role = (0, dashboard_helpers_1.getRole)(user, vendorId);
        const metricsInput = this.buildMetricsInput((0, dashboard_helpers_1.normalizeDateRange)(range), role, vendorId);
        const [snapshot, deliveredOrders] = await Promise.all([
            this.dashboardRepository.getSnapshot(metricsInput),
            this.dashboardRepository.getDeliveredOrdersCount(metricsInput),
        ]);
        const values = role === "admin"
            ? [snapshot.totalSales, snapshot.totalOrders, snapshot.activeMakers, deliveredOrders]
            : [snapshot.totalSales, snapshot.totalOrders, snapshot.activeProducts, deliveredOrders];
        return (0, result_1.success)({
            items: dashboard_constants_1.GOAL_CONFIGS[role].map((goal, index) => (0, dashboard_helpers_1.mergeGoalConfig)(goal, values[index] ?? 0)),
            role,
        });
    }
    buildCardsForRole(role, currentSnapshot, previousSnapshot) {
        const baseCards = [
            (0, dashboard_helpers_1.buildCard)("totalSales", currentSnapshot.totalSales, previousSnapshot.totalSales),
            (0, dashboard_helpers_1.buildCard)("totalOrders", currentSnapshot.totalOrders, previousSnapshot.totalOrders),
            (0, dashboard_helpers_1.buildCard)("pendingOrders", currentSnapshot.pendingOrders, previousSnapshot.pendingOrders),
        ];
        if (role === "vendor") {
            return [
                ...baseCards,
                (0, dashboard_helpers_1.buildCard)("activeProducts", currentSnapshot.activeProducts, previousSnapshot.activeProducts),
            ];
        }
        return [
            ...baseCards,
            (0, dashboard_helpers_1.buildCard)("activeMakers", currentSnapshot.activeMakers, previousSnapshot.activeMakers),
        ];
    }
    buildMetricsInput(range, role, vendorId) {
        return {
            endDate: range.endDate,
            role,
            startDate: range.startDate,
            vendorId: vendorId ?? undefined,
        };
    }
}
exports.DashboardService = DashboardService;
//# sourceMappingURL=dashboard.service.js.map