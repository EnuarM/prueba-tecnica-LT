import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/modules/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      // ─── Colors ─────────────────────────────────────────────
      // Naming follows Material Design 3 token structure.
      // "on-X" tokens live as top-level keys so Tailwind generates
      // classes like `text-on-primary`, `bg-on-tertiary-container`, etc.
      colors: {
        // ── Surface ──────────────────────────────────────────
        surface: {
          DEFAULT:             '#f7f9fb',
          dim:                 '#d8dadc',
          bright:              '#f7f9fb',
          'container-lowest':  '#ffffff',
          'container-low':     '#f2f4f6',
          container:           '#eceef0',
          'container-high':    '#e6e8ea',
          'container-highest': '#e0e3e5',
          variant:             '#e0e3e5',
          tint:                '#49607e',
        },
        'on-surface': {
          DEFAULT: '#191c1e',
          variant: '#43474d',
        },
        'inverse-surface':    '#2d3133',
        'inverse-on-surface': '#eff1f3',
        outline: {
          DEFAULT: '#74777e',
          variant: '#c4c6ce',
        },

        // ── Primary ───────────────────────────────────────────
        primary: {
          DEFAULT:   '#000f22',
          container: '#0a2540',
          fixed:     '#d2e4ff',
          'fixed-dim': '#b0c8eb',
        },
        'on-primary': {
          DEFAULT:          '#ffffff',
          container:        '#768dad',
          fixed:            '#001c37',
          'fixed-variant':  '#314865',
        },
        'inverse-primary': '#b0c8eb',

        // ── Secondary ─────────────────────────────────────────
        secondary: {
          DEFAULT:   '#0453cd',
          container: '#356ee7',
          fixed:     '#dae2ff',
          'fixed-dim': '#b2c5ff',
        },
        'on-secondary': {
          DEFAULT:         '#ffffff',
          container:       '#fefcff',
          fixed:           '#001848',
          'fixed-variant': '#0040a2',
        },

        // ── Tertiary ──────────────────────────────────────────
        tertiary: {
          DEFAULT:   '#001209',
          container: '#002a1b',
          fixed:     '#85f8c4',
          'fixed-dim': '#68dba9',
        },
        'on-tertiary': {
          DEFAULT:         '#ffffff',
          container:       '#1a9e70',
          fixed:           '#002114',
          'fixed-variant': '#005137',
        },

        // ── Error ─────────────────────────────────────────────
        error: {
          DEFAULT:   '#ba1a1a',
          container: '#ffdad6',
        },
        'on-error': {
          DEFAULT:   '#ffffff',
          container: '#93000a',
        },

        // ── Background ────────────────────────────────────────
        background: '#f7f9fb',
        'on-background': '#191c1e',

        // ── Semantic aliases ──────────────────────────────────
        success: '#059669',
        warning: '#d97706',
      },

      // ─── Typography ──────────────────────────────────────────
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display-lg':         ['3rem',     { lineHeight: '3.5rem',  letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-lg':        ['2rem',     { lineHeight: '2.5rem',  letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-lg-mobile': ['1.5rem',   { lineHeight: '2rem',    letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-md':        ['1.5rem',   { lineHeight: '2rem',    fontWeight: '600' }],
        'body-lg':            ['1.125rem', { lineHeight: '1.75rem', fontWeight: '400' }],
        'body-md':            ['1rem',     { lineHeight: '1.5rem',  fontWeight: '400' }],
        'body-sm':            ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
        'label-md':           ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.05em', fontWeight: '600' }],
        'label-sm':           ['0.75rem',  { lineHeight: '1rem',    fontWeight: '500' }],
        'code-md':            ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
      },

      // ─── Border Radius ───────────────────────────────────────
      borderRadius: {
        sm:      '0.125rem', // 2px  – checkboxes
        DEFAULT: '0.25rem',  // 4px  – buttons, inputs
        md:      '0.375rem', // 6px
        lg:      '0.5rem',   // 8px  – cards, modals
        xl:      '0.75rem',  // 12px
        '2xl':   '1rem',     // 16px – large cards
        full:    '9999px',   // pills / badges
      },

      // ─── Box Shadows ─────────────────────────────────────────
      boxShadow: {
        institutional:
          '0px 4px 6px -1px rgba(10, 37, 64, 0.05), 0px 2px 4px -1px rgba(10, 37, 64, 0.03)',
      },

      // ─── Max Width ───────────────────────────────────────────
      maxWidth: {
        container: '80rem', // 1280px
      },

      // ─── Spacing extras ──────────────────────────────────────
      spacing: {
        gutter:           '1.5rem', // 24px – column gutter
        'margin-desktop': '2.5rem', // 40px
        'margin-mobile':  '1rem',   // 16px
      },
    },
  },
  plugins: [],
};

export default config;
