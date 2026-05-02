import express from "express";
import request from "supertest";
import path from "path";

import { loadModuleWithMocks } from "../test-utils/load-module-with-mocks";

const ROOT = process.cwd();
const USER_ROUTES_PATH = path.join(ROOT, "app/modules/user/user.routes.ts");

describe("user routes", () => {
  it("returns mocked admin users", async () => {
    const router = loadModuleWithMocks<express.Router>(USER_ROUTES_PATH, {
      "../../middlewares/isAdmin": (_req: express.Request, _res: express.Response, next: express.NextFunction) => next(),
      "../../middlewares/isNotVendor": (_req: express.Request, _res: express.Response, next: express.NextFunction) => next(),
      "../../middlewares/protectApi": (req: express.Request, _res: express.Response, next: express.NextFunction) => {
        req.user = { id: 1 };
        next();
      },
      "./AuthController": {
        addUser: jest.fn(),
        login: jest.fn(),
      },
      "./user.controller": {
        deleteUser: jest.fn(),
        editUser: jest.fn(),
        getAllUsers: (_req: express.Request, res: express.Response) => res.json({ status: true, users: [] }),
        getUser: jest.fn(),
      },
    });

    const app = express();
    app.use("/users", router);

    const response = await request(app).get("/users");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: true, users: [] });
  });
});
