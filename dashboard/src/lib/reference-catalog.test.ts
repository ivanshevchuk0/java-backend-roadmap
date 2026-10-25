import { describe, expect, it } from 'vitest';
import { aliasesForMap } from '../data/reference-aliases';
import { buildReferenceCatalog } from './reference-learning';
import { referenceNodeSize, referenceSkillKey, type RawRoadmapNode } from './reference-roadmaps';
import type { ReferencePayload } from './useReferenceRoadmap';

// Invented fixtures: official diagrams and guide text are not redistributed in source.
const node = (id: string, label: string, type = 'subtopic'): RawRoadmapNode => ({ id, type, position: { x: 10, y: 20 }, width: 140, height: 40, data: { label, oldId: 'shared-obsolete-id' } });
describe('private reference catalog compatibility', () => {
  it('keeps duplicate labels and obsolete-ID collisions distinct', () => {
    const nodes = [node('fixture-title1', 'Java', 'title'), node('fixture-core01', 'Learn the Basics'), node('fixture-array1', 'Arrays'), node('fixture-loops1', 'Loops'), node('fixture-other1', 'Arrays')];
    const keys = aliasesForMap('java', nodes);
    expect(keys.get('fixture-core01')).toBe('core-java');
    expect(keys.get('fixture-array1')).toBe('java-arrays');
    expect(keys.get('fixture-loops1')).toBe('ref-java-fixture-loops1');
    expect(keys.get('fixture-other1')).toBe('ref-java-fixture-other1');
    expect(new Set(keys.values()).size).toBe(nodes.length);
  });
  it('retains existing mastery IDs and creates no scheduled tasks for exploration', () => {
    const nodes = [node('fixture-core01', 'Learn the Basics'), node('fixture-build1', 'Bazel')];
    const payload: ReferencePayload = { roadmap: { nodes, edges: [] }, guides: Object.fromEntries(nodes.map(n => [n.id, `https://example.org/${n.id}`])), source: { url: 'https://roadmap.sh/java', revision: 'sha256:fixture', checkedAt: new Date().toISOString(), licenseUrl: 'https://example.org/license' }, audit: { nodes: 2, skills: 2, groups: 0, edges: 0 } };
    const result = buildReferenceCatalog('java', payload);
    expect(result.topics.map(t => t.id)).toEqual(['core-java', 'ref-java-fixture-build1']);
    expect(result.topics[0].taskIds.length).toBeGreaterThan(0);
    expect(result.topics[1]).toMatchObject({ week: 13, prerequisites: [], taskIds: [] });
    expect(result.topics[1].criteria.length).toBeGreaterThanOrEqual(2);
    expect(result.details[result.topics[1].id].concepts.length).toBeGreaterThanOrEqual(4);
    expect(payload.roadmap.nodes).toEqual(nodes);
  });
  it('uses authoritative dimensions instead of stale measurements', () => {
    expect(referenceNodeSize({ ...node('fixture-size01', 'Fixture'), measured: { width: 999, height: 999 }, style: { width: 888, height: 888 } })).toEqual({ width: 140, height: 40 });
    expect(() => referenceSkillKey('java', '../invalid')).toThrow();
  });
});
