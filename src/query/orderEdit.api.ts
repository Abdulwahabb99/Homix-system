import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { orderKeys } from "query/keys";
import { normalizeOrderDetailPayload } from "layouts/Orders/orderDetail/orderDetailNormalize";

const baseURI = `${process.env.REACT_APP_API_URL}`;

/** PUT /orders/{orderId} — شكل الباك الحالي */
export type UpdateOrderPayload = {
  customerId: number;
  /** 1..3 — حالة التأخير، حقل مستقل عن حالة التصنيع */
  deliveryStatus?: number;
  downPayment?: number;
  expectedDeliveryDate: string;
  manufactureStatus: number;
  paymentStatus: number;
  /** 1..3 — أولوية الطلب */
  priority?: number;
  shippingFees?: number;
  status: number;
  /** الباك إند يعيد حساب totalPrice و toBeCollected من هذه القيمة */
  totalDiscounts?: number;
  totalPrice: number;
};

export async function fetchOrderDetailNormalized(orderId: string) {
  const { data: res } = await axiosRequest.get(`${baseURI}/orders/${orderId}`);
  return normalizeOrderDetailPayload(res);
}

export function useOrderDetailQuery(orderId: string | undefined) {
  return useQuery({
    queryKey: orderId ? orderKeys.detail(orderId) : ["orders", "detail", "pending"],
    queryFn: () => fetchOrderDetailNormalized(orderId!),
    enabled: Boolean(orderId),
  });
}

export async function putOrder(orderId: string, body: UpdateOrderPayload) {
  await axiosRequest.put(`${baseURI}/orders/${orderId}`, body);
}

export function useUpdateOrderMutation(orderId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateOrderPayload) => putOrder(orderId!, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId!) });
      await queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: orderKeys.all() });
      NotificationMeassage("success", "تم تعديل الطلب");
    },
    onError: () => {
      NotificationMeassage("error", "حدث خطأ أثناء حفظ التعديلات");
    },
  });
}
