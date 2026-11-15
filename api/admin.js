// POST /api/admin  (Authorization: Bearer <facilitator Firebase ID token>)
//   { action: "add_student", email, name }        add someone who paid outside Paystack (e.g. bank transfer)
//   { action: "reset_password", email, password } set a temporary password for a student who forgot theirs
//   { action: "sync_paystack" }                   add every paid Paystack customer for this cohort to the roster

const { ready, auth, students, send, readJson, cleanEmail, validEmail, caller, getStudent, studentByUid, upsertStudent, paystackCohort } = require("./_fb");

module.exports = async (req, res) => {
  if (req.method !== "POST") return send(res, 405, { error: "method" });
  if (!ready()) return send(res, 503, { error: "not_configured" });

  const who = await caller(req);
  if (!who) return send(res, 401, { error: "auth" });
  const me = await studentByUid(who.uid);
  if (!me || me.role !== "facilitator") return send(res, 403, { error: "forbidden" });

  const body = await readJson(req);

  if (body.action === "sync_paystack") {
    try {
      const p = await paystackCohort();
      if (p.error) return send(res, 502, { error: "paystack" });
      let added = 0;
      for (const pay of p.payments) {
        const cur = await getStudent(pay.email);
        if (!cur) { await upsertStudent(pay); added++; }
        else if (!cur.paystack_ref || cur.paystack_ref === "manual") await upsertStudent({ email: pay.email, paystack_ref: pay.paystack_ref, paid_at: pay.paid_at });
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
      await auth().updateUser(s.user_id, { password });
      return send(res, 200, { ok: true });
    }

    return send(res, 400, { error: "action" });
  } catch (e) {
    return send(res, 500, { error: "server" });
  }
};
