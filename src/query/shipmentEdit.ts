import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { shipmentKeys } from "./keys";

/** PUT /shipments/{shipmentId} — partial update of the editable shipment fields. */
export interface UpdateShipmentCustomer {
  first_name: string;
  last_name: string;
  phone: string;
}

export interface UpdateShipmentPayload {
  shipmentStatus?: number;
  shipmentType?: string;
  governorate?: string;
  deliveryBy?: number;
  scheduleStatus?: number;
  shippingCompany?: number | string;
  shippingFees?: number;
  shippedFromInventory?: boolean;
  shippingReceiveDate?: string;
  expectedDeliveryDate?: string;
  deliveryDate?: string;
  paymentStatus?: number;
  downPayment?: number;
  receivedAmount?: number;
  toBeCollected?: number;
  notes?: string;
  customer?: UpdateShipmentCustomer;
}

export async function putShipment(shipmentId: string, body: UpdateShipmentPayload) {
  await axiosRequest.put(`/shipments/${shipmentId}`, body);
}

export function useUpdateShipmentMutation(shipmentId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateShipmentPayload) => putShipment(shipmentId!, body),
    onSuccess: async () => {
      if (shipmentId) {
        await queryClient.invalidateQueries({ queryKey: shipmentKeys.detail(shipmentId) });
      }
      await queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
      /* تعديل شحنة يمسّ القائمة والملخّص والتفاصيل، وقد ينقلها من/إلى المرتجعات
         عند تغيير الحالة — لكنه لا يمسّ المخزون أو الحسابات أو التقارير. */
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: shipmentKeys.summariesRoot() }),
        queryClient.invalidateQueries({ queryKey: shipmentKeys.returnsRoot() }),
        queryClient.invalidateQueries({ queryKey: shipmentKeys.meta() }),
      ]);
      NotificationMeassage("success", "تم تعديل الشحنة");
    },
    onError: () => {
      NotificationMeassage("error", "حدث خطأ أثناء حفظ التعديلات");
    },
  });
}
