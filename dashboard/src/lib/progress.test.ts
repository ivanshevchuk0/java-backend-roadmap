import { describe, expect, it } from 'vitest';
import { allTasks, roadmap } from './roadmap';
import { budget, createProgress, missingPrerequisites, nextTask, parseProgress, serializeProgress, stats, weekDates } from './progress';

describe('roadmap content', () => {
  it('preserves every week’s 12/4/4-hour budget and seven study days', () => {
    expect(roadmap.weeks).toHaveLength(12);
    for (const week of roadmap.weeks) {
      expect(new Set(week.tasks.map(t => t.day)).size).toBe(7);
      for (const [track, minutes] of [['backend', 720], ['data', 240], ['agh', 240]] as const) {
        expect(week.tasks.filter(t => t.track === track).reduce((n, t) => n + t.estimatedMinutes, 0)).toBe(minutes);
      }
      expect(week.tasks.every(t => t.criteria.length > 20 && t.description.length > 10)).toBe(true);
    }
    expect(new Set(allTasks.map(t => t.id)).size).toBe(allTasks.length);
  });
});

describe('honest progress accounting', () => {
  it('shows optional plan dates without assuming a start or drifting at month boundaries', () => {
    expect(weekDates('', 1)).toBe('');
    expect(weekDates('2026-10-22', 2)).toContain('Oct');
    expect(weekDates('2026-10-22', 2)).toContain('Nov');
  });
  it('starts empty and never equates task estimates with actual time', () => {
    const p = createProgress();
    const task = allTasks[0];
    p.tasks[task.id] = { status: 'done', actualMinutes: 0, evidence: 'Compiled and explained.' };
    expect(stats(p, [task])).toMatchObject({ done: 1, actual: 0, completedEstimate: task.estimatedMinutes });
    expect(p.milestones).toEqual({});
  });
  it('keeps logged time when a task is deferred, while removing its planned workload', () => {
    const p = createProgress();
    p.tasks[allTasks[0].id] = { status: 'deferred', actualMinutes: 25, plannedMinutes: 90, evidence: '' };
    expect(stats(p, [allTasks[0]])).toEqual({ total: 0, done: 0, deferred: 1, percentage: 0, planned: 0, actual: 25, completedEstimate: 0 });
  });
  it('reserves AGH time before splitting the remainder 3:1', () => {
    const p = createProgress();
    expect(budget(p, 1)).toEqual({ total: 20, backend: 12, data: 4, agh: 4 });
    p.weeklyPlans[1] = { hours: 20, aghHours: 10 };
    expect(budget(p, 1)).toEqual({ total: 20, backend: 7.5, data: 2.5, agh: 10 });
  });
  it('keeps study days in order unless AGH work is explicitly promoted', () => {
    const p = createProgress();
    const week = roadmap.weeks[0];
    expect(nextTask(p, week)?.day).toBe(1);
    const urgent = week.tasks.find(t => t.day === 6 && t.track === 'agh')!;
    p.tasks[urgent.id] = { status: 'pending', actualMinutes: 0, evidence: '', priority: 'high' };
    expect(nextTask(p, week)?.id).toBe(urgent.id);
  });
  it('does not infer a verified prerequisite from task checkboxes', () => {
    const p = createProgress();
    for (const task of roadmap.weeks[0].tasks) p.tasks[task.id] = { status: 'done', actualMinutes: 0, evidence: '' };
    expect(missingPrerequisites(p, roadmap.weeks[1])).toEqual(['m1']);
  });
});

describe('versioned JSON backups', () => {
  const exportObject = () => JSON.parse(serializeProgress(createProgress()));
  it('round-trips settings, task status, actual hours, evidence, reviews and course notes', () => {
    const p = createProgress();
    p.currentWeek = 2;
    p.startDate = '2026-10-22';
    p.tasks[allTasks[0].id] = { status: 'in-progress', actualMinutes: 45, plannedMinutes: 60, priority: 'low', evidence: 'One compiler error remains.' };
    p.weeklyPlans[2] = { hours: 15, aghHours: 6 };
    p.milestones.m1 = { verified: true, evidence: 'Verified G1 independently.' };
    p.reviews[1] = 'Reduce scope next week.';
    p.courseNotes['ibm-data'] = 'Continue the current lab.';
    expect(parseProgress(serializeProgress(p))).toEqual(p);
  });
  it.each(['not json', '{}', '[]', '{"version":99}'])('rejects malformed or incompatible backups: %s', input => {
    expect(() => parseProgress(input)).toThrow();
  });
  it('rejects unknown task IDs, preventing silent data loss after a different roadmap import', () => {
    const value = exportObject(); value.progress.tasks.unknown = { status: 'done', actualMinutes: 0, evidence: '' };
    expect(() => parseProgress(JSON.stringify(value))).toThrow('Unknown task');
  });
  it('rejects negative time and AGH reserves larger than capacity', () => {
    const value = exportObject(); value.progress.tasks[allTasks[0].id] = { status: 'done', actualMinutes: -1, evidence: '' };
    expect(() => parseProgress(JSON.stringify(value))).toThrow();
    const other = exportObject(); other.progress.weeklyPlans[1] = { hours: 10, aghHours: 11 };
    expect(() => parseProgress(JSON.stringify(other))).toThrow();
  });
  it('rejects out-of-range weeks and impossible dates', () => {
    const value = exportObject(); value.progress.currentWeek = 13;
    expect(() => parseProgress(JSON.stringify(value))).toThrow();
    const other = exportObject(); other.progress.startDate = '2026-02-31';
    expect(() => parseProgress(JSON.stringify(other))).toThrow('Invalid start date');
  });
  it('rejects unchecked evidence claims or broken milestone dependencies', () => {
    const value = exportObject(); value.progress.milestones.m1 = { verified: true, evidence: '' };
    expect(() => parseProgress(JSON.stringify(value))).toThrow('need evidence');
    const other = exportObject(); other.progress.milestones.m2 = { verified: true, evidence: 'Something' };
    expect(() => parseProgress(JSON.stringify(other))).toThrow('dependencies');
  });
  it('preserves note text verbatim through a backup round trip', () => {
    const p = createProgress(); p.reviews[1] = '<img src=x onerror=alert(1)>';
    expect(parseProgress(serializeProgress(p)).reviews[1]).toBe(p.reviews[1]);
  });
});
