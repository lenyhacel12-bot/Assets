import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm neutral background + dark charcoal text
        sand: {
          50: "#FBF7F2",
          100: "#F4ECE2",
          200: "#E8DACA",
        },
        charcoal: {
          DEFAULT: "#2E2A27",
          soft: "#5A524C",
        },
        // Primary action — deep terracotta / clay
        clay: {
          50: "#FBEFE9",
          100: "#F2D6C8",
          400: "#D07A56",
          500: "#C65D3B",
          600: "#A94B2E",
          700: "#8A3D26",
        },
        // Secondary status — muted sage (occupied / healthy)
        sage: {
          100: "#E4EADD",
          400: "#8FA47C",
          500: "#7A8B6F",
          600: "#62725A",
        },
        // Slate — neutral secondary
        slate: {
          soft: "#6B7280",
        },
        // Status accents
        vacant: "#D9A441", // amber
        occupied: "#7A8B6F", // sage green
        repair: "#C65D3B", // terracotta/red
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
