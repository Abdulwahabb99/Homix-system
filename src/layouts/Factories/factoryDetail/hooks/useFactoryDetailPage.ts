/**
 * منطق صفحة تفاصيل المصنع:
 *   GET    /factories/{id}                                  → التفاصيل والمستندات
 *   GET    /factories/meta                                  → أنواع المستندات وحالاتها
 *   PUT    /factories/{id}                                   → عبر نموذج التعديل
 *   POST   /factories/{id}/upload                            → رفع مستند
 *   DELETE /factories/{factoryId}/attachments/{attachmentId}  → حذف مستند
 */
import { useCallback, useState } from "react";
import { useFactoriesMetaQuery, type FactoriesMeta } from "query/factoriesMeta";
import { useFactoryDetailQuery, type FactoryDetail } from "query/factoryDetail";
import {
  useDeleteFactoryAttachmentMutation,
  useSaveFactoryMutation,
  useUploadFactoryDocumentsMutation,
} from "query/factoryMutations";
import { formToPayload } from "../../utils/calc";
import type { FactoryFormValues } from "../../utils/types";

export interface UseFactoryDetailPage {
  factoryId: number | null;
  detail: FactoryDetail | null;
  meta: FactoriesMeta | undefined;
  isLoading: boolean;
  isError: boolean;

  /** نموذج التعديل (نفس مودال صفحة القائمة) */
  isEditOpen: boolean;
  openEdit: () => void;
  closeEdit: () => void;
  saveFactory: (values: FactoryFormValues) => void;
  isSaving: boolean;

  /** المستندات */
  uploadDocuments: (files: File[], attachmentType: number) => void;
  isUploading: boolean;
  deleteDocument: (documentId: number) => void;
  deletingDocumentId: number | null;
}

export function useFactoryDetailPage(rawId: string | undefined): UseFactoryDetailPage {
  const parsed = Number(rawId);
  const factoryId = Number.isFinite(parsed) && parsed > 0 ? parsed : null;

  const [isEditOpen, setIsEditOpen] = useState(false);

  const { data: meta } = useFactoriesMetaQuery();
  const detailQuery = useFactoryDetailQuery(factoryId);

  const saveMutation = useSaveFactoryMutation();
  const uploadMutation = useUploadFactoryDocumentsMutation();
  const deleteMutation = useDeleteFactoryAttachmentMutation();

  const openEdit = useCallback(() => setIsEditOpen(true), []);
  const closeEdit = useCallback(() => setIsEditOpen(false), []);

  const saveFactory = useCallback(
    (values: FactoryFormValues) => {
      if (factoryId == null) return;
      saveMutation.mutate(
        { id: factoryId, body: formToPayload(values) },
        { onSuccess: () => setIsEditOpen(false) }
      );
    },
    [factoryId, saveMutation]
  );

  /** حالة التوثيق الافتراضية للمرفوع الجديد = أول حالة في الـ meta (قيد المراجعة) */
  const defaultVerification = meta?.documentStatuses?.[0]?.value;

  const uploadDocuments = useCallback(
    (files: File[], attachmentType: number) => {
      if (factoryId == null || files.length === 0) return;
      const typeLabel = meta?.documentTypes.find((t) => t.value === attachmentType)?.label ?? "";
      uploadMutation.mutate({
        factoryId,
        files: files.map((file) => ({
          file,
          attachmentType,
          description: typeLabel,
          verificationStatus: defaultVerification,
        })),
      });
    },
    [factoryId, meta, defaultVerification, uploadMutation]
  );

  const deleteDocument = useCallback(
    (documentId: number) => {
      if (factoryId == null) return;
      deleteMutation.mutate({ factoryId, attachmentId: documentId });
    },
    [factoryId, deleteMutation]
  );

  return {
    factoryId,
    detail: detailQuery.data ?? null,
    meta,
    isLoading: detailQuery.isLoading,
    isError: detailQuery.isError || factoryId == null,

    isEditOpen,
    openEdit,
    closeEdit,
    saveFactory,
    isSaving: saveMutation.isPending,

    uploadDocuments,
    isUploading: uploadMutation.isPending,
    deleteDocument,
    deletingDocumentId: deleteMutation.isPending
      ? deleteMutation.variables?.attachmentId ?? null
      : null,
  };
}
