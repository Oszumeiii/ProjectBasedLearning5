/** @type {import('tailwindcss').Config} */
/* Light-first UI: nền sáng, chữ tối, tím brand, teal phụ */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        app: {
          DEFAULT: "#f1f5f9",
          card: "#ffffff",
          elevated: "#f8fafc",
          inset: "#f1f5f9",
          track: "#e2e8f0",
          line: "#e2e8f0",
        },
        ink: {
          heading: "#0f172a",
          body: "#334155",
          muted: "#64748b",
          faint: "#94a3b8",
        },
        brand: {
          DEFAULT: "#7c3aed",
          hover: "#6d28d9",
          soft: "#ddd6fe",
          glow: "rgba(124, 58, 237, 0.12)",
        },
        mint: {
          DEFAULT: "#14b8a6",
          dim: "rgba(20, 184, 166, 0.15)",
        },
        warn: {
          pending: "#b91c1c",
          pendingBg: "#fee2e2",
          on: "#991b1b",
        },
        primary: "#7c3aed",
        accent: "#14b8a6",
        "background-light": "#f1f5f9",
        "background-dark": "#0f172a",
        "surface-dark": "#ffffff",
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
        headline: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
        body: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "Arial",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      borderRadius: {
        claude: "12px",
        "claude-sm": "8px",
        "claude-lg": "16px",
        "claude-xl": "32px",
      },
      boxShadow: {
        whisper: "0 1px 3px rgba(15, 23, 42, 0.06)",
        glowBrand: "0 0 24px rgba(124, 58, 237, 0.12)",
      },
    },
  },
  plugins: [],
};
