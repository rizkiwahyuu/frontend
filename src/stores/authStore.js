import { create } from 'zustand';
import { apiRequest, getUser } from '../services/api';

const SESSION_KEY = 'sigap_tif_session_user_id';

export const useAuthStore = create((set) => ({
  user: null,

  restoreSession: () => {
    if (typeof window === 'undefined') return;
    const id = window.localStorage.getItem(SESSION_KEY);
    const user = id ? getUser(id) : null;
    set({ user: user?.is_active ? user : null });
  },

  login: async (email, password) => {
    try {
      const result = await apiRequest('login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      window.localStorage.setItem(SESSION_KEY, String(result.user.id));
      set({ user: result.user });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Email atau password salah.' };
    }
  },

  logout: () => {
    window.localStorage.removeItem(SESSION_KEY);
    set({ user: null });
  },

  setUser: (user) => set({ user }),

  isAdmin: () => {
    const state = useAuthStore.getState();
    return state.user?.role === 'admin';
  },
}));
