import React, { useEffect, useState } from 'react';
export function TasksPanel({ request, notify }) {
  const [tasks, setTasks] = useState([]), [q, setQ] = useState(''), [status, setStatus] = useState(''), [title, setTitle] = useState(''), [error, setError] = useState('');
  async function load() { try { const d = await request(`/api/tasks?q=${encodeURIComponent(q)}&status=${status}`); setTasks(d.tasks || []); } catch (e) { setError(e.message); } }
  useEffect(() => { load(); }, [q, status]);
  async function create(e) { e.preventDefault(); try { await request('/api/tasks', { method: 'POST', body: JSON.stringify({ title }) }); setTitle(''); notify?.('Task created'); load(); } catch (e) { setError(e.message); } }
  async function toggle(t) { try { await request(`/api/tasks/${t.id}`, { method: 'PATCH', body: JSON.stringify({ status: t.status === 'DONE' ? 'OPEN' : 'DONE' }) }); load(); } catch (e) { setError(e.message); } }
  return <section className="panel"><h2>Staff tasks</h2><p>Authenticated task list. Search and filter apply to your tasks; counts include completed and empty results.</p>
    <label>Search tasks<input aria-label="Search tasks" value={q} onChange={(e) => setQ(e.target.value)} /></label>
    <label>Status<select aria-label="Task status filter" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option><option>OPEN</option><option>DONE</option><option>CANCELLED</option></select></label>
    <form onSubmit={create}><label>New task title<input aria-label="New task title" value={title} onChange={(e) => setTitle(e.target.value)} required /></label><button type="submit">Create task</button></form>
    {error && <p role="alert">{error}</p>}
    <p>{tasks.length} task(s) shown</p>
    <ul>{tasks.map((t) => <li key={t.id}><strong>{t.title}</strong> — Status: {t.status} · Priority: {t.priority} · Due: {t.due_at ? String(t.due_at).slice(0, 10) : 'Not set'} <button type="button" onClick={() => toggle(t)}>{t.status === 'DONE' ? 'Reopen' : 'Mark done'}</button></li>)}</ul>
    {!tasks.length && <p>No tasks found. Empty result preserved — try clearing search.</p>}</section>;
}
export function FallbackInsights({ request, featureId }) {
  const [kind, setKind] = useState('exposure-triage'), [result, setResult] = useState(null), [error, setError] = useState('');
  async function run() { try { const d = await request('/api/ai/insights', { method: 'POST', body: JSON.stringify({ kind }) }); setResult(d.result); } catch (e) { setError(e.message); } }
  return <section className="panel"><h3>Offline insights (deterministic fallback)</h3><p>Labelled fallback over your own records. No provider call is made.</p>
    <label>Insight type<select aria-label="Insight type" value={kind} onChange={(e) => setKind(e.target.value)}><option value="exposure-triage">Exposure triage</option><option value="deadline-triage">Deadline triage</option><option value="evidence-completeness">Evidence completeness</option></select></label>
    <button type="button" onClick={run}>Run offline insight</button>{error && <p role="alert">{error}</p>}
    {result && <div><p>AI generated: {String(result.aiGenerated)} · Source: {result.source}</p><p>{result.summary}</p>
      <section><h4>Metrics</h4><ul>{result.metrics.map((m) => <li key={m.label}>{m.label}: {String(m.value)}</li>)}</ul></section>
      {result.sections.map((s) => <section key={s.title}><h4>{s.title}</h4><p>{s.detail}</p></section>)}
      <p>{result.disclaimer}</p></div>}</section>;
}
