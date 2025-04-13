module.exports = {
  content: [
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            h1: {
              marginBottom: '1rem',
            },
            h2: {
              marginTop: '1.5rem',
              marginBottom: '1rem',
            },
            h3: {
              marginTop: '1.25rem',
              marginBottom: '0.75rem',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 