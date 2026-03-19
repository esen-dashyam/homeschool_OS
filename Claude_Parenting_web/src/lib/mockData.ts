import {
  FamilyProfile, FamilyMember, Child, Course, ScheduleBlock, AttendanceRecord,
  Meal, GroceryItem, Activity, PersonalTask, Notification, PortfolioEntry, ChatMessage,
  Pod, PodMessage, PodTask, PodInvitation,
} from "@/types";

export const mockAdults: FamilyMember[] = [
  { id: "adult-1", name: "Sarah", role: "parent", avatarColor: "#8b5cf6" },
  { id: "adult-2", name: "David", role: "spouse", avatarColor: "#0ea5e9" },
];

export const mockChildren: Child[] = [
  {
    id: "child-1",
    name: "Emma",
    age: 15,
    gradeLevel: "10",
    learningStyle: "visual",
    pace: "accelerated",
    aiPersona: "socratic-coach",
    interests: ["biology", "creative writing", "photography"],
    energyPattern: "morning",
    avatarColor: "#6366f1",
    specialNotes: "Thrives with visual aids and mind maps",
  },
  {
    id: "child-2",
    name: "Liam",
    age: 11,
    gradeLevel: "6",
    learningStyle: "hands-on",
    pace: "standard",
    aiPersona: "direct-instructor",
    interests: ["minecraft", "robotics", "soccer"],
    energyPattern: "afternoon",
    avatarColor: "#10b981",
  },
  {
    id: "child-3",
    name: "Sophia",
    age: 7,
    gradeLevel: "2",
    learningStyle: "reading-based",
    pace: "standard",
    aiPersona: "thought-partner",
    interests: ["art", "animals", "fairy tales"],
    energyPattern: "morning",
    avatarColor: "#f59e0b",
  },
];

export const mockFamily: FamilyProfile = {
  id: "family-1",
  parentName: "Sarah",
  adults: mockAdults,
  children: mockChildren,
  state: "Colorado",
  complianceTier: "moderate",
  worldview: "secular",
  dietaryRestrictions: ["gluten-free"],
  allergies: ["peanuts"],
  weeklyGroceryBudget: 200,
  familySize: 5,
  onboardingComplete: true,
};

export const mockCourses: Course[] = [
  { id: "c1", childId: "child-1", name: "Biology", subject: "Science", type: "honors", creditHours: 1, hoursLogged: 72, hoursTarget: 120, grade: 94, letterGrade: "A", year: 2024, semester: "full-year", status: "active", description: "" },
  { id: "c2", childId: "child-1", name: "Algebra II", subject: "Math", type: "standard", creditHours: 1, hoursLogged: 65, hoursTarget: 120, grade: 89, letterGrade: "B+", year: 2024, semester: "full-year", status: "active" },
  { id: "c3", childId: "child-1", name: "AP World History", subject: "History", type: "ap", creditHours: 1, hoursLogged: 78, hoursTarget: 120, grade: 91, letterGrade: "A-", year: 2024, semester: "full-year", status: "active" },
  { id: "c4", childId: "child-1", name: "English Literature", subject: "Literature", type: "honors", creditHours: 1, hoursLogged: 60, hoursTarget: 120, grade: 96, letterGrade: "A", year: 2024, semester: "full-year", status: "active" },
  { id: "c5", childId: "child-1", name: "Spanish II", subject: "Foreign Language", type: "standard", creditHours: 1, hoursLogged: 55, hoursTarget: 120, grade: 88, letterGrade: "B+", year: 2024, semester: "full-year", status: "active" },
  { id: "c6", childId: "child-2", name: "Pre-Algebra", subject: "Math", type: "standard", creditHours: 1, hoursLogged: 40, hoursTarget: 120, grade: 85, letterGrade: "B", year: 2024, semester: "full-year", status: "active" },
  { id: "c7", childId: "child-2", name: "Earth Science", subject: "Science", type: "standard", creditHours: 1, hoursLogged: 38, hoursTarget: 120, grade: 90, letterGrade: "A-", year: 2024, semester: "full-year", status: "active" },
  { id: "c8", childId: "child-2", name: "World History", subject: "History", type: "standard", creditHours: 1, hoursLogged: 35, hoursTarget: 120, grade: 82, letterGrade: "B", year: 2024, semester: "full-year", status: "active" },
];

const today = new Date().toISOString().split("T")[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

// Compute Mon–Sun of the current week
function weekDay(offset: number): string {
  const d = new Date();
  const dow = d.getDay(); // 0=Sun
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(d);
  monday.setDate(d.getDate() + mondayOffset + offset);
  return monday.toISOString().split("T")[0];
}
const mon = weekDay(0), tue = weekDay(1), wed = weekDay(2),
      thu = weekDay(3), fri = weekDay(4), sat = weekDay(5), sun = weekDay(6);

export const mockScheduleBlocks: ScheduleBlock[] = [
  // ── MONDAY ──────────────────────────────────────────────
  { id: "m1", childId: "child-1", title: "Algebra II — Quadratics", type: "academic", subject: "Math", courseId: "c2", date: mon, startTime: "09:00", endTime: "10:30", completed: true, color: "#6366f1" },
  { id: "m2", childId: "child-1", title: "English Lit — Gatsby Ch. 4–5", type: "academic", subject: "Literature", courseId: "c4", date: mon, startTime: "10:45", endTime: "12:00", completed: true, color: "#6366f1" },
  { id: "m3", childId: "child-1", title: "Lunch", type: "meal", date: mon, startTime: "12:00", endTime: "12:45", completed: true, color: "#6366f1" },
  { id: "m4", childId: "child-1", title: "Spanish II — Subjunctive", type: "academic", subject: "Foreign Language", courseId: "c5", date: mon, startTime: "13:00", endTime: "14:00", completed: true, color: "#6366f1" },
  { id: "m5", childId: "child-1", title: "Photography Walk", type: "activity", date: mon, startTime: "16:30", endTime: "17:30", completed: true, color: "#6366f1" },
  { id: "m6", childId: "child-2", title: "World History — Ancient Rome", type: "academic", subject: "History", courseId: "c8", date: mon, startTime: "09:00", endTime: "10:00", completed: true, color: "#10b981" },
  { id: "m7", childId: "child-2", title: "Pre-Algebra — Integers", type: "academic", subject: "Math", courseId: "c6", date: mon, startTime: "10:15", endTime: "11:15", completed: true, color: "#10b981" },
  { id: "m8", childId: "child-2", title: "Soccer Practice", type: "activity", date: mon, startTime: "16:00", endTime: "17:30", completed: true, color: "#10b981" },
  { id: "m9", childId: "child-3", title: "Phonics & Reading", type: "academic", subject: "English", date: mon, startTime: "09:00", endTime: "09:45", completed: true, color: "#f59e0b" },
  { id: "m10", childId: "child-3", title: "Math — Counting & Patterns", type: "academic", subject: "Math", date: mon, startTime: "10:00", endTime: "10:45", completed: true, color: "#f59e0b" },
  { id: "m11", childId: "child-3", title: "Art — Collage", type: "activity", date: mon, startTime: "11:00", endTime: "12:00", completed: true, color: "#f59e0b" },
  { id: "m12", assigneeId: "adult-1", title: "Lesson Prep", type: "academic", date: mon, startTime: "07:30", endTime: "08:30", completed: true, color: "#8b5cf6" },
  { id: "m13", assigneeId: "adult-1", title: "Admin — Email & Records", type: "appointment", date: mon, startTime: "13:00", endTime: "14:00", completed: true, color: "#8b5cf6" },
  { id: "m14", assigneeId: "adult-2", title: "Soccer pick-up", type: "activity", date: mon, startTime: "17:30", endTime: "18:00", completed: true, color: "#0ea5e9" },
  { id: "m15", assigneeId: "adult-2", title: "Dinner Prep", type: "meal", date: mon, startTime: "17:00", endTime: "18:00", completed: true, color: "#0ea5e9" },

  // ── TUESDAY ─────────────────────────────────────────────
  { id: "t1", childId: "child-1", title: "Biology — Cell Division", type: "academic", subject: "Science", courseId: "c1", date: tue, startTime: "09:00", endTime: "10:30", completed: true, color: "#6366f1" },
  { id: "t2", childId: "child-1", title: "AP World History — WWI", type: "academic", subject: "History", courseId: "c3", date: tue, startTime: "10:45", endTime: "12:00", completed: true, color: "#6366f1" },
  { id: "t3", childId: "child-1", title: "English Literature — Essay Draft", type: "academic", subject: "Literature", courseId: "c4", date: tue, startTime: "13:00", endTime: "14:30", completed: true, color: "#6366f1" },
  { id: "t4", childId: "child-1", title: "Free Time", type: "free", date: tue, startTime: "14:30", endTime: "15:30", completed: true, color: "#6366f1" },
  { id: "t5", childId: "child-2", title: "Pre-Algebra — Fractions", type: "academic", subject: "Math", courseId: "c6", date: tue, startTime: "09:00", endTime: "10:00", completed: true, color: "#10b981" },
  { id: "t6", childId: "child-2", title: "Earth Science — Plate Tectonics", type: "academic", subject: "Science", courseId: "c7", date: tue, startTime: "10:15", endTime: "11:15", completed: true, color: "#10b981" },
  { id: "t7", childId: "child-2", title: "Robotics Co-op", type: "co-op", date: tue, startTime: "13:00", endTime: "15:00", completed: true, color: "#10b981" },
  { id: "t8", childId: "child-3", title: "Phonics & Reading", type: "academic", subject: "English", date: tue, startTime: "09:00", endTime: "09:45", completed: true, color: "#f59e0b" },
  { id: "t9", childId: "child-3", title: "Art — Watercolor", type: "activity", date: tue, startTime: "10:00", endTime: "11:00", completed: true, color: "#f59e0b" },
  { id: "t10", childId: "child-3", title: "Math — Addition", type: "academic", subject: "Math", date: tue, startTime: "11:00", endTime: "11:45", completed: true, color: "#f59e0b" },
  { id: "t11", assigneeId: "adult-1", title: "Lesson Prep — Biology", type: "academic", date: tue, startTime: "07:30", endTime: "08:30", completed: true, color: "#8b5cf6" },
  { id: "t12", assigneeId: "adult-1", title: "Compliance Report Review", type: "appointment", date: tue, startTime: "12:00", endTime: "12:30", completed: true, color: "#8b5cf6" },
  { id: "t13", assigneeId: "adult-2", title: "Drop-off — Robotics", type: "activity", date: tue, startTime: "12:45", endTime: "13:15", completed: true, color: "#0ea5e9" },
  { id: "t14", assigneeId: "adult-2", title: "Read with Sophia", type: "academic", date: tue, startTime: "19:00", endTime: "19:30", completed: true, color: "#0ea5e9" },

  // ── WEDNESDAY (today) ────────────────────────────────────
  { id: "sb1", childId: "child-1", title: "Biology — Cell Division", type: "academic", subject: "Science", courseId: "c1", date: wed, startTime: "09:00", endTime: "10:30", completed: true, color: "#6366f1" },
  { id: "sb2", childId: "child-1", title: "AP World History — WWI", type: "academic", subject: "History", courseId: "c3", date: wed, startTime: "10:45", endTime: "12:00", completed: true, color: "#6366f1" },
  { id: "sb3", childId: "child-1", title: "Lunch Break", type: "meal", date: wed, startTime: "12:00", endTime: "13:00", completed: true, color: "#6366f1" },
  { id: "sb4", childId: "child-1", title: "English Literature — The Great Gatsby", type: "academic", subject: "Literature", courseId: "c4", date: wed, startTime: "13:00", endTime: "14:30", completed: false, color: "#6366f1" },
  { id: "sb5", childId: "child-1", title: "Free Time / Reading", type: "free", date: wed, startTime: "14:30", endTime: "15:30", completed: false, color: "#6366f1" },
  { id: "sb6", childId: "child-2", title: "Pre-Algebra — Fractions", type: "academic", subject: "Math", courseId: "c6", date: wed, startTime: "09:00", endTime: "10:00", completed: true, color: "#10b981" },
  { id: "sb7", childId: "child-2", title: "Earth Science — Plate Tectonics", type: "academic", subject: "Science", courseId: "c7", date: wed, startTime: "10:15", endTime: "11:15", completed: false, color: "#10b981" },
  { id: "sb8", childId: "child-2", title: "Robotics Co-op", type: "co-op", date: wed, startTime: "13:00", endTime: "15:00", completed: false, color: "#10b981" },
  { id: "sb9", childId: "child-3", title: "Phonics & Reading", type: "academic", subject: "English", date: wed, startTime: "09:00", endTime: "09:45", completed: true, color: "#f59e0b" },
  { id: "sb10", childId: "child-3", title: "Art — Watercolor", type: "activity", date: wed, startTime: "10:00", endTime: "11:00", completed: false, color: "#f59e0b" },
  { id: "sb11", childId: "child-3", title: "Math — Addition", type: "academic", subject: "Math", date: wed, startTime: "11:00", endTime: "11:45", completed: false, color: "#f59e0b" },
  { id: "sb12", assigneeId: "adult-1", title: "Lesson Prep — Biology", type: "academic", date: wed, startTime: "07:30", endTime: "08:30", completed: true, color: "#8b5cf6" },
  { id: "sb13", assigneeId: "adult-1", title: "Compliance Report Review", type: "appointment", date: wed, startTime: "12:00", endTime: "12:30", completed: false, color: "#8b5cf6" },
  { id: "sb14", assigneeId: "adult-1", title: "Grocery Run", type: "activity", date: wed, startTime: "15:30", endTime: "16:30", completed: false, color: "#8b5cf6" },
  { id: "sb15", assigneeId: "adult-1", title: "Weekly Planning", type: "free", date: wed, startTime: "20:00", endTime: "21:00", completed: false, color: "#8b5cf6" },
  { id: "sb16", assigneeId: "adult-2", title: "Drop-off — Robotics Co-op", type: "activity", date: wed, startTime: "12:45", endTime: "13:15", completed: false, color: "#0ea5e9" },
  { id: "sb17", assigneeId: "adult-2", title: "Soccer Practice Pick-up", type: "activity", date: wed, startTime: "17:30", endTime: "18:00", completed: false, color: "#0ea5e9" },
  { id: "sb18", assigneeId: "adult-2", title: "Dinner Prep", type: "meal", date: wed, startTime: "17:00", endTime: "18:00", completed: false, color: "#0ea5e9" },
  { id: "sb19", assigneeId: "adult-2", title: "Read with Sophia", type: "academic", date: wed, startTime: "19:00", endTime: "19:30", completed: false, color: "#0ea5e9" },

  // ── THURSDAY (Co-op day) ─────────────────────────────────
  { id: "th1", childId: "child-1", title: "Co-op: AP History Presentation", type: "co-op", date: thu, startTime: "09:00", endTime: "12:00", completed: false, color: "#6366f1" },
  { id: "th2", childId: "child-1", title: "Algebra II — Problem Set", type: "academic", subject: "Math", courseId: "c2", date: thu, startTime: "13:30", endTime: "14:30", completed: false, color: "#6366f1" },
  { id: "th3", childId: "child-1", title: "Nature Journal", type: "activity", date: thu, startTime: "15:30", endTime: "16:30", completed: false, color: "#6366f1" },
  { id: "th4", childId: "child-2", title: "Co-op: Robotics Build", type: "co-op", date: thu, startTime: "09:00", endTime: "12:00", completed: false, color: "#10b981" },
  { id: "th5", childId: "child-2", title: "World History Reading", type: "academic", subject: "History", courseId: "c8", date: thu, startTime: "13:00", endTime: "14:00", completed: false, color: "#10b981" },
  { id: "th6", childId: "child-3", title: "Co-op: Art & Stories", type: "co-op", date: thu, startTime: "09:30", endTime: "11:30", completed: false, color: "#f59e0b" },
  { id: "th7", childId: "child-3", title: "Math — Shapes", type: "academic", subject: "Math", date: thu, startTime: "14:00", endTime: "14:45", completed: false, color: "#f59e0b" },
  { id: "th8", assigneeId: "adult-1", title: "Drive to co-op", type: "activity", date: thu, startTime: "08:30", endTime: "09:30", completed: false, color: "#8b5cf6" },
  { id: "th9", assigneeId: "adult-1", title: "Library — Curriculum Research", type: "free", date: thu, startTime: "09:30", endTime: "12:00", completed: false, color: "#8b5cf6" },
  { id: "th10", assigneeId: "adult-1", title: "Pick up from co-op", type: "activity", date: thu, startTime: "12:00", endTime: "12:30", completed: false, color: "#8b5cf6" },
  { id: "th11", assigneeId: "adult-2", title: "Dentist Appointment", type: "appointment", date: thu, startTime: "10:00", endTime: "11:00", completed: false, color: "#0ea5e9" },
  { id: "th12", assigneeId: "adult-2", title: "WFH — Deep Work", type: "free", date: thu, startTime: "13:00", endTime: "17:00", completed: false, color: "#0ea5e9" },

  // ── FRIDAY (Lab & Project Day) ───────────────────────────
  { id: "f1", childId: "child-1", title: "Biology Lab — Cell Observation", type: "academic", subject: "Science", courseId: "c1", date: fri, startTime: "09:00", endTime: "11:00", completed: false, color: "#6366f1" },
  { id: "f2", childId: "child-1", title: "Algebra II — Quiz Review", type: "academic", subject: "Math", courseId: "c2", date: fri, startTime: "11:15", endTime: "12:15", completed: false, color: "#6366f1" },
  { id: "f3", childId: "child-1", title: "Spanish — Conversation Practice", type: "academic", subject: "Foreign Language", courseId: "c5", date: fri, startTime: "13:00", endTime: "14:00", completed: false, color: "#6366f1" },
  { id: "f4", childId: "child-1", title: "Free Time", type: "free", date: fri, startTime: "14:00", endTime: "15:30", completed: false, color: "#6366f1" },
  { id: "f5", childId: "child-2", title: "Earth Science — Experiment", type: "academic", subject: "Science", courseId: "c7", date: fri, startTime: "09:00", endTime: "10:30", completed: false, color: "#10b981" },
  { id: "f6", childId: "child-2", title: "Pre-Algebra — Review & Quiz", type: "academic", subject: "Math", courseId: "c6", date: fri, startTime: "10:45", endTime: "11:45", completed: false, color: "#10b981" },
  { id: "f7", childId: "child-2", title: "Minecraft / Free Build", type: "free", date: fri, startTime: "13:00", endTime: "15:00", completed: false, color: "#10b981" },
  { id: "f8", childId: "child-3", title: "Story Time & Reading", type: "academic", subject: "English", date: fri, startTime: "09:00", endTime: "10:00", completed: false, color: "#f59e0b" },
  { id: "f9", childId: "child-3", title: "Nature Walk", type: "activity", date: fri, startTime: "10:30", endTime: "11:30", completed: false, color: "#f59e0b" },
  { id: "f10", childId: "child-3", title: "Math — Review", type: "academic", subject: "Math", date: fri, startTime: "13:00", endTime: "13:45", completed: false, color: "#f59e0b" },
  { id: "f11", assigneeId: "adult-1", title: "Weekly Grade Review", type: "academic", date: fri, startTime: "12:30", endTime: "14:00", completed: false, color: "#8b5cf6" },
  { id: "f12", assigneeId: "adult-1", title: "Grocery Run", type: "activity", date: fri, startTime: "15:30", endTime: "16:30", completed: false, color: "#8b5cf6" },
  { id: "f13", assigneeId: "adult-2", title: "WFH — Team Call", type: "appointment", date: fri, startTime: "09:00", endTime: "11:00", completed: false, color: "#0ea5e9" },
  { id: "f14", assigneeId: "adult-2", title: "Lunch with kids", type: "meal", date: fri, startTime: "12:00", endTime: "13:00", completed: false, color: "#0ea5e9" },

  // ── SATURDAY ────────────────────────────────────────────
  { id: "sa1", childId: "child-2", title: "Soccer Game", type: "activity", date: sat, startTime: "10:00", endTime: "12:00", completed: false, color: "#10b981" },
  { id: "sa2", childId: "child-1", title: "Photography Walk", type: "activity", date: sat, startTime: "09:00", endTime: "10:30", completed: false, color: "#6366f1" },
  { id: "sa3", childId: "child-3", title: "Library Story Hour", type: "activity", date: sat, startTime: "10:00", endTime: "11:00", completed: false, color: "#f59e0b" },
  { id: "sa4", assigneeId: "adult-1", title: "Museum Visit — Family", type: "activity", date: sat, startTime: "13:00", endTime: "16:00", completed: false, color: "#8b5cf6" },
  { id: "sa5", assigneeId: "adult-2", title: "Drive to soccer game", type: "activity", date: sat, startTime: "09:30", endTime: "10:00", completed: false, color: "#0ea5e9" },
  { id: "sa6", assigneeId: "adult-2", title: "Museum Visit — Family", type: "activity", date: sat, startTime: "13:00", endTime: "16:00", completed: false, color: "#0ea5e9" },

  // ── SUNDAY ──────────────────────────────────────────────
  { id: "su1", childId: "child-1", title: "Independent Reading", type: "academic", date: sun, startTime: "10:00", endTime: "11:00", completed: false, color: "#6366f1" },
  { id: "su2", assigneeId: "adult-1", title: "Weekly Planning Session", type: "free", date: sun, startTime: "20:00", endTime: "21:00", completed: false, color: "#8b5cf6" },
  { id: "su3", assigneeId: "adult-2", title: "Meal Prep", type: "meal", date: sun, startTime: "16:00", endTime: "17:30", completed: false, color: "#0ea5e9" },
];

export const mockAttendance: AttendanceRecord[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(Date.now() - i * 86400000);
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) return null;
  return {
    id: `att-${i}`,
    childId: "child-1",
    date: date.toISOString().split("T")[0],
    present: Math.random() > 0.1,
    hoursLogged: 4.5 + Math.random() * 2,
    subjects: ["Science", "History", "Literature", "Math"],
    timestamp: date.toISOString(),
  };
}).filter(Boolean) as AttendanceRecord[];

export const mockMeals: Meal[] = [
  { id: "m1", name: "Greek Yogurt & Berries", type: "breakfast", date: today, dayOfWeek: 1, ingredients: [], prepTime: 5 },
  { id: "m2", name: "Grilled Chicken Salad", type: "lunch", date: today, dayOfWeek: 1, ingredients: [], prepTime: 20 },
  { id: "m3", name: "Salmon with Roasted Vegetables", type: "dinner", date: today, dayOfWeek: 1, ingredients: [], prepTime: 35 },
  { id: "m4", name: "Apple Slices with Almond Butter", type: "snack", date: today, dayOfWeek: 1, ingredients: [], prepTime: 3 },
  { id: "m5", name: "Scrambled Eggs & Toast", type: "breakfast", date: yesterday, dayOfWeek: 2, ingredients: [], prepTime: 10 },
  { id: "m6", name: "Turkey & Veggie Wrap", type: "lunch", date: yesterday, dayOfWeek: 2, ingredients: [], prepTime: 10 },
  { id: "m7", name: "Beef Stir Fry with Rice", type: "dinner", date: yesterday, dayOfWeek: 2, ingredients: [], prepTime: 25 },
];

export const mockGroceryItems: GroceryItem[] = [
  { id: "g1", name: "Greek Yogurt", quantity: "32", unit: "oz", category: "dairy", checked: false, estimatedCost: 5.99 },
  { id: "g2", name: "Mixed Berries", quantity: "2", unit: "pints", category: "produce", checked: true, estimatedCost: 7.98 },
  { id: "g3", name: "Chicken Breast", quantity: "2", unit: "lbs", category: "meat", checked: false, estimatedCost: 11.99 },
  { id: "g4", name: "Salmon Fillets", quantity: "4", unit: "pieces", category: "meat", checked: false, estimatedCost: 18.99 },
  { id: "g5", name: "Mixed Greens", quantity: "5", unit: "oz", category: "produce", checked: false, estimatedCost: 3.99 },
  { id: "g6", name: "Almond Butter", quantity: "1", unit: "jar", category: "pantry", checked: true, estimatedCost: 8.99 },
  { id: "g7", name: "Eggs", quantity: "18", unit: "count", category: "dairy", checked: false, isStaple: true, estimatedCost: 4.99 },
  { id: "g8", name: "Whole Milk", quantity: "1", unit: "gallon", category: "dairy", checked: false, isStaple: true, estimatedCost: 4.29 },
  { id: "g9", name: "Apples", quantity: "6", unit: "count", category: "produce", checked: false, estimatedCost: 3.49 },
  { id: "g10", name: "Rice", quantity: "2", unit: "lbs", category: "pantry", checked: false, isStaple: true, estimatedCost: 3.99 },
  { id: "g11", name: "Broccoli", quantity: "2", unit: "heads", category: "produce", checked: false, estimatedCost: 2.99 },
  { id: "g12", name: "Dish Soap", quantity: "1", unit: "bottle", category: "household", checked: false, estimatedCost: 2.79 },
];

export const mockActivities: Activity[] = [
  { id: "a1", childId: "child-1", name: "Nature Journaling", category: "outdoor", date: today, startTime: "15:30", endTime: "16:30", location: "Backyard" },
  { id: "a2", childId: "child-2", name: "Soccer Practice", category: "physical", date: today, startTime: "16:00", endTime: "17:30", location: "City Park", recurring: { days: [2, 4] } },
  { id: "a3", childId: "child-3", name: "Watercolor Painting", category: "creative", date: today, startTime: "10:00", endTime: "11:00" },
  { id: "a4", childId: "child-2", name: "Robotics Co-op", category: "social", date: today, startTime: "13:00", endTime: "15:00", location: "Community Center", recurring: { days: [1, 3] } },
  { id: "a5", childId: "child-1", name: "Photography Walk", category: "creative", date: today, startTime: "16:30", endTime: "17:30" },
];

export const mockPersonalTasks: PersonalTask[] = [
  { id: "pt1", title: "File quarterly attendance report with district", priority: "urgent", dueDate: today, completed: false, category: "admin" },
  { id: "pt2", title: "Order new science curriculum for next semester", priority: "scheduled", dueDate: today, completed: false, category: "admin" },
  { id: "pt3", title: "Emma dentist appointment", priority: "scheduled", dueDate: today, completed: false, category: "appointment" },
  { id: "pt4", title: "Weekly planning session", priority: "scheduled", completed: false, category: "self-care" },
  { id: "pt5", title: "Grocery run", priority: "scheduled", dueDate: today, completed: true, category: "errand" },
  { id: "pt6", title: "Oil change — family van", priority: "someday", completed: false, category: "household" },
];

export const mockNotifications: Notification[] = [
  { id: "n1", type: "completion", title: "Emma completed Biology", message: "Emma finished her Biology session — 1.5 hrs logged today", childId: "child-1", timestamp: new Date().toISOString(), read: false },
  { id: "n2", type: "alert", title: "Carnegie unit warning", message: "Spanish II is on track to fall short of 120 hrs. Consider adding a weekly session.", childId: "child-1", timestamp: new Date(Date.now() - 3600000).toISOString(), read: false },
  { id: "n3", type: "milestone", title: "Liam's streak: 5 days", message: "Liam has logged study sessions 5 days in a row!", childId: "child-2", timestamp: new Date(Date.now() - 7200000).toISOString(), read: true },
  { id: "n4", type: "reminder", title: "Compliance report due soon", message: "Colorado annual report is due in 14 days. Export your attendance PDF to prepare.", timestamp: new Date(Date.now() - 10800000).toISOString(), read: false },
];

export const mockPortfolioEntries: PortfolioEntry[] = [
  { id: "pe1", childId: "child-1", title: "AP World History Essay — Causes of WWI", date: yesterday, type: "document", subject: "History", grade: "A", notes: "Outstanding thesis development" },
  { id: "pe2", childId: "child-1", title: "Biology Lab Report — Mitosis", date: yesterday, type: "document", subject: "Science", grade: "A-" },
  { id: "pe3", childId: "child-2", title: "Robotics Project Photo", date: today, type: "photo", subject: "Science" },
  { id: "pe4", childId: "child-3", title: "Watercolor — My Garden", date: today, type: "photo", subject: "Art" },
];

// ── Pod mock data ────────────────────────────────────────────────────────────

export const mockPods: Pod[] = [
  {
    id: "pod-1",
    name: "Thursday Science Co-op",
    type: "co-op",
    description: "Weekly science labs and research projects for grades 5–10.",
    meetingDay: "Thursday",
    meetingTime: "9:00 AM – 12:00 PM",
    subjects: ["Science", "Lab Skills", "Research Methods"],
    leadMemberId: "pm-1",
    createdAt: "2025-09-01",
    members: [
      { id: "pm-1", displayName: "Sarah (You)", email: "sarah@example.com", role: "pod-lead", avatarColor: "#8b5cf6", familyName: "Henderson", joinedAt: "2025-09-01", isCurrentUser: true },
      { id: "pm-2", displayName: "James Martinez", email: "james@example.com", role: "member-full", avatarColor: "#0ea5e9", familyName: "Martinez", joinedAt: "2025-09-05" },
      { id: "pm-3", displayName: "Lisa Chen", email: "lisa@example.com", role: "member-full", avatarColor: "#10b981", familyName: "Chen", joinedAt: "2025-09-05" },
      { id: "pm-4", displayName: "Tom Walsh", email: "walsh@example.com", role: "guest-member", avatarColor: "#f59e0b", familyName: "Walsh", joinedAt: "2025-10-12" },
    ],
    channels: [
      { id: "ch-1", podId: "pod-1", name: "general", type: "general", unreadCount: 2 },
      { id: "ch-2", podId: "pod-1", name: "science", type: "subject", subject: "Science" },
      { id: "ch-3", podId: "pod-1", name: "lab-skills", type: "subject", subject: "Lab Skills" },
    ],
  },
  {
    id: "pod-2",
    name: "Maple Street Reading Circle",
    type: "reading-circle",
    description: "Monthly book discussions for children ages 7–12.",
    meetingDay: "Saturday",
    meetingTime: "10:00 – 11:30 AM",
    subjects: ["Literature", "Discussion Skills"],
    leadMemberId: "pm-5",
    createdAt: "2026-01-10",
    members: [
      { id: "pm-5", displayName: "Sarah (You)", email: "sarah@example.com", role: "pod-lead", avatarColor: "#8b5cf6", familyName: "Henderson", joinedAt: "2026-01-10", isCurrentUser: true },
      { id: "pm-6", displayName: "Rebecca Okafor", email: "rebecca@example.com", role: "member-full", avatarColor: "#ec4899", familyName: "Okafor", joinedAt: "2026-01-12" },
      { id: "pm-7", displayName: "Marcus Webb", email: "marcus@example.com", role: "guest-observer", avatarColor: "#64748b", familyName: "Webb", joinedAt: "2026-02-01" },
    ],
    channels: [
      { id: "ch-4", podId: "pod-2", name: "general", type: "general", unreadCount: 0 },
      { id: "ch-5", podId: "pod-2", name: "current-book", type: "subject", subject: "Literature", unreadCount: 1 },
    ],
  },
];

export const mockPodMessages: Record<string, PodMessage[]> = {
  "ch-1": [
    { id: "msg-1", channelId: "ch-1", authorId: "pm-2", authorName: "James", authorColor: "#0ea5e9", content: "Can everyone confirm they have materials for Thursday's lab?", timestamp: "2026-03-17T09:15:00Z" },
    { id: "msg-2", channelId: "ch-1", authorId: "pm-1", authorName: "Sarah", authorColor: "#8b5cf6", content: "Yes, I have the microscope slides. Lisa, do you have the chemical solution?", timestamp: "2026-03-17T09:22:00Z" },
    { id: "msg-3", channelId: "ch-1", authorId: "pm-3", authorName: "Lisa", authorColor: "#10b981", content: "Confirmed — I'll bring everything. Also printed the lab sheets for all kids.", timestamp: "2026-03-17T09:31:00Z" },
    { id: "msg-4", channelId: "ch-1", authorId: "pm-4", authorName: "Tom", authorColor: "#f59e0b", content: "We'll be 10 min late — dentist appointment. Start without us!", timestamp: "2026-03-18T08:05:00Z" },
  ],
  "ch-2": [
    { id: "msg-5", channelId: "ch-2", authorId: "pm-1", authorName: "Sarah", authorColor: "#8b5cf6", content: "Session plan for Thursday: Cell structure + microscopy lab. Posting the doc now.", timestamp: "2026-03-15T14:00:00Z" },
    { id: "msg-6", channelId: "ch-2", authorId: "pm-2", authorName: "James", authorColor: "#0ea5e9", content: "Perfect. My daughter has been looking forward to this one.", timestamp: "2026-03-15T14:45:00Z" },
  ],
  "ch-3": [],
  "ch-4": [
    { id: "msg-7", channelId: "ch-4", authorId: "pm-5", authorName: "Sarah", authorColor: "#8b5cf6", content: "Next book: Charlotte's Web. Sophia is already halfway through!", timestamp: "2026-03-10T11:00:00Z" },
    { id: "msg-8", channelId: "ch-4", authorId: "pm-6", authorName: "Rebecca", authorColor: "#ec4899", content: "Great choice. Discussion guide is posted in the docs.", timestamp: "2026-03-10T11:30:00Z" },
  ],
  "ch-5": [
    { id: "msg-9", channelId: "ch-5", authorId: "pm-6", authorName: "Rebecca", authorColor: "#ec4899", content: "Discussion question for Saturday: What does the friendship between Charlotte and Wilbur teach us?", timestamp: "2026-03-17T16:00:00Z" },
  ],
};

export const mockPodTasks: Record<string, PodTask[]> = {
  "pod-1": [
    { id: "pt-1", podId: "pod-1", title: "Prepare microscope slides — cell lab", status: "done", assigneeId: "pm-1", assigneeName: "Sarah", role: "teacher", dueDay: "Thursday", completedAt: "2026-03-17" },
    { id: "pt-2", podId: "pod-1", title: "Bring chemical solution and safety kit", status: "done", assigneeId: "pm-3", assigneeName: "Lisa", role: "supply-lead", dueDay: "Thursday", completedAt: "2026-03-17" },
    { id: "pt-3", podId: "pod-1", title: "Drive carpool — Martinez + Chen kids", status: "in-progress", assigneeId: "pm-2", assigneeName: "James", role: "driver", dueDay: "Thursday" },
    { id: "pt-4", podId: "pod-1", title: "Post session recap to general channel", status: "todo", assigneeId: "pm-1", assigneeName: "Sarah", role: "organizer", dueDay: "Thursday" },
    { id: "pt-5", podId: "pod-1", title: "Order lab supplies for April session", status: "todo", assigneeId: "pm-3", assigneeName: "Lisa", role: "supply-lead" },
    { id: "pt-6", podId: "pod-1", title: "Lead warm-up — cell analogy game", status: "todo", assigneeId: "pm-2", assigneeName: "James", role: "teacher" },
  ],
  "pod-2": [
    { id: "pt-7", podId: "pod-2", title: "Post discussion questions for Charlotte's Web", status: "done", assigneeId: "pm-6", assigneeName: "Rebecca", role: "discussion-leader", completedAt: "2026-03-17" },
    { id: "pt-8", podId: "pod-2", title: "Bring snacks for March session", status: "todo", assigneeId: "pm-5", assigneeName: "Sarah", role: "logistics" },
    { id: "pt-9", podId: "pod-2", title: "Select April book and share with members", status: "in-progress", assigneeId: "pm-5", assigneeName: "Sarah", role: "organizer" },
  ],
};

export const mockPodInvitations: PodInvitation[] = [
  {
    id: "inv-1",
    podId: "pod-1",
    podName: "Thursday Science Co-op",
    hostName: "Sarah",
    email: "james.peterson@example.com",
    displayNameHint: "The Petersons",
    sentAt: "2026-03-15T10:00:00Z",
    status: "pending",
    token: "tok_abc123def456",
  },
];

export const mockOnboardingMessages: ChatMessage[] = [
  {
    id: "om1",
    role: "assistant",
    content: "Hi! I'm your Homeschool OS planning assistant. I'm going to help you set up a complete operating system for your homeschool — including academic schedules, compliance tracking, transcripts, meals, and activities.\n\nLet's start simple. **What are your children's names and ages?**",
    timestamp: new Date().toISOString(),
  },
];
