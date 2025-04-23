import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "hsl(246, 82%, 60%)",
          foreground: "hsl(0, 0%, 100%)",
          muted: "hsl(246, 70%, 70%)",
        },
        card: {
          pink: "hsl(350, 100%, 95%)",
          yellow: "hsl(40, 100%, 95%)",
          green: "hsl(142, 100%, 95%)",
          purple: "hsl(270, 100%, 97%)",
        },
        success: {
          DEFAULT: "hsl(142, 76%, 36%)",
          foreground: "hsl(142, 100%, 95%)",
        },
        warning: {
          DEFAULT: "hsl(38, 92%, 50%)",
          foreground: "hsl(48, 100%, 95%)",
        },
        border: "hsl(220, 13%, 91%)",
        input: "hsl(220, 13%, 91%)",
        ring: "hsl(246, 82%, 60%)",
        background: "hsl(0, 0%, 100%)",
        foreground: "hsl(222, 47%, 11%)",
        secondary: {
          DEFAULT: "hsl(220, 13%, 91%)",
          foreground: "hsl(222, 47%, 11%)",
        },
        destructive: {
          DEFAULT: "hsl(0, 86%, 97%)",
          foreground: "hsl(0, 74%, 42%)",
        },
        muted: {
          DEFAULT: "hsl(220, 13%, 91%)",
          foreground: "hsl(220, 9%, 46%)",
        },
        accent: {
          DEFAULT: "hsl(220, 13%, 91%)",
          foreground: "hsl(222, 47%, 11%)",
        },
        popover: {
          DEFAULT: "hsl(0, 0%, 100%)",
          foreground: "hsl(222, 47%, 11%)",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      boxShadow: {
        card: "0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06)",
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
