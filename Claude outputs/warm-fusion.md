# Warm Fusion Design System — Build Rules

**Activation: Always On.** Every UI you generate MUST follow this system. The tokens and component classes live in `@warm-fusion.css` — import that file once and build with its classes and CSS variables. Never hardcode a colour, font, radius, or shadow that a token already defines.

## The one-line identity
Warm, human, confident. Cream and forest with a single terracotta accent, carried on a **neo-brutalist backbone**: every raised object has a `2.5px` forest border and a **hard, un-blurred offset shadow**, with softened (not sharp) corners. It should feel crafted and safe, never cold, never toy.

## Fonts (add to <head>)
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700&family=Instrument+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap">
```
- **Bricolage Grotesque** → display/headlines/titles/quotes only (use `.wf-display/.wf-h1..h4`). Never body text.
- **Instrument Sans** → all body & UI text.
- **Space Mono** → labels, code, prompts, counts, meta (use `.wf-label`, `.wf-mono`). The credibility accent — use sparingly, uppercase, letter-spaced.

## Colour rules
- Ground = cream `--wf-ground`. Cards = white `--wf-surface`. Ink/borders/dark panels = forest `--wf-forest`. Never use pure `#000`/`#fff` as the mood.
- **Terracotta `--wf-terra` is the ONE accent** — primary buttons and emphasis only. Do not spray it.
- **Category pastels** (`--wf-lime/sky/pink/peach`) only tag or mark sections (chips, icon tiles). Never large fills, never CTAs.
- **Semantic colours** (`--wf-success/warning/error/info`) are separate from the accent — a green is never a call-to-action.
- Neutrals are warm-biased; never a dead grey.

## Structure rules (the bone)
- Every raised object: `border:var(--wf-bw) solid var(--wf-border)` + a hard offset shadow (`--wf-shadow-sm` / `--wf-shadow` / `--wf-shadow-lg`). **No blurry soft shadows, ever.**
- Corners softened via `--wf-r-*` radius tokens (never sharp 0, never fully round bubbles).
- Buttons use the press interaction already in `.wf-btn`: hover lifts, `:active` slams the shadow to 0.
- Spacing on the 4px scale (`--wf-s1..s11`). Keep running text ~65ch wide.

## Icons — Phosphor only. NO EMOJI, EVER.
- Use **Phosphor Icons** (`@phosphor-icons/react` for React, or the Phosphor web font / inline SVG for plain HTML).
- Weight: **Regular** for inline UI; **Bold** for section/beat headers (to match the chunky borders); **Fill** for active/selected states.
- Icons take `currentColor` from tokens; sizes 16 / 20 / 24 only. Never use an emoji as a UI element or section marker.

## Components (use these classes from @warm-fusion.css)
- Buttons: `.wf-btn` (+ `--secondary`, `--tertiary`, `--lg`, `[disabled]`)
- Cards / panels: `.wf-card` (+ `--hover`), `.wf-panel`, `.wf-panel-dark`
- Chips/tags: `.wf-chip` (+ `--sky/pink/peach/lime`), `.wf-status`
- Section/feature icon markers: `.wf-tile` (pastel bg + border + shadow, Phosphor icon inside)
- Inputs: `.wf-field` + `.wf-field-label` + `.wf-input`
- Callouts: `.wf-callout` (+ `--insight/tip/watch/success/error`) with `.wf-callout__title`
- Mastery badges: `.wf-badge` + `.wf-badge__coin`
- Type: `.wf-display`, `.wf-h1..h4`, `.wf-lead`, `.wf-label`, `.wf-accent`

## Guardrails (do / don't)
- ✓ Confidence over cuteness — no cartoon mascots, no confetti storms, no candy colours.
- ✓ Three steps or less to any action; the primary CTA is obvious.
- ✓ Accessible: forest-on-cream/white pass AA; small terracotta text uses `--wf-terra-deep`; white on terracotta for buttons; add focus states; respect `prefers-reduced-motion`.
- ✗ No emoji in UI. ✗ No blurry shadows. ✗ No Bricolage in body. ✗ No terracotta spam. ✗ No pastel CTAs.
- Isometric illustration is allowed ONLY for large hero/empty-state moments, drawn in-palette (cream/forest/terra) with forest outlines — never as small UI icons.

## Motion
- Subtle, tokened: `--wf-dur` / `--wf-ease`. The signature move is the button press. No gratuitous animation.

When in doubt, prefer boring-but-consistent over clever. Consistency IS the product here.
