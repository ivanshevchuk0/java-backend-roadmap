import { describe, expect, it } from 'vitest';
import { createProgress, parseProgress, serializeProgress } from './progress';
import { getGoals, getResources, withCompletionEvents } from './learning';
import { applyProgressPatch, assertProgressLoadable, validateProgressPatch } from './server-progress';
import type { LearningActivity, Progress } from './types';
const now = '2026-10-24T20:00:00.000Z';
const id = 'ref-java-ReferenceNode123456789';

describe('sparse runtime-reference skill progress', () => {
  it('roundtrips all four states and retains label, track, notes, and future metadata', () => {
    for (const status of ['not-started', 'in-progress', 'completed', 'skipped'] as const) {
      const entry = { status, updatedAt: now, label: 'My reference topic', track: 'backend' as const, notes: 'Personal note', future: { retain: true } };
      const p = { ...createProgress(), skills: { [id]: entry }, customRoot: { retain: true } };
      expect(parseProgress(serializeProgress(p))).toEqual(p);
      const patch = validateProgressPatch({ baseRevision: 0, changes: { [`skills.${id}`]: entry } });
      const saved = applyProgressPatch(null, patch.changes, now);
      expect(() => assertProgressLoadable(saved)).not.toThrow();
      expect(saved.skills).toEqual(p.skills);
    }
    expect(createProgress().skills).toBeUndefined();
  });
  it('rejects invalid reference skips and invalid metadata without damaging old data', () => {
    for (const [key, value] of [
      ['ref-java-short', { status: 'skipped', updatedAt: now }],
      [id, { status: 'completed', updatedAt: now, label: 'x'.repeat(301) }],
      [id, { status: 'completed', updatedAt: now, track: 'unknown' }],
    ] as const) {
      expect(() => parseProgress(serializeProgress({ ...createProgress(), skills: { [key]: value } } as unknown as Progress))).toThrow();
      expect(() => validateProgressPatch({ baseRevision: 0, changes: { [`skills.${key}`]: value } })).toThrow();
    }
  });
  it('accepts reference IDs in linked resources, goals, and manual activity history', () => {
    const p = createProgress();
    const resource = { ...getResources(p)[0], updatedAt: now, skillIds: [id] };
    const goal = { ...getGoals(p)[0], updatedAt: now, skillIds: [id] };
    const activity: LearningActivity = { id: 'study-ref', date: '2026-10-24', kind: 'study', title: 'Reference study', track: 'backend', minutes: null, notes: '', skillId: id, resourceId: '', taskId: '', milestoneId: '', automatic: false, updatedAt: now };
    expect(() => parseProgress(serializeProgress({ ...p, resources: { [resource.id]: resource }, goals: { [goal.id]: goal }, activities: { [activity.id]: activity } }))).not.toThrow();
  });
  it('logs explicit completion using the saved label and never logs skip or import', () => {
    const before = createProgress();
    const completed = { ...before, skills: { [id]: { status: 'completed' as const, updatedAt: now, label: 'Saved node label', track: 'backend' as const } } };
    const logged = withCompletionEvents(before, completed);
    expect(Object.values(logged.activities ?? {})).toMatchObject([{ title: 'Saved node label', skillId: id, kind: 'skill', minutes: null }]);
    expect(parseProgress(serializeProgress(completed)).activities).toBeUndefined();
    expect(withCompletionEvents(before, { ...before, skills: { [id]: { ...completed.skills[id], status: 'skipped' } } }).activities).toBeUndefined();
    expect(withCompletionEvents(before, { ...before, skills: { [id]: { status: 'completed', updatedAt: now } } }).activities).toBeUndefined();
  });
  it('does not infer skill mastery from a completed linked course', () => {
    const before = createProgress(), resource = { ...getResources(before)[0], skillIds: [id], status: 'completed' as const, updatedAt: now };
    const logged = withCompletionEvents(before, { ...before, resources: { [resource.id]: resource } });
    expect(logged.skills).toBeUndefined();
    expect(Object.values(logged.activities ?? {}).every(activity => activity.kind === 'course')).toBe(true);
  });
});
