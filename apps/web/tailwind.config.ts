import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        bebas:   ['var(--font-bebas)', 'sans-serif'],
        jakarta: ['var(--font-jakarta)', 'sans-serif'],
      },
      colors: {
        brand: {
          azul:    '#002B72',
          celeste: '#74ACDF',
          dorado:  '#F5C518',
        },
      },
    },
  },
  plugins: [],
}

export default config
