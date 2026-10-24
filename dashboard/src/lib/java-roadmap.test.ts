import { describe, expect, it } from 'vitest';
import { javaSections, javaTopicIds, javaTopics } from '../data/java-roadmap';
import { allTopics, allSkillDetails, optionalSkillIds, topicById } from '../data/skill-catalog';
import { topics } from '../data/skills';
import { DIAGRAM_LAYOUT as d, layoutSections } from '../data/diagram';
import { allTasks, roadmap } from './roadmap';
import { createProgress, parseProgress, serializeProgress } from './progress';
import { withCompletionEvents } from './learning';

describe('comprehensive Java map', () => {
  it('uses one unique canonical skill record per topic, including shared existing skills', () => {
    expect(new Set(allTopics.map(topic => topic.id)).size).toBe(allTopics.length);
    expect(javaTopicIds.length).toBeGreaterThanOrEqual(65);
    expect(javaTopicIds.length).toBeLessThanOrEqual(100);
    expect(javaSections.length).toBeGreaterThanOrEqual(14);
    expect(javaSections.length).toBeLessThanOrEqual(18);
    const visible = javaSections.flatMap(section => [section.topicId, ...[section.left, section.right].flatMap(group => group?.entries.map(entry => entry.topicId) ?? [])]);
    expect(visible).not.toContain(undefined);
    expect(new Set(visible).size).toBe(visible.length);
    expect(visible.toSorted()).toEqual(javaTopicIds.toSorted());
    expect(javaTopics.every(topic => topic.id.startsWith('java-'))).toBe(true);
    expect(javaTopics.every(topic => javaTopicIds.includes(topic.id))).toBe(true);
    expect(javaTopicIds.every(id => topicById.has(id))).toBe(true);
    for (const id of ['core-java', 'oop', 'collections', 'generics', 'lambdas', 'streams', 'io', 'git-maven', 'junit', 'sql', 'spring', 'persistence', 'epam']) expect(javaTopicIds).toContain(id);
    for (const topic of topics) expect(topicById.get(topic.id)).toBe(topic);
  });

  it('provides focused explanations, useful concepts, practice, criteria and primary materials', () => {
    for (const topic of javaTopics) {
      const detail = allSkillDetails[topic.id];
      expect(topic.title.length, topic.id).toBeLessThanOrEqual(40);
      expect(topic.description.length, topic.id).toBeGreaterThan(65);
      expect(topic.exercise.length, topic.id).toBeGreaterThan(65);
      expect(topic.criteria.length, topic.id).toBeGreaterThanOrEqual(2);
      expect(topic.resources.length, topic.id).toBeGreaterThanOrEqual(1);
      for (const link of topic.resources) expect(new URL(link.url).protocol).toBe('https:');
      expect(detail, topic.id).toBeDefined();
      expect(['essential', 'recommended', 'advanced']).toContain(detail.level);
      expect(detail.why.length, topic.id).toBeGreaterThan(65);
      expect(detail.concepts.length, topic.id).toBeGreaterThanOrEqual(4);
      expect(detail.practice.length, topic.id).toBeGreaterThanOrEqual(1);
      expect(topic.taskIds).toEqual([]);
      expect(topic.issueNumbers).toEqual([]);
    }
  });

  it('has acyclic learning prerequisites without making optional topics compulsory', () => {
    const visited = new Set<string>(), visiting = new Set<string>();
    function visit(id: string) {
      expect(visiting.has(id), `cycle at ${id}`).toBe(false);
      if (visited.has(id)) return;
      const topic = topicById.get(id);
      expect(topic, `unknown prerequisite ${id}`).toBeDefined();
      visiting.add(id); topic!.prerequisites.forEach(visit); visiting.delete(id); visited.add(id);
    }
    for (const id of javaTopicIds) {
      visit(id);
      if (!optionalSkillIds.has(id)) expect(topicById.get(id)!.prerequisites.some(prerequisite => optionalSkillIds.has(prerequisite)), id).toBe(false);
    }
    for (const id of optionalSkillIds) expect(javaTopicIds).toContain(id);
    expect(topicById.get('spring')!.week).toBe(2);
    expect(topicById.get('spring')!.prerequisites).not.toContain('streams');
    expect(topicById.get('spring')!.prerequisites).not.toContain('io');
  });

  it('keeps dense groups ordered, inside their section and clear of the central spine', () => {
    const first = layoutSections(javaSections), second = layoutSections(javaSections);
    expect(second).toEqual(first);
    let bottom = 0;
    for (const placement of first.sections) {
      expect(placement.y).toBeGreaterThan(bottom);
      bottom = placement.y + placement.height;
      for (const [side, group] of [['left', placement.left], ['right', placement.right]] as const) {
        if (!group) continue;
        expect(group.y).toBeGreaterThanOrEqual(placement.y);
        expect(group.y + group.height).toBeLessThanOrEqual(bottom);
        expect(group.x + group.width <= d.centerNodeX || group.x >= d.centerNodeX + d.centerNodeWidth, side).toBe(true);
        let rowBottom = group.y;
        for (const row of group.entries) {
          expect(row.y).toBeGreaterThan(rowBottom);
          expect(row.y + row.height).toBeLessThan(group.y + group.height);
          rowBottom = row.y + row.height;
        }
      }
    }
    expect(layoutSections(javaSections, new Set(javaSections.map(section => section.id))).sections).toHaveLength(javaSections.length);
  });

  it('preserves old backups and never infers child, course or weekly completion', () => {
    const before = createProgress();
    before.tasks[allTasks[0].id] = { status: 'done', actualMinutes: 37, evidence: 'Keep my original evidence.' };
    before.skills = { 'core-java': { status: 'completed', notes: 'Original note', updatedAt: before.updatedAt } };
    before.courseNotes['amazon-java'] = 'Resume my actual module.';
    const copy = parseProgress(serializeProgress(before));
    expect(copy).toEqual(before);
    expect(javaTopics.every(topic => copy.skills?.[topic.id] === undefined)).toBe(true);
    const id = javaTopics[0].id;
    const after = withCompletionEvents(before, { ...before, skills: { ...before.skills, [id]: { status: 'completed', updatedAt: before.updatedAt } } });
    expect(after.tasks).toEqual(before.tasks);
    expect(after.courseNotes).toEqual(before.courseNotes);
    expect(after.resources).toBeUndefined();
    expect(after.goals).toBeUndefined();
    expect(Object.values(after.activities ?? {}).filter(event => event.skillId === id)).toHaveLength(1);
    expect(allTasks).toHaveLength(190);
    expect(roadmap.weeks).toHaveLength(12);
    expect(roadmap.courses).toHaveLength(7);
  });
});
