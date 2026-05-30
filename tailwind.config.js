/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#102225",
        lagoon: "#0f766e",
        palm: "#14b8a6",
        sand: "#f5efe2",
        clay: "#c46b35",
        date: "#7c4a2d",
        mist: "#e6f4f1"
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Manrope", "Segoe UI", "sans-serif"]
      },
      boxShadow: {
        soft: "0 24px 70px rgba(16, 34, 37, 0.12)",
        card: "0 18px 45px rgba(15, 118, 110, 0.12)"
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        rise: "rise 0.65s ease-out both",
        pulseSoft: "pulseSoft 1.8s ease-in-out infinite"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" }
        },
        rise: {
          "0%": { opacity: 0, transform: "translateY(18px)" },
          "100%": { opacity: 1, transform: "translateY(0)" }
        },
        pulseSoft: {
          "0%, 100%": { opacity: 0.55, transform: "scale(1)" },
          "50%": { opacity: 1, transform: "scale(1.04)" }
        }
      }
    }
  },
  plugins: []
};
