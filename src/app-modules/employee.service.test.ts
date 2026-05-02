import path from "path";

import { loadModuleWithMocks } from "../test-utils/load-module-with-mocks";

const ROOT = process.cwd();
const EMPLOYEE_SERVICE_PATH = path.join(ROOT, "app/modules/employee/employee.service.ts");

describe("EmployeeService", () => {
  it("returns null when updating a missing employee", async () => {
    const service = loadModuleWithMocks<typeof import("../../app/modules/employee/employee.service")>(
      EMPLOYEE_SERVICE_PATH,
      {
        "./employee.model": { findByPk: jest.fn().mockResolvedValue(null) },
      },
    );

    await expect(service.update("4", { firstName: "New" })).resolves.toBeNull();
  });

  it("maps findAll results to plain employees", async () => {
    const service = loadModuleWithMocks<typeof import("../../app/modules/employee/employee.service")>(
      EMPLOYEE_SERVICE_PATH,
      {
        "./employee.model": {
          findAll: jest.fn().mockResolvedValue([
            {
              toJSON: () => ({ id: 1, firstName: "A" }),
            },
          ]),
        },
      },
    );

    await expect(service.getAll()).resolves.toEqual([{ id: 1, firstName: "A" }]);
  });
});
