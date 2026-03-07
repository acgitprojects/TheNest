import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary:      '#E8704A',
        'primary-dark': '#C95A38',
        'primary-light': '#F4956E',
        bg:           '#F5F1E8',
        surface:      '#FFFFFF',
        gold:         '#C9A961',
        'gold-light': '#F0DFA8',
        'text-main':  '#3C3C3C',
        muted:        '#8C8070',
        available:    '#A8B49F',
        'available-bg': '#EAF2E8',
        booked:       '#E8704A',
        'booked-bg':  '#FDE8DF',
        selected:     '#FDDBB0',
        'selected-border': '#C9A961',
        'open-badge': '#A8D5A2',
        'close-badge': '#F4B8A0',
      },
      fontFamily: {
        sans: ['var(--font-noto-sans)', 'Noto Sans TC', 'Inter', 'sans-serif'],
        serif: ['var(--font-noto-serif)', 'Noto Serif TC', 'serif'],
      },
      boxShadow: {
        warm:   '0 4px 24px rgba(200, 120, 60, 0.08)',
        'warm-md': '0 8px 40px rgba(200, 120, 60, 0.12)',
        'warm-lg': '0 16px 64px rgba(200, 120, 60, 0.16)',
        card:   '0 2px 16px rgba(60, 40, 20, 0.06)',
      },
      borderRadius: {
        card:  '16px',
        input: '12px',
        badge: '8px',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #E8704A 0%, #C9A961 50%, #F5F1E8 100%)',
        'warm-gradient': 'linear-gradient(180deg, #F5F1E8 0%, #FDEEDE 100%)',
        'card-gradient': 'linear-gradient(135deg, #FFFFFF 0%, #FDF8F0 100%)',
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out forwards',
        'slide-up':   'slideUp 0.5s ease-out forwards',
        'float':      'float 6s ease-in-out infinite',
        'pulse-warm': 'pulseWarm 2s ease-in-out infinite',
        'spin-slow':  'spin 8s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        pulseWarm: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(232, 112, 74, 0.4)' },
          '50%':      { boxShadow: '0 0 0 12px rgba(232, 112, 74, 0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
