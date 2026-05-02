import express from "express";
import request from "supertest";
import path from "path";

import { loadModuleWithMocks } from "../test-utils/load-module-with-mocks";

const ROOT = process.cwd();
const FACTORY_ROUTES_PATH = path.join(ROOT, "app/modules/factory/factory.routes.ts");

describe("factory routes", () => {
  it("returns factory list", async () => {
    const router = loadModuleWithMocks<express.Router>(FACTORY_ROUTES_PATH, {
      "../../../config/fileUploadMiddleware": () => (_req: express.Request, _res: express.Response, next: express.NextFunction) => next(),
      "./factory.controller": {
        create: jest.fn(),
        delete: jest.fn(),
        deleteAttachment: jest.fn(),
        getAll: (_req: express.Request, res: express.Response) => {
          res.json({ data: [], status: true, statusCode: 200 });
        },
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
  });
});
