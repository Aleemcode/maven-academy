# Maven Builder Academy: project handoff

Read this first when picking the project up from another Claude account or a fresh session.

## Where things live
- **Code:** GitHub `Aleemcode/maven-academy`, branch `main`. Every push to `main` deploys to production on Vercel (project `maven-academy`) at mavenbuilderacademy.com.ng.
- **Database and login:** Firebase project `maven-academy-eb5fb` (Firestore + Email/Password auth). Moved from Supabase on 15 Nov 2026 after the Supabase project was deleted.
- **Secrets (Vercel → Settings → Environment Variables, never in code or chat):** `FIREBASE_SERVICE_ACCOUNT` (service-account JSON), `PAYSTACK_SECRET_KEY`. `SUPABASE_SERVICE_ROLE_KEY` is left over and no longer used.
- **Public Firebase web config:** `assets/site-config.js` (`window.MAVEN_FIREBASE`). Safe to be public.

## How the app is built
- Static pages plus Vercel functions in `/api` (Node, `firebase-admin`).
- Browser: `app/assets/db.js` gives a small query client (`MAB.sb.from(...).select().eq()`, `MAB.sb.rpc()`, `MAB.sb.auth.*`) that talks to `/api/db` with the student's Firebase ID token.
- `api/db.js` holds every access rule (who can read or change what) and the functions: `my_project`, `claim_project`, `submit_demo`, `set_presented`, `verify_certificate`, `facilitator_overview`, `unclaimed_projects`, `insert_session_after`, `delete_session`, `delete_taste`, `admin_delete_taste`, plus `lab_save` for Lab work. `GET /api/db` is a health check.
- `api/claim.js`: first-time setup (checks Paystack payment, creates the Firebase account). The facilitator email `aakinyoola857@gmail.com` is allowed without payment.
- `api/admin.js`: facilitator actions (add a student, reset a password, sync Paystack).
- `api/lab-boot.js` + `app/lab-bridge.js`: Taste Lab and Prompt Lab inside the app; saved work lives in the `lab_state` collection.
- `api/cohort-feedback.js` + `/feedback` (root `feedback.html`): public end-of-cohort feedback; read in Facilitator → Cohort review.
- Firestore collections: `students` (doc id = email), `cohort_sessions` (doc id = session number), `projects`, `feedback`, `lab_state`, `lab_builds`, `taste_cards`, `cohort_feedback`.

## Key pages
- `/app` home (certificate path + demo submission), `/app/board`, `/app/lab` (Brief · Taste · Output), `/app/learn`, `/app/go-live`, `/app/admin` (Facilitator), `/app/certificate`.
- Certificates: student submits the demo (name for the certificate + live link) → Aleem confirms in Facilitator → certificate unlocks with PDF/image download. Public check: `/verify` and `/verify/<ID>`.
- Certificate content follows the standard agreed on 18 Nov 2026: "Certificate of Completion" and "Verified" (never "certified"), "by Design Maven Studio", dates 24 Oct – 15 Nov 2026, 16 hours, issue date = demo submission date, signer "Founder & Lead Facilitator".

## Running things
- 30-Day Builder Challenge: Day 1 was Mon 16 Nov 2026, Showcase 14–15 Dec. All 30 daily messages: `docs/30-day-builder-challenge.md`. A scheduled task on Aleem's main Claude account sends the day's message at 06:53 Lagos time.
- Brand: Warm Fusion / Maven tokens (cream #F4F0E5, paper #FFFDF7, forest #14261D, terracotta #E8722C fill only, terracotta text #AD4F16, lime #D6E59A); fonts Bricolage Grotesque, Instrument Sans, Space Mono, Caveat.
- Guardrails: dropdowns use a custom chevron inset from the right edge (never the browser's flush arrow); no music in videos (sound effects only); agree flyer concepts and copy before designing.

## Open ideas, not built yet
- Challenge tab in the portal (student tick-offs, streaks, facilitator progress grid).
- Landing page redesign featuring Cohort 1 student projects and consented testimonials ("Feature on the website" flag in Cohort review).
- Cohort 2: self-paced recorded lessons + 4 live Saturdays; a paid weekend "build your design agent" workshop as the entry offer. Start date and price still to be decided.
