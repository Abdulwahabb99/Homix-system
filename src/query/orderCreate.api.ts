import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { orderKeys } from "query/keys";

const baseURI = `${process.env.REACT_APP_API_URL}`;

/** POST /orders — نفس الحقول المرسلة من نموذج إضافة الطلب */
export type CreateOrderPayload = {
  total_discounts: number;
  total_line_items_price: number;
  total_price: number;
  total_tax: number;
  customer: {
    firstName: string;
    lastName: string;
    country: string;
    province: string;
    city: string;
    phone: string;
    address: string;
    email: string;
  };
  line_items: Array<{
    title: string;
    name: string;
    price: number;
    product_id: number | string;
    quantity: number;
    variant_id: number | string;
    sku: string;
    total_discount: string;
    discount_allocations: unknown[];
    shipping_lines: Array<{ price: number | string }>;
  }>;
  userType: string | number;
  commission: string | number;
  downPayment: string | number;
  shippingFees: string | number;
  toBeCollected: string | number;
  status: string | number;
  paymentStatus: string | number;
  userId: string | number;
};

export async function createOrder(body: CreateOrderPayload) {
  const { data } = await axiosRequest.post(`${baseURI}/orders`, body);
  return data;
}

export function useCreateOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateOrderPayload) => createOrder(body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: orderKeys.all() });
      NotificationMeassage("success", "تم اضافه الطلب بنجاح");
    },
    onError: () => {
      NotificationMeassage("error", "حدث خطأ");
    },
  });
}
