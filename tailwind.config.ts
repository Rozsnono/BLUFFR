/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            backgroundImage: {
                'space': "url('/background.jpg')",
            },
            colors: {
                'brand-dark': '#0f172a', // Main background for cards
                'brand-blue': {
                    DEFAULT: '#0ea5e9', // Cyan/Sky Blue for accents
                    dark: '#0284c7',
                },
                'brand-red': {
                    DEFAULT: '#f43f5e', // Red/Rose for Impostor accents
                    dark: '#e11d48',
                },
                'brand-green': '#22c55e', // Green for selected items
            },
            // Optional: Add a custom font that matches the design
            fontFamily: {
                sans: ['"Poppins"', 'sans-serif'], // Example: Using Poppins font
            },
        },
    },
    plugins: [],
}