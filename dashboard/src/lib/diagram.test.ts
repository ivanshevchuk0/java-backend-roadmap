import { describe, expect, it } from 'vitest';
import { diagramSections, DIAGRAM_LAYOUT as d, layoutDiagram, type TrackId } from '../data/diagram';
import { topics } from '../data/skills';

const tracks: TrackId[] = ['backend', 'data', 'agh'];

describe('curated learning diagrams', () => {
  it('covers every existing tracked topic exactly once in its own track', () => {
    const tracked: string[] = [];
    for (const track of tracks) {
      const ids = diagramSections[track].flatMap(section => [
        section.topicId,
        ...(section.left?.entries ?? []).map(entry => entry.topicId),
        ...(section.right?.entries ?? []).map(entry => entry.topicId),
      ]).filter((id): id is string => Boolean(id));
      expect(ids.toSorted()).toEqual(topics.filter(topic => topic.track === track).map(topic => topic.id).toSorted());
      tracked.push(...ids);
    }
    expect(new Set(tracked).size).toBe(topics.length);
  });

  it('uses unique section, frame, and entry identities across all diagrams', () => {
    const ids: string[] = [];
    for (const sections of Object.values(diagramSections)) {
      for (const section of sections) {
        ids.push(`section:${section.id}`);
        for (const group of [section.left, section.right]) {
          if (!group) continue;
          ids.push(`group:${group.id}`);
          for (const entry of group.entries) ids.push(`entry:${entry.id}`);
        }
      }
    }
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps guide references distinct from tracked progress and resolves every target', () => {
    const known = new Set(topics.map(topic => topic.id));
    for (const sections of Object.values(diagramSections)) {
      for (const section of sections) {
        expect(Boolean(section.topicId) !== Boolean(section.referenceTopicId)).toBe(true);
        expect(known.has(section.topicId ?? section.referenceTopicId!)).toBe(true);
        if (section.referenceTopicId) expect(section.description).toBeTruthy();
        for (const entry of [...(section.left?.entries ?? []), ...(section.right?.entries ?? [])]) {
          expect(Boolean(entry.topicId) !== Boolean(entry.referenceTopicId)).toBe(true);
          expect(known.has(entry.topicId ?? entry.referenceTopicId!)).toBe(true);
          if (entry.referenceTopicId) expect(entry.description).toContain('no separate completion');
        }
      }
    }
    const concurrency = diagramSections.backend.find(section => section.id === 'concurrency-guide')!;
    expect(concurrency.optional).toBe(true);
    expect(concurrency.topicId).toBeUndefined();
    expect(concurrency.referenceTopicId).toBe('agh-os');
  });

  it('lays out ordered non-overlapping sections and groups outside a clear central spine', () => {
    for (const track of tracks) {
      const result = layoutDiagram(track);
      expect(result.width).toBe(980);
      let previousBottom = 0;
      for (const placement of result.sections) {
        expect(placement.y).toBeGreaterThan(previousBottom);
        previousBottom = placement.y + placement.height;
        expect(placement.centerY - d.centerNodeHeight / 2).toBeGreaterThanOrEqual(placement.y);
        for (const [side, group] of [['left', placement.left], ['right', placement.right]] as const) {
          if (!group) continue;
          expect(group.y).toBeGreaterThanOrEqual(placement.y);
          expect(group.y + group.height).toBeLessThanOrEqual(previousBottom);
          expect(group.y + group.height / 2).toBe(placement.centerY);
          const rowCenterMean = group.entries.reduce((sum, entry) => sum + entry.centerY, 0) / group.entries.length;
          expect(rowCenterMean).toBe(placement.centerY);
          if (side === 'left') expect(group.x + group.width).toBeLessThan(d.centerNodeX);
          else expect(group.x).toBeGreaterThan(d.centerNodeX + d.centerNodeWidth);
          let rowBottom = group.y + d.groupHeaderHeight;
          for (const entry of group.entries) {
            expect(entry.y).toBeGreaterThan(rowBottom);
            expect(entry.x).toBeGreaterThan(group.x);
            expect(entry.x + entry.width).toBeLessThan(group.x + group.width);
            expect(entry.y + entry.height).toBeLessThan(group.y + group.height);
            rowBottom = entry.y + entry.height;
          }
        }
      }
      expect(result.totalHeight).toBe(previousBottom + d.outerPadding);
    }
  });

  it('is deterministic and collapses only side branches while retaining all central sections', () => {
    for (const track of tracks) {
      const expanded = layoutDiagram(track);
      expect(layoutDiagram(track)).toEqual(expanded);
      const middleId = diagramSections[track][1].id;
      const collapsed = layoutDiagram(track, new Set([middleId]));
      expect(collapsed.totalHeight).toBeLessThan(expanded.totalHeight);
      expect(collapsed.sections.map(section => section.section.id)).toEqual(expanded.sections.map(section => section.section.id));
      expect(collapsed.sections[0]).toEqual(expanded.sections[0]);
      expect(collapsed.sections[1].left).toBeUndefined();
      expect(collapsed.sections[1].right).toBeUndefined();
      expect(collapsed.sections[1].height).toBe(d.collapsedHeight);
      const offset = expanded.sections[1].height - d.collapsedHeight;
      for (let i = 2; i < expanded.sections.length; i++) {
        expect(collapsed.sections[i].y).toBe(expanded.sections[i].y - offset);
        expect(collapsed.sections[i].centerY).toBe(expanded.sections[i].centerY - offset);
      }
    }
  });

  it('only connects the central reading order forwards, without inventing prerequisites', () => {
    for (const track of tracks) {
      const sections = layoutDiagram(track).sections;
      const edges = sections.slice(1).map((next, i) => [sections[i], next]);
      for (const [source, target] of edges) expect(source.centerY).toBeLessThan(target.centerY);
    }
    expect(diagramSections.backend.find(section => section.topicId === 'spring')?.description).toContain('Week 2');
    expect(diagramSections.agh[0].description).toContain('do not impose prerequisites');
  });
});
