"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRouter = void 0;
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const http_1 = require("../../shared/http");
const dashboard_controller_1 = require("./dashboard.controller");
const dashboard_repo_1 = require("./dashboard.repo");
const dashboard_schemas_1 = require("./dashboard.schemas");
const dashboard_service_1 = require("./dashboard.service");
const verifyToken = require("../../../app/middlewares/protectApi");
const dashboardRepository = new dashboard_repo_1.DashboardRepository();
const dashboardService = new dashboard_service_1.DashboardService(dashboardRepository);
const dashboardController = new dashboard_controller_1.DashboardController(dashboardService);
const dashboardCardParamSchema = zod_1.z.object({
    cardKey: zod_1.z.enum([
        "activeMakers",
        "activeProducts",
        "pendingOrders",
        "totalOrders",
        "totalSales",
    ]),
});
exports.dashboardRouter = express_1.default.Router();
/**
 * @swagger
 * /dashboard/cards:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Dashboard
 *     summary: Get dashboard cards for a date range
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Dashboard cards payload
 */
exports.dashboardRouter.get("/cards", verifyToken, (0, http_1.validateRequest)({ query: dashboard_schemas_1.dashboardDateRangeSchema }), (0, http_1.asyncHandler)(dashboardController.getCards));
/**
 * @swagger
 * /dashboard/cards/{cardKey}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Dashboard
 *     summary: Get a single dashboard card for a date range
 *     parameters:
 *       - in: path
 *         name: cardKey
 *         required: true
 *         schema:
 *           type: string
 *           enum: [activeMakers, activeProducts, pendingOrders, totalOrders, totalSales]
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Single dashboard card payload
 */
exports.dashboardRouter.get("/cards/:cardKey", verifyToken, (0, http_1.validateRequest)({
    params: dashboardCardParamSchema,
    query: dashboard_schemas_1.dashboardDateRangeSchema,
}), (0, http_1.asyncHandler)(dashboardController.getSingleCard));
//# sourceMappingURL=dashboard.routes.js.map