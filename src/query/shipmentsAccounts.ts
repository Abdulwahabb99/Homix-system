import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";
import { downloadBlobResponse } from "shared/functions/downloadBlobResponse";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { shipmentKeys } from "./keys";

export interface DeliveryAccountItem {
  /** معرّف الطلب — صف الحساب هو الطلب المُسلَّم نفسه */
  id: number;
  accountingStatus: number;
  operationNumber: string;
  orderNumber: string;
  sellerName: string;
  productCode: string;
  shippingCompanyName: string;
  deliveryDate: string | null;
  paymentMethodLabel: string;
  amountToCollect: number;
  receivedAmount: number;
  accountingStatusLabel: string;
  accountingDate: string | null;
  reference: string | null;
}

export interface ExpenseItem {
  id: number;
  accountingDate: string | null;
  accountingStatus: number;
  accountingStatusLabel: string;
  amount: number;
  reason: string;
  type: number;
  typeLabel: string;
}

export const ACCOUNTS_PAGE_SIZE = 20;

export interface AccountsParams {
  page: number;
  /** فلاتر تبويب التسليمات — تُرسل فقط عند ضبطها */
  accountingStatus?: string;
  orderNumber?: string;
  paymentMethod?: string;
  settledDate?: string;
}

function buildQuery(p: AccountsParams): string {
  const query = new URLSearchParams({
    page: String(p.page),
    size: String(ACCOUNTS_PAGE_SIZE),
  });
  if (p.accountingStatus) query.set("accountingStatus", p.accountingStatus);
  if (p.orderNumber)      query.set("orderNumber", p.orderNumber);
  if (p.paymentMethod)    query.set("paymentMethod", p.paymentMethod);
  if (p.settledDate)      query.set("settledDate", new Date(p.settledDate).toISOString());
  return query.toString();
}

function buildExportQuery(p: Omit<AccountsParams, "page">): string {
  const query = new URLSearchParams(buildQuery({ ...p, page: 1 }));
  query.delete("page");
  query.delete("size");
  return query.toString();
}

function normalizeList<T>(data: any): { items: T[]; page: number; size: number; totalCount: number } {
  const raw = data?.data ?? data ?? {};
  return {
    items: Array.isArray(raw.items) ? raw.items : [],
    page:  raw.page ?? 1,
    size:  raw.size ?? ACCOUNTS_PAGE_SIZE,
    totalCount: raw.totalCount ?? 0,
  };
}

export async function fetchDeliveryAccounts(params: AccountsParams) {
  const { data } = await axiosRequest.get(`/shipments/accounts/deliveries?${buildQuery(params)}`);
  return normalizeList<DeliveryAccountItem>(data);
}

export async function fetchExpenseAccounts(params: AccountsParams) {
  const { data } = await axiosRequest.get(`/shipments/accounts/expenses?${buildQuery(params)}`);
  return normalizeList<ExpenseItem>(data);
}

export async function exportDeliveryAccounts(params: Omit<AccountsParams, "page">): Promise<void> {
  const query = buildExportQuery(params);
  const response = await axiosRequest.get(`/shipments/accounts/deliveries/export${query ? `?${query}` : ""}`, {
    responseType: "blob",
  });
  downloadBlobResponse(response, "delivery-accounts.xlsx");
}

export async function exportExpenseAccounts(params: Omit<AccountsParams, "page"> = {}): Promise<void> {
  const query = buildExportQuery(params);
  const response = await axiosRequest.get(`/shipments/accounts/expenses/export${query ? `?${query}` : ""}`, {
    responseType: "blob",
  });
  downloadBlobResponse(response, "expenses.xlsx");
}

export function useDeliveryAccountsQuery(params: AccountsParams) {
  return useQuery({
    queryKey: shipmentKeys.accounts("deliveries", JSON.stringify(params)),
    queryFn: () => fetchDeliveryAccounts(params),
    gcTime: 0,
    refetchOnMount: "always",
    staleTime: 0,
  });
}

export function useExpenseAccountsQuery(params: AccountsParams) {
  return useQuery({
    queryKey: shipmentKeys.accounts("expenses", JSON.stringify(params)),
    queryFn: () => fetchExpenseAccounts(params),
    gcTime: 0,
    refetchOnMount: "always",
    staleTime: 0,
  });
}

/** PUT /shipments/accounts/deliveries/{orderId} — تغيير حالة المحاسبة لتسليم. */
export interface UpdateDeliveryAccountPayload {
  accountingDate?: string | null;
  accountingReference?: string;
  accountingStatus?: number;
  /** يخفي السجل عن تبويب الحسابات فقط — الطلب/الشحنة نفسها تبقى كما هي في كل مكان آخر. */
  hidden?: boolean;
}

export async function putDeliveryAccount(
  orderId: number,
  body: UpdateDeliveryAccountPayload
): Promise<void> {
  await axiosRequest.put(`/shipments/accounts/deliveries/${orderId}`, body);
}

export function useUpdateDeliveryAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: { orderId: number; body: UpdateDeliveryAccountPayload }) =>
      putDeliveryAccount(vars.orderId, vars.body),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: shipmentKeys.accountsRoot() }),
        queryClient.invalidateQueries({ queryKey: shipmentKeys.meta() }),
      ]);
      NotificationMeassage("success", "تم تحديث حالة المحاسبة");
    },
    onError: () => {
      NotificationMeassage("error", "حدث خطأ أثناء تحديث حالة المحاسبة");
    },
  });
}

/** يخفي تسليمًا عن تبويب الحسابات فقط — لا يمسّ الطلب أو الشحنة نفسها في أي مكان آخر. */
export function useHideDeliveryAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: number) => putDeliveryAccount(orderId, { hidden: true }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: shipmentKeys.accountsRoot() }),
        queryClient.invalidateQueries({ queryKey: shipmentKeys.meta() }),
      ]);
      NotificationMeassage("success", "تم إخفاء السجل من تبويب الحسابات");
    },
    onError: () => {
      NotificationMeassage("error", "حدث خطأ أثناء إخفاء السجل");
    },
  });
}

/** POST /shipments/accounts/deliveries/{orderId}/reference — «المرجع» ملف مرفوع لا نص حر. */
export async function uploadDeliveryAccountReference(orderId: number, file: File): Promise<string> {
  const formData = new FormData();
  formData.append("files", file);
  const { data } = await axiosRequest.post(`/shipments/accounts/deliveries/${orderId}/reference`, formData);
  return data?.data?.reference ?? "";
}

export function useUploadDeliveryAccountReferenceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: { orderId: number; file: File }) =>
      uploadDeliveryAccountReference(vars.orderId, vars.file),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: shipmentKeys.accountsRoot() }),
        queryClient.invalidateQueries({ queryKey: shipmentKeys.meta() }),
      ]);
      NotificationMeassage("success", "تم رفع المرجع");
    },
    onError: () => {
      NotificationMeassage("error", "تعذّر رفع المرجع");
    },
  });
}

/** PUT /shipments/accounts/deliveries/bulk-update — نفس تعديل حالة المحاسبة على عدة تسليمات دفعة واحدة. */
export async function putDeliveryAccountsBulk(
  orderIds: number[],
  body: UpdateDeliveryAccountPayload
): Promise<void> {
  await axiosRequest.put(`/shipments/accounts/deliveries/bulk-update`, { data: body, orderIds });
}

export function useBulkUpdateDeliveryAccountsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: { orderIds: number[]; body: UpdateDeliveryAccountPayload }) =>
      putDeliveryAccountsBulk(vars.orderIds, vars.body),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: shipmentKeys.accountsRoot() }),
        queryClient.invalidateQueries({ queryKey: shipmentKeys.meta() }),
      ]);
      NotificationMeassage("success", "تم تحديث حالة المحاسبة للسجلات المحددة");
    },
    onError: () => {
      NotificationMeassage("error", "حدث خطأ أثناء التحديث الجماعي");
    },
  });
}

/** POST/PUT/DELETE /shipments/accounts/expenses — المصروفات تُدخَل يدوياً. */
export interface ExpenseMutationPayload {
  accountingDate?: string | null;
  accountingStatus?: number;
  amount: number;
  reason: string;
  type: number;
}

export type ExpenseUpdatePayload = Partial<ExpenseMutationPayload>;

export async function postExpense(body: ExpenseMutationPayload): Promise<void> {
  await axiosRequest.post(`/shipments/accounts/expenses`, body);
}

export async function putExpense(expenseId: number, body: ExpenseUpdatePayload): Promise<void> {
  await axiosRequest.put(`/shipments/accounts/expenses/${expenseId}`, body);
}

export async function putExpensesBulk(expenseIds: number[], body: ExpenseUpdatePayload): Promise<void> {
  await axiosRequest.put(`/shipments/accounts/expenses/bulk-update`, { data: body, expenseIds });
}

export async function deleteExpense(expenseId: number): Promise<void> {
  await axiosRequest.delete(`/shipments/accounts/expenses/${expenseId}`);
}

export function useCreateExpenseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postExpense,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: shipmentKeys.accountsRoot() }),
        queryClient.invalidateQueries({ queryKey: shipmentKeys.meta() }),
      ]);
      NotificationMeassage("success", "تم حفظ المصروف");
    },
    onError: () => NotificationMeassage("error", "تعذّر حفظ المصروف"),
  });
}

export function useUpdateExpenseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { expenseId: number; body: ExpenseUpdatePayload }) =>
      putExpense(vars.expenseId, vars.body),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: shipmentKeys.accountsRoot() }),
        queryClient.invalidateQueries({ queryKey: shipmentKeys.meta() }),
      ]);
      NotificationMeassage("success", "تم تعديل المصروف");
    },
    onError: () => NotificationMeassage("error", "تعذّر تعديل المصروف"),
  });
}

export function useBulkUpdateExpensesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { expenseIds: number[]; body: ExpenseUpdatePayload }) =>
      putExpensesBulk(vars.expenseIds, vars.body),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: shipmentKeys.accountsRoot() }),
        queryClient.invalidateQueries({ queryKey: shipmentKeys.meta() }),
      ]);
      NotificationMeassage("success", "تم تعديل المصروفات المحددة");
    },
    onError: () => NotificationMeassage("error", "حدث خطأ أثناء التعديل الجماعي"),
  });
}

export function useDeleteExpenseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: shipmentKeys.accountsRoot() }),
        queryClient.invalidateQueries({ queryKey: shipmentKeys.meta() }),
      ]);
      NotificationMeassage("success", "تم حذف المصروف");
    },
    onError: () => NotificationMeassage("error", "تعذّر حذف المصروف"),
  });
}

export interface ManagedExpenseType {
  id?: number;
  label: string;
}

export async function updateExpenseTypes(options: ManagedExpenseType[]): Promise<void> {
  await axiosRequest.put("/shipments/accounts/expense-types", { options });
}

export function useUpdateExpenseTypesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateExpenseTypes,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: shipmentKeys.meta() });
      NotificationMeassage("success", "تم حفظ أنواع المصروفات");
    },
    onError: () => NotificationMeassage("error", "تعذّر حفظ أنواع المصروفات"),
  });
}
