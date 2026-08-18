/**
 * إصدار فاتورة للطلب قبل حفظه: يختار المستخدم الأصناف المراد إدراجها ثم يُصدَّر
 * نفس مستند فاتورة الطلب كـ PDF. لا يمسّ هذا الحوار حالة الطلب ولا يرسل أي طلب للـ API.
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Typography,
} from "@mui/material";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import OrderInvoiceDocument from "layouts/Orders/orderInvoice/OrderInvoiceDocument";
import { downloadOrderInvoicePdf } from "layouts/Orders/utils/invoicePdf";
import { buildDraftInvoiceModel } from "../draftInvoiceAdapter";
import type { OrderCreateFormState } from "../types";
import { formatMoney, toNumber } from "../utils";

interface Props {
  open: boolean;
  onClose: () => void;
  form: OrderCreateFormState;
}

export default function DraftInvoiceDialog({ open, onClose, form }: Props) {
  const invoiceRef = useRef<HTMLDivElement | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  // كل فتح للحوار يبدأ بكل الأصناف مُحدَّدة (الحالة الشائعة: فاتورة الطلب كاملاً)
  useEffect(() => {
    if (!open) return;
    setSelectedKeys(form.lineItems.map((item) => item.key));
  }, [open, form.lineItems]);

  const model = useMemo(() => buildDraftInvoiceModel(form, selectedKeys), [form, selectedKeys]);

  const toggle = (key: string) => {
    setSelectedKeys((keys) =>
      keys.includes(key) ? keys.filter((k) => k !== key) : [...keys, key]
    );
  };

  const handleExport = async () => {
    if (!invoiceRef.current || selectedKeys.length === 0) return;
    setIsExporting(true);
    try {
      await downloadOrderInvoicePdf(invoiceRef.current, "فاتورة-طلب-جديد");
      NotificationMeassage("success", "تم تحميل الفاتورة");
    } catch (e) {
      console.error(e);
      NotificationMeassage("error", "تعذر تصدير الفاتورة");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      {/* المستند يُرسم خارج الشاشة ليلتقطه html2pdf */}
      {open && (
        <div
          aria-hidden
          style={{
            position: "fixed",
            left: "-10000px",
            top: 0,
            width: 800,
            zIndex: -1,
            pointerEvents: "none",
            overflow: "hidden",
            background: "#fff",
          }}
        >
          <OrderInvoiceDocument ref={invoiceRef} orderDetails={model} />
        </div>
      )}

      <Dialog open={open} onClose={isExporting ? undefined : onClose} dir="rtl" fullWidth maxWidth="xs">
        <DialogTitle>إصدار فاتورة قبل الحفظ</DialogTitle>
        <DialogContent dividers>
          {form.lineItems.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              أضف أصنافاً للطلب أولاً.
            </Typography>
          ) : (
            <>
              <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                اختر الأصناف التي تريد إدراجها في الفاتورة
              </Typography>
              {form.lineItems.map((item) => (
                <Box key={item.key} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedKeys.includes(item.key)}
                        onChange={() => toggle(item.key)}
                      />
                    }
                    label={
                      <Typography variant="body2">
                        {item.title} × {toNumber(item.quantity) || 1}
                      </Typography>
                    }
                  />
                  <Typography variant="body2" fontWeight={700}>
                    {formatMoney(toNumber(item.price) * (toNumber(item.quantity) || 1))} ج.م
                  </Typography>
                </Box>
              ))}
              <Box sx={{ mt: 1.5, display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" fontWeight={700}>
                  إجمالي الفاتورة
                </Typography>
                <Typography variant="body2" fontWeight={800}>
                  {formatMoney(model.toBeCollected)} ج.م
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isExporting}>
            إغلاق
          </Button>
          <Button
            variant="contained"
            onClick={handleExport}
            disabled={isExporting || selectedKeys.length === 0}
            sx={{ color: "#fff" }}
          >
            {isExporting ? "جارٍ التصدير..." : "تحميل الفاتورة"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
