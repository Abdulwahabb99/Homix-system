import { NotFoundError, UnauthorizedError } from "../../shared/errors";
import { OrderService } from "./order.service";

jest.mock("../dashboard/dashboard-aggregate.service", () => ({
  DashboardAggregateService: jest.fn().mockImplementation(() => ({
    refreshRange: jest.fn(),
  })),
}));

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

  it("creates an order note through the repository and sends a notification through the gateway", async () => {
    const repository = {
      createOrderNote: jest.fn().mockResolvedValue({ id: 9, text: "hello" }),
      findOrderEntity: jest.fn().mockResolvedValue({ orderNumber: "31668" }),
    } as never;
    const legacyGateway = {
      sendNotification: jest.fn().mockResolvedValue(undefined),
    } as never;
    const service = new OrderService(repository, legacyGateway);

    await expect(
      service.addNote(7, "hello", { firstName: "Ahmed", id: 1, lastName: "Hesham" } as never),
    ).resolves.toEqual({
      data: { id: 9, text: "hello" },
      ok: true,
    });
  });

  it("delegates financial report reads to the typed repository", async () => {
    const getFinancialReport = jest.fn().mockResolvedValue({ summary: { totalSales: 3 } });
    const repository = {
      getFinancialReport,
    };
    const service = new OrderService(repository as never, {} as never);

    await expect(service.financialReport({ billingDay: 13, vendorId: 3 }, 7)).resolves.toEqual({
      data: { summary: { totalSales: 3 } },
      ok: true,
    });
    expect(getFinancialReport).toHaveBeenCalledWith({ billingDay: 13, vendorId: 3 }, 7);
  });

  it("defaults deliveryBy to vendor and recalculates amount to collect on create", async () => {
    const legacyGateway = {
      saveImportedOrders: jest.fn().mockResolvedValue(undefined),
    };
    const service = new OrderService({} as never, legacyGateway as never);

    await service.createOrder({
      downPayment: 200,
      line_items: [{ price: 1000, quantity: 2 }],
      shippingFees: 50,
    });

    expect(legacyGateway.saveImportedOrders).toHaveBeenCalledWith([
      expect.objectContaining({
        deliveryBy: 2,
        priority: 1,
        toBeCollected: 1850,
      }),
    ], false, undefined);
  });

  it("switches deliveryBy to homix and recalculates amount to collect on update when warehouse shipping is selected", async () => {
    const repository = {
      findOrderEntity: jest.fn().mockResolvedValue({
        deliveryBy: 2,
        downPayment: 100,
        shipmentType: "separate",
        shippedFromInventory: false,
        shippingFees: 60,
        subTotalPrice: 2000,
        totalDiscounts: 150,
      }),
    } as never;
    const legacyGateway = {
      updateOrder: jest.fn().mockResolvedValue({ data: { id: 7 }, status: true }),
    };
    const service = new OrderService(repository, legacyGateway as never);

    await service.updateOrder(7, { shipmentType: "warehouse" }, { id: 1 } as never);

    expect(legacyGateway.updateOrder).toHaveBeenCalledWith(
      7,
      expect.objectContaining({
        deliveryBy: 1,
        shipmentType: "warehouse",
        toBeCollected: 1810,
      }),
      { id: 1 },
    );
  });
});
