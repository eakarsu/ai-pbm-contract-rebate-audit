// Feature pack: search/filter, CSV/JSON export, deterministic offline insights.
// No provider calls are made here; fallback results are labelled aiGenerated:false.
export function filterRecords(rows, { q = "", status = "", risk = "", priority = "" } = {}) {
  const needle = String(q).trim().toLowerCase();
  return (Array.isArray(rows) ? rows : []).filter((row) => {
    if (status && String(row.status ?? row.state ?? "") !== status) return false;
    if (risk && String(row.risk ?? "") !== risk) return false;
    if (priority && String(row.priority ?? "") !== priority) return false;
    if (!needle) return true;
    return Object.values(row ?? {}).some((v) => v !== null && v !== undefined && String(v).toLowerCase().includes(needle));
  });
}
export function toCsv(rows, columns) {
  const list = Array.isArray(rows) ? rows : [];
  const cols = columns?.length ? columns : [...new Set(list.flatMap((r) => Object.keys(r ?? {})))];
  const esc = (v) => {
    if (v === null || v === undefined) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  return [cols.join(","), ...list.map((r) => cols.map((c) => esc(r?.[c])).join(","))].join("\n");
}
const KINDS = {
  "exposure-triage": "Rebate shortfall exposure triage",
  "deadline-triage": "Guarantee deadline triage",
  "evidence-completeness": "Rebate evidence completeness check",
};
export function insightKinds() { return Object.entries(KINDS).map(([id, label]) => ({ id, label })); }
export function buildFallbackInsights(records, { kind = "exposure-triage", domainLabel = "Operational records", now = new Date() } = {}) {
  const list = Array.isArray(records) ? records : [];
  const totalAmount = list.reduce((s, r) => s + (Number(r.amount) || 0), 0);
  const highRisk = list.filter((r) => ["High", "Critical"].includes(String(r.risk ?? ""))).length;
  const open = list.filter((r) => !["Closed", "Approved", "DONE", "CANCELLED"].includes(String(r.status ?? r.state ?? ""))).length;
  const missingOwner = list.filter((r) => !(r.owner ?? r.assignee_id ?? r.created_by)).length;
  const overdue = list.filter((r) => { const d = r.due_date ?? r.due_at; return d && new Date(d) < now && !["Closed", "Approved", "DONE"].includes(String(r.status ?? r.state ?? "")); }).length;
  const label = KINDS[kind] || KINDS["exposure-triage"];
  return {
    aiGenerated: false, source: "deterministic-fallback", provider: "none", kind, label,
    disclaimer: "Deterministic offline summary over your own records. Operational review only; not tax, legal, or clinical advice. Verify against source records.",
    summary: `${label} over ${list.length} record(s): ${open} open, ${highRisk} high-risk, ${overdue} overdue.`,
    metrics: [
      { label: "Records considered", value: list.length },
      { label: "Total amount (0 when none)", value: totalAmount },
      { label: "Open records", value: open },
      { label: "High-risk records", value: highRisk },
      { label: "Overdue records", value: overdue },
      { label: "Records missing owner", value: missingOwner },
    ],
    sections: [
      { title: "Records considered", detail: `${list.length} ${domainLabel} record(s) were included, including records with zero amount or empty fields.` },
      { title: "Exposure", detail: `Total amount is ${totalAmount}; high-risk count is ${highRisk}. A zero total means no positive amounts were present, not that risk is absent.` },
      { title: "Deadlines and status", detail: `${open} record(s) remain open and ${overdue} are past their due date. Review overdue items first.` },
      { title: "Completeness", detail: `${missingOwner} record(s) have no owner recorded. Assign an owner before closure.` },
      { title: "Next actions", detail: "Validate source evidence, assign an accountable owner, and retain approval evidence. This fallback made no provider call." },
    ],
  };
}
export function mountFeaturePack(app, { pool, config }) {
  // Mounted after app.use('/api', auth) in server.mjs, so routes stay authenticated.
  app.get("/api/records/export", async (req, res) => {
    const format = String(req.query.format || "csv").toLowerCase();
    if (!["csv", "json"].includes(format)) return res.status(422).json({ error: "format must be csv or json" });
    const rows = (await pool.query("SELECT * FROM workflow_cases ORDER BY due_date,id")).rows;
    const filtered = filterRecords(rows, { q: req.query.q, status: req.query.status, risk: req.query.risk });
    // filterRecords matches status against status/state; workflow_cases uses state
    const byState = req.query.state ? filtered.filter((r) => String(r.state) === String(req.query.state)) : filtered;
    if (format === "json") { res.setHeader("Content-Type", "application/json"); res.setHeader("Content-Disposition", 'attachment; filename="records.json"'); return res.send(JSON.stringify({ aiGenerated: false, exported: byState.length, items: byState }, null, 2)); }
    res.setHeader("Content-Type", "text/csv; charset=utf-8"); res.setHeader("Content-Disposition", 'attachment; filename="records.csv"');
    return res.send(toCsv(byState, ["id", "workflow_id", "reference", "subject", "owner", "state", "risk", "due_date", "amount", "created_at"]));
  });
  app.get("/api/records/search", async (req, res) => {
    const rows = (await pool.query("SELECT * FROM workflow_cases ORDER BY due_date,id")).rows;
    let items = filterRecords(rows, { q: req.query.q, risk: req.query.risk });
    if (req.query.state) items = items.filter((r) => String(r.state) === String(req.query.state));
    if (req.query.workflow) items = items.filter((r) => String(r.workflow_id) === String(req.query.workflow));
    res.json({ items, total: items.length });
  });
  app.post("/api/ai/insights", async (req, res) => {
    const kind = String(req.body?.kind || "exposure-triage");
    if (!KINDS[kind]) return res.status(422).json({ error: "unknown insight kind", kinds: insightKinds() });
    let records = Array.isArray(req.body?.records) ? req.body.records : null;
    if (!records) records = (await pool.query("SELECT * FROM workflow_cases ORDER BY due_date LIMIT 500")).rows;
    res.json({ result: buildFallbackInsights(records, { kind, domainLabel: config?.title || "PBM contract" }) });
  });
  app.get("/api/ai/insights/kinds", (_req, res) => res.json({ kinds: insightKinds(), aiGenerated: false }));
}
