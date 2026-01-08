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
        // Apple 2025 Palette
        'mindflow': {
          cream: '#F0EEE9',
          navy: '#1A1F2E',
          teal: '#5FB3B3',
          sand: '#D4C5B9',
          slate: '#6B7280',
        },
      },
      backgroundImage: {
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        'gradient-primary': 'linear-gradient(135deg, #5FB3B3 0%, #4A9D9D 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07), 0 2px 4px 0 rgba(0, 0, 0, 0.04)',
        'glass-hover': '0 8px 32px 0 rgba(31, 38, 135, 0.12), 0 4px 8px 0 rgba(0, 0, 0, 0.06)',
        'glass-strong': '0 12px 40px 0 rgba(31, 38, 135, 0.15), 0 4px 8px 0 rgba(0, 0, 0, 0.08)',
        'soft': '0 8px 30px rgb(0,0,0,0.04)',
        'soft-lg': '0 20px 60px rgb(0,0,0,0.06)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      willChange: {
        'transform-opacity': 'transform, opacity',
      },
    },
  },
  plugins: [],
}

export default config
