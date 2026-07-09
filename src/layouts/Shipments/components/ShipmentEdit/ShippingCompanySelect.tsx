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
  Paper,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { FONT } from "../ShipmentDetails/constants";
import {
  useShippingCompaniesQuery,
  useCreateShippingCompanyMutation,
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

  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");

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

  const handleCreate = () => {
    const name = newName.trim();
    if (!name || createMutation.isPending) return;
    createMutation.mutate(name, {
      onSuccess: (created) => {
        setAddOpen(false);
        setNewName("");
        if (created?.id != null) onChange(String(created.id));
      },
    });
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
        PaperComponent={(props) => (
          <Paper {...props} sx={{ fontFamily: FONT }}>
            {props.children}
            <Box sx={{ borderTop: `1px solid ${HX.border}`, p: "5px" }}>
              <Button
                fullWidth
                startIcon={<AddIcon sx={{ fontSize: 17 }} />}
                // منع فقدان التركيز الذي يغلق القائمة قبل تسجيل النقرة
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setAddOpen(true)}
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

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} dir="rtl">
        <DialogTitle sx={{ fontFamily: FONT, fontWeight: 800, fontSize: "15px" }}>
          إضافة شركة شحن جديدة
        </DialogTitle>
        <DialogContent sx={{ pt: "8px !important", minWidth: 320 }}>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label="اسم شركة الشحن"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
            sx={{ fontFamily: FONT, mt: "6px", "& .MuiInputBase-input": { fontFamily: FONT } }}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions sx={{ px: "16px", pb: "12px" }}>
          <Button onClick={() => setAddOpen(false)} sx={{ fontFamily: FONT, color: HX.tx2 }}>
            إلغاء
          </Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disableElevation
            disabled={!newName.trim() || createMutation.isPending}
            sx={{ fontFamily: FONT, fontWeight: 700, bgcolor: HX.accent, "&:hover": { bgcolor: "#4f46e5" } }}
          >
            {createMutation.isPending ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "إضافة"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
