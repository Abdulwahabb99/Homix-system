"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const result_1 = require("../../shared/result");
const constants_1 = require("../../config/constants");
const CARD_LABELS = {
    activeMakers: "صُنّاع نشطون",
    activeProducts: "منتجات نشطة",
    pendingOrders: "طلبات معلقة",
    totalOrders: "إجمالي الطلبات",
    totalSales: "إجمالي المبيعات (ج.م)",
};
const PREVIOUS_PERIOD_LABEL = "مقارنة بالفترة السابقة";
const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
const PERCENTAGE_PRECISION = 10;
const getRole = (user, vendorId) => {
    if (vendorId || user.userType === constants_1.USER_TYPES.VENDOR) {
        return "vendor";
    }
    return "admin";
};
const roundPercentage = (value) => {
    return Math.round(value * PERCENTAGE_PRECISION) / PERCENTAGE_PRECISION;
};
const getTrend = (currentValue, previousValue) => {
    if (currentValue > previousValue) {
        return "up";
    }
    if (currentValue < previousValue) {
        return "down";
    }
    return "flat";
};
const getChangePercentage = (currentValue, previousValue) => {
    if (previousValue === 0) {
        return currentValue === 0 ? 0 : 100;
    }
    return roundPercentage(((currentValue - previousValue) / previousValue) * 100);
};
const buildCard = (key, currentValue, previousValue) => ({
    changePercentage: getChangePercentage(currentValue, previousValue),
    comparisonLabel: PREVIOUS_PERIOD_LABEL,
    currentValue,
    key,
    label: CARD_LABELS[key],
    previousValue,
    trend: getTrend(currentValue, previousValue),
});
const getPreviousRange = ({ endDate, startDate }) => {
    const currentStartDate = new Date(startDate);
    const currentEndDate = new Date(endDate);
    const rangeDuration = currentEndDate.getTime() - currentStartDate.getTime();
    const previousEndDate = new Date(currentStartDate.getTime() - DAY_IN_MILLISECONDS);
    const previousStartDate = new Date(previousEndDate.getTime() - rangeDuration);
    return {
        endDate: previousEndDate.toISOString(),
        startDate: previousStartDate.toISOString(),
    };
};
class DashboardService {
    dashboardRepository;
    constructor(dashboardRepository) {
        this.dashboardRepository = dashboardRepository;
    }
    async getCards(range, user, vendorId) {
        const role = getRole(user, vendorId);
        const currentInput = this.buildMetricsInput(range, role, vendorId);
        const previousInput = this.buildMetricsInput(getPreviousRange(range), role, vendorId);
        const [currentSnapshot, previousSnapshot] = await Promise.all([
            this.dashboardRepository.getSnapshot(currentInput),
            this.dashboardRepository.getSnapshot(previousInput),
        ]);
        return (0, result_1.success)({
            cards: this.buildCardsForRole(role, currentSnapshot, previousSnapshot),
            endDate: range.endDate,
            role,
            startDate: range.startDate,
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
    buildCardsForRole(role, currentSnapshot, previousSnapshot) {
        const baseCards = [
            buildCard("totalSales", currentSnapshot.totalSales, previousSnapshot.totalSales),
            buildCard("totalOrders", currentSnapshot.totalOrders, previousSnapshot.totalOrders),
            buildCard("pendingOrders", currentSnapshot.pendingOrders, previousSnapshot.pendingOrders),
        ];
        if (role === "vendor") {
            return [
                ...baseCards,
                buildCard("activeProducts", currentSnapshot.activeProducts, previousSnapshot.activeProducts),
            ];
        }
        return [
            ...baseCards,
            buildCard("activeMakers", currentSnapshot.activeMakers, previousSnapshot.activeMakers),
        ];
    }
    buildMetricsInput(range, role, vendorId) {
        return {
            endDate: new Date(range.endDate).toISOString(),
            role,
            startDate: new Date(range.startDate).toISOString(),
            vendorId: vendorId ?? undefined,
        };
    }
}
exports.DashboardService = DashboardService;
//# sourceMappingURL=dashboard.service.js.map