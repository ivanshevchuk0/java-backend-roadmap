import type { Progress, StudySession } from './types';

/** Calendar dates deliberately use UTC noon arithmetic, never elapsed local hours.
 * The caller chooses today's local date; DST cannot shift stored calendar dates. */
function calendarDate(value: string): Date {
  const parsed = new Date(`${value}T12:00:00.000Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) throw new RangeError('Use a valid YYYY-MM-DD calendar date.');
  return parsed;
}
export function shiftDate(date: string, days: number): string {
  if (!Number.isInteger(days) || Math.abs(days) > 36600) throw new RangeError('Use a whole calendar-day offset.');
  const result = calendarDate(date);
  result.setUTCDate(result.getUTCDate() + days);
  const shifted = result.toISOString().slice(0, 10);
  calendarDate(shifted);
  return shifted;
}
/** Dates of the containing Monday–Sunday week, independent of locale/timezone. */
export function weekDates(date: string): string[] {
  const day = calendarDate(date).getUTCDay();
  const monday = shiftDate(date, -((day + 6) % 7));
  return Array.from({ length: 7 }, (_, offset) => shiftDate(monday, offset));
}
export function monthDates(date: string): string[] {
  calendarDate(date);
  const first = `${date.slice(0, 7)}-01`;
  const result: string[] = [];
  for (let offset = 0; offset < 31; offset++) {
    const day = shiftDate(first, offset);
    if (day.slice(0, 7) !== first.slice(0, 7)) break;
    result.push(day);
  }
  return result;
}
/** Stable bounded occurrence identity; it does not change when an activity moves.
 * Independent hash lanes retain the whole rule ID rather than truncate it. */
export function routineSessionId(ruleId: string, date: string): string {
  if (!/^[a-zA-Z0-9_-]{1,120}$/.test(ruleId) || ['__proto__', 'constructor', 'prototype'].includes(ruleId)) throw new RangeError('Use a valid routine ID.');
  calendarDate(date);
  const seeds = [2166136261, 2246822507, 3266489909, 668265263];
  const hash = seeds.map(seed => {
    let value = seed;
    for (let index = 0; index < ruleId.length; index++) value = Math.imul(value ^ ruleId.charCodeAt(index), 16777619) >>> 0;
    return value.toString(16).padStart(8, '0');
  }).join('');
  return `routine-${hash}-${date}`;
}
/** Merge sparse user overrides with virtual recurrence occurrences. Reading a
 * month does not create records, history events, completion or skill mastery.
 * Any stored occurrence shadows its original date, even when moved/archived. */
export function getStudySessions(progress: Progress, from: string, to: string): StudySession[] {
  const first = calendarDate(from);
  const last = calendarDate(to);
  const days = Math.round((last.getTime() - first.getTime()) / 86400000) + 1;
  if (days < 1 || days > 62) throw new RangeError('Choose a planner range of 1–62 calendar days.');
  const explicit = progress.sessions ?? {};
  const result = Object.values(explicit).filter(session => !session.archived && session.date >= from && session.date <= to);
  for (const routine of Object.values(progress.routines ?? {})) {
    if (routine.archived) continue;
    for (let offset = 0; offset < days; offset++) {
      const date = shiftDate(from, offset);
      if (date < routine.startDate || (routine.endDate && date > routine.endDate) || !routine.weekdays.includes(calendarDate(date).getUTCDay())) continue;
      const id = routineSessionId(routine.id, date);
      if (Object.prototype.hasOwnProperty.call(explicit, id)) continue;
      result.push({
        id, title: routine.title, track: routine.track, date, status: 'planned',
        plannedMinutes: routine.plannedMinutes, actualMinutes: null,
        skillId: routine.skillId, resourceId: routine.resourceId, projectId: routine.projectId,
        routineId: routine.id, occurrenceDate: date, notes: routine.notes,
        updatedAt: routine.updatedAt, archived: false,
      });
    }
  }
  return result.sort((a, b) => a.date.localeCompare(b.date) || (a.track === 'agh' ? 0 : 1) - (b.track === 'agh' ? 0 : 1) || a.title.localeCompare(b.title) || a.id.localeCompare(b.id));
}
/** Count completion, not attendance or mastery. Skips are visible but excluded
 * from the completion target and planned time. Recorded actual time includes
 * partial or skipped sessions and is never inferred from planned time. */
export function summarizeSessions(sessions: readonly StudySession[]) {
  const visible = sessions.filter(session => !session.archived);
  const active = visible.filter(session => session.status !== 'skipped');
  const completed = active.filter(session => session.status === 'completed');
  const timed = visible.filter(session => session.actualMinutes !== null);
  return {
    total: visible.length,
    completed: completed.length,
    skipped: visible.length - active.length,
    percentage: active.length ? Math.round(completed.length / active.length * 100) : 0,
    plannedMinutes: active.reduce((sum, session) => sum + session.plannedMinutes, 0),
    completedPlannedMinutes: completed.reduce((sum, session) => sum + session.plannedMinutes, 0),
    actualMinutes: timed.reduce((sum, session) => sum + (session.actualMinutes ?? 0), 0),
    actualCount: timed.length,
  };
}
