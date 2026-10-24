import { describe, expect, it } from 'vitest';
import { createProgress, parseProgress, serializeProgress } from './progress';
import { getGoals, getResources, getUnits, resourceCompletion, validateLearningReferences, withCompletionEvents } from './learning';
import { applyChanges, queueChanges, resolveChanges } from './progress-sync';
import { applyProgressPatch, assertProgressLoadable, validateProgressPatch } from './server-progress';
import { topics } from '../data/skills';
import type { LearningActivity, Progress, ResourceUnit } from './types';
const now = '2026-10-24T10:00:00.000Z';
const unit = (id: string, overrides: Partial<ResourceUnit> = {}): ResourceUnit => ({ id, resourceId: 'amazon-java', parentId: '', title: id, kind: 'lesson', url: '', status: 'not-started', notes: '', position: 0, updatedAt: now, archived: false, ...overrides });
const backup = (progress: Progress) => parseProgress(serializeProgress(progress));

describe('learning model defaults and legacy preservation', () => {
  it('exposes defaults without creating any persisted completion or progress', () => {
    const p = createProgress();
    expect(getGoals(p)).toHaveLength(48);
    expect(getGoals(p).every(goal => goal.status === 'planned')).toBe(true);
    expect(getResources(p)).toHaveLength(7);
    expect(getResources(p).every(resource => resource.status === 'not-started')).toBe(true);
    expect(p.goals).toBeUndefined(); expect(p.resources).toBeUndefined();
    expect(resourceCompletion(p, 'amazon-java')).toEqual({ done: 0, total: 0 });
  });
  it('falls back to old course notes until the canonical resource overrides them', () => {
    const p = { ...createProgress(), courseNotes: { 'amazon-java': 'legacy notes' } };
    const resource = getResources(p).find(entry => entry.id === 'amazon-java')!;
    expect(resource.notes).toBe('legacy notes');
    expect(getResources({ ...p, resources: { [resource.id]: { ...resource, notes: '', updatedAt: now } } }).find(entry => entry.id === resource.id)?.notes).toBe('');
  });
  it('roundtrips old and new progress with unknown metadata intact', () => {
    const p = createProgress();
    const resource = { ...getResources(p)[0], status: 'in-progress' as const, updatedAt: now, retainedField: 'legacy' };
    const goal = { ...getGoals(p)[0], week: 0, updatedAt: now };
    const next = { ...p, skills: { 'core-java': { status: 'in-progress' as const, updatedAt: now, notes: 'Keep this' } }, resources: { [resource.id]: resource }, goals: { [goal.id]: goal }, units: { intro: unit('intro') }, customLegacy: { retained: true } };
    expect(backup(next)).toEqual(next);
    expect(backup(p)).toEqual(p);
  });
  it('retains nested future metadata on every new entry through backup and server merge', () => {
    const p = createProgress();
    const future = { format: 2, nested: { labels: ['retain', 'future'] } };
    const resource = { ...getResources(p)[0], updatedAt: now, future };
    const goal = { ...getGoals(p)[0], updatedAt: now, future };
    const activity: LearningActivity & { future: typeof future } = { id: 'manual-study', title: 'Study notes', date: '2026-10-24', kind: 'study', track: 'backend', minutes: null, notes: '', skillId: '', resourceId: '', taskId: '', milestoneId: '', automatic: false, updatedAt: now, future };
    const next = { ...p, resources: { [resource.id]: resource }, goals: { [goal.id]: goal }, units: { intro: { ...unit('intro'), future } }, activities: { [activity.id]: activity } };
    expect(backup(next)).toEqual(next);
    const { future: omitted, ...edited } = resource;
    expect(omitted).toEqual(future);
    const valid = validateProgressPatch({ baseRevision: 1, changes: { [`resources.${resource.id}`]: { ...edited, notes: 'New notes' } } });
    const merged = applyProgressPatch(next as unknown as Record<string, unknown>, valid.changes, now);
    expect((merged.resources as Record<string, unknown>)[resource.id]).toMatchObject({ future, notes: 'New notes' });
    expect(() => assertProgressLoadable(merged)).not.toThrow();
  });
  it('carries a goal to another week or backlog without duplicating its ID', () => {
    const p = createProgress(), original = getGoals(p)[0];
    const moved = { ...p, goals: { [original.id]: { ...original, week: 0, updatedAt: now } } };
    const goals = getGoals(moved);
    expect(goals).toHaveLength(48);
    expect(goals.find(goal => goal.id === original.id)).toMatchObject({ week: 0, originalWeek: original.week });
  });
  it('counts active leaf units instead of also counting parent modules', () => {
    const p = { ...createProgress(), units: { module: unit('module', { kind: 'module', status: 'completed' }), a: unit('a', { parentId: 'module', status: 'completed', position: 2 }), b: unit('b', { parentId: 'module', position: 1 }), archived: unit('archived', { archived: true, status: 'completed' }) } };
    expect(getUnits(p, 'amazon-java').map(entry => entry.id)).toEqual(['module', 'b', 'a']);
    expect(resourceCompletion(p, 'amazon-java')).toEqual({ done: 1, total: 2 });
    expect(resourceCompletion({ ...createProgress(), units: { empty: unit('empty', { kind: 'module', status: 'completed' }) } }, 'amazon-java')).toEqual({ done: 0, total: 0 });
  });
});

describe('reference and import validation', () => {
  it('rejects unsafe URLs without changing the caller document', () => {
    const p = createProgress(), resource = { ...getResources(p)[0], url: 'javascript:alert(1)', updatedAt: now };
    expect(() => backup({ ...p, resources: { [resource.id]: resource } })).toThrow('http');
    expect(p.resources).toBeUndefined();
  });
  it('rejects mismatched keys, impossible dates, and minutes above a day', () => {
    const p = createProgress(), resource = { ...getResources(p)[0], updatedAt: now };
    expect(() => backup({ ...p, resources: { mismatch: resource } })).toThrow('match');
    const activity: LearningActivity = { id: 'study', title: 'Study', date: '2026-02-30', kind: 'study', track: 'backend', minutes: null, notes: '', skillId: '', resourceId: '', taskId: '', milestoneId: '', automatic: false, updatedAt: now };
    expect(() => backup({ ...p, activities: { study: activity } })).toThrow('date');
    expect(() => backup({ ...p, activities: { study: { ...activity, date: '2026-10-24', minutes: 1441 } } })).toThrow();
  });
  it('requires unit parents to be same-resource modules and acyclic', () => {
    const p = createProgress();
    expect(() => validateLearningReferences({ ...p, units: { a: unit('a', { parentId: 'missing' }) } })).toThrow('parents');
    expect(() => validateLearningReferences({ ...p, units: { a: unit('a', { parentId: 'b' }), b: unit('b', { resourceId: 'ibm-data', kind: 'module' }) } })).toThrow('parents');
    expect(() => validateLearningReferences({ ...p, units: { a: unit('a', { parentId: 'b', kind: 'module' }), b: unit('b', { parentId: 'a', kind: 'module' }) } })).toThrow('cycle');
  });
  it('accepts every new map through API validation and protects them from _legacy', () => {
    const p = createProgress(), resource = { ...getResources(p)[0], updatedAt: now };
    const changes = { [`resources.${resource.id}`]: resource, 'units.intro': unit('intro') };
    const valid = validateProgressPatch({ baseRevision: 0, changes });
    expect(() => assertProgressLoadable(applyProgressPatch(null, valid.changes, now))).not.toThrow();
    for (const group of ['goals', 'resources', 'units', 'activities']) expect(() => validateProgressPatch({ baseRevision: 0, changes: { _legacy: { [group]: {} } } })).toThrow();
  });
});

describe('field merges and explicit completion history', () => {
  it('keeps another device resource completion when first editing default metadata', () => {
    const p = createProgress(), original = getResources(p)[0];
    const edited = { ...p, resources: { [original.id]: { ...original, notes: 'Read examples', updatedAt: now } } };
    const pending = queueChanges({}, p, edited);
    const remote = { ...p, resources: { [original.id]: { ...original, status: 'completed' as const, updatedAt: now } } };
    const merged = applyChanges(remote, pending);
    expect(merged.resources?.[original.id]).toMatchObject({ status: 'completed', notes: 'Read examples' });
    expect(() => backup(merged)).not.toThrow();
  });
  it('keeps separate unit updates and blocks old queued legacy map overwrites', () => {
    const p = { ...createProgress(), units: { a: unit('a'), b: unit('b') } };
    const pending = queueChanges({}, p, { ...p, units: { ...p.units, a: { ...p.units.a, notes: 'A' } } });
    const remote = { ...p, units: { ...p.units, b: { ...p.units.b, status: 'completed' as const } } };
    expect(applyChanges(remote, pending).units).toMatchObject({ a: { notes: 'A' }, b: { status: 'completed' } });
    expect(resolveChanges(remote, { _legacy: { mode: 'merge', value: { goals: {}, resources: {}, units: {}, activities: {}, customOld: true } } })).toEqual({ _legacy: { customOld: true } });
    expect(applyChanges(remote, { _legacy: { mode: 'merge', value: { goals: {}, resources: {}, units: {}, activities: {} } } })).toEqual(remote);
  });
  it('logs genuine explicit completion once without inventing study minutes', () => {
    const p = createProgress(), topic = topics[0];
    const completed = { ...p, skills: { [topic.id]: { status: 'completed' as const, updatedAt: now } } };
    const logged = withCompletionEvents(p, completed);
    expect(Object.values(logged.activities ?? {})).toMatchObject([{ kind: 'skill', skillId: topic.id, minutes: null, automatic: true }]);
    expect(withCompletionEvents(logged, { ...logged, skills: { [topic.id]: { ...logged.skills![topic.id], notes: 'Notes only' } } }).activities).toEqual(logged.activities);
    expect(backup(completed).activities).toBeUndefined();
  });
  it('records an explicit project milestone unit as project activity', () => {
    const p = { ...createProgress(), units: { milestone: unit('milestone', { kind: 'milestone' }) } };
    const completed = { ...p, units: { milestone: { ...p.units.milestone, status: 'completed' as const } } };
    expect(Object.values(withCompletionEvents(p, completed).activities ?? {})).toMatchObject([{ kind: 'project', resourceId: 'amazon-java', automatic: true, minutes: null }]);
  });

});
