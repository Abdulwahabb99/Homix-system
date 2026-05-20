import { NotFoundError, UnauthorizedError } from "../../shared/errors";
import { ShipmentService } from "./shipment.service";

describe("ShipmentService", () => {
  it("throws not found when shipment details request misses", async () => {
    const repository = {
      getShipmentById: jest.fn().mockResolvedValue(null),
    } as never;

    const service = new ShipmentService(repository);

    await expect(service.getShipmentById(9802, null)).rejects.toBeInstanceOf(NotFoundError);
  });

  it("updates a shipment through the typed repository path", async () => {
    const repository = {
      updateShipment: jest.fn().mockResolvedValue({ id: 9802, shipmentStatus: 3 }),
    } as never;

    const service = new ShipmentService(repository);

    await expect(service.updateShipment(9802, { shipmentStatus: 3 })).resolves.toEqual({
      data: { id: 9802, shipmentStatus: 3 },
      ok: true,
    });
  });

  it("creates a shipment note through the typed repository path", async () => {
    const repository = {
      createShipmentNote: jest.fn().mockResolvedValue({ id: 18, text: "note" }),
      findShipmentEntity: jest.fn().mockResolvedValue({ id: 9802 }),
    } as never;

    const service = new ShipmentService(repository);

    await expect(service.addNote(9802, "note", { id: 1 } as never)).resolves.toEqual({
      data: { id: 18, text: "note" },
      ok: true,
    });
  });

  it("throws unauthorized when another user updates a shipment note", async () => {
    const repository = {
      findNoteById: jest.fn().mockResolvedValue({
        entityId: 9802,
        entityType: "shipment",
        userId: 77,
      }),
      findShipmentEntity: jest.fn().mockResolvedValue({ id: 9802 }),
    } as never;

    const service = new ShipmentService(repository);

    await expect(
      service.updateNote(9802, 18, "updated", { id: 1, userType: "1" } as never),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("deletes shipments through the typed repository path", async () => {
    const repository = {
      deleteShipment: jest.fn().mockResolvedValue(true),
    } as never;

    const service = new ShipmentService(repository);

    await expect(service.deleteShipment(9802)).resolves.toEqual({
      data: { message: "Shipment deleted successfully" },
      ok: true,
    });
  });

  it("creates inventory items through the typed repository path", async () => {
    const repository = {
      createInventoryItem: jest.fn().mockResolvedValue({ id: 6, productCode: "NEW-1" }),
    } as never;

    const service = new ShipmentService(repository);

    await expect(
      service.createInventoryItem({
        costPrice: 2800,
        productId: 555,
        productCode: "NEW-1",
        quantity: 1,
      }),
    ).resolves.toEqual({
      data: { id: 6, productCode: "NEW-1" },
      ok: true,
    });
  });

  it("creates expenses through the typed repository path", async () => {
    const repository = {
      createExpenseAccount: jest.fn().mockResolvedValue({ amount: 150, id: 9 }),
    } as never;

    const service = new ShipmentService(repository);

    await expect(
      service.createExpenseAccount({ amount: 150, reason: "مواد تغليف", type: "packaging" }),
    ).resolves.toEqual({
      data: { amount: 150, id: 9 },
      ok: true,
    });
  });
});
