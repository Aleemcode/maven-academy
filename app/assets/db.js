/* Maven student app: the browser side of the database.
   Firebase Auth for logging in, and a small query client that talks to /api/db.
   It keeps the same shape the pages already use: MABDB.from("table").select().eq().order(), MABDB.rpc(), MABDB.auth.* */
(function () {
  const cfg = window.MAVEN_FIREBASE;
  if (!cfg || !cfg.apiKey) { console.error("Firebase config missing (window.MAVEN_FIREBASE in /assets/site-config.js)"); }
  firebase.initializeApp(cfg || {});
  const A = firebase.auth();
  const ready = new Promise(r => { const off = A.onAuthStateChanged(() => { off(); r(); }); });

  async function session(force) {
    await ready;
    const u = A.currentUser; if (!u) return null;
    const t = await u.getIdTokenResult(!!force);
    return { access_token: t.token, expires_at: Math.floor(new Date(t.expirationTime).getTime() / 1000), user: { id: u.uid, email: u.email } };
  }

  const BAD = /invalid-credential|wrong-password|user-not-found|invalid-email|invalid-login-credentials/;
  const auth = {
    async getSession() { return { data: { session: await session() }, error: null }; },
    async signInWithPassword({ email, password }) {
      try { await A.signInWithEmailAndPassword(email, password); return { data: { session: await session() }, error: null }; }
      catch (e) { const c = String(e && e.code || ""); return { data: {}, error: { message: BAD.test(c) ? "Invalid login credentials" : c === "auth/too-many-requests" ? "Too many attempts. Wait a minute and try again." : (e.message || "network") } }; }
    },
    async signOut() { await A.signOut(); return { error: null }; },
    onAuthStateChange(cb) { A.onIdTokenChanged(async u => cb(u ? "SIGNED_IN" : "SIGNED_OUT", u ? await session() : null)); }
  };

  async function call(body) {
    try {
      const s = await session();
      const r = await fetch("/api/db", { method: "POST", headers: Object.assign({ "Content-Type": "application/json" }, s ? { Authorization: "Bearer " + s.access_token } : {}), body: JSON.stringify(body) });
      return await r.json().catch(() => ({ error: { message: "network" } }));
    } catch (e) { return { error: { message: "network" } }; }
  }

  class Query {
    constructor(table) { this.b = { op: "select", table, filters: [], cols: "*" }; }
    select(cols) { if (this.b.op === "select") this.b.cols = cols || "*"; return this; }
    insert(values) { this.b.op = "insert"; this.b.values = values; return this; }
    update(values) { this.b.op = "update"; this.b.values = values; return this; }
    delete(opts) { this.b.op = "delete"; return this; }
    eq(col, val) { this.b.filters.push([col, val]); return this; }
    order(col, o) { this.b.order = { col, asc: !(o && o.ascending === false) }; return this; }
    limit(n) { this.b.limit = n; return this; }
    maybeSingle() { this.single = true; return this; }
    single_() { return this.maybeSingle(); }
    then(res, rej) {
      return call(this.b).then(j => {
        let d = j.data === undefined ? null : j.data;
        if (this.single) d = Array.isArray(d) ? (d[0] || null) : d;
        return { data: d, error: j.error || null, count: j.count };
      }).then(res, rej);
    }
  }

  window.MABDB = {
    from: t => new Query(t),
    rpc: (fn, args) => call({ op: "rpc", fn, args: args || {} }).then(j => ({ data: j.data === undefined ? null : j.data, error: j.error || null })),
    labSave: (app, ups, dels) => call({ op: "lab_save", app, ups, dels }),
    auth,
    session
  };
})();
