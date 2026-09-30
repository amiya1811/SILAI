import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        champagne: {
          light: "#FAF4E8",
          DEFAULT: "#F2E5C6",
          dark: "#E3CCA2",
        },
        sand: {
          light: "#F7E6B8",
          DEFAULT: "#F2D9A0",
          dark: "#DDB86C",
        },
        burgundy: {
          light: "#9A1F3D",
          DEFAULT: "#75162D",
          dark: "#601023",
        },
        maroon: {
          light: "#6E0F20",
          DEFAULT: "#560B18",
          dark: "#450813",
        },
        wine: {
          light: "#4D0310",
          DEFAULT: "#3B010B",
          dark: "#260006",
        },
        gold: {
          accent: "#D4AF37",
          metallic: "#E5C158",
        },
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-manrope)", "DM Sans", "Inter", "sans-serif"],
      },
      backgroundImage: {
        "gradient-royal": "linear-gradient(135deg, #3B010B 0%, #560B18 50%, #75162D 100%)",
        "gradient-burgundy-wine": "linear-gradient(135deg, #75162D 0%, #3B010B 100%)",
        "gradient-champagne-gold": "linear-gradient(135deg, #F2E5C6 0%, #F2D9A0 100%)",
        "gradient-maroon-burgundy": "linear-gradient(135deg, #560B18 0%, #75162D 100%)",
        "gradient-radial-glow": "radial-gradient(circle at 50% 20%, rgba(117, 22, 45, 0.45) 0%, rgba(59, 1, 11, 0.95) 75%)",
        "gradient-radial-accent": "radial-gradient(circle at top right, rgba(242, 217, 160, 0.15) 0%, transparent 60%)",
      },
      boxShadow: {
        "gold-glow": "0 0 25px rgba(242, 217, 160, 0.25)",
        "burgundy-glow": "0 0 35px rgba(117, 22, 45, 0.35)",
        "card-luxury": "0 10px 30px -10px rgba(38, 0, 6, 0.5), 0 0 1px 1px rgba(242, 217, 160, 0.15)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "thread-float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-8px) rotate(1deg)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
