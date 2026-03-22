import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Material Design 3 / Stitch tokens ────────────────────────────
        "surface-container-lowest":  "#180c01",
        "on-primary":                "#610046",
        "surface-container-highest": "#423220",
        "on-primary-container":      "#770056",
        "primary-fixed":             "#ffd8ea",
        "outline":                   "#a28a95",
        "secondary-container":       "#712093",
        "primary-fixed-dim":         "#ffaed9",
        "background":                "#322312",
        "primary":                   "#ff77c9",
        "surface":                   "#322312",
        "primary-container":         "#ff77c9",
        "secondary-fixed-dim":       "#ecb2ff",
        "on-secondary":              "#520071",
        "secondary":                 "#ecb2ff",
        "on-secondary-container":    "#e59dff",
        "on-background":             "#f9dec3",
        "tertiary":                  "#91d96b",
        "on-surface":                "#f9dec3",
        "surface-container-high":    "#362716",
        "surface-container-low":     "#271909",
        "on-surface-variant":        "#dac0cb",
        "surface-bright":            "#473624",
        "surface-variant":           "#423220",
        "inverse-primary":           "#a52c7c",
        "surface-container":         "#2b1d0c",
        "surface-tint":              "#ff77c9",
        "tertiary-container":        "#73b84f",
        "secondary-fixed":           "#f8d8ff",
        "outline-variant":           "#54414b",
        "surface-dim":               "#322312",
        "inverse-on-surface":        "#3d2d1c",

        // ── Shelby brand palette ─────────────────────────────────────────
        brown: "#2C2210",
        pink: {
          DEFAULT: "#FF77C9",
          20:      "#FFBAE3",
          10:      "#FFDFEF",
        },
        maroon:  "#4A0E2A",
        orange: {
          DEFAULT: "#FF6B3D",
          20:      "#FFBBA0",
          10:      "#FFE0D5",
        },
        purple:  "#6B0AC9",
        lilac: {
          DEFAULT: "#C97EFF",
          20:      "#E5C2FF",
          10:      "#F2E5FF",
        },
        forest:     "#1A3D1A",
        lime: {
          DEFAULT: "#7AE040",
          20:      "#BFEFAA",
          10:      "#E5F7D5",
        },
        black:      "#161008",
        "black-80": "#3D3830",
        white:      "#FCFAF8",

        // ── shelby.* aliases — existing components still reference these ──
        shelby: {
          bg:            "#2C2210",
          "bg-light":    "#3A2D18",
          "bg-card":     "#4A3820",
          accent:        "#FF77C9",
          "accent-dim":  "#CC5FA0",
          "accent-glow": "#FF77C940",
          text:          "#FCFAF8",
          "text-muted":  "#948E84",
          border:        "#FF77C9",
          "border-light":"#FF77C9",
          success:       "#7AE040",
          error:         "#FF6B3D",
          warning:       "#C97EFF",
        },
      },

      fontFamily: {
        // Stitch design system
        headline: ["var(--font-serif)", "Noto Serif", "serif"],
        body:     ["var(--font-body)",  "Manrope", "sans-serif"],
        label:    ["var(--font-mono)",  "Space Grotesk", "sans-serif"],
        mono:     ["var(--font-mono)",  "Space Grotesk", "monospace"],
        // Legacy aliases — existing components use these
        display:  ["var(--font-serif)", "Noto Serif", "serif"],
      },

      borderRadius: {
        DEFAULT: "12px",
        lg:      "24px",
        xl:      "36px",
        full:    "9999px",
        // Legacy aliases — existing components use these
        pill:    "9999px",
        card:    "12px",
      },

      transitionTimingFunction: {
        shelby: "cubic-bezier(.59,.06,.1,1)",
      },
      transitionDuration: {
        shelby: "300ms",
      },

      boxShadow: {
        "shelby-glow": "0 0 20px #FF77C940",
        "shelby-card": "0 4px 24px rgba(0,0,0,0.4)",
      },

      keyframes: {
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 8px #FF77C940" },
          "50%":       { boxShadow: "0 0 24px #FF77C980" },
        },
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "fade-up":    "fade-up 0.4s cubic-bezier(.59,.06,.1,1) forwards",
        shimmer:      "shimmer 1.5s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
