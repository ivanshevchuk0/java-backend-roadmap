import raw from '../data/roadmap.json';
import type { Roadmap, TrackId } from './types';

export const roadmap = raw as Roadmap;
export const allTasks = roadmap.weeks.flatMap(week => week.tasks);
export const trackLabels: Record<TrackId, string> = { backend: 'Java / Backend', data: 'Data Science', agh: 'AGH preparation' };
export const sourceUrl = (file: string) => `https://github.com/ivanshevchuk0/java-backend-roadmap/blob/main/${file}`;
