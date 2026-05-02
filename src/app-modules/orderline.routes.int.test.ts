import express from "express";
import request from "supertest";
import path from "path";

import { loadModuleWithMocks } from "../test-utils/load-module-with-mocks";

const ROOT = process.cwd();
const ORDERLINE_ROUTES_PATH = path.join(ROOT, "app/modules/orderLines/orderLine.routes.ts");

describe("orderLine routes", () => {
  it("handles update order line", async () => {
    const router = loadModuleWithMocks<express.Router>(ORDERLINE_ROUTES_PATH, {
      "../../middlewares/isAdmin": (_req: express.Request, _res: express.Response, next: express.NextFunction) => next(),
      "../../middlewares/isNotLogistic": (_req: express.Request, _res: express.Response, next: express.NextFunction) => next(),
      "../../middlewares/protectApi": (req: express.Request, _res: express.Response, next: express.NextFunction) => {
        req.user = { id: 1 };
        next();
      },
      "./orderLine.controller": {
        addNote: jest.fn(),
        deleteNote: jest.fn(),
        updateNote: jest.fn(),
        updateOrderLine: (_req: express.Request, res: express.Response) => {
          res.json({ status: true, statusCode: 200 });
        },
      },
    });

    const app = express();
    app.use(express.json());
    app.use("/orderLines", router);

    const response = await request(app).put("/orderLines/1").send({});

    expect(response.status).toBe(200);
    expect(response.body.status).toBe(true);
  });
});
