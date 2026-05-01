import type { Request, Response } from "express";

import { unwrap } from "../../shared/result";
import type { DashboardService } from "./dashboard.service";

export class DashboardController {
  public constructor(private readonly dashboardService: DashboardService) {}

  public getCards = async (request: Request, response: Response): Promise<void> => {
    const result = await this.dashboardService.getCards(
      request.query as { endDate: string; startDate: string },
      request.user ?? {},
      request.vendorId,
    );

    response.status(200).json({
      data: unwrap(result),
      status: true,
    });
  };

  public getSingleCard = async (request: Request, response: Response): Promise<void> => {
    const result = await this.dashboardService.getSingleCard(
      request.params.cardKey as
        | "activeMakers"
        | "activeProducts"
        | "pendingOrders"
        | "totalOrders"
        | "totalSales",
      request.query as { endDate: string; startDate: string },
      request.user ?? {},
      request.vendorId,
    );

    response.status(200).json({
      data: unwrap(result),
      status: true,
    });
  };
}
