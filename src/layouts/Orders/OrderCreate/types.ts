export interface OrderLineItem {
  /** stable client key for list rendering */
  key: string;
  title: string;
  price: number;
  quantity: number;
  productId: number | string;
  variantId: number | string;
  image?: string | null;
  sku?: string;
  productCode?: string;
  variantTitle?: string;
}

export interface CustomerForm {
  firstName: string;
  lastName: string;
  phone: string;
}

export interface OrderCreateFormState {
  customer: CustomerForm;
  lineItems: OrderLineItem[];
  orderDate: string;
  expectedDeliveryDate: string;
  paymentStatus: number;
  deliveryBy: number;
  downPayment: string;
  shippingFees: string;
  toBeCollected: string;
}

export interface OrderTotals {
  itemsTotal: number;
  shippingFees: number;
  downPayment: number;
  toBeCollected: number;
}
