import type { NavigateFunction } from "react-router-dom";

/** مسار تسجيل الدخول */
export const SIGN_IN_PATH = "/authentication/sign-in";

/** يُطلَق بعد تغيير `localStorage.user` (نفس التاب أو عبر `clearAuthStorage`) لمزامنة React */
export const AUTH_STORAGE_CHANGED = "homix-auth-changed";

export function clearAuthStorage(): void {
  try {
    localStorage.removeItem("user");
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(AUTH_STORAGE_CHANGED));
}

/** مسح الجلسة + حدث المزامنة + توجيه SPA + إيقاف التنفيذ (لاستجابات `force_logout` من الـ API) */
export function forceLogoutAndNavigate(navigate: NavigateFunction): never {
  clearAuthStorage();
  navigate(SIGN_IN_PATH);
  throw new Error("FORCE_LOGOUT");
}

/** قراءة خام لمفتاح `user` من التخزين */
export function getUserStorageSnapshot(): string | null {
  try {
    return localStorage.getItem("user");
  } catch {
    return null;
  }
}

export function subscribeAuthStorage(onStoreChange: () => void): () => void {
  const run = () => onStoreChange();
  window.addEventListener(AUTH_STORAGE_CHANGED, run);
  window.addEventListener("storage", run);
  const onVis = () => onStoreChange();
  document.addEventListener("visibilitychange", onVis);
  window.addEventListener("focus", onVis);
  return () => {
    window.removeEventListener(AUTH_STORAGE_CHANGED, run);
    window.removeEventListener("storage", run);
    document.removeEventListener("visibilitychange", onVis);
    window.removeEventListener("focus", onVis);
  };
}

/**
 * مسح الجلسة؛ التوجيه لتسجيل الدخول يتم عبر مسارات App عند `!sessionOk`
 * (مع `Navigate`) حتى لا تعلق على صفحة 404.
 */
export function redirectToSignIn(): void {
  clearAuthStorage();
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
