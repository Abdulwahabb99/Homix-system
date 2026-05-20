import type { Request } from "express";

import type { PERFORMANCE_PERIODS } from "./shipment.constants";

export type ShipmentRequestUser = NonNullable<Request["user"]>;

export type ShipmentListQuery = {
  customerName?: string;
  customerPhone?: string;
  deliveryBy?: string;
  deliveryDateFrom?: string;
  deliveryDateTo?: string;
  endDate?: string;
  operationCode?: string;
  orderNumber?: string;
  page: number;
  paymentStatus?: string;
  shipmentNumber?: string;
  shipmentStatus?: string;
  shipmentType?: string;
  size: number;
  startDate?: string;
  vendorName?: string;
};

export type ReturnListQuery = {
  operationCode?: string;
  orderNumber?: string;
  page: number;
  sellerName?: string;
  size: number;
  status?: number;
};

export type ReturnMutationInput = {
  orderId: number;
  reason: string;
  returnDate?: string | null;
  status?: number;
};

export type InventoryListQuery = {
  page: number;
  productCode?: string;
  size: number;
  status?: number;
  vendorName?: string;
};

export type InventoryMutationInput = {
  color?: string;
  costPrice: number;
  productId: number;
  productCode: string;
  quantity: number;
  size?: string;
  status?: number;
};

export type DeliveryAccountsListQuery = {
  accountingStatus?: number;
  orderNumber?: string;
  page: number;
  paymentMethod?: string;
  settledDate?: string;
  size: number;
};

export type ExpenseAccountsListQuery = {
  accountingStatus?: number;
  page: number;
  size: number;
  type?: string;
};

export type ExpenseMutationInput = {
  accountingDate?: string | null;
  accountingStatus?: number;
  amount: number;
  reason: string;
  type: string;
};

export type PerformanceQuery = {
  endDate?: string;
  period: (typeof PERFORMANCE_PERIODS)[number];
  startDate?: string;
};

export type ShipmentMetaOption = {
  id: number | string;
  label: string;
};

export type ShipmentMetaResponse = {
  deliveryByOptions: ShipmentMetaOption[];
  paymentStatuses: ShipmentMetaOption[];
  shipmentStatuses: ShipmentMetaOption[];
  shipmentTypes: ShipmentMetaOption[];
  tabs: Array<{ count?: number; id: string; label: string }>;
};

export type ShipmentSummaryCard = {
  description: string;
  key: string;
  label: string;
  value: number;
};

export type ShipmentSummaryResponse = {
  cards: ShipmentSummaryCard[];
};

export type ShipmentListItem = {
  amountToCollect: number;
  customerName: string;
  customerPhone: string;
  daysCounter: number | null;
  deliveryBy: string;
  deliveryDate: string | null;
  operationNumber: string;
  orderNumber: string;
  paymentStatus: number | null;
  paymentStatusLabel: string;
  receivedInWarehouseDate: string | null;
  scheduledDeliveryDate: string | null;
  sellerName: string;
  shipmentNumber: string;
  shipmentStatus: number | null;
  shipmentStatusLabel: string;
  shipmentType: string;
  shipmentTypeLabel: string;
  shippingCost: number;
  id: number;
  governorate: string;
};

export type ShipmentListResponse = {
  items: ShipmentListItem[];
  page: number;
  size: number;
  totalCount: number;
};

export type ShipmentNote = {
  createdAt: string;
  id: number;
  text: string;
  userName: string;
};

export type ShipmentTimelineItem = {
  changedAt: string;
  id: number;
  message: string;
  userName: string;
};

export type ShipmentDetailsResponse = {
  customer: {
    address: string;
    name: string;
    phoneNumber: string;
  };
  financial: {
    amountToCollect: number;
    shippingCost: number;
    totalPrice: number;
  };
  notes: ShipmentNote[];
  products: Array<{
    color: string;
    image: string;
    price: number;
    productCode: string;
    productName: string;
    quantity: number;
    size: string;
    vendorName: string;
  }>;
  shipment: ShipmentListItem & {
    shippingCompany: string;
  };
  timeline: ShipmentTimelineItem[];
  vendor: {
    name: string;
  };
};

export type ReturnItem = {
  daysCounter: number | null;
  id: number;
  operationNumber: string;
  orderNumber: string;
  reason: string;
  returnDate: string | null;
  sellerName: string;
  status: number;
  statusLabel: string;
  returnType: number;
  returnTypeLabel: string;
};

export type ReturnListResponse = {
  items: ReturnItem[];
  page: number;
  size: number;
  totalCount: number;
};

export type InventoryItem = {
  color: string;
  costPrice: number;
  id: number;
  image: string;
  productId: number | null;
  productCode: string;
  productName: string;
  quantity: number;
  size: string;
  status: number;
  statusLabel: string;
  vendorId: number | null;
  vendorName: string;
};

export type InventoryListResponse = {
  items: InventoryItem[];
  page: number;
  size: number;
  totalCount: number;
};

export type DeliveryAccountItem = {
  accountingDate: string | null;
  accountingStatus: number;
  accountingStatusLabel: string;
  amountToCollect: number;
  deliveryBy: string;
  deliveryDate: string | null;
  operationNumber: string;
  orderNumber: string;
  paymentMethod: string;
  paymentMethodLabel: string;
  productCode: string;
  reference: string;
  sellerName: string;
  sellingPrice: number;
  shippingCost: number;
};

export type DeliveryAccountsListResponse = {
  items: DeliveryAccountItem[];
  page: number;
  size: number;
  totalCount: number;
};

export type ExpenseAccountItem = {
  id: number;
  accountingDate: string | null;
  accountingStatus: number;
  accountingStatusLabel: string;
  amount: number;
  reason: string;
  type: string;
};

export type ExpenseAccountsListResponse = {
  items: ExpenseAccountItem[];
  page: number;
  size: number;
  totalCount: number;
};

export type PerformanceOverview = {
  averageDeliveryDays: number;
  deliveredOrdersCount: number;
  totalGmv: number;
};

export type PerformanceChartItem = {
  deliveredOrdersCount: number;
  label: string;
};

export type PerformanceDeliveryProviderItem = {
  averageDeliveryDays: number;
  deliveredOrdersCount: number;
  deliveryBy: string;
  returnsCount: number;
  successRate: number;
  totalGmv: number;
};

export type PerformanceResponse = {
  chart: PerformanceChartItem[];
  overview: PerformanceOverview;
  providers: PerformanceDeliveryProviderItem[];
};

export type LegacyShipmentResponse<TData = unknown> = {
  data?: TData;
  message?: string;
  status?: boolean;
  statusCode?: number;
};
