import { getLinkedOrderIds, linkedOrdersToastMessage } from "shared/groupedShipment/linkedOrders";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { orderKeys, shipmentKeys } from "query/keys";
import {
  getRegressionAwareErrorMessage,
  isRegressionCancelled,
  withConfirmRegression,
} from "shared/regressionConfirm";
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

/** يعيد معرّفات الطلبات المرتبطة التي تغيّر نوع شحنتها معه («توصيل مجمع»)، أو قائمة فارغة. */
export async function putOrder(orderId: string, body: UpdateOrderPayload, confirmRegression = false): Promise<number[]> {
  const response = await axiosRequest.put(`${baseURI}/orders/${orderId}`, withConfirmRegression(body, confirmRegression));
  return getLinkedOrderIds(response?.data);
}

/** `confirmable` من useRegressionConfirm: يعالج 409 ويعيد الإرسال بعد التأكيد. */
type Confirmable = <T>(send: (confirm: boolean) => Promise<T>) => Promise<T>;

export function useUpdateOrderMutation(orderId: string | undefined, confirmable?: Confirmable) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateOrderPayload) =>
      confirmable
        ? confirmable((confirm) => putOrder(orderId!, body, confirm))
        : putOrder(orderId!, body),
    onSuccess: async (linkedOrderIds) => {
      await queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId!) });
      await queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: orderKeys.all() });
      /* حالة الطلب/التأكيد تحرّك حالة الشحنة في الباك إند. */
      await queryClient.invalidateQueries({ queryKey: shipmentKeys.all() });
      NotificationMeassage("success", "تم تعديل الطلب");
      const linkedMessage = linkedOrdersToastMessage(linkedOrderIds?.length ?? 0);
      if (linkedMessage) NotificationMeassage("info", linkedMessage);
    },
    onError: (error) => {
      if (isRegressionCancelled(error)) return;
      NotificationMeassage(
        "error",
        getRegressionAwareErrorMessage(error, "حدث خطأ أثناء حفظ التعديلات")
      );
    },
  });
}
