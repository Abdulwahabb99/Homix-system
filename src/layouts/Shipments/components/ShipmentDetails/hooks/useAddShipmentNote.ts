import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axiosRequest from "shared/functions/axiosRequest";
import { shipmentKeys } from "query/keys";

export interface SelectedNoteFile {
  file: File;
  url: string;
}

/**
 * Manages the notes composer: posts a note via `POST /shipments/{id}/notes`,
 * then — if the user attached files — uploads them to the note that just
 * came back via `POST /shipments/{id}/notes/{noteId}/upload`, and finally
 * refreshes the detail cache so the new note (with its attachments) appears.
 */
export function useAddShipmentNote(shipmentDetailId: string, shipmentId: number) {
  const queryClient = useQueryClient();
  const [noteText, setNoteText] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<SelectedNoteFile[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    setSelectedFiles(files.map((file) => ({ file, url: URL.createObjectURL(file) })));
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const send = async () => {
    const text = noteText.trim();
    if ((!text && selectedFiles.length === 0) || sending) return;
    setSending(true);

    try {
      const { data } = await axiosRequest.post(`/shipments/${shipmentId}/notes`, { text });
      const noteId = data?.data?.id;

      if (selectedFiles.length > 0 && noteId != null) {
        const formData = new FormData();
        selectedFiles.forEach(({ file }) => formData.append("files", file));
        try {
          await axiosRequest.post(`/shipments/${shipmentId}/notes/${noteId}/upload`, formData);
        } catch {
          toast.error("تمت إضافة الملاحظة لكن تعذّر رفع المرفقات");
        }
      }

      setNoteText("");
      setSelectedFiles([]);
      queryClient.invalidateQueries({ queryKey: shipmentKeys.detail(shipmentDetailId) });
    } catch {
      toast.error("تعذّر إرسال الملاحظة");
    } finally {
      setSending(false);
    }
  };

  return { noteText, setNoteText, sending, send, selectedFiles, handleFileChange, handleRemoveFile };
}
