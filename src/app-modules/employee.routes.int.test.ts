import express from "express";
import request from "supertest";
import path from "path";

import { loadModuleWithMocks } from "../test-utils/load-module-with-mocks";

const ROOT = process.cwd();
const EMPLOYEE_ROUTES_PATH = path.join(ROOT, "app/modules/employee/employee.routes.ts");

describe("employee routes", () => {
  it("returns employee list", async () => {
    const router = loadModuleWithMocks<express.Router>(EMPLOYEE_ROUTES_PATH, {
      "./employee.controller": {
        create: jest.fn(),
        delete: jest.fn(),
        getAll: (_req: express.Request, res: express.Response) => res.json([{ id: 1 }]),
        getOne: jest.fn(),
        update: jest.fn(),
      },
    });

    const app = express();
    app.use("/employees", router);

    const response = await request(app).get("/employees");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ id: 1 }]);
  });
});
