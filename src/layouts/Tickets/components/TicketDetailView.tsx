import React, { useEffect, useMemo, useRef, useState } from "react";
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
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Ticket, ChatMessage, Attachment } from "layouts/Tickets/utils/constants";
import { TicketStatusChip, TicketTypeChip, DayCounter } from "layouts/Tickets/components/TicketChips";
import { formatMoneyEgpInteger } from "shared/formatMoney";

const BRAND = "#6366f1";

function attachmentOpenHref(url: string | undefined): string | undefined {
  if (!url?.trim()) return undefined;
  const u = url.trim();
  if (/^https?:\/\//i.test(u)) return u;
  const base = String(process.env.REACT_APP_API_URL ?? "").replace(/\/$/, "");
  return base ? `${base}/${u.replace(/^\//, "")}` : u;
}

/** أزرار فرعية أوضح من outlined الافتراضي (تباين ثابت في كل الثيمات) */
const btnOutlinedBrandSx = {
  borderRadius: 1.5,
  fontWeight: 600,
  fontSize: "0.72rem",
  height: 28,
  minWidth: 0,
  px: 1.25,
  py: 0,
  textTransform: "none" as const,
  flexShrink: 0,
  color: BRAND,
  border: `1px solid ${alpha(BRAND, 0.5)}`,
  bgcolor: "background.paper",
  boxShadow: "none",
  "&:hover": {
    border: `1px solid ${BRAND}`,
    bgcolor: alpha(BRAND, 0.1),
    color: BRAND,
    boxShadow: "none",
  },
} as const;

type Props = {
  ticket: Ticket;
  quickReplies: string[];
  onBack: () => void;
  onUpdateTicket: (updated: Ticket) => void;
  onSendChatMessage: (text: string) => Promise<void>;
  sendChatPending?: boolean;
  /** PUT /tickets/.../notes/{id} — متاح فقط للأدمن في الواجهة */
  onEditNote?: (noteId: string, text: string) => Promise<void>;
  editNotePending?: boolean;
  /** DELETE نفس المسار — للأدمن فقط في الواجهة */
  onDeleteNote?: (noteId: string) => Promise<void>;
  deleteNotePending?: boolean;
  /** POST /tickets/.../attachments/upload — عند التوفّر يُرفع الملف للخادم ويُحدَّث العرض بعد النجاح */
  onUploadFiles?: (files: File[]) => Promise<void>;
  uploadFilesPending?: boolean;
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

function ChatBubble({
  msg,
  currentUserId,
  isAdminUser,
  onEditNote,
  editNotePending,
  onDeleteNote,
  deleteNotePending,
}: {
  msg: ChatMessage;
  currentUserId: number | null;
  isAdminUser: boolean;
  onEditNote?: (noteId: string, text: string) => Promise<void>;
  editNotePending?: boolean;
  onDeleteNote?: (noteId: string) => Promise<void>;
  deleteNotePending?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(msg.msg);

  useEffect(() => {
    setDraft(msg.msg);
  }, [msg.msg]);

  const isMine =
    msg.authorUserId != null &&
    currentUserId != null &&
    Number(msg.authorUserId) === Number(currentUserId);
  const isFromRoleAdmin = msg.from === "admin";
  const timePart = msg.time.split(" ")[1] ?? msg.time;

  const noteId = msg.id;
  const isOptimisticNote = noteId != null && String(noteId).startsWith("optimistic-");
  const canMutateOwnNote = Boolean(isAdminUser && isMine && noteId && !isOptimisticNote);
  const canEdit = canMutateOwnNote && Boolean(onEditNote);
  const canDelete = canMutateOwnNote && Boolean(onDeleteNote);
  const noteActionPending = Boolean(editNotePending || deleteNotePending);

  if (isMine) {
    return (
      <Stack direction="row-reverse" spacing={1} alignItems="flex-start">
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
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            boxShadow: "0 0 0 2px rgba(99,102,241,0.35)",
          }}
        >
          {(msg.name ?? "؟").charAt(0)}
        </Box>
        <Box sx={{ maxWidth: "75%", flex: 1, minWidth: 0 }}>
          {editing && canEdit ? (
            <Box>
              <TextField
                fullWidth
                multiline
                minRows={2}
                size="small"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={noteActionPending}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "background.paper" } }}
              />
              <Stack direction="row" spacing={0.75} justifyContent="flex-end" mt={1}>
                <Button
                  size="small"
                  onClick={() => {
                    setDraft(msg.msg);
                    setEditing(false);
                  }}
                  disabled={noteActionPending}
                  sx={{ textTransform: "none", fontSize: "0.72rem" }}
                >
                  إلغاء
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  disableElevation
                  disabled={noteActionPending || !draft.trim()}
                  onClick={async () => {
                    if (!noteId || !onEditNote) return;
                    try {
                      await onEditNote(noteId, draft.trim());
                      setEditing(false);
                    } catch {
                      /* الخطأ من usePutTicketNote */
                    }
                  }}
                  sx={{
                    textTransform: "none",
                    fontSize: "0.72rem",
                    bgcolor: BRAND,
                    "&:hover": { bgcolor: "#5254e0" },
                  }}
                >
                  حفظ
                </Button>
              </Stack>
            </Box>
          ) : (
            <Box
              sx={{
                px: 1.75,
                py: 1.1,
                borderRadius: "12px 0 12px 12px",
                fontSize: "0.82rem",
                lineHeight: 1.6,
                bgcolor: BRAND,
                color: "#fff",
                border: "1px solid",
                borderColor: "rgba(255,255,255,0.2)",
              }}
            >
              {msg.msg}
            </Box>
          )}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            gap={0.5}
            sx={{ mt: 0.4 }}
          >
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.68rem",
                fontWeight: 700,
                color: BRAND,
              }}
            >
              أنت · {timePart}
            </Typography>
            {(canEdit || canDelete) && !editing ? (
              <Stack direction="row" alignItems="center" spacing={0}>
                {canEdit ? (
                  <Tooltip title="تعديل الملاحظة">
                    <IconButton
                      size="small"
                      aria-label="تعديل"
                      onClick={() => setEditing(true)}
                      disabled={noteActionPending}
                      sx={{ color: BRAND, p: 0.35 }}
                    >
                      <EditIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                ) : null}
                {canDelete ? (
                  <Tooltip title="حذف الملاحظة">
                    <IconButton
                      size="small"
                      aria-label="حذف"
                      disabled={noteActionPending}
                      onClick={async () => {
                        if (!noteId || !onDeleteNote) return;
                        if (!window.confirm("هل تريد حذف هذه الملاحظة؟")) return;
                        try {
                          await onDeleteNote(noteId);
                        } catch {
                          /* من useDeleteTicketNote */
                        }
                      }}
                      sx={{ color: BRAND, p: 0.35 }}
                    >
                      <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                ) : null}
              </Stack>
            ) : null}
          </Stack>
        </Box>
      </Stack>
    );
  }

  const rowReverse = isFromRoleAdmin;
  return (
    <Stack direction={rowReverse ? "row-reverse" : "row"} spacing={1} alignItems="flex-start">
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
          background: isFromRoleAdmin
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
            borderRadius: isFromRoleAdmin ? "12px 0 12px 12px" : "0 12px 12px 12px",
            fontSize: "0.82rem",
            lineHeight: 1.6,
            bgcolor: isFromRoleAdmin
              ? (t) => alpha(BRAND, 0.11)
              : (t: any) => alpha(t.palette.text.primary, 0.06),
            color: "text.primary",
            border: "1px solid",
            borderColor: isFromRoleAdmin ? alpha(BRAND, 0.28) : "divider",
          }}
        >
          {msg.msg}
        </Box>
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{
            display: "block",
            mt: 0.4,
            textAlign: rowReverse ? "left" : "right",
            fontSize: "0.68rem",
          }}
        >
          {msg.name} · {timePart}
        </Typography>
      </Box>
    </Stack>
  );
}

export default function TicketDetailView({
  ticket,
  quickReplies,
  onBack,
  onUpdateTicket,
  onSendChatMessage,
  sendChatPending = false,
  onEditNote,
  editNotePending = false,
  onDeleteNote,
  deleteNotePending = false,
  onUploadFiles,
  uploadFilesPending = false,
}: Props) {
  const [chatInput, setChatInput] = useState("");
  const [linkInput, setLinkInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOpen = ticket.status === "مفتوحة";

  const { currentUserId, isAdminUser } = useMemo(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}") as {
        id?: unknown;
        userId?: unknown;
        userType?: unknown;
      };
      const id = Number(u?.id ?? u?.userId);
      return {
        currentUserId: Number.isFinite(id) ? id : null,
        /** أدمن فقط (نفس المشروع: userType === "1") — يمكنه تعديل ملاحظاته */
        isAdminUser: String(u?.userType) === "1",
      };
    } catch {
      return { currentUserId: null, isAdminUser: false };
    }
  }, []);

  useEffect(() => {
    if (ticket.chat.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [ticket.chat.length]);

  async function sendMessage() {
    const msg = chatInput.trim();
    if (!msg || sendChatPending) return;
    try {
      await onSendChatMessage(msg);
      setChatInput("");
      onUpdateTicket({ ...ticket, adminReply: msg });
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch {
      /* فشل الإرسال: التراجع والـ toast من usePostTicketNote */
    }
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

  async function handleFileAttach(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || uploadFilesPending) return;
    const reset = () => {
      e.target.value = "";
    };
    if (onUploadFiles) {
      try {
        await onUploadFiles([file]);
      } catch {
        /* الإشعار من useUploadTicketAttachments */
      }
      reset();
      return;
    }
    const type: Attachment["type"] = file.type.startsWith("image")
      ? "image"
      : file.type.startsWith("video")
        ? "video"
        : "file";
    onUpdateTicket({ ...ticket, attachments: [...ticket.attachments, { type, name: file.name }] });
    reset();
  }

  function addLink() {
    const val = linkInput.trim();
    if (!val) return;
    onUpdateTicket({ ...ticket, attachments: [...ticket.attachments, { type: "link", name: val }] });
    setLinkInput("");
  }

  const attachIconMap: Record<Attachment["type"], string> = {
    image: "🖼️",
    video: "🎬",
    link: "🔗",
    file: "📄",
  };

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
                    color="inherit"
                    disableElevation
                    onClick={toggleStatus}
                    sx={btnOutlinedBrandSx}
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
                  color="inherit"
                  disableElevation
                  disabled={uploadFilesPending}
                  onClick={() => fileInputRef.current?.click()}
                  sx={btnOutlinedBrandSx}
                >
                  + إضافة مرفق
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept="image/*,video/*,application/pdf,.pdf,.doc,.docx"
                  onChange={handleFileAttach}
                />
              </Box>
              <Box sx={{ p: 2 }}>
                {ticket.attachments.length > 0 && (
                  <Grid container spacing={1} mb={1.5}>
                    {ticket.attachments.map((a, i) => (
                      <Grid item xs={4} key={a.id != null ? `att-${a.id}` : `att-${i}-${a.name}`}>
                        <Box
                          onClick={() => {
                            const href = attachmentOpenHref(a.url);
                            if (href) window.open(href, "_blank", "noopener,noreferrer");
                          }}
                          sx={{
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                            p: 1.25,
                            textAlign: "center",
                            bgcolor: (t) => alpha(t.palette.text.primary, 0.03),
                            cursor: attachmentOpenHref(a.url) ? "pointer" : "default",
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
                  onClick={() => !uploadFilesPending && fileInputRef.current?.click()}
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
                    اسحب ملفًا هنا (صورة، فيديو، PDF…) أو اضغط للرفع
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
                {ticket.chat.length} رسالة
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
                <ChatBubble
                  key={m.id ?? `c-${i}-${m.time}`}
                  msg={m}
                  currentUserId={currentUserId}
                  isAdminUser={isAdminUser}
                  onEditNote={onEditNote}
                  editNotePending={editNotePending}
                  onDeleteNote={onDeleteNote}
                  deleteNotePending={deleteNotePending}
                />
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
                  onKeyDown={(e) => e.key === "Enter" && void sendMessage()}
                  disabled={sendChatPending}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
                <Button
                  variant="contained"
                  disableElevation
                  onClick={() => void sendMessage()}
                  disabled={sendChatPending}
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
