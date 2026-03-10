import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

type Theme = 'dark' | 'light';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  devtools(
    persist(
      (set, get) => ({
        theme: 'dark',

        setTheme: (theme) => {
          set({ theme }, false, 'theme/set');
          document.documentElement.setAttribute('data-theme', theme);
        },

        toggleTheme: () => {
          const next: Theme = get().theme === 'dark' ? 'light' : 'dark';
          get().setTheme(next);
        },
      }),
      { name: 'advisor-theme' }
    ),
    { name: 'ThemeStore' }
  )
);
