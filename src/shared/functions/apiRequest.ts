import type { AxiosRequestConfig } from "axios";
import axiosRequest from "shared/functions/axiosRequest";

/**
 * طلب API موحّد — يمر عبر `axiosRequest` (نفس الـ interceptors).
 * @deprecated تفضّل استدعاء `axiosRequest` مباشرةً مع مسار نسبي تحت `baseURL`.
 */
const apiRequest = async (
  url: string,
  method = "GET",
  params: Record<string, unknown> = {}
) => {
  if (typeof params !== "object" || params === null) {
    console.warn("API Request Warning: params should be an object. Received:", params);
    params = {};
  }

  const upper = method.toUpperCase();
  const config: AxiosRequestConfig = {
    method: upper,
    url,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (["GET", "DELETE"].includes(upper)) {
    config.params = params;
  } else {
    config.data = params;
  }

  const response = await axiosRequest(config);
  return response.data;
};

export default apiRequest;
