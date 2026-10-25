import { describe, expect, it } from 'vitest';
import { projectCatalog } from '../data/projects';
import { allTopics } from '../data/skill-catalog';

describe('original project catalogue', () => {
  it('covers each difficulty and format while placing the evolving app first', () => {
    expect(projectCatalog.length).toBeGreaterThanOrEqual(8);
    expect(projectCatalog.length).toBeLessThanOrEqual(10);
    expect(new Set(projectCatalog.map(project => project.id)).size).toBe(projectCatalog.length);
    expect(projectCatalog[0].id).toBe('study-task-backend');
    expect(new Set(projectCatalog.map(project => project.difficulty))).toEqual(new Set(['beginner', 'intermediate', 'advanced']));
    expect(new Set(projectCatalog.map(project => project.category))).toEqual(new Set(['CLI', 'Backend API', 'Database', 'Full-Stack']));
  });

  it('uses canonical skills available before live reference maps are fetched', () => {
    const known = new Set(allTopics.map(topic => topic.id));
    for (const project of projectCatalog) {
      expect(project.skillIds.length, project.id).toBeGreaterThan(0);
      expect(new Set(project.skillIds).size, project.id).toBe(project.skillIds.length);
      for (const id of project.skillIds) {
        expect(known.has(id), `${project.id}: ${id}`).toBe(true);
        expect(id.startsWith('ref-')).toBe(false);
      }
    }
  });

  it('defines inspectable project outcomes without inventing completion or enrolment', () => {
    for (const project of projectCatalog) {
      expect(project.objectives.length, project.id).toBeGreaterThanOrEqual(3);
      expect(project.criteria.length, project.id).toBeGreaterThanOrEqual(3);
      expect(project.criteria.every(criterion => criterion.trim().length > 40), project.id).toBe(true);
      expect('status' in project).toBe(false);
      expect('completed' in project).toBe(false);
      expect('repositoryUrl' in project).toBe(false);
      expect('courseIds' in project).toBe(false);
    }
  });
});
