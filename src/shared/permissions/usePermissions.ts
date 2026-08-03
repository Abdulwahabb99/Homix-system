/**
 * الـ hook الأساسي للصلاحيات — يُستخدم في كل مكان يحتاج إظهار/إخفاء عنصر حسب صلاحية.
 *
 *   const { can, canAdd, canEdit, canDelete, canView } = usePermissions();
 *   {canAdd("orders") && <AddOrderButton />}
 *   {can("finance_settle") && <SettleButton />}
 *
 * يقرأ خريطة صلاحيات المستخدم الحالي من Redux (`state.auth.user.permissions`)،
 * وهي متوفّرة من رد تسجيل الدخول. لا استثناء للأدمن (محكوم بخريطته مثل الجميع).
 */
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { hasPermission, hasAnyPermission, hasAllPermissions } from "./hasPermission";
import type { PermissionGroup, PermissionKey, PermissionMap } from "./permissionKeys";

export interface UsePermissions {
  /** خريطة الصلاحيات الخام للمستخدم الحالي */
  permissions: PermissionMap;
  /** فحص مفتاح صلاحية مباشرةً — `can("orders_create")` */
  can: (key: PermissionKey) => boolean;
  /** يملك أيّ واحدة من عدة صلاحيات */
  canAny: (keys: PermissionKey[]) => boolean;
  /** يملك كل الصلاحيات */
  canAll: (keys: PermissionKey[]) => boolean;
  /** اختصارات لكل مجموعة: `canView("orders")` → `can("orders_view")` */
  canView: (group: PermissionGroup) => boolean;
  canAdd: (group: PermissionGroup) => boolean;
  canEdit: (group: PermissionGroup) => boolean;
  canDelete: (group: PermissionGroup) => boolean;
  canExport: (group: PermissionGroup) => boolean;
}

export function usePermissions(): UsePermissions {
  const permissions = useSelector(
    (s: any) => s?.auth?.user?.permissions
  ) as PermissionMap | undefined;

  return useMemo<UsePermissions>(() => {
    const map = permissions ?? {};
    const can = (key: PermissionKey) => hasPermission(map, key);
    return {
      permissions: map,
      can,
      canAny: (keys) => hasAnyPermission(map, keys),
      canAll: (keys) => hasAllPermissions(map, keys),
      canView: (group) => can(`${group}_view`),
      canAdd: (group) => can(`${group}_create`),
      canEdit: (group) => can(`${group}_edit`),
      canDelete: (group) => can(`${group}_delete`),
      canExport: (group) => can(`${group}_export`),
    };
  }, [permissions]);
}
