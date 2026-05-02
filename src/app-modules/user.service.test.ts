import path from "path";

import { loadModuleWithMocks } from "../test-utils/load-module-with-mocks";

const ROOT = process.cwd();
const USER_SERVICE_PATH = path.join(ROOT, "app/modules/user/user.service.ts");

describe("UserService", () => {
  it("returns 400 when login credentials are missing", async () => {
    const service = loadModuleWithMocks<typeof import("../../app/modules/user/user.service")>(
      USER_SERVICE_PATH,
      {
        "../vendor/vendor.model": { sequelize: { transaction: jest.fn() } },
        "./user.model": {},
      },
    );

    await expect(service.login(undefined, undefined)).resolves.toEqual({
      message: "Email and password are required",
      status: false,
      statusCode: 400,
    });
  });

  it("returns 401 when login user does not exist", async () => {
    const userModelMock = {
      scope: jest.fn().mockReturnValue({
        findOne: jest.fn().mockResolvedValue(null),
      }),
    };
    const service = loadModuleWithMocks<typeof import("../../app/modules/user/user.service")>(
      USER_SERVICE_PATH,
      {
        "../vendor/vendor.model": { sequelize: { transaction: jest.fn() } },
        "./user.model": userModelMock,
      },
    );

    await expect(service.login("missing@example.com", "pw")).resolves.toEqual({
      message: "Invalid email or password",
      status: false,
      statusCode: 401,
    });
  });

  it("returns 400 when addUser gets an invalid user type", async () => {
    const userModelMock = {
      findOne: jest.fn().mockResolvedValue(null),
    };
    const service = loadModuleWithMocks<typeof import("../../app/modules/user/user.service")>(
      USER_SERVICE_PATH,
      {
        "../vendor/vendor.model": { sequelize: { transaction: jest.fn() } },
        "./user.model": userModelMock,
      },
    );

    await expect(
      service.addUser({
        email: "user@example.com",
        password: "secret",
        userType: "999",
      }),
    ).resolves.toEqual({
      message: "Invalid user type",
      status: false,
      statusCode: 400,
    });
  });
});
