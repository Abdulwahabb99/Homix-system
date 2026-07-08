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
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import EditIcon from "@mui/icons-material/Edit";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import ScheduleIcon from "@mui/icons-material/Schedule";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { Ticket, ChatMessage, Attachment } from "layouts/Tickets/utils/constants";
import { TicketStatusChip, TicketTypeChip, DayCounter } from "layouts/Tickets/components/TicketChips";
import ConfirmDeleteModal from "layouts/Orders/components/ConfirmDeleteModal";
import { formatMoneyEgpInteger } from "shared/formatMoney";
import type { TicketUpdatePayload } from "query/ticketUpdate.api";

const BRAND = "#6366f1";

type EventTone = "primary" | "success" | "error" | "info" | "warning";

/** أيقونة/لون حدث سجل الأحداث حسب نوعه (ألوان من ثيم MUI لدعم الوضعين الفاتح/الداكن) */
function ticketEventStyle(eventType: string): { tone: EventTone; Icon: React.ElementType } {
  switch (eventType) {
    case "ticket_created":
      return { tone: "success", Icon: CheckCircleOutlineIcon };
    case "attachment_added":
      return { tone: "success", Icon: AttachFileIcon };
    case "attachment_deleted":
      return { tone: "error", Icon: DeleteOutlineIcon };
    case "status_updated":
      return { tone: "info", Icon: FlagOutlinedIcon };
    case "assignee_changed":
    case "assignee_updated":
      return { tone: "info", Icon: PersonOutlineIcon };
    case "note_added":
      return { tone: "primary", Icon: ChatBubbleOutlineIcon };
    case "ticket_updated":
      return { tone: "warning", Icon: EditOutlinedIcon };
    default:
      return { tone: "primary", Icon: ScheduleIcon };
  }
}

/** "٨ يوليو ٢٠٢٦، ٣:٥٨ م" — تنسيق عربي لوقت الحدث */
function formatTicketEventTime(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

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
  /** DELETE /tickets/.../attachments/{id} — يُعرض زر الحذف للأدمن فقط عند توفر id من الـ API */
  onDeleteAttachment?: (attachmentId: number) => Promise<void>;
  deleteAttachmentPending?: boolean;
  /** PATCH /tickets/{ticketId} — تغيير الحالة فقط: مفتوحة → 2، مغلقة → 1 (الجسم: status فقط) */
  onCommitTicketStatusChange?: (payload: TicketUpdatePayload) => Promise<void>;
  commitTicketStatusPending?: boolean;
  /** فتح مودال التعديل الكامل (حالة + مسئول + ملاحظات) */
  onOpenTicketEdit?: () => void;
  ticketEditPatchPending?: boolean;
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
  onDeleteAttachment,
  deleteAttachmentPending = false,
  onCommitTicketStatusChange,
  commitTicketStatusPending = false,
  onOpenTicketEdit,
  ticketEditPatchPending = false,
}: Props) {
  const [chatInput, setChatInput] = useState("");
  /** ملفات اختيرت من الجهاز ولم تُرفَع بعد — الرفع يحدث عند الضغط على «إضافة الملفات» */
  const [pendingUploadFiles, setPendingUploadFiles] = useState<File[]>([]);
  /** تأكيد حذف مرفق (أدمن فقط — يُعرض الـ dialog) */
  const [pendingDeleteAttachment, setPendingDeleteAttachment] = useState<{
    id: number;
    name: string;
  } | null>(null);
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

  async function toggleStatus() {
    if (commitTicketStatusPending) return;
    if (onCommitTicketStatusChange) {
      const nextApiStatus = isOpen ? 2 : 1;
      try {
        await onCommitTicketStatusChange({
          status: nextApiStatus,
        });
      } catch {
        /* الإشعار من useUpdateTicket */
      }
      return;
    }
    const newStatus = isOpen ? ("مغلقة" as const) : ("مفتوحة" as const);
    const today = new Date().toISOString().split("T")[0];
    onUpdateTicket({
      ...ticket,
      status: newStatus,
      closeDate: newStatus === "مغلقة" ? today : "—",
      days: newStatus === "مغلقة" ? 0 : ticket.days,
    });
  }

  function handleFilesChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    /** يجب نسخ الملفات قبل مسح القيمة — FileList «حي» ويُفرَّغ مع إعادة ضبط الحقل */
    const picked = input.files?.length ? Array.from(input.files) : [];
    input.value = "";
    if (!picked.length || uploadFilesPending) return;
    setPendingUploadFiles((prev) => [...prev, ...picked]);
  }

  function removePendingFile(index: number) {
    setPendingUploadFiles((prev) => prev.filter((_, j) => j !== index));
  }

  async function commitPendingUploads() {
    if (!pendingUploadFiles.length || uploadFilesPending) return;
    const files = [...pendingUploadFiles];
    if (onUploadFiles) {
      try {
        await onUploadFiles(files);
        setPendingUploadFiles([]);
      } catch {
        /* الإشعار من useUploadTicketAttachments */
      }
      return;
    }
    const newAtt: Attachment[] = files.map((file) => ({
      type: file.type.startsWith("image")
        ? "image"
        : file.type.startsWith("video")
          ? "video"
          : "file",
      name: file.name,
    }));
    onUpdateTicket({ ...ticket, attachments: [...ticket.attachments, ...newAtt] });
    setPendingUploadFiles([]);
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
                  {onOpenTicketEdit ? (
                    <Tooltip title="تعديل التذكرة (الحالة، المسئول، الملاحظات)">
                      <span>
                        <IconButton
                          size="small"
                          aria-label="تعديل التذكرة"
                          onClick={onOpenTicketEdit}
                          disabled={Boolean(ticketEditPatchPending)}
                          sx={{
                            color: BRAND,
                            border: `1px solid ${alpha(BRAND, 0.45)}`,
                            borderRadius: 1.5,
                            p: 0.35,
                            "&:hover": { bgcolor: alpha(BRAND, 0.08) },
                          }}
                        >
                          <EditOutlinedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </span>
                    </Tooltip>
                  ) : null}
                  <Button
                    size="small"
                    variant="outlined"
                    color="inherit"
                    disableElevation
                    disabled={commitTicketStatusPending}
                    onClick={() => void toggleStatus()}
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
                  اختيار ملفات
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  multiple
                  accept="image/*,video/*,application/pdf,.pdf,.doc,.docx"
                  onChange={handleFilesChosen}
                />
              </Box>
              <Box sx={{ p: 2 }}>
                {ticket.attachments.length > 0 && (
                  <Grid container spacing={1} mb={1.5}>
                    {ticket.attachments.map((a, i) => (
                      <Grid item xs={4} key={a.id != null ? `att-${a.id}` : `att-${i}-${a.name}`}>
                        <Box
                          sx={{
                            position: "relative",
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
                          {isAdminUser && onDeleteAttachment && a.id != null && (
                            <Tooltip title="حذف المرفق">
                              <IconButton
                                size="small"
                                aria-label="حذف المرفق"
                                disabled={deleteAttachmentPending}
                                onClick={(ev) => {
                                  ev.stopPropagation();
                                  setPendingDeleteAttachment({ id: a.id!, name: a.name });
                                }}
                                sx={{
                                  position: "absolute",
                                  top: 2,
                                  insetInlineEnd: 2,
                                  p: 0.25,
                                  color: "text.secondary",
                                  bgcolor: (t) => alpha(t.palette.background.paper, 0.92),
                                  "&:hover": { color: "error.main", bgcolor: "background.paper" },
                                }}
                              >
                                <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Box
                            onClick={() => {
                              const href = attachmentOpenHref(a.url);
                              if (href) window.open(href, "_blank", "noopener,noreferrer");
                            }}
                            sx={{ cursor: attachmentOpenHref(a.url) ? "pointer" : "default" }}
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
                    اسحب ملفات هنا أو اضغط للاختيار — ثم اضغط «إضافة الملفات» للرفع
                  </Typography>
                </Box>

                {pendingUploadFiles.length > 0 && (
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: "block", mb: 1, fontSize: "0.7rem" }}>
                      ملفات مختارة (لم تُرفَع بعد)
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={0.75} useFlexGap>
                      {pendingUploadFiles.map((f, i) => (
                        <Chip
                          key={`${f.name}-${f.size}-${i}`}
                          size="small"
                          label={f.name}
                          onDelete={() => removePendingFile(i)}
                          deleteIcon={<CloseIcon sx={{ fontSize: "16px !important" }} />}
                          sx={{ maxWidth: "100%", "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" } }}
                        />
                      ))}
                    </Stack>
                  </Box>
                )}

                <Button
                  variant="contained"
                  fullWidth
                  disableElevation
                  disabled={pendingUploadFiles.length === 0 || uploadFilesPending}
                  onClick={() => void commitPendingUploads()}
                  sx={{ borderRadius: 2, fontWeight: 700, py: 1, bgcolor: BRAND, "&:hover": { bgcolor: "#5254e0" } }}
                >
                  إضافة الملفات
                </Button>
              </Box>
            </Paper>
          </Stack>
        </Grid>

        {/* ── Right column: Chat + Event log ── */}
        <Grid item xs={12} md={4}>
          <Stack spacing={2}>
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

          {/* ── سجل الأحداث — من history ── */}
          {Array.isArray(ticket.history) && ticket.history.length > 0 && (
            <Paper
              variant="outlined"
              sx={{ borderRadius: 2.5, overflow: "hidden", borderColor: "divider" }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 2,
                  py: 1.5,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <TimelineOutlinedIcon sx={{ fontSize: 15, color: "text.secondary" }} />
                <Typography variant="body2" fontWeight={700} color="text.primary">
                  سجل الأحداث
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                {ticket.history.map((ev, i) => {
                  const isLast = i === ticket.history!.length - 1;
                  const st = ticketEventStyle(ev.eventType);
                  const Icon = st.Icon;
                  return (
                    <Box key={ev.id ?? i} sx={{ display: "flex", gap: 1.25 }}>
                      {/* المسار: نقطة + خط عمودي */}
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                        <Box
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            color: (t) => t.palette[st.tone].main,
                            bgcolor: (t) => alpha(t.palette[st.tone].main, 0.14),
                          }}
                        >
                          <Icon sx={{ fontSize: 14 }} />
                        </Box>
                        {!isLast && (
                          <Box sx={{ flex: 1, width: "2px", minHeight: 16, my: "2px", bgcolor: "divider" }} />
                        )}
                      </Box>
                      {/* المحتوى */}
                      <Box sx={{ flex: 1, minWidth: 0, pt: "3px", pb: isLast ? 0 : 1.75 }}>
                        <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "text.primary", lineHeight: 1.4 }}>
                          {ev.message || "—"}
                        </Typography>
                        {(ev.description || ev.userName) && (
                          <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", mt: 0.25 }}>
                            {ev.description || (ev.userName ? `بواسطة ${ev.userName}` : "")}
                          </Typography>
                        )}
                        <Typography sx={{ fontSize: "0.66rem", color: "text.disabled", mt: 0.375 }}>
                          {formatTicketEventTime(ev.changedAt)}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Paper>
          )}
          </Stack>
        </Grid>
      </Grid>

      <ConfirmDeleteModal
        open={pendingDeleteAttachment != null}
        onClose={() => setPendingDeleteAttachment(null)}
        handleConfirmDelete={() => {
          if (!pendingDeleteAttachment || !onDeleteAttachment) return;
          void onDeleteAttachment(pendingDeleteAttachment.id).then(() => {
            setPendingDeleteAttachment(null);
          });
        }}
        title="حذف المرفق"
        message={
          pendingDeleteAttachment
            ? `هل تريد حذف «${pendingDeleteAttachment.name}»؟ لا يمكن التراجع عن هذا الإجراء.`
            : undefined
        }
        confirmLoading={deleteAttachmentPending}
      />
    </Box>
  );
}
