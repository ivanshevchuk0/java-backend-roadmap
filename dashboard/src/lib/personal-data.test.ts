import { describe, expect, it } from 'vitest';
import { createProgress, parseProgress, serializeProgress } from './progress';
import { getLearningHistory, withCompletionEvents } from './learning';
import { applyChanges, legacyChanges, MAP_KEYS, queueChanges, resolveChanges } from './progress-sync';
import { applyProgressPatch, assertProgressLoadable, validateProgressPatch } from './server-progress';
import type { LearningActivity, Progress, ProjectProgress, StudySession } from './types';
const now = '2026-10-24T20:00:00.000Z';
const project = (overrides: Partial<ProjectProgress> = {}): ProjectProgress => ({ id: 'my-project', title: 'My backend', track: 'backend', status: 'not-started', repositoryUrl: '', notes: '', updatedAt: now, archived: false, ...overrides });
const session = (overrides: Partial<StudySession> = {}): StudySession => ({ id: 'my-session', title: 'Core Java practice', track: 'backend', date: '2026-10-24', status: 'planned', plannedMinutes: 60, actualMinutes: null, skillId: '', resourceId: '', notes: '', updatedAt: now, archived: false, ...overrides });
const roundtrip = (progress: Progress) => parseProgress(serializeProgress(progress));

describe('additive personal projects and sessions', () => {
  it('preserves old backups and never seeds new records', () => {
    const old = { ...createProgress(), skills: { 'retained-future': { status: 'completed' as const, updatedAt: now, extra: true } }, customLegacy: { retain: ['yes'] } };
    expect(roundtrip(old)).toEqual(old);
    expect(createProgress().projects).toBeUndefined(); expect(createProgress().sessions).toBeUndefined();
    expect(getLearningHistory(old)).toEqual([]);
  });
  it('roundtrips both maps and unknown entry metadata unchanged', () => {
    const p = { ...createProgress(), projects: { 'my-project': { ...project(), future: { retain: true } } }, sessions: { 'my-session': { ...session({ skillId: 'ref-backend-ReferenceNode123456789', resourceId: 'amazon-java' }), future: { retain: ['yes'] } } }, extraRoot: true };
    expect(roundtrip(p)).toEqual(p);
  });
  it('passes both new maps through existing API validation and preserves unknown fields on updates', () => {
    const changes = { 'projects.my-project': { ...project(), future: { keep: true } }, 'sessions.my-session': session({ skillId: 'core-java', resourceId: 'amazon-java' }) };
    const patch = validateProgressPatch({ baseRevision: 0, changes });
    const saved = applyProgressPatch(null, patch.changes, now);
    expect(() => assertProgressLoadable(saved)).not.toThrow();
    const updated = applyProgressPatch(saved, validateProgressPatch({ baseRevision: 1, changes: { 'projects.my-project': project({ notes: 'Added notes' }) } }).changes, now);
    expect((updated.projects as Record<string, unknown>)['my-project']).toMatchObject({ future: { keep: true }, notes: 'Added notes' });
  });
  it.each([
    project({ repositoryUrl: 'javascript:alert(1)' }), project({ repositoryUrl: 'https://user:secret@example.com' }),
    project({ status: 'skipped' as ProjectProgress['status'] }), project({ notes: 'x'.repeat(5001) }),
  ])('rejects unsafe project values', entry => {
    expect(() => roundtrip({ ...createProgress(), projects: { [entry.id]: entry } })).toThrow();
    expect(() => validateProgressPatch({ baseRevision: 0, changes: { [`projects.${entry.id}`]: entry } })).toThrow();
  });
  it.each([
    session({ date: '2026-02-30' }), session({ plannedMinutes: 0 }), session({ plannedMinutes: 721 }), session({ plannedMinutes: 1.5 }),
    session({ actualMinutes: -1 }), session({ actualMinutes: 1441 }), session({ actualMinutes: 1.5 }),
  ])('rejects invalid session date or time limits', entry => {
    expect(() => roundtrip({ ...createProgress(), sessions: { [entry.id]: entry } })).toThrow();
    expect(() => validateProgressPatch({ baseRevision: 0, changes: { [`sessions.${entry.id}`]: entry } })).toThrow();
  });
  it('rejects unknown session references before committing the complete document', () => {
    for (const entry of [session({ skillId: 'not-a-known-skill' }), session({ resourceId: 'not-an-existing-resource' })]) {
      const patch = validateProgressPatch({ baseRevision: 0, changes: { [`sessions.${entry.id}`]: entry } });
      expect(() => assertProgressLoadable(applyProgressPatch(null, patch.changes, now))).toThrow('session');
    }
  });
});

describe('derived session history and explicit project completion', () => {
  it('retains entered actual minutes for partial sessions, completion without time, and zero', () => {
    const manual: LearningActivity = { id: 'manual', date: '2026-10-23', kind: 'study', title: 'Earlier work', track: 'agh', minutes: 20, notes: '', skillId: '', resourceId: '', taskId: '', milestoneId: '', automatic: false, updatedAt: now };
    const p = { ...createProgress(), activities: { manual }, sessions: { planned: session({ id: 'planned', actualMinutes: 40 }), unknown: session({ id: 'unknown', status: 'completed', plannedMinutes: 720 }), zero: session({ id: 'zero', status: 'completed', actualMinutes: 0 }), archived: session({ id: 'archived', status: 'completed', actualMinutes: 60, archived: true }) } };
    const history = getLearningHistory(p);
    expect(history).toHaveLength(4);
    expect(history.find(entry => entry.sessionId === 'unknown')).toMatchObject({ id: 'session-history-unknown', date: '2026-10-24', minutes: null, kind: 'study', automatic: true });
    expect(history.find(entry => entry.sessionId === 'zero')?.minutes).toBe(0);
    expect(history.find(entry => entry.sessionId === 'planned')).toMatchObject({ minutes: 40, automatic: false, sessionStatus: 'planned' });
    expect(p.activities).toEqual({ manual });
  });
  it('does not persist a duplicate session event or infer skill mastery', () => {
    const before = createProgress();
    const next = withCompletionEvents(before, { ...before, sessions: { 'my-session': session({ status: 'completed', skillId: 'core-java', actualMinutes: 45 }) } });
    expect(next.activities).toBeUndefined(); expect(next.skills).toBeUndefined();
    expect(getLearningHistory(next)).toHaveLength(1);
    expect(roundtrip(next).activities).toBeUndefined();
  });
  it('logs genuine project completion once and retains history after project archival', () => {
    const before = createProgress();
    const completed = { ...before, projects: { 'my-project': project({ status: 'completed' }) } };
    expect(roundtrip(completed).activities).toBeUndefined();
    const logged = withCompletionEvents(before, completed);
    expect(Object.values(logged.activities ?? {})).toMatchObject([{ kind: 'project', projectId: 'my-project', title: 'My backend', minutes: null }]);
    const archived = withCompletionEvents(logged, { ...logged, projects: { 'my-project': project({ status: 'completed', archived: true }) } });
    expect(archived.activities).toEqual(logged.activities); expect(archived.skills).toBeUndefined();
    expect(getLearningHistory(archived)).toHaveLength(1);
  });
});

describe('existing field-level synchronization for new maps', () => {
  it('merges project notes and session planned time without overwriting remote status or actual time', () => {
    const before = { ...createProgress(), projects: { 'my-project': project() }, sessions: { 'my-session': session() } };
    const local = { ...before, projects: { 'my-project': project({ notes: 'Local notes' }) }, sessions: { 'my-session': session({ plannedMinutes: 30 }) } };
    const remote = { ...before, projects: { 'my-project': project({ status: 'completed' }) }, sessions: { 'my-session': session({ status: 'completed', actualMinutes: 50 }) } };
    const merged = applyChanges(remote, queueChanges({}, before, local));
    expect(merged.projects?.['my-project']).toMatchObject({ notes: 'Local notes', status: 'completed' });
    expect(merged.sessions?.['my-session']).toMatchObject({ plannedMinutes: 30, status: 'completed', actualMinutes: 50 });
    expect(() => roundtrip(merged)).not.toThrow();
  });
  it('includes new maps in imports, offline migration, and old-client legacy protection', () => {
    expect(MAP_KEYS).toContain('projects'); expect(MAP_KEYS).toContain('sessions');
    const local = { ...createProgress(), projects: { 'my-project': project() }, sessions: { 'my-session': session() } };
    expect(resolveChanges(null, legacyChanges(local, null))).toMatchObject({ 'projects.my-project': local.projects['my-project'], 'sessions.my-session': local.sessions['my-session'] });
    expect(resolveChanges(local, { _legacy: { mode: 'merge', value: { projects: {}, sessions: {}, retainedLegacy: true } } })).toEqual({ _legacy: { retainedLegacy: true } });
    for (const group of ['projects', 'sessions']) expect(() => validateProgressPatch({ baseRevision: 0, changes: { _legacy: { [group]: {} } } })).toThrow();
  });
});
