import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { FONT } from "layouts/Orders/OrderCreate/constants";
import { SelectInput, TextInput } from "layouts/Orders/OrderCreate/components/FormField";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import axiosRequest from "shared/functions/axiosRequest";
import { usePermissions } from "shared/permissions";
import { useVendorsQuery } from "query/vendors";
import { createSystemProduct, duplicateProduct } from "query/productCreate.api";
import {
  ProductForm,
  buildProductPayload,
  emptyProductForm,
  emptyVariant,
  productSaveErrorMessage,
  productToForm,
  validateProductForm,
} from "../productForm";

export interface ProductFormDialogProps {
  open: boolean;
  onClose: () => void;
  /** يُستدعى بالمنتج المُنشأ (يحوي id وvariants بمعرّفات محلية) */
  onSaved: (product: any) => void;
  /** غير فارغ → وضع «نسخ وتعديل» من هذا المنتج؛ فارغ → منتج جديد من الصفر */
  source?: any | null;
}

const rowSx = { display: "grid", gap: "10px", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } } as const;

/** نموذج إنشاء منتج داخل النظام (جديد أو نسخة معدّلة) — يُستخدم من صفحة المنتجات ومن إنشاء الطلب. */
export default function ProductFormDialog({ open, onClose, onSaved, source = null }: ProductFormDialogProps) {
  const isDuplicate = !!source;
  const { can } = usePermissions();
  const canEditFinancials = can("orders_edit_financials");
  const vendorsQuery = useVendorsQuery();
  const [types, setTypes] = useState<Array<{ id: number; name: string }>>([]);
  const [form, setForm] = useState<ProductForm>(emptyProductForm());
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(isDuplicate ? productToForm(source) : emptyProductForm());
      setShowErrors(false);
    }
  }, [open, source, isDuplicate]);

  useEffect(() => {
    if (!open || types.length) return;
    axiosRequest
      .get(`${process.env.REACT_APP_API_URL}/products/types`)
      .then(({ data }) => setTypes(Array.isArray(data?.data) ? data.data : []))
      .catch(() => undefined);
  }, [open, types.length]);

  const vendorOptions = useMemo(
    () => (vendorsQuery.data ?? []).map((vendor: any) => ({ value: Number(vendor.id), label: vendor.name })),
    [vendorsQuery.data]
  );
  const typeOptions = useMemo(() => types.map((type) => ({ value: type.id, label: type.name })), [types]);
  const errors = useMemo(() => validateProductForm(form), [form]);

  const setField = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));
  const setVariantField = (index: number, key: string, value: string) =>
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, i) => (i === index ? { ...variant, [key]: value } : variant)),
    }));

  const handleSave = async () => {
    setShowErrors(true);
    if (Object.keys(errors).length > 0 || saving) return;
    setSaving(true);
    try {
      const payload = buildProductPayload(form, { canEditFinancials });
      const product = isDuplicate ? await duplicateProduct(source.id, payload) : await createSystemProduct(payload);
      NotificationMeassage("success", isDuplicate ? "تم نسخ المنتج" : "تم إنشاء المنتج");
      onSaved(product);
    } catch (error) {
      NotificationMeassage("error", productSaveErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="sm" fullWidth dir="rtl"
      PaperProps={{ sx: { borderRadius: "14px", fontFamily: FONT } }}>
      <DialogTitle sx={{ fontFamily: FONT, fontWeight: 800, fontSize: "16px" }}>
        {isDuplicate ? "نسخ المنتج وتعديله" : "إضافة منتج جديد"}
        {isDuplicate && (
          <Typography sx={{ fontFamily: FONT, fontSize: "12px", color: HX.tx3, fontWeight: 500 }}>
            سيُحفظ كمنتج جديد في النظام ولن يتأثر المنتج الأصلي: {source.title}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: "14px", pt: "18px !important" }}>
        <Box>
          <TextInput label="اسم المنتج" required value={form.title} onChange={(v) => setField("title", v)} />
          {showErrors && errors.title && <Typography sx={{ color: HX.red, fontSize: "11px", mt: "4px" }}>{errors.title}</Typography>}
        </Box>
        <Box sx={rowSx}>
          <Box>
            <SelectInput label="البائع" required value={form.vendorId} options={vendorOptions} onChange={(v) => setField("vendorId", v)} />
            {showErrors && errors.vendorId && <Typography sx={{ color: HX.red, fontSize: "11px", mt: "4px" }}>{errors.vendorId}</Typography>}
          </Box>
          <SelectInput label="نوع المنتج" value={form.typeId} options={typeOptions} onChange={(v) => setField("typeId", v)} />
        </Box>
        <TextInput label="رابط الصورة (اختياري)" value={form.image} onChange={(v) => setField("image", v)} placeholder="https://..." />

        <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "13px" }}>الخيارات والأسعار</Typography>
        {form.variants.map((variant, index) => (
          <Box key={index} sx={{ border: `0.5px solid ${HX.border}`, borderRadius: "10px", p: "12px", bgcolor: HX.surface2, display: "flex", flexDirection: "column", gap: "10px" }}>
            <Box sx={rowSx}>
              <TextInput label="اسم الخيار" value={variant.title} onChange={(v) => setVariantField(index, "title", v)} />
              <TextInput label="الكود" value={variant.sku} onChange={(v) => setVariantField(index, "sku", v)} placeholder="يُولَّد تلقائياً إن تُرك فارغاً" />
              <TextInput label="السعر (ج.م)" required type="number" value={variant.price} onChange={(v) => setVariantField(index, "price", v)} inputProps={{ min: 0 }} />
              {canEditFinancials && (
                <TextInput label="سعر التكلفة (ج.م)" type="number" value={variant.cost} onChange={(v) => setVariantField(index, "cost", v)} inputProps={{ min: 0 }} />
              )}
              <TextInput label="اللون" value={variant.color} onChange={(v) => setVariantField(index, "color", v)} />
              <TextInput label="المقاس" value={variant.size} onChange={(v) => setVariantField(index, "size", v)} />
              <TextInput label="الخامة" value={variant.material} onChange={(v) => setVariantField(index, "material", v)} />
            </Box>
            {form.variants.length > 1 && (
              <Button size="small" color="error" startIcon={<CloseIcon />} sx={{ alignSelf: "flex-start", fontFamily: FONT }}
                onClick={() => setField("variants", form.variants.filter((_, i) => i !== index))}>
                حذف الخيار
              </Button>
            )}
          </Box>
        ))}
        {showErrors && errors.variants && <Typography sx={{ color: HX.red, fontSize: "11px" }}>{errors.variants}</Typography>}
        <Button size="small" startIcon={<AddIcon />} sx={{ alignSelf: "flex-start", fontFamily: FONT }}
          onClick={() => setField("variants", [...form.variants, emptyVariant()])}>
          إضافة خيار
        </Button>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={saving} sx={{ fontFamily: FONT }}>إلغاء</Button>
        <Button onClick={handleSave} variant="contained" disabled={saving} sx={{ color: "#fff", fontFamily: FONT }}>
          {saving ? "جارٍ الحفظ..." : isDuplicate ? "حفظ النسخة" : "حفظ المنتج"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
