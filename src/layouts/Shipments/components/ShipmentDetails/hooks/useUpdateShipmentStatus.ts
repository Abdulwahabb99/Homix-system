import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axiosRequest from "shared/functions/axiosRequest";
import { shipmentKeys } from "query/keys";
import type { ShipmentDetailInfo } from "query/shipmentDetail";

/**
 * Manages the "تحديث الحالة" card: holds the locally-selected status and
 * persists it via `PUT /shipments/{id}`, then refreshes the detail + list caches.
 */
export function useUpdateShipmentStatus(shipmentDetailId: string, shipment: ShipmentDetailInfo) {
  const queryClient = useQueryClient();
  const [statusValue, setStatusValue] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const currentStatus = statusValue !== "" ? Number(statusValue) : shipment.shipmentStatus;

  const save = () => {
    const body = {
      shipmentStatus: currentStatus,
      shipmentType: shipment.shipmentType,
      governorate: shipment.governorate,
      shippingCompany: shipment.shippingCompany,
      shippingFees: shipment.shippingCost,
      shippingReceiveDate: shipment.receivedInWarehouseDate,
      deliveryDate: shipment.deliveryDate,
    };
    setSaving(true);
    axiosRequest
      .put(`/shipments/${shipment.id}`, body)
      .then(() => {
        setSaved(true);
        queryClient.invalidateQueries({ queryKey: shipmentKeys.detail(shipmentDetailId) });
        queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
        setTimeout(() => setSaved(false), 2000);
      })
      .catch(() => toast.error("تعذّر حفظ التغييرات"))
      .finally(() => setSaving(false));
  };

  return { statusValue, setStatusValue, currentStatus, saving, saved, save };
}
