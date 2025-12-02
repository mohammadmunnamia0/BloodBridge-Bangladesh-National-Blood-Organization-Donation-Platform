import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
    // Check for admin token first, then regular user token
    const adminToken = localStorage.getItem("adminToken");
    const userToken = localStorage.getItem("token");
    const token = adminToken || userToken;
    
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

    if (error.response.status === 401) {
      // Check if it's an admin session or regular user session
      const isAdmin = localStorage.getItem("isAdminLoggedIn") === "true";
      
      if (isAdmin) {
        // Clear admin data and redirect to admin login
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        localStorage.removeItem("isAdminLoggedIn");
        window.location.href = "/admin";
      } else {
        // Clear regular user data and redirect to user login
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
      
      return Promise.reject({
        message: "Session expired. Please login again.",
      });
    }

    return Promise.reject({
      message: error.response.data.message || "An error occurred",
      status: error.response.status,
    });
  }
);

export default axiosInstance;