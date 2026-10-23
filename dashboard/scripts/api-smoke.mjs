/** Local, reversible D1 integration check. Run against the existing dev server. */
import assert from 'node:assert/strict';

const base = new URL(process.argv[2] || 'http://127.0.0.1:5173');
if (!['127.0.0.1', 'localhost', '[::1]'].includes(base.hostname)) throw new Error('This test only writes to a loopback development server.');
const endpoint = new URL('/api/progress', base);
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const ids = [`api-smoke-a-${suffix}`, `api-smoke-b-${suffix}`];
let changed = false;
async function get() {
  const response = await fetch(endpoint, { signal: AbortSignal.timeout(10000) });
  assert.equal(response.status, 200, `GET returned ${response.status}`);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  return response.json();
}
async function patch(baseRevision, changes, headers = {}) {
  const response = await fetch(endpoint, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify({ baseRevision, changes }), signal: AbortSignal.timeout(10000) });
  const json = response.headers.get('content-type')?.includes('application/json');
  // Vinext may reject a foreign Origin before the API handler executes.
  if (json) assert.equal(response.headers.get('cache-control'), 'no-store');
  const result = { status: response.status, body: json ? await response.json() : await response.text() };
  if (response.status === 200) changed = true;
  return result;
}
function comparable(progress) {
  const normalized = { currentWeek: 1, startDate: '', tasks: {}, skills: {}, deadlines: {}, weeklyPlans: {}, milestones: {}, courseNotes: {}, reviews: {}, ...progress };
  delete normalized.updatedAt;
  return normalized;
}
const before = await get();
try {
  const now = new Date().toISOString();
  const entries = ids.map((id, index) => ({ [`deadlines.${id}`]: { label: `Temporary API integration check ${index + 1}`, date: '', done: false, updatedAt: now } }));
  const concurrent = await Promise.all(entries.map(change => patch(before.revision, change)));
  assert.deepEqual(concurrent.map(result => result.status).sort(), [200, 409], 'Exactly one concurrent same-revision write must succeed.');
  const winner = concurrent.find(result => result.status === 200);
  const loser = concurrent.findIndex(result => result.status === 409);
  assert.equal(winner.body.revision, before.revision + 1);
  const stale = await patch(before.revision, { currentWeek: before.progress?.currentWeek ?? 1 });
  assert.equal(stale.status, 409, 'Stale writes must fail.');
  assert.equal(stale.body.revision, winner.body.revision);
  const retried = await patch(winner.body.revision, entries[loser]);
  assert.equal(retried.status, 200);
  for (const id of ids) assert.equal(retried.body.progress.deadlines[id].done, false);
  const invalid = await patch(retried.body.revision, { 'tasks.nonexistent-roadmap-task': { status: 'done', actualMinutes: 1, evidence: 'Must never be saved' } });
  assert.equal(invalid.status, 400, 'Unknown curriculum task must be rejected.');
  const forbidden = await patch(retried.body.revision, { currentWeek: 1 }, { Origin: 'https://unrelated.example' });
  assert.equal(forbidden.status, 403);
  const wrongType = await patch(retried.body.revision, { currentWeek: 1 }, { 'Content-Type': 'text/plain' });
  assert.equal(wrongType.status, 415);
  const persisted = await get();
  assert.equal(persisted.revision, retried.body.revision, 'Rejected requests must not mutate the stored revision.');
  for (const id of ids) assert.ok(persisted.progress.deadlines[id], 'Successful changes must survive another request.');
  console.log('PASS: real D1 writes, concurrent CAS, stale rejection, merged retry, validation, origin guard, no-store, subsequent GET persistence.');
} finally {
  if (changed) {
    let removed = false;
    for (let attempt = 0; attempt < 5; attempt++) {
      const current = await get();
      const cleanup = await patch(current.revision, Object.fromEntries(ids.map(id => [`deadlines.${id}`, null])));
      if (cleanup.status === 409) continue;
      assert.equal(cleanup.status, 200, 'Temporary integration entries could not be removed.');
      removed = true;
      break;
    }
    assert.ok(removed, 'Temporary integration entries remain; remove only the api-smoke deadline entries.');
    const after = await get();
    assert.deepEqual(comparable(after.progress), comparable(before.progress), 'Existing learning data changed during the smoke test.');
    console.log('PASS: temporary entries removed; all prior learning data unchanged.');
  }
}
