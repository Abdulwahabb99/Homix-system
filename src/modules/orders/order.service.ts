import { ConflictError, NotFoundError, UnauthorizedError } from "../../shared/errors";
import type { Result } from "../../shared/result";
import { success } from "../../shared/result";
import { USER_TYPES } from "../../../config/constants";
import { orderLegacyGateway, type LegacyOrderGateway } from "./order.legacy-gateway";
import { toText } from "./order.helpers";
import { OrderRepository } from "./order.repo";
import type { LegacyOrderResponse, OrderDetailsResponse, OrderFinancialReportResponse, OrderListQuery, OrderListResponse, OrderMetaResponse, OrderMutationPayload, OrderRequestUser, OrderSummaryResponse } from "./order.types";

const ensureLegacySuccess = <TData>(response: LegacyOrderResponse<TData>): LegacyOrderResponse<TData> => {
  if (response.status !== false) {
    return response;
  }

  const message = response.message ?? "Order operation failed";
  if (response.statusCode === 404) throw new NotFoundError(message);
  if (response.statusCode === 403) throw new UnauthorizedError(message);
  throw new ConflictError(message);
};

export class OrderService {
  public constructor(
    private readonly orderRepository: OrderRepository,
    private readonly legacyGateway: LegacyOrderGateway = orderLegacyGateway,
  ) {}

  public async listOrders(filters: OrderListQuery, vendorId?: number | null): Promise<Result<OrderListResponse>> {
    return success(await this.orderRepository.listOrders(filters, vendorId));
  }

  public async getSummary(filters: OrderListQuery, vendorId?: number | null): Promise<Result<OrderSummaryResponse>> {
    return success(await this.orderRepository.getSummary(filters, vendorId));
  }

  public async getMeta(): Promise<Result<OrderMetaResponse>> {
    return success(await this.orderRepository.getMeta());
  }

  public async getOrderById(orderId: number, vendorId?: number | null): Promise<Result<OrderDetailsResponse>> {
    const order = await this.orderRepository.getOrderById(orderId, vendorId);
    if (!order) throw new NotFoundError("Order not found");
    return success(order);
  }

  public async createOrder(payload: OrderMutationPayload, user?: OrderRequestUser): Promise<Result<{ message: string }>> {
    await this.legacyGateway.saveImportedOrders([payload], false, user);
    return success({ message: "Order created successfully" });
  }

  public async importOrders(): Promise<Result<{ message: string }>> {
    await this.legacyGateway.importOrders();
    return success({ message: "Orders imported successfully" });
  }

  public async financialReport(vendorId: string | number | undefined, startDate?: string, endDate?: string): Promise<Result<OrderFinancialReportResponse>> {
    return success(await this.orderRepository.getFinancialReport(vendorId, startDate, endDate));
  }

  public async updateOrder(orderId: number, payload: OrderMutationPayload, user: OrderRequestUser): Promise<Result<unknown>> {
    const response = ensureLegacySuccess(await this.legacyGateway.updateOrder(orderId, payload, user));
    return success(response.data ?? {});
  }

  public async bulkUpdate(
    payload: OrderMutationPayload,
    user: OrderRequestUser,
  ): Promise<Result<{ message: string }>> {
    const response = ensureLegacySuccess(await this.legacyGateway.bulkUpdate(payload, user));
    return success({ message: response.message ?? "Orders updated successfully" });
  }

  public async deleteOrder(orderId: number, user: OrderRequestUser): Promise<Result<{ message: string }>> {
    const order = await this.orderRepository.findOrderEntity(orderId);
    if (!order) throw new NotFoundError("Order not found");
    await this.orderRepository.createOrderLog({
      action: "delete",
      entityId: orderId,
      entityType: "order",
      userId: Number(user.id),
    });
    await this.orderRepository.deleteOrder(orderId);
    return success({ message: "Order deleted successfully" });
  }

  public async bulkDelete(payload: OrderMutationPayload): Promise<Result<{ message: string }>> {
    const orderIds = Array.isArray(payload.orderIds) ? payload.orderIds.map(Number).filter(Boolean) : [];
    await this.orderRepository.bulkDelete(orderIds);
    return success({ message: "Orders deleted successfully" });
  }

  public async addNote(orderId: number, text: string, user: OrderRequestUser): Promise<Result<unknown>> {
    const order = await this.orderRepository.findOrderEntity(orderId);
    if (!order) throw new NotFoundError("Order not found");
    const newNote = await this.orderRepository.createOrderNote(orderId, Number(user.id), text);
    const userRecord = user as OrderRequestUser & { firstName?: string; lastName?: string };
    await this.legacyGateway.sendNotification(
      orderId,
      toText((order as { orderNumber?: string }).orderNumber),
      {
        note: { text },
        orderId,
        type: "note",
        user: {
          firstName: userRecord.firstName,
          lastName: userRecord.lastName,
        },
      },
      false,
      true,
    );
    return success(newNote);
  }

  public async updateNote(orderId: number, noteId: number, text: string, user: OrderRequestUser): Promise<Result<unknown>> {
    const order = await this.orderRepository.findOrderEntity(orderId);
    if (!order) throw new NotFoundError("Order Line not found");
    const note = await this.orderRepository.findNoteById(noteId);
    if (!note) throw new NotFoundError("Note not found");
    const noteRecord = note as { userId?: number | string };
    if (String(user.userType) === String(USER_TYPES.VENDOR) || String(user.id) !== String(noteRecord.userId)) {
      throw new UnauthorizedError("You are not authorized to update this note");
    }
    return success(await this.orderRepository.updateOrderNote(noteId, text));
  }

  public async deleteNote(orderId: number, noteId: number, user: OrderRequestUser): Promise<Result<{ message: string }>> {
    const order = await this.orderRepository.findOrderEntity(orderId);
    if (!order) throw new NotFoundError("Order Line not found");
    const note = await this.orderRepository.findNoteById(noteId);
    if (!note) throw new NotFoundError("Note not found");
    const noteRecord = note as { userId?: number | string };
    if (String(user.id) !== String(noteRecord.userId)) {
      throw new UnauthorizedError("You are not authorized to update this note");
    }
    await this.orderRepository.deleteOrderNote(noteId);
    return success({ message: "Note deleted successfully" });
  }

  public async uploadFiles(
    noteId: number,
    filePaths: string[],
    fileNames: string[],
    descriptions: string[],
  ): Promise<Result<{ message: string }>> {
    const note = await this.orderRepository.findNoteById(noteId);
    if (!note) throw new NotFoundError("Note not found");
    await this.orderRepository.createNoteAttachments(noteId, filePaths, fileNames, descriptions);
    return success({ message: "Files uploaded!" });
  }

  public async exportOrders(response: unknown, payload: OrderMutationPayload): Promise<void> {
    await this.legacyGateway.exportOrders(response, payload);
  }
}
