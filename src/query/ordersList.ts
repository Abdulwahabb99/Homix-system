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
  if (p.startDate) query.set("startDate", p.startDate.utc().toISOString());
  if (p.endDate) query.set("endDate", p.endDate.utc().toISOString());
  return query.toString();
}

function mapOrderRow(order) {
  return {
    orderNumber: order.orderNumber,
    items: order.orderLines,
    totalPrice: order.totalPrice,
    subTotalPrice: order.subTotalPrice,
    status: order.status,
    deliveryStatus: order.deliveryStatus,
    customerName: order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : "",
    orderId: order.id,
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
    createdAt: order.createdAt,
    userId: order.userId,
    downPayment: order.downPayment,
    totalVendorDue: order.totalVendorDue,
    totalCompanyDue: order.totalCompanyDue,
    expectedDeliveryDate: order.expectedDeliveryDate,
    type: order.orderLines[0]?.product?.type?.name,
  };
}

/**
 * جلب صفحة الطلبات. عند `force_logout` يعيد التوجيه ويرمي خطأ لعدم تخزين بيانات خاطئة.
 * @param {{ params: object, navigate: import("react-router-dom").NavigateFunction }} ctx
 * @returns {Promise<{ orders: object[], totalPages: number }>}
 */
export async function fetchOrdersList({ params, navigate }) {
  const qs = buildQueryString(params);
  const { data } = await axiosRequest.get(`/orders?${qs}`);
  if (data.force_logout) {
    forceLogoutAndNavigate(navigate);
  }
  const newOrders = data.data.orders
    .map(mapOrderRow)
    .sort((a, b) => moment(b.createdAt).diff(moment(a.createdAt)));
  return { orders: newOrders, totalPages: data.data.totalPages };
}
