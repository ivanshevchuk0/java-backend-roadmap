import { goalTemplates } from '../data/learning';
import { allTopics as topics } from '../data/skill-catalog';
import { allTasks, roadmap } from './roadmap';
import type { LearningActivity, LearningResource, Progress, ResourceUnit, WeeklyGoal } from './types';

export const LEARNING_MAPS = ['goals', 'resources', 'units', 'activities'] as const;
export const localDate = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const topicIds = new Set(topics.map(topic => topic.id));
const taskIds = new Set(allTasks.map(task => task.id));
const milestoneIds = new Set(roadmap.weeks.map(week => week.milestone.id));
const forbidden = new Set(['__proto__', 'constructor', 'prototype']);
export function safeLearningId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-zA-Z0-9_-]{1,120}$/.test(value) && !forbidden.has(value);
}
function fail(message = 'Invalid learning data.'): never { throw new Error(message); }
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return fail();
  const result = value as Record<string, unknown>;
  if (Object.keys(result).some(key => forbidden.has(key))) return fail();
  return result;
}
function text(value: unknown, limit = 5000): string {
  if (typeof value !== 'string' || value.length > limit) return fail();
  return value;
}
function id(value: unknown, blank = false) { if (blank && value === '') return; if (!safeLearningId(value)) fail('Invalid learning ID.'); }
function number(value: unknown, min: number, max: number, whole = false) { if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max || (whole && !Number.isInteger(value))) fail(); }
function choice(value: unknown, options: string[]) { if (typeof value !== 'string' || !options.includes(value)) fail(); }
function boolean(value: unknown) { if (typeof value !== 'boolean') fail(); }
function timestamp(value: unknown) { if (Number.isNaN(Date.parse(text(value, 60)))) fail('Invalid learning timestamp.'); }
function date(value: unknown) { const raw = text(value, 10); if (!/^\d{4}-\d{2}-\d{2}$/.test(raw) || Number.isNaN(Date.parse(raw)) || new Date(raw).toISOString().slice(0, 10) !== raw) fail('Invalid activity date.'); }
function url(value: unknown) {
  const raw = text(value, 2048);
  if (!raw) return;
  try { const parsed = new URL(raw); if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) fail('Use an http or https URL.'); } catch { fail('Use an http or https URL.'); }
}
function skillIds(value: unknown) {
  if (!Array.isArray(value) || value.length > 100 || value.some(item => !safeLearningId(item) || !topicIds.has(item))) fail('Unknown linked skill.');
}
/** Bound untrusted JSON while retaining unknown legacy fields. */
export function validateLearningJson(value: unknown, depth = 0): void {
  if (depth > 12) return fail('Learning data is nested too deeply.');
  if (value === null || typeof value === 'boolean') return;
  if (typeof value === 'string') { text(value, 20000); return; }
  if (typeof value === 'number') { if (!Number.isFinite(value)) fail(); return; }
  if (Array.isArray(value)) {
    if (value.length > 2000) fail();
    value.forEach(item => validateLearningJson(item, depth + 1)); return;
  }
  const entry = record(value);
  if (Object.keys(entry).length > 2000) fail();
  for (const [key, item] of Object.entries(entry)) { text(key, 120); validateLearningJson(item, depth + 1); }
}
/** Shared shape validation, preserving unknown entry metadata for future clients. */
export function validateLearningMap(group: string, key: string, value: unknown): Record<string, unknown> {
  id(key); const entry = record(value); id(entry.id);
  if (entry.id !== key) fail('Learning entry ID does not match its key.');
  text(entry.title, 300); if (group !== 'units') choice(entry.track, ['backend', 'data', 'agh']); timestamp(entry.updatedAt);
  if (group !== 'activities') boolean(entry.archived);
  switch (group) {
    case 'resources':
      choice(entry.kind, ['course', 'video', 'playlist', 'documentation', 'article', 'book', 'project', 'roadmap']);
      choice(entry.status, ['not-started', 'in-progress', 'completed', 'paused']);
      url(entry.url); url(entry.resumeUrl); text(entry.provider, 200); text(entry.resumeLabel, 300); text(entry.notes); skillIds(entry.skillIds);
      break;
    case 'units':
      id(entry.resourceId); id(entry.parentId, true);
      choice(entry.kind, ['module', 'lesson', 'video', 'chapter', 'section', 'milestone']);
      choice(entry.status, ['not-started', 'in-progress', 'completed']);
      url(entry.url); text(entry.notes); number(entry.position, 0, 100000, true);
      break;
    case 'goals':
      number(entry.week, 0, 12, true); number(entry.originalWeek, 1, 12, true); text(entry.description);
      choice(entry.status, ['planned', 'in-progress', 'completed']); text(entry.notes); skillIds(entry.skillIds);
      break;
    case 'activities':
      date(entry.date); choice(entry.kind, ['study', 'skill', 'exercise', 'course', 'project', 'lesson']);
      if (entry.minutes !== null) number(entry.minutes, 0, 1440);
      text(entry.notes); boolean(entry.automatic);
      for (const field of ['skillId', 'resourceId', 'taskId', 'milestoneId']) id(entry[field], true);
      break;
    default: fail('Unknown learning map.');
  }
  return entry;
}
const normalizedUrl = (value: string) => value.replace(/\/$/, '');
export function getResources(progress: Progress): LearningResource[] {
  const defaults = roadmap.courses.map(course => {
    const linked = topics.filter(topic => topic.resources.some(resource => normalizedUrl(resource.url) === normalizedUrl(course.url)) || topic.taskIds.some(taskId => allTasks.find(task => task.id === taskId)?.courseIds.includes(course.id)));
    return { id: course.id, title: course.title, kind: 'course' as const, url: course.url, provider: course.provider, track: course.track, status: 'not-started' as const, skillIds: linked.map(topic => topic.id), notes: progress.courseNotes[course.id] ?? '', resumeLabel: '', resumeUrl: '', updatedAt: '', archived: false };
  });
  const merged = new Map<string, LearningResource>(defaults.map(resource => [resource.id, resource]));
  for (const resource of Object.values(progress.resources ?? {})) merged.set(resource.id, { ...merged.get(resource.id), ...resource });
  return [...merged.values()];
}
export function getGoals(progress: Progress): WeeklyGoal[] {
  const defaults: WeeklyGoal[] = goalTemplates.map(goal => ({ ...goal, originalWeek: goal.week, status: 'planned', notes: '', updatedAt: '', archived: false }));
  const merged = new Map(defaults.map(goal => [goal.id, goal]));
  for (const goal of Object.values(progress.goals ?? {})) merged.set(goal.id, { ...merged.get(goal.id), ...goal });
  return [...merged.values()];
}
export function getUnits(progress: Progress, resourceId: string): ResourceUnit[] {
  return Object.values(progress.units ?? {}).filter(unit => unit.resourceId === resourceId && !unit.archived).sort((a, b) => a.position - b.position || a.title.localeCompare(b.title) || a.id.localeCompare(b.id));
}
export function resourceCompletion(progress: Progress, resourceId: string): { done: number; total: number } {
  const active = getUnits(progress, resourceId);
  const parents = new Set(active.map(unit => unit.parentId).filter(Boolean));
  const leaves = active.filter(unit => unit.kind !== 'module' && !parents.has(unit.id));
  return { done: leaves.filter(unit => unit.status === 'completed').length, total: leaves.length };
}
/** Aggregate reference checks run after a complete import or atomic API patch. */
export function validateLearningReferences(progress: Progress): void {
  const resources = new Set([...roadmap.courses.map(course => course.id), ...Object.keys(progress.resources ?? {})]);
  const units = progress.units ?? {};
  for (const unit of Object.values(units)) {
    if (!resources.has(unit.resourceId)) fail('A unit must reference an existing resource.');
    if (unit.parentId) {
      const parent = units[unit.parentId];
      if (!parent || parent.resourceId !== unit.resourceId || parent.kind !== 'module') fail('Unit parents must be modules in the same resource.');
      const visited = new Set([unit.id]); let cursor: ResourceUnit | undefined = parent;
      while (cursor) {
        if (visited.has(cursor.id)) fail('Unit parents cannot contain a cycle.');
        visited.add(cursor.id); cursor = cursor.parentId ? units[cursor.parentId] : undefined;
      }
    }
  }
  for (const activity of Object.values(progress.activities ?? {})) {
    if (activity.skillId && !topicIds.has(activity.skillId)) fail('Unknown activity skill.');
    if (activity.taskId && !taskIds.has(activity.taskId)) fail('Unknown activity task.');
    if (activity.milestoneId && !milestoneIds.has(activity.milestoneId)) fail('Unknown activity milestone.');
    if (activity.resourceId && !resources.has(activity.resourceId)) fail('Unknown activity resource.');
  }
}
/** Events record explicit user completion transitions; never call on import/load. */
export function withCompletionEvents(before: Progress, after: Progress): Progress {
  const activities = { ...after.activities };
  const now = new Date().toISOString();
  const add = (entry: Omit<LearningActivity, 'id' | 'date' | 'minutes' | 'notes' | 'automatic' | 'updatedAt'>) => {
    const id = `event-${crypto.randomUUID()}`;
    activities[id] = { ...entry, id, date: localDate(), minutes: null, notes: '', automatic: true, updatedAt: now };
  };
  const refs = { skillId: '', resourceId: '', taskId: '', milestoneId: '' };
  for (const task of allTasks) if (after.tasks[task.id]?.status === 'done' && before.tasks[task.id]?.status !== 'done') add({ ...refs, taskId: task.id, kind: 'exercise', title: task.title, track: task.track });
  for (const topic of topics) if (after.skills?.[topic.id]?.status === 'completed' && before.skills?.[topic.id]?.status !== 'completed') add({ ...refs, skillId: topic.id, kind: 'skill', title: topic.title, track: topic.track });
  const previousResources = new Map(getResources(before).map(resource => [resource.id, resource]));
  const resources = new Map(getResources(after).map(resource => [resource.id, resource]));
  for (const resource of resources.values()) if (resource.status === 'completed' && previousResources.get(resource.id)?.status !== 'completed') add({ ...refs, resourceId: resource.id, kind: resource.kind === 'project' ? 'project' : 'course', title: resource.title, track: resource.track });
  for (const unit of Object.values(after.units ?? {})) if (unit.status === 'completed' && before.units?.[unit.id]?.status !== 'completed') {
    const resource = resources.get(unit.resourceId);
    if (resource) add({ ...refs, resourceId: resource.id, kind: unit.kind === 'milestone' ? 'project' : 'lesson', title: unit.title, track: resource.track });
  }
  for (const week of roadmap.weeks) if (after.milestones[week.milestone.id]?.verified && !before.milestones[week.milestone.id]?.verified) add({ ...refs, milestoneId: week.milestone.id, kind: 'project', title: week.milestone.title, track: 'backend' });
  return Object.keys(activities).length === Object.keys(after.activities ?? {}).length ? after : { ...after, activities };
}
