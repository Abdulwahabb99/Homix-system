/**
 * خلية مبلغ في جدول التقرير الحي: تعرض القيمة المركّبة من الفاتورة وتسمح بتعديلها مباشرة
 * (غرامة / مستحق البائع / المستحق لهوميكس) عبر نفس خلية الأرشيف. القواعد في `liveEditState`.
 */
import React from "react";
import type { LineOverridePatch } from "query/financialInvoices";
import { money } from "../utils/calc";
import EditableAmountCell from "../invoices/EditableAmountCell";
import { isCostMissing, liveEditState, type LiveField } from "../utils/liveOverlay";
import type { SettlementOrder, SettlementSeller } from "../utils/types";
import type { Tone } from "../utils/styles";
import { FineCell, Money } from "./SettlementCells";
import { useLiveInvoice } from "./LiveInvoice";

const VALUE_OF: Record<LiveField, (order: SettlementOrder) => number> = {
  collectionOverride: (order) => order.collectionTotal,
  companyDueOverride: (order) => order.companyDue,
  finesOverride: (order) => order.fines,
  vendorDueOverride: (order) => order.vendorDue,
  warehouseCostOverride: (order) => order.warehouseCost,
  vendorShippingCostOverride: (order) => order.vendorShippingCost,
};
const ORIGINAL_OF: Record<LiveField, (order: SettlementOrder) => number | undefined> = {
  collectionOverride: (order) => order.invoiceLine?.originalCollection,
  warehouseCostOverride: (order) => order.invoiceLine?.originalWarehouseCost,
  vendorShippingCostOverride: (order) => order.invoiceLine?.originalVendorShippingCost,
  companyDueOverride: (order) => order.invoiceLine?.originalCompanyDue,
  finesOverride: (order) => order.invoiceLine?.originalFines,
  vendorDueOverride: (order) => order.invoiceLine?.originalVendorDue,
};

export default function LiveAmountCell({ seller, order, field, tone, bold }: {
  seller: SettlementSeller; order: SettlementOrder; field: LiveField; tone?: Tone; bold?: boolean;
}) {
  const ctx = useLiveInvoice();
  const value = VALUE_OF[field](order);
  const display = field === "finesOverride" ? <FineCell value={value} /> : <Money value={value} tone={tone} bold={bold} />;
  const info = order.invoiceLine;
  const overridden = Boolean(info && info[field] != null);
  const state = liveEditState(seller, order, ctx);

  const original = ORIGINAL_OF[field](order);
  const overriddenTitle = overridden
    ? ["معدّل على الفاتورة", original !== undefined ? `الأصل ${money(original)}` : null, info?.reason ? `السبب: ${info.reason}` : null].filter(Boolean).join(" — ")
    : undefined;

  const save = (patch: LineOverridePatch) => ctx.saveLine({
    invoiceId: seller.invoice?.id ?? null, orderId: order.orderId, patch, vendorId: seller.row.vendorId,
  });

  // cost missing => the vendor-due number is not to be trusted silently
  const warn = (field === "warehouseCostOverride" || field === "vendorDueOverride") && isCostMissing(order) && info?.warehouseCostOverride == null;

  const cell = (
    <EditableAmountCell
      value={value}
      display={display}
      editable={state.editable}
      disabledReason={state.reason}
      overridden={overridden}
      overriddenTitle={overriddenTitle}
      busy={ctx.saving}
      onCommit={(next) => save({ [field]: next })}
      onReset={state.editable && overridden ? () => save({ [field]: null }) : undefined}
    />
  );
  return warn ? <>{cell}<CostWarning /></> : cell;
}

/** تحذير «التكلفة غير مسجلة» */
export function CostWarning() {
  return <span title="التكلفة غير مسجلة" aria-label="التكلفة غير مسجلة" style={{ marginInlineStart: 4, color: "#b45309", cursor: "help" }}>⚠</span>;
}

/** وسم الطلب غير المحسوب في الفاتورة (للموظفين) — يوضع بجانب رقم الطلب */
export function LineStateTag({ order }: { order: SettlementOrder }) {
  const state = order.invoiceLine?.state;
  if (!state || state === "included") return null;
  const label = { deferred: "محوّل للفاتورة الجاية", frozen: "مجمّد", missing: "غير مضمّن بالفاتورة", removed: "محذوف" }[state];
  return <span title={order.invoiceLine?.reason || undefined} style={{ marginInlineStart: 6, fontSize: 10.5, fontWeight: 700, color: "#92400e" }}>{label} — غير محسوب</span>;
}
