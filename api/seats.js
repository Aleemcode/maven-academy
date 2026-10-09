// GET /api/seats  ->  { taken, cap, left, full, updatedAt }
// Counts real, successful Paystack payments for the current cohort.
// Never returns a made-up number: on any failure it responds 503 and the site hides the counter.
//
// Vercel → Project (maven-academy) → Settings → Environment Variables:
//   PAYSTACK_SECRET_KEY   (required) sk_live_… — server-side only, never in index.html
//   SEAT_CAP              default 30
//   COHORT_OPENS          ISO date the current cohort's sales opened, default 2026-09-01 (change per cohort → counter resets)
//   SEAT_MIN_KOBO         default 1000000  (₦10,000 × 100) — any successful payment at or above this counts as a seat,
//                         so discounted seats count too, while small test payments don't
//   PAYSTACK_PAGE_SLUGS   default mavenba  (comma-separated, e.g. "mavenba,mavenba-friends"; when Paystack reports
//                         the page a payment came from, only these pages count)
//   SEATS_MANUAL_OFFSET   default 0  (add seats paid outside Paystack, e.g. bank transfer)

module.exports = async (req, res) => {
  const key = process.env.PAYSTACK_SECRET_KEY;
  const cap = parseInt(process.env.SEAT_CAP || "30", 10);
  const opens = process.env.COHORT_OPENS || "2026-09-01";
  const minAmount = parseInt(process.env.SEAT_MIN_KOBO || "1000000", 10);
  const slugs = (process.env.PAYSTACK_PAGE_SLUGS || process.env.PAYSTACK_PAGE_SLUG || "mavenba").toLowerCase().split(",").map(x => x.trim()).filter(Boolean);
  const offset = parseInt(process.env.SEATS_MANUAL_OFFSET || "0", 10);

  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (!key) { res.statusCode = 503; return res.end(JSON.stringify({ error: "not_configured" })); }

  try {
    const refs = new Set();
    const perPage = 100;
    for (let page = 1; page <= 30; page++) {
      const url = `https://api.paystack.co/transaction?status=success&perPage=${perPage}&page=${page}&from=${encodeURIComponent(opens)}`;
      const r = await fetch(url, { headers: { Authorization: `Bearer ${key}` } });
      if (!r.ok) throw new Error("paystack_" + r.status);
      const j = await r.json();
      const rows = Array.isArray(j.data) ? j.data : [];
      for (const t of rows) {
        if (t.status !== "success" || t.currency !== "NGN") continue;
        if (Number(t.amount) < minAmount) continue;
        const meta = t.metadata && typeof t.metadata === "object" ? t.metadata : {};
        const ref = String(meta.referrer || "").toLowerCase();
        const m = ref.match(/\/pay\/([^/?#]+)/);
        if (m && !slugs.includes(m[1])) continue; // paid on a different payment page
        refs.add(t.reference);
      }
      if (rows.length < perPage) break;
    }
    const taken = Math.min(cap, refs.size + offset);
    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    res.end(JSON.stringify({ taken, cap, left: Math.max(0, cap - taken), full: taken >= cap, updatedAt: new Date().toISOString() }));
  } catch (e) {
    res.statusCode = 503;
    res.setHeader("Cache-Control", "no-store");
    res.end(JSON.stringify({ error: "unavailable" }));
  }
};
