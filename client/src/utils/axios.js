import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const axiosInstance = axios.create({
  baseURL,
  withCredentials: false,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    if (config.method === "get") {
      config.params = { ...config.params, _t: Date.now() };
    }
    
    // Determine which token to use based on the request path
    // Use admin token only for /admin routes
    const isAdminRoute = config.url?.includes("/admin");
    const adminToken = localStorage.getItem("adminToken");
    const userToken = localStorage.getItem("token");
    
    const token = isAdminRoute ? (adminToken || userToken) : (userToken || adminToken);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject({
        message:
          "Unable to connect to the server. Please check your internet connection.",
      });
    }

    // For 401 errors, just pass them through without auto-logout
    // Let individual pages handle authentication as needed
    if (error.response.status === 401) {
      return Promise.reject({
        message: error.response.data?.message || "Authentication required. Please login.",
        status: 401,
        isAuthError: true,
      });
    }

    return Promise.reject({
      message: error.response.data?.message || "An error occurred",
      status: error.response.status,
    });
  }
);

export default axiosInstance;