/**
 * أنواع صفحة الموردين. النموذج الحقيقي من `GET /vendors`:
 * (id, name, active, daysToDeliver, user.email). نسمح بحقول إضافية مستقبلية.
 */
export interface Vendor {
  id: number | string;
  name?: string;
  active?: boolean;
  /** مدة الشحن بالأيام */
  daysToDeliver?: number | string;
  /** قد لا يوفّره الـ API — يُعرض فقط إن وُجد */
  phone?: string;
  user?: { email?: string } | null;
  /** الاكونت مانجر — المعرّف (من قائمة المستخدمين) واسمه للعرض */
  accountManager?: number | string | null;
  accountManagerLabel?: string | null;
  [key: string]: unknown;
}

/** فلتر الحالة */
export type VendorStatusFilter = "all" | "active" | "inactive";
