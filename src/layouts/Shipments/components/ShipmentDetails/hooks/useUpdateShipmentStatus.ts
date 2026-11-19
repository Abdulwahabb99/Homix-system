import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axiosRequest from "shared/functions/axiosRequest";
import { orderKeys, shipmentKeys } from "query/keys";
import type { ShipmentDetailInfo } from "query/shipmentDetail";
import {
  getRegressionToastMessage,
  isRegressionCancelled,
  useRegressionConfirm,
  withConfirmRegression,
} from "shared/regressionConfirm";

/**
 * Manages the "تحديث الحالة" card: holds the locally-selected status and
 * persists it via `PUT /shipments/{id}`, then refreshes the detail + list caches.
 */
export function useUpdateShipmentStatus(shipmentDetailId: string, shipment: ShipmentDetailInfo) {
  const queryClient = useQueryClient();
  const { confirmable, dialogProps: regressionDialogProps } = useRegressionConfirm();
  const [statusValue, setStatusValue] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const currentStatus = statusValue !== "" ? Number(statusValue) : shipment.shipmentStatus;

  const save = () => {
    const body = {
      shipmentStatus: currentStatus,
      shipmentType: shipment.shipmentType,
      governorate: shipment.governorate,
      /* المعرّف فقط، وبلا null: القيمة الفارغة تمسح الشركة (قد تكون اسماً قديماً بلا معرّف). */
      ...(shipment.shippingCompany != null ? { shippingCompany: shipment.shippingCompany } : {}),
      shippingFees: shipment.shippingCost,
      shippingReceiveDate: shipment.receivedInWarehouseDate,
      deliveryDate: shipment.deliveryDate,
    };
    setSaving(true);
    confirmable((confirm) =>
      axiosRequest.put(`/shipments/${shipment.id}`, withConfirmRegression(body, confirm))
    )
      .then(() => {
        setSaved(true);
        queryClient.invalidateQueries({ queryKey: shipmentKeys.detail(shipmentDetailId) });
        queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
        queryClient.invalidateQueries({ queryKey: shipmentKeys.summariesRoot() });
        /* حالة الشحنة تحرّك حالة الطلب في الباك إند. */
        queryClient.invalidateQueries({ queryKey: orderKeys.all() });
        setTimeout(() => setSaved(false), 2000);
      })
      .catch((error) => {
        /* الإلغاء من نافذة التأكيد: ارجع للحالة المحفوظة بصمت. */
        if (isRegressionCancelled(error)) {
          setStatusValue("");
          return;
        }
        toast.error(getRegressionToastMessage(error, "تعذّر حفظ التغييرات") ?? "تعذّر حفظ التغييرات");
      })
      .finally(() => setSaving(false));
  };

  return { regressionDialogProps, statusValue, setStatusValue, currentStatus, saving, saved, save };
}
