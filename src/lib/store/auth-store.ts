import { create } from "zustand";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<{ ok: boolean; code?: number }>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isAdmin: false,

  login: async (username, password) => {
    try {
      // Connects to the /auth/token endpoint defined in AuthenticationController.java
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Ensure keys match your AuthenticationRequest DTO fields
        body: JSON.stringify({ username, password }), 
      });

      if (!response.ok) return { ok: false, code: response.status === 401 ? 1006 : 500 };

      // Backend wraps the payload in APIResponse.result
      const data = await response.json();
      const authResult = data.result; 

      if (!authResult || !authResult.authenticated) {
        return { ok: false, code: 1006 };
      }

      set({
        // Extract token and user details from the AuthenticationResponse
        token: authResult.token,
        isAuthenticated: true,
        // Depending on your API, you may need a separate GET /users/my-info call here
        // to populate the User object fully if it's not included in the token response.
        user: { email: username } as User, 
        isAdmin: false, // Update logic based on how roles are returned in your JWT
      });
      
      return { ok: true };
    } catch (error) {
      console.error("Login Error:", error);
      return { ok: false, code: 500 };
    }
  },

  logout: () => {
    // Optionally trigger POST /auth/logout here
    set({ user: null, token: null, isAuthenticated: false, isAdmin: false });
  },
}));