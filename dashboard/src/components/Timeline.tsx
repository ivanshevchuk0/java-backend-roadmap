import { ArrowRight, Check, Flag } from 'lucide-react';
import { roadmap } from '../lib/roadmap';
import { stats } from '../lib/progress';
import type { Progress } from '../lib/types';

export function Timeline({ progress, selected, onSelect }: { progress: Progress; selected: number; onSelect: (week: number) => void }) {
  return <section className="panel timeline-panel"><div className="panel-heading"><div><h2>Your 12-week path</h2><p>A single application, growing one milestone at a time</p></div><span className="muted timeline-hint">Select a week <ArrowRight size={14} /></span></div><div className="timeline-scroll"><div className="timeline">{roadmap.weeks.map(week => {
    const verified = !!progress.milestones[week.milestone.id]?.verified;
    const value = stats(progress, week.tasks);
    return <button key={week.number} className={`week-node ${week.number === selected ? 'selected' : ''} ${verified ? 'verified' : ''}`} aria-pressed={week.number === selected} aria-label={`View week ${week.number}: ${week.phase}${verified ? ', milestone verified' : ''}`} onClick={() => onSelect(week.number)}><span className="week-dot">{verified ? <Check size={14} /> : week.number === progress.currentWeek ? <Flag size={13} /> : <span />}</span><span className="week-number">WEEK {String(week.number).padStart(2, '0')}</span><span className="week-phase">{week.phase}</span><span className="week-node-progress"><span style={{ width: `${value.percentage}%` }} /></span></button>;
  })}</div></div><div className="panel-footer"><span><i className="mint-dot" />Current week {String(progress.currentWeek).padStart(2, '0')}</span><span>Backend milestones follow the line. AGH and IBM run in parallel.</span></div></section>;
}
