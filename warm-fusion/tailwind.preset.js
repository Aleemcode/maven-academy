/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        /* — Semantic DMaven Tokens — */
        ground: {
          DEFAULT: "var(--wf-ground, var(--sand-2, #F9F6F0))",
          2: "var(--wf-ground-2, var(--sand-3, #F1ECE0))",
        },
        surface: "var(--wf-surface, #FFFFFF)",
        forest: {
          DEFAULT: "var(--wf-forest, var(--slate-12, #001F51))",
          pine: "var(--wf-pine, #0A2D6E)",
        },
        ink: {
          DEFAULT: "var(--wf-ink, var(--slate-12, #001F51))",
          2: "var(--wf-ink-2, var(--slate-11, #27456D))",
          muted: "var(--wf-muted, var(--sand-11, #5E5646))",
          inv: "var(--wf-ink-inv, #F8FAFC)",
          "inv-2": "var(--wf-ink-inv-2, #CBD5E1)",
        },
        terra: {
          DEFAULT: "var(--wf-terra, var(--orange-9, #FB5707))",
          deep: "var(--wf-terra-deep, var(--orange-10, #D44200))",
          tint: "var(--wf-terra-tint, var(--orange-3, #FFF0EA))",
        },
        green: {
          DEFAULT: "var(--wf-green, var(--grass-9, #1BC67F))",
          dark: "var(--wf-green-dark, var(--grass-11, #006634))",
          tint: "var(--wf-green-tint, var(--grass-3, #E8F9F1))",
        },
        gold: {
          DEFAULT: "var(--wf-gold, var(--amber-9, #FFCB66))",
          dark: "var(--wf-gold-dark, var(--amber-11, #78350F))",
          deep: "var(--wf-gold-deep, var(--amber-10, #B45309))",
          tint: "var(--wf-gold-tint, var(--amber-3, #FFF8E8))",
        },
        blue: {
          DEFAULT: "var(--wf-blue, var(--blue-9, #3B86FE))",
          tint: "var(--wf-blue-tint, var(--blue-3, #EEF4FF))",
        },
        danger: {
          DEFAULT: "var(--wf-danger, var(--crimson-9, #E11D48))",
          tint: "var(--wf-danger-tint, var(--crimson-3, #FFEBE1))",
        },
        chip: {
          lime: "var(--wf-lime, var(--grass-3, #E1F8EC))",
          sky: "var(--wf-sky, var(--blue-3, #E2EEFF))",
          pink: "var(--wf-pink, #FCE7F3)",
          peach: "var(--wf-peach, var(--orange-3, #FFEBE1))",
        },

        /* — Standard Radix 12-Step Scales (Accessible Utility Mapping) — */
        sand: {
          1: "var(--sand-1)", 2: "var(--sand-2)", 3: "var(--sand-3)", 4: "var(--sand-4)",
          5: "var(--sand-5)", 6: "var(--sand-6)", 7: "var(--sand-7)", 8: "var(--sand-8)",
          9: "var(--sand-9)", 10: "var(--sand-10)", 11: "var(--sand-11)", 12: "var(--sand-12)",
        },
        slate: {
          1: "var(--slate-1)", 2: "var(--slate-2)", 3: "var(--slate-3)", 4: "var(--slate-4)",
          5: "var(--slate-5)", 6: "var(--slate-6)", 7: "var(--slate-7)", 8: "var(--slate-8)",
          9: "var(--slate-9)", 10: "var(--slate-10)", 11: "var(--slate-11)", 12: "var(--slate-12)",
        },
        orange: {
          1: "var(--orange-1)", 2: "var(--orange-2)", 3: "var(--orange-3)", 4: "var(--orange-4)",
          5: "var(--orange-5)", 6: "var(--orange-6)", 7: "var(--orange-7)", 8: "var(--orange-8)",
          9: "var(--orange-9)", 10: "var(--orange-10)", 11: "var(--orange-11)", 12: "var(--orange-12)",
        },
        grass: {
          1: "var(--grass-1)", 2: "var(--grass-2)", 3: "var(--grass-3)", 4: "var(--grass-4)",
          5: "var(--grass-5)", 6: "var(--grass-6)", 7: "var(--grass-7)", 8: "var(--grass-8)",
          9: "var(--grass-9)", 10: "var(--grass-10)", 11: "var(--grass-11)", 12: "var(--grass-12)",
        },
        amber: {
          1: "var(--amber-1)", 2: "var(--amber-2)", 3: "var(--amber-3)", 4: "var(--amber-4)",
          5: "var(--amber-5)", 6: "var(--amber-6)", 7: "var(--amber-7)", 8: "var(--amber-8)",
          9: "var(--amber-9)", 10: "var(--amber-10)", 11: "var(--amber-11)", 12: "var(--amber-12)",
        },
        crimson: {
          1: "var(--crimson-1)", 2: "var(--crimson-2)", 3: "var(--crimson-3)", 4: "var(--crimson-4)",
          5: "var(--crimson-5)", 6: "var(--crimson-6)", 7: "var(--crimson-7)", 8: "var(--crimson-8)",
          9: "var(--crimson-9)", 10: "var(--crimson-10)", 11: "var(--crimson-11)", 12: "var(--crimson-12)",
        },
      },
      boxShadow: {
        wf: "var(--wf-shadow, 5px 5px 0 var(--wf-border, #001F51))",
        "wf-sm": "var(--wf-shadow-sm, 3px 3px 0 var(--wf-border, #001F51))",
        "wf-lg": "var(--wf-shadow-lg, 8px 8px 0 var(--wf-border, #001F51))",
      },
      borderWidth: {
        wf: "var(--wf-bw, 2.5px)",
        "wf-thin": "var(--wf-bw-thin, 2px)",
      },
      borderRadius: {
        "wf-xl": "var(--wf-r-xl, 22px)",
        "wf-lg": "var(--wf-r-lg, 16px)",
        "wf-md": "var(--wf-r-md, 12px)",
        "wf-sm": "var(--wf-r-sm, 8px)",
        "wf-pill": "var(--wf-r-pill, 9999px)",
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', "sans-serif"],
        body: ['"Instrument Sans"', "sans-serif"],
        mono: ['"Space Mono"', "monospace"],
        arabic: ['"Amiri"', "serif"],
      },
      transitionDuration: {
        wf: "var(--wf-dur, 200ms)",
        "wf-fast": "var(--wf-dur-fast, 120ms)",
      },
    },
  },
  plugins: [],
};
