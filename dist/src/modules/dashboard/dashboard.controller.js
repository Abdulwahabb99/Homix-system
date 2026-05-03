"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const result_1 = require("../../shared/result");
class DashboardController {
    dashboardService;
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    getCards = async (request, response) => {
        const result = await this.dashboardService.getCards(request.query, request.user ?? {}, request.vendorId);
        response.status(200).json({
            data: (0, result_1.unwrap)(result),
            status: true,
        });
    };
    getSingleCard = async (request, response) => {
        const result = await this.dashboardService.getSingleCard(request.params.cardKey, request.query, request.user ?? {}, request.vendorId);
        response.status(200).json({
            data: (0, result_1.unwrap)(result),
            status: true,
        });
    };
    getPerformance = async (request, response) => {
        const result = await this.dashboardService.getPerformance(request.query, request.user ?? {}, request.vendorId);
        response.status(200).json({ data: (0, result_1.unwrap)(result), status: true });
    };
    getActivities = async (request, response) => {
        const result = await this.dashboardService.getActivities(request.query, request.user ?? {}, request.vendorId);
        response.status(200).json({ data: (0, result_1.unwrap)(result), status: true });
    };
    getLatestOrders = async (request, response) => {
        const result = await this.dashboardService.getLatestOrders(request.query, request.user ?? {}, request.vendorId);
        response.status(200).json({ data: (0, result_1.unwrap)(result), status: true });
    };
    getLeaderboard = async (request, response) => {
        const result = await this.dashboardService.getLeaderboard(request.query, request.user ?? {}, request.vendorId);
        response.status(200).json({ data: (0, result_1.unwrap)(result), status: true });
    };
    getQuickActions = async (request, response) => {
        const result = await this.dashboardService.getQuickActions(request.user ?? {}, request.vendorId);
        response.status(200).json({ data: (0, result_1.unwrap)(result), status: true });
    };
    getSalesDistribution = async (request, response) => {
        const result = await this.dashboardService.getSalesDistribution(request.query, request.user ?? {}, request.vendorId);
        response.status(200).json({ data: (0, result_1.unwrap)(result), status: true });
    };
    getGoalsProgress = async (request, response) => {
        const result = await this.dashboardService.getGoalsProgress(request.query, request.user ?? {}, request.vendorId);
        response.status(200).json({ data: (0, result_1.unwrap)(result), status: true });
    };
}
exports.DashboardController = DashboardController;
//# sourceMappingURL=dashboard.controller.js.map