/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        'cp-teal':    '#00BFDF',
        'cp-teal-lt': '#E6F9FC',
        'cp-navy':    '#0B2454',
        'cp-navy-2':  '#1A3E7A',
        'cp-orange':  '#F97316',
        'cp-success': '#10B981',
        'cp-gold':    '#F59E0B',
        'bg':         '#EEF3FD',
        'card':       '#FFFFFF',
        'border':     '#DDE7F5',
        'text':       '#0B1222',
        'muted':      '#617390',
        'd-bg':       '#050C1B',
        'd-card':     '#0D1628',
        'd-border':   '#182338',
        'd-text':     '#E2ECF8',
        'd-muted':    '#6B88B8',
      },
      fontFamily: {
        sora:   ['Sora', 'system-ui', 'sans-serif'],
        dm:     ['DM Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl2': '1rem',
        'xl3': '1.25rem',
      },
    },
  },
  plugins: [],
}
