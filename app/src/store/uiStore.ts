import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme } from '@/types';

interface UIState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;

  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;

  activeSection: string;
  setActiveSection: (section: string) => void;

  activeModal: string | null;
  modalData: Record<string, unknown> | null;
  openModal: (modal: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;

  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;

  notificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;

  animationsEnabled: boolean;
  setAnimationsEnabled: (enabled: boolean) => void;

  onboardingComplete: boolean;
  setOnboardingComplete: (complete: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      sidebarOpen: true,
      mobileSidebarOpen: false,
      activeSection: 'dashboard',
      activeModal: null,
      modalData: null,
      globalLoading: false,
      notificationsOpen: false,
      searchQuery: '',
      searchOpen: false,
      animationsEnabled: true,
      onboardingComplete: false,

      setTheme: (theme) => {
        const normalizedTheme = theme === 'light' ? 'light' : 'dark';
        set({ theme: normalizedTheme });

        const root = document.documentElement;
        root.classList.remove('dark', 'light');
        root.classList.add(normalizedTheme);
      },

      toggleTheme: () => {
        const theme = get().theme;
        get().setTheme(theme === 'dark' ? 'light' : 'dark');
      },

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
      toggleMobileSidebar: () => set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),

      setActiveSection: (section) => set({ activeSection: section }),

      openModal: (modal, data) => set({ activeModal: modal, modalData: data ?? null }),
      closeModal: () => set({ activeModal: null, modalData: null }),

      setGlobalLoading: (loading) => set({ globalLoading: loading }),

      setNotificationsOpen: (open) => set({ notificationsOpen: open }),

      setSearchQuery: (query) => set({ searchQuery: query }),
      setSearchOpen: (open) => set({ searchOpen: open }),

      setAnimationsEnabled: (enabled) => set({ animationsEnabled: enabled }),

      setOnboardingComplete: (complete) => set({ onboardingComplete: complete }),
    }),
    {
      name: 'arcora-ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        animationsEnabled: state.animationsEnabled,
        onboardingComplete: state.onboardingComplete,
      }),
    },
  ),
);
