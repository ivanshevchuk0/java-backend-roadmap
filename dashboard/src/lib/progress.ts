import { allTasks, roadmap } from './roadmap';
import type { Progress, Task, TaskProgress, TrackId, Week } from './types';

export const STORAGE_KEY = 'learning-os:java-backend:v1';
export const MAX_IMPORT_BYTES = 2_000_000;
export const emptyTask: TaskProgress = { status: 'pending', actualMinutes: 0, evidence: '' };
export const createProgress = (): Progress => ({ updatedAt: new Date().toISOString(), currentWeek: 1, startDate: '', tasks: {}, weeklyPlans: {}, milestones: {}, courseNotes: {}, reviews: {} });
export const taskProgress = (p: Progress, id: string) => p.tasks[id] ?? emptyTask;
export const plannedMinutes = (p: Progress, task: Task) => taskProgress(p, task.id).plannedMinutes ?? task.estimatedMinutes;
export const formatHours = (minutes: number) => new Intl.NumberFormat('en', { maximumFractionDigits: 1 }).format(minutes / 60);
export function weekDates(startDate: string, week: number) {
  if (!startDate) return '';
  const start = new Date(`${startDate}T12:00:00Z`);
  start.setUTCDate(start.getUTCDate() + (week - 1) * 7);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', timeZone: 'UTC' }).formatRange(start, end);
}

export function budget(p: Progress, week: number) {
  const plan = p.weeklyPlans[week] ?? { hours: 20, aghHours: 4 };
  const remaining = Math.max(0, plan.hours - plan.aghHours);
  return { total: plan.hours, backend: remaining * 0.75, data: remaining * 0.25, agh: plan.aghHours };
}
export function stats(p: Progress, tasks: Task[]) {
  const active = tasks.filter(t => taskProgress(p, t.id).status !== 'deferred');
  const done = active.filter(t => taskProgress(p, t.id).status === 'done');
  return {
    total: active.length, done: done.length, deferred: tasks.length - active.length,
    percentage: active.length ? Math.round(done.length / active.length * 100) : 0,
    planned: active.reduce((n, t) => n + plannedMinutes(p, t), 0),
    completedEstimate: done.reduce((n, t) => n + plannedMinutes(p, t), 0),
    actual: tasks.reduce((n, t) => n + taskProgress(p, t.id).actualMinutes, 0),
  };
}
export function nextTask(p: Progress, week: Week): Task | undefined {
  const unfinished = week.tasks.filter(t => !['done', 'deferred'].includes(taskProgress(p, t.id).status));
  // Explicitly promoted AGH work can override the order. Otherwise keep days in order.
  return unfinished.find(t => t.track === 'agh' && taskProgress(p, t.id).priority === 'high')
    ?? unfinished.sort((a, b) => a.day - b.day || (a.track === 'agh' ? -1 : b.track === 'agh' ? 1 : 0))[0];
}
export const trackTasks = (tasks: Task[], track: TrackId) => tasks.filter(t => t.track === track);
export function missingPrerequisites(p: Progress, week: Week) {
  return week.milestone.dependsOn.filter(id => !p.milestones[id]?.verified);
}
export function serializeProgress(progress: Progress) {
  return JSON.stringify({ format: 'learning-os-progress', version: 1, roadmapId: roadmap.id, exportedAt: progress.updatedAt, progress }, null, 2);
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Expected a JSON object.');
  return value as Record<string, unknown>;
}
function text(value: unknown, max = 5000): string {
  if (typeof value !== 'string' || value.length > max) throw new Error(`Text fields must be strings under ${max} characters.`);
  return value;
}
function number(value: unknown, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) throw new Error(`Expected a number between ${min} and ${max}.`);
  return value;
}
function integer(value: unknown, min: number, max: number): number {
  const n = number(value, min, max);
  if (!Number.isInteger(n)) throw new Error('Expected a whole number.');
  return n;
}
function weekKey(key: string) { if (!/^(?:[1-9]|1[0-2])$/.test(key)) throw new Error('Unknown week in backup.'); }
const taskIds = new Set(allTasks.map(t => t.id));
const milestoneIds = new Set(roadmap.weeks.map(w => w.milestone.id));
const courseIds = new Set(roadmap.courses.map(c => c.id));

export function parseProgress(json: string): Progress {
  if (new TextEncoder().encode(json).length > MAX_IMPORT_BYTES) throw new Error('Backup is too large (maximum 2 MB).');
  let envelope: Record<string, unknown>;
  try { envelope = record(JSON.parse(json)); } catch { throw new Error('This file is not valid progress JSON.'); }
  if (envelope.format !== 'learning-os-progress' || envelope.version !== 1 || envelope.roadmapId !== roadmap.id) throw new Error('Unsupported backup version or a different roadmap. Export a Learning OS v1 backup.');
  const source = record(envelope.progress);
  const result = createProgress();
  result.updatedAt = text(source.updatedAt, 60);
  if (Number.isNaN(Date.parse(result.updatedAt))) throw new Error('Invalid backup timestamp.');
  result.currentWeek = integer(source.currentWeek, 1, 12);
  result.startDate = text(source.startDate, 10);
  if (result.startDate && (!/^\d{4}-\d{2}-\d{2}$/.test(result.startDate) || Number.isNaN(Date.parse(result.startDate)) || new Date(result.startDate).toISOString().slice(0, 10) !== result.startDate)) throw new Error('Invalid start date.');
  for (const [id, value] of Object.entries(record(source.tasks))) {
    if (!taskIds.has(id)) throw new Error(`Unknown task in backup: ${id}`);
    const task = record(value);
    if (!['pending', 'in-progress', 'done', 'deferred'].includes(String(task.status))) throw new Error('Unknown task status.');
    const entry: TaskProgress = { status: task.status as TaskProgress['status'], actualMinutes: number(task.actualMinutes, 0, 10080), evidence: text(task.evidence) };
    if (task.priority !== undefined) {
      if (!['high', 'medium', 'low'].includes(String(task.priority))) throw new Error('Unknown priority.');
      entry.priority = task.priority as TaskProgress['priority'];
    }
    if (task.plannedMinutes !== undefined) entry.plannedMinutes = number(task.plannedMinutes, 0, 10080);
    result.tasks[id] = entry;
  }
  for (const [key, value] of Object.entries(record(source.weeklyPlans))) {
    weekKey(key);
    const plan = record(value);
    const hours = number(plan.hours, 1, 80);
    result.weeklyPlans[key] = { hours, aghHours: number(plan.aghHours, 0, hours) };
  }
  for (const [id, value] of Object.entries(record(source.milestones))) {
    if (!milestoneIds.has(id)) throw new Error('Unknown milestone.');
    const milestone = record(value);
    if (typeof milestone.verified !== 'boolean') throw new Error('Invalid milestone status.');
    const evidence = text(milestone.evidence);
    if (milestone.verified && !evidence.trim()) throw new Error('Verified milestones need evidence.');
    result.milestones[id] = { verified: milestone.verified, evidence };
  }
  for (const week of roadmap.weeks) {
    if (result.milestones[week.milestone.id]?.verified && missingPrerequisites(result, week).length) throw new Error('Milestone dependencies are inconsistent.');
  }
  for (const [id, note] of Object.entries(record(source.courseNotes))) {
    if (!courseIds.has(id)) throw new Error('Unknown course.');
    result.courseNotes[id] = text(note);
  }
  for (const [key, value] of Object.entries(record(source.reviews))) {
    weekKey(key);
    result.reviews[key] = text(value);
  }
  return result;
}
