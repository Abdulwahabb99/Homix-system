import { useQueryClient } from "@tanstack/react-query";
import React, { useCallback } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import Spinner from "components/Spinner/Spinner";
import TicketDetailView from "layouts/Tickets/components/TicketDetailView";
import type { Ticket } from "layouts/Tickets/utils/constants";
import { DEFAULT_QUICK_REPLIES } from "layouts/Tickets/utils/constants";
import { ticketKeys } from "query/keys";
import { useTicketDetail } from "query/ticketsList.api";
import { usePostTicketNote } from "query/ticketNotes.api";

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const ticketQuery = useTicketDetail(id ?? "", Boolean(id));
  const postNoteMutation = usePostTicketNote(id ?? "");

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
          quickReplies={DEFAULT_QUICK_REPLIES}
          onBack={handleBack}
          onUpdateTicket={handleUpdateTicket}
          onSendChatMessage={handleSendChatMessage}
          sendChatPending={postNoteMutation.isPending}
        />
      </Box>
    </DashboardLayout>
  );
}
