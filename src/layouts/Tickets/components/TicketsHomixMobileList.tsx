import React from "react";
import { Box, Stack } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import type { Ticket } from "../utils/constants";
import { TicketStatusChip, TicketTypeChip, DayCounter } from "./TicketChips";
import { HX } from "../../Orders/ordersHomixTheme";

const FONT = "'Cairo', sans-serif";

function ActionBtn({
  onClick,
  tone,
  children,
}: {
  onClick: () => void;
  tone: "accent" | "danger" | "edit";
  children: React.ReactNode;
}) {
  const [hover, setHover] = React.useState(false);
  const fill = tone === "accent" ? HX.accent : tone === "danger" ? HX.red : "#059669";
  const restBorder =
    tone === "accent"
      ? HX.accentBorder
      : tone === "danger"
        ? "rgba(239,68,68,0.42)"
        : "rgba(5,150,105,0.45)";
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 24,
        height: 24,
        borderRadius: 6,
        border: `1px solid ${hover ? fill : restBorder}`,
        boxSizing: "border-box",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: hover ? fill : HX.surface,
        color: hover ? "#fff" : fill,
        transition: "background .15s, color .15s, border-color .15s",
        padding: 0,
      }}
    >
      {children}
    </button>
  );
}

interface Props {
  tickets: Ticket[];
  onView: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit?: (ticket: Ticket) => void;
  isLoading?: boolean;
}

/** قائمة بطاقات للشاشات &lt; md — نفس فكرة OrdersHomixMobileList */
export default function TicketsHomixMobileList({
  tickets,
  onView,
  onDelete,
  onEdit,
  isLoading = false,
}: Props) {
  if (isLoading && tickets.length === 0) {
    return (
      <Box
        sx={{
          py: 4,
          px: 2,
          textAlign: "center",
          fontFamily: FONT,
          fontSize: "12.5px",
          color: HX.tx3,
        }}
      >
        جارٍ التحميل…
      </Box>
    );
  }

  if (tickets.length === 0) {
    return (
      <Box
        sx={{
          py: 4,
          px: 2,
          textAlign: "center",
          fontFamily: FONT,
          fontSize: "12.5px",
          color: HX.tx3,
        }}
      >
        لا توجد تذاكر مطابقة
      </Box>
    );
  }

  return (
    <Stack spacing={1} sx={{ p: "10px 12px 12px", fontFamily: FONT }}>
      {tickets.map((t) => (
        <Box
          key={t.id}
          sx={{
            borderRadius: "10px",
            border: `0.5px solid ${HX.border}`,
            bgcolor: HX.surface,
            boxShadow: "0 1px 0 rgba(15,23,42,0.04)",
            p: "8px 10px",
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.75 }}>
            <Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap" useFlexGap>
              <Box
                component="button"
                type="button"
                onClick={() => onView(t.id)}
                sx={{
                  border: "none",
                  background: "none",
                  p: 0,
                  cursor: "pointer",
                  fontFamily: FONT,
                  fontSize: "12.5px",
                  fontWeight: 800,
                  color: HX.accent,
                }}
              >
                {t.op}
              </Box>
              <Box
                component="span"
                sx={{ fontSize: "11.5px", fontWeight: 600, color: HX.tx2, fontFamily: FONT }}
              >
                #{t.order}
              </Box>
            </Stack>
            <Stack direction="row" spacing={0.35}>
              {onEdit ? (
                <ActionBtn onClick={() => onEdit(t)} tone="edit">
                  <EditOutlinedIcon sx={{ fontSize: 13 }} />
                </ActionBtn>
              ) : null}
              <ActionBtn onClick={() => onView(t.id)} tone="accent">
                <VisibilityIcon sx={{ fontSize: 13 }} />
              </ActionBtn>
              <ActionBtn onClick={() => onDelete(t.id)} tone="danger">
                <DeleteIcon sx={{ fontSize: 13 }} />
              </ActionBtn>
            </Stack>
          </Stack>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: "5px", mb: 0.65 }}>
            <TicketTypeChip type={t.type} />
            <TicketStatusChip status={t.status} />
            <DayCounter days={t.days} isOpen={t.status === "مفتوحة"} />
          </Box>

          <Box sx={{ fontSize: "10.5px", color: HX.tx3, mb: 0.35 }}>
            {t.seller} · {t.code}
          </Box>
          <Box sx={{ fontSize: "10.5px", color: HX.tx3 }}>
            رفع {t.openDate}
            {t.closeDate !== "—" ? ` · إغلاق ${t.closeDate}` : ""}
          </Box>
        </Box>
      ))}
    </Stack>
  );
}
