/**
 * يحوّل بيانات تفاصيل الشحنة إلى الشكل الذي يقرأه `OrderInvoiceDocument`،
 * حتى تخرج فاتورة الشحنة بنفس تصميم ومحتوى فاتورة الطلب بدل طباعة الصفحة.
 *
 * الشحنة في هذا النظام هي الوجه الشحني لنفس الطلب، لذا التحويل مجرد إعادة تسمية
 * للحقول ولا يستنتج أي أرقام جديدة.
 */
import type { ShipmentDetailData } from "query/shipmentDetail";

export interface ShipmentInvoiceModel {
  code: string;
  createdAt: string | null;
  customer: { address: string; name: string; phoneNumber: string };
  downPayment: number;
  name: string;
  orderLines: {
    id: number;
    price: number;
    product: { image: string | null };
    quantity: number;
    sku: string;
    title: string;
  }[];
  orderNumber: string;
  paymentStatus: number;
  shippingFees: number;
  subTotalPrice: number;
  toBeCollected: number;
  totalDiscounts: number;
  totalPrice: number;
}

export function buildShipmentInvoiceModel(data: ShipmentDetailData): ShipmentInvoiceModel {
  const { customer, financial, products, shipment } = data;

  const orderLines = products.map((product, index) => ({
    id: index,
    price: Number(product.price) || 0,
    product: { image: product.image },
    quantity: Number(product.quantity) || 0,
    sku: product.productCode,
    title: product.productName,
  }));

  const subTotalPrice = orderLines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const shippingFees = Number(financial.shippingCost ?? shipment.shippingCost) || 0;
  const totalPrice = Number(financial.totalPrice) || subTotalPrice;
  // الخصم غير مُصرّح به في استجابة الشحنة، فنستنتجه من الفارق بدل عرض صفر مضلِّل.
  const totalDiscounts = Math.max(0, subTotalPrice - totalPrice);
  const toBeCollected = Number(financial.amountToCollect ?? shipment.amountToCollect) || 0;
  // «جدية الشراء» = ما دُفع مقدماً = الإجمالي + الشحن − المطلوب تحصيله.
  const downPayment = Math.max(0, totalPrice + shippingFees - toBeCollected);

  return {
    code: shipment.operationNumber,
    createdAt: shipment.receivedInWarehouseDate ?? shipment.scheduledDeliveryDate,
    customer: {
      address: customer.address,
      name: customer.name || shipment.customerName,
      phoneNumber: customer.phoneNumber || shipment.customerPhone,
    },
    downPayment,
    name: shipment.orderNumber,
    orderLines,
    orderNumber: shipment.orderNumber,
    paymentStatus: shipment.paymentStatus,
    shippingFees,
    subTotalPrice,
    toBeCollected,
    totalDiscounts,
    totalPrice,
  };
}
