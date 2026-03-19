export type LearningStyle = "visual" | "hands-on" | "reading-based" | "socratic";
export type PaceSetting = "accelerated" | "standard" | "relaxed";
export type AIPersona = "socratic-coach" | "thought-partner" | "critical-thinking-guide" | "direct-instructor";
export type WorldviewMode = "secular" | "christian" | "faith-neutral" | "custom";
export type GradeLevel = "K" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12";
export type CourseType = "standard" | "honors" | "ap" | "dual-enrollment";
export type BlockType = "academic" | "activity" | "meal" | "free" | "appointment" | "co-op";
export type ComplianceTier = "none" | "notification" | "moderate" | "high";
export type ActivityCategory = "outdoor" | "life-skills" | "creative" | "social" | "physical";

export interface Child {
  id: string;
  name: string;
  age: number;
  gradeLevel: GradeLevel;
  learningStyle: LearningStyle;
  pace: PaceSetting;
  aiPersona: AIPersona;
  interests: string[];
  energyPattern: "morning" | "afternoon" | "evening";
  avatarColor: string;
  specialNotes?: string;
  language?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  role: "parent" | "spouse" | "partner";
  avatarColor: string;
}

export interface FamilyProfile {
  id: string;
  parentName: string;
  adults: FamilyMember[];
  children: Child[];
  state: string;
  complianceTier: ComplianceTier;
  worldview: WorldviewMode;
  dietaryRestrictions: string[];
  allergies: string[];
  weeklyGroceryBudget: number;
  familySize: number;
  onboardingComplete: boolean;
}

export interface Course {
  id: string;
  childId: string;
  name: string;
  subject: string;
  type: CourseType;
  creditHours: number;
  hoursLogged: number;
  hoursTarget: number;
  grade?: number;
  letterGrade?: string;
  description?: string;
  year: number;
  semester: "fall" | "spring" | "full-year";
  status: "active" | "completed" | "planned";
}

export interface ScheduleBlock {
  id: string;
  childId?: string;
  parentId?: string;
  assigneeId?: string; // unified: child-* or adult-*
  title: string;
  type: BlockType;
  subject?: string;
  courseId?: string;
  date: string;
  startTime: string;
  endTime: string;
  completed: boolean;
  recurring?: {
    days: number[];
    endDate?: string;
  };
  color?: string;
}

export interface AttendanceRecord {
  id: string;
  childId: string;
  date: string;
  present: boolean;
  hoursLogged: number;
  subjects: string[];
  notes?: string;
  absenceReason?: "illness" | "travel" | "family-event" | "other";
  timestamp: string;
}

export interface Meal {
  id: string;
  name: string;
  type: "breakfast" | "lunch" | "dinner" | "snack";
  date: string;
  dayOfWeek: number;
  ingredients: GroceryItem[];
  recipe?: string;
  prepTime?: number;
  servings?: number;
  tags?: string[];
}

export interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  category: "produce" | "dairy" | "pantry" | "meat" | "frozen" | "household" | "personal-care" | "other";
  checked: boolean;
  mealId?: string;
  isStaple?: boolean;
  estimatedCost?: number;
  notes?: string;
}

export interface Activity {
  id: string;
  childId: string;
  name: string;
  category: ActivityCategory;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  notes?: string;
  recurring?: {
    days: number[];
    endDate?: string;
  };
  isAISuggested?: boolean;
  portfolioCapture?: boolean;
}

export interface PortfolioEntry {
  id: string;
  childId: string;
  title: string;
  date: string;
  type: "photo" | "document" | "assessment" | "project";
  subject?: string;
  grade?: string;
  notes?: string;
  fileUrl?: string;
}

export interface TranscriptRecord {
  childId: string;
  courses: Course[];
  weightedGPA: number;
  unweightedGPA: number;
  totalCredits: number;
  yearlyGPA: { year: number; weighted: number; unweighted: number }[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  citations?: { page: number; text: string }[];
  isThinking?: boolean;
}

export interface PersonalTask {
  id: string;
  title: string;
  priority: "urgent" | "scheduled" | "someday";
  dueDate?: string;
  completed: boolean;
  category: "errand" | "appointment" | "admin" | "self-care" | "household";
  notes?: string;
}

export interface Notification {
  id: string;
  type: "completion" | "missed" | "milestone" | "alert" | "reminder";
  title: string;
  message: string;
  childId?: string;
  timestamp: string;
  read: boolean;
}

// ── Pod / Invite types ──────────────────────────────────────────────────────

export type PodType =
  | "co-op"
  | "micro-school"
  | "tutor-share"
  | "study-group"
  | "nature-group"
  | "reading-circle";

export type PodRole =
  | "pod-lead"
  | "member-full"
  | "guest-member"
  | "guest-observer"
  | "guest-coparent"
  | "student-member";

export interface PodMember {
  id: string;
  displayName: string;
  email: string;
  role: PodRole;
  avatarColor: string;
  familyName?: string;
  joinedAt: string;
  isCurrentUser?: boolean;
}

export interface PodChannel {
  id: string;
  podId: string;
  name: string;
  type: "general" | "subject";
  subject?: string;
  unreadCount?: number;
}

export interface PodMessage {
  id: string;
  channelId: string;
  authorId: string;
  authorName: string;
  authorColor: string;
  content: string;
  timestamp: string;
}

export interface PodTask {
  id: string;
  podId: string;
  title: string;
  status: "todo" | "in-progress" | "done";
  assigneeId?: string;
  assigneeName?: string;
  role: string;
  dueDay?: string;
  notes?: string;
  completedAt?: string;
}

export interface Pod {
  id: string;
  name: string;
  type: PodType;
  description?: string;
  meetingDay?: string;
  meetingTime?: string;
  subjects: string[];
  members: PodMember[];
  channels: PodChannel[];
  leadMemberId: string;
  createdAt: string;
}

export interface PodInvitation {
  id: string;
  podId: string;
  podName: string;
  hostName: string;
  email: string;
  displayNameHint?: string;
  sentAt: string;
  status: "pending" | "joined" | "expired" | "revoked";
  token: string;
}
