import { USER_TYPES } from "../../../config/constants";
import {
  ALL_USER_PERMISSION_KEYS,
  getPermissionTemplateForUserType,
  USER_ACCOUNT_STATUSES,
  USER_PERMISSION_GROUPS,
  USER_ROLE_LABELS,
} from "./user.permissions";

type PlainRecord = Record<string, unknown>;

const ONLINE_WINDOW_IN_MS = 15 * 60 * 1000;

export const toPlainRecord = (value: unknown): PlainRecord => {
  if (!value || typeof value !== "object") {
    return {};
  }

  const plainValue = value as { toJSON?: () => PlainRecord };
  if (typeof plainValue.toJSON === "function") {
    return plainValue.toJSON();
  }

  return value as PlainRecord;
};

export const toText = (value: unknown): string => {
  return typeof value === "string" ? value.trim() : "";
};

export const toNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

export const normalizeEmail = (email: string): string => String(email).toLowerCase().trim();

export const splitFullName = (value: string): { firstName: string; lastName: string } => {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
};

export const buildFullName = (firstName: unknown, lastName: unknown): string => {
  return [toText(firstName), toText(lastName)].filter(Boolean).join(" ").trim();
};

export const normalizeAccountStatus = (payload: Record<string, unknown>, currentValue?: string): string => {
  const requestedStatus = toText(payload.accountStatus || payload.status || currentValue);

  if (requestedStatus === "online") {
    return USER_ACCOUNT_STATUSES.ACTIVE;
  }

  if (requestedStatus === "offline") {
    return USER_ACCOUNT_STATUSES.INACTIVE;
  }

  if (Object.values(USER_ACCOUNT_STATUSES).includes(requestedStatus as never)) {
    return requestedStatus;
  }

  return currentValue && Object.values(USER_ACCOUNT_STATUSES).includes(currentValue as never)
    ? currentValue
    : USER_ACCOUNT_STATUSES.ACTIVE;
};

export const isValidAccountStatus = (value: unknown): boolean => {
  return typeof value === "string" && Object.values(USER_ACCOUNT_STATUSES).includes(value as never);
};

export const normalizePermissions = (
  permissionsValue: unknown,
  userType?: string,
  roleName?: string,
): Record<string, boolean> => {
  const seededPermissions = { ...getPermissionTemplateForUserType(userType, roleName) };
  const rawPermissions = permissionsValue && typeof permissionsValue === "object"
    ? permissionsValue as Record<string, unknown>
    : {};

  return ALL_USER_PERMISSION_KEYS.reduce<Record<string, boolean>>((permissions, permissionKey) => {
    if (permissionKey in rawPermissions) {
      permissions[permissionKey] = Boolean(rawPermissions[permissionKey]);
      return permissions;
    }

    permissions[permissionKey] = Boolean(seededPermissions[permissionKey]);
    return permissions;
  }, {});
};

export const buildPermissionSummary = (permissionsValue: unknown): {
  activeCount: number;
  groups: Array<{ activeCount: number; items: Array<{ enabled: boolean; key: string; label: string }>; key: string; label: string; totalCount: number }>;
  totalCount: number;
} => {
  const permissions = normalizePermissions(permissionsValue);
  const groups = USER_PERMISSION_GROUPS.map((group) => {
    const items = group.permissions.map((permission) => ({
      enabled: Boolean(permissions[permission.key]),
      key: permission.key,
      label: permission.label,
    }));

    return {
      activeCount: items.filter((item) => item.enabled).length,
      items,
      key: group.key,
      label: group.label,
      totalCount: items.length,
    };
  });

  return {
    activeCount: groups.reduce((total, group) => total + group.activeCount, 0),
    groups,
    totalCount: ALL_USER_PERMISSION_KEYS.length,
  };
};

export const getRoleLabel = (userValue: PlainRecord): string => {
  const roleName = toText(userValue.roleName);
  if (roleName) {
    return roleName;
  }

  const userType = toText(userValue.userType);
  return USER_ROLE_LABELS[userType as keyof typeof USER_ROLE_LABELS] ?? "مستخدم";
};

export const getPresenceStatus = (userValue: PlainRecord): { label: string; value: "offline" | "online" | "suspended" } => {
  const accountStatus = normalizeAccountStatus(userValue, toText(userValue.accountStatus));
  if (accountStatus === USER_ACCOUNT_STATUSES.SUSPENDED) {
    return { label: "موقوف", value: "suspended" };
  }

  const lastSeenAt = userValue.lastSeenAt ? new Date(String(userValue.lastSeenAt)) : null;
  const isOnline = lastSeenAt && !Number.isNaN(lastSeenAt.getTime()) && (Date.now() - lastSeenAt.getTime()) <= ONLINE_WINDOW_IN_MS;

  if (isOnline) {
    return { label: "متصل الآن", value: "online" };
  }

  return { label: "غير متصل", value: "offline" };
};

export const sanitizeUserPayload = (
  input: Record<string, unknown>,
  options: { current?: PlainRecord; isCreate?: boolean } = {},
): Record<string, unknown> => {
  const payload = { ...input };
  const current = options.current ?? {};

  const fullName = toText(payload.name || payload.fullName);
  if (fullName) {
    const names = splitFullName(fullName);
    payload.firstName = names.firstName;
    payload.lastName = names.lastName;
  }

  if (typeof payload.email === "string" && payload.email.trim()) {
    payload.email = normalizeEmail(payload.email);
  }

  const currentUserType = toText(current.userType) || USER_TYPES.OPERATION;
  const nextUserType = toText(payload.userType) || currentUserType;
  const roleName = toText(payload.roleName || payload.role || current.roleName) || (USER_ROLE_LABELS[nextUserType as keyof typeof USER_ROLE_LABELS] ?? "");
  payload.roleName = roleName;

  payload.accountStatus = normalizeAccountStatus(payload, toText(current.accountStatus));

  if ("salary" in payload) {
    payload.salary = toNumber(payload.salary);
  } else if (options.isCreate) {
    payload.salary = null;
  }

  payload.permissions = normalizePermissions(
    "permissions" in payload ? payload.permissions : current.permissions,
    nextUserType,
    roleName,
  );

  if (typeof payload.password === "string" && payload.password.trim()) {
    payload.lastPasswordChangeAt = new Date();
  } else {
    delete payload.password;
  }

  return payload;
};

export const mapUserSummary = (value: unknown): Record<string, unknown> => {
  const user = toPlainRecord(value);
  const permissionSummary = buildPermissionSummary(user.permissions);
  const presence = getPresenceStatus(user);
  const accountStatus = normalizeAccountStatus(user, toText(user.accountStatus));
  const accountStatusLabel = accountStatus === USER_ACCOUNT_STATUSES.SUSPENDED
    ? "موقوف"
    : accountStatus === USER_ACCOUNT_STATUSES.INACTIVE
      ? "غير نشط"
      : "نشط";

  return {
    accountStatus,
    accountStatusLabel,
    activePermissionsCount: permissionSummary.activeCount,
    createdAt: user.createdAt ?? null,
    email: toText(user.email),
    firstName: toText(user.firstName),
    fullName: buildFullName(user.firstName, user.lastName),
    id: Number(user.id ?? 0),
    isActive: accountStatus === USER_ACCOUNT_STATUSES.ACTIVE,
    lastName: toText(user.lastName),
    lastPasswordChangeAt: user.lastPasswordChangeAt ?? null,
    lastSeenAt: user.lastSeenAt ?? null,
    permissions: normalizePermissions(user.permissions, toText(user.userType), getRoleLabel(user)),
    roleName: getRoleLabel(user),
    status: presence.value,
    statusLabel: presence.label,
    userType: toText(user.userType),
    vendorId: toNumber(user.vendorId),
  };
};

export const mapUserDetail = (value: unknown): Record<string, unknown> => {
  const user = toPlainRecord(value);
  const summary = mapUserSummary(user);
  const permissionSummary = buildPermissionSummary(user.permissions);

  return {
    ...summary,
    bankAccountHolderName: toText(user.bankAccountHolderName),
    bankAccountNumber: toText(user.bankAccountNumber),
    bankAccountType: toText(user.bankAccountType),
    bankName: toText(user.bankName),
    jobTitle: toText(user.jobTitle),
    permissionsSummary: permissionSummary,
    phoneNumber: toText(user.phoneNumber),
    salary: toNumber(user.salary),
    walletNumber: toText(user.walletNumber),
    instaPayNumber: toText(user.instaPayNumber),
  };
};

export const buildUserActivityMessage = (logValue: unknown): string => {
  const log = toPlainRecord(logValue);
  const action = toText(log.action);
  const fromValue = toText(log.from);
  const toValue = toText(log.to);

  if (action === "create") {
    return "تم إنشاء المستخدم";
  }

  if (action === "login") {
    return "تم تسجيل الدخول";
  }

  if (action === "status") {
    return toValue ? `تم تحديث حالة الحساب إلى ${toValue}` : "تم تحديث حالة الحساب";
  }

  if (action === "delete") {
    return "تم حذف المستخدم";
  }

  if (action === "password") {
    return "تم تغيير كلمة المرور";
  }

  if (action === "update") {
    return fromValue && toValue
      ? `تم تعديل ${toText(log.field)} من ${fromValue} إلى ${toValue}`
      : `تم تعديل ${toText(log.field) || "بيانات المستخدم"}`;
  }

  return "تم تحديث المستخدم";
};
