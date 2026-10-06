/**
 * "محادثة السيلر مع مسؤول الحساب" — محادثة داخلية منفصلة تمامًا عن "الملاحظات
 * والتواصل" (OrderNotesCard). الباك إند يمنع البائع من الوصول لها عبر
 * isNotVendor حتى لو كانت لديه orders_view/orders_edit.
 */
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

export function useSendSellerChatMessage(orderId: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ text, files }: { text: string; files: File[] }) => {
      const { data } = await axiosRequest.post(`/orders/${orderId}/seller-chat`, { text });
      const messageId = data?.data?.id;
      if (files.length > 0 && messageId != null) {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));
        await axiosRequest.post(`/orders/${orderId}/seller-chat/${messageId}/upload`, formData);
      }
      return data?.data;
    },
    onSuccess: async () => {
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
