import { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateOrderFormMutation } from "query/orderCreateForm.api";
import { DEFAULT_DELIVERY_BY, DEFAULT_PAYMENT_STATUS } from "../constants";
import type { CustomerForm, OrderLineItem, OrderTotals } from "../types";
import {
  buildOrderPayload,
  itemsTotal,
  suggestedToBeCollected,
  toNumber,
  todayInputValue,
} from "../utils";

let keySeq = 0;
const nextKey = () => `li-${Date.now()}-${keySeq++}`;

/** Maps a product (from the product picker) + its selected variant to a line item. */
export function productToLineItem(product: any): OrderLineItem {
  const variant = product?.variants?.[0] ?? {};
  return {
    key: nextKey(),
    title: product?.title ?? "",
    price: toNumber(variant.price),
    quantity: 1,
    productId: product?.shopifyId ?? "",
    variantId: variant.shopifyId ?? variant.id ?? "",
    image: product?.image ?? null,
    sku: variant.sku,
    productCode: variant.sku ?? product?.code,
    variantTitle:
      variant.title && variant.title !== "Default Title" ? variant.title : undefined,
  };
}

export function useOrderCreateForm() {
  const navigate = useNavigate();
  const mutation = useCreateOrderFormMutation();

  const [customer, setCustomer] = useState<CustomerForm>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address1: "",
    address2: "",
    city: "",
    province: "",
    country: "مصر",
  });
  const [lineItems, setLineItems] = useState<OrderLineItem[]>([]);
  const [orderDate, setOrderDate] = useState<string>(todayInputValue());
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<number>(DEFAULT_PAYMENT_STATUS);
  const [deliveryBy, setDeliveryBy] = useState<number>(DEFAULT_DELIVERY_BY);
  const [downPayment, setDownPayment] = useState<string>("");
  const [shippingFees, setShippingFees] = useState<string>("");
  const [toBeCollectedTouched, setToBeCollectedTouched] = useState(false);
  const [toBeCollectedInput, setToBeCollectedInput] = useState<string>("");

  const setCustomerField = useCallback((field: keyof CustomerForm, value: string) => {
    setCustomer((prev) => ({ ...prev, [field]: value }));
  }, []);

  const addLineItem = useCallback((item: OrderLineItem) => {
    setLineItems((prev) => [...prev, item]);
  }, []);

  const removeLineItem = useCallback((key: string) => {
    setLineItems((prev) => prev.filter((li) => li.key !== key));
  }, []);

  const setLineItemQuantity = useCallback((key: string, quantity: number) =>
    setLineItems((prev) =>
      prev.map((li) => (li.key === key ? { ...li, quantity: Math.max(1, quantity) } : li))
    ), []);

  const autoToBeCollected = suggestedToBeCollected(lineItems, shippingFees, downPayment);
  const toBeCollected = toBeCollectedTouched ? toBeCollectedInput : String(autoToBeCollected);

  const setToBeCollected = useCallback((value: string) => {
    setToBeCollectedTouched(true);
    setToBeCollectedInput(value);
  }, []);

  const totals: OrderTotals = useMemo(
    () => ({
      itemsTotal: itemsTotal(lineItems),
      shippingFees: toNumber(shippingFees),
      downPayment: toNumber(downPayment),
      toBeCollected: toNumber(toBeCollected),
    }),
    [lineItems, shippingFees, downPayment, toBeCollected]
  );

  const isValid =
    !!customer.firstName.trim() && !!customer.phone.trim() && lineItems.length > 0;

  // Keep submit stable so typing does not invalidate the memoized header and
  // summary. The ref always points at the latest form snapshot.
  const submitSnapshotRef = useRef({
    customer, lineItems, orderDate, expectedDeliveryDate, paymentStatus,
    deliveryBy, downPayment, shippingFees, toBeCollected, isValid,
  });
  submitSnapshotRef.current = {
    customer, lineItems, orderDate, expectedDeliveryDate, paymentStatus,
    deliveryBy, downPayment, shippingFees, toBeCollected, isValid,
  };
  const isSubmittingRef = useRef(mutation.isPending);
  isSubmittingRef.current = mutation.isPending;

  const submit = useCallback(() => {
    const current = submitSnapshotRef.current;
    if (!current.isValid || isSubmittingRef.current) return;
    const payload = buildOrderPayload({
      customer: current.customer,
      lineItems: current.lineItems,
      orderDate: current.orderDate,
      expectedDeliveryDate: current.expectedDeliveryDate,
      paymentStatus: current.paymentStatus,
      deliveryBy: current.deliveryBy,
      downPayment: current.downPayment,
      shippingFees: current.shippingFees,
      toBeCollected: current.toBeCollected,
    });
    mutation.mutate(payload, { onSuccess: () => navigate("/orders") });
  }, [mutation.mutate, navigate]);

  return {
    customer,
    setCustomerField,
    lineItems,
    addLineItem,
    removeLineItem,
    setLineItemQuantity,
    orderDate,
    setOrderDate,
    expectedDeliveryDate,
    setExpectedDeliveryDate,
    paymentStatus,
    setPaymentStatus,
    deliveryBy,
    setDeliveryBy,
    downPayment,
    setDownPayment,
    shippingFees,
    setShippingFees,
    toBeCollected,
    setToBeCollected,
    totals,
    isValid,
    submit,
    isSubmitting: mutation.isPending,
  };
}
