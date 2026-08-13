import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import type { ApiErrorBody, ApiSuccess } from "@/types/api";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = api
      .post<ApiSuccess<{ accessToken: string }>>("/refreshToken")
      .then((response) => {
        const token = response.data.data.accessToken;
        setAccessToken(token);
        return token;
      })
      .catch(() => {
        setAccessToken(null);
        onUnauthorized?.();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    const status = error.response?.status;
    const url = original?.url ?? "";

    const isAuthEndpoint =
      url.includes("/login") ||
      url.includes("/refreshToken") ||
      url.includes("/logout");

    // Only 401 means "try refresh". 403 is a real permission denial.
    if (original && !original._retry && !isAuthEndpoint && status === 401) {
      original._retry = true;
      const token = await refreshAccessToken();
      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      }
    }

    return Promise.reject(error);
  },
);

export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong.",
): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const body = error.response?.data;
    if (body?.error?.details?.length) {
      return body.error.details.join(" ");
    }
    if (body?.error?.message) {
      return body.error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export async function tryRestoreSession(): Promise<string | null> {
  return refreshAccessToken();
}
