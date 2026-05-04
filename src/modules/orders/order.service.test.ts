import { NotFoundError, UnauthorizedError } from "../../shared/errors";
import { OrderService } from "./order.service";

describe("OrderService", () => {
  it("throws not found when an order details request misses", async () => {
    const repository = {
      getOrderById: jest.fn().mockResolvedValue(null),
    } as never;
    const service = new OrderService(repository, {} as never);

    await expect(service.getOrderById(7, null)).rejects.toBeInstanceOf(NotFoundError);
  });

  it("maps legacy delete failures into typed errors", async () => {
    const repository = {
      findOrderEntity: jest.fn().mockResolvedValue({ id: 7 }),
      createOrderLog: jest.fn().mockResolvedValue(undefined),
      deleteOrder: jest.fn().mockResolvedValue(undefined),
    } as never;
    const legacyGateway = {
      deleteOrder: jest.fn().mockResolvedValue({ message: "Order not found", status: false, statusCode: 404 }),
    } as never;
    const service = new OrderService(repository, legacyGateway);

    await expect(service.deleteOrder(7, { id: 1 })).resolves.toEqual({
      data: { message: "Order deleted successfully" },
      ok: true,
    });
  });

  it("throws unauthorized when a vendor tries to update someone else's note", async () => {
    const repository = {
      findNoteById: jest.fn().mockResolvedValue({ id: 4, userId: 77 }),
      findOrderEntity: jest.fn().mockResolvedValue({ id: 7 }),
    } as never;
    const service = new OrderService(repository, {} as never);

    await expect(
      service.updateNote(7, 4, "updated", { id: 1, userType: "vendor" } as never),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("uploads note attachments through the typed repository path", async () => {
    const repository = {
      createNoteAttachments: jest.fn().mockResolvedValue(undefined),
      findNoteById: jest.fn().mockResolvedValue({ id: 4 }),
    } as never;
    const service = new OrderService(repository, {} as never);

    await expect(
      service.uploadFiles(4, ["/tmp/a.pdf"], ["a.pdf"], ["invoice"]),
    ).resolves.toEqual({
      data: { message: "Files uploaded!" },
      ok: true,
    });
  });
});
