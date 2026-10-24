import { useEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { Archive, ArrowRight, ArrowUpRight, BookOpen, Check, ChevronDown, CirclePlay, FileText, Filter, FolderOpen, Link2, ListChecks, Pencil, Plus, Search, Undo2, X } from 'lucide-react';
import { allTopics as topics } from '../data/skill-catalog';
import { getResources, getUnits, resourceCompletion } from '../lib/learning';
import { roadmap } from '../lib/roadmap';
import type { LearningResource, Progress, ResourceKind, ResourceStatus, ResourceUnit, TopicStatus, TrackId } from '../lib/types';
import { Modal } from './Modal';
import '../tracker.css';

type Props = { progress: Progress; disabled?: boolean; onChange: (updater: (p: Progress) => Progress) => void; initialResourceId?: string | null; onSkill: (id: string) => void };
const kinds: ResourceKind[] = ['course', 'video', 'playlist', 'documentation', 'article', 'book', 'project', 'roadmap'];
const resourceStatuses: ResourceStatus[] = ['not-started', 'in-progress', 'completed', 'paused'];
const unitKinds: ResourceUnit['kind'][] = ['module', 'lesson', 'video', 'chapter', 'section', 'milestone'];
const trackLabels: Record<TrackId, string> = { backend: 'Java & Backend', data: 'Data Science', agh: 'AGH preparation' };
const labels: Record<string, string> = { 'not-started': 'Not started', 'in-progress': 'In progress', completed: 'Completed', paused: 'Paused' };
const now = () => new Date().toISOString();
function changedFields<T extends object>(value: T, original: T): Partial<T> {
  const patch: Partial<T> = {};
  const preserved = new Set(['id', 'resourceId', 'createdAt', 'created_at', 'created', 'updatedAt', 'updated_at']);
  for (const key of Object.keys(value) as (keyof T)[]) {
    if (!preserved.has(String(key)) && JSON.stringify(value[key]) !== JSON.stringify(original[key])) patch[key] = value[key];
  }
  return patch;
}
function validUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  try { const url = new URL(trimmed); if ((url.protocol === 'https:' || url.protocol === 'http:') && !url.username && !url.password) return url.href; } catch { /* Friendly error below. */ }
  throw new Error('Use a full http:// or https:// URL, or leave the link blank.');
}
function renderUrl(value?: string) { try { return validUrl(value ?? ''); } catch { return ''; } }
function resourceIcon(kind: ResourceKind) { return kind === 'video' || kind === 'playlist' ? <CirclePlay size={19} /> : kind === 'documentation' || kind === 'article' ? <FileText size={19} /> : <BookOpen size={19} />; }
function descendants(units: ResourceUnit[], id: string): Set<string> {
  const found = new Set<string>([id]); let changed = true;
  while (changed) { changed = false; for (const unit of units) if (found.has(unit.parentId) && !found.has(unit.id)) { found.add(unit.id); changed = true; } }
  return found;
}
function unitLeaves(units: ResourceUnit[], id: string): ResourceUnit[] {
  const ids = descendants(units, id);
  return units.filter(u => u.kind !== 'module' && ids.has(u.id) && !units.some(child => child.parentId === u.id));
}

function patchUnitTree(progress: Progress, unit: ResourceUnit, patch: Partial<ResourceUnit>): Progress {
  const all = Object.values(progress.units ?? {}).filter(item => item.resourceId === unit.resourceId);
  const ids = typeof patch.archived === 'boolean' ? descendants(all, unit.id) : new Set([unit.id]);
  // Restoring an individual child also restores its ancestors, keeping every active item visible.
  if (patch.archived === false) {
    let parentId = progress.units?.[unit.id]?.parentId ?? unit.parentId;
    while (parentId && !ids.has(parentId)) { ids.add(parentId); parentId = progress.units?.[parentId]?.parentId ?? ''; }
  }
  const units = { ...progress.units };
  const updatedAt = now();
  for (const id of ids) {
    const previous = units[id] ?? (id === unit.id ? unit : undefined);
    if (previous) units[id] = { ...previous, ...(id === unit.id ? patch : { archived: patch.archived }), updatedAt };
  }
  return { ...progress, units };
}

export function ResourceLibrary({ progress, disabled = false, onChange, initialResourceId, onSkill }: Props) {
  const resources = getResources(progress);
  const detailRef = useRef<HTMLElement>(null);
  const catalogRef = useRef<HTMLDivElement>(null);
  const [revealDetail, setRevealDetail] = useState(!!initialResourceId);
  const [selectedId, setSelectedId] = useState<string | null>(initialResourceId ?? null);
  const [query, setQuery] = useState('');
  const [kindFilter, setKindFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showArchived, setShowArchived] = useState(false);
  const [editing, setEditing] = useState<LearningResource | 'new' | null>(null);
  const [unitEditor, setUnitEditor] = useState<{ resource: LearningResource; unit?: ResourceUnit; kind: ResourceUnit['kind']; parentId: string } | null>(null);
  useEffect(() => { if (initialResourceId) { setSelectedId(initialResourceId); setRevealDetail(true); setQuery(''); setKindFilter('all'); setStatusFilter('all'); setShowArchived(!!resources.find(r => r.id === initialResourceId)?.archived); } }, [initialResourceId]);
  const filtered = resources.filter(resource => resource.archived === showArchived && (kindFilter === 'all' || resource.kind === kindFilter) && (statusFilter === 'all' || resource.status === statusFilter) && `${resource.title} ${resource.provider} ${resource.notes}`.toLowerCase().includes(query.trim().toLowerCase()));
  const selected = filtered.find(resource => resource.id === selectedId) ?? filtered[0];
  const selectResource = (id: string) => { setSelectedId(id); setRevealDetail(true); };
  useEffect(() => {
    if (!revealDetail || !selected) return;
    const timer = setTimeout(() => {
      if (window.innerWidth <= 650) { detailRef.current?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); detailRef.current?.focus({ preventScroll: true }); }
      setRevealDetail(false);
    }, 50);
    return () => clearTimeout(timer);
  }, [selected?.id, revealDetail]);
  const saveResource = (resource: LearningResource) => {
    const original = editing && editing !== 'new' ? editing : undefined;
    const patch = original ? changedFields(resource, original) : resource;
    const visible = { ...getResources(progress).find(item => item.id === resource.id), ...patch };
    onChange(p => ({ ...p, resources: { ...p.resources, [resource.id]: { ...getResources(p).find(item => item.id === resource.id), ...patch, id: resource.id, updatedAt: now() } as LearningResource } }));
    setQuery(''); setKindFilter('all'); setStatusFilter('all'); setShowArchived(visible.archived ?? resource.archived); selectResource(resource.id); setEditing(null);
  };
  const updateResource = (resource: LearningResource, patch: Partial<LearningResource>) => onChange(p => ({ ...p, resources: { ...p.resources, [resource.id]: { ...resource, ...p.resources?.[resource.id], ...patch, updatedAt: now() } } }));
  const saveUnit = (unit: ResourceUnit) => {
    const original = unitEditor?.unit;
    const patch = original ? changedFields(unit, original) : unit;
    onChange(p => {
      const previous = p.units?.[unit.id];
      if (previous && typeof patch.archived === 'boolean' && previous.archived !== patch.archived) return patchUnitTree(p, previous, patch);
      return { ...p, units: { ...p.units, [unit.id]: { ...previous, ...patch, id: unit.id, resourceId: unit.resourceId, updatedAt: now() } as ResourceUnit } };
    });
    setUnitEditor(null);
  };
  const updateUnit = (unit: ResourceUnit, patch: Partial<ResourceUnit>) => onChange(p => patchUnitTree(p, unit, patch));
  const activeCount = resources.filter(r => !r.archived).length;

  return <section className="tracker-view library-view" aria-label="Courses and resources">
    <div className="tracker-section-heading"><div><h2>Your collection</h2></div><button className="button primary" disabled={disabled} onClick={() => setEditing('new')}><Plus size={16} />Add resource</button></div>
    <div className="library-guidance"><BookOpen size={17} /><p>Track manually at your own pace. Add only the lessons you use.</p></div>
    <div className="library-filters"><label className="library-search"><Search size={17} /><input aria-label="Search resources" placeholder="Search titles, providers, or notes…" value={query} onChange={e => setQuery(e.target.value)} />{query && <button aria-label="Clear resource search" onClick={() => setQuery('')}><X size={15} /></button>}</label><label><span className="tracker-sr-only">Resource type</span><select aria-label="Resource type" value={kindFilter} onChange={e => setKindFilter(e.target.value)}><option value="all">All types</option>{kinds.map(kind => <option key={kind} value={kind}>{kind[0].toUpperCase() + kind.slice(1)}</option>)}</select></label><label><span className="tracker-sr-only">Resource status</span><select aria-label="Resource status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="all">All statuses</option>{resourceStatuses.map(status => <option key={status} value={status}>{labels[status]}</option>)}</select></label><button className={`tracker-filter-button ${showArchived ? 'active' : ''}`} aria-pressed={showArchived} onClick={() => { setShowArchived(value => !value); setSelectedId(null); }}><Archive size={15} />{showArchived ? 'Archived' : 'Archive'}</button></div>
    <div className="library-layout"><div ref={catalogRef} tabIndex={-1} className="library-catalog" aria-label="Your resource collection"><div className="library-list-caption"><span>{showArchived ? 'ARCHIVED COLLECTION' : 'YOUR COLLECTION'}</span><small>{filtered.length} shown · {activeCount} active</small></div>{filtered.length ? <div className="library-resource-list">{filtered.map(resource => { const count = resourceCompletion(progress, resource.id); return <button key={resource.id} className={`library-resource-card ${resource.track} ${resource.id === selected?.id ? 'selected' : ''}`} onClick={() => selectResource(resource.id)} aria-pressed={resource.id === selected?.id}><span className="library-resource-icon">{resourceIcon(resource.kind)}</span><span className="library-resource-copy"><span className="library-resource-meta">{resource.provider || resource.kind}<span className={`tracker-status-dot ${resource.status}`} /></span><strong>{resource.title}</strong><span className="library-card-footer"><span>{labels[resource.status]}</span>{count.total > 0 ? <span>{count.done}/{count.total} items</span> : <span>Manual tracking</span>}</span>{count.total > 0 && <span className="tracker-progress-bar"><i style={{ width: `${Math.round(count.done / count.total * 100)}%` }} /></span>}</span><ChevronDown size={14} className="library-card-chevron" /></button>; })}</div> : <div className="tracker-empty"><FolderOpen size={27} /><h3>{showArchived ? 'No archived resources here.' : 'Nothing matches this view.'}</h3><p>{showArchived ? 'Archived material stays recoverable here.' : 'Clear your filters, or add the material you are learning from.'}</p>{!showArchived && <button className="text-button" onClick={() => { setQuery(''); setKindFilter('all'); setStatusFilter('all'); }}><Filter size={14} />Clear filters</button>}</div>}</div>
      {selected ? <ResourceDetail detailRef={detailRef} onBack={() => { catalogRef.current?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); catalogRef.current?.querySelector<HTMLButtonElement>('.library-resource-card.selected')?.focus({ preventScroll: true }); }} key={selected.id} resource={selected} progress={progress} disabled={disabled} onPatch={patch => updateResource(selected, patch)} onEdit={() => setEditing(selected)} onUnit={(unit, kind = 'lesson', parentId = '') => setUnitEditor({ resource: selected, unit, kind, parentId })} onUnitPatch={updateUnit} onSkill={onSkill} /> : <div className="library-detail library-detail-empty"><LayersIcon /><h3>A useful resource has a next step.</h3><p>Select a resource to save your place, add modules, or record what you completed.</p><button className="button secondary" disabled={disabled} onClick={() => setEditing('new')}><Plus size={15} />Add your first resource</button></div>}
    </div>
    {editing && <ResourceForm key={editing === 'new' ? 'new' : editing.id} resource={editing === 'new' ? undefined : editing} disabled={disabled} onClose={() => setEditing(null)} onSave={saveResource} />}
    {unitEditor && <UnitForm key={unitEditor.unit?.id ?? 'new'} resource={unitEditor.resource} unit={unitEditor.unit} defaultKind={unitEditor.kind} defaultParentId={unitEditor.parentId} units={Object.values(progress.units ?? {}).filter(unit => unit.resourceId === unitEditor.resource.id).sort((a, b) => a.position - b.position)} disabled={disabled} onClose={() => setUnitEditor(null)} onSave={saveUnit} />}
  </section>;
}

function ResourceDetail({ resource, progress, disabled, onPatch, onEdit, onUnit, onUnitPatch, onSkill, detailRef, onBack }: { detailRef: RefObject<HTMLElement | null>; onBack: () => void; resource: LearningResource; progress: Progress; disabled: boolean; onPatch: (patch: Partial<LearningResource>) => void; onEdit: () => void; onUnit: (unit?: ResourceUnit, kind?: ResourceUnit['kind'], parentId?: string) => void; onUnitPatch: (unit: ResourceUnit, patch: Partial<ResourceUnit>) => void; onSkill: (id: string) => void }) {
  const units = getUnits(progress, resource.id);
  const count = resourceCompletion(progress, resource.id);
  const [notes, setNotes] = useState(resource.notes);
  const [resumeLabel, setResumeLabel] = useState(resource.resumeLabel);
  const [resumeUrl, setResumeUrl] = useState(resource.resumeUrl);
  const [dirtyFields, setDirtyFields] = useState<Set<'notes' | 'resumeLabel' | 'resumeUrl'>>(new Set());
  const dirty = dirtyFields.size > 0;
  const [formError, setFormError] = useState('');
  const [saved, setSaved] = useState(false);
  useEffect(() => { if (!dirtyFields.has('notes')) setNotes(resource.notes); if (!dirtyFields.has('resumeLabel')) setResumeLabel(resource.resumeLabel); if (!dirtyFields.has('resumeUrl')) setResumeUrl(resource.resumeUrl); }, [resource.notes, resource.resumeLabel, resource.resumeUrl, dirtyFields]);
  const unitMap = useMemo(() => new Map(units.map(unit => [unit.id, unit])), [units]);
  const activeUnit = units.find(unit => unit.status === 'in-progress' && !units.some(child => child.parentId === unit.id) && renderUrl(unit.url));
  const continueUrl = renderUrl(resource.resumeUrl) || renderUrl(activeUnit?.url) || renderUrl(resource.url);
  const archivedUnits = Object.values(progress.units ?? {}).filter(unit => unit.resourceId === resource.id && unit.archived);
  const ownUrl = renderUrl(resource.url);
  const hasHiddenParent = (unit: ResourceUnit) => { const parent = (progress.units ?? {})[unit.parentId]; return !!parent?.archived; };
  const roots = units.filter(unit => !unit.parentId || !unitMap.has(unit.parentId));
  const associated = topics.filter(topic => resource.skillIds.includes(topic.id));
  const courseScope = roadmap.courses.find(course => course.id === resource.id)?.scope;
  function renderUnit(unit: ResourceUnit, depth: number, ancestors: Set<string>) {
    if (ancestors.has(unit.id)) return null;
    const chain = new Set([...ancestors, unit.id]);
    const children = units.filter(item => item.parentId === unit.id);
    const isContainer = unit.kind === 'module' || children.length > 0;
    const leaves = unitLeaves(units, unit.id);
    const done = leaves.filter(leaf => leaf.status === 'completed').length;
    const body = <div className="library-unit-row"><span className="library-unit-indicator">{isContainer ? <ListChecks size={17} /> : <input type="checkbox" disabled={disabled || resource.archived} aria-label={`Complete ${unit.title}`} checked={unit.status === 'completed'} onChange={event => onUnitPatch(unit, { status: event.target.checked ? 'completed' : 'not-started' })} />}</span><span className="library-unit-copy"><span>{unit.kind}{hasHiddenParent(unit) ? ' · parent archived' : ''}</span><strong>{unit.title}</strong>{isContainer ? <small>{leaves.length ? `${done}/${leaves.length} items completed · from child items` : 'No lessons yet · organizational module'}</small> : <small>{labels[unit.status]}</small>}</span>{renderUrl(unit.url) && <a className="tracker-icon-button" href={renderUrl(unit.url)} target="_blank" rel="noreferrer" aria-label={`Open ${unit.title}`}><ArrowUpRight size={15} /></a>}<button className="tracker-icon-button" disabled={disabled || resource.archived} onClick={() => onUnit(unit)} aria-label={`Edit ${unit.title}`}><Pencil size={14} /></button></div>;
    return <div className={`library-unit ${isContainer ? 'library-unit-group' : ''}`} key={unit.id} style={{ '--unit-depth': Math.min(depth, 4) } as CSSProperties}>{isContainer ? <details open><summary><ChevronDown size={15} /><span>{unit.title}</span><small>{leaves.length ? `${done}/${leaves.length}` : 'No lessons'}</small></summary><div className="library-unit-group-content">{body}{unit.notes && <p className="library-unit-notes">{unit.notes}</p>}{children.map(child => renderUnit(child, depth + 1, chain))}<button className="library-inline-add" disabled={disabled || resource.archived} onClick={() => onUnit(undefined, 'lesson', unit.id)}><Plus size={13} />Add lesson to this {unit.kind}</button></div></details> : <>{body}{unit.notes && <p className="library-unit-notes">{unit.notes}</p>}</>}</div>;
  }
  return <article ref={detailRef} tabIndex={-1} aria-labelledby="library-resource-title" className={`library-detail ${resource.track}`}><button className="library-back-to-list" onClick={onBack}><ArrowRight size={14} />Back to collection</button><div className="library-detail-heading"><span className="tracker-kicker"><span className={`track-dot ${resource.track}`} />{trackLabels[resource.track]} / {resource.kind.toUpperCase()}</span><div><button className="tracker-icon-button" disabled={disabled || resource.archived} onClick={onEdit} aria-label="Edit resource"><Pencil size={16} /></button><button className="tracker-icon-button" disabled={disabled} aria-label={resource.archived ? 'Restore resource' : 'Archive resource'} onClick={() => onPatch({ archived: !resource.archived })}>{resource.archived ? <Undo2 size={16} /> : <Archive size={16} />}</button></div></div><h2 id="library-resource-title">{resource.title}</h2><p className="library-provider">{resource.provider || 'Your saved resource'}</p><div className="library-detail-actions"><label className="library-status-field"><span>Status</span><select aria-label="Resource learning status" value={resource.status} disabled={disabled || resource.archived} onChange={e => onPatch({ status: e.target.value as ResourceStatus })}>{resourceStatuses.map(status => <option value={status} key={status}>{labels[status]}</option>)}</select></label>{continueUrl && <a className="button primary" href={continueUrl} target="_blank" rel="noreferrer"><CirclePlay size={15} />Continue learning<ArrowUpRight size={13} /></a>}{ownUrl && <a className="tracker-icon-button library-open-source" href={ownUrl} target="_blank" rel="noreferrer" aria-label="Open original resource"><Link2 size={16} /></a>}</div>
    <div className="library-detail-progress"><div><span>Items you added</span><strong>{count.total ? `${count.done} / ${count.total}` : 'No items yet'}</strong></div>{count.total > 0 && <span className="tracker-progress-bar"><i style={{ width: `${Math.round(count.done / count.total * 100)}%` }} /></span>}<p>{count.total ? 'Lessons count once. Course status stays manual.' : 'Add your next lesson below. Course status stays manual.'}</p></div>
    <section className="library-curriculum"><div className="tracker-subheading"><div><h3><ListChecks size={16} />Your modules & lessons</h3><p>Track only the lessons you use.</p></div><div className="library-add-unit-actions"><button className="button secondary" disabled={disabled || resource.archived} onClick={() => onUnit(undefined, 'module')}><Plus size={13} />Module</button><button className="button secondary" disabled={disabled || resource.archived} onClick={() => onUnit(undefined, resource.kind === 'playlist' ? 'video' : resource.kind === 'book' ? 'chapter' : 'lesson')}><Plus size={13} />{resource.kind === 'playlist' ? 'Video' : resource.kind === 'book' ? 'Chapter' : 'Lesson'}</button></div></div>{roots.length ? <div className="library-unit-tree">{roots.map(unit => renderUnit(unit, 0, new Set()))}</div> : <div className="library-unit-empty"><p>Add your next module, lesson, video, or chapter to begin.</p></div>}{archivedUnits.length > 0 && <details className="library-archived-units"><summary><Archive size={13} />{archivedUnits.length} archived items<ChevronDown size={13} /></summary>{archivedUnits.map(unit => <div key={unit.id}><span>{unit.title}<small>{unit.kind}</small></span><button disabled={disabled || resource.archived} className="text-button" onClick={() => onUnitPatch(unit, { archived: false })}><Undo2 size={13} />Restore</button></div>)}</details>}</section>
    {associated.length > 0 && <details className="library-skill-disclosure"><summary>Linked roadmap skills ({associated.length})<ChevronDown size={14} /></summary><div className="library-skill-links">{associated.map(topic => <button key={topic.id} onClick={() => onSkill(topic.id)}><span className={`track-dot ${topic.track}`} />{topic.title}<ArrowUpRight size={12} /></button>)}</div></details>}


    {courseScope && <details className="library-skill-disclosure"><summary>How this fits your plan<ChevronDown size={14} /></summary><p className="tracker-form-intro">{courseScope}</p></details>}
    <section className="library-bookmark"><div className="tracker-subheading"><h3><FlagIcon />Keep your place</h3>{resource.resumeLabel && <span>Saved bookmark</span>}</div><form onChangeCapture={event => { const target = event.target; const field = target instanceof HTMLTextAreaElement ? 'notes' : target instanceof HTMLInputElement && target.type === 'url' ? 'resumeUrl' : 'resumeLabel'; setDirtyFields(fields => new Set([...fields, field])); }} onSubmit={event => { event.preventDefault(); try { const patch: Partial<LearningResource> = {}; if (dirtyFields.has('notes')) patch.notes = notes; if (dirtyFields.has('resumeLabel')) patch.resumeLabel = resumeLabel.trim(); if (dirtyFields.has('resumeUrl')) patch.resumeUrl = validUrl(resumeUrl); onPatch(patch); setDirtyFields(new Set()); setSaved(true); setFormError(''); } catch (error) { setFormError(error instanceof Error ? error.message : 'Check the link.'); } }}><div className="library-bookmark-fields"><label>Next lesson or chapter<input maxLength={200} value={resumeLabel} disabled={disabled || resource.archived} onChange={e => { setResumeLabel(e.target.value); setSaved(false); }} placeholder="e.g. Module 2 · Collections lab" /></label><label>Resume link (optional)<input type="url" value={resumeUrl} maxLength={2000} disabled={disabled || resource.archived} onChange={e => { setResumeUrl(e.target.value); setSaved(false); }} placeholder="https://…" /></label></div><label>Learning notes<textarea aria-label="Learning notes" rows={3} maxLength={5000} disabled={disabled || resource.archived} value={notes} onChange={e => { setNotes(e.target.value); setSaved(false); }} placeholder="What you learned, evidence, and the next small step…" /></label><div className="library-bookmark-footer"><span className="library-save-status" role="status">{formError || (saved ? 'Bookmark and notes saved.' : dirty ? 'Unsaved changes' : 'No automatic certificate or video tracking.')}</span><button type="submit" className="button secondary" disabled={disabled || resource.archived || !dirty}>Save place & notes<Check size={14} /></button></div></form></section>
  </article>;
}

function ResourceForm({ resource, disabled, onClose, onSave }: { resource?: LearningResource; disabled: boolean; onClose: () => void; onSave: (resource: LearningResource) => void }) {
  const [title, setTitle] = useState(resource?.title ?? '');
  const [provider, setProvider] = useState(resource?.provider ?? '');
  const [kind, setKind] = useState<ResourceKind>(resource?.kind ?? 'course');
  const [url, setUrl] = useState(resource?.url ?? '');
  const [track, setTrack] = useState<TrackId>(resource?.track ?? 'backend');
  const [status, setStatus] = useState<ResourceStatus>(resource?.status ?? 'not-started');
  const [skillIds, setSkillIds] = useState<string[]>(resource?.skillIds ?? []);
  const [error, setError] = useState('');
  return <Modal title={resource ? 'Edit learning resource' : 'Add a learning resource'} onClose={onClose}><form className="tracker-form" onSubmit={event => { event.preventDefault(); try { if (!title.trim()) throw new Error('Give this resource a title.'); onSave({ ...resource, id: resource?.id ?? `rs-${crypto.randomUUID()}`, title: title.trim(), provider: provider.trim(), kind, url: validUrl(url), track, status, skillIds, notes: resource?.notes ?? '', resumeLabel: resource?.resumeLabel ?? '', resumeUrl: resource?.resumeUrl ?? '', archived: resource?.archived ?? false, updatedAt: now() }); } catch (error) { setError(error instanceof Error ? error.message : 'Check the resource details.'); } }}><p className="tracker-form-intro">Save the material you will actually use. Adding a resource does not add it to your study workload or mark any skill complete.</p><label>Resource title<input autoFocus required maxLength={200} value={title} disabled={disabled} onChange={e => setTitle(e.target.value)} placeholder="e.g. Java collections practice playlist" /></label><div className="tracker-form-grid"><label>Type<select aria-label="Type" value={kind} disabled={disabled} onChange={e => setKind(e.target.value as ResourceKind)}>{kinds.map(kind => <option key={kind} value={kind}>{kind[0].toUpperCase() + kind.slice(1)}</option>)}</select></label><label>Learning track<select aria-label="Learning track" value={track} disabled={disabled} onChange={e => setTrack(e.target.value as TrackId)}>{Object.entries(trackLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label></div><label>Provider or author (optional)<input maxLength={200} value={provider} disabled={disabled} onChange={e => setProvider(e.target.value)} placeholder="Coursera, YouTube, author, or official documentation" /></label><label>Resource link (optional)<input type="url" maxLength={2000} value={url} disabled={disabled} onChange={e => setUrl(e.target.value)} placeholder="https://…" /></label><label>Learning status<select aria-label="Learning status" value={status} disabled={disabled} onChange={e => setStatus(e.target.value as ResourceStatus)}>{resourceStatuses.map(status => <option key={status} value={status}>{labels[status]}</option>)}</select></label><fieldset className="library-skill-picker" disabled={disabled}><legend>Related skills (optional)</legend><p>Associate with existing roadmap skills. This does not change their completion.</p><div>{topics.map(topic => <label key={topic.id}><input type="checkbox" checked={skillIds.includes(topic.id)} onChange={e => setSkillIds(ids => e.target.checked ? [...ids, topic.id] : ids.filter(id => id !== topic.id))} /><span className={`track-dot ${topic.track}`} /><span>{topic.title}</span></label>)}</div></fieldset>{error && <p role="alert" className="tracker-form-error">{error}</p>}<div className="modal-actions"><button type="button" className="text-button" onClick={onClose}>Cancel</button><button type="submit" disabled={disabled} className="button primary">{resource ? 'Save resource' : 'Add resource'}<ArrowRight size={14} /></button></div></form></Modal>;
}

function UnitForm({ resource, unit, units, defaultKind, defaultParentId, disabled, onClose, onSave }: { resource: LearningResource; unit?: ResourceUnit; units: ResourceUnit[]; defaultKind: ResourceUnit['kind']; defaultParentId: string; disabled: boolean; onClose: () => void; onSave: (unit: ResourceUnit) => void }) {
  const [title, setTitle] = useState(unit?.title ?? '');
  const [kind, setKind] = useState(unit?.kind ?? defaultKind);
  const [parentId, setParentId] = useState(unit?.parentId ?? defaultParentId);
  const [url, setUrl] = useState(unit?.url ?? '');
  const [status, setStatus] = useState<TopicStatus>(unit?.status ?? 'not-started');
  const [notes, setNotes] = useState(unit?.notes ?? '');
  const [error, setError] = useState('');
  const blocked = unit ? descendants(units, unit.id) : new Set<string>();
  const containers = units.filter(item => item.kind === 'module' && !blocked.has(item.id) && (!item.archived || item.id === parentId));
  const hasChildren = unit && units.some(item => item.parentId === unit.id);
  return <Modal title={unit ? `Edit ${unit.kind}` : `Add a ${defaultKind}`} onClose={onClose}><form className="tracker-form" onSubmit={event => { event.preventDefault(); try { if (!title.trim()) throw new Error('Give this item a title.'); if (hasChildren && kind !== 'module') throw new Error('An item with children must stay a module. Move its children before changing its type.'); if (parentId && (!units.some(item => item.id === parentId && item.kind === 'module') || blocked.has(parentId))) throw new Error('Choose an existing parent outside this item’s children.'); onSave({ ...unit, id: unit?.id ?? `unit-${crypto.randomUUID()}`, resourceId: resource.id, parentId, title: title.trim(), kind, url: validUrl(url), status: kind === 'module' ? unit?.status ?? 'not-started' : status, notes, position: unit?.position ?? Math.max(-1, ...units.map(item => item.position)) + 1, archived: unit?.archived ?? false, updatedAt: now() }); } catch (error) { setError(error instanceof Error ? error.message : 'Check the item details.'); } }}><p className="tracker-form-intro">{resource.title}. Enter the real title from your course, playlist, or book; nothing is imported automatically.</p><label>Item title<input autoFocus required maxLength={200} value={title} disabled={disabled} onChange={e => setTitle(e.target.value)} placeholder="e.g. Lesson 3 · Lists and maps" /></label><div className="tracker-form-grid"><label>Item type<select aria-label="Item type" value={kind} disabled={disabled || !!hasChildren} onChange={e => setKind(e.target.value as ResourceUnit['kind'])}>{unitKinds.map(kind => <option value={kind} key={kind}>{kind[0].toUpperCase() + kind.slice(1)}</option>)}</select></label><label>Group under<select aria-label="Group under" value={parentId} disabled={disabled} onChange={e => setParentId(e.target.value)}><option value="">Top level · no parent</option>{containers.map(item => <option value={item.id} key={item.id}>{item.title} ({item.archived ? 'archived module' : 'module'})</option>)}</select></label></div><label>Direct link (optional)<input type="url" maxLength={2000} value={url} disabled={disabled} onChange={e => setUrl(e.target.value)} placeholder="https://…" /></label>{kind === 'module' || hasChildren ? <p className="tracker-form-intro">Modules are organizational containers. Their displayed progress comes from real child lessons; empty modules have no completion status.</p> : <label>Progress<select aria-label="Progress" disabled={disabled} value={status} onChange={e => setStatus(e.target.value as TopicStatus)}><option value="not-started">Not started</option><option value="in-progress">In progress</option><option value="completed">Completed</option></select></label>}<label>Notes or evidence<textarea aria-label="Notes or evidence" rows={3} maxLength={5000} disabled={disabled} value={notes} onChange={e => setNotes(e.target.value)} placeholder="What to practice, what worked, or the next step…" /></label>{error && <p className="tracker-form-error" role="alert">{error}</p>}<div className="modal-actions">{unit ? <button type="button" disabled={disabled} className="text-button" onClick={() => onSave({ ...unit, archived: true, updatedAt: now() })}><Archive size={14} />{unit.kind === 'module' ? 'Archive module & its items' : 'Archive item'}</button> : <button type="button" className="text-button" onClick={onClose}>Cancel</button>}<button type="submit" disabled={disabled} className="button primary">{unit ? 'Save item' : 'Add item'}<Check size={14} /></button></div></form></Modal>;
}
function LayersIcon() { return <span className="library-detail-empty-icon"><BookOpen size={32} /></span>; }
function FlagIcon() { return <span className="library-bookmark-icon"><Link2 size={16} /></span>; }
