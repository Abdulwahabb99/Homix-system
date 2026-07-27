/**
 * `GET /factories/{id}` — تفاصيل مصنع كاملة (البيانات البنكية، المسؤول،
 * جهة الاتصال، أسعار الشحن، المستندات).
 *
 * الاستجابة متداخلة (`bankDetails` / `responsible` / `shippingRates`) بينما جسم
 * الحفظ مسطّح، فيُطبَّع هنا إلى شكل مسطّح واحد يستخدمه النموذج مباشرة.
 */
import { useQuery } from "@tanstack/react-query";
import axiosRequest from "shared/functions/axiosRequest";
import { factoryKeys } from "./keys";

export interface FactoryDocument {
  id: number;
  name: string;
  description: string;
  url: string;
  type: number | null;
  typeLabel: string;
  verificationStatus: number | null;
  verificationStatusLabel: string;
  issuedAt: string | null;
  expiresAt: string | null;
  createdAt: string | null;
}

/** تفاصيل المصنع بعد التسطيح — أسماء الحقول تطابق جسم POST/PUT */
export interface FactoryDetail {
  id: number;
  code: string;
  name: string;
  description: string;
  factoryCategory: string;
  status: number;
  statusLabel: string;
  joinDate: string;
  website: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;

  responsibleName: string;
  responsiblePhone: string;
  responsibleEmail: string;
  responsibleRole: string;

  contactPersonName: string;
  contactPersonPhoneNumber: string;
  contactPersonEmail: string;
  contactPersonRole: string;

  cairoGizaShipping: number;
  otherCitiesShipping: number;

  bankName: string;
  bankAccountHolderName: string;
  bankAccountNumber: string;
  bankAccountType: string;
  walletNumber: string;
  walletProvider: string;
  instapayNumber: string;

  documents: FactoryDocument[];
}

function str(v: unknown): string {
  return v == null ? "" : String(v);
}

function normalizeDocument(raw: any): FactoryDocument {
  return {
    id: Number(raw?.id),
    name: str(raw?.name),
    description: str(raw?.description),
    url: str(raw?.url),
    type: raw?.type != null ? Number(raw.type) : null,
    typeLabel: str(raw?.typeLabel),
    verificationStatus: raw?.verificationStatus != null ? Number(raw.verificationStatus) : null,
    verificationStatusLabel: str(raw?.verificationStatusLabel),
    issuedAt: raw?.issuedAt ?? null,
    expiresAt: raw?.expiresAt ?? null,
    createdAt: raw?.createdAt ?? null,
  };
}

export function normalizeFactoryDetail(body: any): FactoryDetail | null {
  const d = body?.data ?? body;
  if (!d || typeof d !== "object" || d.id == null) return null;

  const bank = d.bankDetails ?? {};
  const resp = d.responsible ?? {};
  const contact = d.contactPerson ?? {};
  const ship = d.shippingRates ?? {};

  return {
    id: Number(d.id),
    code: str(d.code),
    name: str(d.name),
    description: str(d.description),
    // القائمة والتفاصيل تسمّيه `specialty`، وجسم الحفظ يسمّيه `factoryCategory`
    factoryCategory: str(d.specialty ?? d.factoryCategory),
    status: Number(d.status ?? 1),
    statusLabel: str(d.statusLabel),
    joinDate: str(d.joinDate),
    website: str(d.website),
    email: str(d.email),
    phoneNumber: str(d.phoneNumber),
    address: str(d.address),
    city: str(d.city),
    country: str(d.country),
    postalCode: str(d.postalCode),

    responsibleName: str(resp.name ?? d.responsibleName),
    responsiblePhone: str(resp.phone ?? d.responsiblePhone),
    responsibleEmail: str(resp.email ?? d.responsibleEmail),
    responsibleRole: str(resp.role ?? d.responsibleRole),

    contactPersonName: str(contact.name ?? d.contactPersonName),
    contactPersonPhoneNumber: str(contact.phone ?? d.contactPersonPhoneNumber),
    contactPersonEmail: str(contact.email ?? d.contactPersonEmail),
    contactPersonRole: str(contact.role ?? d.contactPersonRole),

    cairoGizaShipping: Number(ship.cairoGiza ?? d.cairoGizaShipping ?? 0),
    otherCitiesShipping: Number(ship.otherGovernorates ?? d.otherCitiesShipping ?? 0),

    bankName: str(bank.bankName),
    bankAccountHolderName: str(bank.accountHolderName),
    bankAccountNumber: str(bank.accountNumber),
    bankAccountType: str(bank.accountType),
    walletNumber: str(bank.walletNumber),
    walletProvider: str(bank.walletProvider),
    instapayNumber: str(bank.instapayNumber),

    documents: Array.isArray(d.documents) ? d.documents.map(normalizeDocument) : [],
  };
}

export async function fetchFactoryDetail(factoryId: number | string): Promise<FactoryDetail | null> {
  const { data } = await axiosRequest.get(`/factories/${factoryId}`);
  return normalizeFactoryDetail(data);
}

export function useFactoryDetailQuery(factoryId: number | null | undefined, enabled = true) {
  return useQuery({
    queryKey: factoryKeys.detail(factoryId ?? "none"),
    queryFn: () => fetchFactoryDetail(factoryId!),
    enabled: Boolean(factoryId) && enabled,
    staleTime: 30_000,
  });
}
