/**
 * تراكب فواتير الدورة على التقرير الحي — دوال نقية.
 *
 * التقرير الحي يعرض كل طلبات الدورة كما هي في قاعدة البيانات؛ أما الفاتورة (إن صدرت) فهي لقطة
 * فيها تعديلات (غرامات/مستحقات) وبنود غير محسوبة (مجمّدة/محوّلة/محذوفة) وبنود من دورات أخرى.
 * هنا نركّب لقطة الفاتورة فوق الصفوف الحية كي لا يختلف الحي عن الأرشيف لنفس الدورة،
 * ثم نعيد حساب مجاميع الصانع والمؤشرات من الأرقام المعروضة فعلاً.
 */
import type { CycleOverlayLine, CycleOverview } from "query/financialInvoices";
import type { FinancialKpis, LiveLineInfo, LiveLineState, SettlementOrder, SettlementSeller, SettlementTabKey, VendorRow } from "./types";
import { pct } from "./calc";
import { companyDueKindOf } from "./companyDue";

/** billing = دورة فوترة (مغلقة أو جارية — لكليهما مسودات)، custom = فترة مخصصة بلا فواتير */
export type LiveCycleState = "billing" | "custom";
export type LiveField = "finesOverride" | "vendorDueOverride" | "companyDueOverride" | "warehouseCostOverride" | "collectionOverride" | "vendorShippingCostOverride";

const round2 = (value: number): number => Math.round((Number(value) || 0) * 100) / 100;

/** هل يُحسب هذا الطلب في الفاتورة (أو لا فاتورة أصلاً)؟ */
export const isCounted = (order: SettlementOrder): boolean => !order.invoiceLine || order.invoiceLine.state === "included";

const infoOf = (line: CycleOverlayLine): LiveLineInfo => ({
  collectionOverride: line.collectionOverride ?? null,
  companyDueOverride: line.companyDueOverride ?? null,
  finesOverride: line.finesOverride ?? null,
  invoiceId: line.invoiceId,
  lineId: line.id,
  originalCollection: line.originalCollection,
  originalCompanyDue: line.originalCompanyDue,
  originalFines: line.originalFines,
  originalVendorShippingCost: line.originalVendorShippingCost,
  originalVendorDue: line.originalVendorDue,
  originalWarehouseCost: line.originalWarehouseCost,
  reason: line.overrideReason ?? line.stateReason ?? null,
  state: line.state,
  vendorDueOverride: line.vendorDueOverride ?? null,
  vendorShippingCostOverride: line.vendorShippingCostOverride ?? null,
  warehouseCostOverride: line.warehouseCostOverride ?? null,
});

const blankInfo = (invoiceId: number, state: LiveLineState): LiveLineInfo => ({
  collectionOverride: null, companyDueOverride: null, finesOverride: null, invoiceId, lineId: null, state, vendorDueOverride: null, vendorShippingCostOverride: null, warehouseCostOverride: null,
});

/** سعر التكلفة غير مسجّل (0) — رقم مستحق الصانع لا يُعتمد عليه بصمت */
export const isCostMissing = (order: Pick<SettlementOrder, "warehouseCost">): boolean => !(Number(order.warehouseCost) > 0);

function orderFromLine(line: CycleOverlayLine): SettlementOrder {
  return {
    collectionTotal: line.collectionTotal,
    companyDue: line.companyDue,
    companyDueKind: line.companyDueKind,
    fines: line.fines,
    id: line.orderId,
    invoiceLine: infoOf(line),
    operationNumber: line.operationNumber,
    orderId: line.orderId,
    orderNumber: line.orderNumber,
    paymentStatus: line.paymentStatus,
    paymentStatusLabel: line.paymentStatusLabel,
    productCode: line.productCode,
    productId: null,
    shipmentId: line.isWarehouseDelivery ? line.orderId : null,
    vendorDue: line.vendorDue,
    vendorShippingCost: line.vendorShippingCost,
    warehouseCost: line.warehouseCost,
  };
}

/** مجاميع الصانع من الطلبات المحسوبة فقط (نفس جمع الـ BE لكل قسم) */
export function recomputeRow(row: VendorRow, orders: SettlementOrder[]): VendorRow {
  const counted = orders.filter(isCounted);
  const sum = (pick: (order: SettlementOrder) => number) => round2(counted.reduce((total, order) => total + (Number(pick(order)) || 0), 0));
  return {
    ...row,
    collectionTotal: sum((o) => o.collectionTotal),
    companyDue: sum((o) => o.companyDue),
    homixMargin: sum((o) => (companyDueKindOf(o) === "margin" ? o.companyDue : 0)),
    vendorOwes: sum((o) => (companyDueKindOf(o) === "vendorOwes" ? o.companyDue : 0)),
    fines: sum((o) => o.fines),
    orders,
    ordersCount: counted.length,
    vendorDue: sum((o) => o.vendorDue),
    warehouseCost: sum((o) => o.warehouseCost),
  };
}

const extraBelongsToTab = (tab: SettlementTabKey, line: CycleOverlayLine): boolean =>
  tab === "comprehensive" || (tab === "warehouse" ? line.isWarehouseDelivery : !line.isWarehouseDelivery);

function overlaySeller(tab: SettlementTabKey, seller: SettlementSeller, overview: CycleOverview, isVendor: boolean): SettlementSeller {
  const invoice = overview.invoices.find((item) => item.vendorId === seller.row.vendorId) ?? null;
  if (!invoice) return { ...seller, invoice: null };

  const lines = overview.lines.filter((line) => line.invoiceId === invoice.id);
  const byOrder = new Map<number, CycleOverlayLine>(lines.map((line) => [line.orderId, line]));
  const included = new Set<number>(overview.includedOrderIds[String(invoice.id)] ?? []);
  let changed = false;

  const orders: SettlementOrder[] = [];
  for (const order of seller.row.orders) {
    const line = byOrder.get(order.orderId);
    let state: LiveLineState;
    let info: LiveLineInfo;
    if (line) {
      info = infoOf(line);
      state = line.state;
    } else if (included.has(order.orderId)) {
      state = "included";
      info = blankInfo(invoice.id, state);
    } else {
      state = "missing";
      info = blankInfo(invoice.id, state);
    }
    if (state !== "included") {
      changed = true;
      // البائع يرى ما في الفاتورة فقط — لا يرى الطلبات المجمّدة/المؤجلة/غير المضمّنة
      if (isVendor) continue;
      orders.push({ ...order, invoiceLine: info });
      continue;
    }
    if (line) {
      changed = true;
      // القيم الفعّالة (تعديل ← حساب الفاتورة) كما يعرضها الأرشيف
      orders.push({
        ...order,
        // cost / collection only follow the invoice when they were overridden there (the live row keeps the report's own basis otherwise)
        collectionTotal: line.collectionOverride != null ? line.collectionTotal : order.collectionTotal,
        companyDue: line.companyDue, fines: line.fines, invoiceLine: info, vendorDue: line.vendorDue,
        // vendor shipping likewise: only an override replaces the report's own value
        vendorShippingCost: line.vendorShippingCostOverride != null ? line.vendorShippingCost : order.vendorShippingCost,
        warehouseCost: line.warehouseCostOverride != null ? line.warehouseCost : order.warehouseCost,
      });
    } else {
      orders.push({ ...order, invoiceLine: info });
    }
  }

  // بنود محسوبة في الفاتورة وطلباتها خارج نافذة الدورة (طلب مؤجَّل التُقط، أو أُضيف يدوياً)
  const present = new Set(orders.map((order) => order.orderId));
  for (const line of lines) {
    if (!line.outsideCycle || line.state !== "included" || present.has(line.orderId) || !extraBelongsToTab(tab, line)) continue;
    changed = true;
    orders.push(orderFromLine(line));
  }

  return { ...seller, invoice, row: changed ? recomputeRow(seller.row, orders) : seller.row };
}

export function overlaySections(
  sections: Record<SettlementTabKey, SettlementSeller[]>,
  overview: CycleOverview | undefined,
  isVendor: boolean,
): Record<SettlementTabKey, SettlementSeller[]> {
  if (!overview) return sections;
  const apply = (tab: SettlementTabKey) => sections[tab].map((seller) => overlaySeller(tab, seller, overview, isVendor));
  return { comprehensive: apply("comprehensive"), seller: apply("seller"), warehouse: apply("warehouse") };
}

const sumRows = (sellers: SettlementSeller[], pick: (row: VendorRow) => number) => sellers.reduce((total, seller) => total + (Number(pick(seller.row)) || 0), 0);

/** مؤشرات الأعلى بعد التراكب = المؤشر الأصلي + فرق مجاميع الفاتورة الشاملة قبل/بعد (لا نعيد بناءها من الصفر) */
export function overlayKpis(
  kpis: FinancialKpis,
  before: SettlementSeller[],
  after: SettlementSeller[],
): FinancialKpis {
  if (before === after) return kpis;
  const delta = (pick: (row: VendorRow) => number) => sumRows(after, pick) - sumRows(before, pick);
  const totalSales = round2(kpis.totalSales + delta((r) => r.collectionTotal));
  const totalDueSeller = round2(kpis.totalDueSeller + delta((r) => r.vendorDue));
  const totalDueComp = round2(kpis.totalDueComp + delta((r) => r.companyDue));
  const totalHomixMargin = round2(kpis.totalHomixMargin + delta((r) => r.homixMargin));
  const totalVendorOwes = round2(kpis.totalVendorOwes + delta((r) => r.vendorOwes));
  return {
    ...kpis,
    dueCompPct: pct(totalDueComp, totalSales),
    dueSellerPct: pct(totalDueSeller, totalSales),
    lateSellersCount: after.filter((seller) => seller.row.fines > 0).length,
    ordersCount: kpis.ordersCount + delta((r) => r.ordersCount),
    totalDueComp,
    totalHomixMargin,
    totalVendorOwes,
    totalDueSeller,
    totalFine: round2(kpis.totalFine + delta((r) => r.fines)),
    totalSales,
  };
}

/** نسخة الصانع للطباعة: الطلبات المحسوبة فقط وبمجاميعها المعروضة */
export function forPrint(seller: SettlementSeller): SettlementSeller {
  const counted = seller.row.orders.filter(isCounted);
  return counted.length === seller.row.orders.length ? seller : { ...seller, row: recomputeRow(seller.row, counted) };
}

export interface LiveEditContext {
  cycleState: LiveCycleState;
  canSettle: boolean;
  isVendor: boolean;
  /** حالة تحميل فواتير الدورة — لا نسمح بالتعديل قبل معرفة الحالة الحقيقية */
  invoicesState: "idle" | "loading" | "error" | "ready";
}

export interface LiveEditState {
  editable: boolean;
  /** سبب القراءة فقط (تلميح الخلية) — فارغ إن لم يكن هناك ما يُقال (بائع/بدون صلاحية) */
  reason?: string;
}

/** هل تُعدَّل خلية هذا الطلب الآن؟ الخادم يظل الحَكَم النهائي */
export function liveEditState(seller: SettlementSeller, order: SettlementOrder, ctx: LiveEditContext): LiveEditState {
  if (ctx.isVendor || !ctx.canSettle) return { editable: false };
  if (ctx.cycleState === "custom") return { editable: false, reason: "فترة مخصصة — التعديل متاح على دورة فوترة فقط" };
  if (ctx.invoicesState === "loading") return { editable: false, reason: "جارٍ تحميل حالة الفواتير..." };
  if (ctx.invoicesState !== "ready") return { editable: false, reason: "تعذّر تحميل حالة الفواتير" };
  const invoice = seller.invoice;
  if (invoice) {
    if (invoice.status !== "draft") {
      return {
        editable: false,
        reason: invoice.status === "reviewed"
          ? "الفاتورة تمت مراجعتها — استرجعها لمسودة للتعديل"
          : `الفاتورة ${invoice.statusLabel} — أرجعها إلى «معلّقة» أولاً للتعديل`,
      };
    }
    const state = order.invoiceLine?.state;
    if (state && state !== "included" && state !== "missing") return { editable: false, reason: "الطلب غير محسوب في الفاتورة" };
  }
  return { editable: true };
}
