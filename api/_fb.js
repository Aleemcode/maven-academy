// Shared server helpers for the student app (Firebase). Files starting with "_" are not routes on Vercel.
//
// Vercel → Project (maven-academy) → Settings → Environment Variables:
//   FIREBASE_SERVICE_ACCOUNT  (required) the whole service-account JSON from Firebase → Project settings →
//                             Service accounts → Generate new private key. Server-side only.
//   PAYSTACK_SECRET_KEY       (already set) used to confirm a student paid before their account is created.
//   COHORT_OPENS / SEAT_MIN_KOBO / PAYSTACK_PAGE_SLUGS  shared with /api/seats.

const admin = require("firebase-admin");

const FACILITATOR = "aakinyoola857@gmail.com";

function fb() {
  if (admin.apps.length) return admin.app();
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return null;
  const sa = JSON.parse(raw);
  return admin.initializeApp({ credential: admin.credential.cert(sa) });
}
const ready = () => !!fb();
const db = () => { fb(); return admin.firestore(); };
const auth = () => { fb(); return admin.auth(); };

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") { try { return JSON.parse(req.body); } catch (e) { return {}; } }
  const chunks = [];
  for await (const c of req) chunks.push(c);
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"); } catch (e) { return {}; }
}

function cookie(req, name) {
  const raw = req.headers.cookie || "";
  const hit = raw.split(/;\s*/).find(c => c.startsWith(name + "="));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : "";
}

const cleanEmail = e => String(e || "").trim().toLowerCase().replace(/^[\s,;:<>"']+|[\s,;:.<>"']+$/g, "");
const validEmail = e => /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/.test(e) && e.length <= 200;

// Who is calling? Verifies a Firebase ID token (header first, then the /app cookie).
async function caller(req) {
  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "") || cookie(req, "mab_at");
  if (!token) return null;
  try { const d = await auth().verifyIdToken(token); return { uid: d.uid, email: cleanEmail(d.email) }; } catch (e) { return null; }
}

const students = () => db().collection("students");
async function getStudent(email) { const s = await students().doc(email).get(); return s.exists ? s.data() : null; }
async function studentByUid(uid) {
  const q = await students().where("user_id", "==", uid).limit(1).get();
  return q.empty ? null : q.docs[0].data();
}
async function upsertStudent(row) {
  const ref = students().doc(row.email);
  const cur = await ref.get();
  const base = cur.exists ? {} : { role: "student", cohort: 1, created_at: new Date().toISOString(), user_id: null, certified_at: null, cert_code: null };
  await ref.set({ ...base, ...row }, { merge: true });
  return (await ref.get()).data();
}

// Did this email make a qualifying Paystack payment for the current cohort?
async function paystackPayment(email) {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) return { error: "paystack_not_configured" };
  const H = { Authorization: `Bearer ${key}` };
  const c = await fetch(`https://api.paystack.co/customer/${encodeURIComponent(email)}`, { headers: H });
  if (c.status === 404) return null;
  if (!c.ok) return { error: "paystack_" + c.status };
  const cust = (await c.json()).data;
  if (!cust || !cust.id) return null;
  const opens = process.env.COHORT_OPENS || "2026-09-01";
  const minAmount = parseInt(process.env.SEAT_MIN_KOBO || "1000000", 10);
  const t = await fetch(`https://api.paystack.co/transaction?customer=${cust.id}&status=success&perPage=50&from=${encodeURIComponent(opens)}`, { headers: H });
  if (!t.ok) return { error: "paystack_" + t.status };
  const rows = ((await t.json()).data || []).filter(x => x.status === "success" && x.currency === "NGN" && Number(x.amount) >= minAmount);
  if (!rows.length) return null;
  const p = rows[0];
  const name = [cust.first_name, cust.last_name].filter(Boolean).join(" ").trim();
  return { reference: p.reference, paid_at: p.paid_at || p.paidAt || p.created_at, name };
}

// Every qualifying Paystack payment for the current cohort (same rules as /api/seats).
async function paystackCohort() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) return { error: "paystack_not_configured" };
  const opens = process.env.COHORT_OPENS || "2026-09-01";
  const minAmount = parseInt(process.env.SEAT_MIN_KOBO || "1000000", 10);
  const slugs = (process.env.PAYSTACK_PAGE_SLUGS || process.env.PAYSTACK_PAGE_SLUG || "mavenba").toLowerCase().split(",").map(x => x.trim()).filter(Boolean);
  const byEmail = new Map();
  for (let page = 1; page <= 30; page++) {
    const r = await fetch(`https://api.paystack.co/transaction?status=success&perPage=100&page=${page}&from=${encodeURIComponent(opens)}`, { headers: { Authorization: `Bearer ${key}` } });
    if (!r.ok) return { error: "paystack_" + r.status };
    const rows = ((await r.json()).data) || [];
    for (const t of rows) {
      if (t.status !== "success" || t.currency !== "NGN" || Number(t.amount) < minAmount) continue;
      const meta = t.metadata && typeof t.metadata === "object" ? t.metadata : {};
      const m = String(meta.referrer || "").toLowerCase().match(/\/pay\/([^/?#,\s]+)/);
      if (m && !slugs.includes(m[1])) continue;
      const c = t.customer || {};
      const email = cleanEmail(c.email);
      if (!validEmail(email) || byEmail.has(email)) continue;
      let name = [c.first_name, c.last_name].filter(Boolean).join(" ").trim();
      if (!name && Array.isArray(meta.custom_fields)) {
        const f = meta.custom_fields.find(x => /name/i.test(String(x.variable_name || x.display_name || "")));
        if (f) name = String(f.value || "").trim();
      }
      byEmail.set(email, { email, full_name: name.slice(0, 80) || null, paystack_ref: t.reference, paid_at: t.paid_at || t.paidAt || t.created_at || null });
    }
    if (rows.length < 100) break;
  }
  return { payments: [...byEmail.values()] };
}

module.exports = { admin, FACILITATOR, ready, db, auth, send, readJson, cookie, cleanEmail, validEmail, caller, students, getStudent, studentByUid, upsertStudent, paystackPayment, paystackCohort };
