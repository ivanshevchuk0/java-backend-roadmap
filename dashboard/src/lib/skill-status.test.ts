import { describe, expect, it } from 'vitest';
import { allTopics, optionalSkillIds } from '../data/skill-catalog';
import { topics as originalTopics } from '../data/skills';
import { createProgress, parseProgress, serializeProgress } from './progress';
import { getResources, validateLearningReferences, withCompletionEvents } from './learning';
import { applyProgressPatch, assertProgressLoadable, validateProgressPatch } from './server-progress';
import type { LearningActivity, SkillStatus, TopicStatus } from './types';

const now = '2026-10-24T15:00:00.000Z';
const optionalId = () => {
  const value = [...optionalSkillIds][0];
  expect(value).toBeTruthy(); return value;
};
const essentialId = () => {
  const value = allTopics.find(topic => !optionalSkillIds.has(topic.id))!.id;
  expect(value).toBeTruthy(); return value;
};

describe('known skill skipping without a storage migration', () => {
  it('roundtrips skipped optional skills with notes and unknown metadata', () => {
    const id = optionalId();
    const p = { ...createProgress(), skills: { [id]: { status: 'skipped' as const, updatedAt: now, notes: 'Later, after AGH exams', future: { retained: ['yes'] } } }, legacyRoot: { retained: true } };
    expect(parseProgress(serializeProgress(p))).toEqual(p);
    const patch = validateProgressPatch({ baseRevision: 8, changes: { [`skills.${id}`]: p.skills[id] } });
    const saved = applyProgressPatch(null, patch.changes, now);
    expect(() => assertProgressLoadable(saved)).not.toThrow();
    expect(saved.skills).toEqual(p.skills);
  });
  it('allows skipped essential skills but rejects unknown skipped skills', () => {
    const known = essentialId();
    const entry = { status: 'skipped' as const, updatedAt: now, notes: 'Personal learning choice' };
    expect(() => parseProgress(serializeProgress({ ...createProgress(), skills: { [known]: entry } }))).not.toThrow();
    expect(() => validateProgressPatch({ baseRevision: 0, changes: { [`skills.${known}`]: entry } })).not.toThrow();
    for (const id of ['unknown-future-skill']) {
      const value = { status: 'skipped', updatedAt: now, notes: '' };
      expect(() => parseProgress(serializeProgress({ ...createProgress(), skills: { [id]: value } } as unknown as ReturnType<typeof createProgress>))).toThrow('known');
      expect(() => validateProgressPatch({ baseRevision: 0, changes: { [`skills.${id}`]: value } })).toThrow();
    }
  });
  it('keeps all three legacy states and safe unknown skill entries readable and writable', () => {
    for (const status of ['not-started', 'in-progress', 'completed'] as const) {
      const id = 'retained-future-skill';
      const entry = { status, updatedAt: now, notes: 'Retain', unknown: { future: true } };
      const p = { ...createProgress(), skills: { [id]: entry } };
      expect(parseProgress(serializeProgress(p))).toEqual(p);
      expect(() => validateProgressPatch({ baseRevision: 0, changes: { [`skills.${id}`]: entry } })).not.toThrow();
    }
  });
  it('never treats skipped skills as completed or creates completion events for a skip', () => {
    const before = createProgress(), id = optionalId();
    const skipped = withCompletionEvents(before, { ...before, skills: { [id]: { status: 'skipped', updatedAt: now } } });
    expect(skipped.activities).toBeUndefined();
    const completed = withCompletionEvents(skipped, { ...skipped, skills: { [id]: { status: 'completed', updatedAt: now } } });
    expect(Object.values(completed.activities ?? {})).toMatchObject([{ skillId: id, kind: 'skill', minutes: null }]);
  });
  it('retains three-state unit validation and never permits a skipped resource unit', () => {
    const p = createProgress();
    const invalid = { id: 'unit', resourceId: 'amazon-java', parentId: '', title: 'Lesson', kind: 'lesson', url: '', status: 'skipped', notes: '', position: 0, updatedAt: now, archived: false };
    expect(() => parseProgress(serializeProgress({ ...p, units: { unit: invalid } } as unknown as ReturnType<typeof createProgress>))).toThrow();
    expect(() => validateProgressPatch({ baseRevision: 0, changes: { 'units.unit': invalid } })).toThrow();
    const skillStatus: SkillStatus = 'skipped';
    const unitStatus: TopicStatus = 'completed';
    expect(skillStatus).toBe('skipped'); expect(unitStatus).toBe('completed');
  });
  it('accepts new Java map IDs in resource, goal and activity references without seeding progress', () => {
    const oldIds = new Set(originalTopics.map(topic => topic.id));
    const newTopic = allTopics.find(topic => !oldIds.has(topic.id));
    expect(newTopic).toBeTruthy();
    const p = createProgress(), resource = { ...getResources(p)[0], skillIds: [newTopic!.id], updatedAt: now };
    const activity: LearningActivity = { id: 'reference', date: '2026-10-24', kind: 'study', title: 'Java topic', track: 'backend', minutes: null, notes: '', skillId: newTopic!.id, resourceId: '', taskId: '', milestoneId: '', automatic: false, updatedAt: now };
    const next = { ...p, resources: { [resource.id]: resource }, activities: { reference: activity } };
    expect(() => validateLearningReferences(next)).not.toThrow();
    expect(() => parseProgress(serializeProgress(next))).not.toThrow();
    expect(p.skills).toBeUndefined(); expect(p.resources).toBeUndefined();
  });
});
