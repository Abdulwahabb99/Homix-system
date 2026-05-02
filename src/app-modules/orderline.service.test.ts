import path from "path";

import { loadModuleWithMocks } from "../test-utils/load-module-with-mocks";

const ROOT = process.cwd();
const ORDERLINE_SERVICE_PATH = path.join(ROOT, "app/modules/orderLines/orderLine.service.ts");

describe("OrderLineService", () => {
  it("returns 400 when update payload is empty", async () => {
    const service = loadModuleWithMocks<typeof import("../../app/modules/orderLines/orderLine.service")>(
      ORDERLINE_SERVICE_PATH,
      {
        "../notes/notes.model": {},
        "../order/order.model": {},
        "./orderline.model": {},
      },
    );

    await expect(service.updateOrderLine("7", {})).resolves.toEqual({
      message: "Please provide the data to update",
      status: false,
      statusCode: 400,
    });
  });

  it("returns 403 when vendor deletes another user's note", async () => {
    const service = loadModuleWithMocks<typeof import("../../app/modules/orderLines/orderLine.service")>(
      ORDERLINE_SERVICE_PATH,
      {
        "../notes/notes.model": {
          findByPk: jest.fn().mockResolvedValue({ userId: 99 }),
        },
        "../order/order.model": {},
        "./orderline.model": {
          findByPk: jest.fn().mockResolvedValue({ id: 1 }),
        },
      },
    );

    await expect(
      service.deleteNote({ id: 7, userType: "2" }, "1", "2"),
    ).resolves.toEqual({
      message: "You are not authorized to update this note",
      status: false,
      statusCode: 403,
    });
  });
});
