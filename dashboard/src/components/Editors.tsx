import { useState } from 'react';
import { ArrowUpRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { budget, formatHours, missingPrerequisites, plannedMinutes, stats, taskProgress } from '../lib/progress';
import { roadmap, sourceUrl, trackLabels } from '../lib/roadmap';
import type { Course, Priority, Progress, Task, TaskProgress, TaskStatus, Week, WeeklyPlan } from '../lib/types';
import { Modal } from './Modal';
import { statusLabels } from './TaskBoard';

export function TaskEditor({ task, progress, week, onClose, onSave }: { task: Task; progress: Progress; week: Week; onClose: () => void; onSave: (entry: TaskProgress) => void }) {
  const original = taskProgress(progress, task.id);
  const [status, setStatus] = useState<TaskStatus>(original.status);
  const [actual, setActual] = useState(String(original.actualMinutes));
  const [planned, setPlanned] = useState(String(plannedMinutes(progress, task)));
  const [priority, setPriority] = useState<Priority>(original.priority ?? task.priority);
  const [evidence, setEvidence] = useState(original.evidence);
  return <Modal title={task.title} onClose={onClose}><form onSubmit={e => { e.preventDefault(); onSave({ status, actualMinutes: Number(actual), plannedMinutes: Number(planned), evidence, priority }); }}>
    <div className="editor-context"><span className={`track-pill ${task.track}`}><i />{trackLabels[task.track]}</span><span>Week {week.number} · Day {task.day}</span></div>
    <p className="editor-description">{task.description}</p><div className="criteria-box"><h3><CheckCircle2 size={16} />Definition of done</h3><p>{task.criteria}</p></div>
    <div className="form-grid"><label>Status<select value={status} onChange={e => setStatus(e.target.value as TaskStatus)}>{Object.entries(statusLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label><label>Priority<select value={priority} onChange={e => setPriority(e.target.value as Priority)}><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></label><label>Planned minutes<input type="number" min="0" max="10080" step="1" required value={planned} onChange={e => setPlanned(e.target.value)} /></label><label>Logged minutes<input type="number" min="0" max="10080" step="1" required value={actual} onChange={e => setActual(e.target.value)} /></label></div>
    <p className="form-help">Log cumulative time for this task. Completing it does not fill in hours. Deferred work leaves the scheduled workload; already logged time stays counted.</p>
    {task.track === 'agh' && <p className="form-help">Save High priority to explicitly move this AGH item ahead of other days in “Next up”.</p>}
    <label>Evidence & next action<textarea rows={4} value={evidence} onChange={e => setEvidence(e.target.value)} maxLength={5000} placeholder="Test result, command output, commit, submission receipt, blocker, or next small step…" /></label>
    <div className="modal-actions"><a href={sourceUrl(week.source)} target="_blank" rel="noreferrer">Markdown plan <ArrowUpRight size={14} /></a><button type="submit" className="button primary">Save task</button></div>
  </form></Modal>;
}

export function PlanEditor({ progress, week, onClose, onSave }: { progress: Progress; week: Week; onClose: () => void; onSave: (value: { plan: WeeklyPlan; currentWeek: number; startDate: string }) => void }) {
  const current = budget(progress, week.number);
  const [hours, setHours] = useState(String(current.total));
  const [agh, setAgh] = useState(String(current.agh));
  const [activeWeek, setActiveWeek] = useState(String(progress.currentWeek));
  const [startDate, setStartDate] = useState(progress.startDate);
  const remaining = Math.max(0, Number(hours) - Number(agh));
  return <Modal title={`Plan week ${String(week.number).padStart(2, '0')}`} onClose={onClose}><form onSubmit={e => { e.preventDefault(); onSave({ plan: { hours: Number(hours), aghHours: Number(agh) }, currentWeek: Number(activeWeek), startDate }); }}>
    <p className="editor-description">Reserve required AGH time first. The remaining budget is split 3:1 between backend and data science. Your default is 20 hours: 12 / 4 / 4.</p>
    <div className="form-grid"><label>Weekly capacity (hours)<input type="number" min="1" max="80" step="0.25" value={hours} required onChange={e => { setHours(e.target.value); if (Number(agh) > Number(e.target.value)) setAgh(e.target.value); }} /></label><label>AGH reserve (hours)<input type="number" min="0" max={Number(hours)} step="0.25" value={agh} required onChange={e => setAgh(e.target.value)} /></label><label>Current study week<select value={activeWeek} onChange={e => setActiveWeek(e.target.value)}>{roadmap.weeks.map(w => <option value={w.number} key={w.number}>Week {w.number} · {w.phase}</option>)}</select></label><label>Plan start date (optional)<input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></label></div>
    <div className="budget-preview"><span className="backend">Backend <strong>{formatHours(remaining * 0.75 * 60)}h</strong></span><span className="data">Data Science <strong>{formatHours(remaining * 0.25 * 60)}h</strong></span><span className="agh">AGH <strong>{formatHours(Number(agh) * 60)}h</strong></span></div>
    <div className="notice"><AlertCircle size={17} /><span>Scheduled tasks currently total {formatHours(stats(progress, week.tasks).planned)}h. Changing capacity does not shorten exercises. Edit estimates or defer optional tasks until the week fits.</span></div>
    <div className="modal-actions"><button type="button" className="text-button" onClick={() => { setHours('20'); setAgh('4'); }}>Restore 20-hour split</button><button type="submit" className="button primary">Save weekly plan</button></div>
  </form></Modal>;
}

export function MilestoneEditor({ week, progress, onClose, onSave }: { week: Week; progress: Progress; onClose: () => void; onSave: (evidence: string, verified: boolean) => void }) {
  const original = progress.milestones[week.milestone.id];
  const [evidence, setEvidence] = useState(original?.evidence ?? '');
  const [verified, setVerified] = useState(original?.verified ?? false);
  const missing = missingPrerequisites(progress, week);
  return <Modal title={`Week ${week.number} checkpoint`} onClose={onClose}><form onSubmit={e => { e.preventDefault(); onSave(evidence, verified); }}>
    <p className="milestone-editor-title">{week.milestone.title}</p><div className="criteria-box"><h3><CheckCircle2 size={16} />What to demonstrate</h3><p>{week.checkpoint}</p></div>
    {missing.length > 0 && <div className="notice"><AlertCircle size={17} /><span>Verify the preceding backend checkpoint first: {missing.map(id => roadmap.weeks.find(w => w.milestone.id === id)?.milestone.title).join(', ')}. AGH and IBM work can continue.</span></div>}
    <label>Reproducible evidence<textarea rows={5} maxLength={5000} placeholder="Commands, results, revision, and the explanation you can give without notes…" required={verified} value={evidence} onChange={e => setEvidence(e.target.value)} /></label>
    <label className="checkbox-label"><input type="checkbox" checked={verified} disabled={missing.length > 0 || (!evidence.trim() && !verified)} onChange={e => setVerified(e.target.checked)} />I demonstrated this checkpoint and recorded the evidence.</label>
    {original?.verified && <p className="form-help">Unverifying this checkpoint also unverifies later backend checkpoints. Their evidence notes are preserved.</p>}
    <div className="modal-actions"><span className="form-help">Task checkboxes do not automatically verify milestones.</span><button type="submit" className="button primary">Save checkpoint</button></div>
  </form></Modal>;
}

export function CourseEditor({ course, progress, onClose, onSave }: { course: Course; progress: Progress; onClose: () => void; onSave: (note: string) => void }) {
  const [note, setNote] = useState(progress.courseNotes[course.id] ?? '');
  return <Modal title={course.title} onClose={onClose}><form onSubmit={e => { e.preventDefault(); onSave(note); }}><p className="editor-description">{course.scope}</p><label>Current unit, assessments & next step<textarea rows={6} maxLength={5000} value={note} onChange={e => setNote(e.target.value)} placeholder="Current enrolled course/unit: …\nRequired assessment still open: …\nLab evidence: …\nNext small step: …" /></label><p className="form-help">Course cards measure mapped roadmap tasks. Your actual certificate status belongs in this note.</p><div className="modal-actions"><a href={course.url} target="_blank" rel="noreferrer">Open course <ArrowUpRight size={14} /></a><button className="button primary" type="submit">Save course note</button></div></form></Modal>;
}
