import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";
import { api } from "@/lib/api/client";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;

  /** Logs in via POST /auth/token, then fetches user profile to detect role. */
  login: (email: string, password: string) => Promise<{ ok: boolean; code?: number }>;

  /** Clears local state and calls backend logout. */
  logout: () => void;

  /** Fetches the current user profile from GET /users and updates store. */
  fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,

      login: async (email, password) => {
        try {
          const authResult = await api.auth.login({ email, password });

          if (!authResult || !authResult.authenticated) {
            return { ok: false, code: 1006 };
          }

          // Store token first so subsequent requests include it
          set({
            token: authResult.token,
            isAuthenticated: true,
            user: { email } as User,
            isAdmin: false,
          });

          // Fetch full profile to determine roles
          try {
            const profile = await api.users.getMyInfo();
            const hasAdmin = profile.roles?.some((r) => r.name === "ADMIN") ?? false;
            set({ user: profile, isAdmin: hasAdmin });
          } catch {
            // Profile fetch failure is non-fatal — user is still authenticated
          }

          return { ok: true };
        } catch (error: unknown) {
          console.error("Login Error:", error);
          const code =
            error && typeof error === "object" && "code" in error
              ? (error as { code: number }).code
              : 500;
          return { ok: false, code };
        }
      },

      logout: () => {
        const token = get().token;
        if (token) {
          api.auth.logout(token).catch(() => {
            // Silent fail — token may already be expired
          });
        }
        set({ user: null, token: null, isAuthenticated: false, isAdmin: false });
      },

      fetchProfile: async () => {
        try {
          const profile = await api.users.getMyInfo();
          const hasAdmin = profile.roles?.some((r) => r.name === "ADMIN") ?? false;
          set({ user: profile, isAdmin: hasAdmin });
        } catch {
          // If profile fetch fails (e.g. token expired), log out
          set({ user: null, token: null, isAuthenticated: false, isAdmin: false });
        }
      },
    }),
    {
      name: "auth-storage",
    }
  )
);