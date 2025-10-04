/** @type {import('tailwindcss').Config} */
  module.exports = {
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // This line is crucial
    ],
    theme: {
    extend: {},
    },
    plugins: [],
  };
