import { create } from "zustand";
import { User } from "@/types";
import { MOCK_USERS } from "@/lib/mock/users";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; code?: number }>;
  logout: () => void;
  hydrateDemoCustomer: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isAdmin: false,

  login: async (email: string, password: string) => {
    // Simulated /airplane/auth/token exchange against mock directory.
    await new Promise((r) => setTimeout(r, 450));
    const user = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) return { ok: false, code: 1006 };
    if (!user.isActive) return { ok: false, code: 1010 };
    if (password.length < 4) return { ok: false, code: 1007 };

    set({
      user,
      token: `mock-jwt-${user.id}`,
      isAuthenticated: true,
      isAdmin: user.roles.some((r) => r.name === "ADMIN"),
    });
    return { ok: true };
  },

  logout: () => {
    set({ user: null, token: null, isAuthenticated: false, isAdmin: false });
  },

  hydrateDemoCustomer: () => {
    if (get().isAuthenticated) return;
    const demo = MOCK_USERS.find((u) => u.email === "linh.tran@example.com")!;
    set({
      user: demo,
      token: `mock-jwt-${demo.id}`,
      isAuthenticated: true,
      isAdmin: false,
    });
  },
}));