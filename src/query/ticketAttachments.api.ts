import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { NavigateFunction } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import axiosRequest from "shared/functions/axiosRequest";
import { ticketKeys } from "query/keys";
import { TICKETS_LIST_PATH } from "query/ticketsList.api";

interface ApiEnvelope {
  status?: boolean;
  data?: unknown;
  force_logout?: boolean;
}

function attachmentsUploadPath(ticketId: string): string {
  return `${TICKETS_LIST_PATH}/${encodeURIComponent(ticketId)}/attachments/upload`;
}

function attachmentDetailPath(ticketId: string, attachmentId: number): string {
  return `${TICKETS_LIST_PATH}/${encodeURIComponent(ticketId)}/attachments/${encodeURIComponent(String(attachmentId))}`;
}

function buildAttachmentsFormData(files: File[], descriptions?: string[]): FormData {
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }
  /** أوصال بالفهرس مع كل ملف — تُرسل فقط عند تمرير descriptions (حتى لو فارغة لبعض الفهارس) */
  if (descriptions !== undefined) {
    for (let i = 0; i < files.length; i++) {
      const d = descriptions[i];
      formData.append("descriptions", d != null && String(d).trim() !== "" ? String(d).trim() : "");
    }
  }
  return formData;
}

/** POST /tickets/{ticketId}/attachments/upload — multipart/form-data: files (واحد أو أكثر)، descriptions اختياري بنفس ترتيب الملفات */
export async function uploadTicketAttachments(
  navigate: NavigateFunction,
  ticketId: string,
  files: File[],
  descriptions?: string[]
): Promise<void> {
  if (!files.length) return;
  const formData = buildAttachmentsFormData(files, descriptions);
  const { data } = await axiosRequest.post<Record<string, unknown>>(attachmentsUploadPath(ticketId), formData);
  const root = data as unknown as ApiEnvelope;
  if (root.force_logout) {
    localStorage.removeItem("user");
    navigate("/authentication/sign-in");
    throw new Error("FORCE_LOGOUT");
  }
}

export function useUploadTicketAttachments(ticketId: string) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation<void, Error, { files: File[]; descriptions?: string[] }>({
    mutationFn: ({ files, descriptions }) => uploadTicketAttachments(navigate, ticketId, files, descriptions),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ticketKeys.detail(ticketId) });
      NotificationMeassage("success", "تم رفع المرفق بنجاح");
    },
    onError: () => {
      NotificationMeassage("error", "تعذّر رفع المرفق");
    },
  });
}

/** DELETE /tickets/{ticketId}/attachments/{attachmentId} — يُفترض أن يسمح به الـ API للأدمن فقط */
export async function deleteTicketAttachment(
  navigate: NavigateFunction,
  ticketId: string,
  attachmentId: number
): Promise<void> {
  const { data } = await axiosRequest.delete<Record<string, unknown>>(
    attachmentDetailPath(ticketId, attachmentId)
  );
  const root = (data ?? {}) as unknown as ApiEnvelope;
  if (root.force_logout) {
    localStorage.removeItem("user");
    navigate("/authentication/sign-in");
    throw new Error("FORCE_LOGOUT");
  }
}

export function useDeleteTicketAttachment(ticketId: string) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (attachmentId: number) => deleteTicketAttachment(navigate, ticketId, attachmentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ticketKeys.detail(ticketId) });
      NotificationMeassage("success", "تم حذف المرفق");
    },
    onError: () => {
      NotificationMeassage("error", "تعذّر حذف المرفق");
    },
  });
}
