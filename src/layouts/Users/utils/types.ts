/**
 * أنواع صفحة المستخدمين. النموذج الحقيقي من `GET /users` يقتصر على
 * (id, firstName, lastName, email, userType)؛ نسمح بحقول إضافية مستقبلية.
 */
export interface AppUser {
  id: number | string;
  firstName?: string;
  lastName?: string;
  email?: string;
  /** الدور: "1" مدير · "2" مورد · "3" عمليات · "4" لوجستي */
  userType?: string | number;
  [key: string]: unknown;
}

/** فلتر الدور في شريط التبويبات: "all" أو قيمة userType */
export type RoleFilter = string;

/** حمولة النموذج (إضافة/تعديل) — تطابق ما يقبله الـ API فقط */
export interface UserFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  userType: string;
}
