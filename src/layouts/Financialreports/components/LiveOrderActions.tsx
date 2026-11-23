/**
 * إجراءات الطلب على الصف الحي: قائمة ⋮ لكل طلب (تجميد / حذف / تحويل لدورة أخرى …) وزر «إضافة طلب» في ترويسة الصانع.
 * لا حاجة لمسودة موجودة: الخادم يُنشئها بنفس الطلب (معاملة واحدة) ثم يطبّق الإجراء، ثم نحدّث التقرير الحي.
 * لا تظهر للبائع ولا لمن بلا finance_settle ولا على الفواتير المقفلة.
 */
import React, { useState } from "react";
import { Box, Dialog, DialogContent, DialogTitle, Menu, MenuItem } from "@mui/material";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { useLiveAddOrder, useLiveLineAction, useLiveOrderCandidates } from "query/financialInvoices";
import { btnGhostSx, btnPrimarySx, inputSx } from "../invoices/shared";
import { LIVE_ADD_ORDER_EXISTS_TOAST, LIVE_ADD_ORDER_TOAST, liveActionToast, liveActionsAvailability, liveActionsFor, type LiveActionItem } from "../utils/liveActions";
import type { SettlementOrder, SettlementSeller } from "../utils/types";
import { useLiveInvoice } from "./LiveInvoice";

/** قائمة ⋮ لطلب واحد في جدول التفاصيل */
export function LiveOrderMenu({ seller, order }: { seller: SettlementSeller; order: SettlementOrder }) {
  const ctx = useLiveInvoice();
  const act = useLiveLineAction();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const availability = liveActionsAvailability(seller, ctx);
  const items = liveActionsFor(order.invoiceLine?.state);
  const vendorId = Number(seller.row.vendorId);
  if (!availability.visible || !availability.enabled || items.length === 0 || !ctx.cycleEndDay || !vendorId) return null;

  const run = (item: LiveActionItem) => {
    setAnchor(null);
    if (item.confirm && !window.confirm(`حذف الطلب #${order.orderNumber || order.orderId} من الفاتورة؟ لن يُحتسب هنا ولن يرجع لأي فاتورة جاية.`)) return;
    let reason: string | undefined;
    if (item.askReason) {
      const input = window.prompt("السبب (اختياري):", "");
      if (input === null) return;
      reason = input.trim() || undefined;
    }
    act.mutate(
      { action: item.action, billingDay: ctx.billingDay, cycleEndDay: ctx.cycleEndDay as string, orderId: Number(order.orderId), reason, vendorId },
      { onSuccess: () => NotificationMeassage("success", liveActionToast(item.action)) },
    );
  };

  return (
    <>
      <Box component="button" type="button" aria-label="قائمة الطلب" title="إجراءات الطلب" disabled={act.isPending || ctx.saving}
        onClick={(e: React.MouseEvent<HTMLElement>) => { e.stopPropagation(); setAnchor(e.currentTarget); }}
        sx={{ ...btnGhostSx, height: 26, px: "8px", opacity: act.isPending ? 0.5 : 1 }}>⋮</Box>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        {items.map((item) => (
          <MenuItem key={item.action} onClick={() => run(item)} sx={{ fontSize: "12px", color: item.danger ? HX.red : HX.tx, minWidth: 170 }}>{item.label}</MenuItem>
        ))}
      </Menu>
    </>
  );
}

/** زر «إضافة طلب» + منتقي الطلبات في ترويسة قسم الصانع */
export function LiveAddOrderButton({ seller }: { seller: SettlementSeller }) {
  const ctx = useLiveInvoice();
  const add = useLiveAddOrder();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const vendorId = Number(seller.row.vendorId);
  const candidates = useLiveOrderCandidates(open && vendorId ? vendorId : null, query);
  const availability = liveActionsAvailability(seller, ctx);
  if (!availability.visible || !ctx.cycleEndDay || !vendorId) return null;

  const close = () => { setOpen(false); setQuery(""); };
  const pick = (orderId: number) => add.mutate(
    { billingDay: ctx.billingDay, cycleEndDay: ctx.cycleEndDay as string, orderId, vendorId },
    { onSuccess: (res) => { NotificationMeassage("success", res.alreadyIncluded ? LIVE_ADD_ORDER_EXISTS_TOAST : LIVE_ADD_ORDER_TOAST); close(); } },
  );

  return (
    <>
      <Box component="button" type="button" disabled={!availability.enabled} title={availability.reason || "إضافة طلب مسلّم لهذا الصانع للفاتورة"}
        onClick={() => setOpen(true)}
        sx={{ ...btnGhostSx, opacity: availability.enabled ? 1 : 0.55, cursor: availability.enabled ? "pointer" : "not-allowed" }}>إضافة طلب</Box>
      <Dialog open={open} onClose={close} fullWidth maxWidth="xs" dir="rtl">
        <DialogTitle sx={{ fontSize: "14px", fontWeight: 800 }}>إضافة طلب — {seller.name}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Box component="input" autoFocus placeholder="ابحث برقم العملية أو الطلب (طلبات مسلّمة لهذا الصانع غير مفوترة)" value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)} sx={inputSx} />
          {(candidates.data ?? []).map((c) => (
            <Box key={c.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12.5px" }}>
              <span>{c.code || `OP-${c.id}`} — #{c.orderNumber}</span>
              <Box component="button" type="button" disabled={add.isPending} onClick={() => pick(c.id)} sx={btnPrimarySx}>إضافة</Box>
            </Box>
          ))}
          {query.trim().length >= 2 && candidates.data?.length === 0 && <Box sx={{ fontSize: "12px", color: HX.tx3 }}>لا توجد نتائج.</Box>}
        </DialogContent>
      </Dialog>
    </>
  );
}
