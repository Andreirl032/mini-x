import { create } from "zustand";
import { loginRequest, logoutRequest } from "@/api/auth.api";
import {
  getAccessToken,
  setAccessToken,
  setUnauthorizedHandler,
  tryRestoreSession,
} from "@/api/client";
import { fetchUser } from "@/api/users.api";
import { decodeAccessToken } from "@/lib/utils";
import type { AuthUser } from "@/types/api";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  bootstrap: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
  refreshProfile: () => Promise<void>;
}

async function loadProfileFromToken(token: string): Promise<AuthUser> {
  const payload = decodeAccessToken(token);
  if (!payload?.user_id) {
    throw new Error("Token inválido.");
  }

  const { user } = await fetchUser(payload.user_id);
  return {
    id: payload.user_id,
    username: user.username,
    name: user.name,
    bio: user.bio,
    profile_picture: user.profile_picture,
    city: user.city,
    country_code: user.country_code,
  };
}

export const useAuthStore = create<AuthState>((set, get) => {
  setUnauthorizedHandler(() => {
    setAccessToken(null);
    set({ user: null, isAuthenticated: false });
  });

  return {
    user: null,
    isAuthenticated: false,
    isBootstrapping: true,

    setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),

    bootstrap: async () => {
      set({ isBootstrapping: true });
      try {
        const existing = getAccessToken();
        const token = existing ?? (await tryRestoreSession());
        if (!token) {
          set({ user: null, isAuthenticated: false, isBootstrapping: false });
          return;
        }

        const user = await loadProfileFromToken(token);
        set({ user, isAuthenticated: true, isBootstrapping: false });
      } catch {
        setAccessToken(null);
        set({ user: null, isAuthenticated: false, isBootstrapping: false });
      }
    },

    login: async (username, password) => {
      const token = await loginRequest(username, password);
      setAccessToken(token);
      const user = await loadProfileFromToken(token);
      set({ user, isAuthenticated: true });
    },

    logout: async () => {
      try {
        await logoutRequest();
      } finally {
        setAccessToken(null);
        set({ user: null, isAuthenticated: false });
      }
    },

    refreshProfile: async () => {
      const current = get().user;
      const token = getAccessToken();
      if (!current || !token) return;
      const user = await loadProfileFromToken(token);
      set({ user, isAuthenticated: true });
    },
  };
});
