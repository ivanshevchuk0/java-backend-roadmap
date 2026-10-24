export type TrackId = 'backend' | 'data' | 'agh';
export type Priority = 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'in-progress' | 'done' | 'deferred';

export interface Task {
  id: string;
  day: number;
  track: TrackId;
  title: string;
  description: string;
  criteria: string;
  estimatedMinutes: number;
  priority: Priority;
  courseIds: string[];
}
export interface Week {
  number: number;
  title: string;
  phase: string;
  source: string;
  checkpoint: string;
  milestone: { id: string; title: string; dependsOn: string[] };
  tasks: Task[];
}
export interface Course {
  id: string;
  provider: string;
  title: string;
  track: TrackId;
  url: string;
  scope: string;
  later?: boolean;
}
export interface Roadmap {
  schemaVersion: number;
  id: string;
  title: string;
  defaultWeeklyHours: number;
  tracks: { id: TrackId; label: string; short: string; ratio: number }[];
  courses: Course[];
  weeks: Week[];
}
export interface TaskProgress {
  status: TaskStatus;
  actualMinutes: number;
  evidence: string;
  priority?: Priority;
  plannedMinutes?: number;
}
export interface WeeklyPlan { hours: number; aghHours: number }
export type TopicStatus = 'not-started' | 'in-progress' | 'completed';
export interface SkillProgress { status: TopicStatus; updatedAt: string; notes?: string }
export interface AssignmentDeadline { label: string; date: string; done: boolean; updatedAt: string }
export interface Progress {
  goals?: Record<string, WeeklyGoal>;
  resources?: Record<string, LearningResource>;
  units?: Record<string, ResourceUnit>;
  activities?: Record<string, LearningActivity>;
  skills?: Record<string, SkillProgress>;
  deadlines?: Record<string, AssignmentDeadline>;
  updatedAt: string;
  currentWeek: number;
  startDate: string;
  tasks: Record<string, TaskProgress>;
  weeklyPlans: Record<string, WeeklyPlan>;
  milestones: Record<string, { verified: boolean; evidence: string }>;
  courseNotes: Record<string, string>;
  reviews: Record<string, string>;
}

export type ResourceKind = 'course' | 'video' | 'playlist' | 'documentation' | 'article' | 'book' | 'project' | 'roadmap';
export type ResourceStatus = 'not-started' | 'in-progress' | 'completed' | 'paused';
export interface LearningResource {
  id: string; title: string; kind: ResourceKind; url: string; provider: string;
  track: TrackId; status: ResourceStatus; skillIds: string[]; notes: string;
  resumeLabel: string; resumeUrl: string; updatedAt: string; archived: boolean;
}
export interface ResourceUnit {
  id: string; resourceId: string; parentId: string; title: string;
  kind: 'module' | 'lesson' | 'video' | 'chapter' | 'section' | 'milestone';
  url: string; status: TopicStatus; notes: string; position: number; updatedAt: string; archived: boolean;
}
export interface WeeklyGoal {
  id: string; title: string; description: string; week: number; originalWeek: number;
  track: TrackId; status: 'planned' | 'in-progress' | 'completed'; skillIds: string[];
  notes: string; updatedAt: string; archived: boolean;
}
export interface LearningActivity {
  id: string; date: string; kind: 'study' | 'skill' | 'exercise' | 'course' | 'project' | 'lesson';
  title: string; track: TrackId; minutes: number | null; notes: string;
  skillId: string; resourceId: string; taskId: string; milestoneId: string;
  automatic: boolean; updatedAt: string;
}
