import type { Request, Response } from "express";

import type { NavigationCountsService } from "./navigation.service";

export class NavigationCountsController {
  public constructor(private readonly service: NavigationCountsService) {}

  public getCounts = async (request: Request, response: Response): Promise<void> => {
    response.status(200).json({
      data: await this.service.getCounts(request.vendorId),
      status: true,
    });
  };
}
