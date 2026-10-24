import { getGoals, getResources, LEARNING_MAPS } from './learning';
import { createProgress } from './progress';
import type { Progress } from './types';

export const MAP_KEYS = ['tasks', 'skills', 'deadlines', 'weeklyPlans', 'milestones', 'courseNotes', 'reviews', ...LEARNING_MAPS] as const;
export type QueuedChange = { mode: 'merge' | 'replace' | 'missing'; value: unknown };
export type PendingChanges = Record<string, QueuedChange>;
const equal = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const isObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
export function queueChanges(pending: PendingChanges, before: Progress, after: Progress): PendingChanges {
  const result = { ...pending };
  for (const key of ['currentWeek', 'startDate'] as const) {
    if (!equal(before[key], after[key])) result[key] = { mode: 'replace', value: after[key] };
  }
  for (const group of MAP_KEYS) {
    const a = (before[group] ?? {}) as Record<string, unknown>;
    const b = (after[group] ?? {}) as Record<string, unknown>;
    for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
      if (equal(a[key], b[key])) continue;
      const path = `${group}.${key}`;
      const baseline = a[key] ?? (group === 'resources' ? getResources(before).find(resource => resource.id === key) : group === 'goals' ? getGoals(before).find(goal => goal.id === key) : group === 'skills' ? { status: 'not-started' } : group === 'tasks' ? { status: 'pending', actualMinutes: 0, evidence: '' } : undefined);
      if (isObject(b[key]) && isObject(baseline)) {
        const delta = Object.fromEntries(Object.entries(b[key]).filter(([field, value]) => !equal(baseline[field], value)));
        const old = result[path];
        result[path] = { mode: 'merge', value: { ...(old?.mode === 'merge' && isObject(old.value) ? old.value : {}), ...delta } };
      } else result[path] = { mode: b[key] === undefined ? 'replace' : 'merge', value: b[key] ?? null };
    }
  }
  return result;
}
export function legacyChanges(local: Progress, remote: Progress | null): PendingChanges {
  const changes: PendingChanges = {};
  const emptyCloud = remote && remote.currentWeek === 1 && !remote.startDate && MAP_KEYS.every(key => !Object.keys(remote[key] ?? {}).length);
  if (!remote || emptyCloud) {
    changes.currentWeek = { mode: 'replace', value: local.currentWeek };
    changes.startDate = { mode: 'replace', value: local.startDate };
  }
  for (const group of MAP_KEYS) for (const [id, value] of Object.entries(local[group] ?? {})) {
    if (!remote || !Object.prototype.hasOwnProperty.call(remote[group] ?? {}, id)) changes[`${group}.${id}`] = { mode: 'missing', value };
  }
  const known = new Set(['updatedAt', 'currentWeek', 'startDate', ...MAP_KEYS]);
  const extra = Object.fromEntries(Object.entries(local).filter(([key]) => !known.has(key) && (!remote || !(key in remote))));
  if (Object.keys(extra).length) changes._legacy = { mode: 'merge', value: extra };
  return changes;
}
export function resolveChanges(remote: Progress | null, pending: PendingChanges): Record<string, unknown> {
  const source = remote ?? createProgress();
  const changes: Record<string, unknown> = {};
  for (const [path, entry] of Object.entries(pending)) {
    if (path === '_legacy') {
      const known = new Set(['updatedAt', 'currentWeek', 'startDate', ...MAP_KEYS]);
      const safe = isObject(entry.value) ? Object.fromEntries(Object.entries(entry.value).filter(([key]) => !known.has(key) && !['__proto__', 'constructor', 'prototype', '_legacy'].includes(key))) : {};
      if (Object.keys(safe).length) changes[path] = safe;
      continue;
    }
    if (path === 'currentWeek' || path === 'startDate') { changes[path] = entry.value; continue; }
    const [group, id] = path.split('.');
    const map = (source as unknown as Record<string, unknown>)[group];
    const existing = isObject(map) ? map[id] : undefined;
    if (entry.mode === 'missing' && existing !== undefined) continue;
    let value = entry.value;
    if (entry.mode === 'merge' && isObject(value)) {
      const defaults = group === 'tasks' ? { status: 'pending', actualMinutes: 0, evidence: '' }
        : group === 'resources' ? getResources(source).find(resource => resource.id === id) ?? {}
        : group === 'goals' ? getGoals(source).find(goal => goal.id === id) ?? {}
        : group === 'skills' ? { status: 'not-started' } : {};
      value = { ...defaults, ...(isObject(existing) ? existing : {}), ...value };
    }
    changes[path] = value;
  }
  return changes;
}
export function applyChanges(remote: Progress | null, pending: PendingChanges): Progress {
  const result = { ...(remote ?? createProgress()) } as Progress;
  for (const [path, value] of Object.entries(resolveChanges(remote, pending))) {
    if (path === '_legacy') { Object.assign(result, value); continue; }
    if (path === 'currentWeek' || path === 'startDate') { Object.assign(result, { [path]: value }); continue; }
    const [group, id] = path.split('.');
    const source = result as unknown as Record<string, unknown>;
    const map = { ...(isObject(source[group]) ? source[group] : {}) };
    if (value === null) delete map[id]; else map[id] = value;
    source[group] = map;
  }
  return result;
}
