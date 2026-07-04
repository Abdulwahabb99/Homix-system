import type { Request } from "express";

import type {
  TICKET_STATUS,
  TICKET_TYPE,
} from "./ticket.constants";

export type TicketStatus = (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS];
export type TicketType = (typeof TICKET_TYPE)[keyof typeof TICKET_TYPE];

export type TicketUserSummary = {
  firstName: string;
  id: number;
  lastName: string;
};

export type TicketAttachment = {
  createdAt: string;
  description: string;
  id: number;
  name: string;
  url: string;
};

export type TicketNote = {
  createdAt: string;
  id: number;
  text: string;
  updatedAt: string;
  user: TicketUserSummary | null;
};

export type TicketHistoryItem = {
  changedAt: string;
  description: string;
  eventType: string;
  field: string;
  fromValue: string;
  id: number;
  message: string;
  toValue: string;
  user: TicketUserSummary | null;
};

export type TicketOrderSummary = {
  customerName: string;
  id: number;
  operationNumber: string;
  orderNumber: string;
  productName: string;
  productSku: string;
  sellerName: string;
};

export type TicketSummary = {
  assignedTo: TicketUserSummary | null;
  assigneeReply: string;
  closedAt: string | null;
  createdAt: string;
  creatorReply: string;
  daysOpen: number;
  id: number;
  notes: string;
  order: TicketOrderSummary;
  status: TicketStatus;
  statusLabel: string;
  type: TicketType;
  typeLabel: string;
};

export type TicketDetails = TicketSummary & {
  attachments: TicketAttachment[];
  createdBy: TicketUserSummary | null;
  history: TicketHistoryItem[];
  notesList: TicketNote[];
};

export type TicketListFilters = {
  assignedToUserId?: number;
  endDate?: string;
  operationNumber?: string;
  orderNumber?: string;
  page: number;
  size: number;
  startDate?: string;
  status?: TicketStatus;
  type?: TicketType;
};

export type TicketCreateInput = {
  assignedToUserId?: number;
  notes?: string;
  orderId: number;
  type: TicketType;
};

export type TicketUpdateInput = {
  assignedToUserId?: number | null;
  closedAt?: string | null;
  notes?: string;
  status?: TicketStatus;
  type?: TicketType;
};

export type TicketNoteInput = {
  text: string;
};

export type TicketListSummary = {
  averageResolutionDays: number;
  closed: number;
  open: number;
  overdueOpen: number;
  total: number;
};

export type TicketListResponse = {
  items: TicketSummary[];
  page: number;
  size: number;
  summary: TicketListSummary;
  totalCount: number;
};

export type TicketMetaResponse = {
  assignees: TicketUserSummary[];
  statuses: Array<{ key: TicketStatus; label: string }>;
  types: Array<{ key: TicketType; label: string }>;
};

export type TicketLookupResponse = TicketOrderSummary;

export type TicketRequestUser = Request["user"] & {
  firstName?: string;
  lastName?: string;
};
