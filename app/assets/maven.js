/* Maven Builder Academy — student app core.
   One Supabase client, the students-only gate, the shared header, and small helpers.
   Load after supabase-js. Pages call MAB.boot({ page, facilitator }) and get { me, user }. */
(function () {
  const SB_URL = "https://besjzgmacljwltnzhbzn.supabase.co";
  const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlc2p6Z21hY2xqd2x0bnpoYnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4NDM4ODEsImV4cCI6MjEwODQxOTg4MX0.rM6bZG1TNLyBNkNaY72-Vv06TJoc6qNcLvIyYqmSPs0";
  const WA = (window.MAVEN_WA || "2347031117241").replace(/\D/g, "");
  const TZ = "Africa/Lagos";

  const sb = window.supabase.createClient(SB_URL, SB_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
  });

  // The labs are served through /app middleware, which reads this cookie to know who is asking.
  function syncCookie(session) {
    const secure = location.protocol === "https:" ? "; Secure" : "";
    if (session && session.access_token) {
      const ttl = Math.max(60, (session.expires_at || 0) - Math.floor(Date.now() / 1000));
      document.cookie = `mab_at=${session.access_token}; Path=/app; Max-Age=${ttl}; SameSite=Lax${secure}`;
    } else {
      document.cookie = `mab_at=; Path=/app; Max-Age=0; SameSite=Lax${secure}`;
    }
  }
  sb.auth.onAuthStateChange((_e, s) => syncCookie(s));

  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const safeUrl = u => { try { const x = new URL(u); return /^https?:$/.test(x.protocol) ? x.href : ""; } catch (e) { return ""; } };
  const first = n => String(n || "").trim().split(/\s+/)[0] || "builder";
  const initials = n => String(n || "?").trim().split(/\s+/).slice(0, 2).map(w => w[0] || "").join("").toUpperCase() || "?";
  const fmt = (d, o) => new Intl.DateTimeFormat("en-GB", { timeZone: TZ, ...o }).format(new Date(d));
  const day = d => fmt(d, { weekday: "short", day: "numeric", month: "short" });
  const time = d => fmt(d, { hour: "numeric", minute: "2-digit", hour12: true }).replace(" ", "").toLowerCase();
  const waLink = msg => `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;

  function toast(msg) {
    let t = document.getElementById("toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("on");
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("on"), 2600);
  }

  const TABS = [
    ["home", "/app", "ph-house", "Home"],
    ["board", "/app/board", "ph-kanban", "<span class=\"lg\">Project </span>Board"],
    ["taste", "/app/taste-lab/", "ph-eye", "Taste Lab"],
    ["prompt", "/app/prompt-lab/", "ph-sliders-horizontal", "Prompt Lab"]
  ];

  function shell(page, me) {
    const host = document.getElementById("shell");
    if (!host) return;
    const tabs = TABS.concat(me.role === "facilitator" ? [["admin", "/app/admin", "ph-chalkboard-teacher", "Facilitator"]] : []);
    host.className = "shell";
    host.innerHTML = `<div class="shell-in">
      <a class="brand" href="/app" aria-label="Maven Builder Academy, student home"><img src="/assets/brand/maven-mark-dark.svg" alt=""><span><b>Maven Builder Academy</b><small>COHORT ${esc(me.cohort || 1)}</small></span></a>
      <nav class="tabs" aria-label="Student app">${tabs.map(([k, href, ic, label]) => `<a href="${href}" ${k === page ? 'aria-current="page"' : ""}><i class="ph ${ic}" aria-hidden="true"></i>${label}</a>`).join("")}</nav>
      <div class="me"><button type="button" id="meBtn" aria-haspopup="true" aria-expanded="false"><span class="av" aria-hidden="true">${esc(initials(me.full_name))}</span><span class="nm">${esc(first(me.full_name))}</span><i class="ph ph-caret-down" aria-hidden="true"></i></button>
        <div class="menu" id="meMenu"><div class="who"><b>${esc(me.full_name || "Builder")}</b><span>${esc(me.email)}</span></div>
          <a href="/app/certificate"><i class="ph ph-certificate" aria-hidden="true"></i>My certificate</a>
          <a href="${waLink("Hi Aleem, I need help with the Maven student app.")}" target="_blank" rel="noopener"><i class="ph ph-whatsapp-logo" aria-hidden="true"></i>Message Aleem</a>
          <button type="button" id="outBtn"><i class="ph ph-sign-out" aria-hidden="true"></i>Log out</button></div></div></div>`;
    const btn = document.getElementById("meBtn"), menu = document.getElementById("meMenu");
    btn.onclick = e => { e.stopPropagation(); const on = !menu.classList.contains("on"); menu.classList.toggle("on", on); btn.setAttribute("aria-expanded", on); };
    document.addEventListener("click", e => { if (!menu.contains(e.target)) { menu.classList.remove("on"); btn.setAttribute("aria-expanded", "false"); } });
    document.addEventListener("keydown", e => { if (e.key === "Escape") { menu.classList.remove("on"); btn.setAttribute("aria-expanded", "false"); } });
    document.getElementById("outBtn").onclick = async () => { await sb.auth.signOut(); syncCookie(null); location.href = "/app/login"; };
  }

  function gate(title, body, actions) {
    document.body.innerHTML = `<main class="gate"><div class="card rise"><img src="/assets/brand/maven-mark-dark.svg" alt="" style="height:44px"><h1>${title}</h1><p>${body}</p><div class="row">${actions || ""}</div></div></main>`;
  }

  // Logged in AND on the roster, or we leave. Returns { me, user, session }.
  async function boot({ page, facilitator } = {}) {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) { location.replace("/app/login?next=" + encodeURIComponent(location.pathname + location.search)); return new Promise(() => {}); }
    syncCookie(session);
    const { data: me, error } = await sb.from("students").select("*").eq("user_id", session.user.id).maybeSingle();
    if (error) {
      gate("We couldn’t reach the classroom", "Check your connection, then try again.", `<button class="btn pri" onclick="location.reload()">Try again</button>`);
      return new Promise(() => {});
    }
    if (!me) {
      await sb.auth.signOut(); syncCookie(null);
      gate("This account isn’t on the cohort list", "Log in with the email you paid with. If you paid another way, message Aleem and he’ll add you.",
        `<a class="btn pri" href="/app/login">Back to log in</a><a class="btn" href="${waLink("Hi Aleem, I paid for Maven Builder Academy but can’t get into the student app.")}" target="_blank" rel="noopener"><i class="ph ph-whatsapp-logo"></i>Message Aleem</a>`);
      return new Promise(() => {});
    }
    if (facilitator && me.role !== "facilitator") { location.replace("/app"); return new Promise(() => {}); }
    shell(page, me);
    return { me, user: session.user, session };
  }

  window.MAB = { sb, SB_URL, SB_KEY, boot, esc, safeUrl, first, initials, fmt, day, time, toast, waLink, syncCookie, TZ };
})();
