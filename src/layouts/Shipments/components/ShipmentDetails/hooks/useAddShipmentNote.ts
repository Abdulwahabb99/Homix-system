import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axiosRequest from "shared/functions/axiosRequest";
import { shipmentKeys } from "query/keys";

/**
 * Manages the notes composer: posts a note via `POST /shipments/{id}/notes`
 * then refreshes the detail cache so the new note appears.
 */
export function useAddShipmentNote(shipmentDetailId: string, shipmentId: number) {
  const queryClient = useQueryClient();
  const [noteText, setNoteText] = useState("");
  const [sending, setSending] = useState(false);

  const send = () => {
    const text = noteText.trim();
    if (!text || sending) return;
    setSending(true);
    axiosRequest
      .post(`/shipments/${shipmentId}/notes`, { text })
      .then(() => {
        setNoteText("");
        queryClient.invalidateQueries({ queryKey: shipmentKeys.detail(shipmentDetailId) });
      })
      .catch(() => toast.error("تعذّر إرسال الملاحظة"))
      .finally(() => setSending(false));
  };

  return { noteText, setNoteText, sending, send };
}
