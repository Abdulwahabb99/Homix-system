import moment from "moment";
import axiosRequest from "shared/functions/axiosRequest";
import { forceLogoutAndNavigate } from "shared/functions/sessionGuard";

export const ORDERS_LIST_PAGE_SIZE = 30;

/**
 * @param {object} p
 * @param {number} p.page
 * @param {string} [p.orderNumberParam]
 * @param {string} [p.vendorIdParam]
 * @param {string} [p.orderStatusParam]
 * @param {string} [p.paymentStatusParam]
 * @param {string} [p.deliveryStatusParam]
 * @param {string} [p.userIdParam]
 * @param {string} [p.deliveryByParam] معرفات «التوصيل بواسطة» من الـ meta مفصولة بفواصل
 * @param {import("moment").Moment | null} [p.startDate]
 * @param {import("moment").Moment | null} [p.endDate]
 */
function buildQueryString(p) {
  const query = new URLSearchParams({
    page: String(p.page),
    size: String(ORDERS_LIST_PAGE_SIZE),
  });
  if (p.orderNumberParam) query.set("orderNumber", p.orderNumberParam);
  if (p.vendorIdParam) query.set("vendorId", p.vendorIdParam);
  if (p.orderStatusParam) query.set("status", p.orderStatusParam);
  if (p.paymentStatusParam) query.set("paymentStatus", p.paymentStatusParam);
  if (p.deliveryStatusParam) query.set("deliveryStatus", p.deliveryStatusParam);
  if (p.userIdParam) query.set("userId", p.userIdParam);
  if (p.deliveryByParam) query.set("deliveryBy", p.deliveryByParam);
  if (p.endDate) query.set("endDate", p.endDate.utc().toISOString());
  return query.toString();
}

function inferShippedFromInventory(deliveryBy) {
  if (deliveryBy == null || deliveryBy === "") return undefined;
  const s = String(deliveryBy).toLowerCase();
  if (s.includes("inventory") || s.includes("warehouse") || s.includes("مخزن")) return true;
  if (s.includes("vendor") || s.includes("seller") || s.includes("بائع")) return false;
  return undefined;
}

/** صف قائمة الطلبات الجديد (سطر منتج داخل `data.items`) */
function mapListItemRow(row) {
  const rowId = row.id;
  /** معرّف الطلب الأب لمسارات التفاصيل والتعديل — يُفضّل أن يُرجع الـ API حقل `orderId` صراحةً */
  const orderId = row.orderId ?? row.homixOrderId ?? row.parentOrderId ?? row.id;

  return {
    rowId,
    orderId,
    code: row.code ?? row.operationNumber,
    operationNumber: row.operationNumber,
    orderNumber: row.orderNumber,
    customerName: row.customerName,
    status: row.status,
    deliveryStatus:
      row.manufactureStatus != null && row.manufactureStatus !== ""
        ? Number(row.manufactureStatus)
        : row.deliveryStatus != null
          ? Number(row.deliveryStatus)
          : undefined,
    totalPrice: row.totalPrice,
    totalCost: row.totalCost,
    items: [
      {
        code: row.productCode,
        unitCost: row.totalCost,
        quantity: 1,
        product: { vendorId: row.vendorId },
      },
    ],
    paymentStatus: row.paymentStatus,
    PoDate: row.expectedDeliveryDate ?? undefined,
    createdAt: row.orderDate,
    shippedFromInventory: inferShippedFromInventory(row.deliveryBy),
    vendorId: row.vendorId,
    vendorName: row.vendorName,
    userId: row.userId,
    userNameFromApi: row.userName,
    daysSinceOrder: row.daysSinceOrder,
    fine: row.fine,
    type: row.productName,
    orderData: { name: row.orderNumber ? `#${row.orderNumber}` : String(orderId) },
    commission: row.commission ?? "",
    downPayment: row.downPayment ?? "",
    shippingFees: row.shippingFees ?? "",
    toBeCollected: row.toBeCollected ?? "",
    totalVendorDue: row.totalVendorDue ?? "",
    totalCompanyDue: row.totalCompanyDue ?? "",
    expectedDeliveryDate: row.expectedDeliveryDate,
  };
}

function mapOrderRow(order) {
  return {
    rowId: order.id,
    orderId: order.id,
    orderNumber: order.orderNumber,
    items: order.orderLines,
    totalPrice: order.totalPrice,
    subTotalPrice: order.subTotalPrice,
    status: order.status,
    deliveryStatus: order.deliveryStatus,
    customerName: order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : "",
    date: order.orderDate,
    toBeCollected: order.toBeCollected,
    shippingFees: order.shippingFees,
    paymentStatus: order.paymentStatus,
    notes: order.notes,
    commission: order.commission,
    PoDate: order.PoDate,
    totalCost: Number(order.totalCost).toFixed(1),
    orderData: order,
    receivedAmount: order.receivedAmount,
    totalDiscounts: order.totalDiscounts,
    code: order.code,
    createdAt: order.createdAt ?? order.orderDate,
    userId: order.userId,
    downPayment: order.downPayment,
    totalVendorDue: order.totalVendorDue,
    totalCompanyDue: order.totalCompanyDue,
    expectedDeliveryDate: order.expectedDeliveryDate,
    type: order.orderLines[0]?.product?.type?.name,
    shippedFromInventory: order.shippedFromInventory,
    vendorId: order.vendorId,
  };
}

/**
 * جلب صفحة الطلبات. عند `force_logout` يعيد التوجيه ويرمي خطأ لعدم تخزين بيانات خاطئة.
 * @param {{ params: object, navigate: import("react-router-dom").NavigateFunction }} ctx
 * @returns {Promise<{ orders: object[], totalPages: number, totalCount?: number }>}
 */
export async function fetchOrdersList({ params, navigate }) {
  const qs = buildQueryString(params);
  const { data: body } = await axiosRequest.get(`/orders?${qs}`);
  if (body.force_logout) {
    forceLogoutAndNavigate(navigate);
  }
  const inner = body.data;
  if (!inner) {
    return { orders: [], totalPages: 0, totalCount: 0 };
  }

  if (Array.isArray(inner.items)) {
    const size = Number(inner.size) || ORDERS_LIST_PAGE_SIZE;
    const totalCount = inner.totalCount ?? inner.items.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / size));
    const newOrders = inner.items
      .map(mapListItemRow)
      .sort((a, b) => moment(b.createdAt).diff(moment(a.createdAt)));
    return { orders: newOrders, totalPages, totalCount };
  }

  if (Array.isArray(inner.orders)) {
    const newOrders = inner.orders
      .map(mapOrderRow)
      .sort((a, b) => moment(b.createdAt).diff(moment(a.createdAt)));
    return {
      orders: newOrders,
      totalPages: inner.totalPages ?? 1,
      totalCount: inner.totalCount,
    };
  }

  return { orders: [], totalPages: 0, totalCount: 0 };
}
