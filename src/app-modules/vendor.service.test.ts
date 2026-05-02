import path from "path";

import { loadModuleWithMocks } from "../test-utils/load-module-with-mocks";

const ROOT = process.cwd();
const VENDOR_SERVICE_PATH = path.join(ROOT, "app/modules/vendor/vendor.service.ts");

describe("VendorsService", () => {
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
