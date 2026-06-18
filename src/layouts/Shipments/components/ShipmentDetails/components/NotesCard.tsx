import React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import SendIcon from "@mui/icons-material/Send";
import { HX } from "layouts/Orders/ordersHomixTheme";
import type { ShipmentDetailNote } from "query/shipmentDetail";
import { FONT } from "../constants";
import { fmtDateTime, getInitial } from "../utils";
import DetailCard from "./DetailCard";

export interface NotesCardProps {
  notes: ShipmentDetailNote[];
  noteText: string;
  sending: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
}

/** Notes thread + composer. Posting is delegated to the parent via `onSend`. */
export default function NotesCard({ notes, noteText, sending, onChange, onSend }: NotesCardProps) {
  return (
    <DetailCard
      title="الملاحظات"
      icon={<ChatBubbleOutlineOutlinedIcon />}
      extra={<Typography sx={{ fontFamily: FONT, fontSize: "11px", color: HX.tx3 }}>{notes.length} رسائل</Typography>}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: 240, overflowY: "auto", pb: "4px" }}>
        {notes.length === 0 && (
          <Box sx={{ textAlign: "center", fontFamily: FONT, fontSize: "12px", color: HX.tx3, py: "12px" }}>لا توجد ملاحظات</Box>
        )}
        {notes.map((n) => (
          <Box key={n.id} sx={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
            <Box sx={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontSize: "10px", fontWeight: 800, color: "#fff", background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
              {getInitial(n.userName)}
            </Box>
            <Box>
              <Box sx={{ bgcolor: HX.surface2, border: `0.5px solid ${HX.border}`, color: HX.tx, p: "9px 12px", borderRadius: "0 12px 12px 12px", fontFamily: FONT, fontSize: "12px", lineHeight: 1.6, maxWidth: 360 }}>
                {n.text}
              </Box>
              <Typography sx={{ fontFamily: FONT, fontSize: "10px", color: HX.tx3, mt: "3px" }}>{n.userName} · {fmtDateTime(n.createdAt)}</Typography>
            </Box>
          </Box>
        ))}
      </Box>

      <Box sx={{ borderTop: `0.5px solid ${HX.border}`, pt: "12px", mt: "10px", display: "flex", gap: "8px", alignItems: "center" }}>
        <Box
          component="input"
          placeholder="أضف ملاحظة..."
          value={noteText}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter") onSend(); }}
          sx={{
            flex: 1, height: 34, px: "12px", border: `0.5px solid ${HX.border}`, borderRadius: "9px",
            fontFamily: FONT, fontSize: "12.5px", color: HX.tx, bgcolor: HX.surface, outline: "none", textAlign: "right",
            "&:focus": { borderColor: HX.accent },
          }}
        />
        <Box component="button" type="button" onClick={onSend} disabled={sending} sx={{
          display: "inline-flex", alignItems: "center", gap: "5px", px: "16px", height: 34, borderRadius: "9px", border: "none",
          bgcolor: HX.accent, color: "#fff", cursor: sending ? "default" : "pointer", fontFamily: FONT, fontSize: "12px", fontWeight: 700, whiteSpace: "nowrap",
          opacity: sending ? 0.7 : 1, "&:hover": { bgcolor: "#4f46e5" },
        }}>
          {sending ? <CircularProgress size={13} sx={{ color: "#fff" }} /> : <SendIcon sx={{ fontSize: 14, transform: "scaleX(-1)" }} />}
          إرسال
        </Box>
      </Box>
    </DetailCard>
  );
}
