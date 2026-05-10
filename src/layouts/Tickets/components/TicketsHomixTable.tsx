import React from "react";
import { Box, Stack, TablePagination } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import type { Ticket } from "../utils/constants";
import { TicketStatusChip, TicketTypeChip, DayCounter } from "./TicketChips";
import TicketsHomixMobileList from "./TicketsHomixMobileList";
import { HX, cardSx } from "../../Orders/ordersHomixTheme";

const FONT = "'Cairo', sans-serif";

const COLS = [
  { key: "op", label: "رقم العملية", w: 110 },
  { key: "order", label: "رقم الطلب", w: 92 },
  { key: "code", label: "كود المنتج", w: 100 },
  { key: "seller", label: "البائع", w: 128 },
  { key: "type", label: "نوع التذكرة", w: 122 },
  { key: "openDate", label: "تاريخ الرفع", w: 98 },
  { key: "closeDate", label: "تاريخ الغلق", w: 98 },
  { key: "days", label: "عداد الأيام", w: 96 },
  { key: "status", label: "الحالة", w: 104 },
  { key: "resp", label: "المسئول", w: 132 },
  { key: "adminReply", label: "رد المسئول", w: 128 },
  { key: "ownerReply", label: "رد صاحب التذكرة", w: 128 },
  { key: "notes", label: "ملاحظات", w: 118 },
  { key: "actions", label: "", w: 88 },
] as const;

const TH: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: "10.5px",
  fontWeight: 700,
  color: HX.tx3,
  background: HX.surface2,
  textAlign: "right",
  padding: "9px 11px",
  borderBottom: `0.5px solid ${HX.border}`,
  borderRight: "none",
  borderLeft: "none",
  whiteSpace: "nowrap",
  letterSpacing: ".3px",
  overflow: "hidden",
};

const TD: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: "12px",
  color: HX.tx,
  textAlign: "right",
  padding: "9px 11px",
  borderBottom: `0.5px solid ${HX.border}`,
  borderRight: "none",
  borderLeft: "none",
  whiteSpace: "nowrap",
  verticalAlign: "middle",
  overflow: "hidden",
};

const AV_COLORS = [
  "linear-gradient(135deg,#6366f1,#a78bfa)",
  "linear-gradient(135deg,#10b981,#059669)",
  "linear-gradient(135deg,#f59e0b,#d97706)",
  "linear-gradient(135deg,#ef4444,#dc2626)",
];
function avColor(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % AV_COLORS.length;
  return AV_COLORS[h];
}

function Ellip({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "block",
        maxWidth: "100%",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function ActionBtn({
  onClick,
  bg,
  hoverBg,
  color,
  children,
}: {
  onClick: (e: React.MouseEvent) => void;
  bg: string;
  hoverBg: string;
  color: string;
  children: React.ReactNode;
}) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 26,
        height: 26,
        borderRadius: 7,
        border: "none",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: hover ? hoverBg : bg,
        color: hover ? "#fff" : color,
        transition: "background .15s, color .15s",
        padding: 0,
      }}
    >
      {children}
    </button>
  );
}

export interface TicketsHomixTableProps {
  /** صفوف الصفحة الحالية (مُقطّعة من الأب) */
  tickets: Ticket[];
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
  headerActions?: React.ReactNode;
  isLoading?: boolean;
}

export default function TicketsHomixTable({
  tickets,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onView,
  onDelete,
  headerActions,
  isLoading = false,
}: TicketsHomixTableProps) {
  const colCount = COLS.length;
  const tableWidth = COLS.reduce((s, c) => s + c.w, 0);

  return (
    <Box sx={{ ...cardSx, display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: "11px 14px",
          borderBottom: `0.5px solid ${HX.border}`,
          flexWrap: "wrap",
          gap: 1,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "baseline",
            flexWrap: "wrap",
            gap: "6px",
            fontFamily: FONT,
          }}
        >
          <Box component="span" sx={{ fontSize: "13px", fontWeight: 700, color: HX.tx }}>
            قائمة التذاكر
          </Box>
          <Box component="span" sx={{ fontSize: "12px", fontWeight: 500, color: HX.tx3 }}>
            —
          </Box>
          <Box
            component="span"
            sx={{
              fontSize: "13.5px",
              fontWeight: 750,
              color: HX.tx,
              letterSpacing: "-0.02em",
            }}
          >
            {`${totalCount.toLocaleString("ar-EG")} تذكرة`}
          </Box>
        </Box>
        {headerActions ? (
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            {headerActions}
          </Stack>
        ) : null}
      </Box>

      <Box
        sx={{
          display: { xs: "block", md: "none" },
          overflow: "auto",
          maxHeight: 560,
          flex: 1,
          scrollbarWidth: "thin",
          scrollbarColor: `${HX.border} transparent`,
        }}
      >
        <TicketsHomixMobileList
          tickets={tickets}
          onView={onView}
          onDelete={onDelete}
          isLoading={isLoading}
        />
      </Box>

      <Box
        component="div"
        sx={{
          display: { xs: "none", md: "block" },
          overflow: "auto",
          maxHeight: 560,
          flex: 1,
          scrollbarWidth: "thin",
          scrollbarColor: `${HX.border} transparent`,
        }}
      >
        <table
          style={{
            tableLayout: "fixed",
            borderCollapse: "collapse",
            minWidth: tableWidth,
            width: "100%",
            fontFamily: FONT,
          }}
        >
          <colgroup>
            {COLS.map((c) => (
              <col key={c.key} style={{ width: c.w }} />
            ))}
          </colgroup>
          <thead style={{ position: "sticky", top: 0, zIndex: 3 }}>
            <tr>
              {COLS.map((c) => (
                <th key={c.key} style={TH}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && tickets.length === 0 && (
              <tr>
                <td colSpan={colCount} style={{ ...TD, textAlign: "center", padding: "40px 0", color: HX.tx3 }}>
                  جارٍ التحميل…
                </td>
              </tr>
            )}
            {!isLoading && tickets.length === 0 && (
              <tr>
                <td colSpan={colCount} style={{ ...TD, textAlign: "center", padding: "40px 0", color: HX.tx3 }}>
                  لا توجد تذاكر مطابقة
                </td>
              </tr>
            )}
            {!isLoading &&
              tickets.map((t) => (
              <tr
                key={t.id}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLTableRowElement).style.background = "#fafbff";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLTableRowElement).style.background = "";
                }}
              >
                <td style={TD}>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(t.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onView(t.id);
                      }
                    }}
                    style={{ color: HX.accent, fontWeight: 800, cursor: "pointer" }}
                  >
                    {t.op}
                  </span>
                </td>
                <td style={{ ...TD, color: HX.tx2, fontWeight: 600 }}>#{t.order}</td>
                <td style={TD}>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: 11,
                      background: HX.surface2,
                      padding: "2px 7px",
                      borderRadius: 5,
                      color: HX.tx2,
                    }}
                  >
                    {t.code}
                  </span>
                </td>
                <td style={TD}>
                  <Ellip>{t.seller}</Ellip>
                </td>
                <td style={TD}>
                  <TicketTypeChip type={t.type} />
                </td>
                <td style={{ ...TD, color: HX.tx3, fontSize: "11.5px" }}>{t.openDate}</td>
                <td style={{ ...TD, color: HX.tx3, fontSize: "11.5px" }}>{t.closeDate}</td>
                <td style={TD}>
                  <DayCounter days={t.days} isOpen={t.status === "مفتوحة"} />
                </td>
                <td style={TD}>
                  <TicketStatusChip status={t.status} />
                </td>
                <td style={TD}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: avColor(t.resp || "?"),
                        fontSize: 9,
                        fontWeight: 800,
                        color: "#fff",
                        flexShrink: 0,
                      }}
                    >
                      {(t.resp ?? "؟").charAt(0)}
                    </span>
                    <Ellip>{t.resp}</Ellip>
                  </span>
                </td>
                <td style={{ ...TD, color: "#1d4ed8", fontWeight: 500, fontSize: "11.5px" }}>
                  <Ellip>{t.adminReply}</Ellip>
                </td>
                <td style={{ ...TD, color: HX.tx2, fontSize: "11.5px" }}>
                  <Ellip>{t.ownerReply || "—"}</Ellip>
                </td>
                <td style={{ ...TD, color: HX.tx3, fontSize: "11.5px" }}>
                  <Ellip>{t.notes || "—"}</Ellip>
                </td>
                <td style={{ ...TD, textAlign: "center" }}>
                  <span style={{ display: "inline-flex", gap: 3, justifyContent: "center" }}>
                    <ActionBtn
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(t.id);
                      }}
                      bg={HX.accentLight}
                      hoverBg={HX.accent}
                      color={HX.accent}
                    >
                      <VisibilityIcon style={{ fontSize: 11 }} />
                    </ActionBtn>
                    <ActionBtn
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(t.id);
                      }}
                      bg={HX.redLight}
                      hoverBg={HX.red}
                      color={HX.red}
                    >
                      <DeleteIcon style={{ fontSize: 11 }} />
                    </ActionBtn>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>

      <Box sx={{ borderTop: `0.5px solid ${HX.border}`, flexShrink: 0 }}>
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, p) => onPageChange(p)}
          rowsPerPage={pageSize}
          rowsPerPageOptions={[pageSize]}
          labelDisplayedRows={({ from, to, count }) =>
            `عرض ${from}–${to} من ${count !== -1 ? count : `أكثر من ${to}`} تذكرة`}
          sx={{
            fontFamily: FONT,
            "& .MuiTablePagination-toolbar": { px: "14px", minHeight: 44, fontFamily: FONT },
            "& .MuiTablePagination-displayedRows": {
              fontSize: "11.5px",
              color: HX.tx2,
              fontFamily: FONT,
            },
            "& .MuiTablePagination-actions button": {
              border: `0.5px solid ${HX.border}`,
              borderRadius: "7px",
              width: 28,
              height: 28,
              color: HX.tx2,
              "&:hover": { bgcolor: HX.surface2 },
            },
          }}
        />
      </Box>
    </Box>
  );
}
