"use client";

import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

import { useAuthStore } from "@/features/auth/store/auth-store";
import type { ApiSuccess } from "@/types/api";

type RefreshData = {
  accessToken: string;
  accessTokenExpiresIn: number;
};

type RetryRequest = InternalAxiosRequestConfig & { _retry?: boolean };

export const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken() {
  refreshPromise ??= axios
    .post<ApiSuccess<RefreshData>>("/api/auth/refresh", undefined, {
      withCredentials: true,
    })
    .then(({ data }) => {
      useAuthStore.getState().setSession(data.data.accessToken);
      return data.data.accessToken;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as RetryRequest | undefined;
    const isAuthRoute = request?.url?.startsWith("/auth/");

    if (
      error.response?.status === 401 &&
      request &&
      !request._retry &&
      !isAuthRoute
    ) {
      request._retry = true;
      try {
        request.headers.Authorization = `Bearer ${await refreshAccessToken()}`;
        return apiClient(request);
      } catch {
        useAuthStore.getState().clearSession();
      }
    }

    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.error?.message ??
      "Unable to complete the request. Please try again."
    );
  }
  return "Something went wrong. Please try again.";
}
