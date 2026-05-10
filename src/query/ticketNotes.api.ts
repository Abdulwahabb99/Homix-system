import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { NavigateFunction } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axiosRequest from "shared/functions/axiosRequest";
import { ticketKeys } from "query/keys";
import { TICKETS_LIST_PATH } from "query/ticketsList.api";

function notesPath(ticketId: string): string {
  return `${TICKETS_LIST_PATH}/${encodeURIComponent(ticketId)}/notes`;
}

interface ApiEnvelope {
  status?: boolean;
  data?: unknown;
  force_logout?: boolean;
}

/** POST فقط — إرسال ملاحظة / رد على التذكرة */
export async function postTicketNote(
  navigate: NavigateFunction,
  ticketId: string,
  text: string
): Promise<void> {
  const { data } = await axiosRequest.post<Record<string, unknown>>(notesPath(ticketId), {
    text: text.trim(),
  });
  const root = data as unknown as ApiEnvelope;
  if (root.force_logout) {
    localStorage.removeItem("user");
    navigate("/authentication/sign-in");
    throw new Error("FORCE_LOGOUT");
  }
}

export function usePostTicketNote(ticketId: string) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (text: string) => postTicketNote(navigate, ticketId, text),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ticketKeys.detail(ticketId) });
    },
  });
}
