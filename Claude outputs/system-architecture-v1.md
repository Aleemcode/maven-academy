# System Architecture v1 — Maven Builder Academy
**Status:** Traced to PRD (Stage 2 of 5)  
**Core Stack:** React / Next.js (PWA) · Supabase (Postgres + RLS + Auth + Storage) · Edge Functions · Paystack (NG/Africa) & Stripe (Global) · Offline-First Cache

---

## 01. The Four Layers: What Runs Where

Content renders from the client instantly (cached); the account owns the truth in Postgres; privileged writes happen only in Edge Functions; money and mail are external. (Maps to AD-1, AD-2, AD-4).

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 💻 CLIENT · WARM FUSION WEB APP (REACT / NEXT.JS · PWA)                                │
├──────────────────┬───────────────────┬────────────────────┬────────────────────────────┤
│ Lesson Player    │ Playground        │ Path Navigator     │ Offline Cache              │
│ (Learn-Dilemma-  │ (Recipes +        │ (Progress · Resume)│ (Content + Queued Writes)  │
│  Build-Apply)    │  Variables)       │                    │                            │
└──────────────────┴───────────────────┴────────────────────┴────────────────────────────┘
                        ▲ reads cache instantly · syncs when online ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ ⚡ EDGE FUNCTIONS (PRIVILEGED, SERVER-SIDE)                                            │
├───────────────────────────────┬───────────────────────────────┬────────────────────────┤
│ Payment Webhook               │ Entitlement Writes            │ Magic-Link Trigger     │
│ (Verify → Grant Access)       │ (Service-Role Only)           │ (Auth Email)           │
└───────────────────────────────┴───────────────────────────────┴────────────────────────┘
                                              ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 🗄️ SUPABASE CORE                                                                       │
├───────────────────────────────┬───────────────────────────────┬────────────────────────┤
│ Postgres + RLS                │ Auth                          │ Storage                │
│ (Source of Truth)             │ (Magic Link)                  │ (Assets · Portfolio)   │
├───────────────────────────────┴───────────────────────────────┴────────────────────────┤
│ Realtime (Optional)                                                                    │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                              ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 🌐 EXTERNAL SERVICES                                                                   │
├───────────────────┬───────────────────┬───────────────────┬──────────────┬─────────────┤
│ Paystack          │ Stripe            │ Email             │ CDN          │ Live        │
│ (Nigeria / Africa)│ (Global)          │ (Magic-Link)      │ (Content +   │ (Zoom /     │
│                   │                   │                   │  Assets)     │  Meet)      │
└───────────────────┴───────────────────┴───────────────────┴──────────────┴─────────────┘
```

---

## 02. Data Model: Two Worlds (Shared Content vs. Private User Data)

Content is authored once and read by everyone (some gated by entitlement). User data is fenced per-account by Row Level Security (RLS) — the database itself refuses cross-user reads. (Maps to AD-3, FR-I1, FR-H3).

### A. Content (Authored, Shared, Read-Mostly)

| Table | Requirements Ref | Schema Fields |
| :--- | :--- | :--- |
| `tracks` | `FR-B1` | `id`, `slug`, `title`, `order`, `summary`, `est_time` |
| `lessons` | `FR-C1` | `id`, `track_id -> tracks.id`, `slug`, `title`, `order`, `body (Learn/Build/Apply)`, `status` |
| `recipes` | `FR-D1 / I2` | `id`, `slug`, `tool_role`, `template`, `variables[]`, `last_verified_at` |
| `dilemmas` | `FR-C3` | `id`, `lesson_id -> lessons.id`, `question`, `options[]`, `correct`, `principle`, `why` |
| `badges` | `FR-E2` | `id`, `slug`, `title`, `criteria`, `spot_art_ref` |
| `live_sessions` | `END-OF-TRACK` | `id`, `track_id -> tracks.id`, `scheduled_at`, `join_url`, `replay_url (optional)` |

> **Pedagogical Note on Live Sessions:**  
> **No Recorded Video — A Live Walkthrough Per Track.**  
> Learn by doing, not by watching, holds all the way down. Instead of canned module videos, each track ends with a **live session** where the founder builds something in front of the class — human, never-dating, interactive. It's a scheduled event (`join_url` at a time), not built-in streaming infrastructure; an optional `replay_url` can hold a recording later. It never gates progression — it's the reward for finishing the track.

---

### B. User Data · RLS-Fenced (`auth.uid() = user_id`)

| Table | Requirements Ref | Schema Fields |
| :--- | :--- | :--- |
| `profiles` | `FR-H1` | `id -> auth.users.id`, `display_name`, `intent` (what they want to build) |
| `entitlements` | `FR-H2` | `user_id -> auth.users.id`, `status: free \| paid`, `granted_at`, `source` |
| `purchases` | `FR-H4` | `id`, `user_id -> auth.users.id`, `provider` (Paystack/Stripe), `provider_ref`, `amount`, `currency`, `status` |
| `progress` | `FR-B3 / H3` | `user_id ->`, `lesson_id ->`, `status`, `xp`, `updated_at` |
| `saved_recipes` | `FR-D4` | `user_id ->`, `recipe_id ->`, `filled_vars (jsonb)` |
| `lesson_notes` | `FR-C5` | `user_id ->`, `lesson_id ->`, `body` |
| `portfolio_items` | `FR-F1 · V1.1` | `id`, `user_id ->`, `title`, `live_url`, `repo_url`, `badge`, `created` |
| `user_badges` | `FR-E2 · V1.1` | `user_id ->`, `badge_id ->`, `earned_at` |
| `events` | `AD-5` | `user_id ->`, `name`, `props (jsonb)`, `created_at` |

---

## 03. Critical Flows: The Four Paths That Must Never Break

### 1. Free → Paid Purchase (`FR-H2/H4 · EC-7,8`)
1. **Checkout:** Client opens Paystack (NG) or Stripe (global).
2. **Payment:** Provider charges the card — never touches your server.
3. **Webhook:** Edge Function verifies the signature.
4. **Entitlement Flip:** Writes purchase + flips entitlement to `paid`.
5. **Unlock:** Client re-checks — paid content unlocks immediately. Free work preserved.

### 2. Offline-First Progress Sync (`FR-H3 · EC-1,2`)
1. **Render from Cache:** Zero flicker, works offline immediately.
2. **Optimistic Action:** Optimistic local update + queue the write.
3. **Reconnect:** Flush the queued writes to Postgres.
4. **Postgres is Truth:** Last-write-wins per lesson; nothing lost.

### 3. Gated Content (`FR-H2 / AD-4`)
Paid lessons are served only when an entitlement check passes — enforced securely in the database (Postgres RLS), not bypassed in client browser code.

### 4. Recipe Update Pipeline (`FR-I2 / EC-3`)
Edit a `recipes` row + bump `last_verified_at`; every lesson referencing that recipe updates automatically. No lesson prose or markdown files need manual editing.

---

## 04. Security · Row-Level Security (RLS)

> **"The database is the bouncer, not the app."**

The classic mistake is letting the frontend decide who sees what — one bug and data leaks. RLS pushes the rule *into Postgres itself*: every query is filtered by the logged-in user automatically. Even a compromised client can't read another learner's data. Maps to `FR-H2`, `EC-11`.

### One Policy, Plain English → Real SQL
*"A learner may only read and write rows that belong to them."*

```sql
-- on the progress table
create policy "own rows only"
  on progress for all
  using ( auth.uid() = user_id );
```

Content tables (`tracks`, `lessons`) get a read-all policy — or a gated one that checks entitlement for paid lessons. Only Edge Functions hold the `service_role` key that can write entitlements, so payment is the only path to access.

### ✓ Security Surface, Minimized
Payments offloaded (no card data) + RLS (no app-side access logic to get wrong) + magic-link (no password database to breach) means your attack surface is small and mostly handled by the platform. That's the whole point of choosing boring-managed.

---

## 05. The Platform Seam (Built So the Platform Harvests, Not Rebuilds)

No tenancy is built now — but the model is shaped so adding it later is additive, not a rewrite. Maps to `AD-6`, `GOAL 4`.

```
┌─────────────────────────────────────────┐  ┌ - - - - - - - - - - - - - - - - - - - - -┐
│ V1 · NOW                                │    V2 · PLATFORM (LATER)                    
│                                         │                                             │
│ Content tables have an implicit single  │  │ Add an `org_id` to content + a tenant    │
│ owner (you). One course, one brand.     │    dimension to RLS. Existing rows backfill │
│ Nothing multi-tenant is written.        │  │ to your org. Your two saved tastes       │
│                                         │    become theme presets. The course you     │
│                                         │  │ built is the demo.                       │
└─────────────────────────────────────────┘  └ - - - - - - - - - - - - - - - - - - - - -┘
```

---

## 06. Traceability: Every Architecture Decision, Satisfied

| PRD Decision | How the Architecture Satisfies It |
| :--- | :--- |
| **AD-1 offline-first + cloud truth** | Client cache renders instantly; Postgres owns state; queue-and-sync flow |
| **AD-2 thin backend required** | Supabase managed core + Edge Functions for privileged logic only |
| **AD-3 content as data** | `tracks` / `lessons` / `recipes` / `dilemmas` tables served to client |
| **AD-4 entitlement server-side** | RLS + entitlement check gates paid content in the DB |
| **AD-5 event layer day one** | `events` table; every metric has a source of truth |
| **AD-6 extractable core** | `org_id` seam ready; RLS extends to tenancy without rewrite |
| **FR-H1..H4 the paid spine** | Auth magic-link, entitlements, purchases, webhook flow |
| **FR-I2 swappable recipes** | `recipes` table + `last_verified_at`, decoupled from lessons |

---

## The Lean: Supabase

It wins the three highest-weight lenses for your situation — **velocity**, **data-fit**, **low ops** — while protecting the platform future (portable Postgres) and shrinking security to access-rules (payments already offloaded). Firebase's one real edge, offline, isn't decisive because your offline lives in the app.

```
┌───────────────────────────────────────┬───────────────────────────────────────┐
│ IDENTITY + ENTITLEMENT                │ MONEY EVENTS                          │
│ Supabase Auth + RLS                   │ Paystack + Stripe → webhook           │
│ magic link; access rules in the DB    │ Edge Function flips entitlement       │
├───────────────────────────────────────┼───────────────────────────────────────┤
│ STATE + CONTENT                       │ EVENTS                                │
│ Postgres tables                       │ An events table / analytics           │
│ progress, portfolio, lessons-as-data  │ the metrics' source of truth          │
└───────────────────────────────────────┴───────────────────────────────────────┘
```

