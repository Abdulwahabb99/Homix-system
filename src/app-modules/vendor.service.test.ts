import path from "path";

import { loadModuleWithMocks } from "../test-utils/load-module-with-mocks";

const ROOT = process.cwd();
const VENDOR_SERVICE_PATH = path.join(ROOT, "app/modules/vendor/vendor.service.ts");

describe("VendorsService", () => {
  it("saves accountManager when the payload uses accountManager alias", async () => {
    const create = jest.fn().mockResolvedValue({
      toJSON: () => ({ accountManagerUserId: 12, id: 5, name: "Vendor One" }),
    });
    const service = loadModuleWithMocks<typeof import("../../app/modules/vendor/vendor.service")>(
      VENDOR_SERVICE_PATH,
      {
        "../notification/notification.model": { bulkCreate: jest.fn() },
        "../user/user.model": {
          findAll: jest.fn().mockResolvedValue([]),
          findByPk: jest.fn().mockResolvedValue({ firstName: "Ahmed", id: 12, lastName: "Hesham" }),
        },
        "../user/user.service": {
          addUser: jest.fn().mockResolvedValue({ status: true }),
          capitalizeFirstLetter: (value: string) => value,
        },
        "./vendor.model": {
          create,
          sequelize: { transaction: jest.fn().mockResolvedValue({ commit: jest.fn(), rollback: jest.fn() }) },
        },
      },
    );

    const response = await service.create({ accountManager: 12, name: "Vendor One" });

    expect(create).toHaveBeenCalledWith(expect.objectContaining({ accountManagerUserId: 12 }));
    expect(response.data).toEqual(expect.objectContaining({
      accountManagerLabel: "Ahmed Hesham",
      accountManagerUserId: 12,
    }));
  });

  it("returns accountManagerLabel on vendor update", async () => {
    const service = loadModuleWithMocks<typeof import("../../app/modules/vendor/vendor.service")>(
      VENDOR_SERVICE_PATH,
      {
        "../user/user.model": {
          findByPk: jest.fn().mockResolvedValue({ firstName: "Ahmed", id: 12, lastName: "Hesham" }),
        },
        "../user/user.service": {
          updateVendorUser: jest.fn().mockResolvedValue({ id: 30 }),
        },
        "./vendor.model": {
          findByPk: jest.fn().mockResolvedValue({
            update: jest.fn().mockResolvedValue({
              toJSON: () => ({ accountManagerUserId: 12, id: 7, name: "Vendor Two" }),
            }),
          }),
        },
      },
    );

    const response = await service.update("7", { accountManager: 12, name: "Vendor Two" });

    expect(response.data).toEqual(expect.objectContaining({
      accountManagerLabel: "Ahmed Hesham",
      accountManagerUserId: 12,
    }));
  });

  it("returns 404 when vendor does not exist", async () => {
    const service = loadModuleWithMocks<typeof import("../../app/modules/vendor/vendor.service")>(
      VENDOR_SERVICE_PATH,
      {
        "../user/user.model": {},
        "../user/user.service": { getUserByVendorId: jest.fn() },
        "./vendor.model": { findByPk: jest.fn().mockResolvedValue(null) },
      },
    );

    await expect(service.getOne("3")).resolves.toEqual({
      message: "Vendor not found",
      status: false,
      statusCode: 404,
    });
  });

  it("returns 404 when deleting a missing vendor", async () => {
    const service = loadModuleWithMocks<typeof import("../../app/modules/vendor/vendor.service")>(
      VENDOR_SERVICE_PATH,
      {
        "../user/user.model": {},
        "../user/user.service": { getUserByVendorId: jest.fn() },
        "./vendor.model": { findByPk: jest.fn().mockResolvedValue(null) },
      },
    );

    await expect(service.delete("8")).resolves.toEqual({
      message: "Vendor not found",
      status: false,
      statusCode: 404,
    });
  });
});
