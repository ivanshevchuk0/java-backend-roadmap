/** Types and pure adapters only. Official graph content is fetched privately at runtime. */
export type ReferenceMapId = 'java' | 'backend';
export type RawRoadmapStyle = Record<string, string | number | undefined>;
export interface RawRoadmapLegend { id: string; label: string; color?: string; position?: string; [key: string]: unknown }
export interface RawRoadmapNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  width?: number;
  height?: number;
  measured?: { width?: number; height?: number };
  style?: RawRoadmapStyle;
  zIndex?: number;
  parentId?: string;
  data: {
    label?: string;
    style?: RawRoadmapStyle;
    oldId?: string;
    href?: string;
    color?: string;
    backgroundColor?: string;
    borderColor?: string;
    legend?: RawRoadmapLegend;
    legends?: RawRoadmapLegend[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}
export interface RawRoadmapEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  type?: string;
  style?: RawRoadmapStyle;
  data?: Record<string, unknown>;
  [key: string]: unknown;
}
export interface RawRoadmap {
  nodes: RawRoadmapNode[];
  edges: RawRoadmapEdge[];
  updatedAt?: string;
  title?: string | { page?: string; card?: string; [key: string]: unknown };
  description?: string;
  slug?: string;
  dimensions?: { width?: number; height?: number };
  [key: string]: unknown;
}
export function isReferenceSkillId(value: unknown): value is string {
  return typeof value === 'string' && /^ref-(java|backend)-[A-Za-z0-9_-]{8,80}$/.test(value);
}
export function referenceSkillKey(map: ReferenceMapId, nodeId: string): string {
  const id = `ref-${map}-${nodeId}`;
  if (!isReferenceSkillId(id)) throw new Error('Invalid reference skill identity.');
  return id;
}
export function referenceNodeSize(node: RawRoadmapNode): { width: number; height: number } {
  const dimension = (values: unknown[], fallback: number) => {
    for (const value of values) {
      const number = typeof value === 'number' ? value : typeof value === 'string' ? Number.parseFloat(value) : NaN;
      if (Number.isFinite(number) && number > 0) return number;
    }
    return fallback;
  };
  return { width: dimension([node.width, node.measured?.width, node.style?.width], 200), height: dimension([node.height, node.measured?.height, node.style?.height], 48) };
}
export function isReferenceTopic(node: RawRoadmapNode): boolean { return node.type === 'topic' || node.type === 'subtopic'; }
export function referenceNodeLabel(node: RawRoadmapNode): string { return typeof node.data?.label === 'string' ? node.data.label : ''; }
export function referenceLink(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) return '';
  try { const url = new URL(value, 'https://roadmap.sh'); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : ''; } catch { return ''; }
}

export function referenceMapTitle(graph: RawRoadmap): string {
  if (typeof graph.title === 'string' && graph.title.trim()) return graph.title;
  if (graph.title && typeof graph.title === 'object') {
    if (typeof graph.title.page === 'string' && graph.title.page.trim()) return graph.title.page;
    if (typeof graph.title.card === 'string' && graph.title.card.trim()) return graph.title.card;
  }
  return typeof graph.slug === 'string' && graph.slug ? graph.slug[0].toUpperCase() + graph.slug.slice(1) : 'Reference';
}
