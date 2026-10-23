import { useCallback, useEffect, useMemo, useState } from 'react';
import { Background, BackgroundVariant, Controls, Handle, Position, ReactFlow, type Node, type NodeProps, type ReactFlowInstance } from '@xyflow/react';
import { ArrowUpRight, Check, ChevronDown, Circle, Layers3, LockKeyhole, Plus, Sparkles } from 'lucide-react';
import { topics, topicGroups, type Topic } from '../data/skills';
import type { TrackId } from '../lib/types';

export type TopicStatus = 'not-started' | 'in-progress' | 'completed';
export const statusLabels: Record<TopicStatus, string> = { 'not-started': 'Not started', 'in-progress': 'In progress', completed: 'Completed' };
export const trackNames: Record<TrackId, string> = { backend: 'Java & Backend', data: 'Data Science', agh: 'AGH studies' };
type SkillData = { topic?: Topic; title: string; track: TrackId; status?: TopicStatus; ready?: boolean; next?: boolean; count?: number; expanded?: boolean; toggle?: () => void; open?: () => void };
type SkillNode = Node<SkillData, 'skill' | 'section'>;

function SkillCard({ data, selected }: NodeProps<SkillNode>) {
  const topic = data.topic!;
  return <div className={`skill-node ${data.track} ${data.status} ${selected ? 'selected' : ''} ${data.next ? 'recommended' : ''}`}>
    <Handle type="target" position={Position.Top} isConnectable={false} />
    <div className="skill-node-top"><span className={`skill-state ${data.status}`}>{data.status === 'completed' ? <Check size={12} /> : data.status === 'in-progress' ? <span className="running-dot" /> : <Circle size={11} />}{statusLabels[data.status ?? 'not-started']}</span><span className="node-week">W{String(topic.week).padStart(2, '0')}</span></div>
    <div className="skill-node-title">{topic.milestone && <Sparkles size={15} />}<strong>{data.title}</strong><ArrowUpRight size={14} /></div>
    {data.next && <span className="node-next">Your next step</span>}{!data.ready && data.status !== 'completed' && <span className="node-lock"><LockKeyhole size={10} />Prerequisites to explore</span>}
    <Handle type="source" position={Position.Bottom} isConnectable={false} />
  </div>;
}
function SectionCard({ data }: NodeProps<SkillNode>) {
  return <div className={`section-node ${data.track}`}><Handle type="target" position={Position.Top} isConnectable={false} /><span className="section-node-label"><Layers3 size={13} />{data.title}</span><button className="nodrag nopan" onClick={e => { e.stopPropagation(); data.toggle?.(); }} aria-label={`${data.expanded ? 'Collapse' : 'Expand'} ${data.title}`} aria-expanded={data.expanded}>{data.expanded ? <ChevronDown size={13} /> : <Plus size={13} />}{data.expanded ? 'Less' : `${data.count} skills`}</button><Handle type="source" position={Position.Bottom} isConnectable={false} /></div>;
}
const nodeTypes = { skill: SkillCard, section: SectionCard };

export function SkillTree({ statuses, selectedId, nextId, onSelect, search, focusTrack }: { statuses: Record<string, TopicStatus>; selectedId: string | null; nextId?: string; onSelect: (id: string) => void; search: string; focusTrack: TrackId | 'all' }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [instance, setInstance] = useState<ReactFlowInstance<SkillNode> | null>(null);
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration = reducedMotion ? 0 : 280;
  const matching = useMemo(() => search.trim() ? topics.filter(t => `${t.title} ${t.description}`.toLowerCase().includes(search.trim().toLowerCase())) : [], [search]);
  useEffect(() => { if (matching.length) setExpanded(old => new Set([...old, ...matching.map(t => t.group)])); }, [matching]);
  const selectedTopic = topics.find(t => t.id === selectedId);
  useEffect(() => { if (selectedTopic) setExpanded(old => old.has(selectedTopic.group) ? old : new Set([...old, selectedTopic.group])); }, [selectedTopic]);
  const toggle = useCallback((id: string) => setExpanded(old => { const next = new Set(old); if (next.has(id)) next.delete(id); else next.add(id); return next; }), []);

  const { nodes, edges } = useMemo(() => {
    const result: SkillNode[] = [];
    const visible = new Set<string>();
    const laneIds: TrackId[] = ['backend', 'data', 'agh'];
    for (const [index, track] of laneIds.entries()) {
      let y = 72;
      for (const group of topicGroups.filter(g => g.track === track)) {
        const items = topics.filter(t => t.group === group.id);
        const shown = expanded.has(group.id) ? items : items.slice(0, 2);
        const x = index * 320 + 30;
        result.push({ id: `group-${group.id}`, type: 'section', position: { x, y }, data: { title: group.title, track, count: items.length, expanded: expanded.has(group.id), toggle: () => toggle(group.id) }, selectable: false, focusable: false, width: 244, height: 40 });
        y += 66;
        for (const topic of shown) {
          const status = statuses[topic.id] ?? 'not-started';
          result.push({ id: topic.id, type: 'skill', position: { x, y }, data: { topic, title: topic.title, track, status, ready: topic.prerequisites.every(id => statuses[id] === 'completed'), next: topic.id === nextId }, selected: topic.id === selectedId, width: 244, height: 112, ariaLabel: `${topic.title}, ${statusLabels[status]}, week ${topic.week}`, ariaRole: 'button' });
          visible.add(topic.id); y += 145;
        }
        y += 52;
      }
    }
    const connections: { id: string; source: string; target: string; type: string; style: { stroke: string; strokeWidth: number; strokeDasharray?: string }; animated?: boolean }[] = [];
    for (const topic of topics.filter(t => visible.has(t.id))) {
      if (!topic.prerequisites.length) connections.push({ id: `entry-${topic.id}`, source: `group-${topic.group}`, target: topic.id, type: 'smoothstep', style: { stroke: 'var(--edge)', strokeWidth: 1.5 } });
      for (const dependency of topic.prerequisites) {
        const source = visible.has(dependency) ? dependency : `group-${topics.find(t => t.id === dependency)?.group}`;
        if (!result.some(n => n.id === source) || source === topic.id) continue;
        const done = statuses[dependency] === 'completed';
        connections.push({ id: `${dependency}-${topic.id}`, source, target: topic.id, type: 'smoothstep', style: { stroke: done ? 'var(--green)' : 'var(--edge)', strokeWidth: 1.5, ...(topics.find(t => t.id === dependency)?.track !== topic.track ? { strokeDasharray: '4 5' } : {}) } });
      }
    }
    return { nodes: result, edges: connections };
  }, [expanded, statuses, selectedId, nextId, toggle]);

  useEffect(() => {
    if (!instance) return;
    const target = matching[0]?.id ?? selectedId;
    if (!target || !nodes.some(n => n.id === target)) return;
    const timer = setTimeout(() => { void instance.fitView({ nodes: [{ id: target }], padding: 1.8, minZoom: .75, maxZoom: 1.05, duration }); }, 80);
    return () => clearTimeout(timer);
  }, [instance, selectedId, matching, nodes.length, duration]);
  useEffect(() => {
    if (!instance) return;
    if (focusTrack === 'all') { void instance.setViewport({ x: 26, y: 12, zoom: window.innerWidth < 700 ? .84 : .92 }, { duration }); return; }
    const first = nodes.filter(n => n.data.track === focusTrack && n.type === 'skill').slice(0, 3);
    const timer = setTimeout(() => { void instance.fitView({ nodes: first, padding: .35, minZoom: .65, maxZoom: 1.1, duration }); }, 60);
    return () => clearTimeout(timer);
  }, [focusTrack, instance, duration]);
  return <div className="skill-canvas" aria-label="Interactive learning skill tree">
    <ReactFlow<SkillNode> nodes={nodes} edges={edges} nodeTypes={nodeTypes} onInit={setInstance} nodesDraggable={false} nodesConnectable={false} elementsSelectable nodesFocusable edgesFocusable={false} deleteKeyCode={null} onNodeClick={(_, node) => { if (node.type === 'skill') onSelect(node.id); }} onKeyDown={event => { if (event.key !== 'Enter' && event.key !== ' ') return; const element = (event.target as HTMLElement).closest('.react-flow__node-skill'); const id = element?.getAttribute('data-id'); if (id) { event.preventDefault(); onSelect(id); } }} minZoom={.25} maxZoom={1.6} defaultViewport={{ x: 26, y: 12, zoom: .92 }} colorMode="dark" preventScrolling proOptions={{ hideAttribution: false }} ariaLabelConfig={{ 'node.a11yDescription.default': 'Press Enter or Space to explore this topic.', 'node.a11yDescription.keyboardDisabled': 'Press Enter or Space to explore this topic.' }}>
      <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="#313338" />
      <Controls showInteractive={false} position="bottom-right" fitViewOptions={{ padding: .15, duration }} />
    </ReactFlow>
    <div className="canvas-instruction"><span className="keycap">↔</span>Drag to explore<span>·</span>Scroll to zoom</div>
    {search && !matching.length && <div className="canvas-empty">No matching skills. Try “Java”, “SQL”, or “EPAM”.</div>}
  </div>;
}
