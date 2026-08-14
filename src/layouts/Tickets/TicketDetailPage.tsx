import { useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import Spinner from "components/Spinner/Spinner";
import TicketDetailView from "layouts/Tickets/components/TicketDetailView";
import EditTicketModal from "layouts/Tickets/components/EditTicketModal";
import type { Ticket } from "layouts/Tickets/utils/constants";
import { DEFAULT_QUICK_REPLIES } from "layouts/Tickets/utils/constants";
import { ticketKeys } from "query/keys";
import { useTicketDetail, useTicketsMeta } from "query/ticketsList.api";
import { useDeleteTicketNote, usePostTicketNote, usePutTicketNote } from "query/ticketNotes.api";
import { useDeleteTicketAttachment, useUploadTicketAttachments } from "query/ticketAttachments.api";
import { useUpdateTicket, usePatchTicketFromList, type TicketUpdatePayload, type TicketPatchPayload } from "query/ticketUpdate.api";

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const ticketQuery = useTicketDetail(id ?? "", Boolean(id));
  const metaQuery = useTicketsMeta(Boolean(id));
  const assigneesForEdit = useMemo(
    () => metaQuery.data?.assignees ?? [],
    [metaQuery.data?.assignees]
  );
  const postNoteMutation = usePostTicketNote(id ?? "");
  const putNoteMutation = usePutTicketNote(id ?? "");
  const deleteNoteMutation = useDeleteTicketNote(id ?? "");
  const uploadAttachmentsMutation = useUploadTicketAttachments(id ?? "");
  const deleteAttachmentMutation = useDeleteTicketAttachment(id ?? "");
  const updateTicketMutation = useUpdateTicket(id ?? "");
  const patchTicketFromDetailMutation = usePatchTicketFromList();

  const [ticketEditModalOpen, setTicketEditModalOpen] = useState(false);

  const handleBack = useCallback(() => {
    navigate("/tickets");
  }, [navigate]);

  const handleUpdateTicket = useCallback(
    (updated: Ticket) => {
      queryClient.setQueryData(ticketKeys.detail(updated.id), updated);
      void queryClient.invalidateQueries({ queryKey: ticketKeys.all() });
    },
    [queryClient]
  );

  const handleSendChatMessage = useCallback(
    (text: string) => postNoteMutation.mutateAsync(text),
    [postNoteMutation]
  );

  const handleEditNote = useCallback(
    (noteId: string, text: string) => putNoteMutation.mutateAsync({ noteId, text }),
    [putNoteMutation]
  );

  const handleDeleteNote = useCallback(
    (noteId: string) => deleteNoteMutation.mutateAsync(noteId),
    [deleteNoteMutation]
  );

  const handleUploadFiles = useCallback(
    (files: File[]) => uploadAttachmentsMutation.mutateAsync({ files }),
    [uploadAttachmentsMutation]
  );

  const handleDeleteAttachment = useCallback(
    (attachmentId: number) => deleteAttachmentMutation.mutateAsync(attachmentId),
    [deleteAttachmentMutation]
  );

  const handleCommitTicketStatus = useCallback(
    async (payload: TicketUpdatePayload) => {
      await updateTicketMutation.mutateAsync(payload);
    },
    [updateTicketMutation]
  );

  const handleSaveTicketEditFromModal = useCallback(
    async (payload: Required<Pick<TicketPatchPayload, "status" | "assignedToUserId" | "notes">>) => {
      if (!id) return;
      try {
        await patchTicketFromDetailMutation.mutateAsync({ ticketId: id, patch: payload });
        setTicketEditModalOpen(false);
      } catch {
        /* الإشعار من usePatchTicketFromList */
      }
    },
    [id, patchTicketFromDetailMutation]
  );

  if (!id) {
    return <Navigate to="/tickets" replace />;
  }

  if (ticketQuery.isLoading) {
    return (
      <DashboardLayout pageTitle="تفاصيل التذكرة" pageSubtitle="جارٍ التحميل…">
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 320 }}>
          <Spinner />
        </Box>
      </DashboardLayout>
    );
  }

  if (ticketQuery.isError || !ticketQuery.data) {
    return (
      <DashboardLayout pageTitle="تفاصيل التذكرة" pageSubtitle="">
        <Box sx={{ textAlign: "center", py: 6, maxWidth: 480, mx: "auto" }}>
          <Typography color="text.secondary" mb={2}>
            لم يتم العثور على التذكرة أو حدث خطأ أثناء التحميل.
          </Typography>
          <Button variant="contained" onClick={() => navigate("/tickets")}>
            العودة للقائمة
          </Button>
        </Box>
      </DashboardLayout>
    );
  }

  const t = ticketQuery.data;

  return (
    <DashboardLayout
      pageTitle={`تذكرة — ${t.type || "—"}`}
      pageSubtitle={`رقم العملية ${t.op} · الطلب #${t.order}`}
    >
      <Box sx={{ maxWidth: 1680, mx: "auto", width: "100%", mt: 2.5 }}>
        <TicketDetailView
          ticket={t}
          quickReplies={metaQuery.data?.quickReplies?.map((option) => option.label) ?? DEFAULT_QUICK_REPLIES}
          onBack={handleBack}
          onUpdateTicket={handleUpdateTicket}
          onSendChatMessage={handleSendChatMessage}
          sendChatPending={postNoteMutation.isPending}
          onEditNote={handleEditNote}
          editNotePending={putNoteMutation.isPending}
          onDeleteNote={handleDeleteNote}
          deleteNotePending={deleteNoteMutation.isPending}
          onUploadFiles={handleUploadFiles}
          uploadFilesPending={uploadAttachmentsMutation.isPending}
          onDeleteAttachment={handleDeleteAttachment}
          deleteAttachmentPending={deleteAttachmentMutation.isPending}
          onCommitTicketStatusChange={handleCommitTicketStatus}
          commitTicketStatusPending={updateTicketMutation.isPending}
          onOpenTicketEdit={() => setTicketEditModalOpen(true)}
          ticketEditPatchPending={patchTicketFromDetailMutation.isPending}
        />
      </Box>

      <EditTicketModal
        open={ticketEditModalOpen}
        onClose={() => setTicketEditModalOpen(false)}
        ticket={t}
        assignees={assigneesForEdit}
        onSubmit={handleSaveTicketEditFromModal}
        isSubmitting={patchTicketFromDetailMutation.isPending}
      />
    </DashboardLayout>
  );
}
