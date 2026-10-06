/**
 * "محادثة السيلر مع مسؤول الحساب" — محادثة داخلية منفصلة عن "الملاحظات
 * والتواصل" (OrderNotesCard). ردود سريعة من قائمة قابلة للتعديل (مثل
 * التذاكر): الضغط على رد سريع يملأ حقل النص فقط، ولا يرسله تلقائيًا —
 * نفس سلوك شريحات الردود السريعة في التذاكر.
 */
import React, { useState } from "react";
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
  type SellerChatQuickReply,
} from "query/orderSellerChat";

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(Array.from(e.target.files ?? []));
    e.target.value = "";
  };

  const handleSend = () => {
    if (!text.trim() && files.length === 0) return;
    send.mutate(
      { text: text.trim(), files },
      { onSuccess: () => { setText(""); setFiles([]); } },
    );
  };

  const list = messages.data ?? [];

  return (
    <SectionCard
      icon={<ForumOutlinedIcon sx={{ fontSize: 18, color: OD.tx2 }} />}
      title="محادثة السيلر مع مسؤول الحساب"
      headerRight={
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip label="داخلي" size="small" sx={{ fontSize: "0.65rem", height: 20, bgcolor: OD.sur3, color: OD.tx2 }} />
          {isAdmin && (
            <IconButton size="small" onClick={() => setSettingsOpen(true)} sx={{ color: OD.tx3 }}>
              <SettingsOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          )}
        </Stack>
      }
    >
      <Box sx={{ maxHeight: 220, overflowY: "auto", px: 2, py: 1.5 }}>
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
            {list.map((message) => (
              <Box key={message.id}>
                <Box sx={{ bgcolor: OD.sur2, border: `0.5px solid ${OD.brd}`, px: 1.5, py: 1, borderRadius: "10px", fontSize: "0.75rem", color: OD.tx }}>
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
                <Typography sx={{ fontSize: "0.625rem", color: OD.tx3, mt: 0.5 }}>
                  {message.userName} · {new Date(message.createdAt).toLocaleString("en-US")}
                </Typography>
              </Box>
            ))}
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
              onClick={() => setText(reply.label)}
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
