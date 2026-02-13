import axios from "axios";
// import { useNavigate } from "react-router";
const ENV_API_URL = (import.meta.env.VITE_WHATSNEW_BACKEND_URL || "").replace(/\/$/, "");
// In dev, prefer same-origin and let Vite proxy `/api` to the backend.
const API_URL =
  ENV_API_URL ||
  (typeof window !== "undefined" ? window.location.origin : "");
// const navigate = useNavigate()

const apiClient = axios.create({
  baseURL: API_URL ? `${API_URL}/api` : "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // MANDATORY: So that cookies are sent automatically
});

// --- Refresh Token Logic ---
let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
  config: any;
}[] = [];

// Function to process the queue of failed requests
const processQueue = (
  error: any,
) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(apiClient(prom.config));
    }
  });
  failedQueue = [];
};

// --- REQUEST INTERCEPTOR (CLEANED) ---
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- RESPONSE INTERCEPTOR (Refresh Token Logic Adjusted) ---
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 491 &&
      originalRequest?.url !== "/auth/refresh-token"
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        })
          .then(() => {
            return apiClient(originalRequest!);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      try {
        // Call the refresh-token endpoint. The browser automatically sends the RT cookie.
        // The backend must respond with a new Set-Cookie AT header.
        await axios.post("/auth/refresh-token", null, {
          baseURL: apiClient.defaults.baseURL,
          withCredentials: true,
        });

        // Process the queue of failed requests
        processQueue(null); // Call without token

        isRefreshing = false;
        // Resend the request that caused the 401
        return apiClient(originalRequest!);
      } catch (refreshError) {
        // Refresh token failed
        processQueue(refreshError);
        isRefreshing = false;

        // Final: Force logout/redirect (RT/AT cookie has been revoked by the backend)
        // window.location.href = "/signin";
        // navigate('/signin')
        return Promise.reject(refreshError);
      }
    }

    // Don't auto-redirect on 401 - let the app handle unauthenticated state gracefully
    // The /api/auth/admin/user endpoint returns 401 when not logged in - this is expected
    // Redirecting here causes infinite loops on public pages

    return Promise.reject(error);
  }
);

export default apiClient;
