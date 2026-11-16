// POST /api/cohort-feedback — the public end-of-cohort feedback form at /feedback.
// No login, so quiet students can answer too. One answer per email (a resubmission updates it);
// answers without an email are kept as separate entries. Only the facilitator can read them (Facilitator → Cohort review).

const crypto = require("crypto");
const { ready, db, send, readJson, cleanEmail, validEmail } = require("./_fb");

const COHORT = 1;
const FINISH = ["presented", "built", "behind", "not_started"];
const HARD = ["time", "pace", "tools", "data", "confidence", "other"];
const cut = (v, n) => { const s = String(v == null ? "" : v).trim(); return s ? s.slice(0, n) : null; };
const okUrl = u => { try { const x = new URL(String(u || "").trim()); return /^https?:$/.test(x.protocol) ? x.href.slice(0, 500) : null; } catch (e) { return null; } };

module.exports = async (req, res) => {
  if (req.method !== "POST") return send(res, 405, { error: "method" });
  if (!ready()) return send(res, 503, { error: "not_configured" });
  const b = await readJson(req);
  if (b.website) return send(res, 200, { ok: true }); // honeypot: bots fill every field

  const email = cleanEmail(b.email);
  const nps = b.nps === "" || b.nps == null ? null : Number(b.nps);
  const row = {
    cohort: COHORT,
    name: cut(b.name, 80),
    email: email && validEmail(email) ? email : null,
    finish: FINISH.includes(b.finish) ? b.finish : null,
    valuable: cut(b.valuable, 1200),
    hard: Array.isArray(b.hard) ? b.hard.filter(h => HARD.includes(h)).slice(0, 6) : [],
    hard_note: cut(b.hard_note, 600),
    change: cut(b.change, 1200),
    nps: Number.isInteger(nps) && nps >= 0 && nps <= 10 ? nps : null,
    testimonial: cut(b.testimonial, 800),
    project: cut(b.project, 120),
    link: okUrl(b.link),
    consent: !!b.consent,
    updated_at: new Date().toISOString()
  };
  if (!row.valuable && !row.change && row.nps == null && !row.testimonial) return send(res, 400, { error: "empty" });
  if (row.testimonial && row.consent && !row.name) return send(res, 400, { error: "name_for_testimonial" });

  try {
    const col = db().collection("cohort_feedback");
    const id = row.email ? "c" + COHORT + "_" + crypto.createHash("sha256").update(row.email).digest("hex").slice(0, 24) : col.doc().id;
    const ref = col.doc(id), cur = await ref.get();
    await ref.set({ ...row, id, featured: cur.exists ? !!cur.data().featured && row.consent : false, created_at: cur.exists ? cur.data().created_at : row.updated_at }, { merge: true });
    return send(res, 200, { ok: true, updated: cur.exists });
  } catch (e) {
    return send(res, 500, { error: "server" });
  }
};
