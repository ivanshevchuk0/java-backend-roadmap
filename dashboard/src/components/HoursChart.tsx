import { budget, formatHours, stats } from '../lib/progress';
import { roadmap } from '../lib/roadmap';
import type { Progress } from '../lib/types';

export function HoursChart({ progress, selected, onSelect }: { progress: Progress; selected: number; onSelect: (week: number) => void }) {
  const values = roadmap.weeks.map(w => ({ week: w.number, planned: budget(progress, w.number).total, actual: stats(progress, w.tasks).actual / 60 }));
  const max = Math.max(20, ...values.flatMap(v => [v.planned, v.actual]));
  return <section className="panel hours-panel"><div className="panel-heading"><div><h2>Put in the hours</h2><p>Weekly budget vs. time you actually logged</p></div><div className="chart-legend"><span><i className="planned-dot" />Planned</span><span><i className="logged-dot" />Logged</span></div></div>
    <figure aria-label="Planned versus logged study hours over twelve weeks">
      <div className="hours-chart"><div className="chart-axis"><span>{Math.round(max)}h</span><span>{Math.round(max / 2)}h</span><span>0h</span></div><div className="chart-columns">{values.map(v => <button key={v.week} className={`bar-column ${selected === v.week ? 'selected' : ''}`} aria-label={`Week ${v.week}: ${v.planned} hours planned, ${formatHours(v.actual * 60)} hours logged`} onClick={() => onSelect(v.week)}><span className="chart-tooltip">W{v.week}: {v.planned}h / {formatHours(v.actual * 60)}h</span><span className="bar-pair"><span className="bar planned" style={{ height: `${v.planned / max * 100}%` }} /><span className="bar logged" style={{ height: `${v.actual / max * 100}%` }} /></span><span className="chart-week">{String(v.week).padStart(2, '0')}</span></button>)}</div></div>
      <figcaption>Logged hours are independent of checkboxes. Unlogged time stays at zero.</figcaption>
    </figure>
  </section>;
}
