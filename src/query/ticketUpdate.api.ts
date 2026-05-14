import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { NavigateFunction } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import type { Ticket } from "layouts/Tickets/utils/constants";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import axiosRequest from "shared/functions/axiosRequest";
import { forceLogoutAndNavigate } from "shared/functions/sessionGuard";
import { ticketKeys } from "query/keys";
import {
  TICKETS_LIST_PATH,
  mapApiItemToTicket,
} from "query/ticketsList.api";

interface ApiEnvelope {
  status?: boolean;
  data?: Record<string, unknown>;
  force_logout?: boolean;
}

/** حقول اختيارية — يُرسل فقط ما وُجد في الكائن */
export type TicketPatchPayload = {
  status?: number;
  notes?: string;
  assignedToUserId?: number;
};

/** لزر تغيير الحالة في صفحة التفاصيل — إرسال status فقط */
export type TicketUpdatePayload = {
  status: number;
};

function ticketDetailPath(ticketId: string): string {
  return `${TICKETS_LIST_PATH}/${encodeURIComponent(ticketId)}`;
}

function buildPatchBody(payload: TicketPatchPayload): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (payload.status !== undefined && Number.isFinite(Number(payload.status))) {
    body.status = Number(payload.status);
  }
  if (payload.notes !== undefined) {
    body.notes = String(payload.notes);
  }
  if (
    payload.assignedToUserId !== undefined &&
    Number.isFinite(Number(payload.assignedToUserId))
  ) {
    body.assignedToUserId = Number(payload.assignedToUserId);
  }
  return body;
}

/** PATCH /tickets/{ticketId} */
export async function patchTicket(
  navigate: NavigateFunction,
  ticketId: string,
  payload: TicketPatchPayload
): Promise<Ticket> {
  const body = buildPatchBody(payload);
  if (Object.keys(body).length === 0) {
    throw new Error("EMPTY_PATCH");
  }
  const { data } = await axiosRequest.patch<Record<string, unknown>>(
    ticketDetailPath(ticketId),
    body
  );
  const root = data as unknown as ApiEnvelope;
  if (root.force_logout) {
    forceLogoutAndNavigate(navigate);
  }
  const inner = root.data;
  if (!inner || typeof inner !== "object") {
    throw new Error("TICKET_UPDATE_INVALID_RESPONSE");
  }
  return mapApiItemToTicket(inner);
}

export async function updateTicket(
  navigate: NavigateFunction,
  ticketId: string,
  payload: TicketUpdatePayload
): Promise<Ticket> {
  return patchTicket(navigate, ticketId, { status: payload.status });
}

export function useUpdateTicket(ticketId: string) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation<Ticket, Error, TicketUpdatePayload>({
    mutationFn: (payload) => updateTicket(navigate, ticketId, payload),
    onSuccess: (ticket) => {
      queryClient.setQueryData<Ticket>(ticketKeys.detail(ticketId), ticket);
      void queryClient.invalidateQueries({ queryKey: ticketKeys.all() });
      NotificationMeassage("success", "تم تحديث التذكرة");
    },
    onError: () => {
      NotificationMeassage("error", "تعذّر تحديث التذكرة");
    },
  });
}

/** للقائمة: معرف تذكرة ديناميكي + أي حقول مسموحة في الـ PATCH */
export function usePatchTicketFromList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation<
    Ticket,
    Error,
    { ticketId: string; patch: TicketPatchPayload }
  >({
    mutationFn: ({ ticketId, patch }) => patchTicket(navigate, ticketId, patch),
    onSuccess: (ticket) => {
      queryClient.setQueryData<Ticket>(ticketKeys.detail(ticket.id), ticket);
      void queryClient.invalidateQueries({ queryKey: ticketKeys.all() });
      NotificationMeassage("success", "تم تحديث التذكرة");
    },
    onError: () => {
      NotificationMeassage("error", "تعذّر تحديث التذكرة");
    },
  });
}
