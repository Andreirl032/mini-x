import { api } from "@/api/client";
import type { ApiSuccess } from "@/types/api";

export async function loginRequest(username: string, password: string) {
  const { data } = await api.post<ApiSuccess<{ accessToken: string }>>("/login", {
    username,
    password,
  });
  return data.data.accessToken;
}

export async function logoutRequest() {
  await api.post<ApiSuccess<null>>("/logout");
}

export async function refreshRequest() {
  const { data } = await api.post<ApiSuccess<{ accessToken: string }>>("/refreshToken");
  return data.data.accessToken;
}
