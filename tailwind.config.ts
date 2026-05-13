import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#c49b63",
          "primary-hover": "#b08a56",
          dark: "#0f0f0f",
          darker: "#0a0a0a",
          muted: "#6c757d",
          cream: "#faf8f5",
          light: "#ffffff",
        },
      },
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
        accent: ["var(--font-accent)", "cursive"],
      },
      boxShadow: {
        soft: "0 10px 40px rgba(0,0,0,0.12)",
      },
      backgroundImage: {
        "dark-gradient":
          "linear-gradient(180deg, rgba(15,15,15,0.92) 0%, rgba(15,15,15,0.75) 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
