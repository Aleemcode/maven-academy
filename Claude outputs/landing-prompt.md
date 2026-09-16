# Paste this into Antigravity's agent (after adding the rule + CSS)

**Role:** Act as a senior front-end engineer building with an established design system.

**Context:** This project uses the Warm Fusion design system. The build rules are the always-on rule `@warm-fusion.md`, and the tokens + component classes are in `@warm-fusion.css`. Import `warm-fusion.css` once, load the three Google Fonts named in the rule, and build only with the system's tokens, classes, and Phosphor icons. No emoji anywhere.

**Task:** Build a single responsive landing page for "Maven Builder Academy" — the maiden AI-fluency course that takes total beginners to shipping real products. Sections, in order:
1. Sticky top nav — wordmark + links (Curriculum, About, Sign in) + a primary CTA button "Start free".
2. Hero — a Bricolage headline, a lead sub-line, primary + secondary buttons, and a supporting visual card on the right.
3. A marquee/ribbon strip of short feature phrases on a dark (pine/forest) band.
4. "Choose your track" — a responsive grid of 6 track cards, each with a pastel category chip, a Bricolage title, a one-line description, and a Phosphor "arrow" link.
5. "How it works" — 3 numbered steps on dark panels.
6. A testimonial/quote card on a pastel background.
7. Pricing — one-time price card ("Pay once · yours forever · updates included") with a primary CTA.
8. Footer.

**Constraints:**
- Follow `@warm-fusion.md` exactly — border + hard offset shadow on every raised object, terracotta as the only accent, pastels only for tags, Phosphor icons only (Regular inline, Bold on headers), Bricolage for headings only, Instrument for body, Space Mono for labels.
- Fully responsive (mobile-first), accessible (AA contrast, focus states, reduced-motion), semantic HTML.
- Use the existing `.wf-*` component classes; only add new CSS when a component doesn't exist, and build it from tokens.
- Real placeholder copy in the brand's warm, plain-language voice — no lorem.

**Example / reference:** Match the feel of the Warm Fusion screens: cream ground, forest ink, terracotta CTAs, blocky bordered cards with hard shadows, softened corners.

Ask me one clarifying question before you start, then build the full page in one file (or component set), and list which `.wf-*` classes you reused vs any new ones you had to create — so I can check the system held.
