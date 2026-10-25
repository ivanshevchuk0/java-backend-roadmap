import { describe, expect, it } from 'vitest';
import { createProgress, parseProgress, serializeProgress } from './progress';
import { getLearningHistory, withCompletionEvents } from './learning';
import { applyChanges, legacyChanges, MAP_KEYS, queueChanges, resolveChanges } from './progress-sync';
import { applyProgressPatch, assertProgressLoadable, validateProgressPatch } from './server-progress';
import { getStudySessions, monthDates, routineSessionId, shiftDate, summarizeSessions, weekDates } from './study-planner';
import type { Progress, StudyRoutine, StudySession } from './types';

const now = '2026-10-25T12:00:00.000Z';
const rule = (overrides: Partial<StudyRoutine> = {}): StudyRoutine => ({ id: 'daily-java', title: 'Java practice', track: 'backend', startDate: '2026-10-25', endDate: '', weekdays: [0, 1, 2, 3, 4, 5, 6], plannedMinutes: 60, skillId: 'core-java', resourceId: 'amazon-java', projectId: 'study-task-backend', notes: '', updatedAt: now, archived: false, ...overrides });
const session = (overrides: Partial<StudySession> = {}): StudySession => ({ id: 'one-session', title: 'Practice', track: 'backend', date: '2026-10-25', status: 'planned', plannedMinutes: 60, actualMinutes: null, skillId: '', resourceId: '', projectId: '', notes: '', updatedAt: now, archived: false, ...overrides });
const withRule = (routine = rule()): Progress => ({ ...createProgress(), routines: { [routine.id]: routine } });
const roundtrip = (progress: Progress) => parseProgress(serializeProgress(progress));

describe('calendar dates, including local DST transitions', () => {
  it('keeps day offsets and Monday weeks stable over Warsaw DST boundaries', () => {
    for (const tz of ['Europe/Warsaw', 'America/Los_Angeles', 'Pacific/Kiritimati']) {
      const previous = process.env.TZ;
      try {
        process.env.TZ = tz;
        expect(shiftDate('2026-03-28', 1)).toBe('2026-03-29');
        expect(shiftDate('2026-03-29', 1)).toBe('2026-03-30');
        expect(shiftDate('2026-10-25', 1)).toBe('2026-10-26');
        expect(weekDates('2026-10-25')).toEqual(['2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23', '2026-10-24', '2026-10-25']);
      } finally { if (previous === undefined) delete process.env.TZ; else process.env.TZ = previous; }
    }
  });
  it('handles month/year boundaries and leap years without inferred timestamps', () => {
    expect(shiftDate('2026-12-31', 1)).toBe('2027-01-01');
    expect(monthDates('2024-02-20')).toHaveLength(29);
    expect(monthDates('2026-02-20').at(-1)).toBe('2026-02-28');
    expect(weekDates('2026-01-01')[0]).toBe('2025-12-29');
  });
  it.each(['2026-02-30', '2026-2-01', '', 'not-a-date'])('rejects invalid date %s', date => {
    expect(() => shiftDate(date, 1)).toThrow(); expect(() => weekDates(date)).toThrow();
  });
});

describe('sparse recurring activities', () => {
  it('creates stable bounded IDs from the whole routine ID and occurrence date', () => {
    const long = 'x'.repeat(120);
    const id = routineSessionId(long, '2026-10-25');
    expect(id.length).toBeLessThanOrEqual(120); expect(id).toMatch(/^[a-zA-Z0-9_-]+$/);
    expect(routineSessionId(long, '2026-10-25')).toBe(id);
    expect(routineSessionId(`${'x'.repeat(119)}y`, '2026-10-25')).not.toBe(id);
    expect(routineSessionId(long, '2026-10-26')).not.toBe(id);
  });
  it('generates only matching inclusive weekdays without changing any saved data', () => {
    const p = withRule(rule({ startDate: '2026-10-25', endDate: '2026-10-28', weekdays: [1, 3] }));
    const before = JSON.stringify(p);
    const result = getStudySessions(p, '2026-10-24', '2026-10-31');
    expect(result.map(entry => entry.date)).toEqual(['2026-10-26', '2026-10-28']);
    expect(result[0]).toMatchObject({ routineId: 'daily-java', occurrenceDate: '2026-10-26', status: 'planned', actualMinutes: null, projectId: 'study-task-backend' });
    expect(JSON.stringify(p)).toBe(before); expect(p.sessions).toBeUndefined(); expect(getLearningHistory(p)).toEqual([]);
  });
  it('uses a saved completion instead of a virtual duplicate', () => {
    const p = withRule(); const first = getStudySessions(p, '2026-10-25', '2026-10-25')[0];
    p.sessions = { [first.id]: { ...first, status: 'completed', actualMinutes: 42 } };
    expect(getStudySessions(roundtrip(p), '2026-10-25', '2026-10-25')).toEqual([p.sessions[first.id]]);
    expect(getLearningHistory(p)).toMatchObject([{ sessionId: first.id, projectId: 'study-task-backend', minutes: 42 }]);
  });
  it('does not resurrect skipped, archived or rescheduled occurrences', () => {
    const p = withRule(); const first = getStudySessions(p, '2026-10-25', '2026-10-25')[0];
    p.sessions = { [first.id]: { ...first, status: 'skipped' } };
    expect(getStudySessions(p, '2026-10-25', '2026-10-25').map(entry => entry.status)).toEqual(['skipped']);
    p.sessions[first.id] = { ...first, archived: true };
    expect(getStudySessions(p, '2026-10-25', '2026-10-25')).toEqual([]);
    p.sessions[first.id] = { ...first, date: '2026-10-27' };
    expect(getStudySessions(p, '2026-10-25', '2026-10-25')).toEqual([]);
    const moved = getStudySessions(p, '2026-10-27', '2026-10-27');
    expect(moved).toHaveLength(2); // moved work + the distinct normal Tuesday occurrence
    expect(moved.filter(entry => entry.id === first.id)).toMatchObject([{ date: '2026-10-27', occurrenceDate: '2026-10-25' }]);
  });
  it('honors recurrence edits for future virtual entries and retains explicit history after archiving', () => {
    const p = withRule(); const first = getStudySessions(p, '2026-10-25', '2026-10-25')[0];
    p.sessions = { [first.id]: { ...first, status: 'completed' } };
    p.routines!['daily-java'] = { ...rule(), plannedMinutes: 30, title: 'New focus' };
    expect(getStudySessions(p, '2026-10-25', '2026-10-26').map(entry => entry.plannedMinutes)).toEqual([60, 30]);
    p.routines!['daily-java'].archived = true;
    expect(getStudySessions(p, '2026-10-25', '2026-10-26')).toEqual([p.sessions[first.id]]);
    delete p.routines!['daily-java'];
    expect(() => roundtrip(p)).not.toThrow(); expect(getLearningHistory(p)).toHaveLength(1);
  });
  it('prioritizes AGH in each calendar day and limits virtual generation range', () => {
    const p = { ...withRule(), sessions: { agh: session({ id: 'agh', title: 'Operating Systems lab', track: 'agh' }) } };
    expect(getStudySessions(p, '2026-10-25', '2026-10-25')[0].id).toBe('agh');
    expect(getStudySessions(p, '2026-10-25', shiftDate('2026-10-25', 61))).toHaveLength(63);
    expect(() => getStudySessions(p, '2026-10-25', shiftDate('2026-10-25', 62))).toThrow('1–62');
    expect(() => getStudySessions(p, '2026-10-26', '2026-10-25')).toThrow();
  });
});

describe('honest completion and time summaries', () => {
  it('separates planned, completed and actual minutes without counting skipped work or guessing time', () => {
    const entries = [session({ id: 'p', actualMinutes: 100 }), session({ id: 'c', status: 'completed', plannedMinutes: 90 }), session({ id: 'timed', status: 'completed', actualMinutes: 42 }), session({ id: 'zero', status: 'completed', actualMinutes: 0 }), session({ id: 's', status: 'skipped', actualMinutes: 50 }), session({ id: 'archived', status: 'completed', actualMinutes: 60, archived: true })];
    expect(summarizeSessions(entries)).toEqual({ total: 5, completed: 3, skipped: 1, percentage: 75, plannedMinutes: 270, completedPlannedMinutes: 210, actualMinutes: 192, actualCount: 4 });
    expect(summarizeSessions([session({ status: 'skipped' })]).percentage).toBe(0);
    expect(summarizeSessions([]).percentage).toBe(0);
  });
  it('completion never alters roadmap, resource, project or legacy task progress', () => {
    const before = withRule(); const occurrence = getStudySessions(before, '2026-10-25', '2026-10-25')[0];
    const after = withCompletionEvents(before, { ...before, sessions: { [occurrence.id]: { ...occurrence, status: 'completed' } } });
    expect(after.skills).toBeUndefined(); expect(after.resources).toBeUndefined(); expect(after.projects).toBeUndefined();
    expect(after.tasks).toEqual({}); expect(after.activities).toBeUndefined();
    expect(getLearningHistory(after)).toHaveLength(1);
  });
});

describe('recurring planner validation, export/import, and API sync', () => {
  it('keeps old records unchanged and preserves new optional/unknown metadata', () => {
    expect(createProgress().routines).toBeUndefined();
    const p = { ...withRule(), sessions: { old: session({ id: 'old' }) }, oldCustom: true };
    Object.assign(p.routines!['daily-java'], { futureSetting: { keep: ['yes'] } });
    expect(roundtrip(p)).toEqual(p);
  });
  it.each([
    rule({ weekdays: [] }), rule({ weekdays: [1, 1] }), rule({ weekdays: [7] }), rule({ weekdays: [1.5] }),
    rule({ startDate: '2026-02-30' }), rule({ endDate: '2026-10-24' }), rule({ plannedMinutes: 0 }), rule({ plannedMinutes: 720.5 }),
  ])('rejects invalid recurrence shape before API write', routine => {
    expect(() => roundtrip(withRule(routine))).toThrow();
    expect(() => validateProgressPatch({ baseRevision: 0, changes: { [`routines.${routine.id}`]: routine } })).toThrow();
  });
  it('accepts valid references including a catalog project without starting its progress', () => {
    const p = withRule(rule({ skillId: 'ref-java-KnownReference12345678' }));
    expect(roundtrip(p)).toEqual(p); expect(p.projects).toBeUndefined();
  });
  it('rejects unknown skill, resource and project references atomically but allows orphaned historical routine IDs', () => {
    for (const invalid of [rule({ skillId: 'unknown-skill' }), rule({ resourceId: 'unknown-course' }), rule({ projectId: 'unknown-project' })]) {
      const patch = validateProgressPatch({ baseRevision: 0, changes: { [`routines.${invalid.id}`]: invalid } });
      expect(() => assertProgressLoadable(applyProgressPatch(null, patch.changes, now))).toThrow('routine');
      expect(() => roundtrip(withRule(invalid))).toThrow('routine');
    }
    const orphan = session({ routineId: 'old-rule', occurrenceDate: '2026-10-24', projectId: 'study-task-backend', status: 'skipped' });
    expect(() => roundtrip({ ...createProgress(), sessions: { [orphan.id]: orphan } })).not.toThrow();
    expect(() => roundtrip({ ...createProgress(), sessions: { [orphan.id]: { ...orphan, occurrenceDate: '2026-02-30' } } })).toThrow();
    expect(() => roundtrip({ ...createProgress(), sessions: { [orphan.id]: { ...orphan, projectId: 'unknown-project' } } })).toThrow('session');
  });
  it('includes routines in existing atomic patches, offline migration and old-client protection', () => {
    expect(MAP_KEYS).toContain('routines');
    const p = withRule();
    const patch = validateProgressPatch({ baseRevision: 0, changes: { 'routines.daily-java': p.routines!['daily-java'] } });
    expect(() => assertProgressLoadable(applyProgressPatch(null, patch.changes, now))).not.toThrow();
    expect(resolveChanges(null, legacyChanges(p, null))).toHaveProperty('routines.daily-java');
    expect(resolveChanges(p, { _legacy: { mode: 'merge', value: { routines: {}, retainLegacy: true } } })).toEqual({ _legacy: { retainLegacy: true } });
    expect(() => validateProgressPatch({ baseRevision: 0, changes: { _legacy: { routines: {} } } })).toThrow();
  });
  it('merges routine edits and concurrent occurrence completion without replacing remote notes/time', () => {
    const before = withRule(); const entry = getStudySessions(before, '2026-10-25', '2026-10-25')[0];
    before.sessions = { [entry.id]: entry };
    const local = { ...before, routines: { 'daily-java': { ...rule(), plannedMinutes: 30 } }, sessions: { [entry.id]: { ...entry, notes: 'Local note' } } };
    const remote = { ...before, routines: { 'daily-java': { ...rule(), title: 'Remote title' } }, sessions: { [entry.id]: { ...entry, status: 'completed' as const, actualMinutes: 44 } } };
    const merged = applyChanges(remote, queueChanges({}, before, local));
    expect(merged.routines!['daily-java']).toMatchObject({ title: 'Remote title', plannedMinutes: 30 });
    expect(merged.sessions![entry.id]).toMatchObject({ notes: 'Local note', status: 'completed', actualMinutes: 44 });
    expect(() => roundtrip(merged)).not.toThrow();
  });
});
