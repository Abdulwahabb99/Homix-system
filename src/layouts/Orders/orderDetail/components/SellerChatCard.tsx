/**
 * "محادثة السيلر مع مسؤول الحساب" — محادثة داخلية منفصلة عن "الملاحظات
 * والتواصل" (OrderNotesCard). ردود سريعة من قائمة قابلة للتعديل (مثل
 * التذاكر): الضغط على رد سريع يرسله مباشرةً. شكل الفقاعات والصور الرمزية
 * وعدّاد الرسائل والمُؤلِّف (pill) والردود السريعة فوقه منقولة من تصميم
 * homix_order_detail (chat-list / bubble / chat-chip / chat-compose). "رسائلي" تُحدَّد بمعرّف
 * المستخدم (state.auth.user.id) وليس بمطابقة الاسم.
 */
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Button,
  ButtonBase,
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
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import { OD } from "../odTheme";
import { resolveAttachmentUrl } from "../utils";
import { COMMENT_IMAGE_ACCEPT } from "../constants";
import { cardSx } from "../styles";
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
  const listRef = useRef<HTMLDivElement>(null);

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
  const replies = quickReplies.data ?? [];
  const canSend = (text.trim().length > 0 || files.length > 0) && !send.isPending;

  /* التمرير لآخر رسالة داخل صندوق المحادثة فقط (لا يحرّك الصفحة) */
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [list.length, messages.isLoading]);

  const emptyState = (icon: React.ReactNode, label: string, action?: React.ReactNode) => (
    <Box sx={{ m: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 1, color: OD.tx3, textAlign: "center", py: 3 }}>
      {icon}
      <Typography sx={{ fontSize: "0.72rem", color: OD.tx3, fontWeight: 600 }}>{label}</Typography>
      {action}
    </Box>
  );

  return (
    <Box dir="rtl" sx={{ ...cardSx, p: "18px", mb: 0 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "7px" }}>
          <ForumOutlinedIcon sx={{ fontSize: 18, color: OD.tx2 }} />
          <Typography sx={{ fontSize: "0.84rem", fontWeight: 800, color: OD.tx }}>محادثة السيلر مع مسؤول الحساب</Typography>
          <Box component="span" sx={{ fontSize: "0.625rem", fontWeight: 700, bgcolor: "rgba(201,169,110,0.1)", color: "#8a6d3b", px: "9px", py: "2px", borderRadius: "20px", display: "flex", alignItems: "center", gap: 0.5, mr: 1 }}>
            🔒 داخلي
          </Box>
        </Box>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Typography sx={{ fontSize: "0.69rem", color: OD.tx3, fontWeight: 600 }}>{list.length} رسالة</Typography>
          {isAdmin && (
            <IconButton size="small" aria-label="تعديل الردود السريعة" onClick={() => setSettingsOpen(true)} sx={{ color: OD.tx3, "&:hover": { color: OD.accent } }}>
              <SettingsOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          )}
        </Stack>
      </Box>

      <Box
        ref={listRef}
        sx={{
          height: 300, overflowY: "auto", p: 2, borderRadius: "12px", bgcolor: OD.bg, mb: "14px",
          display: "flex", flexDirection: "column", gap: "10px",
          scrollbarWidth: "thin", scrollbarColor: `${OD.brd2} transparent`,
          "&::-webkit-scrollbar": { width: 6 },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": { background: OD.brd2, borderRadius: "6px" },
          "&::-webkit-scrollbar-thumb:hover": { background: OD.tx3 },
        }}
      >
        {messages.isLoading ? (
          <Box sx={{ m: "auto" }}>
            <CircularProgress size={22} sx={{ color: OD.accent }} />
          </Box>
        ) : messages.isError ? (
          emptyState(
            <ErrorOutlineIcon sx={{ fontSize: 28, color: OD.red }} />,
            "تعذّر تحميل المحادثة",
            <Button size="small" onClick={() => messages.refetch()} sx={{ fontSize: "0.72rem", fontWeight: 700, color: OD.accent }}>
              إعادة المحاولة
            </Button>,
          )
        ) : list.length === 0 ? (
          emptyState(<ForumOutlinedIcon sx={{ fontSize: 30, color: OD.brd2 }} />, "لا توجد رسائل بعد — ابدأ المحادثة من هنا")
        ) : (
          list.map((message) => {
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
                      <Box key={attachment.id} mt={message.text ? 0.75 : 0}>
                        <a href={url} target="_blank" rel="noreferrer">
                          <Box component="img" src={url} alt="" sx={{ display: "block", maxHeight: 160, borderRadius: "10px", maxWidth: "100%" }} />
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
          })
        )}
      </Box>

      {replies.length > 0 && (
        <>
          <Typography sx={{ fontSize: "0.72rem", color: OD.tx2, fontWeight: 700, mx: "2px", mb: 1 }}>ردود سريعة:</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: "14px", px: "2px" }}>
            {replies.map((reply) => (
              <ButtonBase
                key={reply.id}
                disabled={send.isPending}
                onClick={() => handleQuickReply(reply.label)}
                sx={{
                  fontFamily: "inherit", fontSize: "0.656rem", fontWeight: 600, px: "11px", py: "5px", borderRadius: "20px",
                  border: `0.5px solid ${OD.brd2}`, bgcolor: OD.sur2, color: OD.tx2, transition: "0.15s",
                  "&:hover": { borderColor: OD.accent, color: OD.accent, bgcolor: OD.al },
                  "&.Mui-disabled": { opacity: 0.55 },
                }}
              >
                {reply.label}
              </ButtonBase>
            ))}
          </Box>
        </>
      )}

      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <label htmlFor="seller-chat-attachment" style={{ display: "flex" }}>
          <input id="seller-chat-attachment" type="file" hidden multiple onChange={handleFileChange} accept={COMMENT_IMAGE_ACCEPT} />
          <IconButton
            component="span"
            aria-label="إرفاق صورة"
            sx={{ width: 44, height: 44, border: `0.5px solid ${files.length ? OD.accent : OD.brd}`, bgcolor: OD.sur2, borderRadius: "50%", color: files.length ? OD.accent : OD.tx3, "&:hover": { borderColor: OD.accent, color: OD.accent, bgcolor: OD.al } }}
          >
            <AttachFileIcon sx={{ fontSize: 19 }} />
          </IconButton>
        </label>
        <TextField
          fullWidth
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (!send.isPending) handleSend();
            }
          }}
          placeholder="اكتب ردك..."
          sx={{
            flex: 1, minWidth: 0,
            "& .MuiOutlinedInput-root": {
              height: 44, borderRadius: "20px", fontFamily: "inherit", fontSize: "0.78rem", bgcolor: OD.sur2, px: 2,
              "& fieldset": { borderColor: OD.brd, borderWidth: "0.5px" },
              "&:hover fieldset": { borderColor: OD.brd2 },
              "&.Mui-focused fieldset": { borderColor: OD.accent, borderWidth: "0.5px" },
              "&.Mui-focused": { boxShadow: `0 0 0 3px ${OD.ab}` },
            },
            "& .MuiOutlinedInput-input": { p: 0 },
          }}
          InputProps={{
            endAdornment: files.length > 0 ? (
              <Chip label={`${files.length} مرفق`} size="small" onDelete={() => setFiles([])} sx={{ fontSize: "0.65rem", height: 22 }} />
            ) : null,
          }}
        />
        <Button
          variant="contained"
          disableElevation
          aria-label="إرسال"
          disabled={!canSend}
          onClick={handleSend}
          sx={{
            height: 44, minWidth: 0, px: 2.5, flexShrink: 0, gap: 0.875, borderRadius: "20px", textTransform: "none", fontFamily: "inherit", fontWeight: 700, fontSize: "0.81rem",
            bgcolor: OD.accent, color: "#fff", "&:hover": { bgcolor: OD.accentHover },
            "&.Mui-disabled": { bgcolor: OD.sur3, color: OD.tx3 },
          }}
        >
          {send.isPending ? (
            <CircularProgress size={16} sx={{ color: OD.tx3 }} />
          ) : (
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.3" aria-hidden="true">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
          إرسال
        </Button>
      </Box>

      <QuickReplySettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} quickReplies={replies} />
    </Box>
  );
}
