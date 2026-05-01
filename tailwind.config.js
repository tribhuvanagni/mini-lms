/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#6366f1', dark: '#4f46e5', light: '#a5b4fc' },
        surface: { DEFAULT: '#1e293b', muted: '#334155' },
        accent: '#f59e0b',
        danger: '#ef4444',
        success: '#22c55e',
        bgPrimary: '#0f172a',
        bgSurface: '#1e293b',
        bgMuted: '#334155',
        textPrimary: '#f8fafc',
        textSecondary: '#94a3b8',
        textMuted: '#64748b',
        border: '#334155',
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
};
