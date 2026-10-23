import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { topicGroups, topics } from '../data/skills';
import { allTasks, roadmap } from './roadmap';
import { createProgress, parseProgress, serializeProgress } from './progress';
import type { Roadmap } from './types';

// The restored existing Site commit is the migration baseline, not a second task catalog.
const original: Roadmap = JSON.parse(execFileSync('git', ['show', 'HEAD:src/data/roadmap.json'], { encoding: 'utf8' }));
const originalTasks = original.weeks.flatMap(week => week.tasks);

describe('skill-tree curriculum preservation', () => {
  it('retains every original task identity, position, course and time box', () => {
    expect(allTasks).toHaveLength(190);
    expect(roadmap.id).toBe(original.id);
    expect(roadmap.courses).toEqual(original.courses);
    expect(allTasks.map(({ id, day, track, courseIds, estimatedMinutes }) => ({ id, day, track, courseIds, estimatedMinutes })))
      .toEqual(originalTasks.map(({ id, day, track, courseIds, estimatedMinutes }) => ({ id, day, track, courseIds, estimatedMinutes })));
    for (const week of roadmap.weeks) {
      for (const [track, minutes] of [['backend', 720], ['data', 240], ['agh', 240]] as const) {
        expect(week.tasks.filter(task => task.track === track).reduce((sum, task) => sum + task.estimatedMinutes, 0)).toBe(minutes);
      }
      expect(week.source).toBe(`ROADMAP.md#week-${String(week.number).padStart(2, '0')}`);
    }
  });

  it('has one acyclic prerequisite graph and valid references to the retained tasks', () => {
    const byId = new Map(topics.map(topic => [topic.id, topic]));
    const groups = new Map(topicGroups.map(group => [group.id, group]));
    const taskIds = new Set(allTasks.map(task => task.id));
    expect(byId.size).toBe(topics.length);
    expect(groups.size).toBe(topicGroups.length);
    const visited = new Set<string>();
    const visiting = new Set<string>();
    function visit(id: string) {
      const topic = byId.get(id);
      expect(topic, `unknown prerequisite ${id}`).toBeDefined();
      expect(visiting.has(id), `prerequisite cycle at ${id}`).toBe(false);
      if (visited.has(id)) return;
      visiting.add(id);
      topic!.prerequisites.forEach(visit);
      visiting.delete(id);
      visited.add(id);
    }
    for (const topic of topics) {
      visit(topic.id);
      expect(groups.get(topic.group)?.track).toBe(topic.track);
      expect(topic.taskIds.every(id => taskIds.has(id)), topic.id).toBe(true);
      expect(topic.issueNumbers.every(id => Number.isInteger(id) && id >= 1 && id <= 37)).toBe(true);
      expect(topic.criteria.length).toBeGreaterThan(0);
      expect(topic.resources.length).toBeGreaterThan(0);
      for (const resource of topic.resources) expect(new URL(resource.url).protocol).toBe('https:');
    }
  });

  it('keeps Spring accelerated without incorrectly requiring functional Java or I/O first', () => {
    const byId = new Map(topics.map(topic => [topic.id, topic]));
    const ancestors = new Set<string>();
    function collect(id: string) {
      for (const dependency of byId.get(id)!.prerequisites) {
        if (!ancestors.has(dependency)) { ancestors.add(dependency); collect(dependency); }
      }
    }
    collect('spring');
    expect(byId.get('spring')?.week).toBe(2);
    expect(ancestors.has('oop')).toBe(true);
    expect(ancestors.has('junit')).toBe(true);
    expect(ancestors.has('streams')).toBe(false);
    expect(ancestors.has('io')).toBe(false);
    expect(byId.get('agh-assignments')?.prerequisites).toEqual([]);
  });

  it('uses existing assessment slots and defers ML beyond the twelve-week cycle', () => {
    const epam = topics.find(topic => topic.id === 'epam')!;
    expect(epam.week).toBe(11);
    expect(epam.milestone).toBe(true);
    expect(epam.issueNumbers).toContain(37);
    const assessments = roadmap.weeks[10].tasks.filter(task => task.track === 'backend' && [3, 4].includes(task.day));
    expect(assessments).toHaveLength(2);
    expect(assessments.reduce((sum, task) => sum + task.estimatedMinutes, 0)).toBe(240);
    expect(assessments.every(task => epam.taskIds.includes(task.id))).toBe(true);
    expect(epam.taskIds).toContain('w12-d5-b-1');
    const ml = topics.find(topic => topic.id === 'machine-learning')!;
    expect(ml.week).toBeGreaterThan(12);
    expect(ml.prerequisites).toEqual(expect.arrayContaining(['python', 'numpy', 'pandas', 'statistics', 'evaluation']));
    expect(roadmap.weeks).toHaveLength(12);
  });
});

describe('lossless legacy progress import', () => {
  it('retains unknown legacy metadata along with original completion and evidence', () => {
    const envelope = JSON.parse(serializeProgress(createProgress()));
    envelope.progress.futurePreferences = { theme: 'dark', editor: 'VS Code' };
    envelope.progress.tasks[allTasks[0].id] = { status: 'done', actualMinutes: 30, evidence: 'Terminal run observed.', legacyNote: 'Keep this evidence.' };
    envelope.progress.weeklyPlans['1'] = { hours: 20, aghHours: 4, scheduleNote: 'Move only optional study.' };
    envelope.progress.milestones.m1 = { verified: true, evidence: 'Independent G1 demonstration.', verifiedAt: '2026-10-23T10:00:00Z' };
    envelope.progress.courseNotes['ibm-data'] = 'Resume the actual enrolled lab.';
    envelope.progress.reviews['1'] = 'University deadline takes priority.';
    const migrated = parseProgress(JSON.stringify(envelope));
    expect(JSON.parse(serializeProgress(migrated)).progress).toEqual(envelope.progress);
  });

  it('round-trips skills and AGH deadlines without changing old task records', () => {
    const progress = createProgress();
    progress.tasks[allTasks[0].id] = { status: 'done', actualMinutes: 20, evidence: 'Observed compilation.' };
    progress.skills = { 'core-java': { status: 'in-progress', updatedAt: '2026-10-23T12:00:00Z' } };
    progress.deadlines = { os: { label: 'Verify the actual OS brief', date: '', done: false, updatedAt: '2026-10-23T12:00:00Z' } };
    expect(parseProgress(serializeProgress(progress))).toEqual(progress);
  });
});
