// POST /api/db — the student app's database door (Firebase Firestore through the Admin SDK).
// The browser sends small query objects ({ op, table, filters, ... } or { op: "rpc", fn, args }) with the
// student's Firebase ID token. Every rule that decides who may read or change what lives here.

const { FACILITATOR, ready, db, send, readJson, caller, students, studentByUid } = require("./_fb");

const now = () => new Date().toISOString();
const STAGES = ["idea", "system", "prototype", "live", "refined", "demo"];
const cut = (v, n) => v == null ? null : String(v).slice(0, n);

// What each table lets through, column by column.
const T = {
  students: { read: (me, r) => r.user_id === me.uid || me.fac },
  cohort_sessions: {
    read: me => me.student,
    update: me => me.fac,
    cols: { title: 120, ship: 300, starts_at: 40, ends_at: 40, meet_url: 500, replay_url: 500, notes: 2000, stage: 20 }
  },
  projects: {
    read: me => me.student,
    hide: me => me.fac ? ["edit_key"] : ["comfort", "help_needed", "edit_key"],
    insert: me => me.student,
    update: (me, r) => r.user_id === me.uid || me.fac,
    del: (me, r) => r.user_id === me.uid || me.fac,
    cols: { builder: 80, project_name: 120, problem: 600, audience: 400, done_looks_like: 600, status: 20, kind: 60, features: 1200, link: 500, comfort: 40, help_needed: 600 }
  },
  feedback: {
    read: (me, r) => r.user_id === me.uid || me.fac,
    insert: me => me.student,
    unique: "session",
    cols: { session: "n", rating: "n", pace: 40, confidence: "n", shipped: 40, highlight: 1000, confusing: 1000, improve: 1000, recommend: "n", name: 80 }
  },
  lab_builds: {
    read: (me, r) => me.student && (r.user_id === me.uid || r.is_public === true),
    insert: me => me.student,
    update: (me, r) => r.user_id === me.uid,
    del: (me, r) => r.user_id === me.uid || me.fac,
    cols: { author: 80, name: 120, tool: 40, prompt: 60000, is_public: "b" }
  },
  taste_cards: {
    read: me => me.student,
    hide: () => ["edit_key"],
    insert: me => me.student,
    cols: { name: 80, author: 80, project: 120, summary: 300, spec: "o", edit_key: 80 }
  }
};

function clean(table, values) {
  const cols = T[table].cols || {}, out = {};
  for (const k of Object.keys(values || {})) {
    if (!(k in cols)) continue;
    const kind = cols[k], v = values[k];
    if (v == null) out[k] = null;
    else if (kind === "n") out[k] = Number.isFinite(Number(v)) ? Number(v) : null;
    else if (kind === "b") out[k] = !!v;
    else if (kind === "o") out[k] = typeof v === "object" && JSON.stringify(v).length < 200000 ? v : null;
    else out[k] = cut(v, kind);
  }
  if (table === "projects" && "status" in out && !STAGES.includes(out.status)) throw new Error("status");
  return out;
}

function pick(row, cols, hide) {
  let r = { ...row };
  for (const h of hide || []) delete r[h];
  if (cols && cols !== "*") { const o = {}; cols.split(",").map(s => s.trim()).filter(Boolean).forEach(c => { o[c] = r[c] === undefined ? null : r[c]; }); r = o; }
  return r;
}

async function all(table, filters) {
  let q = db().collection(table);
  for (const [c, v] of filters || []) if (["user_id", "is_public", "session", "id"].includes(c)) q = q.where(c, "==", v);
  const s = await q.get();
  return s.docs.map(d => ({ id: d.id, ...d.data() })).filter(r => (filters || []).every(([c, v]) => r[c] === v || String(r[c]) === String(v)));
}

function sortRows(rows, order, limit) {
  if (order && order.col) rows.sort((a, b) => { const x = a[order.col], y = b[order.col]; const c = x == null ? -1 : y == null ? 1 : x < y ? -1 : x > y ? 1 : 0; return order.asc === false ? -c : c; });
  return limit ? rows.slice(0, limit) : rows;
}

// ---- first run: the sessions list and the facilitator ----
const SEED = [
  [1, "idea", "AI Fluency", "Your digital business card, live", "2026-10-24T19:30:00Z"],
  [2, "system", "Design Language & System Thinking", "Your journey map and wireframe", "2026-10-25T19:30:00Z"],
  [3, "prototype", "Prototype", "A first working screen of your project", "2026-10-31T19:30:00Z"],
  [4, "live", "Go Live", "Your project on a public link", "2026-11-07T19:30:00Z"],
  [5, "live", "Go Live (retake) + your first design agent", "Your project on a public link", "2026-11-14T19:30:00Z"],
  [6, "demo", "Demo Day", "Present your build to the cohort", "2026-11-15T19:30:00Z"]
];
let seeded = false;
async function seed() {
  if (seeded) return; seeded = true;
  const s = await db().collection("cohort_sessions").limit(1).get();
  if (s.empty) {
    const b = db().batch();
    for (const [n, stage, title, ship, start] of SEED) {
      const end = new Date(new Date(start).getTime() + 90 * 60000).toISOString();
      b.set(db().collection("cohort_sessions").doc(String(n)), { n, cohort: 1, stage, title, ship, starts_at: start, ends_at: end, meet_url: null, replay_url: null, notes: null });
    }
    await b.commit();
  }
  const f = await students().doc(FACILITATOR).get();
  if (!f.exists) await students().doc(FACILITATOR).set({ email: FACILITATOR, full_name: "Aleem Akinyoola", role: "facilitator", cohort: 1, user_id: null, created_at: now(), certified_at: null, cert_code: null, paystack_ref: "facilitator" });
  else if (f.data().role !== "facilitator") await students().doc(FACILITATOR).set({ role: "facilitator" }, { merge: true });
}

async function sessionsRenumber(fn) {
  const col = db().collection("cohort_sessions");
  const rows = (await col.get()).docs.map(d => d.data()).sort((a, b) => a.n - b.n);
  const fb = (await db().collection("feedback").get()).docs;
  const { list, map } = fn(rows); // map: old n -> new n
  const batch = db().batch();
  rows.forEach(r => batch.delete(col.doc(String(r.n))));
  list.forEach(r => batch.set(col.doc(String(r.n)), r));
  fb.forEach(d => { const s = d.data().session; if (map[s] && map[s] !== s) batch.update(d.ref, { session: map[s] }); });
  await batch.commit();
}

// ---- functions ----
const RPC = {
  async my_project(me) { if (!me.student) return []; return all("projects", [["user_id", me.uid]]); },
  async unclaimed_projects(me) {
    if (!me.student) return [];
    return sortRows((await all("projects")).filter(p => !p.user_id), { col: "created_at" }).map(p => ({ id: p.id, builder: p.builder, project_name: p.project_name, status: p.status }));
  },
  async claim_project(me, a) {
    if (!me.student) return false;
    if ((await all("projects", [["user_id", me.uid]])).length) return false;
    const ref = db().collection("projects").doc(String(a.p_id || ""));
    return db().runTransaction(async tx => { const s = await tx.get(ref); if (!s.exists || s.data().user_id) return false; tx.update(ref, { user_id: me.uid }); return true; });
  },
  async set_presented(me, a) {
    if (!me.fac) return false;
    const ref = db().collection("projects").doc(String(a.p_id || ""));
    const s = await ref.get(); if (!s.exists) return false;
    const p = s.data(), on = !!a.p_on;
    await ref.update({ presented_at: on ? (p.presented_at || now()) : null });
    if (p.user_id) {
      const st = await studentByUid(p.user_id);
      if (st) {
        const code = st.cert_code || ("MAB1-" + Math.random().toString(16).slice(2, 8).toUpperCase());
        await students().doc(st.email).set(on ? { certified_at: st.certified_at || now(), cert_code: code } : { certified_at: null }, { merge: true });
      }
    }
    return true;
  },
  async verify_certificate(me, a) {
    const code = String(a.p_code || "").trim().toUpperCase(); if (!code) return [];
    const q = await students().where("cert_code", "==", code).limit(1).get();
    if (q.empty) return [];
    const s = q.docs[0].data(); if (!s.certified_at) return [];
    const p = s.user_id ? (await all("projects", [["user_id", s.user_id]]))[0] : null;
    return [{ full_name: s.full_name, project_name: p ? p.project_name : null, cohort: s.cohort || 1, certified_at: s.certified_at }];
  },
  async facilitator_overview(me) {
    if (!me.fac) return [];
    const [ss, ps, fs] = await Promise.all([students().get(), all("projects"), all("feedback")]);
    const rows = ss.docs.map(d => d.data()).map(s => {
      const p = s.user_id ? ps.find(x => x.user_id === s.user_id) : null;
      return { email: s.email, full_name: s.full_name || null, role: s.role || "student", claimed: !!s.user_id, project_id: p ? p.id : null, project_name: p ? p.project_name : null,
        status: p ? p.status : null, link: p ? p.link : null, presented_at: p ? p.presented_at || null : null, comfort: p ? p.comfort || null : null, help_needed: p ? p.help_needed || null : null,
        feedback_sessions: s.user_id ? fs.filter(f => f.user_id === s.user_id).map(f => f.session).sort((a, b) => a - b) : [], certified_at: s.certified_at || null, cert_code: s.cert_code || null };
    });
    return rows.sort((a, b) => (a.role === b.role ? 0 : a.role === "student" ? 1 : -1) || String(a.full_name || "~").localeCompare(String(b.full_name || "~")) || a.email.localeCompare(b.email));
  },
  async insert_session_after(me, a) {
    if (!me.fac) throw new Error("not allowed");
    const title = String(a.p_title || "").trim().slice(0, 120); if (!title) throw new Error("title required");
    const after = parseInt(a.p_after, 10); let created = null;
    await sessionsRenumber(rows => {
      if (rows.length >= 20) throw new Error("too many sessions");
      if (!(after >= 0 && after <= rows.length)) throw new Error("bad position");
      const map = {}; const list = [];
      rows.forEach(r => { const n = r.n > after ? r.n + 1 : r.n; map[r.n] = n; list.push({ ...r, n }); });
      const base = rows.find(r => r.n === Math.max(after, 1));
      const start = a.p_starts || now();
      created = after + 1;
      list.push({ n: created, cohort: 1, stage: a.p_stage || (base && base.stage) || "idea", title, ship: null, starts_at: start,
        ends_at: a.p_ends || new Date(new Date(start).getTime() + 2 * 3600000).toISOString(), meet_url: null, replay_url: null, notes: null });
      return { list, map };
    });
    return created;
  },
  async delete_session(me, a) {
    if (!me.fac) throw new Error("not allowed");
    const n = parseInt(a.p_n, 10);
    if ((await all("feedback", [["session", n]])).length) throw new Error("has feedback");
    await sessionsRenumber(rows => {
      if (!rows.find(r => r.n === n)) throw new Error("not found");
      const map = {}; const list = [];
      rows.filter(r => r.n !== n).forEach(r => { const m = r.n > n ? r.n - 1 : r.n; map[r.n] = m; list.push({ ...r, n: m }); });
      return { list, map };
    });
    return null;
  },
  async delete_taste(me, a) {
    if (!me.student) return false;
    const ref = db().collection("taste_cards").doc(String(a.p_id || "")); const s = await ref.get(); if (!s.exists) return false;
    const t = s.data(); if (!(t.user_id === me.uid || (a.p_key && t.edit_key === a.p_key) || me.fac)) return false;
    await ref.delete(); return true;
  },
  async admin_delete_taste(me, a) { if (!me.fac) return false; await db().collection("taste_cards").doc(String(a.p_id || "")).delete(); return true; }
};

module.exports = async (req, res) => {
  if (req.method !== "POST") return send(res, 405, { error: { message: "method" } });
  if (!ready()) return send(res, 503, { error: { message: "not_configured" } });
  const body = await readJson(req);
  try {
    await seed();
    const who = await caller(req);
    const st = who ? await studentByUid(who.uid) : null;
    const me = { uid: who && who.uid, email: who && who.email, student: !!st, fac: !!st && st.role === "facilitator" };

    if (body.op === "rpc") {
      const fn = RPC[body.fn];
      if (!fn) return send(res, 400, { error: { message: "unknown function" } });
      if (!who && body.fn !== "verify_certificate") return send(res, 401, { error: { message: "auth" } });
      return send(res, 200, { data: await fn(me, body.args || {}) });
    }

    if (body.op === "lab_save") {
      if (!who) return send(res, 401, { error: { message: "auth" } }); // the labs' own saved work: { app, ups: [{key,value}], dels: [key] }
      if (!me.student) return send(res, 403, { error: { message: "not allowed" } });
      const app = ["taste-lab", "prompt-lab"].includes(body.app) ? body.app : null; if (!app) return send(res, 400, { error: { message: "app" } });
      const col = db().collection("lab_state"), id = k => `${me.uid}__${app}__${String(k).replace(/[\/]/g, "_").slice(0, 120)}`;
      const batch = db().batch();
      for (const u of (body.ups || []).slice(0, 50)) { const v = String(u.value == null ? "" : u.value); if (v.length > 900000) continue; batch.set(col.doc(id(u.key)), { user_id: me.uid, app, key: String(u.key).slice(0, 120), value: v, updated_at: now() }); }
      for (const k of (body.dels || []).slice(0, 50)) batch.delete(col.doc(id(k)));
      await batch.commit();
      return send(res, 200, { data: true });
    }
    const table = body.table, rule = T[table];
    if (!rule) return send(res, 400, { error: { message: "unknown table" } });
    if (!who) return send(res, 401, { error: { message: "auth" } });
    const filters = Array.isArray(body.filters) ? body.filters.slice(0, 5) : [];

    if (body.op === "select") {
      let rows = (await all(table, filters)).filter(r => rule.read(me, r));
      rows = sortRows(rows, body.order, body.limit).map(r => pick(r, body.cols, rule.hide && rule.hide(me)));
      return send(res, 200, { data: rows });
    }
    if (body.op === "insert") {
      if (!rule.insert || !rule.insert(me)) return send(res, 403, { error: { message: "not allowed" } });
      const list = (Array.isArray(body.values) ? body.values : [body.values]).slice(0, 20);
      const out = [];
      for (const v of list) {
        const row = { ...clean(table, v), user_id: me.uid, created_at: now() };
        if (table === "projects" && !row.status) row.status = "idea";
        if (rule.unique && (await all(table, [["user_id", me.uid], [rule.unique, row[rule.unique]]])).length) return send(res, 409, { error: { message: "duplicate key value violates unique constraint" } });
        if (table === "projects" && (await all("projects", [["user_id", me.uid]])).length) return send(res, 409, { error: { message: "duplicate key: one project per student" } });
        const ref = db().collection(table).doc();
        await ref.set({ ...row, id: ref.id });
        out.push(pick({ ...row, id: ref.id }, "*", rule.hide && rule.hide(me)));
      }
      return send(res, 200, { data: out });
    }
    if (body.op === "update") {
      if (!rule.update) return send(res, 403, { error: { message: "not allowed" } });
      if (!filters.length) return send(res, 400, { error: { message: "filter required" } });
      const vals = clean(table, body.values);
      const rows = (await all(table, filters)).filter(r => rule.update(me, r));
      for (const r of rows) await db().collection(table).doc(r.id).set(vals, { merge: true });
      return send(res, 200, { data: rows.map(r => pick({ ...r, ...vals }, "*", rule.hide && rule.hide(me))) });
    }
    if (body.op === "delete") {
      if (!rule.del) return send(res, 403, { error: { message: "not allowed" } });
      if (!filters.length) return send(res, 400, { error: { message: "filter required" } });
      const rows = (await all(table, filters)).filter(r => rule.del(me, r));
      for (const r of rows) await db().collection(table).doc(r.id).delete();
      return send(res, 200, { data: null, count: rows.length });
    }
    return send(res, 400, { error: { message: "op" } });
  } catch (e) {
    return send(res, 400, { error: { message: String(e && e.message || "server") } });
  }
};
