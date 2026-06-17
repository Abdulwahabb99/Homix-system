import { z } from "zod";

import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, PERFORMANCE_PERIODS } from "./shipment.constants";
import { isValidDateInput } from "./shipment.helpers";

const csvString = z.string().trim().min(1);
const dateString = z.string().trim().refine(isValidDateInput, {
  message: "Invalid date value",
});

export const shipmentIdParamsSchema = z.object({
  shipmentId: z.coerce.number().int().positive(),
});

export const shipmentInventoryItemParamsSchema = z.object({
  inventoryItemId: z.coerce.number().int().positive(),
});

export const shipmentExpenseParamsSchema = z.object({
  expenseId: z.coerce.number().int().positive(),
});

export const shipmentReturnParamsSchema = z.object({
  returnId: z.coerce.number().int().positive(),
});

export const shipmentNoteParamsSchema = shipmentIdParamsSchema.extend({
  noteId: z.coerce.number().int().positive(),
});

export const shipmentListQuerySchema = z.object({
  customerName: z.string().trim().optional(),
  customerPhone: z.string().trim().optional(),
  deliveryBy: z.string().trim().optional(),
  deliveryDateFrom: dateString.optional(),
  deliveryDateTo: dateString.optional(),
  endDate: dateString.optional(),
  operationCode: z.string().trim().optional(),
  orderNumber: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE_NUMBER),
  paymentStatus: csvString.optional(),
  shipmentNumber: z.string().trim().optional(),
  shipmentStatus: csvString.optional(),
  shipmentType: z.string().trim().optional(),
  size: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
  startDate: dateString.optional(),
  vendorName: z.string().trim().optional(),
});

export const shipmentSummaryQuerySchema = shipmentListQuerySchema.omit({
  page: true,
  size: true,
});

export const shipmentMutationSchema = z.record(z.string(), z.unknown());

export const shipmentNoteSchema = z.object({
  text: z.string().trim().min(1),
});

export const shipmentReturnsQuerySchema = z.object({
  operationCode: z.string().trim().optional(),
  orderNumber: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE_NUMBER),
  sellerName: z.string().trim().optional(),
  size: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
  status: z.coerce.number().int().positive().optional(),
});

export const shipmentReturnMutationSchema = z.object({
  orderId: z.coerce.number().int().positive(),
  reason: z.string().trim().min(1),
  returnDate: dateString.optional().nullable(),
  status: z.coerce.number().int().positive().optional(),
});

export const shipmentInventoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE_NUMBER),
  productCode: z.string().trim().optional(),
  size: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
  status: z.coerce.number().int().positive().optional(),
  vendorName: z.string().trim().optional(),
});

export const shipmentInventoryMutationSchema = z.object({
  color: z.string().trim().optional(),
  costPrice: z.coerce.number().min(0),
  productId: z.coerce.number().int().positive(),
  productCode: z.string().trim().min(1),
  quantity: z.coerce.number().int().min(0),
  size: z.string().trim().optional(),
  status: z.coerce.number().int().positive().optional(),
});

export const shipmentDeliveryAccountsQuerySchema = z.object({
  accountingStatus: z.coerce.number().int().positive().optional(),
  orderNumber: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE_NUMBER),
  paymentMethod: z.string().trim().optional(),
  settledDate: dateString.optional(),
  size: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
});

export const shipmentExpenseAccountsQuerySchema = z.object({
  accountingStatus: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE_NUMBER),
  size: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
  type: z.coerce.number().int().positive().optional(),
});

export const shipmentExpenseMutationSchema = z.object({
  accountingDate: dateString.optional().nullable(),
  accountingStatus: z.coerce.number().int().positive().optional(),
  amount: z.coerce.number().min(0),
  reason: z.string().trim().min(1),
  type: z.coerce.number().int().positive(),
});

export const shipmentPerformanceQuerySchema = z.object({
  endDate: dateString.optional(),
  period: z.enum(PERFORMANCE_PERIODS).default("daily"),
  startDate: dateString.optional(),
});
