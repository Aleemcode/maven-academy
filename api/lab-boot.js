// GET /app/lab-boot?app=taste-lab|prompt-lab (vercel.json rewrites it here; it must live under /app so the Path=/app session cookie is sent)
// It confirms the visitor is a logged-in student on the roster (via their session cookie) and hands the
// lab their saved work, so it's restored before the lab's own code runs. Otherwise it sends them to log in.

const { ready, db, cookie, auth, studentByUid } = require("./_fb");
const APPS = ["taste-lab", "prompt-lab"];

async function labState(uid, app) {
  const s = await db().collection("lab_state").where("user_id", "==", uid).where("app", "==", app).get();
  const out = {}; s.docs.forEach(d => { const r = d.data(); out[r.key] = r.value; }); return out;
}

module.exports = async (req, res) => {
  const url = new URL(req.url, "https://x");
  const app = APPS.includes(url.searchParams.get("app")) ? url.searchParams.get("app") : "taste-lab";
  const js = body => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/javascript; charset=utf-8");
    res.setHeader("Cache-Control", "private, no-store");
    res.end(body);
  };
  // inside the Lab/Learn frames, send the whole page to log in, never just the frame
  const toLogin = `(window.top||window).location.replace("/app/login?next=" + encodeURIComponent(window.top!==window ? (window.top.location.pathname + window.top.location.search) : "/app/${app}/"));throw new Error("login required");`;
  const offline = `window.__MAB={app:${JSON.stringify(app)},state:{},offline:true};`;

  const token = cookie(req, "mab_at");
  if (!token) return js(toLogin);
  if (!ready()) return js(offline);

  let uid;
  try { uid = (await auth().verifyIdToken(token)).uid; } catch (e) { console.log("lab-boot: session cookie rejected", e && e.code); return js(toLogin); }
  try {
    const st = await studentByUid(uid);
    if (!st) { console.log("lab-boot: no roster entry for this login"); return js(`(window.top||window).location.replace("/app");throw new Error("not on roster");`); }
    const state = await labState(uid, app);
    const taste = {};
    if (app === "prompt-lab") {
      try { const t = await labState(uid, "taste-lab"); ["tl2_prompts", "tl2_pick"].forEach(k => { if (t[k] != null) taste[k] = t[k]; }); } catch (e) { /* the brief still works without them */ }
    }
    const data = JSON.stringify({ app, name: st.full_name, email: st.email, state, taste }).replace(/</g, "\\u003c");
    return js(`window.__MAB=${data};`);
  } catch (e) {
    return js(offline);
  }
};
