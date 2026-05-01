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

dashboardRouter.get(
  "/cards",
  verifyToken,
  validateRequest({ query: dashboardDateRangeSchema }),
  asyncHandler(dashboardController.getCards),
);

dashboardRouter.get(
  "/cards/:cardKey",
  verifyToken,
  validateRequest({
    params: dashboardCardParamSchema,
    query: dashboardDateRangeSchema,
  }),
  asyncHandler(dashboardController.getSingleCard),
);
