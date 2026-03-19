import {
  StudentProfile, StudentCourse, ScheduleBlock,
  StudentNote, PodTask, ChatMessage,
} from "@/types";

export const mockAccounts = [
  { username: "emma",   password: "learn123", studentId: "child-1" },
  { username: "liam",   password: "learn123", studentId: "child-2" },
  { username: "sophia", password: "learn123", studentId: "child-3" },
];

export const mockStudent: StudentProfile = {
  id: "child-1",
  name: "Emma",
  gradeLevel: "10",
  age: 15,
  tier: "teen",
  avatarColor: "#6366f1",
  aiPersona: "socratic",
  podMember: true,
};

// ── Courses ──────────────────────────────────────────────────────────────────

export const mockCourses: StudentCourse[] = [
  {
    id: "c1",
    name: "Biology",
    subject: "Biology",
    unitName: "Unit 1: Cell Biology",
    nextTopic: "Organelle structure and function",
    progressPct: 28,
    paceStatus: "on-track",
    topics: [
      { id: "t1", title: "Introduction to cell theory", completed: true },
      { id: "t2", title: "Prokaryotes vs. eukaryotes", completed: true },
      { id: "t3", title: "Organelle structure and function", completed: false, active: true },
      { id: "t4", title: "Cell membrane and transport", completed: false },
      { id: "t5", title: "Cellular respiration overview", completed: false },
      { id: "t6", title: "Photosynthesis overview", completed: false },
      { id: "t7", title: "Cell division — mitosis", completed: false },
    ],
  },
  {
    id: "c2",
    name: "Algebra II",
    subject: "Algebra II",
    unitName: "Unit 3: Quadratics",
    nextTopic: "Completing the square",
    progressPct: 54,
    paceStatus: "ahead",
    topics: [
      { id: "t8", title: "Factoring polynomials", completed: true },
      { id: "t9", title: "Quadratic formula", completed: true },
      { id: "t10", title: "Completing the square", completed: false, active: true },
      { id: "t11", title: "Graphing parabolas", completed: false },
      { id: "t12", title: "Complex numbers", completed: false },
    ],
  },
  {
    id: "c3",
    name: "AP World History",
    subject: "AP World History",
    unitName: "Unit 7: Global Conflict",
    nextTopic: "Causes of World War I",
    progressPct: 65,
    paceStatus: "on-track",
    topics: [
      { id: "t13", title: "Imperialism and colonization", completed: true },
      { id: "t14", title: "Nationalism in Europe", completed: true },
      { id: "t15", title: "The alliance systems", completed: true },
      { id: "t16", title: "Causes of World War I", completed: false, active: true },
      { id: "t17", title: "The war in Europe", completed: false },
      { id: "t18", title: "Global impact of WWI", completed: false },
    ],
  },
  {
    id: "c4",
    name: "English Literature",
    subject: "English Literature",
    unitName: "Unit 2: The American Novel",
    nextTopic: "The Great Gatsby — Chapters 4–5",
    progressPct: 42,
    paceStatus: "catch-up",
    topics: [
      { id: "t19", title: "Introduction to modernism", completed: true },
      { id: "t20", title: "The Great Gatsby — Chapters 1–3", completed: true },
      { id: "t21", title: "The Great Gatsby — Chapters 4–5", completed: false, active: true },
      { id: "t22", title: "Symbolism and the green light", completed: false },
      { id: "t23", title: "The Great Gatsby — Chapters 6–9", completed: false },
      { id: "t24", title: "Essay: American Dream themes", completed: false },
      { id: "t25", title: "Of Mice and Men — overview", completed: false },
    ],
  },
  {
    id: "c5",
    name: "Spanish II",
    subject: "Spanish II",
    unitName: "Unit 4: Subjunctive Mood",
    nextTopic: "Present subjunctive — regular verbs",
    progressPct: 46,
    paceStatus: "on-track",
    topics: [
      { id: "t26", title: "Review: preterite vs. imperfect", completed: true },
      { id: "t27", title: "Introduction to subjunctive", completed: true },
      { id: "t28", title: "Present subjunctive — regular verbs", completed: false, active: true },
      { id: "t29", title: "Present subjunctive — irregular verbs", completed: false },
      { id: "t30", title: "Using subjunctive in context", completed: false },
    ],
  },
];

// ── Today's Schedule ──────────────────────────────────────────────────────────

export const mockSchedule: ScheduleBlock[] = [
  {
    id: "sb1",
    subject: "Biology",
    topic: "Cell Division — Mitosis",
    startTime: "09:00",
    endTime: "10:30",
    status: "done",
    courseId: "c1",
  },
  {
    id: "sb2",
    subject: "AP World History",
    topic: "Causes of World War I",
    startTime: "10:45",
    endTime: "12:00",
    status: "done",
    courseId: "c3",
  },
  {
    id: "sb3",
    subject: "English Literature",
    topic: "The Great Gatsby — Chapters 4–5",
    startTime: "13:00",
    endTime: "14:30",
    status: "active",
    courseId: "c4",
  },
  {
    id: "sb4",
    subject: "Algebra II",
    topic: "Completing the square",
    startTime: "15:00",
    endTime: "16:00",
    status: "up-next",
    courseId: "c2",
  },
  {
    id: "sb5",
    subject: "Spanish II",
    topic: "Conversation practice",
    startTime: "16:15",
    endTime: "17:00",
    status: "later",
    courseId: "c5",
  },
];

// ── Notes ─────────────────────────────────────────────────────────────────────

export const mockNotes: StudentNote[] = [
  {
    id: "n1",
    subject: "Biology",
    content: "Mitochondria is the powerhouse of the cell — but more importantly, it has its own DNA, which suggests it evolved from a separate organism (endosymbiosis theory). The double membrane is evidence of this.",
    source: "manual",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "n2",
    subject: "Biology",
    content: "The ER (endoplasmic reticulum) has two types: rough (has ribosomes, makes proteins) and smooth (no ribosomes, makes lipids and detoxifies). The 'rough' texture comes from ribosome attachment.",
    source: "ai-flagged",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "n3",
    subject: "AP World History",
    content: "The alliance system in WWI: Triple Alliance (Germany, Austria-Hungary, Italy) vs. Triple Entente (France, Russia, Britain). The assassination of Archduke Franz Ferdinand triggered the alliances like dominoes.",
    source: "manual",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "n4",
    subject: "English Literature",
    content: "The green light in Gatsby = Daisy, but also the American Dream itself. Fitzgerald uses it to show how the dream is always just out of reach — visible but untouchable.",
    source: "manual",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "n5",
    subject: "Biology",
    content: "You asked about the ER twice this week — review it before Thursday's pod session. The tutor noticed you connected it to the Golgi apparatus correctly, which shows strong understanding of protein trafficking.",
    source: "ai-reminder",
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "n6",
    subject: "Algebra II",
    content: "Completing the square: take ax² + bx + c, divide by a, add (b/2a)² to both sides, factor the left as a perfect square. Key step I kept forgetting: divide everything by 'a' first.",
    source: "manual",
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
];

// ── Pod Tasks ─────────────────────────────────────────────────────────────────

export const mockPodTasks: PodTask[] = [
  {
    id: "pt1",
    podName: "Thursday Science Co-op",
    podId: "pod-1",
    title: "Present on organelle functions — 5 min presentation",
    role: "presenter",
    dueDay: "Thursday",
    dueTime: "9:00 AM",
    completed: false,
    aiConnection: "Your presentation is Thursday. You've been studying organelles this week — the AI tutor can help you prepare. Ask it to quiz you on organelle functions.",
  },
  {
    id: "pt2",
    podName: "Thursday Science Co-op",
    podId: "pod-1",
    title: "Review Chapter 4 microscopy notes before session",
    role: "prep",
    dueDay: "Wednesday",
    dueTime: "End of day",
    completed: false,
  },
  {
    id: "pt3",
    podName: "Thursday Science Co-op",
    podId: "pod-1",
    title: "Lead warm-up — cell analogy game",
    role: "warmup-leader",
    dueDay: "Thursday",
    dueTime: "9:00 AM",
    completed: false,
  },
  {
    id: "pt4",
    podName: "Maple Street Reading Circle",
    podId: "pod-2",
    title: "Finish Charlotte's Web — chapters 15–22",
    role: "prep",
    dueDay: "Saturday",
    dueTime: "10:00 AM",
    completed: true,
    completedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "pt5",
    podName: "Maple Street Reading Circle",
    podId: "pod-2",
    title: "Prepare one discussion question about friendship",
    role: "discussion-leader",
    dueDay: "Saturday",
    dueTime: "10:00 AM",
    completed: false,
  },
];

// ── AI Tutor — initial messages ───────────────────────────────────────────────

export const mockTutorMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content: "Hi Emma! We're working on **Biology — Organelle structure and function** today.\n\nI'm in Socratic mode, so I'll be guiding you with questions rather than just telling you answers. That way the understanding sticks.\n\nLet's start with what you already know. **What organelles can you name from the top of your head, and what do you think each one does?**",
    timestamp: new Date(Date.now() - 300000).toISOString(),
    citation: "Chapter 4, page 1",
  },
];

// ── Socratic responses pool ───────────────────────────────────────────────────

export const socraticResponses: Array<{ content: string; citation: string; hintBox?: { passage: string; page: string } }> = [
  {
    content: "That's a good start! You mentioned the mitochondria — what do you think the phrase 'powerhouse of the cell' actually *means* in terms of what it produces? Think about what cells need to do work.",
    citation: "Chapter 4, page 3",
  },
  {
    content: "Exactly right about ATP! Now here's a follow-up: if the mitochondria makes energy, why do you think it has its *own* DNA, separate from the cell's nucleus? What does that suggest about its origin?",
    citation: "Chapter 4, page 4",
    hintBox: {
      passage: "\"The presence of a double membrane and independent DNA in mitochondria supports the endosymbiotic theory — that mitochondria were once free-living bacteria absorbed by larger cells.\"",
      page: "Chapter 4, page 4",
    },
  },
  {
    content: "The endosymbiotic theory — great connection! Now let's move to the ER. There are two types. Look at page 5 — what physical difference do you notice between them in the diagram, and what clue does that give you about what each type does?",
    citation: "Chapter 4, page 5",
  },
  {
    content: "Perfect — ribosomes on the rough ER mean it's making proteins. Now think about the *smooth* ER. If it doesn't make proteins, what kinds of molecules might it be responsible for? Here's a hint: think about what your cell membranes are made of.",
    citation: "Chapter 4, page 6",
  },
  {
    content: "Lipids — exactly. So rough ER makes proteins, smooth ER makes lipids. Here's the big picture question: once the rough ER makes a protein, where do you think it goes next? Look at the diagram on page 7 and describe what you see happening.",
    citation: "Chapter 4, page 7",
  },
  {
    content: "You're describing the Golgi apparatus — the cell's 'post office.' It receives proteins from the rough ER, packages them, and ships them where they need to go. What do you think would happen to a cell if the Golgi stopped working?",
    citation: "Chapter 4, page 8",
  },
];
