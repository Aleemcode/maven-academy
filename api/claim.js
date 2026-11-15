// POST /api/claim  { email, name, password }
// First-time setup for a paid student. Confirms the payment (roster first, then Paystack),
// creates their Firebase account with the password they chose, and links it to the roster.
// The browser then logs in normally. No email is sent.

const { FACILITATOR, ready, auth, send, readJson, cleanEmail, validEmail, getStudent, upsertStudent, paystackPayment } = require("./_fb");

module.exports = async (req, res) => {
  if (req.method !== "POST") return send(res, 405, { error: "method" });
  if (!ready()) return send(res, 503, { error: "not_configured" });

  const body = await readJson(req);
  const email = cleanEmail(body.email);
  const name = String(body.name || "").trim().slice(0, 80);
  const password = String(body.password || "");
  if (!validEmail(email)) return send(res, 400, { error: "email" });
  if (name.length < 2) return send(res, 400, { error: "name" });
  if (password.length < 8 || password.length > 72) return send(res, 400, { error: "password" });

  try {
    let student = await getStudent(email);
    if (student && student.user_id) return send(res, 409, { error: "already_set_up" });

    if (!student && email === FACILITATOR) student = await upsertStudent({ email, full_name: name, role: "facilitator", paystack_ref: "facilitator" });
    if (!student) {
      const paid = await paystackPayment(email);
      if (paid && paid.error) return send(res, 502, { error: "payment_check_failed" });
      if (!paid) return send(res, 403, { error: "not_on_roster" });
      student = await upsertStudent({ email, full_name: name || paid.name || null, paystack_ref: paid.reference, paid_at: paid.paid_at || null });
    }

    let uid;
    try {
      uid = (await auth().createUser({ email, password, displayName: name, emailVerified: true })).uid;
    } catch (e) {
      if (e && e.code === "auth/email-already-exists") {
        // an account exists but was never linked (e.g. a half-finished setup): link it, keep their old password
        const u = await auth().getUserByEmail(email);
        await upsertStudent({ email, user_id: u.uid });
        return send(res, 409, { error: "already_set_up" });
      }
      return send(res, 502, { error: "account_failed" });
    }

    await upsertStudent({ email, full_name: name, user_id: uid });
    return send(res, 200, { ok: true });
  } catch (e) {
    return send(res, 500, { error: "server" });
  }
};
