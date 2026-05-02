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
}
exports.DashboardController = DashboardController;
//# sourceMappingURL=dashboard.controller.js.map