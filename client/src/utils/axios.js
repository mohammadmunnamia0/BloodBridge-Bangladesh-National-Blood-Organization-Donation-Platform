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

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  isRefreshing = false;
  failedQueue = [];
};

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
    const originalRequest = error.config;

    if (!error.response) {
      return Promise.reject({
        message:
          "Unable to connect to the server. Please check your internet connection.",
      });
    }

    // Handle 401 errors with token refresh
    if (
      error.response.status === 401 &&
      error.response.data?.code === "TOKEN_EXPIRED" &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        // No refresh token available, clear storage and redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminRefreshToken");
        localStorage.removeItem("adminUser");
        window.location.href = "/login";
        return Promise.reject({
          message: "Session expired. Please login again.",
          status: 401,
          isAuthError: true,
        });
      }

      return axiosInstance
        .post("/auth/refresh", { refreshToken })
        .then((response) => {
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem("token", accessToken);
          localStorage.setItem("refreshToken", newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          processQueue(null, accessToken);
          return axiosInstance(originalRequest);
        })
        .catch((err) => {
          // Refresh failed, clear storage and redirect to login
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminRefreshToken");
          localStorage.removeItem("adminUser");
          processQueue(err, null);
          window.location.href = "/login";
          return Promise.reject({
            message: "Session expired. Please login again.",
            status: 401,
            isAuthError: true,
          });
        });
    }

    // For other 401 errors
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