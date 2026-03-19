"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { mockCourses } from "@/lib/mockData";
import { getSubjectColor, getSubjectIcon, paceLabel, paceColor } from "@/lib/utils";
import { Sparkles, Zap, Flame, ArrowLeft } from "lucide-react";

// ── Dark palette ──────────────────────────────────────────────────────────────
const DK = {
  bg: "#0f1117",
  card: "#1c1c28",
  border: "#2d2d3f",
  fg: "#e8e8f0",
  fgMuted: "#a0a0b8",
  purple: "#7F77DD",
  purpleDim: "#2a1f5e",
  purpleGlowBorder: "rgba(127,119,221,0.6)",
  green: "#1D9E75",
  greenDim: "#1a4a2e",
  red: "#E24B4A",
  redDim: "#3d1a1a",
  amber: "#EF9F27",
  blue: "#378ADD",
};

const BC: Record<number, string> = {
  1: "#1D9E75", 2: "#378ADD", 3: "#7F77DD",
  4: "#EF9F27", 5: "#D85A30", 6: "#D4537E",
};
const BLOOM_LABELS: Record<number, string> = {
  1: "Remember", 2: "Understand", 3: "Apply",
  4: "Analyze", 5: "Evaluate", 6: "Create",
};

// ── Types ─────────────────────────────────────────────────────────────────────
type LessonStep =
  | { type: "prose"; text: string }
  | { type: "hook-mc" | "mc"; question: string; options: string[]; correctIndex: number }
  | { type: "tf"; question: string; correct: boolean }
  | { type: "visual-select"; question: string; options: { label: string; emoji: string; correct: boolean }[] };

type Exercise =
  | { type: "visual-select"; question: string; options: { label: string; emoji: string; correct: boolean }[]; explanation: string }
  | { type: "mc"; question: string; options: string[]; correctIndex: number; explanation: string }
  | { type: "multi-select"; question: string; options: { label: string; correct: boolean }[]; note: string }
  | { type: "fill-blank"; before: string; blank: string; after: string; hint: string };

type BloomLevel = {
  level: number; question: string; status: "completed" | "active" | "locked"; feedback: string;
  type: "mc" | "multi-select" | "written"; minWords?: number;
  mcOptions?: string[]; mcCorrect?: number;
  multiOptions?: { label: string; correct: boolean }[];
};

type ViewType = "list" | "course" | "lesson" | "exercises" | "bloom";

// ── Brilliant-exact colors (reference HTML spec) ───────────────────────────────
const B = {
  pageBg: "#0d1117",
  surface: "#161b22",
  activeRow: "#1f2937",
  border: "#21262d",
  hover: "#1c2128",
  muted: "#8b949e",
  body: "#c9d1d9",
  heading: "#e6edf3",
  dimmed: "#484f58",
  blue: "#58a6ff",
  green: "#3fb950",
  completeBg: "#0d2218",
  activeBg: "#1f2d4a",
  lockedBg: "#21262d",
};

type LessonStatus = "complete" | "active" | "locked";
type BioLesson = { id: string; title: string; hours: number; status: LessonStatus; level?: number; totalLevels?: number };
type BioUnit = { unit: string; lessons: BioLesson[] };

const BIO_LESSONS: BioUnit[] = [
  {
    unit: "Unit 1 · Cell Biology",
    lessons: [
      { id: "l1", title: "Cell theory", hours: 6, status: "complete" },
      { id: "l2", title: "Prokaryotes vs. eukaryotes", hours: 7, status: "complete" },
      { id: "l3", title: "Organelles", hours: 8, status: "active", level: 3, totalLevels: 6 },
      { id: "l4", title: "Cell membrane", hours: 12, status: "locked" },
      { id: "l5", title: "Cell division", hours: 14, status: "locked" },
    ],
  },
  {
    unit: "Unit 2 · Genetics",
    lessons: [
      { id: "l6", title: "Mendelian genetics", hours: 12, status: "locked" },
      { id: "l7", title: "DNA structure and replication", hours: 10, status: "locked" },
      { id: "l8", title: "Gene expression and protein synthesis", hours: 11, status: "locked" },
    ],
  },
  {
    unit: "Unit 3 · Evolution",
    lessons: [
      { id: "l9", title: "Natural selection", hours: 9, status: "locked" },
      { id: "l10", title: "Evidence for evolution", hours: 8, status: "locked" },
      { id: "l11", title: "Speciation and biodiversity", hours: 10, status: "locked" },
    ],
  },
];

const LESSON_STEPS: LessonStep[] = [
  {
    type: "hook-mc",
    question: "Before we start — if a cell is like a factory, which organelle would be the power plant?",
    options: ["The nucleus", "The mitochondria", "The ribosome", "The vacuole"],
    correctIndex: 1,
  },
  {
    type: "prose",
    text: "Organelles are the cell's 'little organs' — specialized compartments that each perform a vital job. Just as your body has a heart, lungs, and kidneys, a eukaryotic cell has a nucleus, mitochondria, and endoplasmic reticulum. Most organelles are enclosed by membranes that keep their chemistry separate from the rest of the cell.",
  },
  {
    type: "prose",
    text: "The nucleus is the command center. It houses your DNA — the complete instruction manual for every protein your body makes. A double membrane called the nuclear envelope separates it from the cytoplasm, with pores that allow RNA instructions to pass through.",
  },
  {
    type: "mc",
    question: "What does the nucleus contain that directs all cellular activities?",
    options: ["ATP energy molecules", "Ribosomes for assembly", "DNA — the genetic instructions", "Lipids for the membrane"],
    correctIndex: 2,
  },
  {
    type: "prose",
    text: "Ribosomes are tiny protein factories. They read messenger RNA (instructions copied from DNA) and assemble amino acids into proteins. Ribosomes can float freely in the cytoplasm or attach to the endoplasmic reticulum — that attachment determines where finished proteins end up.",
  },
  {
    type: "visual-select",
    question: "Tap the organelle that converts glucose into energy (ATP):",
    options: [
      { label: "Nucleus", emoji: "🔵", correct: false },
      { label: "Mitochondria", emoji: "⚡", correct: true },
      { label: "Vacuole", emoji: "💧", correct: false },
      { label: "Lysosome", emoji: "🔴", correct: false },
    ],
  },
  {
    type: "prose",
    text: "The mitochondria converts glucose into ATP through cellular respiration. Remarkably, mitochondria carry their own DNA and replicate independently — evidence that they were once free-living bacteria absorbed by larger cells billions of years ago. This is the endosymbiotic theory.",
  },
  {
    type: "tf",
    question: "True or False: The Golgi apparatus packages proteins from the rough ER and ships them to their destinations inside or outside the cell.",
    correct: true,
  },
  {
    type: "prose",
    text: "You've now mapped the essential organelles: nucleus (command), ribosomes (protein synthesis), endoplasmic reticulum (processing), Golgi apparatus (shipping), mitochondria (energy), and lysosomes (cleanup). Each one is indispensable — together they run the cell.",
  },
];

const EXERCISES: Exercise[] = [
  {
    type: "visual-select",
    question: "Which organelle is the 'powerhouse of the cell'?",
    options: [
      { label: "Nucleus", emoji: "🔵", correct: false },
      { label: "Golgi Apparatus", emoji: "📦", correct: false },
      { label: "Mitochondria", emoji: "⚡", correct: true },
      { label: "Ribosome", emoji: "🟤", correct: false },
    ],
    explanation: "Mitochondria produce ATP through cellular respiration — that's why they're called the powerhouse.",
  },
  {
    type: "mc",
    question: "What is the primary role of the Golgi apparatus?",
    options: [
      "DNA replication and storage",
      "Package and ship proteins to their destinations",
      "Produce energy through respiration",
      "Synthesize lipids for the cell membrane",
    ],
    correctIndex: 1,
    explanation: "The Golgi acts as the cell's post office — receiving, modifying, and shipping proteins from the rough ER.",
  },
  {
    type: "multi-select",
    question: "Select ALL organelles found in plant cells but NOT in typical animal cells:",
    options: [
      { label: "Chloroplast", correct: true },
      { label: "Cell wall (cellulose)", correct: true },
      { label: "Nucleus", correct: false },
      { label: "Mitochondria", correct: false },
      { label: "Central vacuole (large)", correct: true },
    ],
    note: "Select 3 correct answers",
  },
  {
    type: "fill-blank",
    before: "The ",
    blank: "mitochondria",
    after: " converts glucose into ATP through a process called cellular respiration.",
    hint: "Think: 'powerhouse of the cell'",
  },
];

const BLOOM_LEVELS_INIT: BloomLevel[] = [
  {
    level: 1, type: "mc", status: "completed",
    question: "What is the primary function of the mitochondria?",
    mcOptions: ["Store DNA", "Produce ATP energy", "Package proteins", "Digest waste"],
    mcCorrect: 1,
    feedback: "Correct! Mitochondria produce ATP through cellular respiration.",
  },
  {
    level: 2, type: "written", minWords: 25, status: "completed",
    question: "In your own words, explain the difference between rough and smooth endoplasmic reticulum.",
    feedback: "Well explained! Rough ER has ribosomes and makes proteins; smooth ER lacks ribosomes and synthesizes lipids.",
  },
  {
    level: 3, type: "multi-select", status: "active",
    question: "A cell is secreting large amounts of insulin (a protein). Which organelles would be MOST active? Select all that apply.",
    multiOptions: [
      { label: "Rough ER", correct: true },
      { label: "Golgi apparatus", correct: true },
      { label: "Ribosomes", correct: true },
      { label: "Chloroplast", correct: false },
      { label: "Central vacuole", correct: false },
    ],
    feedback: "Correct! Insulin is a protein, so ribosomes synthesize it, rough ER processes it, and Golgi ships it.",
  },
  {
    level: 4, type: "written", minWords: 40, status: "locked",
    question: "Compare mitochondria and chloroplasts. How are they structurally similar, and what does that suggest about their evolutionary origin?",
    feedback: "Strong analysis! Both have double membranes and their own DNA, supporting the endosymbiotic theory.",
  },
  {
    level: 5, type: "written", minWords: 60, status: "locked",
    question: "A student argues the nucleus is the most important organelle because it 'controls everything.' Do you agree? Defend your position with evidence.",
    feedback: "Excellent evaluation! While the nucleus holds the genetic blueprint, every organelle is interdependent — the cell fails if any key part fails.",
  },
  {
    level: 6, type: "written", minWords: 80, status: "locked",
    question: "Create an extended metaphor for the cell. Choose a system (city, school, factory) and explain how at least 5 organelles map to parts of your metaphor.",
    feedback: "Creative synthesis! Metaphors reveal the functional relationships between organelles in a memorable, structured way.",
  },
];

// ── Helper components ─────────────────────────────────────────────────────────

function XpStrip({ xp, streak }: { xp: number; streak: number }) {
  return (
    <div style={{ backgroundColor: DK.card, borderBottom: `1px solid ${DK.border}` }}
      className="flex items-center gap-4 px-4 py-2">
      <div className="flex items-center gap-1.5">
        <Zap className="w-3.5 h-3.5" style={{ color: DK.amber }} />
        <span className="text-xs font-bold" style={{ color: DK.amber }}>{xp.toLocaleString()} XP</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Flame className="w-3.5 h-3.5" style={{ color: "#F97316" }} />
        <span className="text-xs font-bold" style={{ color: "#F97316" }}>{streak} day streak</span>
      </div>
    </div>
  );
}

function DarkBackBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
      style={{ color: DK.fgMuted }}>
      <ArrowLeft className="w-4 h-4" />
      {label}
    </button>
  );
}

// ── Course List View ──────────────────────────────────────────────────────────
function CourseListView({ onOpenCourse }: { onOpenCourse: (courseId: string) => void }) {
  const PACE_STYLE: Record<string, { bg: string; color: string; label: string }> = {
    "on-track": { bg: "#0d2218", color: "#3fb950", label: "On track" },
    ahead:      { bg: "#1f2d4a", color: "#58a6ff", label: "Ahead" },
    "catch-up": { bg: "#2d1f0e", color: "#e3b341", label: "Catch up" },
  };

  return (
    <div style={{ backgroundColor: B.pageBg, minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Page header */}
      <div style={{ backgroundColor: B.surface, borderBottom: `1px solid ${B.border}`, padding: "20px 24px" }}>
        <div style={{ fontSize: 22, fontWeight: 600, color: B.heading, marginBottom: 4 }}>My Courses</div>
        <div style={{ fontSize: 13, color: B.muted }}>Emma · Grade 10 · 5 active courses</div>
      </div>

      <div style={{ padding: "20px 24px", maxWidth: 720, margin: "0 auto" }}>
        {mockCourses.map((course) => {
          const emoji = getSubjectIcon(course.subject);
          const isBio = course.id === "c1";
          const completedTopics = course.topics.filter(t => t.completed).length;
          const paceStyle = PACE_STYLE[course.paceStatus] ?? PACE_STYLE["on-track"];
          const activeTopic = course.topics.find(t => (t as { active?: boolean }).active);

          return (
            <div key={course.id}
              onClick={() => onOpenCourse(course.id)}
              style={{ backgroundColor: B.surface, border: `1px solid ${B.border}`, borderRadius: 10, marginBottom: 8, cursor: "pointer", overflow: "hidden", transition: "border-color 0.15s" }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = B.muted}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = B.border}>

              {/* Top row */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, backgroundColor: B.activeRow }}>
                  {emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: B.heading }}>{course.name}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4, backgroundColor: paceStyle.bg, color: paceStyle.color, flexShrink: 0 }}>
                      {paceStyle.label}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: B.muted }}>{course.unitName}</div>
                </div>
                {isBio && (
                  <span style={{ color: B.blue, fontSize: 13, fontWeight: 400, flexShrink: 0 }}>Continue →</span>
                )}
              </div>

              {/* Progress bar + topic strip */}
              <div style={{ borderTop: `1px solid ${B.border}`, padding: "10px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <div style={{ flex: 1, height: 3, backgroundColor: B.border, borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ width: `${course.progressPct}%`, height: 3, backgroundColor: isBio ? B.blue : B.muted, borderRadius: 2 }} />
                  </div>
                  <span style={{ fontSize: 11, color: B.muted, whiteSpace: "nowrap" }}>{completedTopics}/{course.topics.length} topics</span>
                </div>
                <div style={{ fontSize: 12, color: B.muted }}>
                  Next: <span style={{ color: B.body }}>{activeTopic?.title ?? course.nextTopic}</span>
                </div>
              </div>

              {/* Topic pills (compact row) */}
              <div style={{ borderTop: `1px solid ${B.border}`, padding: "8px 16px", display: "flex", gap: 4, overflowX: "auto" }}>
                {course.topics.slice(0, 6).map((t, i) => {
                  const isActive = (t as { active?: boolean }).active;
                  const isDone = t.completed;
                  return (
                    <div key={i} style={{ width: 24, height: 4, borderRadius: 2, flexShrink: 0, backgroundColor: isDone ? B.green : isActive ? B.blue : B.border }} />
                  );
                })}
                {course.topics.length > 6 && (
                  <span style={{ fontSize: 10, color: B.dimmed, alignSelf: "center", marginLeft: 2 }}>+{course.topics.length - 6}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Lesson Icon SVG ───────────────────────────────────────────────────────────
function LessonIcon({ status }: { status: LessonStatus }) {
  const bg = status === "complete" ? B.completeBg : status === "active" ? B.activeBg : B.lockedBg;
  const stroke = status === "complete" ? B.green : status === "active" ? B.blue : B.dimmed;
  return (
    <div style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: bg }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {status === "complete" && <polyline points="20 6 9 17 4 12" />}
        {status === "active" && (<><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>)}
        {status === "locked" && (<><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></>)}
      </svg>
    </div>
  );
}

// ── Brilliant Course View (Screen 1 — faithful to reference HTML) ─────────────
function BrilliantCourseView({ onBack, onStartLesson, onGoExercises, onGoBloom, xp, streak }: {
  onBack: () => void; onStartLesson: () => void; onGoExercises: () => void; onGoBloom: () => void; xp: number; streak: number;
}) {
  const [tab, setTab] = useState<"lessons" | "exercises" | "mastery">("lessons");
  const [hovered, setHovered] = useState<string | null>(null);

  const allLessons = BIO_LESSONS.flatMap(u => u.lessons);
  const completedCount = allLessons.filter(l => l.status === "complete").length;
  const totalCount = allLessons.length;
  const progressPct = Math.round((completedCount / totalCount) * 100);

  return (
    <div style={{ backgroundColor: B.pageBg, minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif", display: "flex", flexDirection: "column" }}>

      {/* Nav tab bar */}
      <div style={{ backgroundColor: B.surface, borderBottom: `1px solid ${B.border}`, padding: "0 20px", display: "flex", alignItems: "center", flexShrink: 0 }}>
        <button onClick={onBack} style={{ fontSize: 13, color: B.muted, padding: "12px 12px 12px 0", border: "none", background: "none", cursor: "pointer", borderBottom: "2px solid transparent", marginRight: 8, fontFamily: "inherit" }}>
          ← Courses
        </button>
        {(["lessons", "exercises", "mastery"] as const).map(t => (
          <button key={t}
            onClick={() => { setTab(t); if (t === "exercises") onGoExercises(); if (t === "mastery") onGoBloom(); }}
            style={{ fontSize: 14, color: tab === t ? B.blue : B.muted, padding: "12px 16px", border: "none", background: "none", cursor: "pointer", borderBottom: `2px solid ${tab === t ? B.blue : "transparent"}`, transition: "all 0.15s", whiteSpace: "nowrap", fontFamily: "inherit" }}>
            {t === "lessons" ? "Lessons" : t === "exercises" ? "Exercises" : "Mastery"}
          </button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: 16, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#EF9F27", fontWeight: 600 }}>⚡ {xp.toLocaleString()} XP</span>
          <span style={{ fontSize: 12, color: "#F97316", fontWeight: 600 }}>🔥 {streak}d</span>
        </div>
      </div>

      {/* Course hero strip */}
      <div style={{ backgroundColor: B.surface, borderBottom: `1px solid ${B.border}`, padding: "20px 24px", flexShrink: 0 }}>
        <div style={{ fontSize: 22, fontWeight: 600, color: B.heading, marginBottom: 6 }}>Biology — Grade 10</div>
        <div style={{ fontSize: 13, color: B.muted, marginBottom: 12 }}>30 weeks · 224 study hours · Emma</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1, height: 4, backgroundColor: B.border, borderRadius: 2, overflow: "hidden" }}>
            <div style={{ width: `${progressPct}%`, height: 4, backgroundColor: B.blue, borderRadius: 2, transition: "width 0.4s" }} />
          </div>
          <span style={{ fontSize: 11, color: B.muted, whiteSpace: "nowrap" }}>{completedCount} of {totalCount} topics</span>
        </div>
      </div>

      {/* Lesson list */}
      {tab === "lessons" && (
        <div style={{ backgroundColor: B.pageBg, padding: "20px 24px", flex: 1, overflowY: "auto" }}>
          {BIO_LESSONS.map((unit, ui) => (
            <div key={ui}>
              {/* Unit label */}
              <div style={{ fontSize: 11, fontWeight: 600, color: B.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: ui === 0 ? 0 : 20, marginBottom: 10, paddingLeft: 2 }}>
                {unit.unit}
              </div>
              {/* Lesson rows */}
              {unit.lessons.map(lesson => {
                const isActive = lesson.status === "active";
                const isComplete = lesson.status === "complete";
                const isLocked = lesson.status === "locked";
                const isHov = hovered === lesson.id && !isLocked;
                return (
                  <div key={lesson.id}
                    onClick={isActive ? onStartLesson : isComplete ? onStartLesson : undefined}
                    onMouseEnter={() => setHovered(lesson.id)}
                    onMouseLeave={() => setHovered(null)}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 8, marginBottom: 2, backgroundColor: isActive ? B.activeRow : isHov ? B.hover : "transparent", cursor: isLocked ? "default" : "pointer", transition: "background 0.12s" }}>
                    <LessonIcon status={lesson.status} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: isActive ? 600 : 400, color: isActive ? B.heading : isComplete ? B.muted : B.dimmed, marginBottom: 3 }}>
                        {lesson.title}
                      </div>
                      <div style={{ fontSize: 12, color: B.muted }}>
                        {lesson.hours}h · {isComplete ? "All levels done" : isActive ? `In progress · Level ${lesson.level} of ${lesson.totalLevels}` : "Locked"}
                      </div>
                    </div>
                    {isComplete && (
                      <span style={{ backgroundColor: B.completeBg, color: B.green, fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 6, flexShrink: 0 }}>Complete</span>
                    )}
                    {isActive && (
                      <span style={{ color: B.blue, fontSize: 14, fontWeight: 400, flexShrink: 0 }}>Continue</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Mastery teaser card at bottom */}
          <div style={{ marginTop: 28, backgroundColor: B.surface, border: `1px solid ${B.border}`, borderRadius: 12, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 16 }}>⭐</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: B.heading }}>Bloom&apos;s Mastery</span>
            </div>
            <p style={{ fontSize: 12, color: B.muted, lineHeight: 1.6 }}>
              Complete the lesson and exercises to unlock 6 levels of mastery — from <span style={{ color: B.blue }}>Remember</span> all the way to <span style={{ color: B.blue }}>Create</span>.
            </p>
            <div style={{ display: "flex", gap: 4, marginTop: 10 }}>
              {[1,2,3,4,5,6].map(l => (
                <div key={l} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: l <= 2 ? B.green : l === 3 ? B.blue : B.border }} />
              ))}
            </div>
            <p style={{ fontSize: 11, color: B.muted, marginTop: 6 }}>Level 3 of 6 unlocked</p>
          </div>
        </div>
      )}

      {tab === "exercises" && (
        <div style={{ padding: "40px 24px", textAlign: "center", backgroundColor: B.pageBg, flex: 1 }}>
          <p style={{ color: B.muted, marginBottom: 16, fontSize: 14 }}>Jump straight to the exercise set for the current lesson.</p>
          <button onClick={onGoExercises} style={{ backgroundColor: "#238636", color: "#fff", border: "none", borderRadius: 8, padding: "12px 32px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            Start Exercises →
          </button>
        </div>
      )}

      {tab === "mastery" && (
        <div style={{ padding: "40px 24px", textAlign: "center", backgroundColor: B.pageBg, flex: 1 }}>
          <p style={{ color: B.muted, marginBottom: 8, fontSize: 14 }}>Complete lessons and exercises to unlock Bloom&apos;s Mastery.</p>
          <p style={{ fontSize: 12, color: B.dimmed }}>Level 3 of 6 unlocked.</p>
          <button onClick={onGoBloom} style={{ marginTop: 16, backgroundColor: "#238636", color: "#fff", border: "none", borderRadius: 8, padding: "12px 32px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            Go to Mastery Quiz →
          </button>
        </div>
      )}
    </div>
  );
}

// ── Lesson Reading View ───────────────────────────────────────────────────────
function LessonReadingView({ onBack, onComplete, addXp }: {
  onBack: () => void; onComplete: () => void; addXp: (n: number) => void;
}) {
  const [revealedTo, setRevealedTo] = useState(0);
  const [selected, setSelected] = useState<Record<number, number | boolean | null>>({});
  const [correct, setCorrect] = useState<Record<number, boolean>>({});
  const [wrong, setWrong] = useState<Record<number, boolean>>({});

  function advanceFrom(stepIdx: number) {
    let next = stepIdx + 1;
    while (next < LESSON_STEPS.length && LESSON_STEPS[next].type === "prose") next++;
    setRevealedTo(Math.min(next, LESSON_STEPS.length - 1));
  }

  function handleMcAnswer(stepIdx: number, optIdx: number, correctIdx: number) {
    if (correct[stepIdx]) return;
    setSelected(p => ({ ...p, [stepIdx]: optIdx }));
    if (optIdx === correctIdx) {
      setCorrect(p => ({ ...p, [stepIdx]: true }));
      setWrong(p => ({ ...p, [stepIdx]: false }));
      setTimeout(() => advanceFrom(stepIdx), 600);
    } else {
      setWrong(p => ({ ...p, [stepIdx]: true }));
      setTimeout(() => {
        setSelected(p => ({ ...p, [stepIdx]: null }));
        setWrong(p => ({ ...p, [stepIdx]: false }));
      }, 800);
    }
  }

  function handleTfAnswer(stepIdx: number, answer: boolean, correctAnswer: boolean) {
    if (correct[stepIdx]) return;
    setSelected(p => ({ ...p, [stepIdx]: answer }));
    if (answer === correctAnswer) {
      setCorrect(p => ({ ...p, [stepIdx]: true }));
      setTimeout(() => advanceFrom(stepIdx), 600);
    } else {
      setWrong(p => ({ ...p, [stepIdx]: true }));
      setTimeout(() => {
        setSelected(p => ({ ...p, [stepIdx]: null }));
        setWrong(p => ({ ...p, [stepIdx]: false }));
      }, 800);
    }
  }

  const allDone = revealedTo === LESSON_STEPS.length - 1;

  function renderStep(step: LessonStep, i: number) {
    if (step.type === "prose") {
      return (
        <p className="leading-relaxed text-[15px]" style={{ color: DK.fgMuted }}>{step.text}</p>
      );
    }

    if (step.type === "hook-mc" || step.type === "mc") {
      const isHook = step.type === "hook-mc";
      return (
        <div className="rounded-2xl p-4 border" style={{ backgroundColor: isHook ? "#1a1630" : DK.card, borderColor: isHook ? DK.purple : DK.border }}>
          {isHook && (
            <p className="text-xs font-semibold mb-2" style={{ color: DK.purple }}>BEFORE YOU START</p>
          )}
          <p className="font-semibold text-sm mb-3" style={{ color: DK.fg }}>{step.question}</p>
          <div className="grid grid-cols-1 gap-2">
            {step.options.map((opt, oi) => {
              const isSelected = selected[i] === oi;
              const isCorrect = correct[i] && oi === step.correctIndex;
              const isWrong = isSelected && wrong[i];
              return (
                <button key={oi} onClick={() => handleMcAnswer(i, oi, step.correctIndex)}
                  disabled={!!correct[i]}
                  className="text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{
                    backgroundColor: isCorrect ? DK.greenDim : isWrong ? DK.redDim : isSelected ? DK.purpleDim : DK.bg,
                    border: `1.5px solid ${isCorrect ? DK.green : isWrong ? DK.red : isSelected ? DK.purple : DK.border}`,
                    color: isCorrect ? DK.green : isWrong ? DK.red : DK.fg,
                  }}>
                  {opt}
                </button>
              );
            })}
          </div>
          {correct[i] && (
            <p className="text-xs mt-2 font-medium" style={{ color: DK.green }}>✓ Correct — keep reading!</p>
          )}
        </div>
      );
    }

    if (step.type === "visual-select") {
      return (
        <div className="rounded-2xl p-4 border" style={{ backgroundColor: DK.card, borderColor: DK.border }}>
          <p className="font-semibold text-sm mb-3" style={{ color: DK.fg }}>{step.question}</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {step.options.map((opt, oi) => {
              const isSelected = selected[i] === oi;
              const isCorrect = correct[i] && opt.correct;
              const isWrong = isSelected && wrong[i];
              return (
                <button key={oi} onClick={() => handleMcAnswer(i, oi, step.options.findIndex(o => o.correct))}
                  disabled={!!correct[i]}
                  className="flex flex-col items-center gap-2 py-4 px-3 rounded-xl text-center transition-all"
                  style={{
                    backgroundColor: isCorrect ? DK.greenDim : isWrong ? DK.redDim : isSelected ? DK.purpleDim : DK.bg,
                    border: `2px solid ${isCorrect ? DK.green : isWrong ? DK.red : isSelected ? DK.purple : DK.border}`,
                  }}>
                  <span className="text-3xl">{opt.emoji}</span>
                  <span className="text-xs font-medium" style={{ color: isCorrect ? DK.green : isWrong ? DK.red : DK.fg }}>{opt.label}</span>
                </button>
              );
            })}
          </div>
          {correct[i] && (
            <p className="text-xs mt-2 font-medium" style={{ color: DK.green }}>✓ Correct!</p>
          )}
        </div>
      );
    }

    if (step.type === "tf") {
      const userAnswer = selected[i] as boolean | null;
      return (
        <div className="rounded-2xl p-4 border" style={{ backgroundColor: DK.card, borderColor: DK.border }}>
          <p className="font-semibold text-sm mb-3" style={{ color: DK.fg }}>{step.question}</p>
          <div className="flex gap-3">
            {[true, false].map((val) => {
              const isSelected = userAnswer === val;
              const isCorrect = correct[i] && val === step.correct;
              const isWrong = isSelected && wrong[i];
              return (
                <button key={String(val)} onClick={() => handleTfAnswer(i, val, step.correct)}
                  disabled={!!correct[i]}
                  className="flex-1 py-3 rounded-xl text-sm font-bold transition-all"
                  style={{
                    backgroundColor: isCorrect ? DK.greenDim : isWrong ? DK.redDim : isSelected ? DK.purpleDim : DK.bg,
                    border: `2px solid ${isCorrect ? DK.green : isWrong ? DK.red : isSelected ? DK.purple : DK.border}`,
                    color: isCorrect ? DK.green : isWrong ? DK.red : DK.fg,
                  }}>
                  {val ? "True" : "False"}
                </button>
              );
            })}
          </div>
          {correct[i] && (
            <p className="text-xs mt-2 font-medium" style={{ color: DK.green }}>✓ Correct!</p>
          )}
        </div>
      );
    }

    return null;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: DK.bg }}>
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3 border-b"
        style={{ backgroundColor: DK.bg, borderColor: DK.border }}>
        <DarkBackBtn label="Learning Path" onClick={onBack} />
        <div className="flex-1" />
        <span className="text-xs font-medium px-2 py-1 rounded-lg" style={{ backgroundColor: DK.card, color: DK.fgMuted }}>
          🧬 Organelles
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full" style={{ backgroundColor: DK.border }}>
        <div className="h-1 transition-all duration-500" style={{
          width: `${Math.round(((revealedTo + 1) / LESSON_STEPS.length) * 100)}%`,
          backgroundColor: DK.purple
        }} />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {LESSON_STEPS.map((step, i) => {
          if (i > revealedTo) return null;
          return (
            <motion.div key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}>
              {renderStep(step, i)}
            </motion.div>
          );
        })}

        {/* Continue button */}
        {allDone && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="rounded-2xl p-5 text-center border" style={{ backgroundColor: "#1a2a1e", borderColor: DK.green }}>
              <p className="font-bold text-lg mb-1" style={{ color: DK.green }}>Lesson complete! 🎉</p>
              <p className="text-sm mb-4" style={{ color: DK.fgMuted }}>You&apos;ve read all the content. Now test what you know.</p>
              <button onClick={() => { addXp(20); onComplete(); }}
                className="px-6 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: DK.green }}>
                Continue to Exercises → +20 XP
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ── Exercises View ────────────────────────────────────────────────────────────
function ExercisesView({ onBack, onComplete, addXp }: {
  onBack: () => void; onComplete: () => void; addXp: (n: number) => void;
}) {
  const [current, setCurrent] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [selectedMulti, setSelectedMulti] = useState<Set<number>>(new Set());
  const [fillInput, setFillInput] = useState("");
  const [allDone, setAllDone] = useState(false);

  const ex = EXERCISES[current];

  function next() {
    if (current + 1 >= EXERCISES.length) {
      setAllDone(true);
    } else {
      setCurrent(c => c + 1);
      setResult(null);
      setSelectedOpt(null);
      setSelectedMulti(new Set());
      setFillInput("");
      setAttempt(0);
    }
  }

  function handleCorrect() {
    const xpGained = attempt === 0 ? 10 : 5;
    addXp(xpGained);
    setResult("correct");
  }

  function handleWrong() {
    setAttempt(a => a + 1);
    setResult("wrong");
    setTimeout(() => {
      setResult(null);
      setSelectedOpt(null);
    }, 800);
  }

  function submitMc(optIdx: number, correctIdx: number) {
    if (result === "correct") return;
    setSelectedOpt(optIdx);
    if (optIdx === correctIdx) handleCorrect();
    else handleWrong();
  }

  function submitVisualSelect(optIdx: number, options: { correct: boolean }[]) {
    if (result === "correct") return;
    setSelectedOpt(optIdx);
    if (options[optIdx].correct) handleCorrect();
    else handleWrong();
  }

  function submitMultiSelect(options: { correct: boolean }[]) {
    const correctSet = new Set(options.map((o, i) => o.correct ? i : -1).filter(i => i >= 0));
    const isCorrect = selectedMulti.size === correctSet.size && Array.from(selectedMulti).every(i => correctSet.has(i));
    if (isCorrect) handleCorrect();
    else { setAttempt(a => a + 1); setResult("wrong"); setTimeout(() => { setResult(null); setSelectedMulti(new Set()); }, 800); }
  }

  function submitFill(blank: string) {
    const val = fillInput.trim().toLowerCase();
    if (val === blank.toLowerCase() || val === "mitochondrion") handleCorrect();
    else handleWrong();
  }

  const progressPct = Math.round((current / EXERCISES.length) * 100);

  if (allDone) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: DK.bg }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="max-w-sm w-full mx-4 text-center p-8 rounded-3xl border"
          style={{ backgroundColor: DK.card, borderColor: DK.green }}>
          <div className="text-5xl mb-4">🏆</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: DK.fg }}>All 4 exercises done!</h2>
          <p className="text-sm mb-6" style={{ color: DK.fgMuted }}>Ready to test deeper mastery? Bloom&apos;s quiz unlocked.</p>
          <button onClick={onComplete}
            className="w-full py-3 rounded-xl font-bold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: DK.purple }}>
            Start Bloom&apos;s Quiz →
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: DK.bg }}>
      <div className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3 border-b"
        style={{ backgroundColor: DK.bg, borderColor: DK.border }}>
        <DarkBackBtn label="Learning Path" onClick={onBack} />
        <div className="flex-1" />
        <span className="text-xs font-medium" style={{ color: DK.fgMuted }}>Exercise {current + 1} of {EXERCISES.length}</span>
      </div>

      {/* Dot progress */}
      <div className="flex items-center gap-1.5 px-4 pt-4">
        {EXERCISES.map((_, i) => (
          <div key={i} className="h-1.5 flex-1 rounded-full transition-all"
            style={{ backgroundColor: i < current ? DK.green : i === current ? DK.purple : DK.border }} />
        ))}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div key={current}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}>

            {ex.type === "visual-select" && (
              <div>
                <p className="font-bold text-lg mb-5" style={{ color: DK.fg }}>{ex.question}</p>
                <div className="grid grid-cols-2 gap-3">
                  {ex.options.map((opt, oi) => {
                    const isSel = selectedOpt === oi;
                    const isCorrect = result === "correct" && isSel;
                    const isWrong = result === "wrong" && isSel;
                    return (
                      <button key={oi} onClick={() => submitVisualSelect(oi, ex.options)}
                        disabled={result === "correct"}
                        className="flex flex-col items-center gap-3 py-6 px-4 rounded-2xl transition-all text-center"
                        style={{
                          backgroundColor: isCorrect ? DK.greenDim : isWrong ? DK.redDim : DK.card,
                          border: `2px solid ${isCorrect ? DK.green : isWrong ? DK.red : DK.border}`,
                        }}>
                        <span className="text-4xl">{opt.emoji}</span>
                        <span className="text-sm font-semibold" style={{ color: isCorrect ? DK.green : isWrong ? DK.red : DK.fg }}>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
                {result === "correct" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="mt-4 p-4 rounded-xl border" style={{ backgroundColor: DK.greenDim, borderColor: DK.green }}>
                    <p className="text-sm font-medium" style={{ color: DK.green }}>{ex.explanation}</p>
                    <button onClick={next} className="mt-3 px-4 py-2 rounded-lg text-sm font-bold text-white"
                      style={{ backgroundColor: DK.green }}>Continue →</button>
                  </motion.div>
                )}
              </div>
            )}

            {ex.type === "mc" && (
              <div>
                <p className="font-bold text-lg mb-5" style={{ color: DK.fg }}>{ex.question}</p>
                <div className="space-y-2">
                  {ex.options.map((opt, oi) => {
                    const isSel = selectedOpt === oi;
                    const isCorrect = result === "correct" && isSel;
                    const isWrong = result === "wrong" && isSel;
                    return (
                      <button key={oi} onClick={() => submitMc(oi, ex.correctIndex)}
                        disabled={result === "correct"}
                        className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all"
                        style={{
                          backgroundColor: isCorrect ? DK.greenDim : isWrong ? DK.redDim : DK.card,
                          border: `1.5px solid ${isCorrect ? DK.green : isWrong ? DK.red : DK.border}`,
                          color: isCorrect ? DK.green : isWrong ? DK.red : DK.fg,
                        }}>
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {result === "correct" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="mt-4 p-4 rounded-xl border" style={{ backgroundColor: DK.greenDim, borderColor: DK.green }}>
                    <p className="text-sm font-medium" style={{ color: DK.green }}>{ex.explanation}</p>
                    <button onClick={next} className="mt-3 px-4 py-2 rounded-lg text-sm font-bold text-white"
                      style={{ backgroundColor: DK.green }}>Continue →</button>
                  </motion.div>
                )}
              </div>
            )}

            {ex.type === "multi-select" && (
              <div>
                <p className="font-bold text-lg mb-1" style={{ color: DK.fg }}>{ex.question}</p>
                <p className="text-xs mb-4" style={{ color: DK.fgMuted }}>{ex.note}</p>
                <div className="space-y-2 mb-4">
                  {ex.options.map((opt, oi) => {
                    const isSel = selectedMulti.has(oi);
                    return (
                      <button key={oi}
                        onClick={() => {
                          if (result === "correct") return;
                          setSelectedMulti(prev => {
                            const next = new Set(prev);
                            if (next.has(oi)) next.delete(oi); else next.add(oi);
                            return next;
                          });
                        }}
                        className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 transition-all"
                        style={{
                          backgroundColor: isSel ? DK.purpleDim : DK.card,
                          border: `1.5px solid ${isSel ? DK.purple : DK.border}`,
                          color: DK.fg,
                        }}>
                        <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: isSel ? DK.purple : "transparent", border: `1.5px solid ${isSel ? DK.purple : DK.border}` }}>
                          {isSel && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                {result !== "correct" && (
                  <button onClick={() => submitMultiSelect(ex.options)}
                    disabled={selectedMulti.size === 0}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40"
                    style={{ backgroundColor: DK.purple }}>
                    Check answers
                  </button>
                )}
                {result === "wrong" && (
                  <p className="mt-2 text-xs" style={{ color: DK.red }}>Not quite — try again.</p>
                )}
                {result === "correct" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="mt-2 p-4 rounded-xl border" style={{ backgroundColor: DK.greenDim, borderColor: DK.green }}>
                    <p className="text-sm font-medium" style={{ color: DK.green }}>Correct! All 3 are plant-only organelles.</p>
                    <button onClick={next} className="mt-3 px-4 py-2 rounded-lg text-sm font-bold text-white"
                      style={{ backgroundColor: DK.green }}>Continue →</button>
                  </motion.div>
                )}
              </div>
            )}

            {ex.type === "fill-blank" && (
              <div>
                <p className="font-bold text-lg mb-5" style={{ color: DK.fg }}>Fill in the blank:</p>
                <div className="p-4 rounded-2xl border mb-4" style={{ backgroundColor: DK.card, borderColor: DK.border }}>
                  <p className="text-[15px] leading-relaxed" style={{ color: DK.fg }}>
                    {ex.before}
                    <input value={fillInput} onChange={e => setFillInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && result !== "correct") submitFill(ex.blank); }}
                      placeholder="___________"
                      className="inline-block mx-1 px-3 py-1 rounded-lg text-sm font-bold outline-none border-b-2 bg-transparent transition-colors"
                      style={{
                        borderColor: result === "correct" ? DK.green : result === "wrong" ? DK.red : DK.purple,
                        color: result === "correct" ? DK.green : result === "wrong" ? DK.red : DK.fg,
                        width: "140px",
                      }} />
                    {ex.after}
                  </p>
                </div>
                <p className="text-xs mb-3" style={{ color: DK.fgMuted }}>Hint: {ex.hint}</p>
                {result !== "correct" && (
                  <button onClick={() => submitFill(ex.blank)}
                    disabled={!fillInput.trim()}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-40"
                    style={{ backgroundColor: DK.purple }}>
                    Check
                  </button>
                )}
                {result === "wrong" && <p className="mt-2 text-xs" style={{ color: DK.red }}>Not quite — try again.</p>}
                {result === "correct" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="mt-2 p-4 rounded-xl border" style={{ backgroundColor: DK.greenDim, borderColor: DK.green }}>
                    <p className="text-sm font-medium" style={{ color: DK.green }}>Correct! Mitochondria = powerhouse.</p>
                    <button onClick={next} className="mt-3 px-4 py-2 rounded-lg text-sm font-bold text-white"
                      style={{ backgroundColor: DK.green }}>Continue →</button>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Bloom's Quiz View ─────────────────────────────────────────────────────────
function BloomQuizView({ onBack, addXp }: { onBack: () => void; addXp: (n: number) => void }) {
  const [levels, setLevels] = useState(BLOOM_LEVELS_INIT);
  const [activeLevel, setActiveLevel] = useState<number | null>(3);
  const [selectedMc, setSelectedMc] = useState<number | null>(null);
  const [mcResult, setMcResult] = useState<"correct" | null>(null);
  const [selectedMulti, setSelectedMulti] = useState<Set<number>>(new Set());
  const [multiResult, setMultiResult] = useState<"correct" | "wrong" | null>(null);
  const [writtenAnswers, setWrittenAnswers] = useState<Record<number, string>>({});
  const [evaluating, setEvaluating] = useState<Record<number, boolean>>({});
  const [evalPassed, setEvalPassed] = useState<Record<number, boolean>>({});

  const currentIdx = activeLevel ? levels.findIndex(l => l.level === activeLevel) : -1;
  const currentLevel = currentIdx >= 0 ? levels[currentIdx] : null;

  function passLevel(level: number) {
    addXp(15);
    setLevels(prev => {
      const updated = prev.map(l => {
        if (l.level === level) return { ...l, status: "completed" as const };
        if (l.level === level + 1) return { ...l, status: "active" as const };
        return l;
      });
      return updated;
    });
    const next = level + 1;
    if (next <= 6) setActiveLevel(next);
    else setActiveLevel(null);
    setSelectedMc(null); setMcResult(null);
    setSelectedMulti(new Set()); setMultiResult(null);
  }

  function handleWrittenSubmit(level: number) {
    setEvaluating(p => ({ ...p, [level]: true }));
    setTimeout(() => {
      setEvaluating(p => ({ ...p, [level]: false }));
      setEvalPassed(p => ({ ...p, [level]: true }));
    }, 1800);
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: DK.bg }}>
      <div className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3 border-b"
        style={{ backgroundColor: DK.bg, borderColor: DK.border }}>
        <DarkBackBtn label="Learning Path" onClick={onBack} />
        <div className="flex-1" />
        <span className="text-xs font-semibold" style={{ color: DK.purple }}>Bloom&apos;s Mastery</span>
      </div>

      {/* Level pills */}
      <div className="flex gap-2 px-4 pt-4 pb-2 overflow-x-auto">
        {levels.map(l => (
          <button key={l.level}
            onClick={() => { if (l.status !== "locked") setActiveLevel(l.level); }}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
            style={{
              backgroundColor: l.status === "locked" ? DK.card : l.status === "completed" ? `${BC[l.level]}22` : `${BC[l.level]}33`,
              border: `1.5px solid ${l.status === "locked" ? DK.border : BC[l.level]}`,
              color: l.status === "locked" ? DK.fgMuted : BC[l.level],
              opacity: l.status === "locked" ? 0.5 : 1,
            }}>
            {l.status === "completed" ? "✓ " : l.status === "locked" ? "🔒 " : ""}{BLOOM_LABELS[l.level]}
          </button>
        ))}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {activeLevel === null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-12 px-4">
            <div className="text-5xl mb-4">🌟</div>
            <h2 className="text-xl font-bold mb-2" style={{ color: DK.fg }}>All 6 Bloom levels mastered!</h2>
            <p className="text-sm" style={{ color: DK.fgMuted }}>You&apos;ve demonstrated mastery from recall to creative synthesis.</p>
          </motion.div>
        )}

        {currentLevel && (
          <AnimatePresence mode="wait">
            <motion.div key={activeLevel}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}>

              {/* Level header */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black"
                  style={{ backgroundColor: `${BC[currentLevel.level]}22`, color: BC[currentLevel.level] }}>
                  L{currentLevel.level}
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: BC[currentLevel.level] }}>
                    {BLOOM_LABELS[currentLevel.level]}
                  </p>
                  <p className="text-[10px]" style={{ color: DK.fgMuted }}>+15 XP on pass</p>
                </div>
              </div>

              <p className="font-semibold text-[15px] leading-snug mb-4" style={{ color: DK.fg }}>
                {currentLevel.question}
              </p>

              {/* MC */}
              {currentLevel.type === "mc" && currentLevel.mcOptions && (
                <div>
                  {currentLevel.status === "completed" ? (
                    <div className="p-4 rounded-xl border" style={{ backgroundColor: DK.greenDim, borderColor: DK.green }}>
                      <p className="text-sm font-medium" style={{ color: DK.green }}>✓ Level {currentLevel.level} completed</p>
                      <p className="text-xs mt-1" style={{ color: DK.fgMuted }}>{currentLevel.feedback}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {currentLevel.mcOptions.map((opt, oi) => {
                        const isSel = selectedMc === oi;
                        const isCorrect = mcResult === "correct" && isSel;
                        return (
                          <button key={oi} onClick={() => {
                            if (mcResult === "correct") return;
                            setSelectedMc(oi);
                            if (oi === currentLevel.mcCorrect) {
                              setMcResult("correct");
                              setTimeout(() => passLevel(currentLevel.level), 1000);
                            }
                          }}
                            className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all"
                            style={{
                              backgroundColor: isCorrect ? DK.greenDim : isSel && mcResult !== "correct" ? DK.redDim : DK.card,
                              border: `1.5px solid ${isCorrect ? DK.green : isSel && mcResult !== "correct" ? DK.red : DK.border}`,
                              color: isCorrect ? DK.green : DK.fg,
                            }}>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Multi-select */}
              {currentLevel.type === "multi-select" && currentLevel.multiOptions && (
                <div>
                  {currentLevel.status === "completed" ? (
                    <div className="p-4 rounded-xl border" style={{ backgroundColor: DK.greenDim, borderColor: DK.green }}>
                      <p className="text-sm font-medium" style={{ color: DK.green }}>✓ Level {currentLevel.level} completed</p>
                      <p className="text-xs mt-1" style={{ color: DK.fgMuted }}>{currentLevel.feedback}</p>
                    </div>
                  ) : (
                    <div>
                      <div className="space-y-2 mb-4">
                        {currentLevel.multiOptions.map((opt, oi) => {
                          const isSel = selectedMulti.has(oi);
                          return (
                            <button key={oi}
                              onClick={() => {
                                if (multiResult === "correct") return;
                                setSelectedMulti(prev => {
                                  const next = new Set(prev);
                                  if (next.has(oi)) next.delete(oi); else next.add(oi);
                                  return next;
                                });
                                setMultiResult(null);
                              }}
                              className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 transition-all"
                              style={{
                                backgroundColor: isSel ? DK.purpleDim : DK.card,
                                border: `1.5px solid ${isSel ? DK.purple : DK.border}`,
                                color: DK.fg,
                              }}>
                              <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: isSel ? DK.purple : "transparent", border: `1.5px solid ${isSel ? DK.purple : DK.border}` }}>
                                {isSel && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                              </div>
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                      {multiResult === "wrong" && <p className="text-xs mb-2" style={{ color: DK.red }}>Not quite — re-read the question.</p>}
                      {multiResult !== "correct" && (
                        <button onClick={() => {
                          const opts = currentLevel.multiOptions!;
                          const correctSet = new Set(opts.map((o, i) => o.correct ? i : -1).filter(i => i >= 0));
                          const ok = selectedMulti.size === correctSet.size && Array.from(selectedMulti).every(i => correctSet.has(i));
                          if (ok) { setMultiResult("correct"); setTimeout(() => passLevel(currentLevel.level), 1000); }
                          else { setMultiResult("wrong"); setTimeout(() => { setMultiResult(null); setSelectedMulti(new Set()); }, 1000); }
                        }}
                          disabled={selectedMulti.size === 0}
                          className="px-6 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-40"
                          style={{ backgroundColor: DK.purple }}>
                          Check answers
                        </button>
                      )}
                      {multiResult === "correct" && (
                        <div className="p-3 rounded-xl border" style={{ backgroundColor: DK.greenDim, borderColor: DK.green }}>
                          <p className="text-sm font-medium" style={{ color: DK.green }}>✓ Correct!</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Written */}
              {currentLevel.type === "written" && (
                <div>
                  {currentLevel.status === "completed" ? (
                    <div className="p-4 rounded-xl border" style={{ backgroundColor: DK.greenDim, borderColor: DK.green }}>
                      <p className="text-sm font-medium" style={{ color: DK.green }}>✓ Level {currentLevel.level} completed</p>
                      <p className="text-xs mt-1" style={{ color: DK.fgMuted }}>{currentLevel.feedback}</p>
                    </div>
                  ) : evalPassed[currentLevel.level] ? (
                    <div>
                      <div className="p-4 rounded-xl border mb-3" style={{ backgroundColor: DK.greenDim, borderColor: DK.green }}>
                        <p className="text-sm font-medium mb-1" style={{ color: DK.green }}>AI Feedback</p>
                        <p className="text-sm" style={{ color: DK.fgMuted }}>{currentLevel.feedback}</p>
                      </div>
                      <button onClick={() => passLevel(currentLevel.level)}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                        style={{ backgroundColor: DK.green }}>
                        I understand — continue +15 XP
                      </button>
                    </div>
                  ) : evaluating[currentLevel.level] ? (
                    <div className="flex items-center gap-2 py-4">
                      <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: DK.purple, borderTopColor: "transparent" }} />
                      <p className="text-sm" style={{ color: DK.fgMuted }}>Evaluating your response…</p>
                    </div>
                  ) : (
                    <div>
                      <textarea
                        value={writtenAnswers[currentLevel.level] ?? ""}
                        onChange={e => setWrittenAnswers(p => ({ ...p, [currentLevel.level]: e.target.value }))}
                        placeholder="Write your response here…"
                        rows={5}
                        className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none mb-2"
                        style={{
                          backgroundColor: DK.card, border: `1.5px solid ${DK.border}`,
                          color: DK.fg,
                        }} />
                      <div className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: DK.fgMuted }}>
                          {(writtenAnswers[currentLevel.level] ?? "").split(/\s+/).filter(Boolean).length} / {currentLevel.minWords ?? 25} words
                        </span>
                        <button
                          onClick={() => handleWrittenSubmit(currentLevel.level)}
                          disabled={(writtenAnswers[currentLevel.level] ?? "").split(/\s+/).filter(Boolean).length < (currentLevel.minWords ?? 25)}
                          className="px-5 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-40 transition-all"
                          style={{ backgroundColor: DK.purple }}>
                          Submit
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CoursesPage() {
  const [view, setView] = useState<ViewType>("list");
  const [xp, setXp] = useState(1240);
  const [streak] = useState(7);

  function addXp(n: number) { setXp(p => p + n); }

  return (
    <>
      {view === "list" && (
        <CourseListView onOpenCourse={(id) => { if (id === "c1") setView("course"); }} />
      )}
      {view === "course" && (
        <BrilliantCourseView
          onBack={() => setView("list")}
          onStartLesson={() => setView("lesson")}
          onGoExercises={() => setView("exercises")}
          onGoBloom={() => setView("bloom")}
          xp={xp} streak={streak}
        />
      )}
      {view === "lesson" && (
        <LessonReadingView
          onBack={() => setView("course")}
          onComplete={() => setView("exercises")}
          addXp={addXp}
        />
      )}
      {view === "exercises" && (
        <ExercisesView
          onBack={() => setView("course")}
          onComplete={() => setView("bloom")}
          addXp={addXp}
        />
      )}
      {view === "bloom" && (
        <BloomQuizView onBack={() => setView("course")} addXp={addXp} />
      )}
    </>
  );
}
