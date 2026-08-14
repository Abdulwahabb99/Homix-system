import path from "path";

const CURRENT_ROOT = "/home/garment/homix";
const DEVELOP_ROOT = "/home/garment/homix-develop";

type MockMap = Record<string, unknown>;

const createAbsolutePath = (modulePath: string, relativePath: string): string => {
  return path.resolve(path.dirname(modulePath), relativePath);
};

const loadModuleWithMocks = <TModule>(modulePath: string, mocks: MockMap = {}): TModule => {
  jest.resetModules();

  let loadedModule: unknown;
  jest.isolateModules(() => {
    Object.entries(mocks).forEach(([relativePath, mockValue]) => {
      jest.doMock(createAbsolutePath(modulePath, relativePath), () => mockValue);
    });

    loadedModule = require(modulePath);
  });

  if (
    loadedModule &&
    typeof loadedModule === "object" &&
    "default" in (loadedModule as Record<string, unknown>)
  ) {
    return (loadedModule as { default: TModule }).default;
  }

  return loadedModule as TModule;
};

describe("develop baseline characterization", () => {
  it("matches user.getUser not-found behavior", async () => {
    const currentModulePath = path.join(CURRENT_ROOT, "app/modules/user/user.service.ts");
    const developModulePath = path.join(DEVELOP_ROOT, "app/modules/user/user.service.js");
    const userModelMock = {
      findByPk: jest.fn().mockResolvedValue(null),
    };
    const vendorModelMock = {
      sequelize: { transaction: jest.fn() },
    };

    const currentService = loadModuleWithMocks<typeof import("../../app/modules/user/user.service")>(
      currentModulePath,
      {
        "../vendor/vendor.model": vendorModelMock,
        "./user.model": userModelMock,
      },
    );
    const developService = loadModuleWithMocks<{
      getUser: (id: string) => Promise<unknown>;
    }>(
      developModulePath,
      {
        "../vendor/vendor.model": vendorModelMock,
        "./user.model": userModelMock,
      },
    );

    await expect(currentService.getUser("7")).resolves.toEqual(
      await developService.getUser("7"),
    );
  });

  it("matches vendor.getOne not-found behavior", async () => {
    const currentModulePath = path.join(CURRENT_ROOT, "app/modules/vendor/vendor.service.ts");
    const developModulePath = path.join(DEVELOP_ROOT, "app/modules/vendor/vendor.service.js");
    const vendorModelMock = {
      findByPk: jest.fn().mockResolvedValue(null),
    };
    const userServiceMock = {
      getUserByVendorId: jest.fn(),
    };

    const currentService = loadModuleWithMocks<typeof import("../../app/modules/vendor/vendor.service")>(
      currentModulePath,
      {
        "../user/user.model": {},
        "../user/user.service": userServiceMock,
        "./vendor.model": vendorModelMock,
      },
    );
    const developService = loadModuleWithMocks<{
      getOne: (id: string) => Promise<unknown>;
    }>(
      developModulePath,
      {
        "../user/user.model": {},
        "../user/user.service": userServiceMock,
        "./vendor.model": vendorModelMock,
      },
    );

    await expect(currentService.getOne("11")).resolves.toEqual(
      await developService.getOne("11"),
    );
  });

  it("matches factory.deleteAttachment missing-factory behavior", async () => {
    const currentModulePath = path.join(CURRENT_ROOT, "app/modules/factory/factory.service.ts");
    const developModulePath = path.join(DEVELOP_ROOT, "app/modules/factory/factory.service.js");
    const factoryModelMock = {
      findByPk: jest.fn().mockResolvedValue(null),
    };

    const currentService = loadModuleWithMocks<typeof import("../../app/modules/factory/factory.service")>(
      currentModulePath,
      {
        "../attachments/attachment.model": {},
        "../customer/customer.model": {},
        "../order/order.model": {},
        "../orderLines/orderline.model": {},
        "../product/product.model": {},
        "../vendor/vendor.model": {},
        "./factory.model": factoryModelMock,
      },
    );
    const developService = loadModuleWithMocks<{
      deleteAttachment: (factoryId: string, attachmentId: string) => Promise<unknown>;
    }>(
      developModulePath,
      {
        "../attachments/attachment.model": {},
        "./factory.model": factoryModelMock,
      },
    );

    await expect(currentService.deleteAttachment("1", "9")).resolves.toEqual(
      await developService.deleteAttachment("1", "9"),
    );
  });

  it("matches orderLine.updateOrderLine empty-payload behavior", async () => {
    const currentModulePath = path.join(CURRENT_ROOT, "app/modules/orderLines/orderLine.service.ts");
    const developModulePath = path.join(DEVELOP_ROOT, "app/modules/orderLines/orderLine.service.js");

    const currentService = loadModuleWithMocks<typeof import("../../app/modules/orderLines/orderLine.service")>(
      currentModulePath,
      {
        "../notes/notes.model": {},
        "../order/order.model": {},
        "./orderline.model": {},
      },
    );
    const developService = loadModuleWithMocks<{
      updateOrderLine: (orderLineId: string, payload: Record<string, unknown>) => Promise<unknown>;
    }>(
      developModulePath,
      {
        "../notes/notes.model": {},
        "../order/order.model": {},
        "./orderline.model": {},
      },
    );

    await expect(currentService.updateOrderLine("4", {})).resolves.toEqual(
      await developService.updateOrderLine("4", {}),
    );
  });

  it("matches product.getProductsTypes behavior", async () => {
    const currentModulePath = path.join(CURRENT_ROOT, "app/modules/product/product.service.ts");
    const developModulePath = path.join(DEVELOP_ROOT, "app/modules/product/product.service.js");
    const productTypeModelMock = {
      findAll: jest.fn().mockResolvedValue([{ id: 1, name: "Chair" }]),
    };
    const commonMocks = {
      "../../../src/infrastructure/database": {
        sequelize: {
          col: jest.fn(),
          fn: jest.fn(),
          where: jest.fn(),
        },
      },
      "../category/categoty.service": { saveProductsCategories: jest.fn() },
      "../category/category.model": {},
      "../category/productCategory.model": {},
      "../helpers/shopifyHelper": {},
      "../vendor/vendor.model": {},
      "../vendor/vendor.service": {},
      "../../../config/shopify": {},
      "./product.model": {},
      "./productType.model": productTypeModelMock,
    };
    const developMocks = {
      "../../../config/db.config": {
        sequelize: {
          col: jest.fn(),
          fn: jest.fn(),
          where: jest.fn(),
        },
      },
      "../category/categoty.service": { saveProductsCategories: jest.fn() },
      "../category/category.model": {},
      "../category/productCategory.model": {},
      "../helpers/shopifyHelper": {},
      "../vendor/vendor.model": {},
      "../vendor/vendor.service": {},
      "../../../config/shopify": {},
      "./product.model": {},
      "./productType.model": productTypeModelMock,
    };

    const currentService = loadModuleWithMocks<typeof import("../../app/modules/product/product.service")>(
      currentModulePath,
      commonMocks,
    );
    const developService = loadModuleWithMocks<{
      getProductsTypes: () => Promise<unknown>;
    }>(
      developModulePath,
      developMocks,
    );

    await expect(currentService.getProductsTypes()).resolves.toEqual(
      await developService.getProductsTypes(),
    );
  });

  it("matches product.getAllCategories behavior", async () => {
    const currentModulePath = path.join(CURRENT_ROOT, "app/modules/product/product.service.ts");
    const developModulePath = path.join(DEVELOP_ROOT, "app/modules/product/product.service.js");
    const categoryModelMock = {
      findAll: jest.fn().mockResolvedValue([{ id: 1, title: "Living Room" }]),
    };
    const commonMocks = {
      "../../../src/infrastructure/database": {
        sequelize: {
          col: jest.fn(),
          fn: jest.fn(),
          where: jest.fn(),
        },
      },
      "../category/categoty.service": { saveProductsCategories: jest.fn() },
      "../category/category.model": categoryModelMock,
      "../category/productCategory.model": {},
      "../helpers/shopifyHelper": {},
      "../vendor/vendor.model": {},
      "../vendor/vendor.service": {},
      "../../../config/shopify": {},
      "./product.model": {},
      "./productType.model": {},
    };
    const developMocks = {
      "../../../config/db.config": {
        sequelize: {
          col: jest.fn(),
          fn: jest.fn(),
          where: jest.fn(),
        },
      },
      "../category/categoty.service": { saveProductsCategories: jest.fn() },
      "../category/category.model": categoryModelMock,
      "../category/productCategory.model": {},
      "../helpers/shopifyHelper": {},
      "../vendor/vendor.model": {},
      "../vendor/vendor.service": {},
      "../../../config/shopify": {},
      "./product.model": {},
      "./productType.model": {},
    };

    const currentService = loadModuleWithMocks<typeof import("../../app/modules/product/product.service")>(
      currentModulePath,
      commonMocks,
    );
    const developService = loadModuleWithMocks<{
      getAllCategories: () => Promise<unknown>;
    }>(
      developModulePath,
      developMocks,
    );

    await expect(currentService.getAllCategories()).resolves.toEqual(
      await developService.getAllCategories(),
    );
  });

  it("highlights legacy bug: develop factory.getAll throws when filters are used", async () => {
    const currentModulePath = path.join(CURRENT_ROOT, "app/modules/factory/factory.service.ts");
    const developModulePath = path.join(DEVELOP_ROOT, "app/modules/factory/factory.service.js");
    const attachmentModelMock = {};
    const factoryModelMock = {
      count: jest.fn().mockResolvedValue(0),
      findAll: jest.fn().mockResolvedValue([]),
      findAndCountAll: jest.fn().mockResolvedValue({ count: 0, rows: [] }),
    };
    const databaseMock = {
      sequelize: {
        col: jest.fn().mockReturnValue("status"),
        where: jest.fn().mockReturnValue({}),
      },
    };

    const currentService = loadModuleWithMocks<typeof import("../../app/modules/factory/factory.service")>(
      currentModulePath,
      {
        "../../../src/infrastructure/database": databaseMock,
        "../attachments/attachment.model": attachmentModelMock,
        "../customer/customer.model": {},
        "../order/order.model": {},
        "../orderLines/orderline.model": {},
        "../product/product.model": {},
        "../vendor/vendor.model": {},
        "./factory.model": factoryModelMock,
      },
    );
    const developService = loadModuleWithMocks<{
      getAll: (filters: { factoryCategory: undefined; status: string }) => Promise<unknown>;
    }>(
      developModulePath,
      {
        "../attachments/attachment.model": attachmentModelMock,
        "./factory.model": factoryModelMock,
      },
    );

    const filterPayload = { factoryCategory: undefined, status: "online" };

    // The point of this characterization: develop blows up on filters, the
    // refactored service does not. It now answers with a paginated envelope
    // rather than the bare array the old implementation returned.
    await expect(developService.getAll(filterPayload)).rejects.toBeInstanceOf(ReferenceError);
    await expect(currentService.getAll(filterPayload)).resolves.toEqual(
      expect.objectContaining({ items: [] }),
    );
  });
});
