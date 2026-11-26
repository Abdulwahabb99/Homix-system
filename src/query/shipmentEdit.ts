import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { orderKeys, shipmentKeys } from "./keys";
import { getLinkedOrderIds, linkedOrdersToastMessage } from "shared/groupedShipment/linkedOrders";
import { getRegressionToastMessage, withConfirmRegression } from "shared/regressionConfirm/regressionConfirm";

/** PUT /shipments/{shipmentId} — partial update of the editable shipment fields. */
export interface UpdateShipmentCustomer {
  first_name: string;
  last_name: string;
  phone: string;
}

export interface UpdateShipmentPayload {
  shipmentStatus?: number;
  /** سعر التكلفة — يُكتب على بنود الطلب ويُجمَع في `totalCost`. */
  costPrice?: number;
  shipmentType?: string;
  governorate?: string;
  deliveryBy?: number;
  scheduleStatus?: number | null;
  shippingCompany?: number | string | null;
  shippingFees?: number;
  shippingReceiveDate?: string;
  scheduledDeliveryDate?: string | null;
  deliveryDate?: string;
  paymentStatus?: number;
  downPayment?: number;
  receivedAmount?: number;
  toBeCollected?: number;
  notes?: string;
  customer?: UpdateShipmentCustomer;
}

/** يعيد معرّفات الطلبات المرتبطة التي تغيّر نوع شحنتها معه («توصيل مجمع»)، أو قائمة فارغة. */
export async function putShipment(shipmentId: string, body: UpdateShipmentPayload, confirmRegression = false): Promise<number[]> {
  const response = await axiosRequest.put(`/shipments/${shipmentId}`, withConfirmRegression(body, confirmRegression));
  return getLinkedOrderIds(response?.data);
}

function notifyLinkedOrders(linkedOrderIds: number[] | undefined) {
  const message = linkedOrdersToastMessage(linkedOrderIds?.length ?? 0);
  if (message) NotificationMeassage("info", message);
}

/**
 * PUT /shipments/bulk-update — تعديل حالة الشحنة/نوعها/المحافظة/التوصيل بواسطة/
 * المسؤول/موعد الجدولة وحالتها لعدة شحنات دفعة واحدة.
 */
export interface BulkUpdateShipmentPayload {
  shipmentStatus?: number;
  shipmentType?: string;
  governorate?: string;
  deliveryBy?: number;
  userId?: number;
  /** معرّف شركة الشحن */
  shippingCompany?: number | null;
  scheduleStatus?: number | null;
  /** ISO، أو `""` لمسح الموعد من كل الشحنات المحددة. */
  scheduledDeliveryDate?: string | "";
  /** تاريخ التسليم الفعلي: لحظة ISO لبداية اليوم المصري. يحدد دورة الفاتورة للشحنات المتسلّمة. */
  deliveryDate?: string;
}

export async function putShipmentsBulk(
  shipmentIds: number[],
  data: BulkUpdateShipmentPayload,
  confirmRegression = false
): Promise<number[]> {
  const response = await axiosRequest.put(`/shipments/bulk-update`, withConfirmRegression({ data, shipmentIds }, confirmRegression));
  return getLinkedOrderIds(response?.data);
}

export function useBulkUpdateShipmentsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: { shipmentIds: number[]; data: BulkUpdateShipmentPayload; confirmRegression?: boolean }) =>
      putShipmentsBulk(vars.shipmentIds, vars.data, vars.confirmRegression),
    onSuccess: async (linkedOrderIds) => {
      /* نفس ما يمسّه تعديل شحنة واحدة — القائمة والملخّص والمرتجعات (قد ينقل
         شحنة من/إلى المرتجعات عند تغيير الحالة) والـ meta. */
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: shipmentKeys.summariesRoot() }),
        queryClient.invalidateQueries({ queryKey: shipmentKeys.returnsRoot() }),
        queryClient.invalidateQueries({ queryKey: shipmentKeys.meta() }),
        /* حالة الشحنة تحرّك حالة الطلب (والتأكيد) في الباك إند — حدّث قوائم الطلبات أيضاً. */
        queryClient.invalidateQueries({ queryKey: orderKeys.all() }),
      ]);
      NotificationMeassage("success", "تم تعديل الشحنات المحددة");
      notifyLinkedOrders(linkedOrderIds);
    },
    onError: (error) => {
      const message = getRegressionToastMessage(error, "حدث خطأ أثناء التعديل الجماعي");
      if (message) NotificationMeassage("error", message);
    },
  });
}

export function useUpdateShipmentMutation(shipmentId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: UpdateShipmentPayload & { confirmRegression?: boolean }) => {
      const { confirmRegression, ...body } = vars;
      return putShipment(shipmentId!, body, confirmRegression);
    },
    onSuccess: async (linkedOrderIds) => {
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
        /* حالة الشحنة تحرّك حالة الطلب (والتأكيد) في الباك إند — حدّث قوائم الطلبات أيضاً. */
        queryClient.invalidateQueries({ queryKey: orderKeys.all() }),
      ]);
      NotificationMeassage("success", "تم تعديل الشحنة");
      notifyLinkedOrders(linkedOrderIds);
    },
    onError: (error) => {
      const message = getRegressionToastMessage(error, "حدث خطأ أثناء حفظ التعديلات");
      if (message) NotificationMeassage("error", message);
    },
  });
}

/** تعديل مباشر من الجدول — المعرّف يُمرَّر مع كل استدعاء (بخلاف النسخة أعلاه). */
export function useInlineUpdateShipmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: { id: number; body: UpdateShipmentPayload; confirmRegression?: boolean }) =>
      putShipment(String(vars.id), vars.body, vars.confirmRegression),
    onSuccess: async (linkedOrderIds, vars) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: shipmentKeys.detail(String(vars.id)) }),
        queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: shipmentKeys.summariesRoot() }),
        queryClient.invalidateQueries({ queryKey: shipmentKeys.returnsRoot() }),
        queryClient.invalidateQueries({ queryKey: orderKeys.all() }),
      ]);
      NotificationMeassage("success", "تم تعديل الشحنة");
      notifyLinkedOrders(linkedOrderIds);
    },
    onError: (error) => {
      const message = getRegressionToastMessage(error, "حدث خطأ أثناء حفظ التعديل");
      if (message) NotificationMeassage("error", message);
    },
  });
}
