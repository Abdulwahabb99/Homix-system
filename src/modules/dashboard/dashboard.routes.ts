import express from "express";
import { z } from "zod";

import { asyncHandler, validateRequest } from "../../shared/http";
import { DashboardController } from "./dashboard.controller";
import { DashboardRepository } from "./dashboard.repo";
import { dashboardDateRangeSchema } from "./dashboard.schemas";
import { DashboardService } from "./dashboard.service";

const verifyToken = require("../../../app/middlewares/protectApi");

const dashboardRepository = new DashboardRepository();
const dashboardService = new DashboardService(dashboardRepository);
const dashboardController = new DashboardController(dashboardService);

const dashboardCardParamSchema = z.object({
  cardKey: z.enum([
    "activeMakers",
    "activeProducts",
    "pendingOrders",
    "totalOrders",
    "totalSales",
  ]),
});

export const dashboardRouter = express.Router();

/**
 * @swagger
 * /dashboard/cards:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Dashboard
 *     summary: Get dashboard cards for a date range
 *     description: Returns the dashboard summary cards for the selected period. Vendor users are automatically scoped to their own vendor data.
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardCardsEnvelope'
 *             examples:
 *               adminView:
 *                 summary: Admin dashboard cards
 *                 value:
 *                   status: true
 *                   data:
 *                     - key: totalSales
 *                       currentValue: 847320
 *                       previousValue: 754000
 *                       changePercentage: 12.4
 *                       trend: up
 *                     - key: totalOrders
 *                       currentValue: 720
 *                       previousValue: 665
 *                       changePercentage: 8.1
 *                       trend: up
 *       400:
 *         description: Invalid date range
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Missing or invalid bearer token
 */
dashboardRouter.get(
  "/cards",
  verifyToken,
  validateRequest({ query: dashboardDateRangeSchema }),
  asyncHandler(dashboardController.getCards),
);

/**
 * @swagger
 * /dashboard/cards/{cardKey}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Dashboard
 *     summary: Get a single dashboard card for a date range
 *     description: Returns a single dashboard KPI card for the selected period.
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardCardEnvelope'
 *             examples:
 *               totalSales:
 *                 value:
 *                   status: true
 *                   data:
 *                     key: totalSales
 *                     currentValue: 847320
 *                     previousValue: 754000
 *                     changePercentage: 12.4
 *                     trend: up
 *       400:
 *         description: Invalid date range or unsupported card key
 *       401:
 *         description: Missing or invalid bearer token
 */
dashboardRouter.get(
  "/cards/:cardKey",
  verifyToken,
  validateRequest({
    params: dashboardCardParamSchema,
    query: dashboardDateRangeSchema,
  }),
  asyncHandler(dashboardController.getSingleCard),
);

dashboardRouter.get(
  "/performance",
  verifyToken,
  validateRequest({ query: dashboardDateRangeSchema }),
  asyncHandler(dashboardController.getPerformance),
);

dashboardRouter.get(
  "/activities",
  verifyToken,
  validateRequest({ query: dashboardDateRangeSchema }),
  asyncHandler(dashboardController.getActivities),
);

dashboardRouter.get(
  "/latest-orders",
  verifyToken,
  validateRequest({ query: dashboardDateRangeSchema }),
  asyncHandler(dashboardController.getLatestOrders),
);

dashboardRouter.get(
  "/leaderboard",
  verifyToken,
  validateRequest({ query: dashboardDateRangeSchema }),
  asyncHandler(dashboardController.getLeaderboard),
);

dashboardRouter.get(
  "/quick-actions",
  verifyToken,
  validateRequest({ query: dashboardDateRangeSchema }),
  asyncHandler(dashboardController.getQuickActions),
);

dashboardRouter.get(
  "/sales-distribution",
  verifyToken,
  validateRequest({ query: dashboardDateRangeSchema }),
  asyncHandler(dashboardController.getSalesDistribution),
);

dashboardRouter.get(
  "/goals-progress",
  verifyToken,
  validateRequest({ query: dashboardDateRangeSchema }),
  asyncHandler(dashboardController.getGoalsProgress),
);
