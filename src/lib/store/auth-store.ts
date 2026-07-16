import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; code?: number }>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,

      login: async (email, password) => {
        try {
          console.log("API_BASE_URL:", API_BASE_URL);
          console.log("Request URL:", `${API_BASE_URL}/auth/token`);
          
          const response = await fetch(`${API_BASE_URL}/auth/token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) return { ok: false, code: response.status === 401 ? 1006 : 500 };

          const data = await response.json();
          const authResult = data.result;

          if (!authResult || !authResult.authenticated) {
            return { ok: false, code: 1006 };
          }

          set({
            token: authResult.token,
            isAuthenticated: true,
            user: { email: email } as User,
            isAdmin: false, 
          });

          return { ok: true };
        } catch (error) {
          console.error("Login Error:", error);
          return { ok: false, code: 500 };
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, isAdmin: false });
      },
    }),
    {
      name: "auth-storage", // This is the key used in localStorage
    }
  )
);