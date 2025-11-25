import { create } from "zustand";
import { persist } from "zustand/middleware";
import client from "../api/client";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,

      // LOGIN — Save Tokens in Store
      login: ({ access, refresh }) =>
        set({
          isAuthenticated: true,
          accessToken: access,
          refreshToken: refresh,
        }),

      // LOGOUT — Blacklist Refresh Token
      logout: async () => {
        const refresh = get().refreshToken;

        try {
          if (refresh) {
            await client.post("/token/blacklist/", { refresh });
          }
        } catch (err) {
          console.error("Blacklist failed:", err);
        }

        set({
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
        });
      },

      // REFRESH TOKEN HANDLER
      refreshAccessToken: async () => {
        const refresh = get().refreshToken;

        if (!refresh) return null;

        try {
          const res = await client.post("/token/refresh/", { refresh });
          const newAccess = res.data.access;

          set({ accessToken: newAccess, isAuthenticated: true });
          return newAccess;
        } catch (err) {
          console.error("Token refresh failed:", err);
          get().logout();
          return null;
        }
      },
    }),

    { name: "auth-storage" }
  )
);
