import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        body: ["'DM Sans'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        chalk: {
          50: "#f8f7f4",
          100: "#ede9df",
          200: "#d8d0be",
          300: "#c0b499",
          400: "#a8966e",
          500: "#927a52",
          600: "#7d6443",
          700: "#664f36",
          800: "#54402e",
          900: "#463628",
        },
        slate: {
          board: "#1e3a2f",
          dark: "#152a21",
          deep: "#0d1f18",
        },
        amber: {
          glow: "#f59e0b",
          soft: "#fbbf24",
          pale: "#fde68a",
        },
        cream: {
          DEFAULT: "#faf8f3",
          warm: "#f5f0e8",
          paper: "#ede8de",
        },
      },
      backgroundImage: {
        "chalk-board": "linear-gradient(135deg, #1e3a2f 0%, #152a21 50%, #1a3328 100%)",
        "warm-paper": "linear-gradient(135deg, #faf8f3 0%, #f0ebe0 100%)",
        "golden-glow": "radial-gradient(ellipse at top, #f59e0b22 0%, transparent 70%)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-in-right": "slideInRight 0.4s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(245, 158, 11, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(245, 158, 11, 0.6)" },
        },
      },
      boxShadow: {
        "chalk": "0 4px 24px rgba(0,0,0,0.3), 0 1px 4px rgba(0,0,0,0.2)",
        "card": "0 2px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
        "glow-amber": "0 0 30px rgba(245, 158, 11, 0.4)",
        "glow-green": "0 0 30px rgba(30, 58, 47, 0.5)",
        "elevated": "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};
export default config;
