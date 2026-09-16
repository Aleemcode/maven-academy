# Stitch UI Mastery: Zero-Design to High-End Interfaces
**Course Track:** Track 2 — Generative UI & Visual Interface Design with Stitch  
**Target Learner:** Beginners with zero design background and zero development knowledge  
**Objective:** Master Google Stitch to create stunning, modern, production-grade user interfaces using plain English prompts, and prepare them for handoff to Claude and Antigravity.

---

# Course Curriculum Outline

| Module / Lesson | Title | Core Skill Acquired |
|---|---|---|
| **Module 1** | **The Non-Designer's Eye: How Great UI Actually Works** |
| Lesson 1.1 | The "Amateur vs. Pro" Difference | Spotting clutter, contrast issues, and awkward spacing without a design degree. |
| Lesson 1.2 | The 3 Golden Rules: Whitespace, Hierarchy, & The 60-30-10 Rule | Instant rules of thumb that guarantee clean, balanced screens every time. |
| **Module 2** | **Mastering the Stitch Canvas & Prompt Engineering** |
| Lesson 2.1 | Anatomy of a Perfect Stitch Prompt | The 5-part prompt architecture (Role, Structure, Atmosphere, Components, Realistic Content). |
| Lesson 2.2 | The Master Prompt Formulas | Copy-paste formulas for SaaS Dashboards, Landing Pages, Mobile Apps, and Portals. |
| **Module 3** | **Component Building & Layout Architecture** |
| Lesson 3.1 | Building the Core Skeleton: Navbars, Hero Sections & Footers | Creating cohesive header navigation and high-impact hero sections that convert. |
| Lesson 3.2 | Data Displays: Stat Cards, Tables, and Charts | Designing dense data cleanly with subtle cards, badges, and visual anchor points. |
| Lesson 3.3 | Interactive Surfaces: Modals, Drawers, and Forms | Designing frictionless inputs, buttons, and state indicators. |
| **Module 4** | **Aesthetics, Dark Mode & The Maven Touch** |
| Lesson 4.1 | Dark Mode Done Right: Obsidian, Slate, and Glass | Avoiding harsh pure black `#000000` and crafting rich obsidian depth. |
| Lesson 4.2 | The 1-Accent Rule (Maven Gold & High-End Accents) | How single-accent discipline elevates an app from toy to enterprise-grade. |
| **Module 5** | **Iterating, Remixing & Fixing Bad Generations** |
| Lesson 5.1 | The "Prune & Polish" Technique | What to do when Stitch gives you a cluttered or chaotic output. |
| Lesson 5.2 | Responsive Thinking: Mobile vs. Desktop | Guiding Stitch to adapt layouts for mobile viewports effortlessly. |
| **Module 6** | **The Handoff: Stitch → Claude & Antigravity** |
| Lesson 6.1 | Translating Stitch Designs into Product Specs (PRD) | Turning visual components into clear functional instructions for Claude. |
| Lesson 6.2 | Autonomous Code Generation in Antigravity | Feeding Stitch designs to Antigravity to build live, responsive React apps. |

---

# Curated Video Tutorials & Walkthroughs

Here are the top-rated video tutorials on Google Stitch to watch alongside these modules:

1. **"Vibe Design First, THEN Build Apps: Google Stitch Full Tutorial"**
   - **Focus:** The exact "Design-First" agentic workflow: starting on Stitch's infinite canvas, generating screens from text, linking interactive user flows, and exporting clean code for AI coding agents.
   - **Best for:** Modules 2, 3, and 6.

2. **"How to Use Google Stitch: Complete Tutorial for Beginners"**
   - **Focus:** Absolute beginner walkthrough. Covers navigation of `stitch.withgoogle.com`, Standard Mode vs. Experimental Mode, and prompt structure for first-time builders.
   - **Best for:** Module 1 & Module 2.

3. **"Google Stitch Tutorial: How to Design a Mobile App with AI in Minutes"**
   - **Focus:** Hands-on mobile design project from start to finish. Shows live prompt tweaks, fixing awkward layouts, swapping components, and exporting to Figma/code.
   - **Best for:** Module 3 & Module 5.

4. **"Google Stitch Just Changed Web Design Forever"**
   - **Focus:** High-level overview of generative UI, the evolution of "Vibe Design", and how Stitch connects to the broader AI builder ecosystem via MCP (Model Context Protocol).
   - **Best for:** Introductory mindset and course orientation.

---

# Detailed Lessons Content

---

## MODULE 1: THE NON-DESIGNER'S EYE: HOW GREAT UI ACTUALLY WORKS

### Lesson 1.1: The "Amateur vs. Pro" Difference

#### Why Most Non-Designers Struggle
When people with zero design experience try to create an interface, they usually make one of three fatal mistakes:
1. **The Blank Space Panic:** They feel empty space is wasted space, so they cram every corner with buttons, boxes, text, and borders.
2. **The Color Carnival:** They use 5 to 7 different vibrant colors without realizing it creates visual noise and exhausts the user's brain.
3. **No Clear Focal Point:** Everything has the same font size and weight. The user's eye doesn't know where to look first.

#### The Professional Mental Model: "Visual Gravity"
A great interface behaves like a well-organized physical desk:
- **Level 1 (The Canvas):** The quiet desk surface (Background).
- **Level 2 (The Notepads/Laptops):** Distinct organized areas (Cards & Panels).
- **Level 3 (The Action):** The single brightly colored pen you pick up to sign your name (The Primary Call-To-Action Button).

```
+-----------------------------------------------------------+
| Canvas Level 1 (Quiet Background, e.g. #0B0D13)           |
|                                                           |
|   +---------------------------------------------------+   |
|   | Card Level 2 (Surface Container, e.g. #131620)    |   |
|   |   Title (Bold, High Contrast, 24px)               |   |
|   |   Description text (Muted, 14px, #94A3B8)         |   |
|   |                                                   |   |
|   |   +-----------------------+                       |   |
|   |   | [ Get Started ] Level 3 (Accent: Gold/Brand)  |   |
|   |   +-----------------------+                       |   |
|   +---------------------------------------------------+   |
+-----------------------------------------------------------+
```

#### Key Takeaways:
- UI design is not about drawing or being artistic; it is about **ordering information clearly**.
- If everything is shouting for attention, nothing is heard. Choose ONE primary action per screen.

---

### Lesson 1.2: The 3 Golden Rules: Whitespace, Hierarchy, & The 60-30-10 Rule

#### Rule 1: Whitespace is Not Empty Space — It's Breathing Room
- Give elements room to breathe. When in doubt, double the padding.
- Group related items closely together (e.g. an icon and its title); leave wide gaps between unrelated sections.

#### Rule 2: Visual Hierarchy (The 3-Size Typography System)
Never use more than 3 text styles on a standard card:
1. **Title / Metric:** Large, bold, pure high contrast (e.g. 24px-32px, Crisp White).
2. **Body / Description:** Medium, regular weight, soft neutral (e.g. 14px-16px, Slate/Gray).
3. **Label / Micro-copy:** Small, uppercase or subtle, muted (e.g. 11px-12px, Muted Slate).

#### Rule 3: The 60-30-10 Color Rule
This rule guarantees an interface looks balanced:
- **60% Dominant Background:** Neutral canvas (Deep Obsidian `#0B0D13` or Crisp Off-White).
- **30% Secondary Surfaces:** Card panels, sidebars, borders, input fields (`#141824`).
- **10% Accent Color:** Reserved strictly for primary action buttons, active navigation indicators, and key metrics (`#C9A96E` Gold or Royal Blue).

#### Action Challenge 1:
Open any app on your phone (e.g., Airbnb, Linear, or Apple Health). Identify:
1. What represents the 60% background?
2. What represents the 30% card surface?
3. What is the single 10% accent color? Notice how sparingly it is used.

---

## MODULE 2: MASTERING THE STITCH CANVAS & PROMPT ENGINEERING

### Lesson 2.1: Anatomy of a Perfect Stitch Prompt

Stitch is an AI-powered generative UI engine. If you give it a lazy prompt like:
> *"Make me a dashboard for a gym"*

Stitch will guess the layout, colors, features, and typography. The result will look generic and cluttered.

To get elite, agency-quality results, use the **5-Part Stitch Prompt Architecture**:

```
[PART 1: ROLE & SCREEN TYPE]
"Design a modern, high-end web application screen for [Product Name / Type]..."

[PART 2: LAYOUT & GRID ARCHITECTURE]
"Layout: Left collapsible navigation sidebar (240px width), top minimalist search header, 
and a main content area organized into a 3-column metric card grid above a 2-column detailed view..."

[PART 3: COLOR SYSTEM & MOOD]
"Atmosphere: Premium dark mode. 
Canvas background: Deep obsidian (#0B0D13). 
Card surfaces: Glassmorphic dark slate (#131622) with subtle 1px border (#23293D). 
Accent color: Warm Maven Gold (#C9A96E) used strictly on active tabs, metric badges, and the primary action button. 
Typography: Clean, modern sans-serif with high contrast white headings and muted slate subtext..."

[PART 4: COMPONENT BREAKDOWN]
"Key Components to include:
1. Top Bar: Search input with subtle keyboard shortcut indicator (Cmd+K), notification bell, and user avatar.
2. Metric Cards: 3 stats showing 'Total Revenue ($48,250)', 'Active Subscribers (1,420)', and 'Churn Rate (1.2%)', each with mini trend pill indicators (+12% in gold).
3. Main Panel: Recent transactions data table with status badges (Completed, Pending, Refunded).
4. Secondary Panel: A minimalist line-chart graph showing weekly revenue flow..."

[PART 5: REALISTIC DATA & MICRO-COPY]
"Content: Use realistic SaaS metrics and human names (e.g. 'Sarah Jenkins', 'Alex Rivera'). 
Avoid lorem ipsum placeholder text. Include micro-copy like 'Updated 2 minutes ago'..."
```

---

### Lesson 2.2: The Master Prompt Formulas

Here are 3 production-ready, copy-paste Stitch prompt templates for the most common digital products.

#### Formula A: The High-Converting B2B SaaS Landing Page
```markdown
Design an ultra-clean, high-converting desktop landing page hero and feature section for an AI automation tool called "NexusAI".

- Atmosphere: Modern dark mode with subtle radial ambient glow in the center. Background: #0A0C10. Card backgrounds: #12151E with crisp 1px borders. Accent: Electric Indigo (#6366F1).
- Header: Minimalist floating glass navbar with logo, 4 text links (Features, Solutions, Pricing, Docs), a "Sign In" link, and a glowing "Start Free Trial" pill button.
- Hero Section: 
  * Pill badge at the top: "✨ Powered by Next-Gen Agentic Models"
  * Large, bold headline: "Automate Your Workflow Without Writing a Single Line of Code"
  * Sub-headline: "Empower your team to deploy intelligent agents that handle support, research, and data extraction in minutes."
  * Dual CTA: Primary button "Get Started Free" + Secondary button with play icon "Watch 2-min Demo".
- Social Proof: "Trusted by 10,000+ builders at" followed by 5 grayscale logo place-markers.
- Product Preview Card: An interactive-looking mock dashboard showing an active workflow node graph with connected triggers and actions.
```

#### Formula B: The Executive Analytics & Management Dashboard
```markdown
Design an executive analytics dashboard for a luxury e-commerce brand called "Atelier Noir".

- Atmosphere: Premium obsidian and warm gold theme. Background #090A0F, card panels #11141D with 1px gold-tinted borders (rgba(201, 169, 110, 0.18)). Accent color: Warm Champagne Gold (#C9A96E).
- Layout: 
  * Left sidebar with brand monogram, navigation items (Overview, Analytics, Orders, Customers, Settings) with subtle hover highlights.
  * Top navigation with date range picker ("Last 30 Days"), export button, and profile menu.
- Metric Grid (4 columns):
  1. Gross Merchandise Value: $384,920 (+18.4% vs last month)
  2. Average Order Value: $245.00 (+4.1%)
  3. Total Customers: 4,891 (+312 new)
  4. Return Rate: 1.8% (-0.4%)
- Main Section (2:1 split):
  * Left side (65% width): Sales revenue area chart with smooth curves and hover tooltip.
  * Right side (35% width): "Top Performing Products" list with miniature product thumbnails, inventory count, and revenue contribution.
```

#### Formula C: The Mobile-First Onboarding & Setup Flow
```markdown
Design a mobile-first (390px width) user onboarding screen for a personal finance and AI wealth assistant called "Aura".

- Atmosphere: Dark minimal slate (#0D1117) with emerald green accent (#10B981) for financial growth indicators.
- Structure:
  * Top: Step progress indicator (Step 2 of 4) with a clean segmented progress bar.
  * Heading: "What is your primary financial goal?"
  * Subtitle: "Aura will customize your automated saving and investment agents based on your choice."
  * Option Cards (Vertical stack of 4 cards):
    1. Card 1: "Build an Emergency Cushion" with shield icon.
    2. Card 2: "Save for a Major Purchase (House/Car)" with target icon.
    3. Card 3: "Accelerate Long-term Wealth & Investments" (Selected state: glowing green border, checkmark icon).
    4. Card 4: "Eliminate High-Interest Debt" with graph-down icon.
  * Bottom Sticky Footer: Large full-width button "Continue" with subtle arrow icon. "You can change this anytime in Settings."
```

---

## MODULE 3: COMPONENT BUILDING & LAYOUT ARCHITECTURE

### Lesson 3.1: Building the Core Skeleton: Navbars, Hero Sections & Footers

Every professional web application is built on predictable skeletal blocks.

#### 1. The Floating Glass Navbar
A modern navbar should never be a thick, opaque block stuck to the top.
- Make it a **floating pill or translucent bar** with `backdrop-filter: blur(12px)`.
- Keep links concise (maximum 4-5 navigation items).
- Put user profile or primary action on the far right.

#### 2. The High-Converting Hero Section
The hero section has exactly 5 seconds to answer 3 questions:
1. *What is this?* (Clear headline, no clever jargon).
2. *Why do I care?* (One sentence subtext explaining the immediate benefit).
3. *What do I do next?* (High-contrast CTA button).

#### Stitch Prompt Snippet for Hero Sections:
> *"Create a hero section with a centered layout. Headline should be high-contrast bold white at 48px, followed by a 16px muted subtitle with max-width of 600px. Below the subtitle, place a horizontal button group: one solid gold primary button with an arrow icon, and one ghost button with a video play icon. Add 48px padding on top and bottom."*

---

### Lesson 3.2: Data Displays: Stat Cards, Tables, and Charts

Displaying data is where beginner designs turn messy. Here is how to prompt Stitch for clean data:

#### The Anatomy of a Perfect Stat Card:
```
+--------------------------------------------------+
|  [Icon] Monthly Recurring Revenue       [+14.2%] |  <-- Label & Trend Pill
|  $124,500                                        |  <-- Main Number (Huge & Bold)
|  vs. $109,000 last month                         |  <-- Comparison Subtext (Muted)
+--------------------------------------------------+
```

#### Prompting Data Tables in Stitch:
Tables often become unreadable on smaller screens. Use these constraints in Stitch:
- *"Include alternating row hover states (subtle white tint of 2%)."*
- *"Align numbers to the right and text labels to the left."*
- *"Use status pills (e.g. green pill with dot for 'Active', yellow pill for 'In Review', gray for 'Archived') instead of plain text status."*

---

### Lesson 3.3: Interactive Surfaces: Modals, Drawers, and Forms

When users need to take an action (add item, edit settings, submit feedback), use dedicated overlay surfaces.

#### Form Input Best Practices in Stitch:
- Labels placed **above** inputs, never inside as placeholders only (placeholders disappear once you type!).
- Inputs with dark backgrounds (`#161B26`), 1px neutral borders, and an active focus ring in the accent color.
- Clear action buttons at the bottom: Cancel (Ghost button) on the left, Confirm (Accent button) on the right.

---

## MODULE 4: AESTHETICS, DARK MODE & THE MAVEN TOUCH

### Lesson 4.1: Dark Mode Done Right: Obsidian, Slate, and Glass

#### Why Beginners Fail at Dark Mode:
Beginners set background to `#000000` and text to `#FFFFFF`. This causes:
- Harsh contrast that causes eye strain (halation effect).
- Complete loss of depth: you cannot create shadows or layers on pure black.

#### The Maven 4-Tone Depth Formula:
```
Level 0: Background Canvas  --> #0B0D13 (Obsidian Navy)
Level 1: Sidebar / Surface  --> #10131C (Slightly lighter dark)
Level 2: Cards & Panels     --> #161A26 (Card surface)
Level 3: Inputs & Popovers  --> #1C2130 (Elevated surface)
Borders:                    --> rgba(255, 255, 255, 0.08) (Delicate 1px outline)
```

#### How to prompt this in Stitch:
> *"Use an obsidian dark theme. Background should be deep navy-tinted charcoal (#0B0D13). Cards must have a 1px soft border (rgba(255,255,255,0.08)) and a gentle backdrop blur effect. Avoid pure black #000000."*

---

### Lesson 4.2: The 1-Accent Rule (Maven Gold & High-End Accents)

Luxury brands (Rolex, Apple Pro line, Linear, Stripe) all follow the **Single Accent Principle**:
- 90% of the screen is monochrome (whites, greys, deep darks).
- Exactly ONE color is used to signify importance.
- If you use **Maven Gold (`#C9A96E`)**, use it ONLY for:
  1. The primary button.
  2. Active tab indicator.
  3. Key positive metric highlight.
  4. Subtle logo/monogram touch.

Everything else stays neutral. This immediately makes any app look like it cost $50,000 to design.

---

## MODULE 5: ITERATING, REMIXING & FIXING BAD GENERATIONS

### Lesson 5.1: The "Prune & Polish" Technique

When Stitch generates a screen, it might include elements you didn't want or crowd things together. **Do not start over from scratch!** Use surgical revision prompts.

#### Revision Prompt Playbook:

| Problem | Bad Fix Prompt | The Professional Fix Prompt |
|---|---|---|
| **Too Cluttered** | *"Make it simpler"* | *"Prune this layout: remove the 3 bottom promo banners. Increase spacing between cards from 12px to 24px. Let the central table breathe."* |
| **Colors are Clashing** | *"Fix the colors"* | *"Normalize the color palette to our dark obsidian theme: make all card backgrounds #141824, replace all random colored icons with muted gray, and keep only the primary CTA button in gold #C9A96E."* |
| **Fonts Look Sloppy** | *"Change fonts"* | *"Standardize typography: use Inter sans-serif across all elements. Make all card titles 16px semibold white, and all supporting text 13px muted slate #94A3B8."* |
| **Table is Squished** | *"Fix table"* | *"Convert this dense table into a clean card list with 16px vertical padding per row, right-aligned monetary values, and rounded status badges."* |

---

### Lesson 5.2: Responsive Thinking: Mobile vs. Desktop

A great builder creates interfaces that work on both phones and laptops.

#### How to tell Stitch to adapt for Mobile:
1. **Column Collapse:** *"On mobile screens, collapse the 3-column metric cards into a single swipeable carousel or a vertical stack."*
2. **Bottom Navigation:** *"Replace the desktop left sidebar with a sticky bottom navigation bar containing 4 icons (Home, Analytics, Orders, Profile)."*
3. **Full-Width Touch Targets:** *"Ensure all buttons on mobile are full width (100%) with a minimum touch height of 48px for comfortable thumb tapping."*

---

## MODULE 6: THE HANDOFF: STITCH → CLAUDE & ANTIGRAVITY

### Lesson 6.1: Translating Stitch Designs into Product Specs (PRD)

Once you have a Stitch screen you love, how do you turn it into a real, functioning software app? **You introduce Claude.**

You take your Stitch UI and describe the components to Claude to generate a **Product Requirements Document (PRD)**.

#### The Stitch-to-Claude Handoff Prompt:
```markdown
"Claude, I have finalized the UI design in Stitch for our new application '[App Name]'. 
Here is the visual component breakdown from my Stitch canvas:

1. Screen Type: Executive Dashboard.
2. Layout: 240px Left Navigation Bar + Top Search Bar + 3 Metric Cards + 1 Line Chart + 1 Transactions Table.
3. Color Theme: Obsidian dark mode (#0B0D13) with Maven Gold (#C9A96E) accents.
4. Key Interactive Elements:
   - Clicking 'New Transaction' button opens a modal form.
   - Selecting a date range in the top bar filters the chart and table data.
   - Status filters (All, Completed, Pending).

Please act as my Senior Product Architect. Write a complete, zero-fluff Product Requirements Document (PRD) and component architecture that I can hand directly to Antigravity to build as a React + Tailwind CSS web application."
```

---

### Lesson 6.2: Autonomous Code Generation in Antigravity

Now that Claude has created the PRD from your Stitch design, you bring in **Google Antigravity** to execute the code.

#### The Antigravity Builder Prompt:
```markdown
"Antigravity, review the attached PRD and UI specifications derived from our Stitch prototype. 
Build a production-ready, responsive React application matching this exact UI design:
- Use Tailwind CSS with our Maven Obsidian theme (background #0B0D13, cards #131620, gold accents #C9A96E).
- Use Lucide React icons for the navigation and actions.
- Implement working interactive states: modal open/close, search filtering, and tab switching.
- Verify the build with zero compilation errors."
```

With this 3-step pipeline:
1. **Stitch** handles the visual eye candy.
2. **Claude** handles the product logic and specifications.
3. **Antigravity** writes the code, installs packages, tests the app, and brings it to life.

You have now become an **AI Builder with zero design knowledge and zero development knowledge**.

---

# Practice Projects & Exercises

### Exercise 1: The Personal Portfolio for Non-Designers
- **Prompt Goal:** Use Stitch to create a modern 1-page portfolio showcasing your new AI Builder identity.
- **Requirements:** Hero with headshot/avatar placeholder, "My AI Builder Stack" (Stitch, Claude, Antigravity cards), and a 2-column grid of projects.

### Exercise 2: The Micro-SaaS CRM
- **Prompt Goal:** Use Stitch to generate a lead management CRM dashboard for real estate agents.
- **Requirements:** 4 metric cards (Active Leads, Deals Closed, Commission Earned, Follow-ups Due), pipeline kanban board, and a contact detail drawer.

### Exercise 3: The Mobile AI Workout Tracker
- **Prompt Goal:** Use Stitch to design a dark mode mobile screen for logging daily workouts.
- **Requirements:** Calendar week strip at top, workout split card (Chest & Triceps), exercise list with checkmarks, and a big gold "Start Workout" button.
