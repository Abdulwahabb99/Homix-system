import { z } from "zod";

import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, PERFORMANCE_PERIODS } from "./shipment.constants";

const csvString = z.string().trim().min(1);

export const shipmentIdParamsSchema = z.object({
  shipmentId: z.coerce.number().int().positive(),
});

export const shipmentNoteParamsSchema = shipmentIdParamsSchema.extend({
  noteId: z.coerce.number().int().positive(),
});

export const shipmentListQuerySchema = z.object({
  customerName: z.string().trim().optional(),
  customerPhone: z.string().trim().optional(),
  deliveryBy: z.string().trim().optional(),
  deliveryDateFrom: z.string().trim().optional(),
  deliveryDateTo: z.string().trim().optional(),
  endDate: z.string().trim().optional(),
  operationCode: z.string().trim().optional(),
  orderNumber: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE_NUMBER),
  paymentStatus: csvString.optional(),
  shipmentNumber: z.string().trim().optional(),
  shipmentStatus: csvString.optional(),
  shipmentType: z.string().trim().optional(),
  size: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
  startDate: z.string().trim().optional(),
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
  status: z.string().trim().optional(),
});

export const shipmentInventoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE_NUMBER),
  productCode: z.string().trim().optional(),
  size: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
  status: z.string().trim().optional(),
  vendorName: z.string().trim().optional(),
});

export const shipmentDeliveryAccountsQuerySchema = z.object({
  accountingStatus: z.string().trim().optional(),
  orderNumber: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE_NUMBER),
  paymentMethod: z.string().trim().optional(),
  settledDate: z.string().trim().optional(),
  size: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
});

export const shipmentExpenseAccountsQuerySchema = z.object({
  accountingStatus: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE_NUMBER),
  size: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
  type: z.string().trim().optional(),
});

export const shipmentPerformanceQuerySchema = z.object({
  endDate: z.string().trim().optional(),
  period: z.enum(PERFORMANCE_PERIODS).default("daily"),
  startDate: z.string().trim().optional(),
});
