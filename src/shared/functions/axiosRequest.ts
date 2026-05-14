/**
 * عميل HTTP الوحيد للتطبيق (Authorization + 401 / force_logout موحّدان).
 * استخدم `axiosRequest` في كل الطلبات بدل `axios` الافتراضي.
 */
import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import {
  redirectToSignIn,
  responseBodyRequestsLogout,
} from "shared/functions/sessionGuard";

const axiosRequest = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

/** لا نمسح الجلسة على 401 من صفحة تسجيل الدخول (بيانات الدخول خاطئة) */
function shouldSkipGlobalUnauthorizedHandling(
  config: InternalAxiosRequestConfig | undefined
): boolean {
  const url = `${config?.baseURL ?? ""}${config?.url ?? ""}`;
  return /\/users\/login/i.test(url);
}

axiosRequest.interceptors.request.use(
  (config) => {
    try {
      const raw = localStorage.getItem("user");
      const user = raw ? JSON.parse(raw) : null;
      if (user?.token) {
        config.headers["Authorization"] = `Bearer ${user.token}`;
      } else {
        delete config.headers["Authorization"];
      }
    } catch {
      delete config.headers["Authorization"];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosRequest.interceptors.response.use(
  (response: AxiosResponse) => {
    if (responseBodyRequestsLogout(response.data)) {
      redirectToSignIn();
      return Promise.reject(new Error("FORCE_LOGOUT"));
    }
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status;
    const data = error.response?.data;

    /** رفض بيانات الدخول يعيد 401 بدون مسح جلسة قديمة اختياريًا */
    if (status === 401 && !shouldSkipGlobalUnauthorizedHandling(error.config)) {
      redirectToSignIn();
      return Promise.reject(error);
    }
    if (responseBodyRequestsLogout(data)) {
      redirectToSignIn();
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default axiosRequest;
