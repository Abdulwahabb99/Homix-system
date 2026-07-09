import React, { useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
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
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { FONT } from "../ShipmentDetails/constants";
import {
  useShippingCompaniesQuery,
  useCreateShippingCompanyMutation,
  useUpdateShippingCompanyMutation,
  type ShippingCompany,
} from "query/shippingCompanies";

type Props = {
  /** معرّف الشركة المختارة (كنص) أو "" */
  value: string;
  onChange: (id: string) => void;
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

export default function ShippingCompanySelect({ value, onChange }: Props) {
  const { data: companies = [], isLoading } = useShippingCompaniesQuery();
  const createMutation = useCreateShippingCompanyMutation();
  const updateMutation = useUpdateShippingCompanyMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  /** null = وضع الإضافة، رقم = وضع تعديل شركة بهذا المعرّف */
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nameInput, setNameInput] = useState("");

  const saving = createMutation.isPending || updateMutation.isPending;

  // القيمة الواردة قد تكون معرّفاً أو اسماً (بيانات قديمة) — طبّعها إلى معرّف بعد تحميل القائمة.
  useEffect(() => {
    if (value === "" || value == null || companies.length === 0) return;
    if (companies.some((c) => String(c.id) === String(value))) return;
    const byName = companies.find((c) => c.name === value);
    if (byName) onChange(String(byName.id));
  }, [companies, value, onChange]);

  const selected = useMemo<ShippingCompany | null>(() => {
    if (value === "" || value == null) return null;
    return (
      companies.find((c) => String(c.id) === String(value)) ??
      companies.find((c) => c.name === value) ??
      null
    );
  }, [companies, value]);

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
          if (created?.id != null) onChange(String(created.id));
        },
      });
    }
  };

  return (
    <>
      <Autocomplete<ShippingCompany>
        fullWidth
        size="small"
        loading={isLoading}
        options={companies}
        value={selected}
        getOptionLabel={(o) => o?.name ?? ""}
        isOptionEqualToValue={(o, v) => o.id === v?.id}
        onChange={(_, opt) => onChange(opt ? String(opt.id) : "")}
        noOptionsText="لا توجد شركات"
        loadingText="جارٍ التحميل…"
        sx={acSx}
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
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px",
                fontFamily: FONT,
                fontSize: "12px",
              }}
            >
              <Box component="span" sx={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
                {option.name}
              </Box>
              <IconButton
                size="small"
                aria-label="تعديل شركة الشحن"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation();
                  openEdit(option);
                }}
                sx={{ p: "3px", color: HX.tx3, "&:hover": { color: HX.accent } }}
              >
                <EditOutlinedIcon sx={{ fontSize: 15 }} />
              </IconButton>
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
    </>
  );
}
