import { z } from "zod";

import {
  DEFAULT_TICKET_PAGE,
  DEFAULT_TICKET_PAGE_SIZE,
  MAX_TICKET_PAGE_SIZE,
  TICKET_STATUS,
  TICKET_TYPE,
} from "./ticket.constants";

const positiveIntegerMessage = "Expected a positive integer";
const ticketStatusSchema = z.union([
  z.literal(TICKET_STATUS.OPEN),
  z.literal(TICKET_STATUS.CLOSED),
]);
const ticketTypeSchema = z.union([
  z.literal(TICKET_TYPE.DELIVERY_DELAY),
  z.literal(TICKET_TYPE.CANCEL),
  z.literal(TICKET_TYPE.MONEY_REFUND),
  z.literal(TICKET_TYPE.PRODUCT_RETURN),
  z.literal(TICKET_TYPE.DELIVERY_REJECTED),
  z.literal(TICKET_TYPE.DELIVERY_FAILURE),
  z.literal(TICKET_TYPE.MAINTENANCE),
  z.literal(TICKET_TYPE.REPLACEMENT),
  z.literal(TICKET_TYPE.VERIFICATION),
]);

const optionalDateString = z.string().datetime({ offset: true }).or(z.string().date()).optional();

export const ticketListQuerySchema = z.object({
  assignedToUserId: z.coerce.number().int().positive(positiveIntegerMessage).optional(),
  endDate: optionalDateString,
  operationNumber: z.string().trim().min(1).optional(),
  orderNumber: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().min(1).default(DEFAULT_TICKET_PAGE),
  size: z.coerce.number().int().min(1).max(MAX_TICKET_PAGE_SIZE).default(DEFAULT_TICKET_PAGE_SIZE),
  startDate: optionalDateString,
  status: z.coerce.number().pipe(ticketStatusSchema).optional(),
  type: z.coerce.number().pipe(ticketTypeSchema).optional(),
}).superRefine((value, context) => {
  if (!value.startDate || !value.endDate) {
    return;
  }

  const startDate = new Date(value.startDate);
  const endDate = new Date(value.endDate);
  if (startDate > endDate) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "startDate must be before or equal to endDate",
      path: ["startDate"],
    });
  }
});

export const ticketExportQuerySchema = ticketListQuerySchema.omit({
  page: true,
  size: true,
});

export const ticketIdParamsSchema = z.object({
  ticketId: z.coerce.number().int().positive(positiveIntegerMessage),
});

export const ticketAttachmentParamsSchema = z.object({
  attachmentId: z.coerce.number().int().positive(positiveIntegerMessage),
  ticketId: z.coerce.number().int().positive(positiveIntegerMessage),
});

export const ticketNoteParamsSchema = z.object({
  noteId: z.coerce.number().int().positive(positiveIntegerMessage),
  ticketId: z.coerce.number().int().positive(positiveIntegerMessage),
});

export const ticketOperationLookupQuerySchema = z.object({
  operationNumber: z.string().trim().min(1, "operationNumber is required"),
});

export const ticketOrderNumberLookupQuerySchema = z.object({
  orderNumber: z.string().trim().min(1, "orderNumber is required"),
});

export const ticketCreateSchema = z.object({
  assignedToUserId: z.coerce.number().int().positive(positiveIntegerMessage).optional(),
  notes: z.string().trim().optional(),
  orderId: z.coerce.number().int().positive(positiveIntegerMessage),
  type: z.coerce.number().pipe(ticketTypeSchema),
});

export const ticketUpdateSchema = z.object({
  assignedToUserId: z.coerce.number().int().positive(positiveIntegerMessage).nullable().optional(),
  notes: z.string().trim().optional(),
  status: z.coerce.number().pipe(ticketStatusSchema).optional(),
  type: z.coerce.number().pipe(ticketTypeSchema).optional(),
});

export const ticketNoteSchema = z.object({
  text: z.string().optional().default(""),
});
