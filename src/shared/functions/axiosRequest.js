import axios from "axios";

const axiosRequest = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Add the token interceptor
axiosRequest.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.token) {
      config.headers["Authorization"] = `Bearer ${user.token}`;
    } else {
      delete config.headers["Authorization"];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosRequest;
