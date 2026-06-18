import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
moment.locale("ar");
import { Box, Typography, CircularProgress } from "@mui/material";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import SendIcon from "@mui/icons-material/Send";
import { ToastContainer, toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import HomixPageHeader from "components/HomixPageHeader/HomixPageHeader";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import EventRepeatOutlinedIcon from "@mui/icons-material/EventRepeatOutlined";
import TimelineIcon from "@mui/icons-material/Timeline";
import axiosRequest from "shared/functions/axiosRequest";
import { shipmentKeys } from "query/keys";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { useShipmentDetailQuery } from "query/shipmentDetail";
import { useShipmentsMetaQuery } from "query/shipmentsMeta";

const FONT = "'Cairo', sans-serif";

/* ── helpers ── */
function fmtNum(n: number | null | undefined): string {
  return Number(n ?? 0).toLocaleString("en-US", { maximumFractionDigits: 0 });
}
function fmtDate(d: string | null | undefined): string {
  if (!d) return "—";
  const m = moment(d).locale("ar");
  return m.isValid() ? m.format("D MMMM YYYY") : "—";
}
function fmtDateTime(d: string | null | undefined): string {
  if (!d) return "—";
  const m = moment(d).locale("ar");
  return m.isValid() ? m.format("D MMMM YYYY، h:mm A") : "—";
}

const STATUS_COLORS: Record<number, { bg: string; color: string; dot: string }> = {
  1:  { bg: HX.amberLight,  color: "#92400e", dot: HX.amber },   // معلقة
  2:  { bg: HX.blueLight,   color: "#1e40af", dot: HX.blue },    // في المخزن
  3:  { bg: HX.tealLight,   color: "#0f766e", dot: HX.teal },    // جاهزة للشحن
  4:  { bg: HX.greenLight,  color: "#065f46", dot: HX.green },   // تم التسليم
  5:  { bg: HX.surface3,    color: HX.tx2,    dot: HX.tx3 },     // ملغية
  6:  { bg: HX.redLight,    color: "#991b1b", dot: HX.red },     // مرفوضة
  7:  { bg: HX.roseLight,   color: "#9f1239", dot: HX.rose },    // مسترجع من العميل
  8:  { bg: HX.purpleLight, color: "#5b21b6", dot: HX.purple },  // مرتجع للمورد
  9:  { bg: HX.accentLight, color: "#3730a3", dot: HX.accent },  // مستبدل
  10: { bg: HX.redLight,    color: "#7f1d1d", dot: HX.red },     // فشل في التوصيل
  11: { bg: HX.blueLight,   color: "#1e40af", dot: HX.blue },    // شحنة مجدولة
  12: { bg: HX.tealLight,   color: "#0f766e", dot: HX.teal },    // خرجت للتوصيل
};

function StatusBadge({ status, label }: { status: number; label: string }) {
  const c = STATUS_COLORS[status] ?? STATUS_COLORS[1];
  return (
    <Box component="span" sx={{
      display: "inline-flex", alignItems: "center", gap: "4px",
      px: "10px", py: "3px", borderRadius: "20px",
      fontFamily: FONT, fontSize: "10.5px", fontWeight: 700, whiteSpace: "nowrap",
      bgcolor: c.bg, color: c.color,
    }}>
      <Box component="span" sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: c.dot, flexShrink: 0 }} />
      {label}
    </Box>
  );
}

function PlainBadge({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <Box component="span" sx={{
      display: "inline-flex", alignItems: "center",
      px: "10px", py: "3px", borderRadius: "20px",
      fontFamily: FONT, fontSize: "10.5px", fontWeight: 700, whiteSpace: "nowrap",
      bgcolor: bg, color,
    }}>
      {label}
    </Box>
  );
}

/* ── Card shell ── */
function Card({ title, icon, extra, noPad, children }: {
  title: string; icon: React.ReactNode; extra?: React.ReactNode; noPad?: boolean; children: React.ReactNode;
}) {
  return (
    <Box sx={{ bgcolor: HX.surface, borderRadius: HX.r, border: `0.5px solid ${HX.border}`, overflow: "hidden" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: "12px 16px", borderBottom: `0.5px solid ${HX.border}` }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: FONT, fontSize: "13px", fontWeight: 700, color: HX.tx }}>
          <Box sx={{ display: "flex", color: HX.tx2, "& svg": { fontSize: 16 } }}>{icon}</Box>
          {title}
        </Box>
        {extra}
      </Box>
      <Box sx={{ p: noPad ? 0 : "16px" }}>{children}</Box>
    </Box>
  );
}

function InfoRow({ icon, iconBg, iconColor, label, value, valueSx }: {
  icon: React.ReactNode; iconBg: string; iconColor: string; label: string; value: React.ReactNode; valueSx?: any;
}) {
  return (
    <Box sx={{
      display: "flex", alignItems: "center", gap: "10px", py: "9px",
      borderBottom: `0.5px solid ${HX.border}`,
      "&:first-of-type": { pt: 0 }, "&:last-of-type": { borderBottom: "none", pb: 0 },
    }}>
      <Box sx={{ width: 30, height: 30, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, bgcolor: iconBg, color: iconColor, "& svg": { fontSize: 15 } }}>
        {icon}
      </Box>
      <Typography sx={{ fontFamily: FONT, fontSize: "11px", color: HX.tx3, fontWeight: 500, minWidth: 110 }}>{label}</Typography>
      <Typography sx={{ fontFamily: FONT, fontSize: "13px", fontWeight: 600, color: HX.tx, flex: 1, ...valueSx }}>{value}</Typography>
    </Box>
  );
}

/* ── Product thumb ── */
function ProductThumb({ image }: { image: string | null }) {
  const isUrl = !!image && /^(https?:)?\/\//.test(image);
  return (
    <Box sx={{
      width: 52, height: 52, borderRadius: "10px", bgcolor: HX.surface2, border: `0.5px solid ${HX.border}`,
      display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", flexShrink: 0, overflow: "hidden",
    }}>
      {isUrl ? <Box component="img" src={image as string} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "📦"}
    </Box>
  );
}

function ProdTag({ children }: { children: React.ReactNode }) {
  return (
    <Box component="span" sx={{
      fontFamily: FONT, fontSize: "10.5px", color: HX.tx2,
      bgcolor: HX.surface2, border: `0.5px solid ${HX.border}`, px: "8px", py: "2px", borderRadius: "5px",
    }}>
      {children}
    </Box>
  );
}

/* ── Loading / error ── */
function CenterState({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", fontFamily: FONT, color: HX.tx2, gap: "10px" }}>
        {children}
      </Box>
    </DashboardLayout>
  );
}

export default function ShipmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useShipmentDetailQuery(id as string);
  const { data: meta } = useShipmentsMetaQuery();

  const [statusValue, setStatusValue] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [sendingNote, setSendingNote] = useState(false);

  if (isLoading) {
    return <CenterState><CircularProgress size={42} sx={{ color: HX.accent }} /></CenterState>;
  }
  if (isError || !data) {
    return <CenterState>تعذّر تحميل تفاصيل الشحنة</CenterState>;
  }

  const { shipment, customer, financial, products, timeline, vendor } = data;
  const currentStatus = statusValue !== "" ? Number(statusValue) : shipment.shipmentStatus;
  const statusOptions = meta?.shipmentStatuses ?? [];
  const notes = data.notes ?? [];

  const sellerInitial = (vendor?.name || shipment.sellerName || "؟").charAt(0);
  const customerInitial = (customer?.name || shipment.customerName || "؟").charAt(0);

  const handleSaveStatus = () => {
    const body = {
      shipmentStatus: currentStatus,
      shipmentType: shipment.shipmentType,
      governorate: shipment.governorate,
      shippingCompany: shipment.shippingCompany,
      shippingFees: shipment.shippingCost,
      shippingReceiveDate: shipment.receivedInWarehouseDate,
      deliveryDate: shipment.deliveryDate,
    };
    setSaving(true);
    axiosRequest
      .put(`/shipments/${shipment.id}`, body)
      .then(() => {
        setSaved(true);
        queryClient.invalidateQueries({ queryKey: shipmentKeys.detail(id as string) });
        queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
        setTimeout(() => setSaved(false), 2000);
      })
      .catch(() => toast.error("تعذّر حفظ التغييرات"))
      .finally(() => setSaving(false));
  };

  const handleSendNote = () => {
    const t = noteText.trim();
    if (!t || sendingNote) return;
    setSendingNote(true);
    axiosRequest
      .post(`/shipments/${shipment.id}/notes`, { text: t })
      .then(() => {
        setNoteText("");
        queryClient.invalidateQueries({ queryKey: shipmentKeys.detail(id as string) });
      })
      .catch(() => toast.error("تعذّر إرسال الملاحظة"))
      .finally(() => setSendingNote(false));
  };

  const shipNumber = shipment.shipmentNumber || `SH-${shipment.id}`;

  const breadcrumbNode = (
    <Box sx={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: FONT, fontSize: "12.5px", color: HX.tx3, flexWrap: "wrap" }}>
      <Box component="span" onClick={() => navigate("/")} sx={{ display: "flex", cursor: "pointer", color: HX.tx2, "&:hover": { color: HX.accent } }}>
        <HomeRoundedIcon sx={{ fontSize: 16 }} />
      </Box>
      <Box component="span" sx={{ color: HX.tx3 }}>/</Box>
      <Box component="span" onClick={() => navigate("/shipments")} sx={{ cursor: "pointer", color: HX.tx2, "&:hover": { color: HX.accent } }}>الشحن والتوصيل</Box>
      <Box component="span" sx={{ color: HX.tx3 }}>/</Box>
      <Box component="span" onClick={() => navigate("/shipments")} sx={{ cursor: "pointer", color: HX.tx2, "&:hover": { color: HX.accent } }}>الشحنات</Box>
      <Box component="span" sx={{ color: HX.tx3 }}>/</Box>
      <Box component="span" sx={{ color: HX.tx, fontWeight: 800 }}>{shipNumber}</Box>
    </Box>
  );

  const headerBtnBase = {
    display: "inline-flex", alignItems: "center", gap: "6px",
    px: "15px", height: 34, borderRadius: "9px", cursor: "pointer",
    fontFamily: FONT, fontSize: "12px", fontWeight: 700, whiteSpace: "nowrap",
    transition: ".15s", "& svg": { fontSize: 15 },
  } as const;

  const actionsNode = (
    <>
      <Box component="button" type="button" onClick={() => window.print()} sx={{
        ...headerBtnBase, border: `0.5px solid ${HX.border}`, bgcolor: HX.surface2, color: HX.tx2,
        "&:hover": { borderColor: HX.accent, color: HX.accent },
      }}>
        <PictureAsPdfOutlinedIcon /> تصدير PDF
      </Box>
      <Box component="button" type="button" sx={{
        ...headerBtnBase, border: "0.5px solid rgba(245,158,11,0.25)", bgcolor: HX.amberLight, color: "#92400e",
        "&:hover": { bgcolor: HX.amber, color: "#fff" },
      }}>
        <EventRepeatOutlinedIcon /> إعادة جدولة
      </Box>
      <Box component="button" type="button" sx={{
        ...headerBtnBase, border: "none", bgcolor: HX.accent, color: "#fff",
        "&:hover": { bgcolor: "#4f46e5" },
      }}>
        <TimelineIcon /> تتبع الشحنة
      </Box>
    </>
  );

  return (
    <DashboardLayout header={<HomixPageHeader breadcrumb={breadcrumbNode} actions={actionsNode} />}>
      <ToastContainer />
      <Box sx={{ fontFamily: FONT, mt: "12px", display: "flex", flexDirection: "column", gap: "14px" }}>

        {/* Shipment header strip */}
        <Box sx={{
          bgcolor: HX.surface, borderRadius: HX.r, border: `0.5px solid ${HX.border}`,
          p: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px", flexWrap: "wrap",
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
            <Box>
              <Typography sx={{ fontFamily: FONT, fontSize: "10px", color: HX.tx3, mb: "2px" }}>رقم الشحنة</Typography>
              <Typography sx={{ fontFamily: FONT, fontSize: "20px", fontWeight: 900, color: HX.accent, lineHeight: 1.1 }}>
                {shipment.shipmentNumber || `SH-${shipment.id}`}
              </Typography>
              <Typography sx={{ fontFamily: FONT, fontSize: "11px", color: HX.tx3, mt: "3px" }}>
                {shipment.operationNumber ? `OP-${shipment.operationNumber}` : ""} {shipment.orderNumber ? `· طلب #${shipment.orderNumber}` : ""}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <Box sx={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <StatusBadge status={shipment.shipmentStatus} label={shipment.shipmentStatusLabel} />
                <PlainBadge label={shipment.paymentStatusLabel} bg={shipment.paymentStatus === 2 ? HX.greenLight : HX.amberLight} color={shipment.paymentStatus === 2 ? "#065f46" : "#92400e"} />
                <PlainBadge label={shipment.shipmentTypeLabel} bg={shipment.shipmentType === "grouped" ? HX.blueLight : HX.tealLight} color={shipment.shipmentType === "grouped" ? "#1e40af" : "#0f766e"} />
              </Box>
              <Typography sx={{ fontFamily: FONT, fontSize: "11px", color: HX.tx3 }}>
                استلام المخزن: {fmtDate(shipment.receivedInWarehouseDate)}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", flexShrink: 0 }}>
            <Typography sx={{ fontFamily: FONT, fontSize: "11px", color: HX.tx3 }}>عداد الأيام</Typography>
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: "5px", bgcolor: HX.amberLight, color: "#92400e", px: "14px", py: "6px", borderRadius: "8px", fontFamily: FONT, fontSize: "14px", fontWeight: 800 }}>
              <AccessTimeIcon sx={{ fontSize: 15 }} /> {shipment.daysCounter ?? 0} يوم
            </Box>
            <Typography sx={{ fontFamily: FONT, fontSize: "10px", color: HX.tx3 }}>
              موعد التسليم: {fmtDate(shipment.scheduledDeliveryDate)}
            </Typography>
          </Box>
        </Box>

        {/* Grid */}
        <Box sx={{ display: "grid", gap: "14px", gridTemplateColumns: { xs: "1fr", lg: "1fr 330px" }, alignItems: "start" }}>

          {/* LEFT */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>

            {/* Products */}
            <Card
              title="المنتجات في هذه الشحنة"
              icon={<Inventory2OutlinedIcon />}
              extra={<Typography sx={{ fontFamily: FONT, fontSize: "11.5px", color: HX.tx3 }}>{products.length} منتج</Typography>}
              noPad
            >
              {products.map((p, i) => (
                <Box key={i} sx={{
                  display: "flex", alignItems: "center", gap: "12px", p: "12px 16px",
                  borderBottom: i < products.length - 1 ? `0.5px solid ${HX.border}` : "none",
                  transition: ".15s", "&:hover": { bgcolor: HX.surface2 },
                }}>
                  <ProductThumb image={p.image} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontFamily: FONT, fontSize: "13px", fontWeight: 700, color: HX.tx, mb: "3px" }}>{p.productName}</Typography>
                    <Box sx={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {p.productCode && <ProdTag>كود: {p.productCode}</ProdTag>}
                      {p.size && <ProdTag>📐 {p.size}</ProdTag>}
                      {p.color && <ProdTag>🎨 {p.color}</ProdTag>}
                      {p.vendorName && <ProdTag>بائع: {p.vendorName}</ProdTag>}
                      {p.quantity > 1 && <ProdTag>الكمية: {p.quantity}</ProdTag>}
                    </Box>
                  </Box>
                  <Typography sx={{ fontFamily: FONT, fontSize: "15px", fontWeight: 900, color: HX.accent, flexShrink: 0 }}>
                    {fmtNum(p.price)} ج.م
                  </Typography>
                </Box>
              ))}
              {products.length === 0 && (
                <Box sx={{ p: "24px", textAlign: "center", fontFamily: FONT, fontSize: "12px", color: HX.tx3 }}>لا توجد منتجات</Box>
              )}
            </Card>

            {/* Shipment details */}
            <Card title="تفاصيل الشحنة" icon={<LocalShippingOutlinedIcon />}>
              <InfoRow icon={<Inventory2OutlinedIcon />} iconBg={HX.accentLight} iconColor={HX.accent} label="رقم الشحنة" value={shipment.shipmentNumber || `SH-${shipment.id}`} valueSx={{ color: HX.accent, fontWeight: 800 }} />
              <InfoRow icon={<ReceiptLongOutlinedIcon />} iconBg={HX.greenLight} iconColor={HX.green} label="رقم الطلب" value={`#${shipment.orderNumber}`} />
              <InfoRow icon={<LocalShippingOutlinedIcon />} iconBg={HX.blueLight} iconColor={HX.blue} label="شركة الشحن" value={shipment.shippingCompany || "—"} valueSx={{ fontWeight: 800 }} />
              <InfoRow icon={<LocalShippingOutlinedIcon />} iconBg={HX.tealLight} iconColor={HX.teal} label="التوصيل بواسطة" value={shipment.deliveryBy || "—"} />
              <InfoRow icon={<AccessTimeIcon />} iconBg={HX.amberLight} iconColor={HX.amber} label="تاريخ الاستلام" value={fmtDate(shipment.receivedInWarehouseDate)} />
              <InfoRow icon={<CalendarTodayOutlinedIcon />} iconBg={HX.tealLight} iconColor={HX.teal} label="موعد التوصيل" value={fmtDate(shipment.scheduledDeliveryDate)} />
              <InfoRow icon={<CheckRoundedIcon />} iconBg={HX.greenLight} iconColor={HX.green} label="تاريخ التسليم" value={shipment.deliveryDate ? fmtDate(shipment.deliveryDate) : "لم يتم بعد"} valueSx={!shipment.deliveryDate ? { color: HX.tx3 } : {}} />
              <InfoRow icon={<PlaceOutlinedIcon />} iconBg={HX.purpleLight} iconColor={HX.purple} label="المحافظة" value={shipment.governorate || "—"} />
            </Card>

            {/* Timeline */}
            <Card title="سجل الأحداث" icon={<HistoryOutlinedIcon />}>
              {timeline.length === 0 ? (
                <Box sx={{ textAlign: "center", fontFamily: FONT, fontSize: "12px", color: HX.tx3, py: "12px" }}>لا توجد أحداث</Box>
              ) : (
                <Box>
                  {timeline.map((ev, i) => {
                    const last = i === timeline.length - 1;
                    const c = last ? { bg: HX.accentLight, color: HX.accent, border: HX.accent } : { bg: HX.greenLight, color: HX.green, border: HX.green };
                    return (
                      <Box key={ev.id} sx={{
                        display: "flex", alignItems: "flex-start", position: "relative",
                        borderRight: `2px solid ${last ? "transparent" : HX.border}`, mr: "14px", pr: "16px", py: "10px",
                      }}>
                        <Box sx={{
                          position: "absolute", right: -15, width: 28, height: 28, borderRadius: "50%",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          bgcolor: c.bg, color: c.color, border: `2px solid ${c.border}`,
                        }}>
                          {last ? <AccessTimeIcon sx={{ fontSize: 13 }} /> : <CheckRoundedIcon sx={{ fontSize: 13 }} />}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ fontFamily: FONT, fontSize: "12.5px", fontWeight: 700, color: HX.tx }}>{ev.message}</Typography>
                          {ev.userName && <Typography sx={{ fontFamily: FONT, fontSize: "11.5px", color: HX.tx2, mt: "2px" }}>{ev.userName}</Typography>}
                          <Typography sx={{ fontFamily: FONT, fontSize: "10.5px", color: HX.tx3, mt: "3px" }}>🕐 {fmtDateTime(ev.changedAt)}</Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Card>

            {/* Notes */}
            <Card
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
                      {(n.userName || "؟").charAt(0)}
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNoteText(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter") handleSendNote(); }}
                  sx={{
                    flex: 1, height: 34, px: "12px", border: `0.5px solid ${HX.border}`, borderRadius: "9px",
                    fontFamily: FONT, fontSize: "12.5px", color: HX.tx, bgcolor: HX.surface, outline: "none", textAlign: "right",
                    "&:focus": { borderColor: HX.accent },
                  }}
                />
                <Box component="button" type="button" onClick={handleSendNote} disabled={sendingNote} sx={{
                  display: "inline-flex", alignItems: "center", gap: "5px", px: "16px", height: 34, borderRadius: "9px", border: "none",
                  bgcolor: HX.accent, color: "#fff", cursor: sendingNote ? "default" : "pointer", fontFamily: FONT, fontSize: "12px", fontWeight: 700, whiteSpace: "nowrap",
                  opacity: sendingNote ? 0.7 : 1, "&:hover": { bgcolor: "#4f46e5" },
                }}>
                  {sendingNote ? <CircularProgress size={13} sx={{ color: "#fff" }} /> : <SendIcon sx={{ fontSize: 14, transform: "scaleX(-1)" }} />}
                  إرسال
                </Box>
              </Box>
            </Card>
          </Box>

          {/* RIGHT */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>

            {/* Client */}
            <Card title="بيانات العميل" icon={<PersonOutlineOutlinedIcon />}>
              <Box sx={{ display: "flex", alignItems: "center", gap: "10px", mb: "14px", pb: "12px", borderBottom: `0.5px solid ${HX.border}` }}>
                <Box sx={{ width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontSize: "15px", fontWeight: 900, color: "#fff", background: "linear-gradient(135deg,#f59e0b,#d97706)", flexShrink: 0 }}>
                  {customerInitial}
                </Box>
                <Box>
                  <Typography sx={{ fontFamily: FONT, fontSize: "13px", fontWeight: 800, color: HX.tx }}>{customer?.name || shipment.customerName || "—"}</Typography>
                  <Typography sx={{ fontFamily: FONT, fontSize: "11px", color: HX.tx3 }}>عميل</Typography>
                </Box>
              </Box>
              <InfoRow icon={<PhoneOutlinedIcon />} iconBg={HX.greenLight} iconColor={HX.green} label="الهاتف" value={customer?.phoneNumber || shipment.customerPhone || "—"} valueSx={{ fontFamily: "monospace", fontSize: "12px", color: HX.tx2 }} />
              <InfoRow icon={<PlaceOutlinedIcon />} iconBg={HX.amberLight} iconColor={HX.amber} label="العنوان" value={customer?.address || "—"} valueSx={{ fontSize: "11.5px" }} />
            </Card>

            {/* Seller */}
            <Card title="البائع" icon={<StorefrontOutlinedIcon />}>
              <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Box sx={{ width: 38, height: 38, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontSize: "15px", fontWeight: 900, color: "#fff", background: "linear-gradient(135deg,#8c7355,#5a4530)", flexShrink: 0 }}>
                  {sellerInitial}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontFamily: FONT, fontSize: "13px", fontWeight: 700, color: HX.tx }}>{vendor?.name || shipment.sellerName || "—"}</Typography>
                </Box>
              </Box>
            </Card>

            {/* Financials */}
            <Card title="التفاصيل المالية" icon={<ReceiptLongOutlinedIcon />} noPad>
              {[
                { label: "إجمالي سعر البيع", value: `${fmtNum(financial.totalPrice)} ج.م` },
                { label: "تكلفة الشحن", value: `${fmtNum(financial.shippingCost)} ج.م` },
              ].map((r) => (
                <Box key={r.label} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: "9px 16px", borderBottom: `0.5px solid ${HX.border}` }}>
                  <Typography sx={{ fontFamily: FONT, fontSize: "12.5px", color: HX.tx2 }}>{r.label}</Typography>
                  <Typography sx={{ fontFamily: FONT, fontSize: "13px", fontWeight: 700, color: HX.tx }}>{r.value}</Typography>
                </Box>
              ))}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: "9px 16px", borderBottom: `0.5px solid ${HX.border}` }}>
                <Typography sx={{ fontFamily: FONT, fontSize: "12.5px", color: HX.tx2 }}>طريقة الدفع</Typography>
                <PlainBadge label={shipment.paymentStatusLabel} bg={shipment.paymentStatus === 2 ? HX.greenLight : HX.amberLight} color={shipment.paymentStatus === 2 ? "#065f46" : "#92400e"} />
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: "11px 16px", background: `linear-gradient(135deg, ${HX.accentLight}, rgba(99,102,241,0.03))`, borderTop: `0.5px solid ${HX.accentBorder}` }}>
                <Typography sx={{ fontFamily: FONT, fontSize: "12.5px", fontWeight: 700, color: HX.tx }}>المبلغ المطلوب تحصيله</Typography>
                <Typography sx={{ fontFamily: FONT, fontSize: "15px", fontWeight: 900, color: HX.accent }}>{fmtNum(financial.amountToCollect)} ج.م</Typography>
              </Box>
            </Card>

            {/* Status control */}
            <Card title="تحديث الحالة" icon={<AccessTimeIcon />}>
              <Typography sx={{ fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: HX.tx3, mb: "6px" }}>حالة الشحنة</Typography>
              <Box
                component="select"
                value={String(currentStatus)}
                onChange={(e: any) => setStatusValue(e.target.value)}
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
                onClick={handleSaveStatus}
                disabled={saving}
                sx={{
                  width: "100%", mt: "12px", py: "9px", borderRadius: "9px", border: "none", cursor: saving ? "default" : "pointer",
                  bgcolor: saved ? HX.green : HX.accent, color: "#fff", fontFamily: FONT, fontSize: "12.5px", fontWeight: 700,
                  opacity: saving ? 0.7 : 1, transition: ".15s", "&:hover": { bgcolor: saved ? HX.green : "#4f46e5" },
                }}
              >
                {saving ? "جارٍ الحفظ..." : saved ? "✓ تم الحفظ" : "حفظ التغييرات"}
              </Box>
            </Card>
          </Box>
        </Box>
      </Box>
    </DashboardLayout>
  );
}
