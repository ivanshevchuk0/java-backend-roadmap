import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Controls, Handle, Position, ReactFlow, type Edge, type Node, type NodeProps, type ReactFlowInstance } from '@xyflow/react';
import { ArrowUpRight, Check, LocateFixed, Minus } from 'lucide-react';
import { isReferenceTopic, referenceLink, referenceNodeLabel, referenceNodeSize, referenceMapTitle, type RawRoadmap, type RawRoadmapNode, type RawRoadmapStyle } from '../lib/reference-roadmaps';
import type { SkillStatus } from '../lib/types';
import '../reference-map.css';

export interface ReferenceMapProps {
  graph: RawRoadmap;
  statuses: Record<string, SkillStatus>;
  skillKey: (node: RawRoadmapNode) => string;
  selectedNodeId: string | null;
  onSelect: (node: RawRoadmapNode) => void;
  mode: 'full' | 'personal';
  priority: (node: RawRoadmapNode) => 'focus' | 'support' | 'later';
  search: string;
  theme: 'light' | 'dark';
}
type ReferenceData = { raw: RawRoadmapNode; status?: SkillStatus; priority: 'focus' | 'support' | 'later'; mode: 'full' | 'personal'; searchMatch: boolean; targetAliases: string[]; sourceAliases: string[] };
type ReferenceNode = Node<ReferenceData>;
const ports = [['w', Position.Top], ['x', Position.Bottom], ['y', Position.Left], ['z', Position.Right]] as const;
const statusLabels: Record<SkillStatus, string> = { 'not-started': 'Not started', 'in-progress': 'Learning', completed: 'Done', skipped: 'Skipped' };
function positionFor(handle: string) { return ports.find(([prefix]) => handle.startsWith(prefix))?.[1] ?? Position.Top; }
function ReferencePorts({ data }: { data: ReferenceData }) {
  return <>{ports.flatMap(([prefix, position]) => [<Handle key={`${prefix}1`} id={`${prefix}1`} type="target" position={position} isConnectable={false} />, <Handle key={`${prefix}2`} id={`${prefix}2`} type="source" position={position} isConnectable={false} />])}{data.targetAliases.map(id => <Handle key={`target-${id}`} id={id} type="target" position={positionFor(id)} isConnectable={false} />)}{data.sourceAliases.map(id => <Handle key={`source-${id}`} id={id} type="source" position={positionFor(id)} isConnectable={false} />)}</>;
}
function fontStyle(style?: RawRoadmapStyle): CSSProperties {
  const fontSize = Number(style?.fontSize);
  const align = style?.textAlign;
  return { ...(Number.isFinite(fontSize) && fontSize > 0 ? { fontSize } : {}), ...(align === 'left' || align === 'right' || align === 'center' || align === 'justify' ? { textAlign: align } : {}) };
}
function safeColor(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const color = value.trim();
  return /^(?:#[a-f\d]{3,4}|#[a-f\d]{6}(?:[a-f\d]{2})?|(?:rgb|rgba|hsl|hsla)\([\d.,% /+-]+\)|transparent|black|white|gray|grey|red|blue|green|yellow|purple|orange|navy|silver|maroon|lime|olive|aqua|fuchsia|teal|pink|brown)$/i.test(color) ? color : undefined;
}
function boxStyle(node: RawRoadmapNode): CSSProperties {
  const style = node.data.style ?? {};
  const backgroundColor = safeColor(node.data.backgroundColor ?? style.backgroundColor);
  const color = safeColor(node.data.color ?? style.color);
  const borderColor = safeColor(node.data.borderColor ?? style.borderColor) ?? (node.type === 'button' ? backgroundColor : undefined);
  const result: CSSProperties = { ...(backgroundColor ? { backgroundColor } : {}), ...(color ? { color } : {}), ...(borderColor ? { borderColor, borderWidth: 2.7, borderStyle: 'solid' } : {}) };
  for (const key of ['padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'borderWidth', 'borderRadius'] as const) {
    const value = style[key];
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100) result[key] = value;
    else if (typeof value === 'string' && /^\d+(?:\.\d+)?px$/.test(value) && Number.parseFloat(value) <= 100) result[key] = value;
  }
  if (['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'].includes(String(style.justifyContent))) result.justifyContent = style.justifyContent as CSSProperties['justifyContent'];
  if (['flex-start', 'flex-end', 'center', 'stretch', 'baseline'].includes(String(style.alignItems))) result.alignItems = style.alignItems as CSSProperties['alignItems'];
  if (['left', 'right', 'center', 'justify'].includes(String(style.textAlign))) result.textAlign = style.textAlign as CSSProperties['textAlign'];
  return result;
}
function lineStyle(style?: RawRoadmapStyle): CSSProperties {
  return { stroke: safeColor(style?.stroke) ?? '#2b78e4', strokeWidth: typeof style?.strokeWidth === 'number' && style.strokeWidth > 0 && style.strokeWidth <= 100 ? style.strokeWidth : 3.5, strokeDasharray: typeof style?.strokeDasharray === 'number' || typeof style?.strokeDasharray === 'string' && /^[\d.,e+\s-]+$/i.test(style.strokeDasharray) ? style.strokeDasharray : undefined, strokeLinecap: style?.strokeLinecap === 'round' || style?.strokeLinecap === 'square' ? style.strokeLinecap : 'butt', fill: 'none' };
}
function ReferenceNodeContent({ data, selected }: NodeProps<ReferenceNode>) {
  const node = data.raw, label = referenceNodeLabel(node), size = referenceNodeSize(node), topic = isReferenceTopic(node);
  const classes = `reference-node reference-${node.type} ${topic && data.status ? `reference-status-${data.status}` : ''} ${topic && data.mode === 'personal' ? `reference-priority-${data.priority}` : ''} ${selected ? 'reference-selected' : ''} ${data.searchMatch ? 'reference-search-match' : ''} ${String(node.data.style?.borderColor).toLowerCase() === 'transparent' ? 'reference-no-border' : ''} ${String(node.data.style?.backgroundColor).toLowerCase() === 'transparent' ? 'reference-transparent-fill' : ''}`;
  let content;
  if (node.type === 'horizontal' || node.type === 'vertical') {
    content = <svg className="reference-line-svg" width={size.width} height={size.height} viewBox={`0 0 ${size.width} ${size.height}`} aria-hidden="true"><line x1={node.type === 'vertical' ? size.width / 2 : 0} y1={node.type === 'vertical' ? 0 : size.height / 2} x2={node.type === 'vertical' ? size.width / 2 : size.width} y2={node.type === 'vertical' ? size.height : size.height / 2} style={lineStyle(node.data.style)} /></svg>;
  } else if (node.type === 'section') {
    content = label ? <span className="reference-section-label">{label}</span> : null;
  } else if (node.type === 'legend') {
    content = <ul className="reference-legend-list">{(node.data.legends ?? []).map(legend => <li key={legend.id}><i style={{ backgroundColor: legend.color ?? '#929292' }} /><span>{legend.label}</span></li>)}</ul>;
  } else if (node.type === 'title') {
    content = <h2 style={fontStyle(node.data.style)}>{label}</h2>;
  } else if (node.type === 'paragraph') {
    content = <p style={fontStyle(node.data.style)}>{label}</p>;
  } else if (node.type === 'button' || node.type === 'label' && referenceLink(node.data.href)) {
    const href = referenceLink(node.data.href);
    content = href ? <a className={node.type === 'button' ? 'reference-external-button' : 'reference-external-label'} href={href} target="_blank" rel="noreferrer" style={{ ...fontStyle(node.data.style), ...boxStyle(node) }} onClick={event => event.stopPropagation()}>{label}{node.type === 'button' && <ArrowUpRight size={14} />}</a> : <span className="reference-button-label" style={{ ...fontStyle(node.data.style), ...boxStyle(node) }}>{label}</span>;
  } else {
    content = <span className="reference-node-label" style={fontStyle(node.data.style)}>{label}</span>;
  }
  return <div className={classes} style={node.type === 'button' ? undefined : boxStyle(node)}>
    <ReferencePorts data={data} />{content}
    {topic && data.status !== 'not-started' && <span className={`reference-progress-mark ${data.status}`} title={statusLabels[data.status ?? 'not-started']} aria-label={statusLabels[data.status ?? 'not-started']}>{data.status === 'completed' ? <Check size={11} strokeWidth={3} /> : data.status === 'skipped' ? <Minus size={11} /> : <i />}</span>}
    {topic && node.data.legend && <span className="reference-legend-mark" title={node.data.legend.label} style={{ backgroundColor: node.data.legend.color ?? '#929292', ...(node.data.legend.position?.startsWith('left') ? { left: -6, right: 'auto' } : {}) }} aria-label={node.data.legend.label} />}
  </div>;
}

export function ReferenceMap({ graph, statuses, skillKey, selectedNodeId, onSelect, mode, priority, search, theme }: ReferenceMapProps) {
  const [instance, setInstance] = useState<ReactFlowInstance<ReferenceNode> | null>(null);
  const [section, setSection] = useState('');
  const [containerWidth, setContainerWidth] = useState(0);
  const wrapper = useRef<HTMLDivElement>(null);
  const mapTitle = referenceMapTitle(graph);
  const mapIdentity = graph.slug ?? mapTitle ?? graph.nodes[0]?.id ?? 'reference-map';
  const attachWrapper = useCallback((element: HTMLDivElement | null) => { wrapper.current = element; if (element) setContainerWidth(element.clientWidth); }, []);
  const duration = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 200;
  const query = search.trim().toLowerCase();
  const matching = useMemo(() => query ? graph.nodes.filter(node => !['horizontal', 'vertical', 'section'].includes(node.type) && referenceNodeLabel(node).toLowerCase().includes(query)) : [], [graph.nodes, query]);
  const searchIds = useMemo(() => new Set(matching.map(node => node.id)), [matching]);
  const sections = useMemo(() => graph.nodes.filter(node => node.type === 'topic').toSorted((a, b) => a.position.y - b.position.y || a.position.x - b.position.x), [graph.nodes]);
  const nodeTypes = useMemo(() => Object.fromEntries(graph.nodes.map(node => [node.type, ReferenceNodeContent])), [graph.nodes]);
  const bounds = useMemo(() => {
    const boxes = graph.nodes.map(node => ({ ...node.position, ...referenceNodeSize(node) }));
    return { left: Math.min(...boxes.map(box => box.x)), top: Math.min(...boxes.map(box => box.y)), right: Math.max(...boxes.map(box => box.x + box.width)), bottom: Math.max(...boxes.map(box => box.y + box.height)) };
  }, [graph.nodes]);
  const { nodes, edges } = useMemo(() => {
    const targetAliases = new Map<string, Set<string>>(), sourceAliases = new Map<string, Set<string>>();
    for (const edge of graph.edges) {
      if (edge.targetHandle && !/^[wxyz]1$/.test(edge.targetHandle)) { const aliases = targetAliases.get(edge.target) ?? new Set(); aliases.add(edge.targetHandle); targetAliases.set(edge.target, aliases); }
      if (edge.sourceHandle && !/^[wxyz]2$/.test(edge.sourceHandle)) { const aliases = sourceAliases.get(edge.source) ?? new Set(); aliases.add(edge.sourceHandle); sourceAliases.set(edge.source, aliases); }
    }
    const nodes: ReferenceNode[] = graph.nodes.map(raw => {
      const topic = isReferenceTopic(raw), size = referenceNodeSize(raw), status = topic ? statuses[skillKey(raw)] ?? 'not-started' : undefined;
      return { id: raw.id, type: raw.type, position: { ...raw.position }, ...size, ...(raw.parentId ? { parentId: raw.parentId } : {}), style: { ...size }, zIndex: raw.type === 'section' ? -1 : raw.zIndex ?? 999, selectable: topic, focusable: topic, draggable: false, deletable: false, connectable: false, selected: topic && selectedNodeId === raw.id, ariaRole: topic ? 'button' : 'group', ariaLabel: topic ? `${referenceNodeLabel(raw)}, ${statusLabels[status!]}` : raw.type === 'section' ? referenceNodeLabel(raw) || 'Topic group' : referenceNodeLabel(raw), data: { raw, status, priority: priority(raw), mode, searchMatch: searchIds.has(raw.id), targetAliases: [...(targetAliases.get(raw.id) ?? [])], sourceAliases: [...(sourceAliases.get(raw.id) ?? [])] } };
    });
    const edges: Edge[] = graph.edges.map(raw => ({ ...raw, type: raw.type ?? 'default', style: lineStyle(raw.style), selectable: false, focusable: false, deletable: false }));
    return { nodes, edges };
  }, [graph.nodes, graph.edges, statuses, skillKey, selectedNodeId, mode, priority, searchIds]);
  const nodesRef = useRef(nodes); nodesRef.current = nodes;
  const focusNode = useCallback((id: string | null | undefined) => {
    const node = nodesRef.current.find(item => item.id === id);
    if (!node || !instance || !wrapper.current) return;
    const width = wrapper.current.clientWidth;
    void instance.setCenter(node.position.x + (node.width ?? 200) / 2, node.position.y + (node.height ?? 48) / 2, { zoom: width < 600 ? .95 : Math.min(1.1, Math.max(.65, (width - 30) / Math.max(1, bounds.right - bounds.left))), duration });
  }, [instance, duration, bounds.left, bounds.right]);
  const showStart = useCallback(() => {
    if (!instance || !wrapper.current || !graph.nodes.length) return;
    const width = wrapper.current.clientWidth, zoom = width < 600 ? .88 : Math.min(1, (width - 35) / Math.max(1, bounds.right - bounds.left));
    void instance.setViewport({ x: width / 2 - (bounds.left + bounds.right) / 2 * zoom, y: 115 - bounds.top * zoom, zoom }, { duration });
  }, [instance, duration, graph.nodes.length, bounds]);
  const initialViewport = useMemo(() => {
    const zoom = containerWidth < 600 ? .88 : Math.min(1, (containerWidth - 35) / Math.max(1, bounds.right - bounds.left));
    return { x: containerWidth / 2 - (bounds.left + bounds.right) / 2 * zoom, y: 115 - bounds.top * zoom, zoom };
  }, [containerWidth, bounds]);
  useEffect(() => setSection(''), [mapIdentity]);
  useEffect(() => { if (selectedNodeId) { const timer = setTimeout(() => focusNode(selectedNodeId), 80); return () => clearTimeout(timer); } }, [selectedNodeId, mapIdentity, focusNode]);
  useEffect(() => { if (query && matching[0]) { const timer = setTimeout(() => focusNode(matching[0].id), 85); return () => clearTimeout(timer); } }, [query, matching, focusNode]);
  useEffect(() => {
    const element = wrapper.current;
    if (!element || !instance) return;
    let previousWidth = element.clientWidth, previousHeight = element.clientHeight;
    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (Math.abs(width - previousWidth) <= 1 && Math.abs(height - previousHeight) <= 1) return;
      const viewport = instance.getViewport(), centerX = (previousWidth / 2 - viewport.x) / viewport.zoom, centerY = (previousHeight / 2 - viewport.y) / viewport.zoom;
      previousWidth = width; previousHeight = height; setContainerWidth(width);
      void instance.setViewport({ x: width / 2 - centerX * viewport.zoom, y: height / 2 - centerY * viewport.zoom, zoom: viewport.zoom });
    });
    observer.observe(element); return () => observer.disconnect();
  }, [instance]);
  return <div ref={attachWrapper} className={`reference-map reference-theme-${theme}`} aria-label={`${mapTitle} complete interactive roadmap`} data-map-mode={mode} data-reference-node-count={graph.nodes.length} data-reference-edge-count={graph.edges.length}>
    {containerWidth > 0 && <ReactFlow<ReferenceNode> key={mapIdentity} nodes={nodes} edges={edges} nodeTypes={nodeTypes} onInit={setInstance} onNodeClick={(_, node) => { if (isReferenceTopic(node.data.raw)) onSelect(node.data.raw); }} onKeyDown={event => { if (!['Enter', ' '].includes(event.key) || (event.target as HTMLElement).closest('a,button,input,select,textarea')) return; const id = (event.target as HTMLElement).closest('.react-flow__node')?.getAttribute('data-id'); const node = nodesRef.current.find(item => item.id === id); if (node && isReferenceTopic(node.data.raw)) { event.preventDefault(); onSelect(node.data.raw); } }} nodesDraggable={false} nodesConnectable={false} elementsSelectable nodesFocusable edgesFocusable={false} deleteKeyCode={null} minZoom={.1} maxZoom={2} defaultViewport={initialViewport} colorMode={theme} panOnScroll panOnScrollSpeed={.8} zoomOnScroll={false} zoomActivationKeyCode={['Control', 'Meta']} zoomOnPinch preventScrolling proOptions={{ hideAttribution: false }} ariaLabelConfig={{ 'node.a11yDescription.default': 'Press Enter or Space to open this topic. Pan the map to explore. Use pinch or the zoom controls to change scale.' }}>
      <Controls showInteractive={false} position="bottom-right" fitViewOptions={{ padding: .06, duration }} />
    </ReactFlow>}
    <div className="reference-map-navigation"><button onClick={showStart}>Start</button><button disabled={!selectedNodeId} onClick={() => focusNode(selectedNodeId)}><LocateFixed size={13} />Selected topic</button><select aria-label="Jump to roadmap section" value={section} onChange={event => { setSection(event.target.value); focusNode(event.target.value); }}><option value="">Jump to section…</option>{sections.map(node => <option key={node.id} value={node.id}>{referenceNodeLabel(node)}</option>)}</select></div>
    <div className="reference-map-hint">Scroll to move · Pinch or use + / − to zoom</div>
    {query && !matching.length && <div className="reference-map-no-match" role="status">No matching label on this map.</div>}
  </div>;
}
