// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default { // Use 'export default' for Vite
  content: [
    "./index.html", // Important for scanning your root HTML
    "./src/**/*.{js,ts,jsx,tsx}", // Scans all JS, TS, JSX, TSX files in src/
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}