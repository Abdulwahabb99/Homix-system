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
dashboardRouter.get(
  "/cards/:cardKey",
  verifyToken,
  validateRequest({
    params: dashboardCardParamSchema,
    query: dashboardDateRangeSchema,
  }),
  asyncHandler(dashboardController.getSingleCard),
);
