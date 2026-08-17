/**
 * تعديل جماعي لعدة شحنات محدَّدة: حالة الشحنة، نوع الشحنة، المحافظة،
 * التوصيل بواسطة، والمسؤول. كل حقل اختياري — يُرسل فقط ما تم اختياره فعلاً.
 */
import React, { useState } from "react";
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useShipmentsMetaQuery, type ShipmentsMetaOption } from "query/shipmentsMeta";
import type { BulkUpdateShipmentPayload } from "query/shipmentEdit";

const FONT = "'Cairo', sans-serif";
const PRIMARY = "primary.main";

const formControlSx = {
  width: "100%",
  "& .MuiInputLabel-root": {
    fontSize: "0.875rem",
    color: PRIMARY,
    "&.Mui-focused": { color: PRIMARY },
    "&.MuiInputLabel-shrink": { color: PRIMARY },
  },
  "& .MuiOutlinedInput-root": {
    minHeight: 52,
    borderRadius: 2,
    backgroundColor: "background.paper",
  },
  "& .MuiSelect-select": { py: 1.75, px: 1.5, fontSize: "0.875rem" },
} as const;

const menuProps = {
  PaperProps: { elevation: 8, sx: { borderRadius: 2, mt: 0.5, maxHeight: 360 } },
};

export interface ShipmentsBulkEditModalProps {
  open: boolean;
  selectedCount: number;
  onEdit: (data: BulkUpdateShipmentPayload) => void;
  onClose: () => void;
  isSaving?: boolean;
}

export default function ShipmentsBulkEditModal({
  open,
  selectedCount,
  onEdit,
  onClose,
  isSaving = false,
}: ShipmentsBulkEditModalProps) {
  const { data: meta } = useShipmentsMetaQuery();
  const [shipmentStatus, setShipmentStatus] = useState<number | "">("");
  const [shipmentType, setShipmentType] = useState<string>("");
  const [governorate, setGovernorate] = useState<number | "">("");
  const [deliveryBy, setDeliveryBy] = useState<number | "">("");
  const [assignee, setAssignee] = useState<ShipmentsMetaOption | null>(null);

  const reset = () => {
    setShipmentStatus("");
    setShipmentType("");
    setGovernorate("");
    setDeliveryBy("");
    setAssignee(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = () => {
    const data: BulkUpdateShipmentPayload = {
      ...(shipmentStatus !== "" && { shipmentStatus: Number(shipmentStatus) }),
      ...(shipmentType !== "" && { shipmentType }),
      ...(governorate !== "" && { governorate: String(governorate) }),
      ...(deliveryBy !== "" && { deliveryBy: Number(deliveryBy) }),
      ...(assignee && { userId: Number(assignee.value) }),
    };
    if (Object.keys(data).length === 0) return;
    onEdit(data);
  };

  return (
    <Dialog
      open={open}
      onClose={isSaving ? undefined : handleClose}
      fullWidth
      maxWidth="sm"
      BackdropProps={{ sx: { backgroundColor: "rgba(15, 23, 42, 0.45)" } }}
      PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
    >
      <DialogTitle
        sx={{
          py: 2, px: 2.5, mb: 0.5,
          borderBottom: "1px solid", borderColor: "divider",
          fontSize: "1.05rem", fontWeight: 700, color: PRIMARY, fontFamily: FONT,
        }}
      >
        تعديل الشحنات المحددة
      </DialogTitle>
      <DialogContent sx={{ pt: 1.5, px: 2.5, pb: 0 }}>
        <Typography variant="caption" color="text.secondary" display="block" mb={2} sx={{ fontFamily: FONT }}>
          سيُطبَّق التعديل على {selectedCount} شحنة محددة — الحقول الفارغة لا تتغيّر.
        </Typography>
        <Stack spacing={2.5} sx={{ pb: 2.5 }}>
          <FormControl fullWidth variant="outlined" sx={formControlSx}>
            <InputLabel id="bulk-shipment-status-label">حالة الشحنة</InputLabel>
            <Select
              labelId="bulk-shipment-status-label"
              value={shipmentStatus}
              label="حالة الشحنة"
              onChange={(e) => setShipmentStatus(e.target.value as number | "")}
              MenuProps={menuProps}
            >
              {(meta?.shipmentStatuses ?? []).map((option) => (
                <MenuItem key={option.value} value={Number(option.value)}>{option.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth variant="outlined" sx={formControlSx}>
            <InputLabel id="bulk-shipment-type-label">نوع الشحنة</InputLabel>
            <Select
              labelId="bulk-shipment-type-label"
              value={shipmentType}
              label="نوع الشحنة"
              onChange={(e) => setShipmentType(e.target.value)}
              MenuProps={menuProps}
            >
              {(meta?.shipmentTypes ?? []).map((option) => (
                <MenuItem key={option.value} value={String(option.value)}>{option.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth variant="outlined" sx={formControlSx}>
            <InputLabel id="bulk-governorate-label">المحافظة</InputLabel>
            <Select
              labelId="bulk-governorate-label"
              value={governorate}
              label="المحافظة"
              onChange={(e) => setGovernorate(e.target.value as number | "")}
              MenuProps={menuProps}
            >
              {(meta?.governorates ?? []).map((option) => (
                <MenuItem key={option.value} value={Number(option.value)}>{option.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth variant="outlined" sx={formControlSx}>
            <InputLabel id="bulk-delivery-by-label">التوصيل بواسطة</InputLabel>
            <Select
              labelId="bulk-delivery-by-label"
              value={deliveryBy}
              label="التوصيل بواسطة"
              onChange={(e) => setDeliveryBy(e.target.value as number | "")}
              MenuProps={menuProps}
            >
              {(meta?.deliveryByOptions ?? []).map((option) => (
                <MenuItem key={option.value} value={Number(option.value)}>{option.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Autocomplete
            options={meta?.assignees ?? []}
            value={assignee}
            onChange={(_e, newValue) => setAssignee(newValue)}
            getOptionLabel={(o) => o.label ?? ""}
            isOptionEqualToValue={(o, v) => o.value === v.value}
            noOptionsText="لا يوجد"
            size="small"
            renderInput={(params) => <TextField {...params} label="المسؤول" placeholder="ابحث عن مسؤول..." />}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 2.5, py: 2, borderTop: "1px solid", borderColor: "divider" }}>
        <Button
          onClick={handleClose}
          disabled={isSaving}
          variant="outlined"
          sx={(t) => ({
            fontWeight: 600,
            minWidth: 96,
            color: t.palette.text.primary,
            borderColor: alpha(t.palette.text.primary, 0.32),
            backgroundColor: alpha(t.palette.text.primary, 0.05),
          })}
        >
          إلغاء
        </Button>
        <Button onClick={handleSave} disabled={isSaving} variant="contained" color="primary">
          {isSaving ? "جارٍ الحفظ..." : "تأكيد"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
