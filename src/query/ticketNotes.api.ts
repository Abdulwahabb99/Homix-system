import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { NavigateFunction } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import type { ChatMessage, Ticket } from "layouts/Tickets/utils/constants";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import axiosRequest from "shared/functions/axiosRequest";
import { ticketKeys } from "query/keys";
import { TICKETS_LIST_PATH } from "query/ticketsList.api";

function notesPath(ticketId: string): string {
  return `${TICKETS_LIST_PATH}/${encodeURIComponent(ticketId)}/notes`;
}

function noteDetailPath(ticketId: string, noteId: string): string {
  return `${TICKETS_LIST_PATH}/${encodeURIComponent(ticketId)}/notes/${encodeURIComponent(noteId)}`;
}

function formatNowChatTime(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function buildOptimisticChatMessage(text: string): ChatMessage {
  let name = "—";
  let authorUserId: number | undefined;
  try {
    const raw = localStorage.getItem("user");
    if (raw) {
      const u = JSON.parse(raw) as { firstName?: string; lastName?: string; id?: unknown; userId?: unknown };
      const fn = String(u?.firstName ?? "").trim();
      const ln = String(u?.lastName ?? "").trim();
      const n = [fn, ln].filter(Boolean).join(" ").trim();
      if (n) name = n;
      const uid = Number(u?.id ?? u?.userId);
      if (Number.isFinite(uid)) authorUserId = uid;
    }
  } catch {
    /* ignore */
  }
  return {
    from: "admin",
    name,
    msg: text.trim(),
    time: formatNowChatTime(),
    id: `optimistic-${Date.now()}`,
    ...(authorUserId != null ? { authorUserId } : {}),
  };
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

/** PUT — تعديل ملاحظة موجودة */
export async function putTicketNote(
  navigate: NavigateFunction,
  ticketId: string,
  noteId: string,
  text: string
): Promise<void> {
  const { data } = await axiosRequest.put<Record<string, unknown>>(noteDetailPath(ticketId, noteId), {
    text: text.trim(),
  });
  const root = data as unknown as ApiEnvelope;
  if (root.force_logout) {
    localStorage.removeItem("user");
    navigate("/authentication/sign-in");
    throw new Error("FORCE_LOGOUT");
  }
}

/** DELETE — مسح ملاحظة */
export async function deleteTicketNote(
  navigate: NavigateFunction,
  ticketId: string,
  noteId: string
): Promise<void> {
  const { data } = await axiosRequest.delete<Record<string, unknown>>(noteDetailPath(ticketId, noteId));
  const root = (data ?? {}) as unknown as ApiEnvelope;
  if (root.force_logout) {
    localStorage.removeItem("user");
    navigate("/authentication/sign-in");
    throw new Error("FORCE_LOGOUT");
  }
}

export function usePutTicketNote(ticketId: string) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation<void, Error, { noteId: string; text: string }>({
    mutationFn: ({ noteId, text }) => putTicketNote(navigate, ticketId, noteId, text),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ticketKeys.detail(ticketId) });
    },
    onError: () => {
      NotificationMeassage("error", "تعذّر تعديل الملاحظة");
    },
  });
}

export function useDeleteTicketNote(ticketId: string) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (noteId: string) => deleteTicketNote(navigate, ticketId, noteId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ticketKeys.detail(ticketId) });
    },
    onError: () => {
      NotificationMeassage("error", "تعذّر حذف الملاحظة");
    },
  });
}

export function usePostTicketNote(ticketId: string) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string, { previous: Ticket | undefined }>({
    mutationFn: (text: string) => postTicketNote(navigate, ticketId, text),
    onMutate: async (text) => {
      await queryClient.cancelQueries({ queryKey: ticketKeys.detail(ticketId) });
      const previous = queryClient.getQueryData<Ticket>(ticketKeys.detail(ticketId));
      if (previous) {
        const optimistic = buildOptimisticChatMessage(text);
        queryClient.setQueryData<Ticket>(ticketKeys.detail(ticketId), {
          ...previous,
          chat: [...previous.chat, optimistic],
        });
      }
      return { previous };
    },
    onError: (_err, _text, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(ticketKeys.detail(ticketId), context.previous);
      }
      NotificationMeassage("error", "تعذّر إرسال الرسالة");
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ticketKeys.detail(ticketId) });
    },
  });
}
