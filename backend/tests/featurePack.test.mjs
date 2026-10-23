import test from "node:test";
import assert from "node:assert/strict";
import { filterRecords, toCsv, buildFallbackInsights, insightKinds } from "../featurePack.mjs";
const rows = [
  { reference: "A-1", title: "Alpha notice", status: "Open", risk: "High", amount: 0, owner: "", due_date: "2020-01-01" },
  { reference: "B-2", title: "Beta review", status: "Closed", risk: "Low", amount: 250, owner: "Sam", due_date: "2999-01-01" },
  { reference: "C-3", title: "", status: "Open", risk: "Low", amount: 0, owner: null, due_date: null },
];
test("search/filter preserves false/0/empty records", () => {
  assert.equal(filterRecords(rows, {}).length, 3);
  assert.equal(filterRecords(rows, { q: "alpha" }).length, 1);
  assert.equal(filterRecords(rows, { status: "Open" }).length, 2);
  assert.equal(filterRecords(rows, { q: "0" }).length >= 1, true);
});
test("csv export preserves 0 and empty", () => {
  const csv = toCsv(rows, ["reference", "amount", "title"]);
  assert.ok(csv.includes("A-1,0,Alpha notice"));
  assert.ok(csv.split("\n")[0] === "reference,amount,title");
});
test("deterministic fallback is labelled aiGenerated:false with sections", () => {
  const r = buildFallbackInsights(rows, { kind: "exposure-triage" });
  assert.equal(r.aiGenerated, false);
  assert.equal(r.source, "deterministic-fallback");
  assert.ok(r.sections.length >= 3 && r.sections.every((s) => s.title && "detail" in s));
  assert.equal(r.metrics.find((m) => m.label.includes("Records considered")).value, 3);
  assert.ok(insightKinds().length >= 3);
});
