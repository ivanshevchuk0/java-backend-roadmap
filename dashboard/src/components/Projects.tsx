import { useEffect, useState, type FormEvent } from 'react';
import { Archive, ArrowRight, ArrowUpRight, CheckCircle2, Code2, FolderGit2, Search, Undo2 } from 'lucide-react';
import { projectCatalog, type ProjectDefinition } from '../data/projects';
import { useTopicCatalog } from '../lib/TopicCatalogContext';
import type { Progress, ProjectProgress, TopicStatus } from '../lib/types';
import { Modal } from './Modal';
import '../tracker.css';
import '../projects.css';

type Props = {
  progress: Progress;
  disabled?: boolean;
  onChange: (updater: (progress: Progress) => Progress) => void;
  onSkill: (id: string) => void;
  initialProjectId?: string | null;
};
const labels: Record<TopicStatus, string> = { 'not-started': 'Not started', 'in-progress': 'Learning', completed: 'Done' };
const difficulties = ['beginner', 'intermediate', 'advanced'] as const;
const categories = ['CLI', 'Backend API', 'Database', 'Full-Stack'] as const;
const stamp = () => new Date().toISOString();
function blankProject(id: string, title: string): ProjectProgress {
  return { id, title, track: 'backend', status: 'not-started', repositoryUrl: '', notes: '', updatedAt: '', archived: false };
}
function safeUrl(value: string): string {
  if (!value.trim()) return '';
  try {
    const url = new URL(value.trim());
    if (['https:', 'http:'].includes(url.protocol) && !url.username && !url.password) return url.href;
  } catch { /* Report validation next to the form. */ }
  throw new Error('Use a full https:// or http:// repository URL, or leave it blank.');
}
function linkUrl(value: string) { try { return safeUrl(value); } catch { return ''; } }

export function Projects({ progress, disabled = false, onChange, onSkill, initialProjectId }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(initialProjectId ?? null);
  const [difficulty, setDifficulty] = useState('all');
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  useEffect(() => { if (initialProjectId) setSelectedId(initialProjectId); }, [initialProjectId]);
  const saved = progress.projects ?? {};
  const catalogIds = new Set(projectCatalog.map(project => project.id));
  const custom = Object.values(saved).filter(project => !catalogIds.has(project.id));
  const archived = Object.values(saved).filter(project => project.archived);
  const matches = (project: ProjectDefinition) => (difficulty === 'all' || project.difficulty === difficulty)
    && (category === 'all' || project.category === category)
    && `${project.title} ${project.description}`.toLowerCase().includes(query.trim().toLowerCase());
  const visible = projectCatalog.filter(project => !saved[project.id]?.archived && matches(project));
  const primary = visible.find(project => project.id === 'study-task-backend');
  const alternatives = visible.filter(project => project.id !== primary?.id);
  const selectedDefinition = projectCatalog.find(project => project.id === selectedId);
  const selected = selectedId ? saved[selectedId] ?? (selectedDefinition ? blankProject(selectedId, selectedDefinition.title) : undefined) : undefined;
  const activeSaved = Object.values(saved).filter(project => !project.archived && project.status === 'in-progress');
  const completed = Object.values(saved).filter(project => !project.archived && project.status === 'completed').length;
  function patch(project: ProjectProgress, values: Partial<ProjectProgress>) {
    onChange(current => ({ ...current, projects: { ...current.projects, [project.id]: { ...(current.projects?.[project.id] ?? project), ...values, updatedAt: stamp() } } }));
  }
  function openSkill(id: string) { setSelectedId(null); onSkill(id); }
  function card(project: ProjectDefinition, featured = false) {
    const record = saved[project.id];
    const status = record?.status ?? 'not-started';
    return <article className={`project-card${featured ? ' project-featured' : ''}`} key={project.id}>
      <div className="project-card-meta"><span>{featured ? 'YOUR MAIN PORTFOLIO PROJECT' : project.category}</span><span className={`project-level ${project.difficulty}`}>{project.difficulty}</span></div>
      <button className="project-title-button" onClick={() => setSelectedId(project.id)}><h3>{project.title}</h3><ArrowRight size={17} /></button>
      <p>{project.description}</p>
      <div className="project-card-footer"><span className="project-status"><i className={`tracker-status-dot ${status}`} />{labels[status]}</span><button className="text-button" onClick={() => setSelectedId(project.id)}>{status === 'not-started' ? 'Explore project' : 'Continue project'}<ArrowRight size={13} /></button></div>
    </article>;
  }
  return <section className="tracker-view projects-view">
    <header className="tracker-section-heading"><div><div className="tracker-kicker"><FolderGit2 size={14} /> BUILD & PRACTICE</div><h2>Projects</h2><p>Grow one useful Java backend. Choose small practice projects when they help a skill; advanced ideas can wait.</p></div><span className="projects-summary">{activeSaved.length} active · {completed} completed</span></header>
    <div className="library-guidance"><Code2 size={18} /><p><strong>StudyTask is the main project in your 12-week plan.</strong> Other projects are optional alternatives, not extra assignments. AGH deadlines come first. Project progress is independent of courses, skills and weekly tasks.</p></div>
    <div className="project-filters"><label className="library-search"><Search size={16} /><span className="tracker-sr-only">Search projects</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search projects…" /></label><label><span className="tracker-sr-only">Project difficulty</span><select aria-label="Project difficulty" value={difficulty} onChange={event => setDifficulty(event.target.value)}><option value="all">All levels</option>{difficulties.map(value => <option key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</option>)}</select></label><label><span className="tracker-sr-only">Project category</span><select aria-label="Project category" value={category} onChange={event => setCategory(event.target.value)}><option value="all">All categories</option>{categories.map(value => <option key={value}>{value}</option>)}</select></label></div>
    {primary && card(primary, true)}
    {alternatives.length > 0 && <><div className="tracker-subheading project-catalog-heading"><h3>Practice & later extensions</h3><span>{alternatives.length} options</span></div><div className="project-grid">{alternatives.map(project => card(project))}</div></>}
    {visible.length === 0 && <div className="tracker-empty"><Search size={24} /><h3>No matching projects</h3><p>Try another level, category or search term.</p><button className="text-button" onClick={() => { setQuery(''); setDifficulty('all'); setCategory('all'); }}>Clear filters</button></div>}
    {custom.some(project => !project.archived) && <section className="project-saved"><div className="tracker-subheading"><h3>Your saved projects</h3></div><div className="project-grid">{custom.filter(project => !project.archived).map(project => <article key={project.id} className="project-card"><div className="project-card-meta"><span>YOUR PROJECT</span><span className="project-status"><i className={`tracker-status-dot ${project.status}`} />{labels[project.status]}</span></div><button className="project-title-button" onClick={() => setSelectedId(project.id)}><h3>{project.title}</h3><ArrowRight size={17} /></button><p>{project.notes || 'Your project notes and repository are preserved here.'}</p><button className="text-button" onClick={() => setSelectedId(project.id)}>Open project<ArrowRight size={13} /></button></article>)}</div></section>}
    {archived.length > 0 && <details className="project-archived" open={showArchived} onToggle={event => setShowArchived(event.currentTarget.open)}><summary><Archive size={15} /> Archived projects ({archived.length})</summary>{archived.map(project => <div key={project.id}><button onClick={() => setSelectedId(project.id)}>{project.title}</button><button className="text-button" disabled={disabled} onClick={() => patch(project, { archived: false })}><Undo2 size={13} />Restore</button></div>)}</details>}
    {selected && <ProjectDetail key={selected.id} project={selected} definition={selectedDefinition} disabled={disabled} onClose={() => setSelectedId(null)} onSkill={openSkill} onSave={values => patch(selected, values)} />}
  </section>;
}

function ProjectDetail({ project, definition, disabled, onClose, onSkill, onSave }: {
  project: ProjectProgress; definition?: ProjectDefinition; disabled: boolean;
  onClose: () => void; onSkill: (id: string) => void; onSave: (patch: Partial<ProjectProgress>) => void;
}) {
  const { topics } = useTopicCatalog();
  const [original, setOriginal] = useState(project);
  const [status, setStatus] = useState(project.status);
  const [repositoryUrl, setRepositoryUrl] = useState(project.repositoryUrl);
  const [notes, setNotes] = useState(project.notes);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const repository = linkUrl(project.repositoryUrl);
  function submit(event: FormEvent) {
    event.preventDefault();
    if (disabled) return;
    try {
      const url = safeUrl(repositoryUrl);
      const patch: Partial<ProjectProgress> = {};
      if (status !== original.status) patch.status = status;
      if (url !== original.repositoryUrl) patch.repositoryUrl = url;
      if (notes !== original.notes) patch.notes = notes;
      if (Object.keys(patch).length) { onSave(patch); setOriginal(previous => ({ ...previous, ...patch })); setNotice('Project saved. Skill and course progress is unchanged.'); }
      else setNotice('No changes to save.');
      setError('');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Check the repository URL.'); }
  }
  return <Modal title={definition?.title ?? project.title} onClose={onClose}>
    <div className="project-detail-meta"><span>{definition?.category ?? 'Your project'}</span>{definition && <span className={`project-level ${definition.difficulty}`}>{definition.difficulty}</span>}{repository && <a href={repository} target="_blank" rel="noreferrer">Open repository<ArrowUpRight size={13} /></a>}</div>
    {definition && <><p className="project-detail-description">{definition.description}</p><section className="project-detail-section"><h3>What you’ll build</h3><ul>{definition.objectives.map(text => <li key={text}>{text}</li>)}</ul></section><section className="project-detail-section project-completion"><h3><CheckCircle2 size={15} />Ready when</h3><ul>{definition.criteria.map(text => <li key={text}>{text}</li>)}</ul></section><section className="project-detail-section"><h3>Related skills</h3><div className="library-skill-links">{definition.skillIds.map(id => <button key={id} onClick={() => onSkill(id)}>{topics.find(topic => topic.id === id)?.title ?? id}<ArrowRight size={12} /></button>)}</div><p className="form-help">Open a skill for materials and exercises. Starting or completing this project does not mark linked skills as mastered.</p></section>{definition.extensions && <details className="project-extensions"><summary>Optional extensions — later</summary><ul>{definition.extensions.map(text => <li key={text}>{text}</li>)}</ul></details>}</>}
    <form className="tracker-form project-form" onSubmit={submit}><label>Project status<select value={status} disabled={disabled} onChange={event => { setStatus(event.target.value as TopicStatus); setNotice(''); }}><option value="not-started">Not started</option><option value="in-progress">Learning</option><option value="completed">Done</option></select></label><label>GitHub repository (optional)<input type="url" value={repositoryUrl} disabled={disabled} placeholder="https://github.com/you/your-project" maxLength={2000} onChange={event => { setRepositoryUrl(event.target.value); setNotice(''); }} /></label><label>Notes & evidence<textarea rows={4} value={notes} disabled={disabled} placeholder="What works? What should you try next? Link verification evidence here." maxLength={5000} onChange={event => { setNotes(event.target.value); setNotice(''); }} /></label>{error && <p role="alert" className="tracker-form-error">{error}</p>}{notice && <p role="status" className="project-save-notice">{notice}</p>}<div className="project-form-actions"><button className="text-button" disabled={disabled} type="button" onClick={() => { onSave({ archived: !project.archived }); onClose(); }}>{project.archived ? <Undo2 size={14} /> : <Archive size={14} />}{project.archived ? 'Restore project' : 'Archive project'}</button><div>{status === 'not-started' && <button className="button secondary" disabled={disabled} type="button" onClick={() => { setStatus('in-progress'); onSave({ status: 'in-progress' }); setOriginal(previous => ({ ...previous, status: 'in-progress' })); setNotice('Project started. Add a repository or note whenever you’re ready.'); }}>Start project</button>}<button className="button primary" disabled={disabled} type="submit">Save project<ArrowRight size={14} /></button></div></div></form>
  </Modal>;
}
