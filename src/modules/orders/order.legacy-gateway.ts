import type { LegacyOrderResponse, OrderMutationPayload, OrderRequestUser } from "./order.types";

export type LegacyOrderGateway = {
  addNote: (user: OrderRequestUser, orderId: number, text: string) => Promise<LegacyOrderResponse>;
  bulkDelete: (payload: OrderMutationPayload) => Promise<LegacyOrderResponse>;
  bulkUpdate: (payload: OrderMutationPayload, user: OrderRequestUser) => Promise<LegacyOrderResponse>;
  deleteNote: (user: OrderRequestUser, orderId: number, noteId: number) => Promise<LegacyOrderResponse>;
  deleteOrder: (orderId: number, user: OrderRequestUser) => Promise<LegacyOrderResponse>;
  exportOrders: (response: unknown, payload: OrderMutationPayload) => Promise<void>;
  financialReport: (vendorId: string | number | undefined, startDate?: string, endDate?: string) => Promise<LegacyOrderResponse>;
  importOrders: () => Promise<void>;
  saveImportedOrders: (orders: OrderMutationPayload[], isShipment: boolean, user?: OrderRequestUser) => Promise<LegacyOrderResponse | void>;
  sendNotification: (
    orderId: number,
    orderNumber: string,
    data: Record<string, unknown>,
    isUpdateStatus?: boolean,
    addNote?: boolean,
    isUpdateManufactureStatus?: boolean,
  ) => Promise<void>;
  updateNote: (user: OrderRequestUser, orderId: number, noteId: number, text: string) => Promise<LegacyOrderResponse>;
  updateOrder: (orderId: number, payload: OrderMutationPayload, user: OrderRequestUser) => Promise<LegacyOrderResponse>;
  uploadFiles: (noteId: number, filePaths: string[], fileNames: string[], descriptions: string[]) => Promise<LegacyOrderResponse>;
};

const getLegacyOrderService = () => require("../../../app/modules/order/order.service");

export const orderLegacyGateway: LegacyOrderGateway = {
  addNote: (user, orderId, text) => getLegacyOrderService().addNote(user, orderId, text),
  bulkDelete: (payload) => getLegacyOrderService().bulkDelete(payload),
  bulkUpdate: (payload, user) => getLegacyOrderService().BulkUpdate(payload, user),
  deleteNote: (user, orderId, noteId) => getLegacyOrderService().deleteNote(user, orderId, noteId),
  deleteOrder: (orderId, user) => getLegacyOrderService().deleteOrder(orderId, user),
  exportOrders: (response, payload) => getLegacyOrderService().exportOrders(response, payload),
  financialReport: (vendorId, startDate, endDate) => getLegacyOrderService().financialReport(vendorId, startDate, endDate),
  importOrders: async () => {
    await getLegacyOrderService().importOrders({}, true);
  },
  saveImportedOrders: (orders, isShipment, user) => getLegacyOrderService().saveImportedOrders(orders, isShipment, user),
  sendNotification: (orderId, orderNumber, data, isUpdateStatus, addNote, isUpdateManufactureStatus) =>
    getLegacyOrderService().sendNotification(
      orderId,
      orderNumber,
      data,
      isUpdateStatus,
      addNote,
      isUpdateManufactureStatus,
    ),
  updateNote: (user, orderId, noteId, text) => getLegacyOrderService().updateNote(user, orderId, noteId, text),
  updateOrder: (orderId, payload, user) => getLegacyOrderService().updateOrder(orderId, payload, user),
  uploadFiles: (noteId, filePaths, fileNames, descriptions) =>
    getLegacyOrderService().uploadFiles(noteId, filePaths, fileNames, descriptions),
};
