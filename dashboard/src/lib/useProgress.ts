import { useCallback, useEffect, useState } from 'react';
import { createProgress, parseProgress, serializeProgress, STORAGE_KEY } from './progress';
import type { Progress } from './types';

export function useProgress() {
  const [initial] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      try { return { progress: raw ? parseProgress(raw) : createProgress(), recovery: '', error: '' }; }
      catch { return { progress: createProgress(), recovery: raw ?? '', error: 'Your saved progress could not be read. Download a recovery copy, then import a valid backup or start fresh. Changes are kept in memory until you recover.' }; }
    } catch { return { progress: createProgress(), recovery: '', error: 'Browser storage is unavailable. Changes stay in this tab; export JSON before leaving.' }; }
  });
  const [progress, setProgress] = useState(initial.progress);
  const [recovery, setRecovery] = useState(initial.recovery);
  const [storageError, setStorageError] = useState(initial.error);
  useEffect(() => {
    if (recovery) return;
    try { localStorage.setItem(STORAGE_KEY, serializeProgress(progress)); setStorageError(''); }
    catch { setStorageError('Your browser could not save progress. Export a JSON backup before leaving this tab.'); }
  }, [progress, recovery]);
  const update = useCallback((updater: (p: Progress) => Progress) => {
    setProgress(previous => ({ ...updater(previous), updatedAt: new Date().toISOString() }));
  }, []);
  const replace = useCallback((next: Progress) => {
    setRecovery('');
    setProgress({ ...next, updatedAt: new Date().toISOString() });
  }, []);
  return { progress, update, replace, recovery, storageError };
}
