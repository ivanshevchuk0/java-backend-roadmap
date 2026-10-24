import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BaseEdge, Controls, Handle, Position, ReactFlow, type Edge, type EdgeProps, type Node, type NodeProps, type ReactFlowInstance } from '@xyflow/react';
import { Check, ChevronDown, LocateFixed, LockKeyhole, Minus, Plus } from 'lucide-react';
import type { Topic } from '../data/skills';
import { allTopics, allSkillDetails, javaSkillIds, optionalSkillIds } from '../data/skill-catalog';
import { javaSections } from '../data/java-roadmap';
import { DIAGRAM_LAYOUT as dimensions, diagramSections, layoutSections, type DiagramSection } from '../data/diagram';
import type { SkillStatus, TrackId } from '../lib/types';

export type TopicStatus = SkillStatus;
export const statusLabels: Record<SkillStatus, string> = { 'not-started': 'Not started', 'in-progress': 'Learning', completed: 'Done', skipped: 'Skipped' };
export const trackNames: Record<TrackId, string> = { backend: 'Java & Backend', data: 'Data Science', agh: 'AGH studies' };
type DiagramData = { title: string; topic?: Topic; referenceTopicId?: string; description?: string; status?: SkillStatus; main?: boolean; guide?: boolean; optional?: boolean; advanced?: boolean; ready?: boolean; next?: boolean; order?: number; collapsed?: boolean; toggle?: () => void; count?: number };
type DiagramNode = Node<DiagramData, 'skill' | 'concept' | 'frame'>;
function Ports() { return <>{[Position.Top, Position.Bottom, Position.Left, Position.Right].flatMap(position => [<Handle key={`in-${position}`} id={`in-${position}`} type="target" position={position} isConnectable={false} />, <Handle key={`out-${position}`} id={`out-${position}`} type="source" position={position} isConnectable={false} />])}</>; }
function TopicNode({ data, selected }: NodeProps<DiagramNode>) {
  return <div className={`diagram-node ${data.main ? 'main-topic' : 'branch-topic'} ${data.guide ? 'guide-topic' : ''} ${data.status ?? ''} ${selected ? 'selected' : ''} ${data.next ? 'recommended' : ''} ${data.optional ? 'optional-topic' : ''} ${data.advanced ? 'advanced-topic' : ''}`}>
    <Ports />{data.main && <span className="diagram-sequence">{String(data.order).padStart(2, '0')}</span>}
    <span className={`diagram-status ${data.status ?? 'reference'}`} title={data.status ? statusLabels[data.status] : 'Concept reference · no separate completion'}>{data.status === 'completed' ? <Check size={12} strokeWidth={3} /> : data.status === 'skipped' ? <Minus size={12} /> : data.status === 'in-progress' ? <span /> : data.guide ? <span className="guide-marker">↗</span> : data.status ? <i /> : null}</span>
    <strong>{data.title}</strong>{(data.optional || data.advanced) && <span className="diagram-level" title={data.optional && data.advanced ? 'Optional, advanced topic' : data.advanced ? 'Advanced topic' : 'Optional topic'}>{data.advanced ? 'Advanced' : 'Optional'}</span>}
    {!data.ready && data.topic && data.status !== 'completed' && data.status !== 'skipped' && <LockKeyhole size={10} className="diagram-lock" aria-label="Prerequisites in details" />}
    {data.main && <span className={`diagram-node-caption ${data.next ? 'is-next' : ''}`}>{data.next ? 'Next recommended' : data.guide ? 'Reference · no extra study hours' : data.topic ? `Week ${String(data.topic.week).padStart(2, '0')}` : ''}</span>}
    {data.toggle && <button className="diagram-collapse nodrag nopan" onClick={event => { event.stopPropagation(); data.toggle?.(); }} onKeyDown={event => event.stopPropagation()} aria-label={`${data.collapsed ? 'Expand' : 'Collapse'} ${data.title}`} aria-expanded={!data.collapsed}>{data.collapsed ? <Plus size={13} /> : <Minus size={13} />}</button>}
    {data.main && data.collapsed && <span className="diagram-collapsed-count">{data.count} details hidden</span>}
  </div>;
}
function GroupFrame({ data }: NodeProps<DiagramNode>) { return <div className="diagram-group"><span>{data.title}</span></div>; }
function DiagramEdge(props: EdgeProps) {
  const { sourceX, sourceY, targetX, targetY } = props;
  const distance = Math.max(30, Math.abs(targetX - sourceX) * .55);
  const direction = targetX > sourceX ? 1 : -1;
  const path = props.data?.spine ? `M ${sourceX} ${sourceY} L ${targetX} ${targetY}` : `M ${sourceX} ${sourceY} C ${sourceX + direction * distance} ${sourceY}, ${targetX - direction * distance} ${targetY}, ${targetX} ${targetY}`;
  return <BaseEdge id={props.id} path={path} style={props.style} interactionWidth={0} />;
}
const nodeTypes = { skill: TopicNode, concept: TopicNode, frame: GroupFrame };
const edgeTypes = { curated: DiagramEdge };
const topicById = new Map(allTopics.map(topic => [topic.id, topic]));
const optionalIds = new Set(optionalSkillIds);
const sectionNodeId = (section: DiagramSection) => section.topicId ?? `guide-${section.id}`;
const sectionContains = (section: DiagramSection, id: string) => sectionNodeId(section) === id || [section.left, section.right].some(group => group?.entries.some(entry => (entry.topicId ?? `reference-${entry.id}`) === id));

export function SkillTree({ statuses, selectedId, nextId, onSelect, search, focusTrack, javaMap = false, theme = 'light', progressReady = true, anchorId, anchorVersion }: { statuses: Record<string, SkillStatus>; selectedId: string | null; nextId?: string; onSelect: (id: string, focus?: { title: string; description: string }) => void; search: string; focusTrack: TrackId; javaMap?: boolean; theme?: 'light' | 'dark'; progressReady?: boolean; anchorId?: string | null; anchorVersion?: number }) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [instance, setInstance] = useState<ReactFlowInstance<DiagramNode> | null>(null);
  const [jumpTarget, setJumpTarget] = useState<string | null>(null);
  const [sectionSelection, setSectionSelection] = useState('');
  const wrapper = useRef<HTMLDivElement>(null);
  const initializedMap = useRef<string | null>(null);
  const sections: readonly DiagramSection[] = javaMap ? javaSections : diagramSections[focusTrack];
  const mapKey = javaMap ? 'java-developer' : focusTrack;
  const mapTopicIds = useMemo(() => new Set(sections.flatMap(section => [section.topicId, ...(section.left?.entries ?? []).map(entry => entry.topicId), ...(section.right?.entries ?? []).map(entry => entry.topicId)]).filter((id): id is string => !!id)), [sections]);
  const sectionAliases = useMemo(() => {
    const aliases = new Map<string, string>();
    for (const section of sections) {
      if (section.topicId) aliases.set(section.topicId, `${aliases.get(section.topicId) ?? ''} ${section.title}`);
      for (const entry of [...(section.left?.entries ?? []), ...(section.right?.entries ?? [])]) if (entry.topicId) aliases.set(entry.topicId, `${aliases.get(entry.topicId) ?? ''} ${entry.label}`);
    }
    return aliases;
  }, [sections]);
  const matching = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];
    return allTopics.filter(topic => {
      if (!(javaMap ? javaSkillIds.has(topic.id) : mapTopicIds.has(topic.id))) return false;
      const details = allSkillDetails[topic.id];
      return [topic.title, topic.description, details?.why ?? '', ...(details?.concepts ?? []), sectionAliases.get(topic.id) ?? ''].join(' ').toLowerCase().includes(query);
    });
  }, [search, javaMap, mapTopicIds, sectionAliases]);
  const layout = useMemo(() => layoutSections(sections, collapsed), [sections, collapsed]);
  const toggle = useCallback((id: string) => setCollapsed(old => { const next = new Set(old); next.has(id) ? next.delete(id) : next.add(id); return next; }), []);
  const { nodes, edges } = useMemo(() => {
    const nodes: DiagramNode[] = [], edges: Edge[] = [];
    let previous: string | null = null;
    for (const [index, placement] of layout.sections.entries()) {
      const section = placement.section, topic = section.topicId ? topicById.get(section.topicId) : undefined;
      const id = sectionNodeId(section);
      const common = (skill?: Topic): Partial<DiagramData> => ({ topic: skill, status: skill ? statuses[skill.id] ?? 'not-started' : undefined, ready: skill?.prerequisites.every(dependency => statuses[dependency] === 'completed') ?? true, next: !!skill && skill.id === nextId && statuses[skill.id] !== 'skipped', advanced: !!skill && allSkillDetails[skill.id]?.level === 'advanced' });
      const sectionOptional = !!section.optional || !!topic && optionalIds.has(topic.id);
      nodes.push({ id, type: topic ? 'skill' : 'concept', position: { x: dimensions.centerNodeX, y: placement.centerY - dimensions.centerNodeHeight / 2 }, width: dimensions.centerNodeWidth, height: dimensions.centerNodeHeight, style: { width: dimensions.centerNodeWidth, height: dimensions.centerNodeHeight }, data: { title: section.title, ...common(topic), referenceTopicId: section.referenceTopicId, description: section.description, main: true, guide: !topic, order: index + 1, collapsed: placement.collapsed, toggle: () => toggle(section.id), count: (section.left?.entries.length ?? 0) + (section.right?.entries.length ?? 0), optional: sectionOptional }, selected: !!topic && selectedId === topic.id, ariaLabel: `${section.title}${topic ? `, ${statusLabels[statuses[topic.id] ?? 'not-started']}` : ', reference guide'}${sectionOptional ? ', optional' : ''}`, ariaRole: 'button' });
      if (previous) edges.push({ id: `spine-${previous}-${id}`, source: previous, target: id, sourceHandle: 'out-bottom', targetHandle: 'in-top', type: 'curated', data: { spine: true }, style: { stroke: 'var(--diagram-blue)', strokeWidth: 1.8 } });
      previous = id;
      for (const [side, group] of [['left', placement.left], ['right', placement.right]] as const) {
        if (!group) continue;
        nodes.push({ id: `frame-${group.group.id}`, type: 'frame', position: { x: group.x, y: group.y }, width: group.width, height: group.height, style: { width: group.width, height: group.height, pointerEvents: 'none' }, data: { title: group.group.title }, selectable: false, focusable: false, zIndex: -1 });
        for (const row of group.entries) {
          const entry = row.entry, skill = entry.topicId ? topicById.get(entry.topicId) : undefined;
          const entryId = entry.topicId ?? `reference-${entry.id}`;
          const optional = !!entry.optional || !!skill && optionalIds.has(skill.id);
          const advanced = !!skill && allSkillDetails[skill.id]?.level === 'advanced';
          nodes.push({ id: entryId, type: skill ? 'skill' : 'concept', position: { x: row.x, y: row.y }, width: row.width, height: row.height, style: { width: row.width, height: row.height }, data: { title: entry.label, ...common(skill), referenceTopicId: entry.referenceTopicId ?? section.topicId ?? section.referenceTopicId, description: entry.description, optional }, selected: !!skill && selectedId === skill.id, ariaLabel: `${entry.label}, ${skill ? statusLabels[statuses[skill.id] ?? 'not-started'] : 'concept reference'}${optional ? ', optional' : ''}${advanced ? ', advanced' : ''}`, ariaRole: 'button' });
          edges.push({ id: `branch-${id}-${entryId}`, source: id, target: entryId, sourceHandle: `out-${side}`, targetHandle: `in-${side === 'left' ? 'right' : 'left'}`, type: 'curated', style: { stroke: 'var(--diagram-blue)', strokeWidth: 1.5, ...(optional || advanced || sectionOptional ? { strokeDasharray: '3 5', strokeLinecap: 'round' as const } : {}) } });
        }
      }
    }
    return { nodes, edges };
  }, [layout, statuses, nextId, selectedId, toggle]);
  const duration = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 220;
  const showStart = useCallback(() => {
    setJumpTarget(null);
    setSectionSelection('');
    if (!instance || !wrapper.current) return;
    const width = wrapper.current.clientWidth, zoom = width < 600 ? .88 : Math.min(1, (width - 30) / layout.width);
    void instance.setViewport({ x: width / 2 - dimensions.centerX * zoom, y: 54, zoom }, { duration });
  }, [instance, duration, layout.width]);
  const locate = useCallback((id: string) => {
    const node = nodes.find(item => item.id === id);
    if (!instance || !node || !wrapper.current) return;
    const width = wrapper.current.clientWidth;
    void instance.setCenter(node.position.x + (node.width ?? dimensions.centerNodeWidth) / 2, node.position.y + (node.height ?? dimensions.centerNodeHeight) / 2, { zoom: width < 600 ? 1 : Math.min(1.08, (width - 25) / layout.width), duration });
  }, [instance, nodes, duration, layout.width]);
  const requestLocate = useCallback((id: string | null | undefined) => {
    if (!id) return;
    const section = sections.find(item => sectionContains(item, id));
    if (!section) return;
    setCollapsed(old => { if (!old.has(section.id)) return old; const next = new Set(old); next.delete(section.id); return next; });
    setJumpTarget(id);
  }, [sections]);
  useEffect(() => {
    if (!instance || !progressReady || initializedMap.current === mapKey) return;
    const timer = setTimeout(() => {
      initializedMap.current = mapKey;
      const next = nodes.find(node => node.id === nextId);
      if (next && next.position.y > 400 && wrapper.current) {
        const width = wrapper.current.clientWidth, zoom = width < 600 ? .88 : Math.min(1, (width - 30) / layout.width);
        void instance.setViewport({ x: width / 2 - dimensions.centerX * zoom, y: 120 - next.position.y * zoom, zoom }, { duration });
      } else showStart();
    }, 60);
    return () => clearTimeout(timer);
  }, [mapKey, instance, showStart, progressReady, nextId, nodes, duration, layout.width]);
  useEffect(() => { setSectionSelection(''); if (anchorId) requestLocate(anchorId); }, [anchorId, anchorVersion, mapKey, requestLocate]);
  useEffect(() => { requestLocate(selectedId ?? matching[0]?.id); }, [selectedId, matching, mapKey, requestLocate]);
  useEffect(() => {
    if (!jumpTarget || !instance || !nodes.some(node => node.id === jumpTarget)) return;
    const timer = setTimeout(() => { locate(jumpTarget); setJumpTarget(null); }, 80);
    return () => clearTimeout(timer);
  }, [jumpTarget, instance, nodes, locate]);
  useEffect(() => {
    const element = wrapper.current;
    if (!element || !instance) return;
    let previousWidth = element.clientWidth, previousHeight = element.clientHeight;
    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (Math.abs(width - previousWidth) <= 1 && Math.abs(height - previousHeight) <= 1) return;
      const viewport = instance.getViewport();
      const centerX = (previousWidth / 2 - viewport.x) / viewport.zoom, centerY = (previousHeight / 2 - viewport.y) / viewport.zoom;
      previousWidth = width; previousHeight = height;
      void instance.setViewport({ x: width / 2 - centerX * viewport.zoom, y: height / 2 - centerY * viewport.zoom, zoom: viewport.zoom });
    });
    observer.observe(element); return () => observer.disconnect();
  }, [instance]);
  const activate = (node: DiagramNode) => { const id = node.data.topic?.id ?? node.data.referenceTopicId; if (id) onSelect(id, node.data.topic ? undefined : { title: node.data.title, description: node.data.description ?? 'This concept is covered by the linked existing skill and its exercises.' }); };
  return <div className={`skill-canvas curated-canvas ${javaMap ? 'java-developer-canvas' : ''}`} ref={wrapper} aria-label={`${javaMap ? 'Java Developer' : trackNames[focusTrack]} interactive roadmap`}>
    <ReactFlow<DiagramNode> nodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} onInit={setInstance} nodesDraggable={false} nodesConnectable={false} elementsSelectable nodesFocusable edgesFocusable={false} deleteKeyCode={null} onNodeClick={(_, node) => activate(node)} onKeyDown={event => { if (event.key !== 'Enter' && event.key !== ' ') return; if ((event.target as HTMLElement).closest('button,input,select,textarea')) return; const element = (event.target as HTMLElement).closest('.react-flow__node-skill,.react-flow__node-concept'); const node = nodes.find(item => item.id === element?.getAttribute('data-id')); if (node) { event.preventDefault(); activate(node); } }} minZoom={.15} maxZoom={1.8} defaultViewport={{ x: 0, y: 54, zoom: .85 }} colorMode={theme} panOnScroll panOnScrollSpeed={.8} zoomOnScroll={false} zoomActivationKeyCode={['Control', 'Meta']} zoomOnPinch preventScrolling proOptions={{ hideAttribution: false }} ariaLabelConfig={{ 'node.a11yDescription.default': 'Press Enter to open learning materials. Use the plus or minus button to expand or collapse this section.' }}>
      <Controls showInteractive={false} position="bottom-right" fitViewOptions={{ padding: .08, duration }} />
    </ReactFlow>
    <div className="diagram-navigation"><button onClick={showStart} title="Return to the beginning">Start<ChevronDown size={12} /></button><button onClick={() => requestLocate(selectedId && mapTopicIds.has(selectedId) ? selectedId : nextId && mapTopicIds.has(nextId) ? nextId : sections.find(section => section.topicId)?.topicId)}><LocateFixed size={13} />{selectedId && mapTopicIds.has(selectedId) ? 'Current topic' : 'Next topic'}</button><button onClick={() => setCollapsed(new Set(sections.map(section => section.id)))}>Collapse all</button><button onClick={() => setCollapsed(new Set())}>Expand all</button></div>
    <div className="diagram-section-jump"><select aria-label="Jump to roadmap section" value={sectionSelection} onChange={event => { setSectionSelection(event.target.value); requestLocate(event.target.value); }}><option value="">Jump to section…</option>{sections.map(section => <option key={section.id} value={sectionNodeId(section)}>{section.title}</option>)}</select></div>
    <div className="canvas-instruction">Scroll to move · Pinch or use + / − to zoom</div>
    {search.trim() && !matching.length && <div className="canvas-empty">No match on this roadmap. Search results can open another roadmap.</div>}
  </div>;
}
