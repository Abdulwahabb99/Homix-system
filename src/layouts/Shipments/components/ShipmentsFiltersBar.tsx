import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box, Button, Collapse, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import DateRangePickerWrapper from "components/DateRangePickerWrapper/DateRangePickerWrapper";
import { SHIPMENT_STATUS_VALUES, SHIPMENT_TYPE_VALUES } from "shared/utils/constants";
import { HX } from "layouts/Orders/ordersHomixTheme";
import type { ShipmentsMeta } from "query/shipmentsMeta";
import ShippingCompanySelect from "./ShipmentEdit/ShippingCompanySelect";
import MultiSelect from "components/MultiSelect/MultiSelect";

const FONT = "'Cairo', sans-serif";

/** نفس منطق صفحة الطلبات: القوائم تُطبَّق فوراً، والكتابة تُطبَّق بعد 500ms من التوقّف. */
const SEARCH_DEBOUNCE_MS = 500;

/** حقول البحث النصية — تُؤجَّل، ولا تُستبدل من الرابط أثناء الكتابة فيها. */
const TEXT_FIELDS = [
  "operationCode",
  "orderNumber",
  "customerName",
  "customerPhone",
  "vendorName",
] as const;

/** حقول القوائم المتعددة — تُجمَّع كمسوّدة وتُطبَّق عند إغلاق القائمة فقط. */
const SELECT_FIELDS = [
  "shipmentStatus",
  "paymentStatus",
  "shipmentType",
  "shippingCompany",
  "scheduleStatus",
  "governorate",
] as const;

/**
 * بصمة اختيارات القوائم للمقارنة. نرتّب المعرّفات لأن ترتيب الاختيار قد يختلف
 * ("2,1" مقابل "1,2") فلا نُطلق طلباً لاختيار لم يتغيّر فعلياً.
 */
function selectFingerprint(values: FilterValues): string {
  return JSON.stringify(
    SELECT_FIELDS.map((field) =>
      String(values[field] ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .sort()
    )
  );
}

export interface FilterValues {
  operationCode: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  shipmentStatus: string;
  paymentStatus: string;
  shipmentType: string;
  deliveryBy: string;
  shippingCompany: string;
  scheduleStatus: string;
  governorate: string;
  vendorName: string;
  /** تاريخ الاستلام بالمخزون */
  startDate: any;
  endDate: any;
  /** تاريخ التسليم الفعلي */
  deliveryDateFrom: any;
  deliveryDateTo: any;
  /** تاريخ الجدولة */
  scheduledDateFrom: any;
  scheduledDateTo: any;
}

export interface ShipmentsFiltersBarProps {
  defaultValues: FilterValues;
  meta: ShipmentsMeta | undefined;
  isVendor: boolean;
  onApply: (values: FilterValues) => void;
  onReset: () => void;
}

/**
 * غلاف موحّد «تسمية فوق الحقل». كل فلتر في الشريط يمرّ من هنا، فلا يمكن أن يبدأ
 * حقل من مكان مختلف عن جيرانه — وهو ما حدث مع «شركة الشحن» حين رُسم عرياناً
 * بتسمية MUI عائمة داخل الإطار.
 */
function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <Typography component="label" sx={{
        display: "block", mb: "4px", color: HX.tx2,
        fontFamily: FONT, fontSize: "11px", fontWeight: 600,
      }}>
        {label}
      </Typography>
      {children}
    </Box>
  );
}

function FilterInput({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <FilterField label={label}>
      <Box sx={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        bgcolor: HX.surface,
        border: `1px solid ${HX.border}`,
        borderRadius: "10px",
        px: "11px",
        height: 38,
        width: "100%",
        minWidth: 0,
        "&:focus-within": {
          borderColor: HX.accent,
          boxShadow: `0 0 0 2px ${HX.accentLight}`,
        },
      }}>
        <Box sx={{ color: HX.tx3, display: "flex", alignItems: "center", flexShrink: 0 }}>
          <SearchIcon sx={{ fontSize: 15 }} />
        </Box>
        <Box
          component="input"
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          sx={{
            border: "none",
            outline: "none",
            flex: 1,
            minWidth: 0,
            fontSize: "12px",
            fontFamily: FONT,
            color: "#000",
            bgcolor: "transparent",
            "&::placeholder": { color: HX.tx3, fontSize: "12px" },
          }}
        />
      </Box>
    </FilterField>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
  onClose,
}: {
  label: string;
  value: string;
  options: { label: string; value: string | number }[];
  onChange: (v: string) => void;
  /** يُطلق عند إغلاق القائمة — لحظة تطبيق الاختيار على الخادم. */
  onClose?: () => void;
}) {
  const normalizedOptions = options.map((option) => ({
    label: option.label,
    value: String(option.value),
  }));
  const selectedValues = value ? value.split(",").map((item) => item.trim()).filter(Boolean) : [];

  return (
    <FilterField label={label}>
      <MultiSelect<string>
        value={selectedValues}
        onChange={(next) => onChange(next.join(","))}
        onClose={onClose}
        options={normalizedOptions}
        placeholder="الكل"
      />
    </FilterField>
  );
}

export default function ShipmentsFiltersBar({
  defaultValues,
  meta,
  isVendor,
  onApply,
  onReset,
}: ShipmentsFiltersBarProps) {
  const [open, setOpen] = useState(false);
  const [vals, setVals] = useState<FilterValues>({ ...defaultValues, deliveryBy: "" });

  /** حاوية الشريط — نستخدمها لمعرفة إن كان المستخدم يكتب داخله الآن. */
  const barRef = useRef<HTMLDivElement | null>(null);
  const textTimerRef = useRef<number | undefined>(undefined);
  /**
   * مرآة فورية لأحدث مسوّدة. لا نقرأ `vals` مباشرة في onClose لأن الاختيار
   * الأخير وإغلاق القائمة قد يقعا في نفس دفعة React، فتكون قيمة الإغلاق متأخّرة
   * باختيار واحد. الـ ref يُحدَّث لحظة الاختيار فيقرأ الإغلاق الصورة الصحيحة.
   */
  const valsRef = useRef<FilterValues>(vals);
  valsRef.current = vals;

  useEffect(() => () => window.clearTimeout(textTimerRef.current), []);

  /**
   * الشريط لا يملك حقلاً لـ deliveryBy، فإرسال "" مع كل تطبيق يمحو فلتراً لم
   * يلمسه المستخدم — نُعيده كما وصل من الرابط.
   */
  const commit = useCallback(
    (next: FilterValues) => {
      window.clearTimeout(textTimerRef.current);
      onApply({ ...next, deliveryBy: defaultValues.deliveryBy || "" });
    },
    [onApply, defaultValues.deliveryBy]
  );

  // أعِد المزامنة عند تغيّر القيم الخارجية (إعادة ضبط / تنقّل بالرابط)
  const defKey = JSON.stringify(defaultValues);
  useEffect(() => {
    setVals((prev) => {
      const next: FilterValues = { ...defaultValues, deliveryBy: "" };
      /* الرابط يتحدّث بعد 500ms من آخر حرف، فلو أعدنا ضبط حقول البحث والمستخدم
         ما زال يكتب داخل الشريط لقطعنا ما يكتبه. نُبقي قيمه المحلية في هذه
         الحالة فقط؛ أي تنقّل خارجي (زر الرجوع / إعادة الضبط) يفوز كما كان. */
      if (barRef.current && barRef.current.contains(document.activeElement)) {
        TEXT_FIELDS.forEach((field) => {
          next[field] = prev[field];
        });
      }
      return next;
    });
  }, [defKey]);

  /**
   * القوائم المتعددة: الاختيار يُخزَّن كمسوّدة فقط. المستخدم قد يختار عدّة قيم من
   * نفس القائمة، فإطلاق طلب مع كل كليك يعني طلبات مهدورة ونتائج وسيطة. نطبّق مرّة
   * واحدة عند إغلاق القائمة (handleDropdownClose) — نفس سلوك صفحة الطلبات.
   */
  const setSelect = (field: keyof FilterValues) => (v: any) => {
    const next = { ...valsRef.current, [field]: v };
    valsRef.current = next;
    setVals(next);
  };

  /** عند إغلاق أي قائمة: طبّق لو الاختيار اتغيّر فعلاً، وتجاهل الفتح/الإغلاق العابر. */
  const handleDropdownClose = () => {
    const current = valsRef.current;
    if (selectFingerprint(current) === selectFingerprint(defaultValues)) return;
    commit(current);
  };

  /** الكتابة: تطبيق مؤجَّل حتى يتوقّف المستخدم، فلا نطلق طلباً لكل حرف. */
  const setText = (field: keyof FilterValues) => (v: any) => {
    const next = { ...valsRef.current, [field]: v };
    valsRef.current = next;
    setVals(next);
    window.clearTimeout(textTimerRef.current);
    textTimerRef.current = window.setTimeout(
      () => onApply({ ...next, deliveryBy: defaultValues.deliveryBy || "" }),
      SEARCH_DEBOUNCE_MS
    );
  };

  const applyDates = (patch: Partial<FilterValues>) => {
    const next = { ...valsRef.current, ...patch };
    valsRef.current = next;
    setVals(next);
    commit(next);
  };
  const handleReceivedDatesChange = (start: any, end: any) =>
    applyDates({ startDate: start, endDate: end });
  const handleReceivedDateReset = () => applyDates({ startDate: null, endDate: null });
  const handleDeliveryDatesChange = (start: any, end: any) =>
    applyDates({ deliveryDateFrom: start, deliveryDateTo: end });
  const handleDeliveryDateReset = () =>
    applyDates({ deliveryDateFrom: null, deliveryDateTo: null });
  const handleScheduledDatesChange = (start: any, end: any) =>
    applyDates({ scheduledDateFrom: start, scheduledDateTo: end });
  const handleScheduledDateReset = () =>
    applyDates({ scheduledDateFrom: null, scheduledDateTo: null });

  const handleReset = () => {
    const empty: FilterValues = {
      operationCode: "", orderNumber: "", customerName: "", customerPhone: "",
      shipmentStatus: "", paymentStatus: "", shipmentType: "",
      deliveryBy: "", shippingCompany: "", scheduleStatus: "", governorate: "", vendorName: "",
      startDate: null, endDate: null,
      deliveryDateFrom: null, deliveryDateTo: null,
      scheduledDateFrom: null, scheduledDateTo: null,
    };
    window.clearTimeout(textTimerRef.current);
    valsRef.current = empty;
    setVals(empty);
    onReset();
  };

  /** الفلاتر تُطبَّق تلقائياً؛ هذا الزر يفرّغ أي كتابة مؤجَّلة فوراً. */
  const handleApply = () => commit(valsRef.current);

  const shipmentStatuses = meta?.shipmentStatuses ?? SHIPMENT_STATUS_VALUES;
  const shipmentTypes    = meta?.shipmentTypes    ?? SHIPMENT_TYPE_VALUES;
  const paymentStatuses  = meta?.paymentStatuses  ?? [
    { value: 1, label: "الدفع عند الاستلام" },
    { value: 2, label: "مدفوع" },
  ];
  const scheduleStatuses  = meta?.scheduleStatuses  ?? [];
  const governorates      = meta?.governorates      ?? [];

  const selectedCount = (value: string) => value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean).length;
  const activeCount =
    [vals.operationCode, vals.orderNumber, vals.customerName, vals.customerPhone, vals.vendorName]
      .filter(Boolean).length
    + selectedCount(vals.shipmentStatus)
    + selectedCount(vals.paymentStatus)
    + (isVendor ? 0 : selectedCount(vals.shipmentType))
    + selectedCount(vals.shippingCompany)
    + selectedCount(vals.governorate)
    + selectedCount(vals.scheduleStatus)
    + (vals.startDate || vals.endDate ? 1 : 0)
    + (vals.deliveryDateFrom || vals.deliveryDateTo ? 1 : 0)
    + (vals.scheduledDateFrom || vals.scheduledDateTo ? 1 : 0);

  return (
    <Box
      ref={barRef}
      sx={{
        bgcolor: HX.surface,
        borderRadius: HX.r,
        border: `0.5px solid ${HX.border}`,
        overflow: "hidden",
      }}
    >
      {/* Collapsible header */}
      <Box
        onClick={() => setOpen((p) => !p)}
        sx={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          p: "12px 16px", cursor: "pointer", userSelect: "none",
          borderBottom: open ? `0.5px solid ${HX.border}` : "none",
          "&:hover": { bgcolor: HX.surface2 },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <FilterAltIcon sx={{ fontSize: 15, color: HX.accent }} />
          <Box component="span" sx={{ fontSize: "13px", fontWeight: 700, color: HX.tx, fontFamily: FONT }}>
            الفلاتر
          </Box>
          {activeCount > 0 && (
            <Box component="span" sx={{
              fontSize: "10.5px", bgcolor: HX.accent, color: "#fff",
              px: "9px", py: "2px", borderRadius: "10px", fontWeight: 700, fontFamily: FONT,
            }}>
              {activeCount} فلتر نشط
            </Box>
          )}
        </Box>
        <Box sx={{
          width: 22, height: 22, borderRadius: "50%", bgcolor: HX.surface2,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: ".25s", transform: open ? "rotate(180deg)" : "rotate(0deg)",
        }}>
          <KeyboardArrowDownIcon sx={{ fontSize: 15, color: HX.tx3 }} />
        </Box>
      </Box>

      <Collapse in={open}>
        <Box sx={{ p: "12px 14px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {/* Responsive, evenly-spaced filter grid. */}
          <Box
            sx={{
              display: "grid",
              columnGap: "10px",
              rowGap: "12px",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(4, minmax(0, 1fr))",
              },
              alignItems: "start",
            }}
          >
            <FilterInput
              label="رقم العملية"
              placeholder="بحث برقم العملية..."
              value={vals.operationCode}
              onChange={setText("operationCode")}
            />
            <FilterInput
              label="رقم الطلب"
              placeholder="بحث برقم الطلب..."
              value={vals.orderNumber}
              onChange={setText("orderNumber")}
            />
            <FilterInput
              label="اسم العميل"
              placeholder="بحث باسم العميل..."
              value={vals.customerName}
              onChange={setText("customerName")}
            />
            <FilterInput
              label="هاتف العميل"
              placeholder="بحث برقم هاتف العميل..."
              value={vals.customerPhone}
              onChange={setText("customerPhone")}
            />

            <FilterSelect
              label="كل الحالات"
              value={vals.shipmentStatus}
              options={shipmentStatuses}
              onChange={setSelect("shipmentStatus")}
              onClose={handleDropdownClose}
            />

            <FilterSelect
              label="حالة الدفع"
              value={vals.paymentStatus}
              options={paymentStatuses}
              onChange={setSelect("paymentStatus")}
              onClose={handleDropdownClose}
            />

            {!isVendor && (
              <FilterSelect
                label="نوع الشحنة"
                value={vals.shipmentType}
                options={shipmentTypes}
                onChange={setSelect("shipmentType")}
                onClose={handleDropdownClose}
              />
            )}

            <FilterField label="شركة الشحن">
              <ShippingCompanySelect
                value={vals.shippingCompany}
                onChange={setSelect("shippingCompany")}
                onClose={handleDropdownClose}
                multiple
                label={null}
                placeholder="الكل"
                /* نفس مقاسات وحدود MultiSelect المجاور (34px / 8px / border2 / ظل
                   التركيز) — الحقل مبني على Autocomplete فلا يرث أنماطه تلقائياً. */
                sx={{
                  "& .MuiOutlinedInput-root": {
                    minHeight: "34px",
                    height: 34,
                    py: 0,
                    overflow: "hidden",
                    flexWrap: "nowrap",
                    borderRadius: "8px",
                    fontSize: "12.5px",
                  },
                  "& .MuiOutlinedInput-root .MuiAutocomplete-input": { py: 0 },
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: HX.border2 },
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: HX.accent,
                    borderWidth: 1,
                    boxShadow: `0 0 0 3px ${HX.accentLight}`,
                  },
                }}
              />
            </FilterField>

            <FilterSelect
              label="حالة الجدولة"
              value={vals.scheduleStatus}
              options={scheduleStatuses}
              onChange={setSelect("scheduleStatus")}
              onClose={handleDropdownClose}
            />

            <FilterSelect
              label="المحافظة"
              value={vals.governorate}
              options={governorates}
              onChange={setSelect("governorate")}
              onClose={handleDropdownClose}
            />
          </Box>

          {/* Date range filters — each on its own row so the three stay distinguishable */}
          <Box
            sx={{
              display: "grid",
              columnGap: "10px",
              rowGap: "12px",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(3, minmax(0, 1fr))",
              },
              alignItems: "start",
            }}
          >
            <Box>
              <Typography component="label" sx={{
                display: "block", mb: "4px", color: HX.tx2,
                fontFamily: FONT, fontSize: "11px", fontWeight: 600,
              }}>
                تاريخ الاستلام
              </Typography>
              <DateRangePickerWrapper
                startDate={vals.startDate}
                endDate={vals.endDate}
                allowPastDays={true}
                allowFutureDays={false}
                useDefaultPresets={true}
                handleDatesChange={handleReceivedDatesChange}
                onReset={handleReceivedDateReset}
              />
            </Box>
            <Box>
              <Typography component="label" sx={{
                display: "block", mb: "4px", color: HX.tx2,
                fontFamily: FONT, fontSize: "11px", fontWeight: 600,
              }}>
                تاريخ التسليم الفعلي
              </Typography>
              <DateRangePickerWrapper
                startDate={vals.deliveryDateFrom}
                endDate={vals.deliveryDateTo}
                allowPastDays={true}
                allowFutureDays={false}
                useDefaultPresets={true}
                handleDatesChange={handleDeliveryDatesChange}
                onReset={handleDeliveryDateReset}
              />
            </Box>
            <Box>
              <Typography component="label" sx={{
                display: "block", mb: "4px", color: HX.tx2,
                fontFamily: FONT, fontSize: "11px", fontWeight: 600,
              }}>
                تاريخ الجدولة
              </Typography>
              <DateRangePickerWrapper
                startDate={vals.scheduledDateFrom}
                endDate={vals.scheduledDateTo}
                allowPastDays={true}
                allowFutureDays={true}
                useDefaultPresets={true}
                handleDatesChange={handleScheduledDatesChange}
                onReset={handleScheduledDateReset}
              />
            </Box>
          </Box>

          {/* Row 2: الفلاتر تُطبَّق تلقائياً — الزر لتفريغ الكتابة المؤجَّلة، وإعادة الضبط تمحو الكل. */}
          <Box sx={{ display: "flex", gap: "8px", justifyContent: "flex-start", direction: "rtl" }}>
            <Button
              size="small"
              onClick={handleReset}
              startIcon={<RestartAltIcon sx={{ fontSize: "14px !important" }} />}
              sx={{
                px: "14px", height: 34, borderRadius: "8px",
                border: `1px solid ${HX.border2}`, bgcolor: HX.surface,
                color: HX.tx2, fontSize: "12.5px", textTransform: "none",
                fontFamily: FONT, fontWeight: 600, whiteSpace: "nowrap",
                transition: ".15s", "&:hover": { bgcolor: HX.surface3, borderColor: HX.accent, color: HX.accent },
              }}
            >
              إعادة ضبط
            </Button>
            <Button
              size="small"
              variant="contained"
              disableElevation
              onClick={handleApply}
              startIcon={<FilterAltIcon sx={{ fontSize: "14px !important" }} />}
              sx={{
                px: "16px", height: 34, borderRadius: "8px",
                bgcolor: HX.accent, color: "#fff", fontSize: "12.5px",
                fontFamily: FONT, fontWeight: 600, textTransform: "none",
                "&:hover": { bgcolor: "#5254e0" },
              }}
            >
              تطبيق الفلاتر
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}
