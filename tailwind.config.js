/** @type {import('tailwindcss').Config} */
// Provides type information for better autocompletion and type-checking.

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // Specifies the files Tailwind should scan for class names to generate the necessary CSS.

  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  // Extends the default theme with custom background gradients.

  plugins: [],
  // An array for adding Tailwind CSS plugins; currently empty.
}
