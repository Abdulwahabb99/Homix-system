import React, { useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AttachmentIcon from "@mui/icons-material/Attachment";
import InsertLinkIcon from "@mui/icons-material/InsertLink";
import SendIcon from "@mui/icons-material/Send";
import { Ticket, ChatMessage, Attachment } from "layouts/Tickets/utils/constants";
import { TicketStatusChip, TicketTypeChip, DayCounter } from "layouts/Tickets/components/TicketChips";
import { formatMoneyEgpInteger } from "shared/formatMoney";

const BRAND = "#6366f1";

type Props = {
  ticket: Ticket;
  quickReplies: string[];
  onBack: () => void;
  onUpdateTicket: (updated: Ticket) => void;
};

function InfoItem({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <Box sx={{ gridColumn: full ? "span 2" : undefined }}>
      <Typography
        variant="caption"
        fontWeight={700}
        color="text.secondary"
        display="block"
        mb={0.4}
        sx={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: 0.4 }}
      >
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ fontSize: "0.85rem" }}>
        {children}
      </Typography>
    </Box>
  );
}

function ChatBubble({ msg }: { msg: ChatMessage }) {
  const isAdmin = msg.from === "admin";
  const timePart = msg.time.split(" ")[1] ?? msg.time;
  return (
    <Stack direction={isAdmin ? "row-reverse" : "row"} spacing={1} alignItems="flex-start">
      <Box
        sx={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.65rem",
          fontWeight: 800,
          color: "#fff",
          flexShrink: 0,
          background: isAdmin
            ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
            : "linear-gradient(135deg,#f59e0b,#d97706)",
        }}
      >
        {(msg.name ?? "؟").charAt(0)}
      </Box>
      <Box sx={{ maxWidth: "75%" }}>
        <Box
          sx={{
            px: 1.75,
            py: 1.1,
            borderRadius: isAdmin ? "12px 0 12px 12px" : "0 12px 12px 12px",
            fontSize: "0.82rem",
            lineHeight: 1.6,
            bgcolor: isAdmin ? BRAND : (t: any) => alpha(t.palette.text.primary, 0.06),
            color: isAdmin ? "#fff" : "text.primary",
            border: isAdmin ? "none" : "1px solid",
            borderColor: isAdmin ? "transparent" : "divider",
          }}
        >
          {msg.msg}
        </Box>
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ display: "block", mt: 0.4, textAlign: isAdmin ? "left" : "right", fontSize: "0.68rem" }}
        >
          {msg.name} · {timePart}
        </Typography>
      </Box>
    </Stack>
  );
}

export default function TicketDetailView({ ticket, quickReplies, onBack, onUpdateTicket }: Props) {
  const [chatInput, setChatInput] = useState("");
  const [linkInput, setLinkInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOpen = ticket.status === "مفتوحة";

  function sendMessage() {
    const msg = chatInput.trim();
    if (!msg) return;
    const now = new Date();
    const time = `${now.toISOString().split("T")[0]} ${now.toTimeString().slice(0, 5)}`;
    const newMsg: ChatMessage = { from: "admin", name: "أحمد هشام", msg, time };
    onUpdateTicket({ ...ticket, chat: [...ticket.chat, newMsg], adminReply: msg });
    setChatInput("");
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  function toggleStatus() {
    const newStatus = isOpen ? ("مغلقة" as const) : ("مفتوحة" as const);
    const today = new Date().toISOString().split("T")[0];
    onUpdateTicket({
      ...ticket,
      status: newStatus,
      closeDate: newStatus === "مغلقة" ? today : "—",
      days: newStatus === "مغلقة" ? 0 : ticket.days,
    });
  }

  function handleFileAttach(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const type: Attachment["type"] = file.type.startsWith("image") ? "image" : "video";
    onUpdateTicket({ ...ticket, attachments: [...ticket.attachments, { type, name: file.name }] });
    e.target.value = "";
  }

  function addLink() {
    const val = linkInput.trim();
    if (!val) return;
    onUpdateTicket({ ...ticket, attachments: [...ticket.attachments, { type: "link", name: val }] });
    setLinkInput("");
  }

  const attachIconMap: Record<Attachment["type"], string> = { image: "🖼️", video: "🎬", link: "🔗" };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Back button */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.75}
        sx={{
          cursor: "pointer",
          color: "text.secondary",
          width: "fit-content",
          "&:hover": { color: BRAND },
          transition: "color 0.15s",
        }}
        onClick={onBack}
      >
        <ArrowForwardIcon sx={{ fontSize: 16 }} />
        <Typography variant="body2" fontWeight={600} sx={{ fontSize: "0.82rem" }}>
          العودة للقائمة
        </Typography>
      </Stack>

      <Grid container spacing={2} alignItems="flex-start">
        {/* ── Left column ── */}
        <Grid item xs={12} md={8}>
          <Stack spacing={2}>
            {/* Ticket Info Card */}
            <Paper
              variant="outlined"
              sx={{ borderRadius: 2.5, overflow: "hidden", borderColor: "divider" }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 2,
                  py: 1.5,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box component="span" sx={{ color: BRAND, fontSize: 15 }}>💬</Box>
                  تفاصيل التذكرة —{" "}
                  <Box component="span" sx={{ color: BRAND, fontWeight: 800 }}>
                    {ticket.op}
                  </Box>
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TicketStatusChip status={ticket.status} />
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={toggleStatus}
                    sx={{ borderRadius: 1.5, fontWeight: 600, fontSize: "0.72rem", height: 28, textTransform: "none" }}
                  >
                    تغيير الحالة
                  </Button>
                </Stack>
              </Box>
              <Box
                sx={{
                  p: 2,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 2,
                }}
              >
                <InfoItem label="رقم العملية">
                  <Box component="span" sx={{ color: BRAND, fontWeight: 800 }}>{ticket.op}</Box>
                </InfoItem>
                <InfoItem label="رقم الطلب">#{ticket.order}</InfoItem>
                {ticket.orderTotalEgp != null && (
                  <InfoItem label="إجمالي الطلب (ج.م)">{formatMoneyEgpInteger(ticket.orderTotalEgp)}</InfoItem>
                )}
                <InfoItem label="كود المنتج">
                  <Box
                    component="span"
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "0.78rem",
                      bgcolor: (t) => alpha(t.palette.text.primary, 0.06),
                      px: 0.75,
                      py: 0.25,
                      borderRadius: 1,
                    }}
                  >
                    {ticket.code}
                  </Box>
                </InfoItem>
                <InfoItem label="البائع">{ticket.seller}</InfoItem>
                <InfoItem label="نوع التذكرة">
                  <TicketTypeChip type={ticket.type} />
                </InfoItem>
                <InfoItem label="المسئول">{ticket.resp}</InfoItem>
                <InfoItem label="تاريخ الرفع">{ticket.openDate}</InfoItem>
                <InfoItem label="تاريخ الغلق">{ticket.closeDate}</InfoItem>
                <InfoItem label="عداد الأيام">
                  <DayCounter days={ticket.days} isOpen={isOpen} />
                </InfoItem>
                <InfoItem label="رد المسئول">{ticket.adminReply || "—"}</InfoItem>
                <InfoItem label="ملاحظات" full>{ticket.notes || "—"}</InfoItem>
              </Box>
            </Paper>

            {/* Attachments Card */}
            <Paper
              variant="outlined"
              sx={{ borderRadius: 2.5, overflow: "hidden", borderColor: "divider" }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 2,
                  py: 1.5,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AttachmentIcon sx={{ fontSize: 15, color: "text.secondary" }} />
                  المرفقات
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ borderRadius: 1.5, fontWeight: 600, fontSize: "0.72rem", height: 28, textTransform: "none" }}
                >
                  + إضافة مرفق
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept="image/*,video/*"
                  onChange={handleFileAttach}
                />
              </Box>
              <Box sx={{ p: 2 }}>
                {ticket.attachments.length > 0 && (
                  <Grid container spacing={1} mb={1.5}>
                    {ticket.attachments.map((a, i) => (
                      <Grid item xs={4} key={i}>
                        <Box
                          sx={{
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                            p: 1.25,
                            textAlign: "center",
                            bgcolor: (t) => alpha(t.palette.text.primary, 0.03),
                            cursor: "pointer",
                            "&:hover": { borderColor: BRAND, color: BRAND },
                            transition: "0.15s",
                          }}
                        >
                          <Box sx={{ fontSize: "1.25rem", mb: 0.5 }}>{attachIconMap[a.type]}</Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: "block",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              fontSize: "0.68rem",
                            }}
                          >
                            {a.name}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}

                {/* Drop zone */}
                <Box
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    border: "1px dashed",
                    borderColor: "divider",
                    borderRadius: 2,
                    p: 2,
                    textAlign: "center",
                    cursor: "pointer",
                    color: "text.disabled",
                    "&:hover": { borderColor: BRAND, color: BRAND },
                    transition: "0.15s",
                    mb: 1.5,
                  }}
                >
                  <Box sx={{ fontSize: "1.1rem", mb: 0.5 }}>📎</Box>
                  <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
                    اسحب صورة أو فيديو هنا، أو اضغط للرفع
                  </Typography>
                </Box>

                {/* Link input */}
                <Stack direction="row" spacing={1}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="أضف رابط..."
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addLink()}
                    InputProps={{ startAdornment: <InsertLinkIcon sx={{ fontSize: 16, color: "text.disabled", mr: 0.5 }} /> }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                  <Button
                    variant="contained"
                    disableElevation
                    onClick={addLink}
                    sx={{ borderRadius: 2, fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0, bgcolor: BRAND, "&:hover": { bgcolor: "#5254e0" } }}
                  >
                    إضافة رابط
                  </Button>
                </Stack>
              </Box>
            </Paper>
          </Stack>
        </Grid>

        {/* ── Right column: Chat ── */}
        <Grid item xs={12} md={4}>
          <Paper
            variant="outlined"
            sx={{
              borderRadius: 2.5,
              overflow: "hidden",
              borderColor: "divider",
              display: "flex",
              flexDirection: "column",
              minHeight: 480,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2,
                py: 1.5,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="body2" fontWeight={700} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                💬 المحادثة
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.72rem" }}>
                {ticket.chat.length} رسائل
              </Typography>
            </Box>

            {/* Messages */}
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                px: 2,
                py: 1.5,
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                minHeight: 200,
                maxHeight: 340,
                scrollbarWidth: "thin",
              }}
            >
              {ticket.chat.map((m, i) => (
                <ChatBubble key={i} msg={m} />
              ))}
              <div ref={chatEndRef} />
            </Box>

            <Divider />

            {/* Quick replies + input */}
            <Box sx={{ p: 1.5 }}>
              <Typography variant="caption" fontWeight={700} color="text.disabled" display="block" mb={0.75}>
                ردود سريعة:
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.25 }}>
                {quickReplies.slice(0, 8).map((r) => (
                  <Chip
                    key={r}
                    label={r}
                    size="small"
                    onClick={() => setChatInput(r)}
                    sx={{
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      bgcolor: (t) => alpha(t.palette.text.primary, 0.06),
                      color: "text.secondary",
                      border: "1px solid",
                      borderColor: "divider",
                      "&:hover": {
                        borderColor: alpha(BRAND, 0.5),
                        color: BRAND,
                        bgcolor: alpha(BRAND, 0.08),
                      },
                      transition: "0.15s",
                    }}
                  />
                ))}
              </Box>
              <Stack direction="row" spacing={1}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="اكتب ردك..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
                <Button
                  variant="contained"
                  disableElevation
                  onClick={sendMessage}
                  sx={{
                    borderRadius: 2,
                    minWidth: 80,
                    fontWeight: 700,
                    flexShrink: 0,
                    bgcolor: BRAND,
                    "&:hover": { bgcolor: "#5254e0" },
                  }}
                  endIcon={<SendIcon sx={{ fontSize: 14 }} />}
                >
                  إرسال
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
