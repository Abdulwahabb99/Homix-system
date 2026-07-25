/**
 * بطاقة الملاحظات والتواصل: قائمة التعليقات (مع تعديل/حذف للأدمن) + مربّع إرسال
 * ملاحظة جديدة مع مرفق صورة اختياري.
 */
import React from "react";
import { Box, Button, Chip, CircularProgress, IconButton, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { OD } from "../odTheme";
import { resolveCommenterName, getInitials, resolveAttachmentUrl } from "../utils";
import { COMMENT_IMAGE_ACCEPT, COMMENT_AVATAR_GRADIENTS } from "../constants";
import SectionCard from "./SectionCard";

interface OrderNotesCardProps {
  comments: any[];
  users: any[];
  commentText: string;
  setCommentText: (v: string) => void;
  editingIndex: number | null;
  setEditingIndex: (v: number | null) => void;
  editedCommentText: string;
  setEditedCommentText: (v: string) => void;
  selectedFiles: { file: File; url: string }[];
  isAdmin: boolean;
  isAddingComment: boolean;
  isUpdatingComment: boolean;
  updateComment: (noteId: number | string) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveFile: (index: number) => void;
  handleAddComment: () => void;
  setPendingDeleteNoteId: (v: any) => void;
}

export default function OrderNotesCard({
  comments,
  users,
  commentText,
  setCommentText,
  editingIndex,
  setEditingIndex,
  editedCommentText,
  setEditedCommentText,
  selectedFiles,
  isAdmin,
  isAddingComment,
  isUpdatingComment,
  updateComment,
  handleFileChange,
  handleRemoveFile,
  handleAddComment,
  setPendingDeleteNoteId,
}: OrderNotesCardProps) {
  return (
    <SectionCard
      icon={<ChatBubbleOutlineIcon sx={{ fontSize: 18, color: OD.tx2 }} />}
      title="الملاحظات والتواصل"
      headerRight={<Typography sx={{ fontSize: "0.69rem", color: OD.tx3 }}>{comments.length} رسائل</Typography>}
    >
      <Box
        sx={{
          maxHeight: 220,
          overflowY: "auto",
          px: 2,
          py: 1.5,
          "&::-webkit-scrollbar": { width: 4 },
          "&::-webkit-scrollbar-thumb": { bgcolor: OD.brd, borderRadius: 4 },
        }}
      >
        {comments.length === 0 ? (
          <Typography align="center" sx={{ py: 3, color: OD.tx3, fontSize: "0.78rem" }}>
            لا توجد ملاحظات بعد
          </Typography>
        ) : (
          <Stack spacing={1.25}>
            {comments.map((comment, index) => {
              const commentMaker = resolveCommenterName(comment, users);
              const initials = getInitials(commentMaker);
              const imageUrl = resolveAttachmentUrl(comment?.attachments?.[0]?.url);
              const grad = COMMENT_AVATAR_GRADIENTS[index % 2];

              return (
                <Stack
                  key={comment.id ?? index}
                  direction="row"
                  spacing={1.125}
                  alignItems="flex-start"
                  sx={{ opacity: comment.pending ? 0.6 : 1, transition: "opacity .2s" }}
                >
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: grad,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.625rem",
                      fontWeight: 800,
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    {initials}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        bgcolor: OD.sur2,
                        border: `0.5px solid ${OD.brd}`,
                        px: 1.5,
                        py: 1,
                        borderRadius: "0 10px 10px 10px",
                        fontSize: "0.75rem",
                        lineHeight: 1.6,
                        color: OD.tx,
                      }}
                    >
                      {editingIndex === index ? (
                        <>
                          <TextField
                            fullWidth
                            value={editedCommentText}
                            onChange={(e) => setEditedCommentText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                if (!isUpdatingComment && editedCommentText.trim()) {
                                  updateComment(comment.id);
                                }
                              }
                            }}
                            multiline
                            size="small"
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "9px", fontSize: "0.75rem" } }}
                          />
                          <Stack direction="row" spacing={0.75} justifyContent="flex-end" mt={1}>
                            <Button
                              size="small"
                              disabled={isUpdatingComment}
                              onClick={() => setEditingIndex(null)}
                              sx={{ textTransform: "none", fontSize: "0.7rem" }}
                            >
                              إلغاء
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              disableElevation
                              disabled={isUpdatingComment || !editedCommentText.trim()}
                              onClick={() => updateComment(comment.id)}
                              sx={{
                                textTransform: "none",
                                fontSize: "0.7rem",
                                minWidth: 56,
                                bgcolor: OD.accent,
                                "&:hover": { bgcolor: OD.accentHover },
                              }}
                            >
                              {isUpdatingComment ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : "حفظ"}
                            </Button>
                          </Stack>
                        </>
                      ) : (
                        comment.text
                      )}
                    </Box>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ mt: 0.5 }}
                      flexWrap="wrap"
                      gap={0.5}
                    >
                      <Typography sx={{ fontSize: "0.625rem", color: OD.tx3 }}>
                        {commentMaker} · {new Date(comment.createdAt).toLocaleString("en-US")}
                      </Typography>
                      {isAdmin && editingIndex !== index && (
                        <Stack direction="row" spacing={0.25}>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditingIndex(index);
                              setEditedCommentText(comment.text);
                            }}
                            sx={{ p: 0.35, color: OD.accent }}
                          >
                            <EditIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => setPendingDeleteNoteId(comment.id)}
                            sx={{ p: 0.35, color: OD.red }}
                          >
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Stack>
                      )}
                    </Stack>
                    {imageUrl && editingIndex !== index ? (
                      <Box mt={0.75}>
                        <a href={imageUrl} target="_blank" rel="noreferrer">
                          <Box component="img" src={imageUrl} alt="" sx={{ maxHeight: 200, borderRadius: "8px", maxWidth: "100%" }} />
                        </a>
                      </Box>
                    ) : null}
                  </Box>
                </Stack>
              );
            })}
          </Stack>
        )}
      </Box>
      <Box
        sx={{
          borderTop: `0.5px solid ${OD.brd}`,
          px: 2,
          py: 1.5,
          display: "flex",
          gap: 1,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <label htmlFor="comment-attachment">
          <input
            id="comment-attachment"
            type="file"
            hidden
            onChange={(e) => handleFileChange(e)}
            accept={COMMENT_IMAGE_ACCEPT}
          />
          <IconButton
            component="span"
            size="small"
            sx={{
              width: 36,
              height: 36,
              border: `0.5px solid ${OD.brd}`,
              borderRadius: "9px",
              color: OD.tx3,
              "&:hover": { borderColor: OD.accent, color: OD.accent },
            }}
          >
            <AttachFileIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </label>
        <TextField
          fullWidth
          size="small"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (!isAddingComment && (commentText.trim() || selectedFiles?.length)) {
                handleAddComment();
              }
            }
          }}
          placeholder="اكتب ملاحظاتك هنا..."
          sx={{
            flex: 1,
            minWidth: 120,
            "& .MuiOutlinedInput-root": {
              borderRadius: "9px",
              fontSize: "0.81rem",
              bgcolor: OD.sur,
              "& fieldset": { borderColor: OD.brd },
              "&:hover fieldset": { borderColor: OD.accent },
            },
          }}
          InputProps={{
            endAdornment:
              selectedFiles?.length > 0 ? (
                <InputAdornment position="end">
                  {selectedFiles?.map((file, fi) => (
                    <Chip
                      key={fi}
                      label={file.file?.name?.length > 20 ? `${file.file?.name.slice(0, 10)}…` : file?.file?.name}
                      size="small"
                      onDelete={() => handleRemoveFile(fi)}
                      sx={{ maxWidth: 100, fontSize: "0.65rem", height: 22 }}
                    />
                  ))}
                </InputAdornment>
              ) : null,
          }}
        />
        <Button
          variant="contained"
          disableElevation
          disabled={(!commentText && !selectedFiles?.length) || isAddingComment}
          onClick={handleAddComment}
          sx={{
            px: 2.25,
            height: 36,
            minWidth: 76,
            borderRadius: "9px",
            textTransform: "none",
            fontWeight: 700,
            fontSize: "0.78rem",
            bgcolor: OD.accent,
            whiteSpace: "nowrap",
            "&:hover": { bgcolor: OD.accentHover },
          }}
        >
          {isAddingComment ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "إرسال"}
        </Button>
      </Box>
    </SectionCard>
  );
}
