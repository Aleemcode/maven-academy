// Routing Middleware: Taste Lab and Prompt Lab (app/taste-lab, app/prompt-lab) are for students only.
// Without a session cookie we send the visitor to log in; with one, the request continues to the static files.
// The page itself then loads /api/lab-boot, which checks the session against the roster and restores the
// student's saved lab work before the lab starts.

export const config = {
  matcher: ["/app/taste-lab", "/app/taste-lab/:path*", "/app/prompt-lab", "/app/prompt-lab/:path*"]
};

function hasCookie(req, name) {
  return (req.headers.get("cookie") || "").split(/;\s*/).some(c => c.startsWith(name + "=") && c.length > name.length + 1);
}

export default function middleware(req) {
  const url = new URL(req.url);
  const m = url.pathname.match(/^\/app\/(taste-lab|prompt-lab)(\/.*)?$/);
  if (!m) return;
  const app = m[1], rest = m[2];
  if (!rest) return Response.redirect(new URL(`/app/${app}/${url.search}`, url), 308);
  if (!hasCookie(req, "mab_at")) {
    return Response.redirect(new URL(`/app/login?next=${encodeURIComponent(`/app/${app}/`)}`, url), 302);
  }
  // fall through to the static files
}
