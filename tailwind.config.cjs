/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Map Tailwind color names to the app's CSS design-token variables.
        // Keep the original CSS vars in :root untouched — Tailwind just references them.
        'c-bg':      'var(--bg)',
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
        // Category colors
        'cat-health':   'var(--c-health)',
        'cat-career':   'var(--c-career)',
        'cat-finance':  'var(--c-finance)',
        'cat-learning': 'var(--c-learning)',
        'cat-wellness': 'var(--c-wellness)',
      },
      borderRadius: {
        card: '14px',
        pill: '999px',
        chip: '20px',
      },
      fontSize: {
        '2xs': ['11px', { lineHeight: '1.4' }],
        'xs':  ['12px', { lineHeight: '1.4' }],
        'sm':  ['13px', { lineHeight: '1.5' }],
        'base':['14px', { lineHeight: '1.5' }],
        'md':  ['15px', { lineHeight: '1.5' }],
        'lg':  ['16px', { lineHeight: '1.5' }],
        'xl':  ['18px', { lineHeight: '1.4' }],
        '2xl': ['22px', { lineHeight: '1.3' }],
        '3xl': ['28px', { lineHeight: '1.2' }],
        '4xl': ['36px', { lineHeight: '1.1' }],
        '5xl': ['52px', { lineHeight: '1' }],
      },
      spacing: {
        '3.5': '14px',
        '4.5': '18px',
        '5.5': '22px',
        '18': '72px',
      },
    },
  },
  plugins: [],
};
