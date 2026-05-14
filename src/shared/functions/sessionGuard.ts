/** مسار تسجيل الدخول — يُفضّل معه `window.location` لإعادة تحميل نظيفة بعد انتهاء الجلسة */
export const SIGN_IN_PATH = "/authentication/sign-in";

export function clearAuthStorage(): void {
  try {
    localStorage.removeItem("user");
  } catch {
    /* ignore */
  }
}

function isAlreadyOnSignIn(): boolean {
  const path = window.location.pathname;
  return path === SIGN_IN_PATH || path.startsWith(`${SIGN_IN_PATH}/`);
}

/**
 * مسح الجلسة وإجبار فتح صفحة تسجيل الدخول.
 * يُستخدم عند 401 أو انتهاء الـ JWT عندما لا يكفي `<Navigate />` لأن التطبيق قد لا يُعاد رسمه فورًا.
 */
export function redirectToSignIn(): void {
  clearAuthStorage();
  if (isAlreadyOnSignIn()) return;
  window.location.replace(SIGN_IN_PATH);
}

export function isJwtExpired(token: string | undefined | null): boolean {
  if (!token || typeof token !== "string") return true;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return true;
    const payload = JSON.parse(atob(parts[1])) as { exp?: number };
    const exp = Number(payload.exp);
    if (!Number.isFinite(exp)) return true;
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}

export function getStoredUserParsed(): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const u = JSON.parse(raw) as unknown;
    return u && typeof u === "object" ? (u as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** هل يوجد في التخزين مستخدم وتوكن صالح (غير منتهٍ)؟ */
export function isStoredSessionValid(): boolean {
  const u = getStoredUserParsed();
  if (!u) return false;
  const token = u.token;
  return typeof token === "string" && token.length > 0 && !isJwtExpired(token);
}

export function responseBodyRequestsLogout(data: unknown): boolean {
  return Boolean(
    data &&
      typeof data === "object" &&
      "force_logout" in data &&
      (data as { force_logout?: boolean }).force_logout === true
  );
}
