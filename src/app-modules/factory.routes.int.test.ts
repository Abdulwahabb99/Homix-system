import express from "express";
import request from "supertest";
import path from "path";

import { loadModuleWithMocks } from "../test-utils/load-module-with-mocks";

const ROOT = process.cwd();
const FACTORY_ROUTES_PATH = path.join(ROOT, "app/modules/factory/factory.routes.ts");

describe("factory routes", () => {
  it("returns factory list", async () => {
    const router = loadModuleWithMocks<express.Router>(FACTORY_ROUTES_PATH, {
      "../../../src/shared/http/validation": {
        validateRequest: () => (_req: express.Request, _res: express.Response, next: express.NextFunction) => next(),
      },
      "../../../config/fileUploadMiddleware": () => (_req: express.Request, _res: express.Response, next: express.NextFunction) => next(),
      "../../middlewares/requirePermission": () => (_req: express.Request, _res: express.Response, next: express.NextFunction) => next(),
      "./factory.controller": {
        create: jest.fn(),
        delete: jest.fn(),
        deleteAttachment: jest.fn(),
        getAll: (_req: express.Request, res: express.Response) => {
          res.json({
            data: {
              items: [],
              pagination: { page: 1, size: 20, totalItems: 0, totalPages: 1 },
              summary: { offlineFactories: 0, onlineFactories: 0, specialtiesCount: 0, totalFactories: 0 },
            },
            status: true,
            statusCode: 200,
          });
        },
        getMeta: jest.fn(),
        getOne: jest.fn(),
        update: jest.fn(),
        uploadFiles: jest.fn(),
      },
    });

    const app = express();
    app.use("/factories", router);

    const response = await request(app).get("/factories");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe(true);
    expect(response.body.data.items).toEqual([]);
  });
});
