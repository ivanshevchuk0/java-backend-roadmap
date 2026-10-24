'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createProgress, emptyTask, parseProgress, serializeProgress, STORAGE_KEY } from './progress';
import { applyChanges, legacyChanges, MAP_KEYS, queueChanges, resolveChanges, type PendingChanges } from './progress-sync';
import { withCompletionEvents } from './learning';
import type { AssignmentDeadline, Progress, TaskProgress, TopicStatus } from './types';

const PENDING_KEY = `${STORAGE_KEY}:pending-v2`;
const MIGRATED_KEY = `${STORAGE_KEY}:cloud-migrated-v2`;
const BACKUP_KEY = `${STORAGE_KEY}:before-skill-tree`;
export type SyncState = 'loading' | 'synced' | 'saving' | 'offline' | 'error';
type Remote = { revision: number; progress: Progress | null };
function parseRemote(raw: unknown): Remote {
  if (!raw || typeof raw !== 'object') throw new Error('Invalid sync response.');
  const value = raw as Remote;
  if (!Number.isSafeInteger(value.revision) || value.revision < 0) throw new Error('Invalid sync revision.');
  return { revision: value.revision, progress: value.progress ? parseProgress(serializeProgress(value.progress)) : null };
}

export function useLearningProgress() {
  const [progress, setProgress] = useState<Progress>(createProgress);
  const [syncState, setSyncState] = useState<SyncState>('loading');
  const [error, setError] = useState('');
  const [recovery, setRecovery] = useState('');
  const [legacyBackup, setLegacyBackup] = useState('');
  const local = useRef(progress);
  const pending = useRef<PendingChanges>({});
  const busy = useRef(false);
  const alive = useRef(false);
  const blocked = useRef(false);
  const bootstrapped = useRef(false);
  const hydrated = useRef(false);
  const legacy = useRef<Progress | null>(null);
  const flushRef = useRef<() => Promise<void>>(async () => {});
  const cacheWarning = useRef('');
  const queueTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveCache = useCallback((value: Progress) => {
    if (blocked.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, serializeProgress(value));
      localStorage.setItem(PENDING_KEY, JSON.stringify(pending.current));
      cacheWarning.current = '';
    } catch { cacheWarning.current = 'Browser backup unavailable. Keep this page open until cloud sync succeeds, or export your progress.'; }
  }, []);
  const display = useCallback((value: Progress) => {
    local.current = value;
    if (alive.current) setProgress(value);
    saveCache(value);
  }, [saveCache]);

  const flush = useCallback(async () => {
    if (!alive.current || busy.current || blocked.current) return;
    busy.current = true;
    try {
      if (Object.keys(pending.current).length) setSyncState('saving');
      const response = await fetch('/api/progress', { cache: 'no-store', credentials: 'same-origin' });
      if (!response.ok) throw new Error(response.status === 401 ? 'Sign in to this private Site to sync progress.' : 'Cloud sync is unavailable. Your changes are kept in this browser; retry when online.');
      let remote = parseRemote(await response.json());
      if (!bootstrapped.current) {
        if (legacy.current) pending.current = { ...legacyChanges(legacy.current, remote.progress), ...pending.current };
        bootstrapped.current = true;
        try { localStorage.setItem(MIGRATED_KEY, '1'); } catch { /* Cloud sync still works without device storage. */ }
      }
      display(applyChanges(remote.progress, pending.current));
      hydrated.current = true;
      for (let attempt = 0; attempt < 8; attempt++) {
        const sent = { ...pending.current };
        const changes = resolveChanges(remote.progress, sent);
        if (!Object.keys(changes).length) {
          for (const [path, value] of Object.entries(sent)) if (JSON.stringify(pending.current[path]) === JSON.stringify(value)) delete pending.current[path];
          display(applyChanges(remote.progress, pending.current));
          if (alive.current) { setSyncState('synced'); setError(cacheWarning.current); }
          return;
        }
        const saved = await fetch('/api/progress', {
          method: 'PATCH', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ baseRevision: remote.revision, changes }),
        });
        if (saved.status === 409) { remote = parseRemote(await saved.json()); continue; }
        if (!saved.ok) throw new Error(saved.status === 400 ? 'Some progress could not be synced. Export a backup and check the entered values; saved cloud data is unchanged.' : 'Cloud sync is unavailable. Your changes remain queued in this browser.');
        remote = parseRemote(await saved.json());
        for (const [path, value] of Object.entries(sent)) if (JSON.stringify(pending.current[path]) === JSON.stringify(value)) delete pending.current[path];
        display(applyChanges(remote.progress, pending.current));
        if (!Object.keys(pending.current).length) {
          if (alive.current) { setSyncState('synced'); setError(cacheWarning.current); }
          return;
        }
      }
      throw new Error('Another device is updating progress. Your changes are queued safely; retry in a moment.');
    } catch (cause) {
      hydrated.current = true;
      saveCache(local.current);
      if (alive.current) { setSyncState('offline'); setError((cause instanceof Error ? cause.message : 'Progress could not sync.') + (cacheWarning.current ? ` ${cacheWarning.current}` : '')); }
    } finally { busy.current = false; }
  }, [display, saveCache]);
  flushRef.current = flush;

  useEffect(() => {
    alive.current = true;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          const value = parseProgress(raw);
          local.current = value; setProgress(value);
          if (!localStorage.getItem(MIGRATED_KEY)) {
            legacy.current = value;
            // Preserve the exact pre-upgrade snapshot, including unsupported future fields.
            if (!localStorage.getItem(BACKUP_KEY)) localStorage.setItem(BACKUP_KEY, raw);
            setLegacyBackup(localStorage.getItem(BACKUP_KEY) ?? raw);
          }
        } catch {
          blocked.current = true; setRecovery(raw); setSyncState('error');
          setError('Your existing saved data could not be read. It has not been overwritten. Export its recovery copy, then import a valid backup to continue.');
        }
      }
      const archived = localStorage.getItem(BACKUP_KEY);
      if (archived) setLegacyBackup(archived);
      const queued = localStorage.getItem(PENDING_KEY);
      if (queued) {
        try {
          const value = JSON.parse(queued);
          if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error();
          for (const entry of Object.values(value) as { mode?: string }[]) if (!entry || !['merge', 'replace', 'missing'].includes(entry.mode ?? '')) throw Error();
          pending.current = value;
        } catch { blocked.current = true; setRecovery(queued); setSyncState('error'); setError('The unsynced queue needs recovery. It has not been overwritten. Export it before importing a valid backup.'); }
      }
    } catch { cacheWarning.current = 'Browser storage is unavailable. Cloud sync can still save changes while online; export a backup if disconnected.'; }
    void flushRef.current();
    const refresh = () => { if (document.visibilityState === 'visible') void flushRef.current(); };
    const interval = setInterval(refresh, 15000);
    window.addEventListener('online', refresh); window.addEventListener('focus', refresh); document.addEventListener('visibilitychange', refresh);
    return () => { alive.current = false; clearInterval(interval); window.removeEventListener('online', refresh); window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', refresh); if (queueTimer.current) clearTimeout(queueTimer.current); };
  }, []);

  const edit = useCallback((updater: (p: Progress) => Progress, patches?: Record<string, unknown>) => {
    if (!hydrated.current) { setError('Please wait for your saved progress to load before editing.'); return; }
    if (blocked.current) { setError('Export the recovery copy and import a valid backup before editing. Your original data remains intact.'); return; }
    const previous = local.current;
    const next = withCompletionEvents(previous, { ...updater(previous), updatedAt: new Date().toISOString() });
    try { parseProgress(serializeProgress(next)); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Invalid progress update.'); return; }
    const previousQueue = pending.current;
    pending.current = queueChanges(previousQueue, previous, next);
    for (const [path, value] of Object.entries(patches ?? {})) {
      const older = previousQueue[path];
      pending.current[path] = { mode: 'merge', value: { ...(older?.mode === 'merge' && older.value && typeof older.value === 'object' ? older.value : {}), ...(value as object) } };
    }
    display(next); setSyncState('saving');
    if (queueTimer.current) clearTimeout(queueTimer.current);
    queueTimer.current = setTimeout(() => void flushRef.current(), 250);
  }, [display]);
  const updateProgress = useCallback((updater: (p: Progress) => Progress) => edit(updater), [edit]);
  const setTopicStatus = useCallback((id: string, status: TopicStatus) => updateProgress(p => ({ ...p, skills: { ...p.skills, [id]: { ...p.skills?.[id], status, updatedAt: new Date().toISOString() } } })), [updateProgress]);
  const setCurrentWeek = useCallback((currentWeek: number) => { if (Number.isInteger(currentWeek) && currentWeek >= 1 && currentWeek <= 12) updateProgress(p => ({ ...p, currentWeek })); }, [updateProgress]);
  const updateTask = useCallback((id: string, patch: Partial<TaskProgress>) => edit(p => ({ ...p, tasks: { ...p.tasks, [id]: { ...emptyTask, ...p.tasks[id], ...patch } } }), { [`tasks.${id}`]: patch }), [edit]);
  const setDeadline = useCallback((id: string, deadline: Omit<AssignmentDeadline, 'updatedAt'>) => updateProgress(p => ({ ...p, deadlines: { ...p.deadlines, [id]: { ...p.deadlines?.[id], ...deadline, updatedAt: new Date().toISOString() } } })), [updateProgress]);
  const exportProgress = useCallback(() => recovery || serializeProgress(local.current), [recovery]);
  const importProgress = useCallback((text: string) => {
    const imported = parseProgress(text);
    blocked.current = false; setRecovery(''); setError('');
    // Import merges matching entries intentionally; unrelated saved history is retained.
    const old = local.current;
    const next = { ...old, ...imported };
    for (const key of MAP_KEYS) {
      const merged: Record<string, unknown> = { ...old[key] };
      for (const [id, value] of Object.entries(imported[key] ?? {})) {
        const prior = merged[id];
        merged[id] = prior && value && typeof prior === 'object' && typeof value === 'object' && !Array.isArray(prior) && !Array.isArray(value) ? { ...prior as object, ...value as object } : value;
      }
      Object.assign(next, { [key]: merged });
    }
    pending.current = queueChanges(pending.current, old, next);
    display(next); setSyncState('saving'); void flushRef.current();
  }, [display]);
  return { progress, setTopicStatus, setCurrentWeek, updateTask, setDeadline, updateProgress, exportProgress, importProgress, syncState, error, retrySync: () => void flushRef.current(), recovery, legacyBackup };
}
