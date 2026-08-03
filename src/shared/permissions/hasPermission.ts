/**
 * فحص صلاحية نقي (بدون React) — يُستخدم داخل المكوّنات وخارجها (route guards، utilities).
 * لا يوجد استثناء للأدمن: كل مستخدم محكوم بخريطة صلاحياته (الأدمن يملك كل المفاتيح مفعّلة).
 */
import type { PermissionKey, PermissionMap } from "./permissionKeys";

/** هل يملك المستخدم هذه الصلاحية؟ مفتاح غير موجود أو خريطة فارغة → false */
export function hasPermission(
  permissions: PermissionMap | null | undefined,
  key: PermissionKey
): boolean {
  if (!permissions || !key) return false;
  return permissions[key] === true;
}

/** يملك أيّ واحدة من عدة صلاحيات */
export function hasAnyPermission(
  permissions: PermissionMap | null | undefined,
  keys: PermissionKey[]
): boolean {
  return keys.some((k) => hasPermission(permissions, k));
}

/** يملك كل الصلاحيات المطلوبة */
export function hasAllPermissions(
  permissions: PermissionMap | null | undefined,
  keys: PermissionKey[]
): boolean {
  return keys.every((k) => hasPermission(permissions, k));
}
