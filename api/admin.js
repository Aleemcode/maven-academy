// POST /api/admin  (Authorization: Bearer <facilitator access token>)
//   { action: "add_student", email, name }        add someone who paid outside Paystack (e.g. bank transfer)
//   { action: "reset_password", email, password } set a temporary password for a student who forgot theirs
//   { action: "sync_paystack" }                   add every paid Paystack customer for this cohort to the roster
// Everything else the facilitator does goes straight to the database under row-level security.

const { paystackCohort, SB_URL, serviceHeaders, send, readJson, cleanEmail, validEmail, getStudent, upsertStudent, userFromToken } = require("./_sb");

module.exports = async (req, res) => {
  if (req.method !== "POST") return send(res, 405, { error: "method" });
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return send(res, 503, { error: "not_configured" });

  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  const caller = await userFromToken(token);
  if (!caller || !caller.email) return send(res, 401, { error: "auth" });
  const me = await getStudent(cleanEmail(caller.email));
  if (!me || me.role !== "facilitator" || me.user_id !== caller.id) return send(res, 403, { error: "forbidden" });

  const body = await readJson(req);

  if (body.action === "sync_paystack") {
    try {
      const p = await paystackCohort();
      if (p.error) return send(res, 502, { error: "paystack" });
      let added = 0;
      if (p.payments.length) {
        // new emails only; existing roster rows (names students chose, accounts) are left untouched
        const r = await fetch(`${SB_URL}/rest/v1/students?on_conflict=email`, {
          method: "POST",
          headers: serviceHeaders({ Prefer: "resolution=ignore-duplicates,return=representation" }),
          body: JSON.stringify(p.payments)
        });
        if (!r.ok) return send(res, 502, { error: "roster_write" });
        added = (await r.json()).length;
        // fill in the Paystack reference on rows that were added by hand before payment was seen
        for (const pay of p.payments) {
          await fetch(`${SB_URL}/rest/v1/students?email=eq.${encodeURIComponent(pay.email)}&or=(paystack_ref.is.null,paystack_ref.eq.manual)`, {
            method: "PATCH", headers: serviceHeaders({ Prefer: "return=minimal" }), body: JSON.stringify({ paystack_ref: pay.paystack_ref, paid_at: pay.paid_at })
          });
        }
      }
      return send(res, 200, { ok: true, paid: p.payments.length, added, syncedAt: new Date().toISOString() });
    } catch (e) { return send(res, 500, { error: "server" }); }
  }

  const email = cleanEmail(body.email);
  if (!validEmail(email)) return send(res, 400, { error: "email" });

  try {
    if (body.action === "add_student") {
      const name = String(body.name || "").trim().slice(0, 80) || null;
      const existing = await getStudent(email);
      const row = await upsertStudent({ email, full_name: name || (existing && existing.full_name) || null, paystack_ref: (existing && existing.paystack_ref) || "manual" });
      return send(res, 200, { ok: true, student: { email: row.email, full_name: row.full_name } });
    }

    if (body.action === "reset_password") {
      const password = String(body.password || "");
      if (password.length < 8 || password.length > 72) return send(res, 400, { error: "password" });
      const s = await getStudent(email);
      if (!s || !s.user_id) return send(res, 404, { error: "no_account" });
      const r = await fetch(`${SB_URL}/auth/v1/admin/users/${s.user_id}`, { method: "PUT", headers: serviceHeaders(), body: JSON.stringify({ password }) });
      if (!r.ok) return send(res, 502, { error: "reset_failed" });
      return send(res, 200, { ok: true });
    }

    return send(res, 400, { error: "action" });
  } catch (e) {
    return send(res, 500, { error: "server" });
  }
};
