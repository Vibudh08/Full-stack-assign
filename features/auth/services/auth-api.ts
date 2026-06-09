import { apiClient } from "@/services/api-client";
import type { ApiSuccess, AuthData, User } from "@/types/api";
import type { z } from "zod";

import type { loginSchema, registerSchema } from "@/validations/auth";

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export async function login(input: LoginInput) {
  const { data } = await apiClient.post<ApiSuccess<AuthData>>(
    "/auth/login",
    input,
  );
  return data.data;
}

export async function register(input: RegisterInput) {
  const { data } = await apiClient.post<ApiSuccess<AuthData>>(
    "/auth/register",
    input,
  );
  return data.data;
}

export async function getCurrentUser() {
  const { data } = await apiClient.get<ApiSuccess<User>>("/auth/me");
  return data.data;
}

export async function logout() {
  await apiClient.post("/auth/logout");
}

export async function bootstrapSession() {
  const { data } =
    await apiClient.post<ApiSuccess<{ accessToken: string }>>("/auth/refresh");
  useAuthStore.getState().setSession(data.data.accessToken);
  return getCurrentUser();
}

import { useAuthStore } from "@/features/auth/store/auth-store";
