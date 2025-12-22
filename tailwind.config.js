/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                background: "var(--bg-primary)",
                foreground: "var(--text-primary)",
                primary: {
                    DEFAULT: "var(--color-primary)",
                    foreground: "var(--color-primary-foreground)",
                },
                secondary: {
                    DEFAULT: "var(--color-secondary)",
                    foreground: "var(--color-secondary-foreground)",
                },
                muted: {
                    DEFAULT: "#64748b",
                    foreground: "#94a3b8",
                },
                accent: {
                    DEFAULT: "#818cf8",
                    foreground: "#ffffff",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                border: "var(--btn-border)",
                input: "var(--input)",
                skeleton: "var(--skeleton)",
                ring: "#30b357",
                sidebar: {
                    DEFAULT: 'hsl(var(--sidebar-background))',
                    foreground: 'hsl(var(--sidebar-foreground))',
                    primary: 'hsl(var(--sidebar-primary))',
                    'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
                    accent: 'hsl(var(--sidebar-accent))',
                    'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
                    border: 'hsl(var(--sidebar-border))',
                    ring: 'hsl(var(--sidebar-ring))',
                },
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Outfit', 'sans-serif'],
            },
            animation: {
                float: 'float 6s ease-in-out infinite',
                'fade-in': 'fadeIn 0.5s ease-out forwards',
                ripple: "ripple 2s ease calc(var(--i, 0) * 0.2s) infinite",
                orbit: "orbit calc(var(--duration) * 1s) linear infinite",
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                ripple: {
                    "0%, 100%": { transform: "translate(-50%, -50%) scale(1)" },
                    "50%": { transform: "translate(-50%, -50%) scale(0.9)" },
                },
                orbit: {
                    "0%": {
                        transform:
                            "rotate(0deg) translateY(calc(var(--radius) * 1px)) rotate(0deg)",
                    },
                    "100%": {
                        transform:
                            "rotate(360deg) translateY(calc(var(--radius) * 1px)) rotate(-360deg)",
                    },
                },
            },
            boxShadow: {
                input: [
                    "0px 2px 3px -1px rgba(0, 0, 0, 0.1)",
                    "0px 1px 0px 0px rgba(25, 28, 33, 0.02)",
                    "0px 0px 0px 1px rgba(25, 28, 33, 0.08)",
                ].join(", "),
            },
        },
    },
    plugins: [],
}
