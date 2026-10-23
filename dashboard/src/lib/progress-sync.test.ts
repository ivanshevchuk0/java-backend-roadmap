import { describe, expect, it } from 'vitest';
import { applyChanges, legacyChanges, queueChanges, resolveChanges } from './progress-sync';
import { createProgress, parseProgress, serializeProgress } from './progress';

describe('device synchronization and legacy migration', () => {
  it('rebases a status change without overwriting evidence saved by another device', () => {
    const before = createProgress();
    before.tasks['w01-d1-B-1'] = { status: 'pending', actualMinutes: 15, evidence: 'first attempt' };
    const after = { ...before, tasks: { ...before.tasks, 'w01-d1-B-1': { ...before.tasks['w01-d1-B-1'], status: 'done' as const } } };
    const pending = queueChanges({}, before, after);
    const remote = { ...before, tasks: { 'w01-d1-B-1': { ...before.tasks['w01-d1-B-1'], evidence: 'new evidence from laptop', actualMinutes: 45 } } };
    expect(resolveChanges(remote, pending)['tasks.w01-d1-B-1']).toEqual({ status: 'done', evidence: 'new evidence from laptop', actualMinutes: 45 });
  });
  it('retains exact data when a queued status change survives a browser reopening', () => {
    const p = createProgress();
    const next = { ...p, skills: { java: { status: 'in-progress' as const, updatedAt: '2026-10-23T10:00:00.000Z' } } };
    const queue = JSON.parse(JSON.stringify(queueChanges({}, p, next)));
    expect(applyChanges(p, queue).skills?.java.status).toBe('in-progress');
  });
  it('migrates all original fields without inventing task completions', () => {
    const local = createProgress();
    local.currentWeek = 3; local.courseNotes['amazon-java'] = 'current unit'; local.reviews['1'] = 'review notes';
    const migrated = applyChanges(null, legacyChanges(local, null));
    expect(migrated.currentWeek).toBe(3);
    expect(migrated.courseNotes).toEqual(local.courseNotes);
    expect(migrated.reviews).toEqual(local.reviews);
    expect(migrated.tasks).toEqual({});
  });
  it('retains an older device study week when the cloud record is still empty', () => {
    const local = createProgress(); local.currentWeek = 4;
    expect(applyChanges(createProgress(), legacyChanges(local, createProgress())).currentWeek).toBe(4);
  });
  it('does not overwrite cloud entries when an older browser first migrates', () => {
    const local = createProgress(); local.courseNotes['amazon-java'] = 'older local note';
    const remote = createProgress(); remote.courseNotes['amazon-java'] = 'newer cloud note';
    expect(resolveChanges(remote, legacyChanges(local, remote))).toEqual({});
  });
  it('preserves unknown legacy root fields in a cloud migration and export', () => {
    const local = { ...createProgress(), oldNotebookMetadata: { version: 7 } };
    const result = applyChanges(null, legacyChanges(local, null));
    expect((parseProgress(serializeProgress(result)) as typeof local).oldNotebookMetadata).toEqual({ version: 7 });
  });
  it('applies an explicit deletion without losing unrelated history', () => {
    const p = createProgress(); p.courseNotes = { a: 'keep', b: 'remove' };
    const q = queueChanges({}, p, { ...p, courseNotes: { a: 'keep' } });
    expect(applyChanges(p, q).courseNotes).toEqual({ a: 'keep' });
  });
});
