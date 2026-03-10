import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ─── Colors (all driven by CSS variables in globals.css) ───────────────
      colors: {
        primary: {
          DEFAULT: 'hsl(var(--color-primary) / <alpha-value>)',
          foreground: 'hsl(var(--color-primary-foreground) / <alpha-value>)',
          50: 'hsl(var(--color-primary-50) / <alpha-value>)',
          100: 'hsl(var(--color-primary-100) / <alpha-value>)',
          500: 'hsl(var(--color-primary) / <alpha-value>)',
          700: 'hsl(var(--color-primary-700) / <alpha-value>)',
          900: 'hsl(var(--color-primary-900) / <alpha-value>)',
        },
        background: {
          DEFAULT: 'hsl(var(--color-background) / <alpha-value>)',
          secondary: 'hsl(var(--color-background-secondary) / <alpha-value>)',
          tertiary: 'hsl(var(--color-background-tertiary) / <alpha-value>)',
        },
        text: {
          primary: 'hsl(var(--color-text-primary) / <alpha-value>)',
          secondary: 'hsl(var(--color-text-secondary) / <alpha-value>)',
          tertiary: 'hsl(var(--color-text-tertiary) / <alpha-value>)',
        },
        accent: {
          blue: 'hsl(var(--color-accent-blue) / <alpha-value>)',
          pink: 'hsl(var(--color-accent-pink) / <alpha-value>)',
          gold: 'hsl(var(--color-accent-gold) / <alpha-value>)',
          red: 'hsl(var(--color-accent-red) / <alpha-value>)',
        },
        success: 'hsl(var(--color-success) / <alpha-value>)',
        warning: 'hsl(var(--color-warning) / <alpha-value>)',
        error: 'hsl(var(--color-error) / <alpha-value>)',
        info: 'hsl(var(--color-info) / <alpha-value>)',
        border: 'hsl(var(--color-border) / <alpha-value>)',
        muted: {
          DEFAULT: 'hsl(var(--color-muted) / <alpha-value>)',
          foreground: 'hsl(var(--color-muted-foreground) / <alpha-value>)',
        },
        card: {
          DEFAULT: 'hsl(var(--color-card) / <alpha-value>)',
          foreground: 'hsl(var(--color-card-foreground) / <alpha-value>)',
        },
        // ── shadcn/ui semantic aliases ──
        foreground: 'hsl(var(--color-text-primary) / <alpha-value>)',
        input: 'hsl(var(--color-border) / <alpha-value>)',
        ring: 'hsl(var(--color-primary) / <alpha-value>)',
      },

      // ─── Border Radius (CSS variable-driven) ───────────────────────────────
      borderRadius: {
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius-md)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },

      // ─── Shadows ───────────────────────────────────────────────────────────
      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-md)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        glow: '0 0 20px hsl(var(--color-primary) / 0.3)',
      },

      // ─── Z-Index Scale ─────────────────────────────────────────────────────
      zIndex: {
        dropdown: '1000',
        sticky: '1100',
        modal: '1300',
        popover: '1400',
        tooltip: '1500',
        notification: '1600',
        loader: '9999',
      },

      // ─── Font Family ───────────────────────────────────────────────────────
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'Fira Code', 'monospace'],
      },

      // ─── Custom Keyframe Animations ────────────────────────────────────────
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        'live-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        'score-pop': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'live-pulse': 'live-pulse 1.5s ease-in-out infinite',
        'score-pop': 'score-pop 0.3s ease-out',
      },

      // ─── Transitions ───────────────────────────────────────────────────────
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
