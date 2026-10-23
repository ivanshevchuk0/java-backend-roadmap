import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, BookOpen, Check, ChevronDown, Circle, Clock3, Flag, GitBranch, LockKeyhole, X } from 'lucide-react';
import { topics, type Topic } from '../data/skills';
import { allTasks } from '../lib/roadmap';
import { taskProgress } from '../lib/progress';
import type { Progress, TaskProgress } from '../lib/types';
import { statusLabels, trackNames, type TopicStatus } from './SkillTree';

type Deadline = { label: string; date: string; done: boolean; updatedAt?: string };
export function TopicPanel({ topic, statuses, progress, onClose, onSelect, onStatus, onTask, deadline, onDeadline, disabled = false }: { disabled?: boolean; topic: Topic; statuses: Record<string, TopicStatus>; progress: Progress; onClose: () => void; onSelect: (id: string) => void; onStatus: (id: string, status: TopicStatus) => void; onTask: (id: string, patch: Partial<TaskProgress>) => void; deadline?: Deadline; onDeadline: (id: string, value: { label: string; date: string; done: boolean }) => void }) {
  const panel = useRef<HTMLElement>(null);
  const [deadlineLabel, setDeadlineLabel] = useState(deadline?.label ?? '');
  const [deadlineDate, setDeadlineDate] = useState(deadline?.date ?? '');
  const [deadlineSaved, setDeadlineSaved] = useState(false);
  const status = statuses[topic.id] ?? 'not-started';
  const tasks = allTasks.filter(task => topic.taskIds.includes(task.id));
  const completedTasks = tasks.filter(task => taskProgress(progress, task.id).status === 'done').length;
  const prerequisites = topic.prerequisites.map(id => topics.find(t => t.id === id)).filter((t): t is Topic => !!t);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab' && window.innerWidth < 850 && panel.current) {
        const elements = [...panel.current.querySelectorAll<HTMLElement>('button,a[href],input,select,textarea,[tabindex="0"]')].filter(e => !e.hasAttribute('disabled'));
        const first = elements[0], last = elements[elements.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', handler);
    return () => { document.removeEventListener('keydown', handler); previous?.focus(); };
  }, [onClose]);
  return <><button className="topic-scrim" aria-label="Close topic details" onClick={onClose} /><aside ref={panel} tabIndex={-1} className={`topic-panel ${topic.track}`} role="dialog" aria-modal={window.innerWidth < 850} aria-labelledby="topic-title">
    <div className="topic-panel-header"><span className="eyebrow"><span className={`track-dot ${topic.track}`} />{trackNames[topic.track]} / WEEK {String(topic.week).padStart(2, '0')}</span><button className="icon-button" aria-label="Close topic details" onClick={onClose}><X size={20} /></button></div>
    <div className="topic-panel-body"><span className="detail-kicker">{topic.milestone ? 'READINESS MILESTONE' : 'THE NEXT BUILDING BLOCK'}</span><h2 id="topic-title">{topic.title}</h2><p className="topic-description">{topic.description}</p>
      <div className="status-control" role="group" aria-label="Topic progress">{(['not-started', 'in-progress', 'completed'] as TopicStatus[]).map(value => <button key={value} disabled={disabled} onClick={() => onStatus(topic.id, value)} className={status === value ? `active ${value}` : ''} aria-pressed={status === value}>{value === 'completed' ? <Check size={13} /> : value === 'in-progress' ? <span className="running-dot" /> : <Circle size={12} />}{statusLabels[value]}</button>)}</div>
      <p className="fine-print">Topic confidence and exercise checkboxes are tracked separately.</p>
      {prerequisites.length > 0 && <section className="topic-section"><h3><GitBranch size={15} />Before you begin</h3><div className="prerequisite-list">{prerequisites.map(prerequisite => <button key={prerequisite.id} onClick={() => onSelect(prerequisite.id)}>{statuses[prerequisite.id] === 'completed' ? <Check size={13} className="green" /> : <LockKeyhole size={12} />}<span>{prerequisite.title}</span><ArrowUpRight size={13} /></button>)}</div><p className="fine-print">Explore in any order. Urgent AGH assignments always take priority.</p></section>}
      <section className="topic-section"><h3><BookOpen size={15} />Learn just enough</h3><div className="resource-list">{topic.resources.map((resource, index) => <a href={resource.url} key={`${resource.url}-${index}`} target="_blank" rel="noreferrer"><span className="resource-icon"><BookOpen size={16} /></span><span><strong>{resource.title}</strong><small>{resource.kind === 'course' ? 'COURSE · SELECTED MATERIAL' : 'REFERENCE · AS NEEDED'}</small></span><ArrowUpRight size={15} /></a>)}</div></section>
      <section className="topic-section"><h3><span className="code-symbol">&lt;/&gt;</span>Build something small</h3><p className="exercise-copy">{topic.exercise}</p></section>
      <section className="topic-section"><h3><Flag size={15} />You’re done when</h3><ul className="criteria-list">{topic.criteria.map((criterion, index) => <li key={index}><Check size={12} /><span>{criterion}</span></li>)}</ul></section>
      {topic.track === 'agh' && <section className="topic-section deadline-editor"><h3><Clock3 size={15} />Your real university deadline</h3><p className="fine-print">Copy the date from the current lab brief or lecturer. No dates are assumed.</p><label>Assignment<input disabled={disabled} aria-label="Assignment name" placeholder="e.g. OS lab 3 submission" maxLength={200} value={deadlineLabel} onChange={e => { setDeadlineLabel(e.target.value); setDeadlineSaved(false); }} /></label><label>Deadline<input disabled={disabled} aria-label="Assignment deadline" type="date" value={deadlineDate} onChange={e => { setDeadlineDate(e.target.value); setDeadlineSaved(false); }} /></label><div className="deadline-editor-actions"><button className="button secondary" disabled={disabled || !deadlineLabel.trim() || !deadlineDate} onClick={() => { onDeadline(topic.id, { label: deadlineLabel.trim(), date: deadlineDate, done: false }); setDeadlineSaved(true); }}>Save deadline</button>{deadline && <button className="text-button" disabled={disabled} onClick={() => onDeadline(topic.id, { label: deadline.label, date: deadline.date, done: !deadline.done })}>{deadline.done ? 'Reopen assignment' : 'Mark submitted'}</button>}</div>{deadlineSaved && <p className="green fine-print" role="status">Deadline recorded. It will appear in Today.</p>}</section>}
      <section className="topic-section"><h3><Check size={15} />Scheduled practice<span className="small-count">{completedTasks}/{tasks.length}</span></h3><p className="fine-print">Your original task IDs, notes, and study time stay intact. Open a task to log evidence.</p><div className="topic-task-list">{tasks.map(task => <details className="practice-task" key={task.id}><summary><input type="checkbox" disabled={disabled} aria-label={`Complete ${task.title}`} checked={taskProgress(progress, task.id).status === 'done'} onClick={e => e.stopPropagation()} onChange={e => onTask(task.id, { status: e.target.checked ? 'done' : 'pending' })} /><span><strong>{task.title}</strong><small>DAY {task.day} · {task.estimatedMinutes} MIN</small></span><ChevronDown size={14} /></summary><div className="practice-task-body"><p>{task.description}</p><p><strong>Complete when:</strong> {task.criteria}</p><label>Actual minutes<input disabled={disabled} type="number" min="0" max="10080" value={taskProgress(progress, task.id).actualMinutes} onChange={e => onTask(task.id, { actualMinutes: Math.max(0, Math.min(10080, Number(e.target.value) || 0)) })} /></label><label>Evidence / next action<textarea disabled={disabled} rows={3} maxLength={5000} value={taskProgress(progress, task.id).evidence} onChange={e => onTask(task.id, { evidence: e.target.value })} placeholder="Commit, test result, or what to try next…" /></label><label>Task status<select disabled={disabled} value={taskProgress(progress, task.id).status} onChange={e => onTask(task.id, { status: e.target.value as TaskProgress['status'] })}><option value="pending">To do</option><option value="in-progress">In progress</option><option value="done">Done</option><option value="deferred">Deferred · reschedule in your weekly plan</option></select></label></div></details>)}</div>{!tasks.length && <p className="fine-print">Assessment work is part of the existing weekly practice slots; this topic adds no study hours.</p>}</section>
      {topic.issueNumbers.length > 0 && <div className="github-task-links">{topic.issueNumbers.map(number => <a key={number} href={`https://github.com/ivanshevchuk0/java-backend-roadmap/issues/${number}`} target="_blank" rel="noreferrer">GitHub issue #{number}<ArrowRight size={12} /></a>)}</div>}
    </div><div className="topic-panel-footer"><span><span className="running-dot" />Progress saves automatically</span><button className="text-button" onClick={onClose}>Back to roadmap<ArrowRight size={14} /></button></div>
  </aside></>;
}
