/**
 * نموذج إضافة/تعديل مصنع — الحقول تطابق جسم `POST /factories` و
 * `PUT /factories/{id}` حرفياً، والقوائم من `GET /factories/meta`.
 *
 * في وضع التعديل تُجلب التفاصيل من `GET /factories/{id}` لأن صف القائمة لا يحمل
 * البيانات البنكية ولا جهة الاتصال.
 *
 * RTL: الاتجاه عبر السمة dir="rtl" على <Dialog> لا عبر sx (المحوّل يقلب
 * `direction` فينقلب الحوار).
 */
import React, { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, Dialog, IconButton, MenuItem, TextField, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import FactoryOutlinedIcon from "@mui/icons-material/FactoryOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ContactPhoneOutlinedIcon from "@mui/icons-material/ContactPhoneOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { HX } from "layouts/Orders/ordersHomixTheme";
import type { FactoriesMeta } from "query/factoriesMeta";
import { useFactoryDetailQuery } from "query/factoryDetail";
import { useDeleteFactoryAttachmentMutation, type FactoryUploadFile } from "query/factoryMutations";
import { detailToForm } from "../utils/calc";
import { CURRENCY, EMPTY_FORM } from "../utils/constants";
import {
  fieldLabelSx, filterBtnSx, formRowSx, modalDividerSx, modalFieldSx,
  modalFootSx, modalHeadSx, modalPaperSx, primaryBtnSx, sectionTitleSx, FONT,
} from "../utils/styles";
import { FactoryDocument, FactoryFormValues, PendingDocument } from "../utils/types";
import AttachmentField from "./AttachmentField";

export interface FactoryFormModalProps {
  open: boolean;
  /** null = وضع الإضافة */
  factoryId: number | null;
  meta: FactoriesMeta | undefined;
  isSaving: boolean;
  onClose: () => void;
  onSave: (values: FactoryFormValues, documents: FactoryUploadFile[]) => void;
}

/** حقل بعنوان فوقه — نفس شكل .mfield في التصميم */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Box component="label" sx={fieldLabelSx}>{label}</Box>
      {children}
    </Box>
  );
}

/** أيقونات الأنواع — رمز افتراضي لأي نوع مستند من الـ meta */
const TYPE_EMOJI = ["📄", "🧾", "📑", "📋", "🗂️"];

export default function FactoryFormModal({
  open, factoryId, meta, isSaving, onClose, onSave,
}: FactoryFormModalProps) {
  const isEdit = factoryId != null;

  const detailQuery = useFactoryDetailQuery(factoryId, open);
  const detail = detailQuery.data ?? null;

  const [values, setValues] = useState<FactoryFormValues>(EMPTY_FORM);
  const [pending, setPending] = useState<PendingDocument[]>([]);

  const deleteAttachment = useDeleteFactoryAttachmentMutation();

  const documentTypes = meta?.documentTypes ?? [];
  const specialties = meta?.specialties ?? [];
  const statuses = meta?.statuses ?? [];
  const defaultVerification = meta?.documentStatuses?.[0]?.value;

  /** إعادة الضبط عند الفتح: قيم فارغة للإضافة، وتفاصيل الـ API للتعديل */
  useEffect(() => {
    if (!open) return;
    setPending([]);
    if (!isEdit) {
      setValues(EMPTY_FORM);
      return;
    }
    if (detail) setValues(detailToForm(detail));
  }, [open, isEdit, detail]);

  const set = <K extends keyof FactoryFormValues>(key: K) => (value: FactoryFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  /** مستندات السيرفر مجمّعة بنوعها لعرض كل نوع تحت منطقته */
  const uploadedByType = useMemo(() => {
    const map = new Map<number, FactoryDocument[]>();
    (detail?.documents ?? []).forEach((d) => {
      const key = d.type ?? -1;
      const list = map.get(key) ?? [];
      list.push(d);
      map.set(key, list);
    });
    return map;
  }, [detail]);

  const addFiles = (attachmentType: number, description: string) => (files: File[]) => {
    setPending((prev) => [
      ...prev,
      ...files.map((file, i) => ({
        // الاسم + الحجم + الطول يميّزان عناصر نفس الدفعة
        key: `${attachmentType}-${file.name}-${file.size}-${prev.length + i}`,
        file,
        attachmentType,
        description,
      })),
    ]);
  };

  const removePending = (key: string) =>
    setPending((prev) => prev.filter((p) => p.key !== key));

  const handleSave = () => {
    if (isSaving) return;
    if (!values.name.trim()) {
      NotificationMeassage("error", "اسم المصنع مطلوب");
      return;
    }
    if (!values.factoryCategory) {
      NotificationMeassage("error", "التخصص مطلوب");
      return;
    }
    const documents: FactoryUploadFile[] = pending.map((p) => ({
      file: p.file,
      description: p.description,
      attachmentType: p.attachmentType,
      verificationStatus: defaultVerification,
    }));
    onSave(values, documents);
  };

  const loadingDetail = isEdit && detailQuery.isLoading;

  return (
    <Dialog open={open} onClose={onClose} dir="rtl" fullWidth maxWidth="sm" PaperProps={{ sx: modalPaperSx }}>
      <Box sx={modalHeadSx}>
        <Box>
          <Typography sx={{ fontSize: "14px", fontWeight: 800, color: HX.tx, fontFamily: FONT }}>
            {isEdit ? "تعديل بيانات الصانع" : "إضافة صانع جديد"}
          </Typography>
          {detail?.code ? (
            <Typography sx={{ fontSize: "11px", color: HX.tx3, fontFamily: FONT, unicodeBidi: "plaintext" }}>
              {detail.code}
            </Typography>
          ) : null}
        </Box>
        <IconButton
          onClick={onClose}
          aria-label="إغلاق"
          sx={{
            width: 28, height: 28, borderRadius: "7px", bgcolor: HX.surface2,
            color: HX.tx2, flexShrink: 0,
            "&:hover": { bgcolor: HX.redLight, color: HX.red },
          }}
        >
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      {loadingDetail ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: "60px 0" }}>
          <CircularProgress size={34} sx={{ color: HX.accent }} />
        </Box>
      ) : (
        <Box sx={{ p: "22px" }}>
          {/* ── بيانات المصنع ── */}
          <Box sx={sectionTitleSx}><FactoryOutlinedIcon /> بيانات المصنع</Box>
          <Box sx={formRowSx()}>
            <Field label="اسم المصنع *">
              <TextField
                fullWidth size="small" sx={modalFieldSx} placeholder="مثال: ركة للأثاث"
                value={values.name} onChange={(e) => set("name")(e.target.value)}
              />
            </Field>
            <Field label="التخصص *">
              <TextField
                select fullWidth size="small" sx={modalFieldSx}
                disabled={specialties.length === 0}
                value={values.factoryCategory}
                onChange={(e) => set("factoryCategory")(e.target.value)}
              >
                <MenuItem value="" sx={{ fontFamily: FONT, fontSize: "13px" }}>اختر التخصص</MenuItem>
                {specialties.map((s) => (
                  <MenuItem key={s.id} value={s.value} sx={{ fontFamily: FONT, fontSize: "13px" }}>
                    {s.label}
                  </MenuItem>
                ))}
              </TextField>
            </Field>
          </Box>
          <Box sx={formRowSx(true)}>
            <Field label="العنوان الكامل">
              <TextField
                fullWidth size="small" sx={modalFieldSx} placeholder="مثال: مؤسسة الزكاة، القاهرة"
                value={values.address} onChange={(e) => set("address")(e.target.value)}
              />
            </Field>
          </Box>
          <Box sx={formRowSx()}>
            <Field label="المدينة">
              <TextField
                fullWidth size="small" sx={modalFieldSx} placeholder="القاهرة"
                value={values.city} onChange={(e) => set("city")(e.target.value)}
              />
            </Field>
            <Field label="الدولة">
              <TextField
                fullWidth size="small" sx={modalFieldSx} placeholder="Egypt"
                value={values.country} onChange={(e) => set("country")(e.target.value)}
              />
            </Field>
          </Box>
          <Box sx={formRowSx()}>
            <Field label="الحالة">
              <TextField
                select fullWidth size="small" sx={modalFieldSx}
                disabled={statuses.length === 0}
                value={String(values.status)}
                onChange={(e) => set("status")(Number(e.target.value))}
              >
                {statuses.map((o) => (
                  <MenuItem key={o.value} value={String(o.value)} sx={{ fontFamily: FONT, fontSize: "13px" }}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>
            </Field>
            <Field label="تاريخ الانضمام">
              <TextField
                fullWidth size="small" type="date" sx={modalFieldSx}
                value={values.joinDate} onChange={(e) => set("joinDate")(e.target.value)}
              />
            </Field>
          </Box>
          <Box sx={formRowSx()}>
            <Field label="الويب سايت">
              <TextField
                fullWidth size="small" sx={modalFieldSx} placeholder="https://..."
                value={values.website} onChange={(e) => set("website")(e.target.value)}
                inputProps={{ dir: "ltr" }}
              />
            </Field>
            <Field label="البريد الإلكتروني">
              <TextField
                fullWidth size="small" type="email" sx={modalFieldSx} placeholder="info@example.com"
                value={values.email} onChange={(e) => set("email")(e.target.value)}
                inputProps={{ dir: "ltr" }}
              />
            </Field>
          </Box>
          <Box sx={formRowSx()}>
            <Field label="هاتف المصنع">
              <TextField
                fullWidth size="small" type="tel" sx={modalFieldSx} placeholder="01xxxxxxxxx"
                value={values.phoneNumber} onChange={(e) => set("phoneNumber")(e.target.value)}
                inputProps={{ dir: "ltr" }}
              />
            </Field>
            <Field label="الوصف">
              <TextField
                fullWidth size="small" sx={modalFieldSx} placeholder="مصنع أثاث مودرن"
                value={values.description} onChange={(e) => set("description")(e.target.value)}
              />
            </Field>
          </Box>

          <Box component="hr" sx={modalDividerSx} />

          {/* ── بيانات المسؤول ── */}
          <Box sx={sectionTitleSx}><PersonOutlineIcon /> بيانات المسؤول</Box>
          <Box sx={formRowSx()}>
            <Field label="اسم المسؤول">
              <TextField
                fullWidth size="small" sx={modalFieldSx} placeholder="الاسم الكامل"
                value={values.responsibleName} onChange={(e) => set("responsibleName")(e.target.value)}
              />
            </Field>
            <Field label="رقم الهاتف">
              <TextField
                fullWidth size="small" type="tel" sx={modalFieldSx} placeholder="01xxxxxxxxx"
                value={values.responsiblePhone} onChange={(e) => set("responsiblePhone")(e.target.value)}
                inputProps={{ dir: "ltr" }}
              />
            </Field>
          </Box>
          <Box sx={formRowSx()}>
            <Field label="البريد الإلكتروني">
              <TextField
                fullWidth size="small" type="email" sx={modalFieldSx} placeholder="name@example.com"
                value={values.responsibleEmail} onChange={(e) => set("responsibleEmail")(e.target.value)}
                inputProps={{ dir: "ltr" }}
              />
            </Field>
            <Field label="المسمّى الوظيفي">
              <TextField
                fullWidth size="small" sx={modalFieldSx} placeholder="مدير عام"
                value={values.responsibleRole} onChange={(e) => set("responsibleRole")(e.target.value)}
              />
            </Field>
          </Box>

          <Box component="hr" sx={modalDividerSx} />

          {/* ── جهة الاتصال ── */}
          <Box sx={sectionTitleSx}><ContactPhoneOutlinedIcon /> جهة الاتصال</Box>
          <Box sx={formRowSx()}>
            <Field label="الاسم">
              <TextField
                fullWidth size="small" sx={modalFieldSx} placeholder="الاسم الكامل"
                value={values.contactPersonName} onChange={(e) => set("contactPersonName")(e.target.value)}
              />
            </Field>
            <Field label="رقم الهاتف">
              <TextField
                fullWidth size="small" type="tel" sx={modalFieldSx} placeholder="01xxxxxxxxx"
                value={values.contactPersonPhoneNumber}
                onChange={(e) => set("contactPersonPhoneNumber")(e.target.value)}
                inputProps={{ dir: "ltr" }}
              />
            </Field>
          </Box>
          <Box sx={formRowSx()}>
            <Field label="البريد الإلكتروني">
              <TextField
                fullWidth size="small" type="email" sx={modalFieldSx} placeholder="name@example.com"
                value={values.contactPersonEmail} onChange={(e) => set("contactPersonEmail")(e.target.value)}
                inputProps={{ dir: "ltr" }}
              />
            </Field>
            <Field label="المسمّى الوظيفي">
              <TextField
                fullWidth size="small" sx={modalFieldSx} placeholder="مدير عام"
                value={values.contactPersonRole} onChange={(e) => set("contactPersonRole")(e.target.value)}
              />
            </Field>
          </Box>

          <Box component="hr" sx={modalDividerSx} />

          {/* ── مصاريف الشحن ── */}
          <Box sx={sectionTitleSx}>
            <LocalShippingOutlinedIcon /> مصاريف الشحن ({CURRENCY})
          </Box>
          <Box sx={formRowSx()}>
            <Field label="القاهرة والجيزة">
              <TextField
                fullWidth size="small" type="number" sx={modalFieldSx} placeholder="0"
                value={values.cairoGizaShipping}
                onChange={(e) => set("cairoGizaShipping")(e.target.value)}
                inputProps={{ min: 0 }}
              />
            </Field>
            <Field label="باقي المحافظات">
              <TextField
                fullWidth size="small" type="number" sx={modalFieldSx} placeholder="0"
                value={values.otherCitiesShipping}
                onChange={(e) => set("otherCitiesShipping")(e.target.value)}
                inputProps={{ min: 0 }}
              />
            </Field>
          </Box>

          <Box component="hr" sx={modalDividerSx} />

          {/* ── التحويل البنكي ── */}
          <Box sx={sectionTitleSx}><CreditCardOutlinedIcon /> بيانات التحويل البنكي</Box>
          <Box sx={formRowSx()}>
            <Field label="اسم البنك">
              <TextField
                fullWidth size="small" sx={modalFieldSx} placeholder="مثال: بنك مصر"
                value={values.bankName} onChange={(e) => set("bankName")(e.target.value)}
              />
            </Field>
            <Field label="اسم صاحب الحساب">
              <TextField
                fullWidth size="small" sx={modalFieldSx} placeholder="الاسم كما في البنك"
                value={values.bankAccountHolderName}
                onChange={(e) => set("bankAccountHolderName")(e.target.value)}
              />
            </Field>
          </Box>
          <Box sx={formRowSx()}>
            <Field label="رقم الحساب">
              <TextField
                fullWidth size="small" placeholder="XXXX XXXX XXXX XXXX"
                value={values.bankAccountNumber}
                onChange={(e) => set("bankAccountNumber")(e.target.value)}
                inputProps={{ dir: "ltr" }}
                sx={{
                  ...modalFieldSx,
                  "& .MuiOutlinedInput-input": {
                    fontFamily: "monospace", fontSize: "13px", letterSpacing: ".5px", py: 0,
                  },
                }}
              />
            </Field>
            <Field label="نوع الحساب">
              <TextField
                fullWidth size="small" sx={modalFieldSx} placeholder="حساب جاري"
                value={values.bankAccountType} onChange={(e) => set("bankAccountType")(e.target.value)}
              />
            </Field>
          </Box>
          <Box sx={formRowSx()}>
            <Field label="رقم المحفظة">
              <TextField
                fullWidth size="small" type="tel" sx={modalFieldSx} placeholder="01xxxxxxxxx"
                value={values.walletNumber} onChange={(e) => set("walletNumber")(e.target.value)}
                inputProps={{ dir: "ltr" }}
              />
            </Field>
            <Field label="مُشغّل المحفظة">
              <TextField
                fullWidth size="small" sx={modalFieldSx} placeholder="Vodafone Cash"
                value={values.walletProvider} onChange={(e) => set("walletProvider")(e.target.value)}
              />
            </Field>
          </Box>
          <Box sx={formRowSx(true)}>
            <Field label="رقم InstaPay">
              <TextField
                fullWidth size="small" type="tel" sx={modalFieldSx} placeholder="01xxxxxxxxx"
                value={values.instapayNumber} onChange={(e) => set("instapayNumber")(e.target.value)}
                inputProps={{ dir: "ltr" }}
              />
            </Field>
          </Box>

          <Box component="hr" sx={modalDividerSx} />

          {/* ── الأوراق الرسمية — منطقة لكل نوع مستند من الـ meta ── */}
          <Box sx={sectionTitleSx}><AttachFileIcon /> الأوراق الرسمية</Box>
          {documentTypes.length === 0 ? (
            <Box sx={{ fontSize: "11.5px", color: HX.tx3, fontFamily: FONT }}>
              لا توجد أنواع مستندات في الإعدادات
            </Box>
          ) : (
            documentTypes.map((t, i) => (
              <AttachmentField
                key={t.value}
                label={t.label}
                emoji={TYPE_EMOJI[i % TYPE_EMOJI.length]}
                uploaded={uploadedByType.get(t.value) ?? []}
                pending={pending.filter((p) => p.attachmentType === t.value)}
                onAdd={addFiles(t.value, t.label)}
                onRemovePending={removePending}
                onRemoveUploaded={
                  isEdit
                    ? (documentId) =>
                        deleteAttachment.mutate({ factoryId: factoryId!, attachmentId: documentId })
                    : undefined
                }
                deletingId={deleteAttachment.isPending ? deleteAttachment.variables?.attachmentId : null}
              />
            ))
          )}
          {!isEdit && pending.length > 0 ? (
            <Box sx={{ fontSize: "11px", color: HX.tx3, fontFamily: FONT, mt: "4px" }}>
              ترفع المستندات تلقائياً بعد حفظ المصنع
            </Box>
          ) : null}
        </Box>
      )}

      <Box sx={modalFootSx}>
        <Box component="button" type="button" onClick={onClose} sx={{ ...filterBtnSx(false), height: 34 }}>
          إلغاء
        </Box>
        <Box
          component="button"
          type="button"
          onClick={handleSave}
          disabled={isSaving || loadingDetail}
          sx={{ ...primaryBtnSx, opacity: isSaving || loadingDetail ? 0.6 : 1 }}
        >
          {isSaving ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : <CheckIcon />}
          حفظ الصانع
        </Box>
      </Box>
    </Dialog>
  );
}
