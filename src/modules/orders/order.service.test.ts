import { NotFoundError } from "../../shared/errors";
import { OrderService } from "./order.service";

jest.mock("../../../app/modules/order/order.service", () => ({
  BulkUpdate: jest.fn().mockResolvedValue({ message: "Orders updated successfully", status: true }),
  addNote: jest.fn(),
  bulkDelete: jest.fn(),
  deleteNote: jest.fn(),
  deleteOrder: jest.fn().mockResolvedValue({ message: "Order not found", status: false, statusCode: 404 }),
  exportOrders: jest.fn(),
  financialReport: jest.fn(),
  importOrders: jest.fn(),
  saveImportedOrders: jest.fn(),
  updateNote: jest.fn(),
  updateOrder: jest.fn(),
  uploadFiles: jest.fn(),
}));

describe("OrderService", () => {
  it("throws not found when an order details request misses", async () => {
    const repository = {
      getOrderById: jest.fn().mockResolvedValue(null),
    } as never;
    const service = new OrderService(repository);

    await expect(service.getOrderById(7, null)).rejects.toBeInstanceOf(NotFoundError);
  });

  it("maps legacy delete failures into typed errors", async () => {
    const repository = {} as never;
    const service = new OrderService(repository);

    await expect(service.deleteOrder(7, { id: 1 })).rejects.toBeInstanceOf(NotFoundError);
  });
});
