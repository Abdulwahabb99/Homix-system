import path from "path";

import { loadModuleWithMocks } from "../test-utils/load-module-with-mocks";

const ROOT = process.cwd();
const FACTORY_SERVICE_PATH = path.join(ROOT, "app/modules/factory/factory.service.ts");

describe("FactoryService", () => {
  it("returns 404 when deleteAttachment cannot find the factory", async () => {
    const service = loadModuleWithMocks<typeof import("../../app/modules/factory/factory.service")>(
      FACTORY_SERVICE_PATH,
      {
        "../../../src/infrastructure/database": {
          sequelize: {
            col: jest.fn(),
            where: jest.fn(),
          },
        },
        "../attachments/attachment.model": {},
        "./factory.model": { findByPk: jest.fn().mockResolvedValue(null) },
      },
    );

    await expect(service.deleteAttachment("1", "2")).resolves.toEqual({
      message: "Factory not found",
      status: false,
      statusCode: 404,
    });
  });

  it("returns filtered results for getAll", async () => {
    const findAll = jest.fn().mockResolvedValue([]);
    const where = jest.fn().mockReturnValue({ clause: true });
    const service = loadModuleWithMocks<typeof import("../../app/modules/factory/factory.service")>(
      FACTORY_SERVICE_PATH,
      {
        "../../../src/infrastructure/database": {
          sequelize: {
            col: jest.fn().mockReturnValue("status"),
            where,
          },
        },
        "../attachments/attachment.model": {},
        "./factory.model": { findAll },
      },
    );

    await expect(service.getAll({ factoryCategory: "wood", status: "online" })).resolves.toEqual([]);
    expect(findAll).toHaveBeenCalled();
    expect(where).toHaveBeenCalled();
  });
});
