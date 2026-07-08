import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand — a calm, trustworthy teal/ink system
        ink: {
          DEFAULT: "#0f172a",
          soft: "#1e293b",
          muted: "#475569",
          faint: "#94a3b8",
        },
        brand: {
          50: "#eefdf6",
          100: "#d6f7e8",
          200: "#b0efd4",
          300: "#7ce0bb",
          400: "#43c99b",
          500: "#1eae82",
          600: "#128e6b",
          700: "#0f7157",
          800: "#115a47",
          900: "#0f4a3c",
        },
        // Semantic status colors
        satisfied: "#16a34a",
        risk: "#d97706",
        failing: "#dc2626",
        pending: "#64748b",
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(15,23,42,0.04), 0 1px 3px 0 rgba(15,23,42,0.06)",
        lift: "0 4px 12px -2px rgba(15,23,42,0.10), 0 2px 6px -2px rgba(15,23,42,0.06)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
      },
    },
  },
  plugins: [],
};

export default config;
