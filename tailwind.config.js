/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Inter Tight"', 'Inter', 'system-ui', 'sans-serif'],
      },
      // HIG-aligned type scale (see STACK.md "Typography baseline")
      fontSize: {
        // [size, { lineHeight, letterSpacing?, fontWeight? }]
        caption: ['12px', { lineHeight: '16px', letterSpacing: '0.01em' }],
        footnote: ['13px', { lineHeight: '18px' }],
        subheadline: ['15px', { lineHeight: '20px' }],
        body: ['16px', { lineHeight: '24px' }],
        headline: ['17px', { lineHeight: '22px', fontWeight: '600' }],
        title3: ['20px', { lineHeight: '26px' }],
        title2: ['22px', { lineHeight: '28px' }],
        title1: ['28px', { lineHeight: '34px', letterSpacing: '-0.01em' }],
        largeTitle: ['34px', { lineHeight: '41px', letterSpacing: '-0.015em' }],
        display: ['clamp(48px, 8vw, 96px)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        // Keep Tailwind's default scale usable; override `xs` floor at 12px (was 12px already)
        xs: ['12px', { lineHeight: '16px', letterSpacing: '0.01em' }],
        sm: ['14px', { lineHeight: '20px' }],
        base: ['16px', { lineHeight: '24px' }],
        lg: ['17px', { lineHeight: '24px' }],
        xl: ['20px', { lineHeight: '28px' }],
        '2xl': ['22px', { lineHeight: '30px' }],
        '3xl': ['28px', { lineHeight: '34px', letterSpacing: '-0.01em' }],
        '4xl': ['34px', { lineHeight: '41px', letterSpacing: '-0.015em' }],
        '5xl': ['44px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        '6xl': ['56px', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
        '7xl': ['68px', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
      },
      borderRadius: { '4xl': '2rem' },
      colors: {
        ink: {
          50: 'oklch(98% 0.005 280 / <alpha-value>)',
          100: 'oklch(95% 0.01 280 / <alpha-value>)',
          200: 'oklch(88% 0.015 280 / <alpha-value>)',
          300: 'oklch(75% 0.02 280 / <alpha-value>)',
          400: 'oklch(60% 0.025 280 / <alpha-value>)',
          500: 'oklch(48% 0.03 280 / <alpha-value>)',
          600: 'oklch(38% 0.035 280 / <alpha-value>)',
          700: 'oklch(28% 0.03 280 / <alpha-value>)',
          800: 'oklch(20% 0.025 280 / <alpha-value>)',
          900: 'oklch(14% 0.02 280 / <alpha-value>)',
          950: 'oklch(8% 0.015 280 / <alpha-value>)',
        },
        brand: {
          50: 'oklch(97% 0.02 270 / <alpha-value>)',
          100: 'oklch(93% 0.05 270 / <alpha-value>)',
          200: 'oklch(86% 0.09 270 / <alpha-value>)',
          300: 'oklch(78% 0.14 270 / <alpha-value>)',
          400: 'oklch(68% 0.18 270 / <alpha-value>)',
          500: 'oklch(60% 0.22 270 / <alpha-value>)',
          600: 'oklch(52% 0.22 270 / <alpha-value>)',
          700: 'oklch(44% 0.20 270 / <alpha-value>)',
          800: 'oklch(36% 0.16 270 / <alpha-value>)',
          900: 'oklch(28% 0.12 270 / <alpha-value>)',
        },
        accent: {
          400: 'oklch(78% 0.16 200 / <alpha-value>)',
          500: 'oklch(70% 0.18 200 / <alpha-value>)',
          600: 'oklch(60% 0.18 200 / <alpha-value>)',
        },
      },
      backdropBlur: { xs: '2px' },
      animation: {
        gradient: 'gradient 18s ease infinite',
        shimmer: 'shimmer 2s linear infinite',
        float: 'float 8s ease-in-out infinite',
      },
      keyframes: {
        gradient: { '0%,100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        float: { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-12px)' } },
      },
    },
  },
  plugins: [],
};
