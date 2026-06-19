import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { orderKeys } from "query/keys";

const baseURI = `${process.env.REACT_APP_API_URL}`;

export interface NewOrderLineItem {
  title: string;
  price: number;
  quantity: number;
  variant_id: number | string;
}

/** POST /orders — manual order creation payload (matches the create-order form). */
export interface NewOrderPayload {
  customer: {
    first_name: string;
    last_name: string;
    phone: string;
  };
  line_items: NewOrderLineItem[];
  orderDate?: string;
  paymentStatus: number;
  deliveryBy: number;
  expectedDeliveryDate?: string;
  downPayment: number;
  shippingFees: number;
  toBeCollected: number;
}

export async function createOrder(body: NewOrderPayload) {
  const { data } = await axiosRequest.post(`${baseURI}/orders`, body);
  return data;
}

export function useCreateOrderFormMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: NewOrderPayload) => createOrder(body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: orderKeys.all() });
      NotificationMeassage("success", "تم إنشاء الطلب بنجاح");
    },
    onError: () => {
      NotificationMeassage("error", "حدث خطأ أثناء إنشاء الطلب");
    },
  });
}
