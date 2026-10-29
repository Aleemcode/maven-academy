/* Lab bridge. Injected first into Taste Lab and Prompt Lab when they run inside /app.
   1. Students only: no session → back to login.
   2. Restores the student's saved lab work from their account before the lab starts.
   3. Saves lab work to their account as they go (the labs keep using localStorage, untouched).
   4. Sends the labs' own Supabase calls as the student, so what they publish is theirs.
   5. Adds a small "Home" pill with a saved indicator. */
(function () {
  "use strict";
  var M = window.__MAB || {}, APP = M.app;
  var SB_URL = "https://besjzgmacljwltnzhbzn.supabase.co";
  var SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc2p6Z21hY2xqd2x0bnpoYnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4NDM4ODEsImV4cCI6MjEwODQxOTg4MX0.rM6bZG1TNLyBNkNaY72-Vv06TJoc6qNcLvIyYqmSPs0";
  var SK = "sb-besjzgmacljwltnzhbzn-auth-token";
  var SYNC = { "taste-lab": /^tl2_(?!admin)/, "prompt-lab": /^mab_promptlab$/ }[APP];
  var ls; try { ls = window.localStorage; } catch (e) { ls = null; }
  var set = Storage.prototype.setItem, rem = Storage.prototype.removeItem, get = Storage.prototype.getItem;
  var toLogin = function () { location.replace("/app/login?next=" + encodeURIComponent("/app/" + APP + "/")); };

  function readSession() { try { return JSON.parse(get.call(ls, SK)); } catch (e) { return null; } }
  if (!ls || !SYNC || !readSession()) { toLogin(); return; }

  // ---- 2. restore -------------------------------------------------------
  var DIRTY = "mab_sync_dirty_" + APP, OWNER = "mab_sync_owner";
  var dirty = {}; try { dirty = JSON.parse(get.call(ls, DIRTY) || "{}") || {}; } catch (e) {}
  var owner = get.call(ls, OWNER);
  if (owner && owner !== M.email) {            // a different student used this browser before
    for (var i = ls.length - 1; i >= 0; i--) { var k0 = ls.key(i); if (/^tl2_|^mab_promptlab$|^mab_sync_dirty_/.test(k0)) rem.call(ls, k0); }
    dirty = {};
  }
  set.call(ls, OWNER, M.email || "");
  var state = M.state || {};
  Object.keys(state).forEach(function (k) { if (SYNC.test(k) && !dirty[k] && state[k] != null) set.call(ls, k, state[k]); });
  // anything saved here before the account existed gets uploaded once
  for (var j = 0; j < ls.length; j++) { var k1 = ls.key(j); if (SYNC.test(k1) && !(k1 in state)) dirty[k1] = 1; }

  // ---- 4. token ---------------------------------------------------------
  var refreshing = null;
  function token() {
    var s = readSession();
    if (!s || !s.access_token) { toLogin(); return Promise.reject(new Error("no_session")); }
    if ((s.expires_at || 0) - 60 > Date.now() / 1000) return Promise.resolve(s.access_token);
    if (refreshing) return refreshing;
    refreshing = _fetch(SB_URL + "/auth/v1/token?grant_type=refresh_token", {
      method: "POST", headers: { apikey: SB_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ refresh_token: s.refresh_token })
    }).then(function (r) { if (!r.ok) throw new Error("refresh"); return r.json(); })
      .then(function (n) {
        if (!n.expires_at) n.expires_at = Math.floor(Date.now() / 1000) + (n.expires_in || 3600);
        set.call(ls, SK, JSON.stringify(n));
        var sec = location.protocol === "https:" ? "; Secure" : "";
        document.cookie = "mab_at=" + n.access_token + "; Path=/app; Max-Age=" + (n.expires_in || 3600) + "; SameSite=Lax" + sec;
        refreshing = null; return n.access_token;
      }).catch(function (e) { refreshing = null; toLogin(); throw e; });
    return refreshing;
  }

  var _fetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    var u = typeof input === "string" ? input : (input && input.url) || "";
    if (u.indexOf(SB_URL + "/rest/") !== 0) return _fetch(input, init);
    return token().then(function (t) {
      init = init || {};
      var h = new Headers(init.headers || (input && input.headers) || {});
      h.set("apikey", SB_KEY); h.set("Authorization", "Bearer " + t);
      return _fetch(input, Object.assign({}, init, { headers: h }));
    });
  };

  // ---- 3. save as they go -----------------------------------------------
  var timer = null;
  function saveDirty() { set.call(ls, DIRTY, JSON.stringify(dirty)); }
  function push(keepalive) {
    clearTimeout(timer); timer = null;
    var keys = Object.keys(dirty); if (!keys.length) return;
    var ups = [], dels = [];
    keys.forEach(function (k) { var v = get.call(ls, k); if (v == null) dels.push(k); else ups.push({ app: APP, key: k, value: v, updated_at: new Date().toISOString() }); });
    status("saving");
    token().then(function (t) {
      var H = { apikey: SB_KEY, Authorization: "Bearer " + t, "Content-Type": "application/json" };
      var jobs = [];
      if (ups.length) jobs.push(_fetch(SB_URL + "/rest/v1/lab_state?on_conflict=user_id,app,key", { method: "POST", keepalive: !!keepalive, headers: Object.assign({ Prefer: "resolution=merge-duplicates,return=minimal" }, H), body: JSON.stringify(ups) }));
      dels.forEach(function (k) { jobs.push(_fetch(SB_URL + "/rest/v1/lab_state?app=eq." + encodeURIComponent(APP) + "&key=eq." + encodeURIComponent(k), { method: "DELETE", keepalive: !!keepalive, headers: H })); });
      return Promise.all(jobs);
    }).then(function (rs) {
      if (rs.some(function (r) { return !r.ok; })) throw new Error("save");
      keys.forEach(function (k) { delete dirty[k]; }); saveDirty(); status("saved");
    }).catch(function () { status("offline"); });
  }
  function mark(k) { dirty[k] = 1; saveDirty(); if (!timer) timer = setTimeout(push, 1200); }
  Storage.prototype.setItem = function (k, v) { set.call(this, k, v); if (this === ls && SYNC.test(String(k))) mark(String(k)); };
  Storage.prototype.removeItem = function (k) { rem.call(this, k); if (this === ls && SYNC.test(String(k))) mark(String(k)); };
  addEventListener("pagehide", function () { push(true); });
  addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden") push(true); });
  addEventListener("online", function () { push(); });

  // ---- 5. home pill -----------------------------------------------------
  var pill, label;
  function status(s) {
    if (!label) return;
    label.textContent = s === "saving" ? "Saving…" : s === "offline" ? "Not saved yet" : "Saved to your account";
    pill.setAttribute("data-s", s);
  }
  function mount() {
    var css = document.createElement("style");
    css.textContent = ".mab-pill{position:fixed;right:14px;bottom:14px;z-index:2147483000;display:flex;align-items:center;gap:10px;background:#FFFDF7;color:#14261D;border:2.5px solid #14261D;border-radius:999px;box-shadow:3px 3px 0 #14261D;padding:5px 14px 5px 5px;font:600 13px/1.2 'Instrument Sans',system-ui,sans-serif;text-decoration:none;transition:transform .12s,box-shadow .12s}" +
      ".mab-pill:hover{transform:translate(-1px,-1px);box-shadow:4px 4px 0 #14261D}.mab-pill:focus-visible{outline:3px solid #3B82C4;outline-offset:2px}" +
      ".mab-pill img{width:28px;height:28px;border-radius:50%;background:#F4F0E5;border:2px solid #14261D;padding:3px}" +
      ".mab-pill b{display:block;font-weight:700;font-size:13.5px}.mab-pill small{display:flex;align-items:center;gap:5px;font-size:11.5px;color:#53625A;font-weight:600}" +
      ".mab-pill small::before{content:'';width:7px;height:7px;border-radius:50%;background:#2F7A4F}.mab-pill[data-s=saving] small::before{background:#C9902E}.mab-pill[data-s=offline] small::before{background:#A3361A}" +
      "@media (max-width:600px){.mab-pill{right:10px;bottom:10px;padding:4px 4px}.mab-pill span{display:none}}@media print{.mab-pill{display:none}}";
    document.head.appendChild(css);
    pill = document.createElement("a");
    pill.className = "mab-pill"; pill.href = "/app"; pill.setAttribute("aria-label", "Back to Maven student home");
    pill.innerHTML = '<img src="/assets/brand/maven-mark-dark.svg" alt=""><span><b>Maven home</b><small></small></span>';
    label = pill.querySelector("small");
    document.body.appendChild(pill);
    status(Object.keys(dirty).length ? "saving" : "saved");
    if (Object.keys(dirty).length) push();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();

  window.MAB_USER = { name: M.name, email: M.email };
})();
