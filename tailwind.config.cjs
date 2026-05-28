/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Base design tokens (CSS variable references) ──────────────────────
        'c-bg':       'var(--bg)',
        'c-surface':  'var(--surface)',
        'c-surface2': 'var(--surface2)',
        'c-primary':  'var(--primary)',
        'c-secondary':'var(--secondary)',
        'c-success':  'var(--success)',
        'c-warning':  'var(--warning)',
        'c-border':   'var(--border)',
        'c-text1':    'var(--text-primary)',
        'c-text2':    'var(--text-secondary)',
        'c-text3':    'var(--text-tertiary)',

        // ── Category colors ───────────────────────────────────────────────────
        'cat-health':   'var(--c-health)',
        'cat-career':   'var(--c-career)',
        'cat-finance':  'var(--c-finance)',
        'cat-learning': 'var(--c-learning)',
        'cat-wellness': 'var(--c-wellness)',

        // ── Hardcoded accent colors ───────────────────────────────────────────
        'danger':       '#FF6B7A',
        'surface-deep': '#20203a',   // gradient endpoint in hero cards

        // ── Opacity/muted variants (color-mix) ───────────────────────────────
        // Primary
        'primary-subtle':  'color-mix(in srgb, var(--primary)  6%, transparent)',
        'primary-muted':   'color-mix(in srgb, var(--primary) 14%, transparent)',
        'primary-soft':    'color-mix(in srgb, var(--primary) 15%, transparent)',
        'primary-medium':  'color-mix(in srgb, var(--primary) 22%, transparent)',
        'primary-glow':    'color-mix(in srgb, var(--primary) 28%, transparent)',
        'primary-active':  'color-mix(in srgb, var(--primary) 35%, transparent)',
        // Success
        'success-muted':   'color-mix(in srgb, var(--success) 14%, transparent)',
        'success-glow':    'color-mix(in srgb, var(--success) 30%, transparent)',
        // Secondary
        'secondary-muted': 'color-mix(in srgb, var(--secondary) 12%, transparent)',
        // Warning
        'warning-muted':   'color-mix(in srgb, var(--warning) 12%, transparent)',
        'warning-soft':    'color-mix(in srgb, var(--warning) 14%, transparent)',
        // Danger
        'danger-muted':    'color-mix(in srgb, #FF6B7A 14%, transparent)',
        'danger-glow':     'color-mix(in srgb, #FF6B7A 30%, transparent)',
      },

      borderRadius: {
        card:  '14px',
        chip:  '20px',
        pill:  '999px',
      },

      fontSize: {
        '3xs': ['9.5px', { lineHeight: '1.4' }],
        '2xs': ['11px',  { lineHeight: '1.4' }],
        'xs':  ['12px',  { lineHeight: '1.4' }],
        'sm':  ['13px',  { lineHeight: '1.5' }],
        'base':['14px',  { lineHeight: '1.5' }],
        'md':  ['15px',  { lineHeight: '1.5' }],
        'lg':  ['16px',  { lineHeight: '1.5' }],
        'xl':  ['18px',  { lineHeight: '1.4' }],
        '2xl': ['22px',  { lineHeight: '1.3' }],
        '3xl': ['28px',  { lineHeight: '1.2' }],
        '4xl': ['36px',  { lineHeight: '1.1' }],
        '5xl': ['52px',  { lineHeight: '1'   }],
      },

      spacing: {
        '3.5': '14px',
        '4.5': '18px',
        '5.5': '22px',
        '18':  '72px',
      },

      boxShadow: {
        'primary-sm':  '0 8px 20px rgba(124,106,247,0.35)',
        'primary-md':  '0 8px 32px rgba(124,106,247,0.45)',
        'overlay':     '0 8px 32px rgba(0,0,0,0.36)',
        'modal':       '0 24px 60px rgba(0,0,0,0.4)',
        'nav':         '0 -8px 32px rgba(0,0,0,0.3)',
      },

      letterSpacing: {
        tight:  '-0.4px',
        tighter:'-1px',
        label:  '0.5px',
        badge:  '0.8px',
      },
    },
  },
  plugins: [],
};
