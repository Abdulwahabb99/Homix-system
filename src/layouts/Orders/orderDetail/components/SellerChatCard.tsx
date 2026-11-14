/**
 * "محادثة السيلر مع مسؤول الحساب" — محادثة داخلية منفصلة عن "الملاحظات
 * والتواصل" (OrderNotesCard). ردود سريعة من قائمة قابلة للتعديل (مثل
 * التذاكر): الضغط على رد سريع يرسله مباشرةً. شكل الفقاعات والصور الرمزية
 * وعدّاد الرسائل منقول من تصميم homix_order_detail. "رسائلي" تُحدَّد بمعرّف
 * المستخدم (state.auth.user.id) وليس بمطابقة الاسم.
 */
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import { OD } from "../odTheme";
import { resolveAttachmentUrl } from "../utils";
import { COMMENT_IMAGE_ACCEPT } from "../constants";
import SectionCard from "./SectionCard";
import {
  useSellerChatMessages,
  useSellerChatQuickReplies,
  useSendSellerChatMessage,
  useUpdateSellerChatQuickReplies,
  SellerChatUploadError,
  type SellerChatQuickReply,
} from "query/orderSellerChat";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";

const AVATAR_COLORS = [OD.amber, OD.accent, OD.green, OD.blue, OD.purple, OD.red];

const avatarColor = (key: number | string) => {
  const n = typeof key === "number" ? key : Array.from(key).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return AVATAR_COLORS[Math.abs(n) % AVATAR_COLORS.length];
};

const initialOf = (name: string) => (name.trim() ? Array.from(name.trim())[0].toUpperCase() : "?");

const formatMessageTime = (iso: string) =>
  new Date(iso).toLocaleString("ar-EG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

function QuickReplySettingsDialog({
  open,
  onClose,
  quickReplies,
}: {
  open: boolean;
  onClose: () => void;
  quickReplies: SellerChatQuickReply[];
}) {
  const [items, setItems] = useState<Array<{ id?: number; label: string }>>([]);
  const [newLabel, setNewLabel] = useState("");
  const update = useUpdateSellerChatQuickReplies();

  React.useEffect(() => {
    if (open) setItems(quickReplies.map(({ id, label }) => ({ id, label })));
  }, [open, quickReplies]);

  const addItem = () => {
    const label = newLabel.trim();
    if (!label) return;
    setItems((prev) => [...prev, { label }]);
    setNewLabel("");
  };

  const save = () => {
    update.mutate(items.filter((item) => item.label.trim()), { onSuccess: onClose });
  };

  return (
    <Dialog open={open} onClose={onClose} dir="rtl" fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontSize: "0.9rem" }}>تعديل الردود السريعة</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1}>
          {items.map((item, index) => (
            <Stack key={index} direction="row" spacing={1} alignItems="center">
              <TextField
                size="small"
                fullWidth
                value={item.label}
                onChange={(e) =>
                  setItems((prev) => prev.map((entry, i) => (i === index ? { ...entry, label: e.target.value } : entry)))
                }
              />
              <IconButton size="small" onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}>
                <DeleteOutlineIcon sx={{ fontSize: 18, color: OD.red }} />
              </IconButton>
            </Stack>
          ))}
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              size="small"
              fullWidth
              placeholder="رد سريع جديد"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addItem();
                }
              }}
            />
            <IconButton size="small" onClick={addItem}>
              <AddIcon sx={{ fontSize: 18, color: OD.accent }} />
            </IconButton>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={update.isPending} sx={{ fontSize: "0.78rem" }}>
          إلغاء
        </Button>
        <Button
          variant="contained"
          disableElevation
          onClick={save}
          disabled={update.isPending}
          sx={{ fontSize: "0.78rem", bgcolor: OD.accent, "&:hover": { bgcolor: OD.accentHover } }}
        >
          {update.isPending ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "حفظ"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function SellerChatCard({ orderId, isAdmin }: { orderId: number; isAdmin: boolean }) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const messages = useSellerChatMessages(orderId);
  const quickReplies = useSellerChatQuickReplies();
  const send = useSendSellerChatMessage(orderId);
  const { user } = useSelector((state: any) => state.auth);
  const myId = user?.id != null ? Number(user.id) : null;
  const endRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(Array.from(e.target.files ?? []));
    e.target.value = "";
  };

  const handleSend = () => {
    if (!text.trim() && files.length === 0) return;
    send.mutate(
      { text: text.trim(), files },
      {
        onSuccess: () => { setText(""); setFiles([]); },
        /* المسودة (النص والملفات) تبقى كما هي ليعيد المستخدم المحاولة. */
        onError: (error) => {
          NotificationMeassage(
            "error",
            error instanceof SellerChatUploadError
              ? "اتبعت الرسالة لكن رفع المرفق فشل — اضغط إرسال لإعادة رفع المرفق فقط"
              : "تعذّر إرسال الرسالة — حاول مرة أخرى"
          );
        },
      },
    );
  };

  /* الرد السريع يُرسَل مباشرةً (كما في التصميم) بدل وضعه في خانة الكتابة */
  const handleQuickReply = (label: string) => {
    if (send.isPending) return;
    send.mutate({ text: label, files: [] }, { onError: () => NotificationMeassage("error", "تعذّر إرسال الرد — حاول مرة أخرى") });
  };

  const list = messages.data ?? [];

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: "end" });
  }, [list.length]);

  return (
    <SectionCard
      icon={<ForumOutlinedIcon sx={{ fontSize: 18, color: OD.tx2 }} />}
      title="محادثة السيلر مع مسؤول الحساب"
      headerRight={
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography sx={{ fontSize: "0.69rem", color: OD.tx3, fontWeight: 600 }}>{list.length} رسالة</Typography>
          <Chip label="🔒 داخلي" size="small" sx={{ fontSize: "0.625rem", height: 20, fontWeight: 700, bgcolor: "rgba(201,169,110,0.1)", color: "#8a6d3b" }} />
          {isAdmin && (
            <IconButton size="small" onClick={() => setSettingsOpen(true)} sx={{ color: OD.tx3 }}>
              <SettingsOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          )}
        </Stack>
      }
    >
      <Box dir="rtl" sx={{ maxHeight: 300, overflowY: "auto", p: 2, m: 1.5, borderRadius: "12px", bgcolor: OD.bg }}>
        {messages.isLoading ? (
          <Box sx={{ textAlign: "center", py: 2 }}>
            <CircularProgress size={20} />
          </Box>
        ) : list.length === 0 ? (
          <Typography align="center" sx={{ py: 3, color: OD.tx3, fontSize: "0.78rem" }}>
            لا توجد رسائل بعد
          </Typography>
        ) : (
          <Stack spacing={1.25}>
            {list.map((message) => {
              const mine = myId !== null && message.userId != null && Number(message.userId) === myId;
              const name = message.userName || "—";
              const avatar = (
                <Box sx={{ width: 24, height: 24, borderRadius: "50%", bgcolor: avatarColor(message.userId ?? name), color: "#fff", fontSize: "0.6rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, mb: "2px" }}>
                  {initialOf(name)}
                </Box>
              );
              const column = (
                <Box sx={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                  <Typography sx={{ fontSize: "0.625rem", color: OD.tx3, fontWeight: 600, mb: 0.5, px: 0.625 }}>
                    {name} · {formatMessageTime(message.createdAt)}
                  </Typography>
                  <Box
                    sx={{
                      px: 1.75, py: 1.25, borderRadius: "16px", fontSize: "0.78rem", lineHeight: 1.6, wordBreak: "break-word", whiteSpace: "pre-wrap",
                      ...(mine
                        ? { bgcolor: OD.accent, color: "#fff", borderBottomRightRadius: "4px" }
                        : { bgcolor: OD.sur, color: OD.tx, border: `0.5px solid ${OD.brd}`, borderBottomLeftRadius: "4px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }),
                    }}
                  >
                    {message.text}
                    {message.attachments.map((attachment) => {
                      const url = resolveAttachmentUrl(attachment.url);
                      if (!url) return null;
                      return (
                        <Box key={attachment.id} mt={0.75}>
                          <a href={url} target="_blank" rel="noreferrer">
                            <Box component="img" src={url} alt="" sx={{ maxHeight: 160, borderRadius: "8px", maxWidth: "100%" }} />
                          </a>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              );
              /* RTL: رسائلي على اليمين (الأفاتار أولًا)، ورسائل الآخرين على اليسار */
              return (
                <Box key={message.id} sx={{ display: "flex", alignItems: "flex-end", gap: 1, maxWidth: "78%", alignSelf: mine ? "flex-start" : "flex-end" }}>
                  {mine ? <>{avatar}{column}</> : <>{column}{avatar}</>}
                </Box>
              );
            })}
            <div ref={endRef} />
          </Stack>
        )}
      </Box>

      {(quickReplies.data ?? []).length > 0 && (
        <Box sx={{ px: 2, pb: 1, display: "flex", gap: 0.75, flexWrap: "wrap" }}>
          {(quickReplies.data ?? []).map((reply) => (
            <Chip
              key={reply.id}
              label={reply.label}
              size="small"
              onClick={() => handleQuickReply(reply.label)}
              sx={{ fontSize: "0.7rem", cursor: "pointer" }}
            />
          ))}
        </Box>
      )}

      <Box sx={{ borderTop: `0.5px solid ${OD.brd}`, px: 2, py: 1.5, display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
        <label htmlFor="seller-chat-attachment">
          <input id="seller-chat-attachment" type="file" hidden multiple onChange={handleFileChange} accept={COMMENT_IMAGE_ACCEPT} />
          <IconButton component="span" size="small" sx={{ width: 36, height: 36, border: `0.5px solid ${OD.brd}`, borderRadius: "9px", color: OD.tx3, "&:hover": { borderColor: OD.accent, color: OD.accent } }}>
            <AttachFileIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </label>
        <TextField
          fullWidth
          size="small"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (!send.isPending) handleSend();
            }
          }}
          placeholder="اكتب رسالتك هنا..."
          sx={{ flex: 1, minWidth: 120, "& .MuiOutlinedInput-root": { borderRadius: "9px", fontSize: "0.81rem", bgcolor: OD.sur } }}
          InputProps={{
            endAdornment: files.length > 0 ? (
              <Chip label={`${files.length} مرفق`} size="small" onDelete={() => setFiles([])} sx={{ fontSize: "0.65rem", height: 22 }} />
            ) : null,
          }}
        />
        <Button
          variant="contained"
          disableElevation
          disabled={(!text.trim() && files.length === 0) || send.isPending}
          onClick={handleSend}
          sx={{ px: 2.25, height: 36, minWidth: 76, borderRadius: "9px", textTransform: "none", fontWeight: 700, fontSize: "0.78rem", bgcolor: OD.accent, "&:hover": { bgcolor: OD.accentHover } }}
        >
          {send.isPending ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "إرسال"}
        </Button>
      </Box>

      <QuickReplySettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} quickReplies={quickReplies.data ?? []} />
    </SectionCard>
  );
}
