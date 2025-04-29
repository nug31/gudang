/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
      },
      boxShadow: {
        neumorph: "20px 20px 60px #d1d9e6, -20px -20px 60px #ffffff",
        "neumorph-inset":
          "inset 8px 8px 16px #d1d9e6, inset -8px -8px 16px #ffffff",
        "3d": "0 10px 30px -15px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        "3d-hover":
          "0 20px 40px -15px rgba(0, 0, 0, 0.35), 0 10px 20px -5px rgba(0, 0, 0, 0.1)",
        "3d-intense":
          "0 20px 50px -12px rgba(0, 0, 0, 0.4), 0 10px 24px -8px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.05)",
        "3d-soft":
          "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 5px 10px -5px rgba(0, 0, 0, 0.04)",
        "3d-glow":
          "0 0 15px rgba(79, 70, 229, 0.5), 0 0 30px rgba(79, 70, 229, 0.3), 0 0 45px rgba(79, 70, 229, 0.1)",
        glass:
          "0 8px 32px 0 rgba(31, 38, 135, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.2)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        fadeIn: "fadeIn 0.5s ease-out",
        slideIn: "slideIn 0.5s ease-out",
        "rotate-slow": "rotate 8s linear infinite",
        "bounce-subtle": "bounce-subtle 3s ease-in-out infinite",
        "flip-x": "flip-x 1s ease-out",
        "flip-y": "flip-y 1s ease-out",
        "scale-up": "scale-up 0.5s ease-out",
        "scale-down": "scale-down 0.5s ease-out",
        "slide-up": "slide-up 0.5s ease-out",
        "slide-down": "slide-down 0.5s ease-out",
        "slide-left": "slide-left 0.5s ease-out",
        "slide-right": "slide-right 0.5s ease-out",
        "rotate-y": "rotate-y 1s ease-out",
        "rotate-x": "rotate-x 1s ease-out",
        "hover-float": "hover-float 2s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        "flip-x": {
          "0%": { transform: "rotateX(0deg)" },
          "100%": { transform: "rotateX(360deg)" },
        },
        "flip-y": {
          "0%": { transform: "rotateY(0deg)" },
          "100%": { transform: "rotateY(360deg)" },
        },
        "scale-up": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "scale-down": {
          "0%": { transform: "scale(1.05)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-down": {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-left": {
          "0%": { transform: "translateX(20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-right": {
          "0%": { transform: "translateX(-20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "rotate-y": {
          "0%": { transform: "rotateY(0deg)" },
          "100%": { transform: "rotateY(360deg)" },
        },
        "rotate-x": {
          "0%": { transform: "rotateX(0deg)" },
          "100%": { transform: "rotateX(360deg)" },
        },
        "hover-float": {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-5px) scale(1.02)" },
        },
      },
      transitionProperty: {
        height: "height",
        spacing: "margin, padding",
        transform: "transform",
      },
      transformStyle: {
        "preserve-3d": "preserve-3d",
      },
      perspective: {
        none: "none",
        500: "500px",
        1000: "1000px",
        2000: "2000px",
      },
      backdropFilter: {
        none: "none",
        blur: "blur(8px)",
        "blur-sm": "blur(4px)",
        "blur-md": "blur(12px)",
        "blur-lg": "blur(16px)",
        "blur-xl": "blur(24px)",
      },
      backfaceVisibility: {
        visible: "visible",
        hidden: "hidden",
      },
      transformOrigin: {
        center: "center",
        top: "top",
        "top-right": "top right",
        right: "right",
        "bottom-right": "bottom right",
        bottom: "bottom",
        "bottom-left": "bottom left",
        left: "left",
        "top-left": "top left",
      },
    },
  },
  plugins: [],
};
