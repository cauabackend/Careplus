/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        jakarta: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      colors: {
        accent: 'var(--accent)',
        reward: 'var(--accent-reward)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-600px 0' },
          '100%': { backgroundPosition: '600px 0' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':     { transform: 'translateY(-14px)' },
        },
        breathe: {
          '0%,100%': { transform: 'scale(1)' },
          '50%':     { transform: 'scale(1.025)' },
        },
        aurora: {
          '0%':   { transform: 'translateX(-30%) skewY(-3deg)', opacity: '0' },
          '20%':  { opacity: '0.7' },
          '80%':  { opacity: '0.45' },
          '100%': { transform: 'translateX(30%) skewY(-3deg)', opacity: '0' },
        },
        dotPulse: {
          '0%,100%': { transform: 'scale(1)', opacity: '1' },
          '50%':     { transform: 'scale(1.25)', opacity: '0.6' },
        },
      },
      animation: {
        shimmer:    'shimmer 1.6s linear infinite',
        float:      'float 4s ease-in-out infinite',
        breathe:    'breathe 3s ease-in-out infinite',
        aurora:     'aurora 12s linear infinite',
        dotPulse:   'dotPulse 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
