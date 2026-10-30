// GET /app/lab-boot?app=taste-lab|prompt-lab (vercel.json rewrites it here; it must live under /app so the Path=/app session cookie is sent)
// It confirms the visitor is a logged-in student on the roster (via their session cookie) and hands the
// lab their saved work, so it's restored before the lab's own code runs. Otherwise it sends them to log in.

const SB_URL = process.env.SUPABASE_URL || "https://besjzgmacljwltnzhbzn.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc2p6Z21hY2xqd2x0bnpoYnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4NDM4ODEsImV4cCI6MjEwODQxOTg4MX0.rM6bZG1TNLyBNkNaY72-Vv06TJoc6qNcLvIyYqmSPs0";
const APPS = ["taste-lab", "prompt-lab"];

function cookie(req, name) {
  const raw = req.headers.cookie || "";
  const hit = raw.split(/;\s*/).find(c => c.startsWith(name + "="));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : "";
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
  const toLogin = `location.replace("/app/login?next=" + encodeURIComponent("/app/${app}/"));throw new Error("login required");`;

  const token = cookie(req, "mab_at");
  if (!token) return js(toLogin);

  try {
    const g = await fetch(`${SB_URL}/rest/v1/rpc/lab_gate`, {
      method: "POST",
      headers: { apikey: SB_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ p_app: app })
    });
    if (g.status === 401 || g.status === 403) return js(toLogin);
    if (!g.ok) return js(`window.__MAB={app:${JSON.stringify(app)},state:{},offline:true};`);
    const gate = await g.json();
    if (!gate) return js(`location.replace("/app");throw new Error("not on roster");`);
    const data = JSON.stringify({ app, name: gate.name, email: gate.email, state: gate.state || {} }).replace(/</g, "\\u003c");
    return js(`window.__MAB=${data};`);
  } catch (e) {
    return js(`window.__MAB={app:${JSON.stringify(app)},state:{},offline:true};`);
  }
};
