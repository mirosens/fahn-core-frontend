import plugin from "tailwindcss/plugin";

// tailwind.config.ts
const tailwindConfig = {
  theme: {
    extend: {
      screens: {
        desktop: "1281px", // Desktop Header ab 1281px
      },
      transformStyle: {
        "3d": "preserve-3d",
      },
      backfaceVisibility: {
        hidden: "hidden",
      },
      perspective: {
        1000: "1000px",
      },
      rotate: {
        "y-180": "rotateY(180deg)",
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".perspective-1000": {
          perspective: "1000px",
        },
        ".transform-style-3d": {
          transformStyle: "preserve-3d",
        },
        ".backface-hidden": {
          backfaceVisibility: "hidden",
        },
        ".rotate-y-180": {
          transform: "rotateY(180deg)",
        },
      });
    }),
  ],
};

export default tailwindConfig;
