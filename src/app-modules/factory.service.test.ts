import path from "path";

import { loadModuleWithMocks } from "../test-utils/load-module-with-mocks";

const ROOT = process.cwd();
const FACTORY_SERVICE_PATH = path.join(ROOT, "app/modules/factory/factory.service.ts");

describe("FactoryService", () => {
  it("returns 404 when deleteAttachment cannot find the factory", async () => {
    const service = loadModuleWithMocks<typeof import("../../app/modules/factory/factory.service")>(
      FACTORY_SERVICE_PATH,
      {
        "../../../config/constants": {
          FACTORY_DOCUMENT_STATUS: { OTHER: 5, PENDING_REVIEW: 2 },
          FACTORY_DOCUMENT_STATUS_ARABIC: { 2: "قيد المراجعة" },
          FACTORY_DOCUMENT_TYPE: { OTHER: 5 },
          FACTORY_DOCUMENT_TYPE_ARABIC: { 5: "أخرى" },
          FACTORY_STATUS: { OFFLINE: 2, ONLINE: 1 },
          FACTORY_STATUS_ARABIC: { 1: "أونلاين", 2: "أوفلاين" },
        },
        "../../../src/infrastructure/database": {
          sequelize: {
            col: jest.fn(),
            where: jest.fn(),
          },
        },
        "../attachments/attachment.model": { findOne: jest.fn() },
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
    const findAndCountAll = jest.fn().mockResolvedValue({ count: 0, rows: [] });
    const count = jest.fn().mockResolvedValue(0);
    const where = jest.fn().mockReturnValue({ clause: true });
    const service = loadModuleWithMocks<typeof import("../../app/modules/factory/factory.service")>(
      FACTORY_SERVICE_PATH,
      {
        "../../../config/constants": {
          FACTORY_DOCUMENT_STATUS: { OTHER: 5, PENDING_REVIEW: 2 },
          FACTORY_DOCUMENT_STATUS_ARABIC: { 2: "قيد المراجعة" },
          FACTORY_DOCUMENT_TYPE: { OTHER: 5 },
          FACTORY_DOCUMENT_TYPE_ARABIC: { 5: "أخرى" },
          FACTORY_STATUS: { OFFLINE: 2, ONLINE: 1 },
          FACTORY_STATUS_ARABIC: { 1: "أونلاين", 2: "أوفلاين" },
        },
        "../../../src/infrastructure/database": {
          sequelize: {
            col: jest.fn().mockReturnValue("status"),
            fn: jest.fn().mockReturnValue("fn"),
            where,
          },
        },
        "../attachments/attachment.model": {},
        "./factory.model": { count, findAndCountAll },
      },
    );

    await expect(service.getAll({ factoryCategory: "wood", status: "online" })).resolves.toEqual({
      items: [],
      pagination: { page: 1, size: 20, totalItems: 0, totalPages: 1 },
      summary: { offlineFactories: 0, onlineFactories: 0, specialtiesCount: 0, totalFactories: 0 },
    });
    expect(findAndCountAll).toHaveBeenCalled();
    expect(count).toHaveBeenCalledTimes(2);
    expect(where).toHaveBeenCalled();
  });
});
