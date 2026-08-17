import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { ApiError, APIResponse } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/airplane";

/**
 * Central Axios instance used by both client.ts and admin.ts.
 *
 * Request interceptor  → attaches JWT from localStorage.
 * Response interceptor → unwraps APIResponse<T>.result, maps errors to ApiError.
 */
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Read token from Zustand persisted store in localStorage
    try {
      const raw = localStorage.getItem("auth-storage");
      if (raw) {
        const parsed = JSON.parse(raw);
        const token = parsed?.state?.token;
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch {
      // SSR or storage unavailable — skip
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // The Spring Boot backend returns { code, message, result }.
    // We unwrap `.result` so consumers simply `await` the value.
    const data = response.data as APIResponse<unknown>;
    if (data && typeof data === "object" && "result" in data) {
      response.data = data.result;
    }
    return response;
  },
  (error: AxiosError) => {
    // Handle 401 → clear auth state (token expired)
    if (error.response?.status === 401) {
      try {
        const raw = localStorage.getItem("auth-storage");
        if (raw) {
          const parsed = JSON.parse(raw);
          parsed.state.token = null;
          parsed.state.isAuthenticated = false;
          parsed.state.user = null;
          parsed.state.isAdmin = false;
          localStorage.setItem("auth-storage", JSON.stringify(parsed));
        }
      } catch {
        // ignore
      }
      // Optionally redirect to /login
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login?expired=1";
      }
    }

    // Map backend error body → ApiError
    const body = error.response?.data as { code?: number; message?: string } | undefined;
    const apiError = new ApiError({
      code: body?.code ?? error.response?.status ?? 500,
      message: body?.message ?? error.message ?? "Network error",
    });
    return Promise.reject(apiError);
  }
);

export default axiosInstance;
