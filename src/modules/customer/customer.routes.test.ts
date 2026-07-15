import express from "express";
import request from "supertest";

const customerModel = {
  findByPk: jest.fn(),
};

jest.mock("../../../app/modules/customer/customer.model", () => customerModel);
jest.mock("../../../app/middlewares/requirePermission", () => () => (_req: express.Request, _res: express.Response, next: express.NextFunction) => next());

import { errorMiddleware } from "../../shared/http";
import CustomerRouter = require("../../../app/modules/customer/customer.routes");

const app = express();
app.use(express.json());
app.use("/customers", CustomerRouter);
app.use(errorMiddleware);

describe("customerRouter", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    customerModel.findByPk.mockImplementation(async (customerId: number) => {
      if (customerId === 999) {
        return null;
      }

      const state = {
        address: "الهرم - الجيزة",
        address2: null,
        email: "old@example.com",
        firstName: "عبير",
        id: customerId,
        lastName: "قديم",
        phoneNumber: "01000000000",
        shopifyId: "445566",
        updatedAt: "2026-07-08T10:00:00.000Z",
      };

      return {
        toJSON: () => ({ ...state }),
        update: jest.fn(async (payload: Record<string, unknown>) => {
          Object.assign(state, payload, { updatedAt: "2026-07-08T12:00:00.000Z" });
        }),
      };
    });
  });

  it("updates customer details", async () => {
    const response = await request(app)
      .put("/customers/5")
      .send({
        address: "المعادي - القاهرة",
        firstName: "عبير",
        lastName: "ابوالمجيد",
        phoneNumber: "01155559646",
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe(true);
    expect(response.body.data).toEqual(expect.objectContaining({
      address: "المعادي - القاهرة",
      firstName: "عبير",
      id: 5,
      lastName: "ابوالمجيد",
      phoneNumber: "01155559646",
    }));
  });

  it("returns 404 when the customer does not exist", async () => {
    const response = await request(app)
      .put("/customers/999")
      .send({ firstName: "عبير" });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      code: "NOT_FOUND",
      message: "Customer not found",
      status: false,
    });
  });

  it("returns 400 when no editable fields are provided", async () => {
    const response = await request(app)
      .put("/customers/5")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      code: "VALIDATION_ERROR",
      message: "At least one customer field is required",
      status: false,
    });
  });
});
