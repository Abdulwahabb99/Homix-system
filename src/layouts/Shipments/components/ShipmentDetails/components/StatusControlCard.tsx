import React from "react";
import { Box, Typography } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { HX } from "layouts/Orders/ordersHomixTheme";
import type { ShipmentDetailInfo } from "query/shipmentDetail";
import type { ShipmentsMetaOption } from "query/shipmentsMeta";
import { FONT } from "../constants";
import DetailCard from "./DetailCard";

export interface StatusControlCardProps {
  shipment: ShipmentDetailInfo;
  statusOptions: ShipmentsMetaOption[];
  currentStatus: number;
  onChange: (value: string) => void;
  saving: boolean;
  saved: boolean;
  onSave: () => void;
}

/** Status dropdown + save button (persists via the parent's `onSave`). */
export default function StatusControlCard({
  shipment, statusOptions, currentStatus, onChange, saving, saved, onSave,
}: StatusControlCardProps) {
  return (
    <DetailCard title="تحديث الحالة" icon={<AccessTimeIcon />}>
      <Typography sx={{ fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: HX.tx3, mb: "6px" }}>حالة الشحنة</Typography>
      <Box
        component="select"
        value={String(currentStatus)}
        onChange={(e: any) => onChange(e.target.value)}
        sx={{
          width: "100%", height: 36, px: "10px", border: `0.5px solid ${HX.border}`, borderRadius: "8px",
          fontFamily: FONT, fontSize: "12.5px", color: HX.tx, bgcolor: HX.surface, cursor: "pointer", outline: "none",
          "&:focus": { borderColor: HX.accent },
        }}
      >
        {statusOptions.length === 0 && <option value={String(shipment.shipmentStatus)}>{shipment.shipmentStatusLabel}</option>}
        {statusOptions.map((o) => (
          <option key={o.value} value={String(o.value)}>{o.label}</option>
        ))}
      </Box>
      <Box
        component="button"
        type="button"
        onClick={onSave}
        disabled={saving}
        sx={{
          width: "100%", mt: "12px", py: "9px", borderRadius: "9px", border: "none", cursor: saving ? "default" : "pointer",
          bgcolor: saved ? HX.green : HX.accent, color: "#fff", fontFamily: FONT, fontSize: "12.5px", fontWeight: 700,
          opacity: saving ? 0.7 : 1, transition: ".15s", "&:hover": { bgcolor: saved ? HX.green : "#4f46e5" },
        }}
      >
        {saving ? "جارٍ الحفظ..." : saved ? "✓ تم الحفظ" : "حفظ التغييرات"}
      </Box>
    </DetailCard>
  );
}
