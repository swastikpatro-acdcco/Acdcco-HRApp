import { create } from "zustand";

export const useAuthStore = create((set) => ({
  isAuthenticated: false,
  token: null,
  email: null,

  login: (token, userEmail) =>
    set({
      isAuthenticated: true,
      token: token,
      email: userEmail,
    }),

  logout: () =>
    set({
      isAuthenticated: false,
      token: null,
      email: null,
    }),
}));

