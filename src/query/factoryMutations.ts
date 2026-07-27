/**
 * طلبات تعديل الصنّاع:
 *   POST   /factories
 *   PUT    /factories/{id}
 *   DELETE /factories/{id}
 *   POST   /factories/{id}/upload                      (multipart)
 *   DELETE /factories/{factoryId}/attachments/{attachmentId}
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { factoryKeys } from "./keys";

/** جسم الإنشاء/التعديل — مسطّح، نفس أسماء حقول الـ API حرفياً */
export interface FactoryPayload {
  name: string;
  description?: string;
  factoryCategory: string;
  status: number;
  joinDate?: string;
  website?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  country?: string;

  responsibleName?: string;
  responsiblePhone?: string;
  responsibleEmail?: string;
  responsibleRole?: string;

  contactPersonName?: string;
  contactPersonPhoneNumber?: string;
  contactPersonEmail?: string;
  contactPersonRole?: string;

  cairoGizaShipping?: number;
  otherCitiesShipping?: number;

  bankName?: string;
  bankAccountHolderName?: string;
  bankAccountNumber?: string;
  bankAccountType?: string;
  walletNumber?: string;
  walletProvider?: string;
  instapayNumber?: string;
}

/** ملف واحد في رفع المستندات */
export interface FactoryUploadFile {
  file: File;
  description: string;
  /** أحد معرّفات documentTypes من الـ meta */
  attachmentType: number;
  /** أحد معرّفات documentStatuses من الـ meta */
  verificationStatus?: number;
  issuedAt?: string;
  expiresAt?: string;
}

export async function createFactory(body: FactoryPayload): Promise<number | null> {
  const { data } = await axiosRequest.post("/factories", body);
  // شكل استجابة الإنشاء غير موثّق — نحاول قراءة المعرّف من الأماكن المحتملة
  const id = data?.data?.id ?? data?.id ?? null;
  return id != null ? Number(id) : null;
}

export async function updateFactory(id: number, body: FactoryPayload): Promise<void> {
  await axiosRequest.put(`/factories/${id}`, body);
}

export async function deleteFactory(id: number): Promise<void> {
  await axiosRequest.delete(`/factories/${id}`);
}

/**
 * رفع مستندات مصنع. الحقول مصفوفات متوازية — الفهرس n في كل مصفوفة يخصّ الملف n.
 * التواريخ تُضاف فقط عند توفّرها حتى لا تُرسل قيم فارغة تُفسد المحاذاة.
 */
export async function uploadFactoryDocuments(
  factoryId: number,
  files: FactoryUploadFile[]
): Promise<void> {
  if (!files.length) return;

  const form = new FormData();
  files.forEach((f) => {
    form.append("files", f.file);
    form.append("descriptions", f.description ?? "");
    form.append("attachmentTypes", String(f.attachmentType));
    if (f.verificationStatus != null) {
      form.append("verificationStatuses", String(f.verificationStatus));
    }
    if (f.issuedAt) form.append("issuedAt", f.issuedAt);
    if (f.expiresAt) form.append("expiresAt", f.expiresAt);
  });

  // لا نضبط Content-Type يدوياً — المتصفّح يضيف boundary الصحيح
  await axiosRequest.post(`/factories/${factoryId}/upload`, form);
}

export async function deleteFactoryAttachment(
  factoryId: number,
  attachmentId: number
): Promise<void> {
  await axiosRequest.delete(`/factories/${factoryId}/attachments/${attachmentId}`);
}

/** يبطل القائمة والملخّص (ويُحدّث تفاصيل مصنع بعينه عند تمرير معرّفه) */
function useInvalidateFactories() {
  const queryClient = useQueryClient();
  return async (factoryId?: number) => {
    if (factoryId != null) {
      await queryClient.invalidateQueries({ queryKey: factoryKeys.detail(factoryId) });
    }
    await queryClient.invalidateQueries({ queryKey: factoryKeys.all() });
  };
}

export interface SaveFactoryVars {
  /** null = إنشاء */
  id: number | null;
  body: FactoryPayload;
  /** مستندات تُرفع بعد نجاح الحفظ */
  documents?: FactoryUploadFile[];
}

/**
 * حفظ موحّد (إنشاء أو تعديل) + رفع المستندات المرفقة بعده.
 * في حالة الإنشاء نحتاج معرّف المصنع للرفع؛ إن لم ترجعه الاستجابة يُبلَّغ
 * المستخدم بأن المصنع أُنشئ وأن المستندات تُضاف من شاشة التعديل.
 */
export function useSaveFactoryMutation() {
  const invalidate = useInvalidateFactories();

  return useMutation({
    mutationFn: async ({ id, body, documents = [] }: SaveFactoryVars) => {
      let factoryId = id;
      if (factoryId == null) {
        factoryId = await createFactory(body);
      } else {
        await updateFactory(factoryId, body);
      }

      if (documents.length > 0) {
        if (factoryId == null) return { factoryId, documentsSkipped: true };
        await uploadFactoryDocuments(factoryId, documents);
      }
      return { factoryId, documentsSkipped: false };
    },
    onSuccess: async (result, vars) => {
      await invalidate(result.factoryId ?? undefined);
      NotificationMeassage("success", vars.id == null ? "تم إضافة المصنع" : "تم تعديل المصنع");
      if (result.documentsSkipped) {
        NotificationMeassage("info", "أُضيف المصنع — أضف المستندات من شاشة التعديل");
      }
    },
    onError: () => NotificationMeassage("error", "حدث خطأ أثناء حفظ المصنع"),
  });
}

export function useDeleteFactoryMutation() {
  const invalidate = useInvalidateFactories();

  return useMutation({
    mutationFn: (id: number) => deleteFactory(id),
    onSuccess: async () => {
      await invalidate();
      NotificationMeassage("success", "تم حذف المصنع");
    },
    onError: () => NotificationMeassage("error", "حدث خطأ أثناء حذف المصنع"),
  });
}

export function useDeleteFactoryAttachmentMutation() {
  const invalidate = useInvalidateFactories();

  return useMutation({
    mutationFn: (vars: { factoryId: number; attachmentId: number }) =>
      deleteFactoryAttachment(vars.factoryId, vars.attachmentId),
    onSuccess: async (_r, vars) => {
      await invalidate(vars.factoryId);
      NotificationMeassage("success", "تم حذف المستند");
    },
    onError: () => NotificationMeassage("error", "حدث خطأ أثناء حذف المستند"),
  });
}
