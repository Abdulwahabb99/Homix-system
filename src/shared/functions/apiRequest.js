import axios from "axios";

/**
 * Universal API request function
 * @param {string} url - The API endpoint URL
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {object} [params={}] - Optional parameters (query/body)
 * @param {function} [navigate] - React Router navigate function (optional)
 * @returns {Promise} - API response or error
 */
const apiRequest = async (url, method = "GET", params = {}, navigate) => {
  try {
    if (typeof params !== "object") {
      console.warn("API Request Warning: params should be an object. Received:", params);
      params = {}; // Ensure params is always an object
    }

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const config = {
      method: method.toUpperCase(),
      url,
      headers: {
        "Content-Type": "application/json",
        Authorization: user?.token ? `Bearer ${user.token}` : "",
      },
    };

    if (["GET", "DELETE"].includes(config.method)) {
      config.params = params; // Query Params
    } else {
      config.data = params; // Request Body
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error("API Request Error:", error.response?.data || error.message);

    if (error.response?.status === 401 && typeof navigate === "function") {
      console.log("Force logout detected");
      localStorage.removeItem("user");

      navigate();
    }

    throw error.response?.data || error.message;
  }
};

export default apiRequest;
