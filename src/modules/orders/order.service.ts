import { ConflictError, NotFoundError, UnauthorizedError } from "../../shared/errors";
import type { Result } from "../../shared/result";
import { success } from "../../shared/result";
import { OrderRepository } from "./order.repo";
import type { LegacyOrderResponse, OrderDetailsResponse, OrderListQuery, OrderListResponse, OrderMetaResponse, OrderMutationPayload, OrderRequestUser, OrderSummaryResponse } from "./order.types";

const legacyOrderService = require("../../../app/modules/order/order.service");

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
  public constructor(private readonly orderRepository: OrderRepository) {}

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
    await legacyOrderService.saveImportedOrders([payload], false, user);
    return success({ message: "Order created successfully" });
  }

  public async importOrders(): Promise<Result<{ message: string }>> {
    await legacyOrderService.importOrders({}, true);
    return success({ message: "Orders imported successfully" });
  }

  public async financialReport(vendorId: string | number | undefined, startDate?: string, endDate?: string): Promise<Result<unknown>> {
    const response = ensureLegacySuccess(await legacyOrderService.financialReport(vendorId, startDate, endDate));
    return success(response.data ?? {});
  }

  public async updateOrder(orderId: number, payload: OrderMutationPayload, user: OrderRequestUser): Promise<Result<unknown>> {
    const response = ensureLegacySuccess(await legacyOrderService.updateOrder(orderId, payload, user));
    return success(response.data ?? {});
  }

  public async bulkUpdate(
    payload: OrderMutationPayload,
    user: OrderRequestUser,
  ): Promise<Result<{ message: string }>> {
    const response = ensureLegacySuccess(await legacyOrderService.BulkUpdate(payload, user));
    return success({ message: response.message ?? "Orders updated successfully" });
  }

  public async deleteOrder(orderId: number, user: OrderRequestUser): Promise<Result<{ message: string }>> {
    const response = ensureLegacySuccess(await legacyOrderService.deleteOrder(orderId, user));
    return success({ message: response.message ?? "Order deleted successfully" });
  }

  public async bulkDelete(payload: OrderMutationPayload): Promise<Result<{ message: string }>> {
    const response = ensureLegacySuccess(await legacyOrderService.bulkDelete(payload));
    return success({ message: response.message ?? "Orders deleted successfully" });
  }

  public async addNote(orderId: number, text: string, user: OrderRequestUser): Promise<Result<unknown>> {
    const response = ensureLegacySuccess(await legacyOrderService.addNote(user, orderId, text));
    return success(response.data ?? {});
  }

  public async updateNote(orderId: number, noteId: number, text: string, user: OrderRequestUser): Promise<Result<unknown>> {
    const response = ensureLegacySuccess(await legacyOrderService.updateNote(user, orderId, noteId, text));
    return success(response.data ?? {});
  }

  public async deleteNote(orderId: number, noteId: number, user: OrderRequestUser): Promise<Result<{ message: string }>> {
    const response = ensureLegacySuccess(await legacyOrderService.deleteNote(user, orderId, noteId));
    return success({ message: response.message ?? "Note deleted successfully" });
  }

  public async uploadFiles(
    noteId: number,
    filePaths: string[],
    fileNames: string[],
    descriptions: string[],
  ): Promise<Result<{ message: string }>> {
    const response = ensureLegacySuccess(await legacyOrderService.uploadFiles(noteId, filePaths, fileNames, descriptions));
    return success({ message: response.message ?? "Files uploaded!" });
  }

  public async exportOrders(response: Parameters<typeof legacyOrderService.exportOrders>[0], payload: OrderMutationPayload): Promise<void> {
    await legacyOrderService.exportOrders(response, payload);
  }
}
