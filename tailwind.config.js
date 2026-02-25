/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#14532d", // dark green
                secondary: "#166534",
                accent: "#fbbf24", // amber/gold
            },
        },
    },
    plugins: [],
}
