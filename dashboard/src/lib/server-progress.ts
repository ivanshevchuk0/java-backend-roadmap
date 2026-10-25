import { isReferenceSkillId } from './reference-roadmaps';
import { allTopics } from '../data/skill-catalog';
import { LEARNING_MAPS, validateLearningMap } from './learning';
import { parseProgress, serializeProgress } from './progress';
import type { Progress } from './types';

/** Pure progress patch validation; deliberately independent of the worker runtime. */
export const MAX_PROGRESS_BYTES = 2_000_000;
export type ProgressDocument = Record<string, unknown>;
export type ProgressPatch = { baseRevision: number; changes: Record<string, unknown> };
const maps = new Set(['tasks', 'skills', 'deadlines', 'weeklyPlans', 'milestones', 'courseNotes', 'reviews', ...LEARNING_MAPS]);
const forbidden = new Set(['__proto__', 'constructor', 'prototype']);
const knownSkillIds = new Set(allTopics.map(topic => topic.id));
const coreRoots = new Set(['currentWeek', 'startDate', 'updatedAt', 'tasks', 'skills', 'deadlines', 'weeklyPlans', 'milestones', 'courseNotes', 'reviews', ...LEARNING_MAPS, '_legacy']);

function fail(): never { throw new Error('Invalid progress update.'); }
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return fail();
  const result = value as Record<string, unknown>;
  if (Object.keys(result).some(key => forbidden.has(key))) return fail();
  return result;
}
function text(value: unknown, limit = 5000) {
  if (typeof value !== 'string' || value.length > limit) return fail();
  return value;
}
function number(value: unknown, min: number, max: number, whole = false) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max || (whole && !Number.isInteger(value))) return fail();
  return value;
}
function date(value: unknown) {
  const raw = text(value, 10);
  if (raw && (!/^\d{4}-\d{2}-\d{2}$/.test(raw) || Number.isNaN(Date.parse(raw)) || new Date(raw).toISOString().slice(0, 10) !== raw)) return fail();
}
function timestamp(value: unknown) {
  if (Number.isNaN(Date.parse(text(value, 60)))) return fail();
}
function choice(value: unknown, choices: string[]) {
  if (typeof value !== 'string' || !choices.includes(value)) return fail();
}
function boolean(value: unknown) { if (typeof value !== 'boolean') return fail(); }
// Bound unknown legacy fields too, without stripping them during an upgrade.
function safeJson(value: unknown, depth = 0): void {
  if (depth > 12) return fail();
  if (value === null || typeof value === 'boolean') return;
  if (typeof value === 'string') { text(value, 20000); return; }
  if (typeof value === 'number') { if (!Number.isFinite(value)) fail(); return; }
  if (Array.isArray(value)) {
    if (value.length > 2000) return fail();
    value.forEach(item => safeJson(item, depth + 1)); return;
  }
  const entry = object(value);
  if (Object.keys(entry).length > 2000) return fail();
  for (const [key, item] of Object.entries(entry)) { text(key, 120); safeJson(item, depth + 1); }
}
function entryValue(group: string, id: string, value: unknown) {
  if (value === null) return;
  if (LEARNING_MAPS.includes(group as typeof LEARNING_MAPS[number])) { validateLearningMap(group, id, value); return; }
  if (group === 'courseNotes' || group === 'reviews') { text(value); return; }
  const entry = object(value);
  switch (group) {
    case 'tasks':
      choice(entry.status, ['pending', 'in-progress', 'done', 'deferred']);
      number(entry.actualMinutes, 0, 10080);
      text(entry.evidence);
      if (entry.priority !== undefined) choice(entry.priority, ['high', 'medium', 'low']);
      if (entry.plannedMinutes !== undefined) number(entry.plannedMinutes, 0, 10080);
      break;
    case 'skills':
      choice(entry.status, ['not-started', 'in-progress', 'completed', 'skipped']);
      if (entry.status === 'skipped' && !knownSkillIds.has(id) && !isReferenceSkillId(id)) return fail();
      timestamp(entry.updatedAt);
      if (entry.notes !== undefined) text(entry.notes);
      if (entry.label !== undefined) text(entry.label, 300);
      if (entry.track !== undefined) choice(entry.track, ['backend', 'data', 'agh']);
      break;
    case 'deadlines':
      text(entry.label, 200); date(entry.date); boolean(entry.done); timestamp(entry.updatedAt);
      break;
    case 'weeklyPlans':
      number(entry.hours, 1, 80); number(entry.aghHours, 0, entry.hours as number);
      break;
    case 'milestones':
      boolean(entry.verified); text(entry.evidence);
      if (entry.verified && !(entry.evidence as string).trim()) return fail();
      break;
    default: return fail();
  }
  if (group === 'weeklyPlans' && !/^(?:[1-9]|1[0-2])$/.test(id)) return fail();
}
export function validateProgressPatch(value: unknown): ProgressPatch {
  const source = object(value);
  if (Object.keys(source).some(key => !['baseRevision', 'changes'].includes(key))) return fail();
  number(source.baseRevision, 0, Number.MAX_SAFE_INTEGER - 1, true);
  const changes = object(source.changes);
  const pairs = Object.entries(changes);
  if (!pairs.length || pairs.length > 1000) return fail();
  for (const [path, changed] of pairs) {
    if (path === '_legacy') {
      const legacy = object(changed);
      if (Object.keys(legacy).some(key => coreRoots.has(key))) return fail();
      safeJson(legacy);
      continue;
    }
    if (path === 'currentWeek') { number(changed, 1, 12, true); continue; }
    if (path === 'startDate') { date(changed); continue; }
    const parts = path.split('.');
    if (parts.length !== 2 || !maps.has(parts[0]) || !/^[a-zA-Z0-9_-]{1,120}$/.test(parts[1]) || forbidden.has(parts[1])) return fail();
    if ((parts[0] === 'weeklyPlans' || parts[0] === 'reviews') && !/^(?:[1-9]|1[0-2])$/.test(parts[1])) return fail();
    safeJson(changed);
    entryValue(parts[0], parts[1], changed);
  }
  if (new TextEncoder().encode(JSON.stringify(source)).byteLength > MAX_PROGRESS_BYTES) return fail();
  return { baseRevision: source.baseRevision as number, changes };
}
export function applyProgressPatch(existing: ProgressDocument | null, changes: Record<string, unknown>, now: string): ProgressDocument {
  const result: ProgressDocument = { currentWeek: 1, startDate: '', tasks: {}, skills: {}, deadlines: {}, weeklyPlans: {}, milestones: {}, courseNotes: {}, reviews: {}, ...existing };
  for (const [path, value] of Object.entries(changes)) {
    if (path === '_legacy') {
      const legacy = object(value);
      for (const [key, item] of Object.entries(legacy)) {
        if (coreRoots.has(key)) return fail();
        result[key] = item;
      }
      continue;
    }
    if (path === 'currentWeek' || path === 'startDate') { result[path] = value; continue; }
    const [group, id] = path.split('.');
    const oldMap = result[group];
    const next = { ...(oldMap && typeof oldMap === 'object' && !Array.isArray(oldMap) ? oldMap as Record<string, unknown> : {}) };
    if (value === null) delete next[id];
    else {
      const previous = next[id];
      // An older client editing known fields must not discard newer legacy data.
      next[id] = value && typeof value === 'object' && !Array.isArray(value)
        && previous && typeof previous === 'object' && !Array.isArray(previous)
        ? { ...previous as Record<string, unknown>, ...value as Record<string, unknown> }
        : value;
    }
    result[group] = next;
  }
  result.updatedAt = now;
  if (new TextEncoder().encode(JSON.stringify(result)).byteLength > MAX_PROGRESS_BYTES) return fail();
  return result;
}

/** Check the exact client-loadable shape without normalizing away legacy fields. */
export function assertProgressLoadable(progress: ProgressDocument): void {
  parseProgress(serializeProgress(progress as unknown as Progress));
}

export function sameOriginMutation(request: Request): boolean {
  if (request.headers.get('sec-fetch-site') === 'cross-site') return false;
  const origin = request.headers.get('origin');
  if (!origin) return true; // Non-browser owner service requests have no Origin.
  try { return new URL(origin).origin === new URL(request.url).origin; } catch { return false; }
}
