import type { GroupedShipmentItem } from "query/shipmentGrouped";

/** يفصل أصناف المجموعة إلى محتسبة وملغية/مرفوضة (الأخيرة لا تدخل في اكتمال المجموعة). */
export function splitGroupedItems(items: GroupedShipmentItem[]) {
  const counted = items.filter((i) => !i.excluded);
  const excluded = items.filter((i) => i.excluded);
  const arrived = counted.filter((i) => i.inWarehouse).length;
  return {
    counted,
    excluded,
    arrived,
    complete: counted.length > 0 && arrived === counted.length,
  };
}
