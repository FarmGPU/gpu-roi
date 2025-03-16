import type { Config } from "tailwindcss"
const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/flowbite-react/**/*.js",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // FarmGPU Brand Colors
        fgpu: {
          black: "#091000",
          white: "#FAFFF5",
          volt: "#88FF00",
          "volt-light": "#B8FF66",
          "volt-lighter": "#CFFF99",
          "volt-dark": "#66CC00",
          "volt-darker": "#4D9900",
          gray: {
            100: "#F3FFE5",
            200: "#E7FFCC",
            300: "#DBFFB2",
            400: "#CFFF99",
            500: "#C4FF80",
            600: "#B8FF66",
            700: "#ACFF4D",
            800: "#A0FF33",
            900: "#88FF00",
          },
          stone: {
            100: "#9AA38F",
            200: "#818C73",
            300: "#747E67",
            400: "#67705C",
            500: "#5A6250",
            600: "#414639",
            700: "#34382E",
            800: "#272A22",
            900: "#1A1C17",
            950: "#121410",
          },
        },
        primary: {
          DEFAULT: "#88FF00", // Volt
          foreground: "#091000", // Black
          "50": "#F3FFE5",
          "100": "#E7FFCC",
          "200": "#DBFFB2",
          "300": "#CFFF99",
          "400": "#C4FF80",
          "500": "#B8FF66",
          "600": "#ACFF4D",
          "700": "#A0FF33",
          "800": "#88FF00", // Volt
          "900": "#66CC00",
          "950": "#4D9900",
        },
        secondary: {
          DEFAULT: "#5A6250", // Stone gray
          foreground: "#FAFFF5", // White
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "#1A1C17", // Dark stone
          foreground: "#9AA38F", // Light stone
        },
        accent: {
          DEFAULT: "#B8FF66", // Volt light
          foreground: "#091000", // Black
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("flowbite/plugin")],
}

export default config

