import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,       
      user: null,        
      role: null,        

      // helpers
      isAuthed: () => Boolean(get().token),
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      setRole: (role) => set({ role }),
      logout: () => set({ token: null, user: null, role: null }),
    }),
    {
      name: 'auth', 
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token, role: state.role, user: state.user }),
    }
  )
);

if (typeof window !== 'undefined') {
  window.__setToken = (t) => useAuthStore.getState().setToken(t);
  window.__logout = () => useAuthStore.getState().logout();
}
