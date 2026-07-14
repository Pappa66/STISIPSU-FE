import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  sessionStartedAt: number | null;
  isAuthCheckComplete: boolean;
  menuVersion: number;
  login: (token: string) => void;
  logout: () => void;
  refreshMenus: () => void;
  setAuthCheckComplete: () => void;
}

// Buat storage dummy untuk sisi server agar tidak error
const dummyStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      sessionStartedAt: null,
      isAuthCheckComplete: false,
      menuVersion: 0,
      
      login: (token: string) => {
        set({ token, sessionStartedAt: Date.now() });
      },
      
      logout: () => {
        set({ token: null, sessionStartedAt: null });
        // Hard redirect untuk memastikan semua state di-reset total
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
      },
      
      refreshMenus: () => {
        set((state) => ({ menuVersion: state.menuVersion + 1 }));
      },

      setAuthCheckComplete: () => {
        set({ isAuthCheckComplete: true });
      },
    }),
    {
      name: 'auth-storage',
      // Gunakan createJSONStorage untuk handle server-side rendering dengan aman
      storage: createJSONStorage(() => 
        // Hanya gunakan localStorage jika berada di browser
        typeof window !== 'undefined' ? window.localStorage : dummyStorage
      ),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setAuthCheckComplete();
        }
      },
    }
  )
);

// Panggil sekali saat aplikasi dimuat untuk menangani kasus jika tidak ada state tersimpan
if (typeof window !== 'undefined') {
    useAuthStore.getState().setAuthCheckComplete();
}