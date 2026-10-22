import { useState } from 'react';
import { ArrowUpRight, CheckCheck, ListFilter, Search } from 'lucide-react';
import { formatHours, plannedMinutes, stats, taskProgress } from '../lib/progress';
import { trackLabels } from '../lib/roadmap';
import type { Progress, Task, TrackId, Week } from '../lib/types';

export const statusLabels = { pending: 'To do', 'in-progress': 'In progress', done: 'Done', deferred: 'Deferred' };

export function TaskBoard({ week, progress, onOpen, onToggle }: { week: Week; progress: Progress; onOpen: (t: Task) => void; onToggle: (t: Task) => void }) {
  const [day, setDay] = useState(0);
  const [track, setTrack] = useState('all');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const summary = stats(progress, week.tasks);
  const filtered = week.tasks.filter(t => (!day || t.day === day) && (track === 'all' || t.track === track) && (status === 'all' || taskProgress(progress, t.id).status === status) && `${t.title} ${t.description}`.toLowerCase().includes(search.toLowerCase()));
  return <section className="panel task-board" id="task-board">
    <div className="panel-heading"><div><h2>This week’s work <span className="count-badge">{week.tasks.length}</span></h2><p>Small steps. Clear evidence. Real progress.</p></div><span className="muted text-sm">{summary.done} / {summary.total} scheduled done</span></div>
    <div className="task-toolbar"><div className="day-tabs" aria-label="Filter by study day">{Array.from({ length: 8 }, (_, n) => <button key={n} aria-pressed={day === n} className={day === n ? 'active' : ''} onClick={() => setDay(n)}>{n ? `Day ${n}` : 'All days'}</button>)}</div>
      <div className="task-filters"><label className="search-field"><Search size={15} /><input aria-label="Search weekly tasks" placeholder="Find a task…" value={search} onChange={e => setSearch(e.target.value)} maxLength={200} /></label><label className="select-field"><ListFilter size={14} /><select aria-label="Filter learning track" value={track} onChange={e => setTrack(e.target.value)}><option value="all">All tracks</option>{Object.entries(trackLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label><select aria-label="Filter task status" value={status} onChange={e => setStatus(e.target.value)}><option value="all">All statuses</option>{Object.entries(statusLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></div>
    </div>
    <div className="task-list">{filtered.map((task, index) => {
      const entry = taskProgress(progress, task.id);
      const showDay = index === 0 || filtered[index - 1].day !== task.day;
      return <div key={task.id}>{showDay && <div className="day-heading"><span>DAY {task.day}</span><span>{formatHours(stats(progress, week.tasks.filter(t => t.day === task.day)).planned)}h scheduled</span></div>}
        <div className={`task-row ${entry.status === 'done' ? 'task-done' : ''} ${entry.status === 'deferred' ? 'task-deferred' : ''}`}>
          <input type="checkbox" className={`task-checkbox ${task.track}`} checked={entry.status === 'done'} aria-label={`Complete ${task.title}`} onChange={() => onToggle(task)} />
          <button className="task-description" onClick={() => onOpen(task)}><span className="task-title">{task.title}<ArrowUpRight size={13} /></span><span className="task-preview">{task.description}</span></button>
          <div className="task-meta"><span className={`track-pill ${task.track}`}><i />{trackLabels[task.track as TrackId]}</span><span className={`priority priority-${entry.priority ?? task.priority}`}>{entry.priority ?? task.priority}</span><span className={`status-label ${entry.status}`}>{statusLabels[entry.status]}</span><span className="task-time">{formatHours(plannedMinutes(progress, task))}h</span></div>
        </div></div>;
    })}{!filtered.length && <div className="empty-state"><CheckCheck size={26} /><h3>No tasks in this view</h3><p>Try another day, track, or status.</p><button className="button secondary" onClick={() => { setDay(0); setTrack('all'); setStatus('all'); setSearch(''); }}>Clear filters</button></div>}</div>
    <div className="panel-footer"><span>Check a task after meeting its completion criteria.</span><span>{filtered.length} task{filtered.length === 1 ? '' : 's'} shown</span></div>
  </section>;
}
