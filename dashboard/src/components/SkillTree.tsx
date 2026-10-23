import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BaseEdge, Controls, Handle, Position, ReactFlow, type Edge, type EdgeProps, type Node, type NodeProps, type ReactFlowInstance } from '@xyflow/react';
import { Check, ChevronDown, LocateFixed, LockKeyhole, Minus, Plus } from 'lucide-react';
import { topics, type Topic } from '../data/skills';
import { diagramSections, layoutDiagram } from '../data/diagram';
import type { TrackId } from '../lib/types';

export type TopicStatus = 'not-started' | 'in-progress' | 'completed';
export const statusLabels: Record<TopicStatus, string> = { 'not-started': 'Not started', 'in-progress': 'In progress', completed: 'Completed' };
export const trackNames: Record<TrackId, string> = { backend: 'Java & Backend', data: 'Data Science', agh: 'AGH studies' };
type DiagramData = { title: string; topic?: Topic; referenceTopicId?: string; description?: string; status?: TopicStatus; main?: boolean; guide?: boolean; optional?: boolean; ready?: boolean; next?: boolean; order?: number; collapsed?: boolean; toggle?: () => void; count?: number; };
type DiagramNode = Node<DiagramData, 'skill' | 'concept' | 'frame'>;
function Ports() { return <>{[Position.Top, Position.Bottom, Position.Left, Position.Right].flatMap(position => [<Handle key={`in-${position}`} id={`in-${position}`} type="target" position={position} isConnectable={false} />, <Handle key={`out-${position}`} id={`out-${position}`} type="source" position={position} isConnectable={false} />])}</>; }
function TopicNode({ data, selected }: NodeProps<DiagramNode>) {
  return <div className={`diagram-node ${data.main ? 'main-topic' : 'branch-topic'} ${data.guide ? 'guide-topic' : ''} ${data.status ?? ''} ${selected ? 'selected' : ''} ${data.next ? 'recommended' : ''} ${data.optional ? 'optional-topic' : ''}`}>
    <Ports />
    {data.main && <span className="diagram-sequence">{String(data.order).padStart(2, '0')}</span>}
    <span className={`diagram-status ${data.status ?? 'reference'}`} title={data.status ? statusLabels[data.status] : 'Concept reference · no separate completion'}>{data.status === 'completed' ? <Check size={12} strokeWidth={3} /> : data.status === 'in-progress' ? <span /> : data.guide ? <span className="guide-marker">↗</span> : data.status ? <i /> : null}</span>
    <strong>{data.title}</strong>
    {!data.ready && data.topic && data.status !== 'completed' && <LockKeyhole size={10} className="diagram-lock" aria-label="Prerequisites in details" />}
    {data.main && <span className={`diagram-node-caption ${data.next ? 'is-next' : ''}`}>{data.next ? 'Next recommended' : data.guide ? 'Reference · no extra study hours' : data.topic ? `Week ${String(data.topic.week).padStart(2, '0')}` : ''}</span>}
    {data.toggle && <button className="diagram-collapse nodrag nopan" onClick={event => { event.stopPropagation(); data.toggle?.(); }} onKeyDown={event => event.stopPropagation()} aria-label={`${data.collapsed ? 'Expand' : 'Collapse'} ${data.title}`} aria-expanded={!data.collapsed}>{data.collapsed ? <Plus size={13} /> : <Minus size={13} />}</button>}
    {data.main && data.collapsed && <span className="diagram-collapsed-count">{data.count} details hidden</span>}
  </div>;
}
function GroupFrame({ data }: NodeProps<DiagramNode>) { return <div className="diagram-group"><span>{data.title}</span></div>; }
function DiagramEdge(props: EdgeProps) {
  const { sourceX, sourceY, targetX, targetY } = props;
  const vertical = props.data?.spine;
  const distance = Math.max(30, Math.abs(targetX - sourceX) * .55);
  const direction = targetX > sourceX ? 1 : -1;
  const path = vertical ? `M ${sourceX} ${sourceY} L ${targetX} ${targetY}` : `M ${sourceX} ${sourceY} C ${sourceX + direction * distance} ${sourceY}, ${targetX - direction * distance} ${targetY}, ${targetX} ${targetY}`;
  return <BaseEdge id={props.id} path={path} style={props.style} interactionWidth={0} />;
}
const nodeTypes = { skill: TopicNode, concept: TopicNode, frame: GroupFrame };
const edgeTypes = { curated: DiagramEdge };
const topicById = new Map(topics.map(topic => [topic.id, topic]));

export function SkillTree({ statuses, selectedId, nextId, onSelect, search, focusTrack, theme = 'light', progressReady = true }: { statuses: Record<string, TopicStatus>; selectedId: string | null; nextId?: string; onSelect: (id: string, focus?: { title: string; description: string }) => void; search: string; focusTrack: TrackId; theme?: 'light' | 'dark'; progressReady?: boolean }) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [instance, setInstance] = useState<ReactFlowInstance<DiagramNode> | null>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const initializedTrack = useRef<TrackId | null>(null);
  const matching = useMemo(() => search.trim() ? topics.filter(t => t.track === focusTrack && `${t.title} ${t.description}`.toLowerCase().includes(search.trim().toLowerCase())) : [], [search, focusTrack]);
  const toggle = useCallback((id: string) => setCollapsed(old => { const next = new Set(old); next.has(id) ? next.delete(id) : next.add(id); return next; }), []);
  const selectedSection = diagramSections[focusTrack].find(section => section.topicId === selectedId || [section.left, section.right].some(group => group?.entries.some(entry => entry.topicId === selectedId)));
  const effectiveCollapsed = useMemo(() => {
    const result = new Set(collapsed);
    if (selectedSection && selectedId !== selectedSection.topicId) result.delete(selectedSection.id);
    for (const section of diagramSections[focusTrack]) if ([section.left, section.right].some(group => group?.entries.some(entry => matching.some(topic => topic.id === entry.topicId)))) result.delete(section.id);
    return result;
  }, [collapsed, selectedSection, selectedId, matching, focusTrack]);
  const layout = useMemo(() => layoutDiagram(focusTrack, effectiveCollapsed), [focusTrack, effectiveCollapsed]);
  const { nodes, edges } = useMemo(() => {
    const nodes: DiagramNode[] = [];
    const edges: Edge[] = [];
    let previous: string | null = null;
    for (const [index, placement] of layout.sections.entries()) {
      const section = placement.section;
      const topic = section.topicId ? topicById.get(section.topicId) : undefined;
      const id = section.topicId ?? `guide-${section.id}`;
      const common = (t?: Topic): Partial<DiagramData> => ({ topic: t, status: t ? statuses[t.id] ?? 'not-started' : undefined, ready: t?.prerequisites.every(dependency => statuses[dependency] === 'completed') ?? true, next: t?.id === nextId });
      nodes.push({ id, type: topic ? 'skill' : 'concept', position: { x: 390, y: placement.centerY - 23 }, width: 200, height: 46, style: { width: 200, height: 46 }, data: { title: section.title, ...common(topic), referenceTopicId: section.referenceTopicId, description: section.description, main: true, guide: !topic, order: index + 1, collapsed: placement.collapsed, toggle: () => toggle(section.id), count: (section.left?.entries.length ?? 0) + (section.right?.entries.length ?? 0), optional: section.optional }, selected: selectedId === topic?.id, ariaLabel: `${section.title}${topic ? `, ${statusLabels[statuses[topic.id] ?? 'not-started']}` : ', reference guide'}`, ariaRole: 'button' });
      if (previous) edges.push({ id: `spine-${previous}-${id}`, source: previous, target: id, sourceHandle: 'out-bottom', targetHandle: 'in-top', type: 'curated', data: { spine: true }, style: { stroke: 'var(--diagram-blue)', strokeWidth: 1.8, ...(section.optional ? { strokeDasharray: '3 5' } : {}) } });
      previous = id;
      for (const [side, group] of [['left', placement.left], ['right', placement.right]] as const) {
        if (!group) continue;
        nodes.push({ id: `frame-${group.group.id}`, type: 'frame', position: { x: group.x, y: group.y }, width: group.width, height: group.height, style: { width: group.width, height: group.height, pointerEvents: 'none' }, data: { title: group.group.title }, selectable: false, focusable: false, zIndex: -1 });
        for (const row of group.entries) {
          const entry = row.entry;
          const targetTopic = entry.topicId ? topicById.get(entry.topicId) : undefined;
          const entryId = entry.topicId ?? `reference-${entry.id}`;
          nodes.push({ id: entryId, type: targetTopic ? 'skill' : 'concept', position: { x: row.x, y: row.y }, width: row.width, height: row.height, style: { width: row.width, height: row.height }, data: { title: entry.label, ...common(targetTopic), referenceTopicId: entry.referenceTopicId ?? section.topicId ?? section.referenceTopicId, description: entry.description, optional: entry.optional }, selected: !!targetTopic && selectedId === targetTopic.id, ariaLabel: `${entry.label}, ${targetTopic ? statusLabels[statuses[targetTopic.id] ?? 'not-started'] : 'concept reference'}`, ariaRole: 'button' });
          edges.push({ id: `branch-${id}-${entryId}`, source: id, target: entryId, sourceHandle: `out-${side}`, targetHandle: `in-${side === 'left' ? 'right' : 'left'}`, type: 'curated', style: { stroke: 'var(--diagram-blue)', strokeWidth: 1.5, ...(entry.optional || section.optional ? { strokeDasharray: '3 5', strokeLinecap: 'round' as const } : {}) } });
        }
      }
    }
    return { nodes, edges };
  }, [layout, statuses, nextId, selectedId, toggle]);
  const duration = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 220;
  const showStart = useCallback(() => {
    if (!instance || !wrapper.current) return;
    const width = wrapper.current.clientWidth;
    const zoom = width < 600 ? .88 : Math.min(1, (width - 30) / 980);
    void instance.setViewport({ x: width / 2 - 490 * zoom, y: 34, zoom }, { duration });
  }, [instance, duration]);
  const locate = useCallback((id?: string | null) => {
    const node = nodes.find(node => node.id === id);
    if (!instance || !node || !wrapper.current) return;
    const width = wrapper.current.clientWidth;
    void instance.setCenter(node.position.x + (node.width ?? 200) / 2, node.position.y + 23, { zoom: width < 600 ? 1 : Math.min(1.08, (width - 25) / 980), duration });
  }, [instance, nodes, duration]);
  useEffect(() => {
    if (!instance || !progressReady) return;
    if (initializedTrack.current !== focusTrack) {
      const timer = setTimeout(() => {
        initializedTrack.current = focusTrack;
        const next = nodes.find(node => node.id === nextId);
        if (next && next.position.y > 400 && wrapper.current) {
          const width = wrapper.current.clientWidth;
          const zoom = width < 600 ? .88 : Math.min(1, (width - 30) / 980);
          void instance.setViewport({ x: width / 2 - 490 * zoom, y: 120 - next.position.y * zoom, zoom }, { duration });
        } else showStart();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [focusTrack, instance, showStart, progressReady, nextId, nodes, duration]);
  useEffect(() => { const target = selectedId ?? matching[0]?.id; if (!target || !instance) return; const timer = setTimeout(() => locate(target), 70); return () => clearTimeout(timer); }, [selectedId, matching, instance, nodes.length]);
  useEffect(() => {
    const element = wrapper.current;
    if (!element) return;
    let previousWidth = element.clientWidth;
    const observer = new ResizeObserver(entries => { const width = entries[0].contentRect.width; if (Math.abs(width - previousWidth) > 20) { previousWidth = width; showStart(); } });
    observer.observe(element); return () => observer.disconnect();
  }, [showStart]);
  return <div className="skill-canvas curated-canvas" ref={wrapper} aria-label={`${trackNames[focusTrack]} interactive roadmap`}>
    <ReactFlow<DiagramNode> nodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} onInit={setInstance} nodesDraggable={false} nodesConnectable={false} elementsSelectable nodesFocusable edgesFocusable={false} deleteKeyCode={null} onNodeClick={(_, node) => { const id = node.data.topic?.id ?? node.data.referenceTopicId; if (id) onSelect(id, node.data.topic ? undefined : { title: node.data.title, description: node.data.description ?? 'This concept is covered by the linked existing skill and its exercises.' }); }} onKeyDown={event => { if (event.key !== 'Enter' && event.key !== ' ') return; const element = (event.target as HTMLElement).closest('.react-flow__node-skill,.react-flow__node-concept'); const node = nodes.find(node => node.id === element?.getAttribute('data-id')); const id = node?.data.topic?.id ?? node?.data.referenceTopicId; if (id) { event.preventDefault(); onSelect(id, node?.data.topic ? undefined : { title: node!.data.title, description: node!.data.description ?? 'This concept is covered by the linked existing skill and its exercises.' }); } }} minZoom={.15} maxZoom={1.8} defaultViewport={{ x: 0, y: 34, zoom: .85 }} colorMode={theme} panOnScroll panOnScrollSpeed={.8} zoomOnScroll={false} zoomActivationKeyCode={['Control', 'Meta']} zoomOnPinch preventScrolling proOptions={{ hideAttribution: false }} ariaLabelConfig={{ 'node.a11yDescription.default': 'Press Enter to open learning materials. Use the plus or minus button to expand or collapse this section.' }}>
      <Controls showInteractive={false} position="bottom-right" fitViewOptions={{ padding: .08, duration }} />
    </ReactFlow>
    <div className="diagram-navigation"><button onClick={showStart} title="Return to the beginning">Start<ChevronDown size={12} /></button><button onClick={() => locate(selectedId ?? (topicById.get(nextId ?? '')?.track === focusTrack ? nextId : diagramSections[focusTrack].find(s => s.topicId)?.topicId))}><LocateFixed size={13} />{selectedId ? 'Current topic' : 'Next topic'}</button><button onClick={() => setCollapsed(new Set(diagramSections[focusTrack].map(section => section.id)))}>Collapse all</button><button onClick={() => setCollapsed(new Set())}>Expand all</button></div>
    <div className="canvas-instruction">Scroll to move · Pinch or use + / − to zoom</div>
    {search && !matching.length && <div className="canvas-empty">No match in this track. Search results can open another roadmap.</div>}
  </div>;
}
