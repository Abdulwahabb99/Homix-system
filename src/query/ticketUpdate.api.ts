import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { NavigateFunction } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import type { Ticket } from "layouts/Tickets/utils/constants";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import axiosRequest from "shared/functions/axiosRequest";
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

export type TicketUpdatePayload = {
  /** 1 = مفتوحة، 2 = مغلقة — حسب الـ API */
  status: number;
};

function ticketDetailPath(ticketId: string): string {
  return `${TICKETS_LIST_PATH}/${encodeURIComponent(ticketId)}`;
}

/** PATCH /tickets/{ticketId} — جسم الطلب حسب الحاجة؛ زر تغيير الحالة يرسل status فقط */
export async function updateTicket(
  navigate: NavigateFunction,
  ticketId: string,
  payload: TicketUpdatePayload
): Promise<Ticket> {
  const { data } = await axiosRequest.patch<Record<string, unknown>>(ticketDetailPath(ticketId), {
    status: payload.status,
  });
  const root = data as unknown as ApiEnvelope;
  if (root.force_logout) {
    localStorage.removeItem("user");
    navigate("/authentication/sign-in");
    throw new Error("FORCE_LOGOUT");
  }
  const inner = root.data;
  if (!inner || typeof inner !== "object") {
    throw new Error("TICKET_UPDATE_INVALID_RESPONSE");
  }
  return mapApiItemToTicket(inner);
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
