import { api } from "@/lib/api";
import type { User } from "@/lib/types";

export interface SignUpPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: User;
}

export async function signUp(payload: SignUpPayload) {
  const { data } = await api.post<{ message: string; id: string }>("/user/", payload);
  return data;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", payload);
  return data;
}

export async function logout() {
  const { data } = await api.post<{ message: string }>("/auth/logout");
  return data;
}

interface MeResponse {
  authenticated: boolean;
  user?: { userId: string; role: string };
}

// GET /auth/me only returns { userId, role } — merge with the profile
// stored in localStorage at login time for display fields.
export async function getMe(): Promise<User | null> {
  const { data } = await api.get<MeResponse>("/auth/me");
  if (!data.authenticated || !data.user) return null;

  let stored: User | null = null;
  try {
    const raw = window.localStorage.getItem("qurashi-user");
    if (raw) stored = JSON.parse(raw) as User;
  } catch {
    /* ignore */
  }

  return {
    id: data.user.userId,
    name: stored?.name ?? "",
    email: stored?.email ?? "",
    phone: stored?.phone,
    role: data.user.role,
  };
}

export function storeUser(user: User | null) {
  if (typeof window === "undefined") return;
  if (user) window.localStorage.setItem("qurashi-user", JSON.stringify(user));
  else window.localStorage.removeItem("qurashi-user");
}
