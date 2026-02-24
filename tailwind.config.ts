import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#08090d',
        card: '#0f1318',
        border: '#1a2030',
        text: '#e0e6f0',
        muted: '#5a6580',
        accent: '#00e5ff',
        'accent-dim': '#00e5ff15',
        success: '#00c9a7',
        warning: '#ff8c00',
        danger: '#ff3d00',
        purple: '#c050ff',
        glow: '#00e5ff40',
        'dark-zone': '#060810',
        'light-zone': '#121620',
      },
    },
  },
} satisfies Config
