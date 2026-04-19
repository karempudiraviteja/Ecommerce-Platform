/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1a1a2e', 50: '#f0f0f8', 100: '#d0d0e8', 500: '#1a1a2e', 600: '#13132a', 700: '#0e0e20' },
        accent: { DEFAULT: '#e94560', 50: '#fff0f3', 100: '#ffd6de', 500: '#e94560', 600: '#d63050', 700: '#c01f40' },
        surface: '#16213e',
        muted: '#6b7280',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 4px 24px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 40px rgba(233,69,96,0.15)',
      },
    },
  },
  plugins: [],
};
