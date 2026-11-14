/**
 * "محادثة السيلر مع مسؤول الحساب" — محادثة داخلية منفصلة تمامًا عن "الملاحظات
 * والتواصل" (OrderNotesCard). الباك إند يمنع البائع من الوصول لها عبر
 * isNotVendor حتى لو كانت لديه orders_view/orders_edit.
 */
import { useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";

export interface SellerChatAttachment {
  createdAt: string;
  description: string;
  id: number;
  name: string;
  url: string;
}

export interface SellerChatMessage {
  attachments: SellerChatAttachment[];
  createdAt: string;
  id: number;
  text: string;
  /** معرّف كاتب الرسالة — يُستخدم لتحديد "رسائلي" مقابل رسائل الآخرين */
  userId?: number;
  userName: string;
}

export interface SellerChatQuickReply {
  id: number;
  label: string;
}

const keys = {
  messages: (orderId: number) => ["orderSellerChat", "messages", orderId] as const,
  quickReplies: () => ["orderSellerChat", "quickReplies"] as const,
};

export function useSellerChatMessages(orderId: number, enabled = true) {
  return useQuery<SellerChatMessage[]>({
    queryKey: keys.messages(orderId),
    queryFn: async () => (await axiosRequest.get(`/orders/${orderId}/seller-chat`)).data.data,
    enabled: enabled && Number.isFinite(orderId) && orderId > 0,
  });
}

export function useSellerChatQuickReplies(enabled = true) {
  return useQuery<SellerChatQuickReply[]>({
    queryKey: keys.quickReplies(),
    queryFn: async () => (await axiosRequest.get("/orders/seller-chat/quick-replies")).data.data,
    enabled,
    staleTime: 60_000,
  });
}

/** رسالة نُشر نصها بنجاح لكن رفع مرفقاتها فشل — إعادة المحاولة ترفع المرفقات فقط ولا تنشر النص مرة ثانية. */
export interface PendingSellerChatUpload {
  messageId: number;
  text: string;
}

export class SellerChatUploadError extends Error {
  constructor(public readonly cause: unknown) {
    super("seller chat attachment upload failed");
  }
}

type Http = Pick<typeof axiosRequest, "post">;

export async function postSellerChatMessage(
  http: Http,
  orderId: number,
  { text, files }: { text: string; files: File[] },
  pending: { current: PendingSellerChatUpload | null },
) {
  let messageId: number | undefined;
  if (pending.current && pending.current.text === text && files.length > 0) {
    messageId = pending.current.messageId;
  } else {
    pending.current = null;
    const { data } = await http.post(`/orders/${orderId}/seller-chat`, { text });
    messageId = data?.data?.id;
    if (files.length > 0 && messageId != null) pending.current = { messageId, text };
  }
  if (files.length > 0 && messageId != null) {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    try {
      await http.post(`/orders/${orderId}/seller-chat/${messageId}/upload`, formData);
    } catch (error) {
      throw new SellerChatUploadError(error);
    }
    pending.current = null;
  }
  return messageId;
}

export function useSendSellerChatMessage(orderId: number) {
  const client = useQueryClient();
  const pending = useRef<PendingSellerChatUpload | null>(null);
  return useMutation({
    mutationFn: (input: { text: string; files: File[] }) => postSellerChatMessage(axiosRequest, orderId, input, pending),
    /* نجاح أو فشل رفع المرفق: النص قد يكون نُشر بالفعل، فحدّث القائمة في الحالتين. */
    onSettled: async () => {
      await client.invalidateQueries({ queryKey: keys.messages(orderId) });
    },
  });
}

export function useUpdateSellerChatQuickReplies() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (quickReplies: Array<{ id?: number; label: string }>): Promise<SellerChatQuickReply[]> =>
      (await axiosRequest.put("/orders/seller-chat/quick-replies", { quickReplies })).data.data,
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: keys.quickReplies() });
    },
  });
}
