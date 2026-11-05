/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAF7F2',
        surface: '#FFFFFF',
        surfaceWarm: '#FDFBF7',
        surfaceCream: '#F5EFE6',
        brand: {
          DEFAULT: '#7A1618',
          hover: '#611012',
          light: '#FDF2F2',
          subtle: '#FEE2E2',
          dark: '#4F0B0D',
        },
        saffron: {
          DEFAULT: '#EA580C',
          hover: '#C2410C',
          light: '#FFF7ED',
          subtle: '#FFEDD5',
          border: '#FED7AA',
          dark: '#9A3412',
        },
        amberGold: {
          DEFAULT: '#D97706',
          hover: '#B45309',
          light: '#FEF3C7',
          subtle: '#FDE68A',
        },
        secondary: {
          DEFAULT: '#EA580C',
          hover: '#C2410C',
          light: '#FFF7ED',
        },
        tealAccent: {
          DEFAULT: '#0F9488',
          hover: '#0D7B71',
          light: '#F0FDFA',
        },
        textPrimary: '#2A1810',
        textSecondary: '#6E5548',
        textMuted: '#9E8679',
        borderLight: '#EFE6DA',
        borderMedium: '#E2D3BF',
        borderDark: '#C9B59D',
        govSuccess: {
          DEFAULT: '#15803D',
          light: '#F0FDF4',
          border: '#BBF7D0',
        },
        govWarning: {
          DEFAULT: '#B45309',
          light: '#FFFBEB',
          border: '#FDE68A',
        },
        govError: {
          DEFAULT: '#B91C1C',
          light: '#FEF2F2',
          border: '#FECACA',
        },
        govInfo: {
          DEFAULT: '#0369A1',
          light: '#F0F9FF',
          border: '#BAE6FD',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(74, 22, 14, 0.04), 0 1px 2px 0 rgba(74, 22, 14, 0.02)',
        card: '0 2px 8px -2px rgba(74, 22, 14, 0.06), 0 1px 4px -1px rgba(74, 22, 14, 0.04)',
        cardHover: '0 10px 25px -5px rgba(74, 22, 14, 0.1), 0 8px 10px -6px rgba(74, 22, 14, 0.04)',
        dropdown: '0 10px 25px -5px rgba(74, 22, 14, 0.15), 0 8px 10px -6px rgba(74, 22, 14, 0.08)',
        saffronGlow: '0 4px 14px 0 rgba(234, 88, 12, 0.35)',
      },
    },
  },
  plugins: [],
}
