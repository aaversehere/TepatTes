import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Manrope'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"]
      },
      colors: {
        brand: {
          50: "#f0f9fa",
          100: "#d8f0f3",
          500: "#1b6c80",
          600: "#155768",
          700: "#104351",
          900: "#0b2c36"
        }
      }
    }
  },
  plugins: []
};

export default config;
