import { describe, expect, it } from 'vitest';
import { goalTemplates, learningPaths, skillDetails } from '../data/learning';
import { topics } from '../data/skills';
import { allTasks, roadmap } from './roadmap';

describe('learning guidance coverage and navigation', () => {
  const knownSkills = new Map(topics.map(topic => [topic.id, topic]));

  it('gives every existing skill a substantive guide without creating another skill catalog', () => {
    expect(Object.keys(skillDetails).sort()).toEqual(topics.map(topic => topic.id).sort());
    for (const [id, detail] of Object.entries(skillDetails)) {
      expect(['essential', 'recommended', 'advanced']).toContain(detail.level);
      expect(detail.why.length, id).toBeGreaterThan(70);
      expect(detail.concepts.length, id).toBeGreaterThanOrEqual(5);
      expect(detail.concepts.length, id).toBeLessThanOrEqual(8);
      expect(new Set(detail.concepts).size, id).toBe(detail.concepts.length);
      expect(detail.practice.length, id).toBeGreaterThanOrEqual(1);
      expect(detail.practice.length, id).toBeLessThanOrEqual(2);
      for (const practice of detail.practice) {
        expect(practice.title.trim().length, id).toBeGreaterThan(5);
        expect(practice.instruction.length, id).toBeGreaterThan(75);
      }
    }
  });

  it('composes four ordered paths that cover each skill exactly once', () => {
    expect(learningPaths.map(path => path.id)).toEqual(['core-java', 'backend', 'data', 'agh']);
    const allPathSkills = learningPaths.flatMap(path => path.skillIds);
    expect(allPathSkills.length).toBe(topics.length);
    expect(new Set(allPathSkills).size).toBe(topics.length);
    expect([...allPathSkills].sort()).toEqual(topics.map(topic => topic.id).sort());
    for (const path of learningPaths) {
      for (const id of path.skillIds) {
        expect(knownSkills.has(id), id).toBe(true);
        const expectedTrack = path.id === 'core-java' ? 'backend' : path.id;
        expect(knownSkills.get(id)?.track, id).toBe(expectedTrack);
      }
    }
    const backend = learningPaths.find(path => path.id === 'backend')!.skillIds;
    expect(backend.indexOf('spring')).toBeLessThan(backend.indexOf('persistence'));
    expect(backend.indexOf('persistence')).toBeLessThan(backend.indexOf('docker'));
    expect(learningPaths.find(path => path.id === 'agh')?.skillIds[0]).toBe('agh-assignments');
  });

  it('provides four high-level outcomes per week with stable IDs and working skill targets', () => {
    expect(goalTemplates).toHaveLength(48);
    expect(new Set(goalTemplates.map(goal => goal.id)).size).toBe(48);
    for (let week = 1; week <= 12; week++) {
      const goals = goalTemplates.filter(goal => goal.week === week);
      expect(goals).toHaveLength(4);
      expect(goals.filter(goal => goal.track === 'backend')).toHaveLength(2);
      expect(goals.filter(goal => goal.track === 'data')).toHaveLength(1);
      expect(goals.filter(goal => goal.track === 'agh')).toHaveLength(1);
      const prefix = `goal-w${String(week).padStart(2, '0')}`;
      expect(goals.map(goal => goal.id)).toEqual([
        `${prefix}-backend-1`, `${prefix}-backend-2`, `${prefix}-data-1`, `${prefix}-agh-1`,
      ]);
      for (const goal of goals) {
        expect(goal.description.length).toBeGreaterThan(90);
        expect(goal.skillIds.length).toBeGreaterThan(0);
        expect(goal.skillIds.every(id => knownSkills.get(id)?.track === goal.track)).toBe(true);
        expect('status' in goal).toBe(false);
        expect('completed' in goal).toBe(false);
        expect('estimatedMinutes' in goal).toBe(false);
      }
    }
  });

  it('retains early Spring, bounded EPAM assessment and actual-unit/AGH priorities', () => {
    const week2 = goalTemplates.filter(goal => goal.week === 2 && goal.track === 'backend');
    expect(week2.some(goal => goal.skillIds.includes('spring'))).toBe(true);
    expect(knownSkills.get('spring')?.week).toBe(2);
    expect(skillDetails.spring.why).toMatch(/Week 02/);
    expect(skillDetails.epam.practice.some(practice => /already scheduled Week 11/.test(practice.instruction))).toBe(true);
    expect(goalTemplates.filter(goal => goal.week === 11).some(goal => goal.skillIds.includes('epam'))).toBe(true);
    for (const goal of goalTemplates.filter(goal => goal.track === 'data' && goal.week < 12)) {
      expect(goal.description).toMatch(/actual|real|current/i);
      expect(goal.skillIds).not.toContain('machine-learning');
    }
    expect(knownSkills.get('machine-learning')!.week).toBeGreaterThan(12);
    for (const goal of goalTemplates.filter(goal => goal.track === 'agh')) {
      expect(goal.skillIds).toContain('agh-assignments');
      expect(goal.description).toMatch(/actual|real|current|verified|latest/i);
    }
    expect(skillDetails['agh-web'].why).toMatch(/cannot satisfy a Flask submission/);
  });

  it('adds guidance without adding tasks, course dependencies or workload', () => {
    expect(allTasks).toHaveLength(190);
    expect(roadmap.courses.map(course => course.id)).toEqual([
      'amazon-java', 'amazon-sql', 'amazon-spring', 'ibm-data', 'ibm-linux', 'ibm-flask', 'google-ml',
    ]);
    for (const week of roadmap.weeks) {
      for (const [track, minutes] of [['backend', 720], ['data', 240], ['agh', 240]] as const) {
        expect(week.tasks.filter(task => task.track === track).reduce((total, task) => total + task.estimatedMinutes, 0)).toBe(minutes);
      }
    }
    for (const detail of Object.values(skillDetails)) {
      expect('resources' in detail).toBe(false);
      expect('courseIds' in detail).toBe(false);
    }
  });
});
