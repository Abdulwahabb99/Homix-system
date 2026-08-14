import React, { useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import type { SxProps, Theme } from "@mui/material/styles";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { FONT } from "../ShipmentDetails/constants";
import {
  useShippingCompaniesQuery,
  useCreateShippingCompanyMutation,
  useDeleteShippingCompanyMutation,
  useUpdateShippingCompanyMutation,
  type ShippingCompany,
} from "query/shippingCompanies";

type Props = {
  /** معرّف الشركة المختارة، أو معرّفات مفصولة بفاصلة عند تفعيل multiple */
  value: string;
  onChange: (id: string) => void;
  /** يُستخدم في الفلاتر فقط؛ نموذج تعديل الشحنة يظل باختيار واحد. */
  multiple?: boolean;
  /** أنماط إضافية تُدمج فوق المظهر الافتراضي (مثلاً لتصغير الارتفاع داخل الفلاتر) */
  sx?: SxProps<Theme>;
};

// نفس مظهر الحقول في نموذج التعديل: زوايا 10px، نص 12px، حد HX يتحوّل accent عند التركيز.
const acSx = {
  fontFamily: FONT,
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    fontFamily: FONT,
    fontSize: "12px",
    bgcolor: HX.surface,
    minHeight: "44px",
  },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: HX.border },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": { borderColor: HX.accent },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: HX.accent },
  "& .MuiInputBase-input": { fontSize: "12px", fontFamily: FONT, color: "#000" },
  "& .MuiInputLabel-root": {
    fontFamily: FONT,
    fontSize: "12px",
    color: "#000",
    "&.MuiInputLabel-shrink": { fontSize: "11px" },
    "&.Mui-focused": { color: HX.accent },
  },
} as const;

export default function ShippingCompanySelect({ value, onChange, multiple = false, sx }: Props) {
  const { data: companies = [], isLoading } = useShippingCompaniesQuery();
  const createMutation = useCreateShippingCompanyMutation();
  const deleteMutation = useDeleteShippingCompanyMutation();
  const updateMutation = useUpdateShippingCompanyMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  /** null = وضع الإضافة، رقم = وضع تعديل شركة بهذا المعرّف */
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [deletingCompany, setDeletingCompany] = useState<ShippingCompany | null>(null);

  const saving = createMutation.isPending || updateMutation.isPending;

  const rawValues = useMemo(
    () => value.split(",").map((item) => item.trim()).filter(Boolean),
    [value]
  );

  // القيمة الواردة قد تكون معرّفاً أو اسماً (بيانات قديمة) — طبّعها إلى معرّف بعد تحميل القائمة.
  useEffect(() => {
    if (value === "" || value == null || companies.length === 0) return;
    const normalized = rawValues.map((rawValue) => {
      const company = companies.find((c) => String(c.id) === rawValue || c.name === rawValue);
      return company ? String(company.id) : rawValue;
    });
    const nextValue = normalized.join(",");
    if (nextValue !== value) onChange(nextValue);
  }, [companies, value, rawValues, onChange]);

  const selectedOptions = useMemo<ShippingCompany[]>(() => {
    const selectedValues = new Set(rawValues);
    return companies.filter((company) => (
      selectedValues.has(String(company.id)) || selectedValues.has(company.name)
    ));
  }, [companies, rawValues]);

  const selected = useMemo<ShippingCompany | null>(() => {
    return selectedOptions[0] ?? null;
  }, [selectedOptions]);

  const openAdd = () => {
    setEditingId(null);
    setNameInput("");
    setDialogOpen(true);
  };

  const openEdit = (company: ShippingCompany) => {
    setEditingId(company.id);
    setNameInput(company.name);
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    const name = nameInput.trim();
    if (!name || saving) return;
    if (editingId != null) {
      updateMutation.mutate(
        { id: editingId, name },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      createMutation.mutate(name, {
        onSuccess: (created) => {
          setDialogOpen(false);
          if (created?.id != null) {
            const createdId = String(created.id);
            onChange(multiple ? [...rawValues, createdId].join(",") : createdId);
          }
        },
      });
    }
  };

  const handleDelete = () => {
    if (!deletingCompany || deleteMutation.isPending) return;
    const deletedId = deletingCompany.id;
    deleteMutation.mutate(deletedId, {
      onSuccess: () => {
        if (rawValues.includes(String(deletedId))) {
          onChange(rawValues.filter((id) => id !== String(deletedId)).join(","));
        }
        setDeletingCompany(null);
      },
    });
  };

  return (
    <>
      <Autocomplete<ShippingCompany, boolean, false, false>
        fullWidth
        size="small"
        loading={isLoading}
        multiple={multiple}
        disableCloseOnSelect={multiple}
        options={companies}
        value={multiple ? selectedOptions : selected}
        getOptionLabel={(o) => o?.name ?? ""}
        isOptionEqualToValue={(o, v) => o.id === v?.id}
        onChange={(_, opt) => {
          if (Array.isArray(opt)) {
            onChange(opt.map((company) => String(company.id)).join(","));
            return;
          }
          onChange(opt ? String(opt.id) : "");
        }}
        renderTags={(tagValue, getTagProps) => {
          const visible = tagValue.slice(0, 1);
          const hiddenCount = tagValue.length - visible.length;
          return [
            ...visible.map((option, index) => (
              <Chip
                {...getTagProps({ index })}
                key={option.id}
                size="small"
                label={option.name}
                sx={{ maxWidth: 110, height: 24, fontFamily: FONT, fontSize: "11px" }}
              />
            )),
            ...(hiddenCount > 0 ? [
              <Chip
                key="selected-count"
                size="small"
                label={`+${hiddenCount}`}
                sx={{ height: 24, fontFamily: FONT, fontSize: "11px", bgcolor: HX.accentLight, color: HX.accent }}
              />,
            ] : []),
          ];
        }}
        noOptionsText="لا توجد شركات"
        loadingText="جارٍ التحميل…"
        sx={[acSx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])] as SxProps<Theme>}
        renderOption={(
          liProps: React.HTMLAttributes<HTMLLIElement> & { key?: React.Key },
          option: ShippingCompany
        ) => {
          const { key, ...rest } = liProps;
          return (
            <Box
              component="li"
              key={key}
              {...rest}
              sx={{
                display: "flex !important",
                alignItems: "center !important",
                justifyContent: "space-between !important",
                gap: "8px",
                fontFamily: FONT,
                fontSize: "12px",
              }}
            >
              <Box
                component="span"
                sx={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              >
                {option.name}
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                <IconButton
                  size="small"
                  aria-label="تعديل شركة الشحن"
                  title="تعديل"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.stopPropagation();
                    openEdit(option);
                  }}
                  sx={{ p: "3px", color: HX.accent, bgcolor: HX.accentLight, "&:hover": { bgcolor: HX.accentBorder } }}
                >
                  <EditOutlinedIcon sx={{ fontSize: 15 }} />
                </IconButton>
                <IconButton
                  size="small"
                  aria-label="حذف شركة الشحن"
                  title="حذف"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeletingCompany(option);
                  }}
                  sx={{ p: "3px", mr: "3px", color: "#dc2626", bgcolor: HX.redLight, "&:hover": { bgcolor: "#fee2e2" } }}
                >
                  <DeleteOutlineIcon sx={{ fontSize: 15 }} />
                </IconButton>
              </Box>
            </Box>
          );
        }}
        PaperComponent={(paperProps: React.HTMLAttributes<HTMLElement>) => (
          <Paper {...paperProps} sx={{ fontFamily: FONT }}>
            {paperProps.children}
            <Box sx={{ borderTop: `1px solid ${HX.border}`, p: "5px" }}>
              <Button
                fullWidth
                startIcon={<AddIcon sx={{ fontSize: 17 }} />}
                // منع فقدان التركيز الذي يغلق القائمة قبل تسجيل النقرة
                onMouseDown={(e) => e.preventDefault()}
                onClick={openAdd}
                sx={{
                  fontFamily: FONT,
                  fontSize: "12px",
                  fontWeight: 700,
                  color: HX.accent,
                  justifyContent: "flex-start",
                  textTransform: "none",
                  "&:hover": { bgcolor: HX.accentLight },
                }}
              >
                إضافة شركة شحن جديدة
              </Button>
            </Box>
          </Paper>
        )}
        renderInput={(params) => (
          <TextField {...params} label="شركة الشحن" InputLabelProps={{ shrink: true }} />
        )}
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} dir="rtl">
        <DialogTitle sx={{ fontFamily: FONT, fontWeight: 800, fontSize: "15px" }}>
          {editingId != null ? "تعديل شركة الشحن" : "إضافة شركة شحن جديدة"}
        </DialogTitle>
        <DialogContent sx={{ pt: "8px !important", minWidth: 320 }}>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label="اسم شركة الشحن"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
            sx={{ fontFamily: FONT, mt: "6px", "& .MuiInputBase-input": { fontFamily: FONT } }}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions sx={{ px: "16px", pb: "12px" }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ fontFamily: FONT, color: HX.tx2 }}>
            إلغاء
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disableElevation
            disabled={!nameInput.trim() || saving}
            sx={{ fontFamily: FONT, fontWeight: 700, bgcolor: HX.accent, "&:hover": { bgcolor: "#4f46e5" } }}
          >
            {saving ? (
              <CircularProgress size={16} sx={{ color: "#fff" }} />
            ) : editingId != null ? (
              "حفظ"
            ) : (
              "إضافة"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deletingCompany != null}
        onClose={() => !deleteMutation.isPending && setDeletingCompany(null)}
        dir="rtl"
      >
        <DialogTitle sx={{ fontFamily: FONT, fontWeight: 800, fontSize: "15px" }}>
          حذف شركة الشحن
        </DialogTitle>
        <DialogContent sx={{ pt: "8px !important", minWidth: 360 }}>
          <Box sx={{ fontFamily: FONT, fontSize: "13px", lineHeight: 1.9, color: HX.tx2 }}>
            {deletingCompany && deletingCompany.linkedOrdersCount > 0 ? (
              <>
                شركة <strong>{deletingCompany.name}</strong> موجودة في{" "}
                <strong>{deletingCompany.linkedOrdersCount}</strong> طلب. عند الحذف ستتم إزالة
                شركة الشحن من هذه الطلبات، ولن يتم حذف الطلبات نفسها.
              </>
            ) : (
              <>
                هل تريد حذف شركة <strong>{deletingCompany?.name}</strong>؟ لا توجد طلبات مرتبطة بها.
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: "16px", pb: "12px" }}>
          <Button
            disabled={deleteMutation.isPending}
            onClick={() => setDeletingCompany(null)}
            sx={{ fontFamily: FONT, color: HX.tx2 }}
          >
            إلغاء
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            disableElevation
            disabled={deleteMutation.isPending}
            color="error"
            sx={{ fontFamily: FONT, fontWeight: 700 }}
          >
            {deleteMutation.isPending ? (
              <CircularProgress size={16} sx={{ color: "#fff" }} />
            ) : (
              "حذف"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
