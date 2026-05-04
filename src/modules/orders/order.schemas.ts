import { z } from "zod";

import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, ORDER_PRIORITY_KEYS } from "./order.constants";

const csvNumberString = z.string().trim().min(1);

export const orderIdParamsSchema = z.object({
  orderId: z.coerce.number().int().positive(),
});

export const orderNoteParamsSchema = orderIdParamsSchema.extend({
  noteId: z.coerce.number().int().positive(),
});

export const orderListQuerySchema = z.object({
  customerName: z.string().trim().optional(),
  deliveryStatus: csvNumberString.optional(),
  endDate: z.string().trim().optional(),
  manufactureStatus: csvNumberString.optional(),
  operationCode: z.string().trim().optional(),
  orderNumber: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE_NUMBER),
  paymentStatus: csvNumberString.optional(),
  priority: z.enum(ORDER_PRIORITY_KEYS).optional(),
  productCode: z.string().trim().optional(),
  size: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
  startDate: z.string().trim().optional(),
  status: csvNumberString.optional(),
  userId: z.coerce.number().int().positive().optional(),
  vendorId: csvNumberString.optional(),
  vendorName: z.string().trim().optional(),
});

export const orderSummaryQuerySchema = orderListQuerySchema.omit({
  page: true,
  size: true,
});

export const orderMutationSchema = z.record(z.string(), z.unknown());

export const orderBulkUpdateSchema = z.object({
  orderData: orderMutationSchema,
  orderIds: z.array(z.coerce.number().int().positive()).min(1),
});

export const orderBulkDeleteSchema = z.object({
  orderIds: z.array(z.coerce.number().int().positive()).min(1),
});

export const orderNoteSchema = z.object({
  text: z.string().trim().min(1),
});
