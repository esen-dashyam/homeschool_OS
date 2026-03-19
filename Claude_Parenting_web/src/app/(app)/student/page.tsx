"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { mockFamily, mockScheduleBlocks, mockCourses } from "@/lib/mockData";
import { cn, getAvatarInitials, getTodayString } from "@/lib/utils";
import {
  ChevronLeft, ChevronRight, Check, Lock, Flame,
  Microscope, Calculator, Globe, BookMarked, Languages,
  Zap, Trophy, CheckCircle2, BookOpen, PenLine, FlaskConical,
  Clock,
} from "lucide-react";

// ── Dark theme palette ────────────────────────────────────────────────────────
const DK = {
  bg:       "#0f1117",
  card:     "#1c1c28",
  border:   "#2d2d3f",
  muted:    "#6b6880",
  body:     "#c8c3dc",
  head:     "#e8e6f0",
  purple:   "#7F77DD",
  purpleBg: "#2a1f5e",
  green:    "#1D9E75",
  greenBg:  "#1a4a2e",
  red:      "#E24B4A",
  redBg:    "#2a0e0e",
  amber:    "#EF9F27",
  amberBg:  "#241a08",
};

// ── Types ─────────────────────────────────────────────────────────────────────
type NodeState   = "completed" | "active" | "locked";
type BloomStatus = "completed" | "active" | "locked";

interface Exercise {
  id: string;
  type: "multiple-choice" | "true-false";
  prompt: string;
  options?: { text: string }[];
  correctIndex?: number;
  trueAnswer?: boolean;
  explanation: string;
  hint: string;
  xp: number;
}

interface BloomLevel {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  name: string;
  color: string;
  status: BloomStatus;
  exercise: Exercise;
}

interface LessonNode {
  id: string;
  label: string;
  state: NodeState;
  lessonNumber: number;
  totalLessons: number;
  exercises: Exercise[];
  bloomLevels: BloomLevel[];
}

// ── Bloom colours ─────────────────────────────────────────────────────────────
const BC: Record<number, string> = {
  1: "#14b8a6",
  2: "#3b82f6",
  3: "#7F77DD",
  4: "#EF9F27",
  5: "#E24B4A",
  6: "#ec4899",
};

// ── Exercise data ─────────────────────────────────────────────────────────────
const organelleExercises: Exercise[] = [
  {
    id: "ex-1",
    type: "multiple-choice",
    prompt: "Which organelle produces the ATP that powers a cell's activities?",
    options: [
      { text: "Ribosome" },
      { text: "Mitochondria" },
      { text: "Golgi apparatus" },
      { text: "Vacuole" },
    ],
    correctIndex: 1,
    explanation: "The mitochondria earns its nickname 'powerhouse of the cell' by converting glucose and oxygen into ATP through cellular respiration. Cells with high energy demands — like muscle cells — are packed with mitochondria.",
    hint: "Think of the organelle famous for its 'powerhouse' nickname.",
    xp: 10,
  },
  {
    id: "ex-2",
    type: "multiple-choice",
    prompt: "Proteins are built here by ribosomes, then handed to the Golgi apparatus for packaging. Which organelle?",
    options: [
      { text: "Smooth endoplasmic reticulum" },
      { text: "Lysosome" },
      { text: "Rough endoplasmic reticulum" },
      { text: "Nucleus" },
    ],
    correctIndex: 2,
    explanation: "The rough ER's surface is dotted with ribosomes — giving it a rough appearance under a microscope. These ribosomes build proteins that the rough ER packages and ships to the Golgi for further processing.",
    hint: "Its 'rough' texture comes from ribosomes studding its surface.",
    xp: 10,
  },
  {
    id: "ex-3",
    type: "true-false",
    prompt: "Plant cells have both a cell wall AND a cell membrane, while animal cells have only a cell membrane.",
    trueAnswer: true,
    explanation: "Correct. Plant cells have a rigid outer cell wall (cellulose) sitting just outside the flexible inner cell membrane. Animal cells have only the membrane — which is why they can change shape more readily.",
    hint: "Think about which cell type is more structurally rigid.",
    xp: 10,
  },
];

const organelleBloom: BloomLevel[] = [
  {
    level: 1, name: "Remember", color: BC[1], status: "completed",
    exercise: {
      id: "b1", type: "multiple-choice",
      prompt: "What is the primary function of the mitochondria?",
      options: [
        { text: "Storing genetic information" },
        { text: "Producing ATP through cellular respiration" },
        { text: "Packaging proteins for export" },
        { text: "Breaking down cellular waste" },
      ],
      correctIndex: 1,
      explanation: "The mitochondria produces ATP — the cell's energy currency — through cellular respiration.",
      hint: "Focus on energy production.", xp: 15,
    },
  },
  {
    level: 2, name: "Understand", color: BC[2], status: "completed",
    exercise: {
      id: "b2", type: "multiple-choice",
      prompt: "Why would a muscle cell have significantly more mitochondria than a skin cell?",
      options: [
        { text: "Muscle cells are larger so they need more of every organelle" },
        { text: "Muscle cells contract repeatedly and require enormous amounts of ATP" },
        { text: "Skin cells have no energy requirements" },
        { text: "Mitochondria directly enable muscle contraction" },
      ],
      correctIndex: 1,
      explanation: "Muscle cells contract constantly and burn vast ATP each time. More mitochondria = more ATP production capacity. This directly ties organelle count to the cell's function.",
      hint: "What do muscle cells do constantly, and what fuel does that require?", xp: 15,
    },
  },
  {
    level: 3, name: "Apply", color: BC[3], status: "active",
    exercise: {
      id: "b3", type: "multiple-choice",
      prompt: "A scientist discovers a cell specialised for producing and exporting large quantities of protein. Which two organelles would you expect in unusually high numbers?",
      options: [
        { text: "Mitochondria and vacuoles" },
        { text: "Rough ER and Golgi apparatus" },
        { text: "Lysosomes and smooth ER" },
        { text: "Nucleus and cell wall" },
      ],
      correctIndex: 1,
      explanation: "Trace the protein's path: built on rough ER ribosomes → shipped to Golgi → modified → exported. A protein-exporting cell needs both of these in abundance.",
      hint: "Follow the path a protein takes from synthesis to the cell surface.", xp: 15,
    },
  },
  {
    level: 4, name: "Analyze", color: BC[4], status: "locked",
    exercise: {
      id: "b4", type: "multiple-choice",
      prompt: "Both the rough ER and Golgi apparatus handle proteins. What is the fundamental difference in their roles?",
      options: [
        { text: "Rough ER synthesises proteins; Golgi modifies, sorts, and ships them" },
        { text: "Golgi synthesises proteins; rough ER ships them" },
        { text: "They perform identical functions in different regions" },
        { text: "Rough ER handles lipids only; Golgi handles proteins only" },
      ],
      correctIndex: 0,
      explanation: "The rough ER is the manufacturing floor — ribosomes build proteins. The Golgi is the post office — it receives, modifies, sorts, and dispatches proteins to their destinations.",
      hint: "One makes the proteins; the other processes and dispatches them.", xp: 15,
    },
  },
  {
    level: 5, name: "Evaluate", color: BC[5], status: "locked",
    exercise: {
      id: "b5", type: "multiple-choice",
      prompt: "A student argues: 'The nucleus is the most important organelle because it controls the cell.' How well does this hold up?",
      options: [
        { text: "Very well — removing the nucleus immediately stops all cell function" },
        { text: "Partially — the nucleus is central, but mature red blood cells function without one, showing it's not universally required" },
        { text: "Poorly — the mitochondria is more important since nothing works without energy" },
        { text: "Not at all — all organelles are equally important" },
      ],
      correctIndex: 1,
      explanation: "Good evaluation acknowledges the valid core claim while identifying a counterexample: mature red blood cells eject their nucleus yet continue transporting oxygen for months. This limits the claim's universality without disproving it.",
      hint: "Is there a real cell type that challenges the idea that a nucleus is absolutely required?", xp: 15,
    },
  },
  {
    level: 6, name: "Create", color: BC[6], status: "locked",
    exercise: {
      id: "b6", type: "multiple-choice",
      prompt: "You are designing a liver cell specialised for detoxifying alcohol. Which organelle would you increase most, and why?",
      options: [
        { text: "Rough ER — it synthesises the detoxification enzymes" },
        { text: "Smooth ER — it houses enzyme systems (like cytochrome P450) that break down alcohol and lipids" },
        { text: "Lysosome — it digests harmful molecules through hydrolysis" },
        { text: "Golgi apparatus — it packages and secretes detoxification products" },
      ],
      correctIndex: 1,
      explanation: "Real hepatocytes are packed with smooth ER, which contains cytochrome P450 enzymes that oxidise alcohol. The smooth ER actually proliferates in response to chronic alcohol exposure — a remarkable cellular adaptation.",
      hint: "Which organelle handles lipid metabolism and drug detoxification — distinct from protein synthesis?", xp: 15,
    },
  },
];

const BIOLOGY_NODES: LessonNode[] = [
  { id: "n1", label: "Cell Theory",    state: "completed", lessonNumber: 1, totalLessons: 7, exercises: [], bloomLevels: organelleBloom.map(b => ({ ...b, status: "completed" as BloomStatus })) },
  { id: "n2", label: "Cell Types",     state: "completed", lessonNumber: 2, totalLessons: 7, exercises: [], bloomLevels: organelleBloom.map(b => ({ ...b, status: "completed" as BloomStatus })) },
  { id: "n3", label: "Organelles",     state: "active",    lessonNumber: 3, totalLessons: 7, exercises: organelleExercises, bloomLevels: organelleBloom },
  { id: "n4", label: "Cell Membrane",  state: "locked",    lessonNumber: 4, totalLessons: 7, exercises: [], bloomLevels: organelleBloom.map(b => ({ ...b, status: "locked" as BloomStatus })) },
  { id: "n5", label: "Cell Division",  state: "locked",    lessonNumber: 5, totalLessons: 7, exercises: [], bloomLevels: organelleBloom.map(b => ({ ...b, status: "locked" as BloomStatus })) },
  { id: "n6", label: "Lab Sim",        state: "locked",    lessonNumber: 6, totalLessons: 7, exercises: [], bloomLevels: organelleBloom.map(b => ({ ...b, status: "locked" as BloomStatus })) },
  { id: "n7", label: "Unit Quiz",      state: "locked",    lessonNumber: 7, totalLessons: 7, exercises: [], bloomLevels: [] },
];

const DAILY: Exercise = {
  id: "daily-1",
  type: "multiple-choice",
  prompt: "A toxin destroys all mitochondria in a cell. What happens first?",
  options: [
    { text: "The cell immediately bursts due to pressure buildup" },
    { text: "ATP production drops; active cellular processes begin to fail" },
    { text: "The cell switches to nuclear energy as a backup source" },
    { text: "Ribosomes compensate by synthesising more proteins" },
  ],
  correctIndex: 1,
  explanation: "Without mitochondria, cellular respiration halts. ATP levels fall rapidly, and active processes — ion pumping, chromosome movement, muscle contraction — begin to fail. The cell runs out of fuel and slowly shuts down.",
  hint: "Think about what ATP powers and what happens to those processes when supply stops.",
  xp: 25,
};

const SUBJECTS = [
  { id: "biology",  label: "Biology",         progress: 28, color: "#6366f1", Icon: Microscope },
  { id: "history",  label: "AP World History", progress: 62, color: "#d97706", Icon: Globe },
  { id: "algebra",  label: "Algebra II",       progress: 54, color: "#16a34a", Icon: Calculator },
  { id: "english",  label: "English Lit",      progress: 50, color: "#dc2626", Icon: BookMarked },
  { id: "spanish",  label: "Spanish II",       progress: 46, color: "#2563eb", Icon: Languages },
];

// ── Schedule panel helpers ────────────────────────────────────────────────────
function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}
function toMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
type SubType = "lecture" | "exercise" | "exam" | "activity";
function getSubType(title: string): SubType {
  const t = title.toLowerCase();
  if (t.includes("quiz") || t.includes("test") || t.includes("exam") || t.includes("assessment")) return "exam";
  if (t.includes("lab") || t.includes("problem set") || t.includes("worksheet") || t.includes("formula")) return "exercise";
  return "lecture";
}
const SUB_TYPE_COLOR: Record<SubType, string> = {
  lecture: "#3b82f6", exercise: "#7F77DD", exam: "#E24B4A", activity: "#10b981",
};
const SUBJECT_COLORS: Record<string, string> = {
  "Science": "#6366f1", "History": "#d97706", "Literature": "#dc2626",
  "Math": "#16a34a", "Foreign Language": "#2563eb",
};

// ── Left panel: parent schedule view ─────────────────────────────────────────
function SchedulePanel({ childId }: { childId: string }) {
  const today = getTodayString();
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const child = mockFamily.children.find(c => c.id === childId)!;
  const course = mockCourses.filter(c => c.childId === childId);

  const blocks = mockScheduleBlocks
    .filter(b => b.childId === childId && b.date === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .map(b => ({ ...b, subType: getSubType(b.title) as SubType }));

  const hoursToday = blocks
    .filter(b => b.completed && b.type === "academic")
    .reduce((sum, b) => sum + (toMinutes(b.endTime) - toMinutes(b.startTime)) / 60, 0);

  function status(b: typeof blocks[0]) {
    if (b.completed) return "done";
    const s = toMinutes(b.startTime), e = toMinutes(b.endTime);
    if (nowMin >= s && nowMin < e) return "active";
    if (s > nowMin) return "upcoming";
    return "past";
  }

  return (
    <div className="flex flex-col h-full overflow-hidden border-r border-border bg-background">
      {/* Child header */}
      <div className="px-4 py-3 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: child.avatarColor }}>
            {getAvatarInitials(child.name)}
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">{child.name}</p>
            <p className="text-xs text-muted-foreground">Grade {child.gradeLevel} · {hoursToday.toFixed(1)}h logged today</p>
          </div>
        </div>
        {/* Course progress pills */}
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {course.slice(0, 3).map(c => (
            <div key={c.id} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent border border-border">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: SUBJECT_COLORS[c.subject] ?? "#6b7280" }} />
              <span className="text-[10px] text-muted-foreground">{c.name}</span>
              <span className="text-[10px] font-medium text-foreground">{c.letterGrade}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule label */}
      <div className="px-4 pt-3 pb-1.5 flex-shrink-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Today&apos;s Schedule</p>
      </div>

      {/* Block list */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1.5">
        {blocks.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">No blocks scheduled today</p>
        )}
        {blocks.map(block => {
          const st = status(block);
          const color = SUBJECT_COLORS[block.subject ?? ""] ?? "#6b7280";
          return (
            <div key={block.id}
              className={cn("flex items-center gap-0 rounded-lg overflow-hidden border transition-opacity",
                st === "done" ? "opacity-50 border-border" : "border-border bg-card"
              )}>
              <div className="w-1 self-stretch flex-shrink-0" style={{ backgroundColor: color }} />
              <div className="flex items-center gap-2.5 px-3 py-2.5 flex-1 min-w-0">
                {/* Time */}
                <div className="flex-shrink-0 w-16">
                  <p className={cn("text-xs font-semibold tabular-nums", st === "done" ? "text-muted-foreground line-through" : "text-foreground")}>
                    {formatTime(block.startTime)}
                  </p>
                  <p className="text-[10px] text-muted-foreground tabular-nums">{formatTime(block.endTime)}</p>
                </div>
                {/* Title */}
                <div className="flex-1 min-w-0">
                  <p className={cn("text-xs font-medium truncate", st === "done" ? "text-muted-foreground" : "text-foreground")}>
                    {block.title}
                  </p>
                  {block.subject && <p className="text-[10px] text-muted-foreground">{block.subject}</p>}
                </div>
                {/* Status */}
                <div className="flex-shrink-0">
                  {st === "done" && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                  {st === "active" && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">Now</span>
                  )}
                  {st === "upcoming" && blocks.filter(b => status(b) === "upcoming")[0]?.id === block.id && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">Next</span>
                  )}
                  {block.type !== "academic" && <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-border text-muted-foreground">{block.type}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom stats */}
      <div className="border-t border-border px-4 py-3 bg-card flex-shrink-0">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-base font-bold text-foreground">{blocks.filter(b => b.completed && b.type === "academic").length}</p>
            <p className="text-[10px] text-muted-foreground">Done</p>
          </div>
          <div>
            <p className="text-base font-bold text-foreground">{blocks.filter(b => b.type === "academic").length}</p>
            <p className="text-[10px] text-muted-foreground">Total</p>
          </div>
          <div>
            <p className="text-base font-bold text-foreground">{hoursToday.toFixed(1)}h</p>
            <p className="text-[10px] text-muted-foreground">Logged</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Shared dark surface wrapper ───────────────────────────────────────────────
function DS({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col flex-1" style={{ backgroundColor: DK.bg, color: DK.body }}>
      {children}
    </div>
  );
}

// ── Streak / XP bar ───────────────────────────────────────────────────────────
function StreakBar({ streak, xp, dark = false }: { streak: number; xp: number; dark?: boolean }) {
  if (dark) return (
    <div className="flex items-center justify-between px-5 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${DK.border}` }}>
      <div className="flex items-center gap-1.5">
        <Flame className="w-4 h-4" style={{ color: DK.amber }} />
        <span className="font-semibold text-sm" style={{ color: DK.amber }}>{streak}</span>
        <span className="text-xs" style={{ color: DK.muted }}>day streak</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Zap className="w-3.5 h-3.5" style={{ color: DK.amber }} />
        <span className="font-semibold text-sm" style={{ color: DK.amber }}>{xp.toLocaleString()}</span>
        <span className="text-xs" style={{ color: DK.muted }}>XP</span>
      </div>
    </div>
  );
  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card flex-shrink-0">
      <div className="flex items-center gap-1.5">
        <Flame className="w-4 h-4 text-amber-500" />
        <span className="font-semibold text-sm text-amber-600">{streak}</span>
        <span className="text-xs text-muted-foreground">day streak</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Zap className="w-3.5 h-3.5 text-amber-500" />
        <span className="font-semibold text-sm text-amber-600">{xp.toLocaleString()}</span>
        <span className="text-xs text-muted-foreground">XP</span>
      </div>
    </div>
  );
}

// ── MC exercise (dark) ────────────────────────────────────────────────────────
function MCExercise({ ex, onCorrect, onNext }: {
  ex: Exercise;
  onCorrect: (xp: number) => void;
  onNext: () => void;
}) {
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [hint, setHint] = useState(false);
  const [awarded, setAwarded] = useState(false);
  const correct = checked && sel === ex.correctIndex;

  function check() {
    if (sel === null) return;
    const a = attempts + 1;
    setAttempts(a);
    setChecked(true);
    if (sel === ex.correctIndex && !awarded) {
      setAwarded(true);
      onCorrect(a === 1 ? ex.xp : Math.floor(ex.xp / 2));
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-base leading-relaxed" style={{ color: DK.head }}>{ex.prompt}</p>
      <div className="space-y-2">
        {ex.options!.map((opt, i) => {
          const isSel  = sel === i;
          const isOk   = checked && i === ex.correctIndex;
          const isWrong = checked && isSel && i !== ex.correctIndex;
          return (
            <button key={i} onClick={() => !checked && setSel(i)} disabled={checked && correct}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
              style={{
                backgroundColor: isOk ? DK.greenBg : isWrong ? DK.redBg : isSel ? DK.purpleBg : DK.card,
                border: `1px solid ${isOk ? DK.green : isWrong ? DK.red : isSel ? DK.purple : DK.border}`,
              }}>
              <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: isOk ? DK.green : isWrong ? DK.red : isSel ? DK.purple : DK.border, color: "#fff" }}>
                {isOk ? "✓" : isWrong ? "✕" : String.fromCharCode(65 + i)}
              </span>
              <span className="text-sm" style={{ color: DK.body }}>{opt.text}</span>
            </button>
          );
        })}
      </div>
      {hint && !checked && (
        <div className="rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: DK.amberBg, border: `1px solid ${DK.amber}`, color: DK.amber }}>
          <strong>Hint: </strong>{ex.hint}
        </div>
      )}
      {checked && (
        <div className="rounded-xl px-4 py-3 text-sm leading-relaxed"
          style={{ backgroundColor: correct ? DK.greenBg : DK.redBg, border: `1px solid ${correct ? DK.green : DK.red}`, color: correct ? DK.green : DK.red }}>
          {ex.explanation}
        </div>
      )}
      {!checked ? (
        <div className="flex gap-3">
          <button onClick={check} disabled={sel === null}
            className="flex-1 py-3 rounded-xl text-sm font-semibold disabled:opacity-30"
            style={{ backgroundColor: DK.purple, color: "#fff" }}>Check answer</button>
          {!hint && (
            <button onClick={() => setHint(true)} className="px-4 py-3 rounded-xl text-sm"
              style={{ border: `1px solid ${DK.border}`, color: DK.muted }}>Hint</button>
          )}
        </div>
      ) : correct ? (
        <button onClick={onNext} className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
          style={{ backgroundColor: DK.green, color: "#fff" }}>
          Next <ChevronRight className="w-4 h-4" />
        </button>
      ) : (
        <button onClick={() => { setSel(null); setChecked(false); setHint(true); }}
          className="w-full py-3 rounded-xl text-sm font-semibold"
          style={{ backgroundColor: DK.amber, color: "#fff" }}>Try again</button>
      )}
    </div>
  );
}

// ── T/F exercise (dark) ───────────────────────────────────────────────────────
function TFExercise({ ex, onCorrect, onNext }: {
  ex: Exercise;
  onCorrect: (xp: number) => void;
  onNext: () => void;
}) {
  const [sel, setSel] = useState<boolean | null>(null);
  const [checked, setChecked] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [awarded, setAwarded] = useState(false);
  const correct = checked && sel === ex.trueAnswer;

  function check() {
    if (sel === null) return;
    const a = attempts + 1;
    setAttempts(a);
    setChecked(true);
    if (sel === ex.trueAnswer && !awarded) {
      setAwarded(true);
      onCorrect(a === 1 ? ex.xp : Math.floor(ex.xp / 2));
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-base leading-relaxed" style={{ color: DK.head }}>{ex.prompt}</p>
      <div className="flex gap-3">
        {([true, false] as const).map(val => {
          const isSel   = sel === val;
          const isOk    = checked && val === ex.trueAnswer;
          const isWrong = checked && isSel && val !== ex.trueAnswer;
          return (
            <button key={String(val)} onClick={() => !checked && setSel(val)} disabled={checked && correct}
              className="flex-1 py-4 rounded-xl text-sm font-semibold transition-all"
              style={{
                backgroundColor: isOk ? DK.greenBg : isWrong ? DK.redBg : isSel ? DK.purpleBg : DK.card,
                border: `1px solid ${isOk ? DK.green : isWrong ? DK.red : isSel ? DK.purple : DK.border}`,
                color: isOk ? DK.green : isWrong ? DK.red : isSel ? DK.purple : DK.body,
              }}>
              {val ? "True" : "False"}
            </button>
          );
        })}
      </div>
      {checked && (
        <div className="rounded-xl px-4 py-3 text-sm leading-relaxed"
          style={{ backgroundColor: correct ? DK.greenBg : DK.redBg, border: `1px solid ${correct ? DK.green : DK.red}`, color: correct ? DK.green : DK.red }}>
          {ex.explanation}
        </div>
      )}
      {!checked ? (
        <button onClick={check} disabled={sel === null}
          className="w-full py-3 rounded-xl text-sm font-semibold disabled:opacity-30"
          style={{ backgroundColor: DK.purple, color: "#fff" }}>Check answer</button>
      ) : correct ? (
        <button onClick={onNext} className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
          style={{ backgroundColor: DK.green, color: "#fff" }}>
          Next <ChevronRight className="w-4 h-4" />
        </button>
      ) : (
        <button onClick={() => { setSel(null); setChecked(false); }}
          className="w-full py-3 rounded-xl text-sm font-semibold"
          style={{ backgroundColor: DK.amber, color: "#fff" }}>Try again</button>
      )}
    </div>
  );
}

// ── Daily challenge card ──────────────────────────────────────────────────────
function DailyCard({ done, onComplete }: { done: boolean; onComplete: (xp: number) => void }) {
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const correct = checked && sel === DAILY.correctIndex;

  if (done) return (
    <div className="mx-4 mt-4 rounded-xl p-4" style={{ backgroundColor: DK.greenBg, border: `1px solid ${DK.green}` }}>
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: DK.green }}>
          <Check className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: DK.green }}>Daily challenge complete!</p>
          <p className="text-xs" style={{ color: DK.muted }}>+25 XP · Streak extended</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-4 mt-4 rounded-xl overflow-hidden" style={{ backgroundColor: DK.card, border: `1px solid ${DK.border}` }}>
      <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderBottom: `1px solid ${DK.border}`, backgroundColor: DK.bg }}>
        <div className="flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5" style={{ color: DK.amber }} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: DK.amber }}>Daily Challenge</span>
        </div>
        <span className="text-xs" style={{ color: DK.muted }}>+25 XP · Biology review</span>
      </div>
      <div className="p-4 space-y-3">
        <p className="text-sm leading-relaxed" style={{ color: DK.head }}>{DAILY.prompt}</p>
        <div className="space-y-2">
          {DAILY.options!.map((opt, i) => {
            const isSel   = sel === i;
            const isOk    = checked && i === DAILY.correctIndex;
            const isWrong = checked && isSel && i !== DAILY.correctIndex;
            return (
              <button key={i} onClick={() => !checked && setSel(i)} disabled={checked}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all"
                style={{
                  backgroundColor: isOk ? DK.greenBg : isWrong ? DK.redBg : isSel ? DK.purpleBg : "transparent",
                  border: `1px solid ${isOk ? DK.green : isWrong ? DK.red : isSel ? DK.purple : DK.border}`,
                }}>
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: isOk ? DK.green : isWrong ? DK.red : isSel ? DK.purple : DK.border, color: "#fff" }}>
                  {isOk ? "✓" : isWrong ? "✕" : String.fromCharCode(65 + i)}
                </span>
                <span className="text-sm" style={{ color: DK.body }}>{opt.text}</span>
              </button>
            );
          })}
        </div>
        {checked && (
          <div className="rounded-lg px-3 py-2.5 text-xs leading-relaxed"
            style={{ backgroundColor: correct ? DK.greenBg : DK.amberBg, border: `1px solid ${correct ? DK.green : DK.amber}`, color: correct ? DK.green : DK.amber }}>
            {DAILY.explanation}
          </div>
        )}
        {!checked ? (
          <button onClick={() => { if (sel === null) return; setChecked(true); if (sel === DAILY.correctIndex) onComplete(DAILY.xp); }}
            disabled={sel === null}
            className="w-full py-2.5 rounded-lg text-sm font-semibold disabled:opacity-30"
            style={{ backgroundColor: DK.purple, color: "#fff" }}>Check answer</button>
        ) : correct ? (
          <div className="w-full py-2.5 rounded-lg text-sm font-semibold text-center" style={{ backgroundColor: DK.green, color: "#fff" }}>
            Correct! +25 XP
          </div>
        ) : (
          <button onClick={() => { setSel(null); setChecked(false); }}
            className="w-full py-2.5 rounded-lg text-sm font-semibold"
            style={{ backgroundColor: DK.amber, color: "#fff" }}>Try again</button>
        )}
      </div>
    </div>
  );
}

// ── Node circle ───────────────────────────────────────────────────────────────
function NodeCircle({ node, onClick }: { node: LessonNode; onClick: () => void }) {
  const isC = node.state === "completed";
  const isA = node.state === "active";
  const isL = node.state === "locked";
  return (
    <div className="flex flex-col items-center gap-2 flex-shrink-0">
      <button onClick={onClick} disabled={isL}
        className={cn("w-12 h-12 rounded-full flex items-center justify-center transition-all", isA && "animate-pulse")}
        style={{
          backgroundColor: isC ? DK.greenBg : isA ? DK.purpleBg : DK.card,
          border: `2px solid ${isC ? DK.green : isA ? DK.purple : DK.border}`,
          boxShadow: isA ? `0 0 0 6px rgba(127,119,221,0.2)` : "none",
          cursor: isL ? "default" : "pointer",
        }}>
        {isC && <Check className="w-5 h-5" style={{ color: DK.green }} />}
        {isA && node.id !== "n7" && <Microscope className="w-5 h-5" style={{ color: DK.purple }} />}
        {isA && node.id === "n7" && <Trophy className="w-5 h-5" style={{ color: DK.purple }} />}
        {isL && node.id !== "n7" && <Lock className="w-4 h-4" style={{ color: DK.muted }} />}
        {isL && node.id === "n7" && <Trophy className="w-4 h-4" style={{ color: DK.muted }} />}
      </button>
      <span className="text-[10px] font-medium text-center leading-tight max-w-[56px]"
        style={{ color: isL ? DK.muted : isA ? DK.purple : DK.green }}>
        {node.label}
      </span>
    </div>
  );
}

// ── Learning path node map ────────────────────────────────────────────────────
function NodeMap({ nodes, onSelect }: { nodes: LessonNode[]; onSelect: (n: LessonNode) => void }) {
  return (
    <div className="overflow-x-auto scrollbar-hide px-5 py-6" style={{ backgroundColor: DK.bg }}>
      <div className="flex items-start gap-0 min-w-max">
        {nodes.map((node, i) => (
          <div key={node.id} className="flex items-center">
            <NodeCircle node={node} onClick={() => node.state !== "locked" && onSelect(node)} />
            {i < nodes.length - 1 && (
              <div className="h-0.5 w-8 mx-1 mt-[-20px]"
                style={{ backgroundColor: node.state === "completed" && nodes[i + 1].state !== "locked" ? DK.green : DK.border }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Exercise view ─────────────────────────────────────────────────────────────
function ExerciseView({ node, onBack, onFinish, onXP }: {
  node: LessonNode;
  onBack: () => void;
  onFinish: () => void;
  onXP: (xp: number) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState<boolean[]>(new Array(node.exercises.length).fill(false));
  const allDone = idx >= node.exercises.length;
  const ex = node.exercises[idx];

  function next() {
    const d = [...done]; d[idx] = true; setDone(d);
    setIdx(i => i + 1);
  }

  if (allDone) return (
    <DS>
      <div className="flex items-center gap-3 px-5 py-3.5 flex-shrink-0" style={{ borderBottom: `1px solid ${DK.border}` }}>
        <button onClick={onBack} style={{ color: DK.muted }}><ChevronLeft className="w-5 h-5" /></button>
        <span className="font-medium text-sm" style={{ color: DK.head }}>{node.label}</span>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-xs w-full text-center space-y-5">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
            style={{ backgroundColor: DK.greenBg, border: `2px solid ${DK.green}` }}>
            <Check className="w-8 h-8" style={{ color: DK.green }} />
          </div>
          <div>
            <p className="font-bold text-xl" style={{ color: DK.head }}>Exercises complete!</p>
            <p className="text-sm mt-1" style={{ color: DK.muted }}>Ready for the Bloom&apos;s Quiz</p>
          </div>
          <div className="rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: DK.card, border: `1px solid ${DK.border}` }}>
            <p className="font-medium mb-1" style={{ color: DK.head }}>6 levels of mastery await</p>
            <p style={{ color: DK.muted }}>Remember → Understand → Apply → Analyze → Evaluate → Create</p>
          </div>
          <button onClick={onFinish} className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2"
            style={{ backgroundColor: DK.purple, color: "#fff" }}>
            Start Bloom&apos;s Quiz <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </DS>
  );

  return (
    <DS>
      <div className="flex items-center justify-between px-5 py-3.5 flex-shrink-0" style={{ borderBottom: `1px solid ${DK.border}` }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} style={{ color: DK.muted }}><ChevronLeft className="w-5 h-5" /></button>
          <div>
            <p className="font-medium text-sm" style={{ color: DK.head }}>{node.label}</p>
            <p className="text-xs" style={{ color: DK.muted }}>Exercise {idx + 1} of {node.exercises.length}</p>
          </div>
        </div>
      </div>
      {/* Progress dots */}
      <div className="flex gap-1.5 px-5 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${DK.border}` }}>
        {node.exercises.map((_, i) => (
          <div key={i} className="h-1.5 rounded-full flex-1 transition-colors"
            style={{ backgroundColor: done[i] ? DK.green : i === idx ? DK.purple : DK.border }} />
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-5">
        <div className="rounded-2xl p-5" style={{ backgroundColor: DK.card, border: `1px solid ${DK.border}` }}>
          <div className="mb-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
              style={{ backgroundColor: DK.purpleBg, color: DK.purple, border: `1px solid ${DK.purple}40` }}>
              {ex.type === "multiple-choice" ? "Multiple Choice" : "True / False"}
            </span>
          </div>
          {ex.type === "multiple-choice"
            ? <MCExercise key={ex.id} ex={ex} onCorrect={onXP} onNext={next} />
            : <TFExercise key={ex.id} ex={ex} onCorrect={onXP} onNext={next} />
          }
        </div>
      </div>
    </DS>
  );
}

// ── Bloom's quiz view ─────────────────────────────────────────────────────────
function BloomView({ node, initLevels, onBack, onXP }: {
  node: LessonNode;
  initLevels: BloomLevel[];
  onBack: () => void;
  onXP: (xp: number) => void;
}) {
  const [levels, setLevels] = useState<BloomLevel[]>(initLevels);
  const [activeIdx, setActiveIdx] = useState(() => initLevels.findIndex(l => l.status === "active"));
  const [answer, setAnswer] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [hint, setHint] = useState(false);
  const [awarded, setAwarded] = useState(false);
  const [finished, setFinished] = useState(false);

  const cur = levels[activeIdx];
  const ex  = cur?.exercise;
  const correct = checked && answer === ex?.correctIndex;

  function handleCheck() {
    if (answer === null) return;
    const a = attempts + 1;
    setAttempts(a);
    setChecked(true);
    if (answer === ex.correctIndex && !awarded) {
      setAwarded(true);
      onXP(a === 1 ? ex.xp : Math.floor(ex.xp / 2));
    }
  }

  function handleNext() {
    const updated = levels.map((l, i) => {
      if (i === activeIdx) return { ...l, status: "completed" as BloomStatus };
      if (i === activeIdx + 1) return { ...l, status: "active" as BloomStatus };
      return l;
    });
    setLevels(updated);
    setAnswer(null); setChecked(false); setAttempts(0); setHint(false); setAwarded(false);
    if (activeIdx + 1 < levels.length) setActiveIdx(activeIdx + 1);
    else setFinished(true);
  }

  if (finished) return (
    <DS>
      <div className="flex items-center gap-3 px-5 py-3.5 flex-shrink-0" style={{ borderBottom: `1px solid ${DK.border}` }}>
        <button onClick={onBack} style={{ color: DK.muted }}><ChevronLeft className="w-5 h-5" /></button>
        <span className="font-medium text-sm" style={{ color: DK.head }}>{node.label} · Bloom&apos;s Quiz</span>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-xs w-full text-center space-y-5">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
            style={{ backgroundColor: DK.greenBg, border: `2px solid ${DK.green}` }}>
            <Trophy className="w-8 h-8" style={{ color: DK.green }} />
          </div>
          <div>
            <p className="font-bold text-xl" style={{ color: DK.head }}>Topic mastered!</p>
            <p className="text-sm mt-1" style={{ color: DK.muted }}>All 6 Bloom&apos;s levels complete · +90 XP total</p>
          </div>
          <button onClick={onBack} className="w-full py-3.5 rounded-xl font-semibold"
            style={{ backgroundColor: DK.green, color: "#fff" }}>Back to learning path</button>
        </div>
      </div>
    </DS>
  );

  return (
    <DS>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 flex-shrink-0" style={{ borderBottom: `1px solid ${DK.border}` }}>
        <button onClick={onBack} style={{ color: DK.muted }}><ChevronLeft className="w-5 h-5" /></button>
        <span className="font-medium text-sm" style={{ color: DK.head }}>{node.label} · Bloom&apos;s Quiz</span>
      </div>
      {/* Level pills */}
      <div className="flex gap-1.5 px-5 py-3 overflow-x-auto scrollbar-hide flex-shrink-0" style={{ borderBottom: `1px solid ${DK.border}` }}>
        {levels.map((lvl, i) => {
          const isA = i === activeIdx;
          const isC = lvl.status === "completed";
          const isL = lvl.status === "locked";
          return (
            <button key={lvl.level} onClick={() => isC && setActiveIdx(i)} disabled={isL || isA}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: isC ? `${lvl.color}22` : isA ? `${lvl.color}33` : DK.card,
                border: `1px solid ${isC || isA ? lvl.color : DK.border}`,
                color: isC || isA ? lvl.color : DK.muted,
                opacity: isL ? 0.4 : 1,
              }}>
              {isC && <Check className="w-3 h-3" />}
              {isL && <Lock className="w-2.5 h-2.5" />}
              L{lvl.level} · {lvl.name}
            </button>
          );
        })}
      </div>
      {/* Question */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="rounded-2xl p-5 space-y-4" style={{ backgroundColor: DK.card, border: `1px solid ${DK.border}` }}>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
              style={{ backgroundColor: `${cur.color}22`, color: cur.color, border: `1px solid ${cur.color}40` }}>
              L{cur.level} · {cur.name}
            </span>
            <span className="text-xs" style={{ color: DK.muted }}>+{ex.xp} XP</span>
          </div>
          <p className="text-base leading-relaxed" style={{ color: DK.head }}>{ex.prompt}</p>
          <div className="space-y-2">
            {ex.options!.map((opt, i) => {
              const isSel   = answer === i;
              const isOk    = checked && i === ex.correctIndex;
              const isWrong = checked && isSel && i !== ex.correctIndex;
              return (
                <button key={i} onClick={() => !checked && setAnswer(i)} disabled={checked && correct}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                  style={{
                    backgroundColor: isOk ? DK.greenBg : isWrong ? DK.redBg : isSel ? DK.purpleBg : "transparent",
                    border: `1px solid ${isOk ? DK.green : isWrong ? DK.red : isSel ? DK.purple : DK.border}`,
                  }}>
                  <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: isOk ? DK.green : isWrong ? DK.red : isSel ? DK.purple : DK.border, color: "#fff" }}>
                    {isOk ? "✓" : isWrong ? "✕" : String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-sm" style={{ color: DK.body }}>{opt.text}</span>
                </button>
              );
            })}
          </div>
          {hint && !checked && (
            <div className="rounded-xl px-4 py-3 text-sm"
              style={{ backgroundColor: DK.amberBg, border: `1px solid ${DK.amber}`, color: DK.amber }}>
              <strong>Hint: </strong>{ex.hint}
            </div>
          )}
          {checked && (
            <div className="rounded-xl px-4 py-3 text-sm leading-relaxed"
              style={{ backgroundColor: correct ? DK.greenBg : DK.redBg, border: `1px solid ${correct ? DK.green : DK.red}`, color: correct ? DK.green : DK.red }}>
              {ex.explanation}
            </div>
          )}
          {!checked ? (
            <div className="flex gap-3">
              <button onClick={handleCheck} disabled={answer === null}
                className="flex-1 py-3 rounded-xl text-sm font-semibold disabled:opacity-30"
                style={{ backgroundColor: DK.purple, color: "#fff" }}>Check answer</button>
              {!hint && (
                <button onClick={() => setHint(true)} className="px-4 py-3 rounded-xl text-sm"
                  style={{ border: `1px solid ${DK.border}`, color: DK.muted }}>Hint</button>
              )}
            </div>
          ) : correct ? (
            <button onClick={handleNext} className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
              style={{ backgroundColor: DK.green, color: "#fff" }}>
              {activeIdx + 1 < levels.length ? "Next level" : "Complete topic"}
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={() => { setAnswer(null); setChecked(false); setHint(true); }}
              className="w-full py-3 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: DK.amber, color: "#fff" }}>Try again</button>
          )}
        </div>
      </div>
    </DS>
  );
}

// ── Learning path view ────────────────────────────────────────────────────────
function LearningPathView({ onBack, xp, streak, onNodeSelect }: {
  onBack: () => void; xp: number; streak: number;
  onNodeSelect: (n: LessonNode) => void;
}) {
  const activeNode = BIOLOGY_NODES.find(n => n.state === "active");
  const completedCount = BIOLOGY_NODES.filter(n => n.state === "completed").length;
  const pct = Math.round((completedCount / BIOLOGY_NODES.length) * 100);

  return (
    <div className="flex flex-col" style={{ backgroundColor: DK.bg, minHeight: "100%" }}>
      <div className="flex items-center gap-3 px-5 py-3.5 flex-shrink-0" style={{ borderBottom: `1px solid ${DK.border}` }}>
        <button onClick={onBack} style={{ color: DK.muted }}><ChevronLeft className="w-5 h-5" /></button>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-base" style={{ color: DK.head }}>Cell Biology</p>
          <p className="text-xs" style={{ color: DK.muted }}>Biology · Unit 1</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ backgroundColor: "#6366f122", color: "#6366f1", border: "1px solid #6366f140" }}>
          {pct}% done
        </span>
      </div>
      <StreakBar streak={streak} xp={xp} dark />
      <NodeMap nodes={BIOLOGY_NODES} onSelect={onNodeSelect} />

      {/* Progress strip */}
      {activeNode && (
        <div className="px-4 mb-4">
          <div className="px-4 py-4 rounded-xl" style={{ backgroundColor: DK.card, border: `1px solid ${DK.border}` }}>
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-sm" style={{ color: DK.head }}>
                {activeNode.label}
                <span className="font-normal ml-1.5" style={{ color: DK.muted }}>
                  — lesson {activeNode.lessonNumber} of {activeNode.totalLessons}
                </span>
              </p>
              <span className="text-xs" style={{ color: DK.muted }}>
                {Math.round((activeNode.lessonNumber / activeNode.totalLessons) * 100)}%
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: DK.border }}>
              <div className="h-full rounded-full" style={{ width: `${(activeNode.lessonNumber / activeNode.totalLessons) * 100}%`, backgroundColor: DK.purple }} />
            </div>
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs" style={{ color: DK.muted }}>
                Bloom&apos;s: L1 ✓ · L2 ✓ · <span style={{ color: DK.purple }}>L3 active</span> · L4–L6 locked
              </p>
              <button onClick={() => onNodeSelect(activeNode)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                style={{ backgroundColor: DK.purple, color: "#fff" }}>
                Continue →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lesson list */}
      <div className="px-4 pb-8 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider px-1 mb-3" style={{ color: DK.muted }}>All lessons</p>
        {BIOLOGY_NODES.map(node => (
          <button key={node.id} onClick={() => node.state !== "locked" && onNodeSelect(node)}
            disabled={node.state === "locked"}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all disabled:opacity-40"
            style={{ backgroundColor: DK.card, border: `1px solid ${node.state === "active" ? DK.purple : DK.border}` }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: node.state === "completed" ? DK.greenBg : node.state === "active" ? DK.purpleBg : DK.border,
                border: `1px solid ${node.state === "completed" ? DK.green : node.state === "active" ? DK.purple : DK.border}`,
              }}>
              {node.state === "completed" && <Check className="w-3.5 h-3.5" style={{ color: DK.green }} />}
              {node.state === "active" && <span className="text-xs font-bold" style={{ color: DK.purple }}>{node.lessonNumber}</span>}
              {node.state === "locked" && <Lock className="w-3 h-3" style={{ color: DK.muted }} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium" style={{ color: node.state === "locked" ? DK.muted : DK.head }}>{node.label}</p>
              {node.state === "active" && <p className="text-xs mt-0.5" style={{ color: DK.purple }}>In progress · L3 Apply next</p>}
              {node.state === "completed" && <p className="text-xs mt-0.5" style={{ color: DK.green }}>All 6 Bloom&apos;s levels complete</p>}
            </div>
            {node.state !== "locked" && <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: DK.muted }} />}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Today view ────────────────────────────────────────────────────────────────
function TodayView({ xp, streak, dailyDone, onDailyComplete, onSubjectClick }: {
  xp: number; streak: number; dailyDone: boolean;
  onDailyComplete: (xp: number) => void;
  onSubjectClick: (id: string) => void;
}) {
  return (
    <div className="pb-8">
      <StreakBar streak={streak} xp={xp} />
      <DailyCard done={dailyDone} onComplete={onDailyComplete} />
      <div className="px-4 mt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Your courses</p>
        <div className="space-y-2">
          {SUBJECTS.map(sub => (
            <button key={sub.id} onClick={() => onSubjectClick(sub.id)}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-card border border-border hover:bg-accent/50 transition-colors text-left">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${sub.color}18` }}>
                <sub.Icon className="w-4.5 h-4.5" style={{ color: sub.color, width: 18, height: 18 }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{sub.label}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1 rounded-full bg-accent overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${sub.progress}%`, backgroundColor: sub.color }} />
                  </div>
                  <span className="text-[11px] text-muted-foreground flex-shrink-0">{sub.progress}%</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
type View =
  | { type: "today" }
  | { type: "path" }
  | { type: "exercises"; node: LessonNode }
  | { type: "bloom"; node: LessonNode };

function StudentInterface() {
  const searchParams = useSearchParams();
  const childId = searchParams.get("child") ?? mockFamily.children[0].id;

  const [view, setView]         = useState<View>({ type: "today" });
  const [xp, setXp]             = useState(2150);
  const [streak]                = useState(14);
  const [dailyDone, setDailyDone] = useState(false);

  function addXP(n: number) { setXp(p => p + n); }

  function handleNodeSelect(node: LessonNode) {
    const firstActive = node.bloomLevels.find(b => b.status === "active");
    if (firstActive) {
      setView({ type: "bloom", node });
    } else if (node.exercises.length > 0) {
      setView({ type: "exercises", node });
    } else if (node.bloomLevels.length > 0) {
      setView({ type: "bloom", node });
    }
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 53px)" }}>
      {/* Child selector — spans full width */}
      <div className="bg-card border-b border-border px-4 py-2 flex items-center gap-2 flex-shrink-0 overflow-x-auto scrollbar-hide">
        {mockFamily.children.map(c => (
          <Link key={c.id} href={`/student?child=${c.id}`}
            onClick={() => setView({ type: "today" })}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap border",
              c.id === childId
                ? "bg-foreground text-background border-transparent"
                : "bg-card border-border text-muted-foreground hover:bg-accent hover:text-foreground"
            )}>
            <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold"
              style={{ backgroundColor: c.avatarColor }}>
              {getAvatarInitials(c.name)}
            </div>
            {c.name}
          </Link>
        ))}
        {view.type !== "today" && (
          <button onClick={() => setView({ type: "today" })}
            className="ml-auto flex-shrink-0 text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md hover:bg-accent border border-border">
            ← Today
          </button>
        )}
      </div>

      {/* Split: left = schedule, right = learning */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left — Homeschool OS schedule panel */}
        <div className="w-72 flex-shrink-0 hidden lg:flex flex-col">
          <SchedulePanel childId={childId} />
        </div>

        {/* Right — Student learning interface */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {view.type === "today" && (
            <TodayView xp={xp} streak={streak} dailyDone={dailyDone}
              onDailyComplete={(earned) => { addXP(earned); setDailyDone(true); }}
              onSubjectClick={(id) => { if (id === "biology") setView({ type: "path" }); }}
            />
          )}
          {view.type === "path" && (
            <LearningPathView onBack={() => setView({ type: "today" })}
              xp={xp} streak={streak} onNodeSelect={handleNodeSelect} />
          )}
          {view.type === "exercises" && (
            <ExerciseView node={view.node}
              onBack={() => setView({ type: "path" })}
              onFinish={() => setView({ type: "bloom", node: view.node })}
              onXP={addXP}
            />
          )}
          {view.type === "bloom" && (
            <BloomView node={view.node} initLevels={organelleBloom}
              onBack={() => setView({ type: "path" })} onXP={addXP} />
          )}
        </div>
      </div>
    </div>
  );
}

export default function StudentPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full text-muted-foreground text-sm">Loading…</div>}>
      <StudentInterface />
    </Suspense>
  );
}
