import express from "express";
import request from "supertest";
import path from "path";

import { loadModuleWithMocks } from "../test-utils/load-module-with-mocks";

const ROOT = process.cwd();
const VENDOR_ROUTES_PATH = path.join(ROOT, "app/modules/vendor/vendor.routes.ts");

describe("vendor routes", () => {
  it("returns vendor list", async () => {
    const router = loadModuleWithMocks<express.Router>(VENDOR_ROUTES_PATH, {
      "../../middlewares/requirePermission": () => (_req: express.Request, _res: express.Response, next: express.NextFunction) => next(),
      "./vendor.controller": {
        changeActiveStatus: jest.fn(),
        createVendor: jest.fn(),
        deleteVendor: jest.fn(),
        getOneVendor: jest.fn(),
        getVendors: (_req: express.Request, res: express.Response) => {
          res.json({ data: [], status: true, statusCode: 200 });
        },
        updateVendor: jest.fn(),
      },
    });

    const app = express();
    app.use("/vendors", router);

    const response = await request(app).get("/vendors");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe(true);
  });
});
