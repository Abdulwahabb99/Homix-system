import { NotFoundError, UnauthorizedError } from "../../shared/errors";
import type { Result } from "../../shared/result";
import { success } from "../../shared/result";
import type { Response } from "express";
import { shipmentLegacyGateway } from "./shipment.legacy-gateway";
import { ShipmentRepository } from "./shipment.repo";
import type {
  DeliveryAccountsListQuery,
  DeliveryAccountsListResponse,
  ExpenseMutationInput,
  ExpenseAccountsListQuery,
  ExpenseAccountsListResponse,
  InventoryMutationInput,
  InventoryListQuery,
  InventoryListResponse,
  PerformanceQuery,
  PerformanceResponse,
  ReturnListQuery,
  ReturnListResponse,
  ReturnMutationInput,
  ShipmentDetailsResponse,
  ShipmentListQuery,
  ShipmentListResponse,
  ShipmentMetaResponse,
  ShipmentSummaryResponse,
} from "./shipment.types";
import type { ShipmentMutationPayload, ShipmentRequestUser } from "./shipment.internal-types";
import { SHIPMENT_RETURN_TYPE } from "./shipment.constants";

export class ShipmentService {
  public constructor(private readonly shipmentRepository: ShipmentRepository) {}

  public async createShipment(payload: ShipmentMutationPayload): Promise<Result<{ message: string }>> {
    await shipmentLegacyGateway.createShipment(payload);
    return success({ message: "Shipment created successfully" });
  }

  public async getMeta(): Promise<Result<ShipmentMetaResponse>> {
    return success(await this.shipmentRepository.getMeta());
  }

  public async getSummary(filters: Omit<ShipmentListQuery, "page" | "size">, vendorId?: number | null): Promise<Result<ShipmentSummaryResponse>> {
    return success(await this.shipmentRepository.getSummary(filters, vendorId));
  }

  public async listShipments(filters: ShipmentListQuery, vendorId?: number | null): Promise<Result<ShipmentListResponse>> {
    return success(await this.shipmentRepository.listShipments(filters, vendorId));
  }

  public async getShipmentById(shipmentId: number, vendorId?: number | null): Promise<Result<ShipmentDetailsResponse>> {
    const shipment = await this.shipmentRepository.getShipmentById(shipmentId, vendorId);
    if (!shipment) {
      throw new NotFoundError("Shipment not found");
    }

    return success(shipment);
  }

  public async listVendorReturns(filters: ReturnListQuery, vendorId?: number | null): Promise<Result<ReturnListResponse>> {
    return success(await this.shipmentRepository.listVendorReturns(filters, vendorId));
  }

  public async listCustomerReturns(filters: ReturnListQuery, vendorId?: number | null): Promise<Result<ReturnListResponse>> {
    return success(await this.shipmentRepository.listCustomerReturns(filters, vendorId));
  }

  public async createVendorReturn(payload: ReturnMutationInput): Promise<Result<ReturnListResponse["items"][number]>> {
    return success(await this.shipmentRepository.createReturnRecord(SHIPMENT_RETURN_TYPE.TO_VENDOR, payload));
  }

  public async createCustomerReturn(payload: ReturnMutationInput): Promise<Result<ReturnListResponse["items"][number]>> {
    return success(await this.shipmentRepository.createReturnRecord(SHIPMENT_RETURN_TYPE.FROM_CUSTOMER, payload));
  }

  public async updateVendorReturn(returnId: number, payload: Partial<ReturnMutationInput>): Promise<Result<ReturnListResponse["items"][number]>> {
    const returnRecord = await this.shipmentRepository.updateReturnRecord(returnId, SHIPMENT_RETURN_TYPE.TO_VENDOR, payload);
    if (!returnRecord) {
      throw new NotFoundError("Return not found");
    }

    return success(returnRecord);
  }

  public async updateCustomerReturn(returnId: number, payload: Partial<ReturnMutationInput>): Promise<Result<ReturnListResponse["items"][number]>> {
    const returnRecord = await this.shipmentRepository.updateReturnRecord(returnId, SHIPMENT_RETURN_TYPE.FROM_CUSTOMER, payload);
    if (!returnRecord) {
      throw new NotFoundError("Return not found");
    }

    return success(returnRecord);
  }

  public async listInventory(filters: InventoryListQuery, vendorId?: number | null): Promise<Result<InventoryListResponse>> {
    return success(await this.shipmentRepository.listInventory(filters, vendorId));
  }

  public async createInventoryItem(payload: InventoryMutationInput): Promise<Result<InventoryListResponse["items"][number]>> {
    return success(await this.shipmentRepository.createInventoryItem(payload));
  }

  public async updateInventoryItem(
    inventoryItemId: number,
    payload: Partial<InventoryMutationInput>,
  ): Promise<Result<InventoryListResponse["items"][number]>> {
    const inventoryItem = await this.shipmentRepository.updateInventoryItem(inventoryItemId, payload);
    if (!inventoryItem) {
      throw new NotFoundError("Inventory item not found");
    }

    return success(inventoryItem);
  }

  public async deleteInventoryItem(inventoryItemId: number): Promise<Result<{ message: string }>> {
    const deleted = await this.shipmentRepository.deleteInventoryItem(inventoryItemId);
    if (!deleted) {
      throw new NotFoundError("Inventory item not found");
    }

    return success({ message: "Inventory item deleted successfully" });
  }

  public async listDeliveryAccounts(
    filters: DeliveryAccountsListQuery,
    vendorId?: number | null,
  ): Promise<Result<DeliveryAccountsListResponse>> {
    return success(await this.shipmentRepository.listDeliveryAccounts(filters, vendorId));
  }

  public async listExpenseAccounts(filters: ExpenseAccountsListQuery): Promise<Result<ExpenseAccountsListResponse>> {
    return success(await this.shipmentRepository.listExpenseAccounts(filters));
  }

  public async createExpenseAccount(payload: ExpenseMutationInput): Promise<Result<ExpenseAccountsListResponse["items"][number]>> {
    return success(await this.shipmentRepository.createExpenseAccount(payload));
  }

  public async updateExpenseAccount(
    expenseId: number,
    payload: Partial<ExpenseMutationInput>,
  ): Promise<Result<ExpenseAccountsListResponse["items"][number]>> {
    const expense = await this.shipmentRepository.updateExpenseAccount(expenseId, payload);
    if (!expense) {
      throw new NotFoundError("Expense not found");
    }

    return success(expense);
  }

  public async deleteExpenseAccount(expenseId: number): Promise<Result<{ message: string }>> {
    const deleted = await this.shipmentRepository.deleteExpenseAccount(expenseId);
    if (!deleted) {
      throw new NotFoundError("Expense not found");
    }

    return success({ message: "Expense deleted successfully" });
  }

  public async getPerformance(filters: PerformanceQuery, vendorId?: number | null): Promise<Result<PerformanceResponse>> {
    return success(await this.shipmentRepository.getPerformance(filters, vendorId));
  }

  public async exportShipments(response: Response, payload: Record<string, unknown>): Promise<void> {
    await shipmentLegacyGateway.exportShipments(response, payload);
  }

  public async updateShipment(shipmentId: number, payload: ShipmentMutationPayload): Promise<Result<unknown>> {
    const shipment = await this.shipmentRepository.updateShipment(shipmentId, payload);
    if (!shipment) {
      throw new NotFoundError("Shipment not found");
    }

    return success(shipment);
  }

  public async deleteShipment(shipmentId: number): Promise<Result<{ message: string }>> {
    const deleted = await this.shipmentRepository.deleteShipment(shipmentId);
    if (!deleted) {
      throw new NotFoundError("Shipment not found");
    }

    return success({ message: "Shipment deleted successfully" });
  }

  public async addNote(shipmentId: number, text: string, user: ShipmentRequestUser): Promise<Result<unknown>> {
    const shipment = await this.shipmentRepository.findShipmentEntity(shipmentId);
    if (!shipment) {
      throw new NotFoundError("Shipment not found");
    }

    return success(await this.shipmentRepository.createShipmentNote(shipmentId, text, user.id));
  }

  public async updateNote(shipmentId: number, noteId: number, text: string, user: ShipmentRequestUser): Promise<Result<unknown>> {
    const shipment = await this.shipmentRepository.findShipmentEntity(shipmentId);
    if (!shipment) {
      throw new NotFoundError("Shipment not found");
    }

    const note = await this.shipmentRepository.findNoteById(noteId);
    if (!note) {
      throw new NotFoundError("Note not found");
    }

    const plainNote = "toJSON" in (note as Record<string, unknown>) && typeof (note as { toJSON?: () => Record<string, unknown> }).toJSON === "function"
      ? (note as { toJSON: () => Record<string, unknown> }).toJSON()
      : (note as Record<string, unknown>);

    if (Number(plainNote.entityId ?? 0) !== shipmentId || plainNote.entityType !== "shipment") {
      throw new NotFoundError("Note not found");
    }

    if (
      user.userType === "2" ||
      Number(plainNote.userId ?? 0) !== user.id
    ) {
      throw new UnauthorizedError("You are not authorized to update this note");
    }

    const updatedNote = await this.shipmentRepository.updateShipmentNote(noteId, text);
    if (!updatedNote) {
      throw new NotFoundError("Note not found");
    }

    return success(updatedNote);
  }

  public async deleteNote(shipmentId: number, noteId: number, user: ShipmentRequestUser): Promise<Result<{ message: string }>> {
    const shipment = await this.shipmentRepository.findShipmentEntity(shipmentId);
    if (!shipment) {
      throw new NotFoundError("Shipment not found");
    }

    const note = await this.shipmentRepository.findNoteById(noteId);
    if (!note) {
      throw new NotFoundError("Note not found");
    }

    const plainNote = "toJSON" in (note as Record<string, unknown>) && typeof (note as { toJSON?: () => Record<string, unknown> }).toJSON === "function"
      ? (note as { toJSON: () => Record<string, unknown> }).toJSON()
      : (note as Record<string, unknown>);

    if (Number(plainNote.entityId ?? 0) !== shipmentId || plainNote.entityType !== "shipment") {
      throw new NotFoundError("Note not found");
    }

    if (
      user.userType === "2" ||
      Number(plainNote.userId ?? 0) !== user.id
    ) {
      throw new UnauthorizedError("You are not authorized to delete this note");
    }

    const deleted = await this.shipmentRepository.deleteShipmentNote(noteId);
    if (!deleted) {
      throw new NotFoundError("Note not found");
    }

    return success({ message: "Note deleted successfully" });
  }
}
