// POST /api/admin  (Authorization: Bearer <facilitator access token>)
//   { action: "add_student", email, name }        add someone who paid outside Paystack (e.g. bank transfer)
//   { action: "reset_password", email, password } set a temporary password for a student who forgot theirs
// Everything else the facilitator does goes straight to the database under row-level security.

const { SB_URL, serviceHeaders, send, readJson, cleanEmail, validEmail, getStudent, upsertStudent, userFromToken } = require("./_sb");

module.exports = async (req, res) => {
  if (req.method !== "POST") return send(res, 405, { error: "method" });
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return send(res, 503, { error: "not_configured" });

  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  const caller = await userFromToken(token);
  if (!caller || !caller.email) return send(res, 401, { error: "auth" });
  const me = await getStudent(cleanEmail(caller.email));
  if (!me || me.role !== "facilitator" || me.user_id !== caller.id) return send(res, 403, { error: "forbidden" });

  const body = await readJson(req);
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
