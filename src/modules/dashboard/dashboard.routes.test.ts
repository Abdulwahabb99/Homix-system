import express from "express";
import request from "supertest";

jest.mock("../../../app/middlewares/protectApi", () => {
  return (req: express.Request, _res: express.Response, next: express.NextFunction) => {
    req.user = { id: 1, userType: "1" };
    next();
  };
});

jest.mock("../../../app/modules/order/order.model", () => ({
  count: jest
    .fn()
    .mockResolvedValueOnce(12)
    .mockResolvedValueOnce(4)
    .mockResolvedValueOnce(10)
    .mockResolvedValueOnce(3),
  findOne: jest
    .fn()
    .mockResolvedValueOnce({ totalSales: "1200" })
    .mockResolvedValueOnce({ totalSales: "1000" }),
}));

jest.mock("../../../app/modules/orderLines/orderline.model", () => ({
  count: jest.fn(),
  findOne: jest.fn(),
}));

jest.mock("../../../app/modules/product/product.model", () => ({}));

jest.mock("../../../app/modules/user/user.model", () => ({
  count: jest.fn().mockResolvedValueOnce(2).mockResolvedValueOnce(1),
}));

import { errorMiddleware } from "../../shared/http";
import { dashboardRouter } from "./dashboard.routes";

describe("dashboardRouter", () => {
  const app = express();
  app.use("/dashboard", dashboardRouter);
  app.use(errorMiddleware);

  it("returns dashboard cards", async () => {
    const response = await request(app).get("/dashboard/cards").query({
      endDate: "2026-05-02",
      startDate: "2026-05-01",
    });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe(true);
    expect(response.body.data.cards).toHaveLength(4);
  });
});
