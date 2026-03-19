export type AIPersona = "socratic" | "direct" | "thought-partner";
export type PaceStatus = "on-track" | "ahead" | "catch-up";
export type AgeTier = "young" | "teen";

export interface StudentProfile {
  id: string;
  name: string;
  gradeLevel: string;
  age: number;
  tier: AgeTier;
  avatarColor: string;
  aiPersona: AIPersona;
  podMember: boolean;
}

export interface SubjectColor {
  bg: string;
  accent: string;
  text: string;
  border: string;
  lightBg: string;
}

export interface Topic {
  id: string;
  title: string;
  completed: boolean;
  active?: boolean;
}

export interface StudentCourse {
  id: string;
  name: string;
  subject: string;
  unitName: string;
  nextTopic: string;
  topics: Topic[];
  progressPct: number;
  paceStatus: PaceStatus;
}

export interface ScheduleBlock {
  id: string;
  subject: string;
  topic: string;
  startTime: string;
  endTime: string;
  status: "done" | "active" | "up-next" | "later";
  courseId?: string;
}

export interface StudentNote {
  id: string;
  subject: string;
  content: string;
  source: "manual" | "ai-flagged" | "ai-reminder";
  createdAt: string;
  updatedAt?: string;
}

export interface PodTask {
  id: string;
  podName: string;
  podId: string;
  title: string;
  role: "presenter" | "discussion-leader" | "warmup-leader" | "prep" | "participant";
  dueDay: string;
  dueTime?: string;
  completed: boolean;
  completedAt?: string;
  aiConnection?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  citation?: string;
  hintBox?: { passage: string; page: string };
  saveNote?: boolean;
}

export interface MetricCard {
  label: string;
  value: string;
  sub?: string;
}
