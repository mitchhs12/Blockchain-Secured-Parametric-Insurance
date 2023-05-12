/** @type {import('tailwindcss').Config} */
module.exports = {
    theme: {
        screens: {
            'xs': "480px", // custom breakpoint for screens smaller than 640px
            'sm': "640px",
            'md': "768px",
            'lg': "1024px",
            'xl': "1280px",
            "2xl": "1536px",
        },
    },
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
        },
    },
    plugins: [],
};
