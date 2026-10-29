// Routing Middleware: serves Taste Lab and Prompt Lab inside the student app, for students only.
//
//   /app/taste-lab/*   →  https://mab-taste-lab.vercel.app/*
//   /app/prompt-lab/*  →  https://mab-prompt-lab.vercel.app/*
//
// The labs keep living in their own Vercel projects, so redeploying a lab updates it here too.
// For the page itself we check the student's session (the mab_at cookie set by /app) against
// Supabase, then inject the lab bridge, which syncs the student's lab work to their account.

export const config = {
  matcher: ["/app/taste-lab", "/app/taste-lab/:path*", "/app/prompt-lab", "/app/prompt-lab/:path*"]
};

const LABS = {
  "taste-lab": "https://mab-taste-lab.vercel.app",
  "prompt-lab": "https://mab-prompt-lab.vercel.app"
};
const SB_URL = "https://besjzgmacljwltnzhbzn.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc2p6Z21hY2xqd2x0bnpoYnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4NDM4ODEsImV4cCI6MjEwODQxOTg4MX0.rM6bZG1TNLyBNkNaY72-Vv06TJoc6qNcLvIyYqmSPs0";

function cookie(req, name) {
  const raw = req.headers.get("cookie") || "";
  const hit = raw.split(/;\s*/).find(c => c.startsWith(name + "="));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : "";
}

export default async function middleware(req) {
  const url = new URL(req.url);
  const m = url.pathname.match(/^\/app\/(taste-lab|prompt-lab)(\/.*)?$/);
  if (!m) return;
  const app = m[1], rest = m[2];
  if (!rest) return Response.redirect(new URL(`/app/${app}/${url.search}`, url), 308);

  const toLogin = () => Response.redirect(new URL(`/app/login?next=${encodeURIComponent(`/app/${app}/`)}`, url), 302);
  const token = cookie(req, "mab_at");
  if (!token) return toLogin();

  const upstream = LABS[app] + rest + url.search;
  const isPage = rest === "/" || rest.endsWith(".html");

  if (!isPage) {
    const up = await fetch(upstream, { headers: { accept: req.headers.get("accept") || "*/*" } });
    const h = new Headers();
    const ct = up.headers.get("content-type"); if (ct) h.set("content-type", ct);
    h.set("cache-control", up.ok ? "private, max-age=300" : "no-store");
    return new Response(up.body, { status: up.status, headers: h });
  }

  // Who is this, and are they on the roster? (401 = expired or bad session.)
  const g = await fetch(`${SB_URL}/rest/v1/rpc/lab_gate`, {
    method: "POST",
    headers: { apikey: SB_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_app: app })
  });
  if (g.status === 401 || g.status === 403) return toLogin();
  if (!g.ok) return new Response("The lab is unavailable right now. Please refresh in a moment.", { status: 503, headers: { "content-type": "text/plain; charset=utf-8" } });
  const gate = await g.json();
  if (!gate) return Response.redirect(new URL("/app", url), 302);

  const up = await fetch(upstream, { headers: { accept: "text/html" } });
  if (!up.ok) return new Response("The lab is unavailable right now. Please refresh in a moment.", { status: 502, headers: { "content-type": "text/plain; charset=utf-8" } });
  const data = JSON.stringify({ app, name: gate.name, email: gate.email, state: gate.state || {} }).replace(/</g, "\\u003c");
  const inject = `<script>window.__MAB=${data};</script><script src="/app/lab-bridge.js"></script>`;
  const html = (await up.text()).replace(/<head([^>]*)>/i, h => h + inject);

  return new Response(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "private, no-store", "x-robots-tag": "noindex" }
  });
}
