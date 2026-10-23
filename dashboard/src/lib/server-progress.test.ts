import { describe, expect, it } from 'vitest';
import { applyProgressPatch, assertProgressLoadable, sameOriginMutation, validateProgressPatch } from './server-progress';

const now = '2026-10-23T12:00:00.000Z';
const task = { status: 'done', actualMinutes: 45, evidence: 'mvn test passes' };
const patch = (changes: Record<string, unknown>) => validateProgressPatch({ baseRevision: 0, changes });

describe('server progress patches', () => {
  it('creates a complete progress document without inferring completion', () => {
    const valid = patch({ currentWeek: 2, 'tasks.w01-d1-b-1': task });
    const result = applyProgressPatch(null, valid.changes, now);
    expect(result).toMatchObject({ currentWeek: 2, tasks: { 'w01-d1-b-1': task }, skills: {}, deadlines: {}, updatedAt: now });
  });
  it('preserves unknown legacy fields, untouched entries, and newer task metadata', () => {
    const existing = { customLegacy: { notes: ['retain'] }, tasks: { known: { ...task, futureMetadata: 'retain' }, untouched: task }, skills: { oop: { status: 'completed', updatedAt: now } } };
    const result = applyProgressPatch(existing, patch({ 'tasks.known': { ...task, status: 'in-progress' } }).changes, now);
    expect(result).toMatchObject({ customLegacy: existing.customLegacy, tasks: { known: { status: 'in-progress', futureMetadata: 'retain' }, untouched: task }, skills: existing.skills });
    expect(existing.tasks.known.status).toBe('done');
  });
  it('migrates unknown root fields losslessly without adding a wire-only _legacy field', () => {
    const legacy = { customLegacy: { notes: ['retain'], version: 2 }, oldPreference: true };
    const result = applyProgressPatch({ currentWeek: 3, otherHistory: 'keep' }, patch({ _legacy: legacy }).changes, now);
    expect(result).toMatchObject({ ...legacy, currentWeek: 3, otherHistory: 'keep' });
    expect(result).not.toHaveProperty('_legacy');
  });
  it.each(['currentWeek', 'startDate', 'updatedAt', 'tasks', 'skills', 'deadlines', 'weeklyPlans', 'milestones', 'courseNotes', 'reviews', '_legacy'])('prevents _legacy from overwriting the core field %s', key => {
    expect(() => patch({ _legacy: { [key]: null } })).toThrow();
  });
  it('rejects forbidden keys and invalid deep values in _legacy', () => {
    expect(() => patch({ _legacy: JSON.parse('{\"__proto__\":{\"polluted\":true}}') })).toThrow();
    expect(() => patch({ _legacy: { extra: 'x'.repeat(20001) } })).toThrow();
  });
  it('supports entry deletion while preserving other history', () => {
    const result = applyProgressPatch({ reviews: { '1': 'old', '2': 'keep' } }, patch({ 'reviews.1': null }).changes, now);
    expect(result.reviews).toEqual({ '2': 'keep' });
  });
  it('can merge independent queued changes after another device writes', () => {
    const a = applyProgressPatch(null, patch({ 'skills.oop': { status: 'completed', updatedAt: now } }).changes, now);
    const b = applyProgressPatch(a, patch({ 'tasks.example': task, 'deadlines.lab': { label: 'AGH lab', date: '2026-10-26', done: false, updatedAt: now } }).changes, now);
    expect(b).toMatchObject({ skills: { oop: { status: 'completed' } }, tasks: { example: task }, deadlines: { lab: { done: false } } });
  });
  it('accepts all supported field families including legacy metadata', () => {
    expect(() => patch({ currentWeek: 12, startDate: '2026-10-23', 'weeklyPlans.12': { hours: 20, aghHours: 4 }, 'milestones.m1': { verified: true, evidence: 'working CLI' }, 'courseNotes.amazon-java': 'Read chapter', 'reviews.2': 'Review', 'tasks.x': { ...task, extra: { legacy: true } } })).not.toThrow();
  });
  it.each([
    { currentWeek: 13 }, { currentWeek: 1.5 }, { startDate: '2026-02-30' },
    { 'weeklyPlans.13': null }, { 'reviews.0': 'oops' },
    { 'weeklyPlans.1': { hours: 20, aghHours: 21 } },
    { 'tasks.x': { ...task, actualMinutes: -1 } },
    { 'tasks.x': { ...task, status: 'completed' } },
    { 'tasks.x': { ...task, evidence: 'x'.repeat(5001) } },
    { 'milestones.m1': { verified: true, evidence: '' } },
    { 'skills.core': { status: 'done', updatedAt: now } },
    { 'skills.core': { status: 'completed', updatedAt: 'invalid' } },
    { 'deadlines.lab': { label: 'lab', date: '2026-02-30', done: false, updatedAt: now } },
    { 'tasks.__proto__': task }, { 'tasks.x.status': 'done' }, { 'unknown.key': true },
    { updatedAt: now }, { tasks: {} }, { currentWeek: null },
  ])('rejects invalid or unauthorized patch paths/values: %j', changes => {
    expect(() => patch(changes)).toThrow();
  });
  it('rejects prototype pollution inside retained extra metadata', () => {
    const malicious = JSON.parse('{"baseRevision":0,"changes":{"tasks.x":{"status":"done","actualMinutes":1,"evidence":"","metadata":{"__proto__":{"polluted":true}}}}}');
    expect(() => validateProgressPatch(malicious)).toThrow();
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });
  it('rejects empty patches and invalid revisions', () => {
    expect(() => patch({})).toThrow();
    expect(() => validateProgressPatch({ baseRevision: -1, changes: { currentWeek: 1 } })).toThrow();
    expect(() => validateProgressPatch({ baseRevision: 0.2, changes: { currentWeek: 1 } })).toThrow();
  });
  it('bounds a complete stored document even when old data is retained', () => {
    expect(() => applyProgressPatch({ legacy: 'x'.repeat(2_000_000) }, { currentWeek: 1 }, now)).toThrow();
  });
});

describe('final client-loadable document validation', () => {
  it('accepts valid roadmap tasks and leaves retained legacy metadata intact', () => {
    const doc = applyProgressPatch(null, patch({ 'tasks.w01-d1-b-1': { ...task, retainedMeta: 42 }, _legacy: { customLegacy: { retained: true } } }).changes, now);
    expect(() => assertProgressLoadable(doc)).not.toThrow();
    expect(doc).toMatchObject({ customLegacy: { retained: true }, tasks: { 'w01-d1-b-1': { retainedMeta: 42 } } });
  });
  it('rejects an unknown task even when its entry is individually valid', () => {
    const doc = applyProgressPatch(null, patch({ 'tasks.unknown-task': task }).changes, now);
    expect(() => assertProgressLoadable(doc)).toThrow('Unknown task');
  });
  it('rejects verifying a milestone before its prerequisites', () => {
    const doc = applyProgressPatch(null, patch({ 'milestones.m2': { verified: true, evidence: 'tested' } }).changes, now);
    expect(() => assertProgressLoadable(doc)).toThrow('dependencies');
  });
  it('rejects removing a prerequisite for an already verified milestone', () => {
    const doc = applyProgressPatch(null, patch({ 'milestones.m1': { verified: true, evidence: 'CLI' }, 'milestones.m2': { verified: true, evidence: 'HTTP' } }).changes, now);
    expect(() => assertProgressLoadable(doc)).not.toThrow();
    const broken = applyProgressPatch(doc, patch({ 'milestones.m1': null }).changes, now);
    expect(() => assertProgressLoadable(broken)).toThrow('dependencies');
  });
});

describe('same-origin mutation protection', () => {
  it('accepts same-origin browser updates and owner service calls', () => {
    expect(sameOriginMutation(new Request('https://private.example/api/progress', { headers: { Origin: 'https://private.example', 'Sec-Fetch-Site': 'same-origin' } }))).toBe(true);
    expect(sameOriginMutation(new Request('https://private.example/api/progress'))).toBe(true);
  });
  it('rejects cross-origin updates and sandboxed null origins', () => {
    expect(sameOriginMutation(new Request('https://private.example/api/progress', { headers: { Origin: 'https://evil.example' } }))).toBe(false);
    expect(sameOriginMutation(new Request('https://private.example/api/progress', { headers: { Origin: 'null' } }))).toBe(false);
    expect(sameOriginMutation(new Request('https://private.example/api/progress', { headers: { 'Sec-Fetch-Site': 'cross-site' } }))).toBe(false);
  });
});
