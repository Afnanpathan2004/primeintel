import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F2F2F2",
        surface: "#FFFFFF",
        subtle: "#F7F7F7",
        border: {
          DEFAULT: "#CBCBCB",
          subtle: "#DFDFDF",
          strong: "#A8A8A8",
        },
        primary: {
          DEFAULT: "#174D38",
          hover: "#113A2B",
          subtle: "#EAEFEA",
          muted: "#24644B",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#4D1717",
          hover: "#3B1111",
          subtle: "#F7EFEF",
          muted: "#662626",
          foreground: "#FFFFFF",
        },
        ink: {
          DEFAULT: "#1A1A1A",
          muted: "#595959",
          faint: "#8C8C8C",
        },
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "6px",
        lg: "8px",
        xl: "10px",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "SFMono-Regular",
          "Consolas",
          "Liberation Mono",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
