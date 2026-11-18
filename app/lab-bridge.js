/* Lab bridge. Injected first into Taste Lab and Prompt Lab when they run inside /app.
   1. Students only: no session → back to login.
   2. Restores the student's saved lab work from their account before the lab starts.
   3. Saves lab work to their account as they go (the labs keep using localStorage, untouched).
   4. Sends the labs' own Supabase calls as the student, so what they publish is theirs.
   5. Adds a small "Home" pill with a saved indicator. */
(function () {
  "use strict";
  var M = window.__MAB || {}, APP = M.app;
  var SB_URL = "https://besjzgmacljwltnzhbzn.supabase.co"; // old address the Taste Lab still calls; translated below
  var SYNC = { "taste-lab": /^tl2_(?!admin)/, "prompt-lab": /^mab_promptlab$/ }[APP];
  var ls; try { ls = window.localStorage; } catch (e) { ls = null; }
  var set = Storage.prototype.setItem, rem = Storage.prototype.removeItem, get = Storage.prototype.getItem;
  var toLogin = function () { var T = window.top || window; T.location.replace("/app/login?next=" + encodeURIComponent(T !== window ? T.location.pathname + T.location.search : "/app/" + APP + "/")); };

  // The class app keeps a fresh Firebase ID token in the mab_at cookie (Path=/app) while it is open.
  function readToken() { var m = document.cookie.match(/(?:^|;\s*)mab_at=([^;]+)/); return m ? decodeURIComponent(m[1]) : ""; }
  if (!ls || !SYNC || !readToken()) { toLogin(); return; }

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
  // Prompt Lab: bring in Taste Cards from the Taste Lab when this browser doesn't have them yet
  Object.keys(M.taste || {}).forEach(function (k) { if (/^tl2_(prompts|pick)$/.test(k) && get.call(ls, k) == null) set.call(ls, k, M.taste[k]); });
  // anything saved here before the account existed gets uploaded once
  for (var j = 0; j < ls.length; j++) { var k1 = ls.key(j); if (SYNC.test(k1) && !(k1 in state)) dirty[k1] = 1; }

  // ---- 4. token + the Taste Lab's own database calls -------------------
  function token() { var t = readToken(); if (!t) { toLogin(); return Promise.reject(new Error("no_session")); } return Promise.resolve(t); }
  var _fetch = window.fetch.bind(window);
  function api(body) {
    return token().then(function (t) {
      return _fetch("/api/db", { method: "POST", keepalive: !!body.keepalive, headers: { "Content-Type": "application/json", Authorization: "Bearer " + t }, body: JSON.stringify(body) });
    });
  }
  function reply(status, data) { return new Response(JSON.stringify(data), { status: status, headers: { "Content-Type": "application/json" } }); }
  // The Taste Lab was written against the old REST address. Its three calls are answered by /api/db instead.
  window.fetch = function (input, init) {
    var u = typeof input === "string" ? input : (input && input.url) || "";
    if (u.indexOf(SB_URL + "/rest/v1/") !== 0) return _fetch(input, init);
    var path = u.slice((SB_URL + "/rest/v1/").length), method = ((init && init.method) || "GET").toUpperCase(), body = {};
    try { body = init && init.body ? JSON.parse(init.body) : {}; } catch (e) {}
    var q;
    if (/^taste_cards/.test(path) && method === "GET") q = { op: "select", table: "taste_cards", cols: "id,created_at,name,author,project,summary,spec", order: { col: "created_at", asc: false }, limit: 200 };
    else if (/^taste_cards/.test(path) && method === "POST") q = { op: "insert", table: "taste_cards", values: body };
    else if (/^rpc\//.test(path)) q = { op: "rpc", fn: path.slice(4).split("?")[0], args: body };
    else return Promise.resolve(reply(404, { message: "not found" }));
    return api(q).then(function (r) { return r.json(); }).then(function (j) {
      if (j.error) return reply(400, j.error);
      return reply(200, j.data);
    }).catch(function () { return reply(503, { message: "offline" }); });
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
    api({ op: "lab_save", app: APP, ups: ups.map(function (x) { return { key: x.key, value: x.value }; }), dels: dels, keepalive: keepalive }).then(function (r) {
      return [r];
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
    if (/[?&]embed=/.test(location.search)) return; // inside the Maven Lab: no floating home pill
    var css = document.createElement("style");
    css.textContent = ".mab-pill{position:fixed;left:14px;bottom:14px;z-index:90;display:flex;align-items:center;gap:10px;background:#FFFDF7;color:#14261D;border:2.5px solid #14261D;border-radius:999px;box-shadow:3px 3px 0 #14261D;padding:5px 14px 5px 5px;font:600 13px/1.2 'Instrument Sans',system-ui,sans-serif;text-decoration:none;transition:transform .12s,box-shadow .12s}" +
      ".mab-pill:hover{transform:translate(-1px,-1px);box-shadow:4px 4px 0 #14261D}.mab-pill:focus-visible{outline:3px solid #3B82C4;outline-offset:2px}" +
      ".mab-pill img{width:28px;height:28px;border-radius:50%;background:#F4F0E5;border:2px solid #14261D;padding:3px}" +
      ".mab-pill b{display:block;font-weight:700;font-size:13.5px}.mab-pill small{display:flex;align-items:center;gap:5px;font-size:11.5px;color:#53625A;font-weight:600}" +
      ".mab-pill small::before{content:'';width:7px;height:7px;border-radius:50%;background:#2F7A4F}.mab-pill[data-s=saving] small::before{background:#C9902E}.mab-pill[data-s=offline] small::before{background:#A3361A}" +
      (APP==="taste-lab"?".side{padding-bottom:88px!important}":"")+"@media (max-width:600px){.mab-pill{left:10px;bottom:10px;padding:4px 4px}.mab-pill span{display:none}}@media print{.mab-pill{display:none}}";
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
