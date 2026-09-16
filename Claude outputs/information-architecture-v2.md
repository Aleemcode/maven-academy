# Information Architecture v2 — Maven Builder Academy
**Status:** Updated from Stage 3 of 5 with Latest Product Direction & Decisions  
**Key Updates:** Integrated **Prompt Builder** vs. **Taste Trainer** separation, updated from "No Video" to **Synchronized Video + Interactive Guide**, embedded **Prompt & Context Engineering Grilling**, and hardened **Multi-Tenant Foundation**.

---

## 01. The Primary Journey: Stranger → Fearless Builder

Everything else hangs off this spine. The "aha" moment comes before the paywall; the paywall arrives at the peak of conviction; the recurring loop is where taste and prompt fluency compound.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ THE PRIMARY CONVERSION & MASTERY SPINE                                                                 │
├───────────────┬───────────────────┬─────────────────┬───────────────┬───────────────────┬──────────────┤
│ 1. LANDING    │ 2. FREE FIRST     │ 3. UNLOCK       │ 4. DASHBOARD  │ 5. LESSON PLAYER  │ 6. LIVE &    │
│    PAGE       │    BUILD          │    (PAYWALL)    │    & PATH     │    (VIDEO + GUIDE)│    VAULT     │
│ The pitch,    │ "I just built a   │ Paywall at the  │ "You are here"│ Learn · Dilemma · │ End-of-track │
│ proof, canvas │ real app in       │ peak moment     │ track resume  │ Prompt Build ·    │ live build + │
│ & taste demo. │ 10 minutes."      │ (₦20k cohort).  │ & metrics.    │ Apply & Verify.   │ Taste Vault. │
└───────────────┴───────────────────┴─────────────────┴───────────────┴───────────────────┴──────────────┘
```

---

## 02. Screen Inventory: 19 Screens Across 5 Zones

### Zone 1: Public · Marketing (SSR / SEO)
1. **Landing / Sales (`/`)** — Hero canvas brick physics, taste before/after slider, Value Vault perks bento, curriculum preview, pricing, and FAQ.
2. **Curriculum Map (`/curriculum`)** — Public roadmap across all 6 core tracks. Shows the entire transformation before purchasing.
3. **About / Philosophy (`/about`)** — Who is teaching (Aleem), the "Architect vs. Typist" philosophy, and the "Reject the Slop" manifesto.

### Zone 2: Onboarding & Activation (The Hook)
4. **Sign In (`/auth/login`)** — Magic-link entry. One email field, zero passwords.
5. **Intent Capture (`/onboarding`)** — "What do you want to build?" (SaaS tool, client portal, internal automation) — personalizes the learner's track emphasis.
6. **Free First Build (`/preview`)** — The 10-minute guided build. Delivers immediate dopamine and proof that they can direct AI without writing code.
7. **Unlock / Paywall (`/checkout`)** — Conversion moment at the peak of the free build. Direct integration with Paystack (NG/Africa) and Stripe (Global).
8. **Payment Result (`/checkout/result`)** — Instant entitlement verification via webhook, welcome state, and automatic redirect to Track 1.

### Zone 3: App Core · Learn by Doing (The Product)
9. **Dashboard / Path Navigator (`/app`)** — High-level progress map across all 6 tracks, resume button ("Continue Track 1, Lesson 1.2"), daily streak, and XP counter.
10. **Track Overview (`/app/tracks/[slug]`)** — Detailed breakdown of lessons within a track, estimated completion times, and end-of-track live session date.
11. **Interactive Lesson Player (`/app/learn/[track]/[lesson]`)** — **The Core Learning Surface**:
    - **Top:** Track progress bar & lesson switcher.
    - **16:9 Video Stage:** Aleem's recorded screen demonstration & tool walkthrough.
    - **Interactive Technical Guide:** Directly mirrors and reinforces the video with deep architectural notes, vocabulary decoding, and context principles.
    - **The Builder Dilemma:** Interactive prediction scenario with instant visual explanation.
    - **1-Click Senior Prompt Box:** Production-grade prompt with XML tags ready to copy.
    - **Action Challenge Checklist:** Hands-on steps to run and verify in Stitch, Claude, or Antigravity.
12. **The Prompt Builder (`/app/prompt-builder`)** — **[NEW / SEPARATED CORE ENGINE]**:
    - Daily laboratory to practice prompt and context engineering using professional design vocabulary.
    - **Design Lingo Lexicon:** Typography tokens, spatial systems, 12-step Radix color scales, brutalist tactile physics.
    - **Interactive Prompt Synthesizer:** Select Target Tool (Stitch / Claude / Antigravity) + Design Movement + Constraints → generates production XML prompt with 1-click copy.
13. **The Taste Trainer (`/app/taste-trainer`)** — **[NEW / SEPARATED CORE ENGINE]**:
    - **Design Movements Catalog:** Swiss Modernism, Neo-Brutalism, Warm Fusion, Bauhaus, Dark Minimalist.
    - **Living Inspiration Stream:** Curated portfolios and interaction benchmarks (Rauno, Paco, Karpathy, Linear).
    - **Before / After Judgment Drills:** Training the learner's eye to identify and reject AI slop.
14. **Live Track Builds (`/app/live`)** — Schedule and join links (Zoom/Meet) for end-of-track live cohort build sessions, plus optional archive replays.

### Zone 4: App Support & Vaults
15. **Personal Taste Vault (`/app/taste-vault`)** — Student's private aesthetic sanctuary to save bookmarks, teardowns, custom token sets, and design critique notes.
16. **Builder Portfolio (`/app/portfolio`)** — Showcase of projects shipped by the student with live demo URLs and GitHub links.
17. **Achievement Badges (`/app/badges`)** — Milestones earned through shipping and dilemma mastery (e.g. *Stitch Alchemist*, *Context Architect*).

### Zone 5: Account & System Shells
18. **Account Settings (`/app/account`)** — Profile, entitlement tier, data export, and session logout.
19. **System States (`*`)** — Offline banner (queue-sync active), locked lesson modal, 404, error recovery.

---

## 03. Navigation Model: Two Distinct Shells

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. PUBLIC MARKETING SHELL (Top-Nav · Conversion Focused)               │
├────────────────────────────────────────────────────────────────────────┤
│ [Logo: Maven.]         Curriculum   About   Sign In   [Start Free →]   │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│ 2. APP COCKPIT SHELL (Persistent Workspace Cockpit)                    │
├────────────────────────────────────────────────────────────────────────┤
│ TOP BAR: [Logo: Maven.]    Track 1 · 25%   [Prompt Builder]  Account   │
├──────────────────────┬─────────────────────────────────────────────────┤
│ SIDEBAR (The Spine)  │ MAIN WORKSPACE STAGE                            │
│ • Path (Curriculum)  │                                                 │
│   > Lesson 1.2       │ [ 16:9 Video Walkthrough Player ]               │
│ • Prompt Builder     │                                                 │
│ • Taste Trainer      │ [ Interactive Lesson Guide & Dilemma ]          │
│ • Taste Vault        │                                                 │
│ • Portfolio          │ [ Senior XML Prompt Recipe & Action Step ]      │
└──────────────────────┴─────────────────────────────────────────────────┘
```

> **The One Rule That Shapes the Shell:**  
> **The Prompt Builder & Taste Trainer are one tap from everywhere.**  
> They exist as full-screen top-level destinations *and* as slide-over contextual drawers inside every lesson player so students never lose their place while grabbing a recipe or reference.

---

## 04. Access Matrix: Who Sees What (Enforced by Postgres RLS)

| Surface / Tool | Public | Free Account | Paid Founding Cohort |
| :--- | :---: | :---: | :---: |
| **Marketing & Public Curriculum** | ✅ Full | ✅ Full | ✅ Full |
| **Free First Build (`/preview`)** | ❌ (Prompts Login) | ✅ Full Access | ✅ Full Access |
| **Track 1 Lessons** | ❌ | ✅ Taste (Lesson 1.1–1.2) | ✅ Full Access |
| **Tracks 2–6 (Full Video + Guides)** | ❌ | ❌ (Paywall Gate) | ✅ Full Access |
| **The Prompt Builder** | ❌ | 3 Daily Prompts / Basic Vocab | ✅ Unlimited + XML Engine |
| **The Taste Trainer & Taste Vault** | ❌ | Overview Only | ✅ Full Catalog + Private Vault |
| **End-of-Track Live Sessions** | ❌ | ❌ | ✅ Live + Replays |
| **Portfolio & Badges** | ❌ | View Only | ✅ Full Showcase + Submission |
| **Account & Offline Sync** | ❌ | ✅ Own Data | ✅ Own Data |

---

## 05. The Multi-Tenant Seam (Additive Evolution)

```
┌───────────────────────────────────────────┐      ┌───────────────────────────────────────────┐
│ V1: SINGLE TENANT (NOW)                   │      │ V2: MULTI-TENANT (ADDITIVE LATER)         │
├───────────────────────────────────────────┤      ├───────────────────────────────────────────┤
│ • Single implicit organization (`maven`)  │ ───► │ • Explicit `tenant_id` on all content     │
│ • Storage keys: `maven_progress`, etc.    │      │ • Tenant RLS dimension:                   │
│ • One course catalog, one Warm Fusion UI  │      │   `using (tenant_id = current_tenant())`  │
│ • Pure static deployment on Vercel        │      │ • Dynamic domain/subdomain routing        │
└───────────────────────────────────────────┘      └───────────────────────────────────────────┘
```
No schema rewrite will be needed when transitioning to multi-tenant: all database tables and local storage keys are structured with an organizational namespace from Day 1.
