import type { Request } from "express";

import type { ORDER_PRIORITY_KEYS, ORDER_SUMMARY_CARD_KEYS } from "./order.constants";

export type OrderPriorityKey = (typeof ORDER_PRIORITY_KEYS)[number];
export type OrderSummaryCardKey = (typeof ORDER_SUMMARY_CARD_KEYS)[number];

export type OrderRequestUser = NonNullable<Request["user"]>;

export type OrderListQuery = {
  customerName?: string;
  deliveryStatus?: string;
  endDate?: string;
  manufactureStatus?: string;
  operationCode?: string;
  orderNumber?: string;
  page: number;
  paymentStatus?: string;
  priority?: OrderPriorityKey;
  productCode?: string;
  size: number;
  startDate?: string;
  status?: string;
  userId?: number;
  vendorId?: string;
  vendorName?: string;
};

export type OrderSummaryQuery = Omit<OrderListQuery, "page" | "size">;

export type OrderListItem = {
  code: string;
  customerName: string;
  daysSinceOrder: number | null;
  deliveryPriority: OrderPriorityKey | null;
  deliveryPriorityLabel: string;
  expectedDeliveryDate: string | null;
  id: number;
  manufactureStatus: number | null;
  manufactureStatusLabel: string;
  operationNumber: string;
  orderDate: string | null;
  orderNumber: string;
  paymentStatus: number | null;
  paymentStatusLabel: string;
  productCode: string;
  productImage: string;
  productName: string;
  status: number | null;
  statusLabel: string;
  totalCost: number;
  totalPrice: number;
  userName: string;
  vendorId: number | null;
  vendorName: string;
};

export type OrderListResponse = {
  items: OrderListItem[];
  page: number;
  size: number;
  totalCount: number;
};

export type OrderSummaryCard = {
  key: OrderSummaryCardKey;
  label: string;
  value: number;
};

export type OrderSummaryResponse = {
  cards: OrderSummaryCard[];
};

export type OrderFinancialReportRankedItem = {
  productId?: number;
  productImage?: string;
  productName?: string;
  profit: number;
  revenue: number;
  sku?: string;
  vendorId?: number;
  vendorName?: string;
};

export type OrderFinancialReportSection = {
  ordersCount: number;
  subTotal: number;
  totalCommission: number;
  totalCost: number;
  totalDiscount: number;
  totalDownPayment: number;
  totalPaid: number;
  totalProfit: number;
  totalRevenue: number;
  totalTax: number;
  totalToBeCollected: number;
};

export type OrderFinancialReportResponse = {
  DeliveredOrders: OrderFinancialReportSection;
  ordersCount: number;
  subTotal: number;
  topTenProducts: OrderFinancialReportRankedItem[];
  topTenVendors: OrderFinancialReportRankedItem[];
  totalCommission: number;
  totalCost: number;
  totalDiscount: number;
  totalDownPayment: number;
  totalPaid: number;
  totalProfit: number;
  totalRevenue: number;
  totalTax: number;
  totalToBeCollected: number;
};

export type OrderMetaOption = {
  id: number | string;
  label: string;
};

export type OrderMetaResponse = {
  assignees: OrderMetaOption[];
  manufactureStatuses: OrderMetaOption[];
  paymentStatuses: OrderMetaOption[];
  priorities: OrderMetaOption[];
  statuses: OrderMetaOption[];
  vendors: OrderMetaOption[];
};

export type OrderAttachment = {
  createdAt: string;
  description: string;
  id: number;
  name: string;
  url: string;
};

export type OrderNote = {
  attachments: OrderAttachment[];
  createdAt: string;
  id: number;
  text: string;
  userName: string;
};

export type OrderEvent = {
  action: string;
  createdAt: string;
  field: string;
  id: number;
  message: string;
  userName: string;
};

export type OrderDetailsView = {
  assigneeName: string;
  customer: {
    id: number | null;
    address: string;
    email: string;
    name: string;
    phoneNumber: string;
  };
  financial: {
    amountToCollect: number;
    commission: number;
    discount: number;
    downPayment: number;
    shippingFees: number;
    totalCost: number;
    totalPrice: number;
  };
  notes: OrderNote[];
  order: OrderListItem & {
    deliveryDate: string | null;
    notes: string;
    shipmentType: string;
  };
  orderLine: {
    color: string;
    material: string;
    quantity: number;
    size: string;
    sku: string;
    typeName: string;
    unitCost: number;
  };
  timeline: OrderEvent[];
};

export type OrderDetailsResponse = OrderDetailsView;

export type OrderMutationPayload = Record<string, unknown>;

export type LegacyOrderResponse<TData = unknown> = {
  data?: TData;
  message?: string;
  status?: boolean;
  statusCode?: number;
};
