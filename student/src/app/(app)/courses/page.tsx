"use client";

import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Exact color system from spec ──────────────────────────────────────────────
const C = {
  pageBg:      "#0d1117",
  surface:     "#161b22",
  activeRow:   "#1f2937",
  border:      "#21262d",
  hover:       "#1c2128",
  muted:       "#8b949e",
  body:        "#c9d1d9",
  heading:     "#e6edf3",
  dimmed:      "#484f58",
  blue:        "#58a6ff",
  green:       "#3fb950",
  red:         "#f85149",
  completeBg:  "#0d2218",
  activeBg:    "#1f2d4a",
  lockedBg:    "#21262d",
  greenBorder: "#1a4730",
  redBg:       "#1c1117",
  redBorder:   "#3d1a1a",
  checkGreen:  "#238636",
  checkGreenH: "#2ea043",
  checkBlue:   "#1f6feb",
  checkBlueH:  "#388bfd",
  checkWrong:  "#9e2a2b",
};

type View = "courses" | "lesson" | "exercise";
type LessonMode = "pick" | "video" | "read";
type LessonStatus = "complete" | "active" | "locked";

// ── Data ──────────────────────────────────────────────────────────────────────
const BIO_UNITS = [
  {
    unit: "Unit 1 · Cell Biology",
    lessons: [
      { id: "l1", title: "Cell theory",                 hours: 6,  status: "complete" as LessonStatus },
      { id: "l2", title: "Prokaryotes vs. eukaryotes",  hours: 7,  status: "complete" as LessonStatus },
      { id: "l3", title: "Organelles",                  hours: 8,  status: "active"   as LessonStatus, level: 3, totalLevels: 6 },
      { id: "l4", title: "Cell membrane",               hours: 12, status: "locked"   as LessonStatus },
      { id: "l5", title: "Cell division",               hours: 14, status: "locked"   as LessonStatus },
    ],
  },
  {
    unit: "Unit 2 · Genetics",
    lessons: [
      { id: "l6", title: "Mendelian genetics",          hours: 12, status: "locked"   as LessonStatus },
    ],
  },
];

const SIDEBAR_SECTIONS = [
  { label: "Introduction",       state: "done"    as const },
  { label: "The power plant",    state: "done"    as const },
  { label: "The factory",        state: "active"  as const },
  { label: "The shipping dept.", state: "upcoming" as const },
  { label: "The control room",   state: "upcoming" as const },
  { label: "Practice problems",  state: "upcoming" as const },
  { label: "Quiz",               state: "upcoming" as const },
];

type ExOptState = "idle" | "sel" | "correct" | "wrong";

// ── Icon SVGs ─────────────────────────────────────────────────────────────────
function LessonIcon({ status }: { status: LessonStatus }) {
  const bg     = status === "complete" ? C.completeBg : status === "active" ? C.activeBg : C.lockedBg;
  const stroke = status === "complete" ? C.green      : status === "active" ? C.blue     : C.dimmed;
  return (
    <div style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: bg }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {status === "complete" && <polyline points="20 6 9 17 4 12" />}
        {status === "active"   && <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>}
        {status === "locked"   && <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></>}
      </svg>
    </div>
  );
}

// ── Inline MC question (Brilliant&apos;s gating mechanic) ─────────────────────────
function InlineQuestion({
  id, label, question, options, correctIndex, onUnlock,
}: {
  id: string; label: string; question: string; options: string[];
  correctIndex: number; onUnlock: () => void;
}) {
  const [sel,         setSel]         = useState<number | null>(null);
  const [done,        setDone]        = useState(false);
  const [btnHover,    setBtnHover]    = useState(false);
  const [optHover,    setOptHover]    = useState<number | null>(null);

  function getOptState(i: number): ExOptState {
    if (!done) return sel === i ? "sel" : "idle";
    if (i === correctIndex) return "correct";
    if (i === sel && sel !== correctIndex) return "wrong";
    return "idle";
  }

  const optStyle = (state: ExOptState, isHover: boolean): React.CSSProperties => {
    if (state === "correct") return { borderColor: C.green, backgroundColor: "#0d2218", color: C.green };
    if (state === "wrong")   return { borderColor: C.red,   backgroundColor: C.redBg,  color: C.red   };
    if (state === "sel")     return { borderColor: C.blue,  backgroundColor: C.activeBg, color: C.heading };
    if (isHover && !done)    return { borderColor: "#30363d", backgroundColor: C.hover, color: C.heading };
    return { borderColor: C.border, backgroundColor: "transparent", color: C.muted };
  };

  const badgeStyle = (state: ExOptState): React.CSSProperties => {
    if (state === "correct") return { backgroundColor: C.green, borderColor: C.green, color: "#fff" };
    if (state === "wrong")   return { backgroundColor: C.red,   borderColor: C.red,   color: "#fff" };
    if (state === "sel")     return { backgroundColor: C.blue,  borderColor: C.blue,  color: "#fff" };
    return { backgroundColor: "transparent", borderColor: "#30363d", color: C.muted };
  };

  const isCorrect = done && sel === correctIndex;
  const isWrong   = done && sel !== null && sel !== correctIndex;

  let btnBg = C.border;
  let btnColor = C.dimmed;
  let btnCursor = "not-allowed";
  if (sel !== null && !done) {
    btnBg = C.checkGreen; btnColor = "#fff"; btnCursor = "pointer";
    if (btnHover) btnBg = C.checkGreenH;
  }
  if (isCorrect) {
    btnBg = C.checkBlue; btnColor = "#fff"; btnCursor = "pointer";
    if (btnHover) btnBg = C.checkBlueH;
  }
  if (isWrong) {
    btnBg = C.checkWrong; btnColor = "#fff"; btnCursor = "pointer";
  }

  function handleCheck() {
    if (sel === null || done) return;
    setDone(true);
  }

  function handleAction() {
    if (isCorrect) { onUnlock(); return; }
    if (isWrong) {
      // try again
      setSel(null);
      setDone(false);
      return;
    }
    handleCheck();
  }

  return (
    <div style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20 }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 500, color: C.heading, lineHeight: 1.5, marginBottom: 16 }}>
        {question}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
        {options.map((opt, i) => {
          const state = getOptState(i);
          const isHov = optHover === i;
          return (
            <div key={`${id}-opt-${i}`}
              onClick={() => { if (!done) setSel(i); }}
              onMouseEnter={() => setOptHover(i)}
              onMouseLeave={() => setOptHover(null)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8, border: `1px solid ${optStyle(state, isHov).borderColor}`, backgroundColor: optStyle(state, isHov).backgroundColor as string, cursor: done ? "default" : "pointer", transition: "all 0.15s" }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", border: `1px solid ${badgeStyle(state).borderColor}`, backgroundColor: badgeStyle(state).backgroundColor as string, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: badgeStyle(state).color as string, flexShrink: 0 }}>
                {String.fromCharCode(65 + i)}
              </div>
              <span style={{ fontSize: 13, color: optStyle(state, isHov).color as string }}>
                {opt}
              </span>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleAction}
        onMouseEnter={() => setBtnHover(true)}
        onMouseLeave={() => setBtnHover(false)}
        disabled={sel === null && !done}
        style={{ padding: "10px 24px", backgroundColor: btnBg, color: btnColor, border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: btnCursor, fontFamily: "inherit", transition: "background 0.15s" }}>
        {isCorrect ? "Continue reading" : isWrong ? "Try again" : "Check"}
      </button>

      {done && (
        <div style={{ marginTop: 10, padding: "12px 14px", borderRadius: 8, fontSize: 13, lineHeight: 1.6,
          backgroundColor: isCorrect ? C.completeBg : C.redBg,
          border: `1px solid ${isCorrect ? C.greenBorder : C.redBorder}`,
          color: isCorrect ? C.green : C.red,
        }}>
          {isCorrect ? (
            <><strong>Correct.</strong> Ribosomes are the protein-making machines. When they attach to the ER surface, they give it that granular, rough appearance.</>
          ) : (
            <><strong>Not quite.</strong> Look at a diagram of rough ER — notice the bumpy surface texture. Those bumps are separate structures docked onto the membrane.</>
          )}
        </div>
      )}
    </div>
  );
}

// ── Apply-it question (second inline question) ────────────────────────────────
function ApplyItQuestion({ onNext }: { onNext: () => void }) {
  const options = ["Smooth ER", "Vacuole", "Rough ER", "Lysosome"];
  const correctIndex = 2;

  const [sel,      setSel]      = useState<number | null>(null);
  const [done,     setDone]     = useState(false);
  const [btnHover, setBtnHover] = useState(false);
  const [optHover, setOptHover] = useState<number | null>(null);

  function getOptState(i: number): ExOptState {
    if (!done) return sel === i ? "sel" : "idle";
    if (i === correctIndex) return "correct";
    if (i === sel && sel !== correctIndex) return "wrong";
    return "idle";
  }

  const optStyle = (state: ExOptState, isHover: boolean): React.CSSProperties => {
    if (state === "correct") return { borderColor: C.green, backgroundColor: "#0d2218", color: C.green };
    if (state === "wrong")   return { borderColor: C.red,   backgroundColor: C.redBg,  color: C.red };
    if (state === "sel")     return { borderColor: C.blue,  backgroundColor: C.activeBg, color: C.heading };
    if (isHover && !done)    return { borderColor: "#30363d", backgroundColor: C.hover, color: C.heading };
    return { borderColor: C.border, backgroundColor: "transparent", color: C.muted };
  };

  const badgeStyle = (state: ExOptState): React.CSSProperties => {
    if (state === "correct") return { backgroundColor: C.green, borderColor: C.green, color: "#fff" };
    if (state === "wrong")   return { backgroundColor: C.red,   borderColor: C.red,   color: "#fff" };
    if (state === "sel")     return { backgroundColor: C.blue,  borderColor: C.blue,  color: "#fff" };
    return { backgroundColor: "transparent", borderColor: "#30363d", color: C.muted };
  };

  const isCorrect = done && sel === correctIndex;
  const isWrong   = done && sel !== null && sel !== correctIndex;

  let btnBg = C.border; let btnColor = C.dimmed; let btnCursor = "not-allowed";
  if (sel !== null && !done) { btnBg = C.checkGreen; btnColor = "#fff"; btnCursor = "pointer"; if (btnHover) btnBg = C.checkGreenH; }
  if (isCorrect) { btnBg = C.checkBlue; btnColor = "#fff"; btnCursor = "pointer"; if (btnHover) btnBg = C.checkBlueH; }
  if (isWrong)   { btnBg = C.checkWrong; btnColor = "#fff"; btnCursor = "pointer"; }

  function handleAction() {
    if (sel === null) return;
    if (isCorrect) { onNext(); return; }
    if (isWrong) { setSel(null); setDone(false); return; }
    setDone(true);
  }

  return (
    <div style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20 }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Apply it</div>
      <div style={{ fontSize: 14, fontWeight: 500, color: C.heading, lineHeight: 1.5, marginBottom: 16 }}>
        A pancreatic cell secretes large amounts of digestive enzymes. Which organelle would you expect to be especially abundant in this cell?
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
        {options.map((opt, i) => {
          const state = getOptState(i);
          const isHov = optHover === i;
          return (
            <div key={i}
              onClick={() => { if (!done) setSel(i); }}
              onMouseEnter={() => setOptHover(i)}
              onMouseLeave={() => setOptHover(null)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8, border: `1px solid ${optStyle(state, isHov).borderColor}`, backgroundColor: optStyle(state, isHov).backgroundColor as string, cursor: done ? "default" : "pointer", transition: "all 0.15s" }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", border: `1px solid ${badgeStyle(state).borderColor}`, backgroundColor: badgeStyle(state).backgroundColor as string, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: badgeStyle(state).color as string, flexShrink: 0 }}>
                {String.fromCharCode(65 + i)}
              </div>
              <span style={{ fontSize: 13, color: optStyle(state, isHov).color as string }}>{opt}</span>
            </div>
          );
        })}
      </div>
      <button onClick={handleAction} onMouseEnter={() => setBtnHover(true)} onMouseLeave={() => setBtnHover(false)}
        disabled={sel === null && !done}
        style={{ padding: "10px 24px", backgroundColor: btnBg, color: btnColor, border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: btnCursor, fontFamily: "inherit", transition: "background 0.15s" }}>
        {isCorrect ? "Next section" : isWrong ? "Try again" : "Check"}
      </button>
      {done && (
        <div style={{ marginTop: 10, padding: "12px 14px", borderRadius: 8, fontSize: 13, lineHeight: 1.6,
          backgroundColor: isCorrect ? C.completeBg : C.redBg,
          border: `1px solid ${isCorrect ? C.greenBorder : C.redBorder}`,
          color: isCorrect ? C.green : C.red }}>
          {isCorrect ? (
            <><strong>Correct.</strong> Digestive enzymes are proteins — and proteins for export are made on the rough ER. Pancreatic cells are some of the most ER-rich cells in the body.</>
          ) : (
            <><strong>Not quite.</strong> Smooth ER handles lipids and detoxification. This cell is making <em>proteins</em> (enzymes). Which type of ER is specialised for protein production?</>
          )}
        </div>
      )}
    </div>
  );
}

// ── Screen 1: Course home ─────────────────────────────────────────────────────
function CoursesScreen({ onNavigate }: { onNavigate: (v: View) => void }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div style={{ backgroundColor: C.pageBg, display: "flex", flexDirection: "column", flex: 1, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Hero strip */}
      <div style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}`, padding: "20px 24px", flexShrink: 0 }}>
        <div style={{ fontSize: 22, fontWeight: 600, color: C.heading, marginBottom: 6 }}>Biology — Grade 10</div>
        <div style={{ fontSize: 13, fontWeight: 400, color: C.muted }}>30 weeks · 224 study hours · Emma</div>
      </div>

      {/* Lesson list */}
      <div style={{ backgroundColor: C.pageBg, padding: "20px 24px", overflowY: "auto", flex: 1 }}>
        {BIO_UNITS.map((unit, ui) => (
          <div key={ui}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: ui === 0 ? 0 : 20, marginBottom: 10, paddingLeft: 2 }}>
              {unit.unit}
            </div>
            {unit.lessons.map((lesson) => {
              const isActive   = lesson.status === "active";
              const isComplete = lesson.status === "complete";
              const isLocked   = lesson.status === "locked";
              const isHov      = hoveredId === lesson.id && !isLocked;

              return (
                <div
                  key={lesson.id}
                  onClick={() => { if (isActive) onNavigate("lesson"); else if (isComplete) onNavigate("lesson"); }}
                  onMouseEnter={() => setHoveredId(lesson.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 12px", borderRadius: 8, marginBottom: 2,
                    backgroundColor: isActive ? C.activeRow : isHov ? C.hover : "transparent",
                    cursor: isLocked ? "default" : "pointer",
                    transition: "background 0.12s",
                  }}>
                  <LessonIcon status={lesson.status} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: isActive ? 600 : 400, color: isActive ? C.heading : isComplete ? C.muted : C.dimmed, marginBottom: 3, lineHeight: 1.3 }}>
                      {lesson.title}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 400, color: C.muted }}>
                      {lesson.hours}h · {
                        isComplete ? "All levels done" :
                        isActive   ? `In progress · Level ${lesson.level} of ${lesson.totalLevels}` :
                        "Locked"
                      }
                    </div>
                  </div>
                  {isComplete && (
                    <span style={{ backgroundColor: C.completeBg, color: C.green, fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 6, flexShrink: 0, whiteSpace: "nowrap" }}>
                      Complete
                    </span>
                  )}
                  {isActive && (
                    <span style={{ color: C.blue, fontSize: 14, fontWeight: 400, flexShrink: 0, whiteSpace: "nowrap" }}>
                      Continue
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Screen 2: Lesson (mode picker + video + reading) ──────────────────────────
function LessonScreen({ onNavigate }: { onNavigate: (v: View) => void }) {
  const [mode, setMode]                                 = useState<LessonMode>("pick");
  const [proseContinueVisible, setProseContinueVisible] = useState(false);
  const [continueBtnHover, setContinueBtnHover]         = useState(false);
  const [videoPlayed, setVideoPlayed]                   = useState(false);
  const [videoProgress, setVideoProgress]               = useState(0);
  const [videoPlaying, setVideoPlaying]                 = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const videoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startVideo() {
    setVideoPlaying(true);
    if (videoTimerRef.current) clearInterval(videoTimerRef.current);
    videoTimerRef.current = setInterval(() => {
      setVideoProgress((p) => {
        if (p >= 100) {
          clearInterval(videoTimerRef.current!);
          setVideoPlaying(false);
          setVideoPlayed(true);
          return 100;
        }
        return p + 1;
      });
    }, 120);
  }

  function pauseVideo() {
    setVideoPlaying(false);
    if (videoTimerRef.current) clearInterval(videoTimerRef.current);
  }

  // ── Mode picker ──────────────────────────────────────────────────────────────
  if (mode === "pick") {
    return (
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <div style={{ width: 220, backgroundColor: C.surface, borderRight: `1px solid ${C.border}`, overflowY: "auto", flexShrink: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "12px 14px 10px", borderBottom: `1px solid ${C.border}`, marginBottom: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.heading }}>Organelles</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Lesson 3 of 5 · 8h</div>
          </div>
          {SIDEBAR_SECTIONS.map((s, i) => {
            const dotColor  = s.state === "done" ? C.green : s.state === "active" ? C.blue : C.border;
            const textColor = s.state === "done" ? C.green : s.state === "active" ? C.blue : C.muted;
            return <SidebarItem key={i} label={s.label} dotColor={dotColor} textColor={textColor} isActive={s.state === "active"} />;
          })}
        </div>

        {/* Picker */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", gap: 24, backgroundColor: C.pageBg }}>
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <div style={{ fontSize: 20, fontWeight: 600, color: C.heading, marginBottom: 6 }}>The protein factory</div>
            <div style={{ fontSize: 13, color: C.muted }}>Choose how you&apos;d like to learn this section</div>
          </div>
          <div style={{ display: "flex", gap: 16, width: "100%", maxWidth: 560 }}>
            {/* Watch card */}
            <button onClick={() => setMode("video")}
              style={{ flex: 1, border: `1.5px solid ${C.border}`, borderRadius: 12, backgroundColor: C.surface, padding: "28px 20px", cursor: "pointer", textAlign: "left", transition: "border-color 0.15s, background 0.15s", fontFamily: "inherit" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.blue; (e.currentTarget as HTMLButtonElement).style.backgroundColor = C.activeRow; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.border; (e.currentTarget as HTMLButtonElement).style.backgroundColor = C.surface; }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "#1f2d4a", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke={C.blue} strokeWidth="1.5"/>
                  <polygon points="10,8 18,12 10,16" fill={C.blue}/>
                </svg>
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.heading, marginBottom: 6 }}>Watch lesson</div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>Video lecture with narration and animated diagrams</div>
              <div style={{ marginTop: 12, fontSize: 11, color: C.blue }}>~12 min</div>
            </button>

            {/* Read card */}
            <button onClick={() => setMode("read")}
              style={{ flex: 1, border: `1.5px solid ${C.border}`, borderRadius: 12, backgroundColor: C.surface, padding: "28px 20px", cursor: "pointer", textAlign: "left", transition: "border-color 0.15s, background 0.15s", fontFamily: "inherit" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.green; (e.currentTarget as HTMLButtonElement).style.backgroundColor = C.activeRow; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.border; (e.currentTarget as HTMLButtonElement).style.backgroundColor = C.surface; }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: C.completeBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke={C.green} strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke={C.green} strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="9" y1="7" x2="15" y2="7" stroke={C.green} strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="9" y1="11" x2="15" y2="11" stroke={C.green} strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.heading, marginBottom: 6 }}>Read lesson</div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>Interactive reading with inline questions and diagrams</div>
              <div style={{ marginTop: 12, fontSize: 11, color: C.green }}>~20 min</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Video mode ───────────────────────────────────────────────────────────────
  if (mode === "video") {
    const totalSec = 720; // 12 min
    const elapsed  = Math.round((videoProgress / 100) * totalSec);
    const fmt = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

    const chapters = [
      { pct: 0,  label: "Introduction" },
      { pct: 18, label: "Cell membrane overview" },
      { pct: 38, label: "Endoplasmic reticulum" },
      { pct: 60, label: "Golgi apparatus" },
      { pct: 80, label: "Ribosomes" },
    ];

    return (
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <div style={{ width: 220, backgroundColor: C.surface, borderRight: `1px solid ${C.border}`, overflowY: "auto", flexShrink: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "12px 14px 10px", borderBottom: `1px solid ${C.border}`, marginBottom: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.heading }}>Organelles</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Lesson 3 of 5 · 8h</div>
          </div>
          {/* Mode switcher */}
          <div style={{ padding: "8px 10px", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={() => setMode("video")}
                style={{ flex: 1, padding: "5px 0", fontSize: 11, fontWeight: 600, borderRadius: 6, border: "none", cursor: "pointer", backgroundColor: "#1f2d4a", color: C.blue, fontFamily: "inherit" }}>
                Watch
              </button>
              <button onClick={() => setMode("read")}
                style={{ flex: 1, padding: "5px 0", fontSize: 11, fontWeight: 400, borderRadius: 6, border: "none", cursor: "pointer", backgroundColor: "transparent", color: C.muted, fontFamily: "inherit" }}>
                Read
              </button>
            </div>
          </div>
          {SIDEBAR_SECTIONS.map((s, i) => {
            const dotColor  = s.state === "done" ? C.green : s.state === "active" ? C.blue : C.border;
            const textColor = s.state === "done" ? C.green : s.state === "active" ? C.blue : C.muted;
            return <SidebarItem key={i} label={s.label} dotColor={dotColor} textColor={textColor} isActive={s.state === "active"} />;
          })}
        </div>

        {/* Video content */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 24px 60px", backgroundColor: C.pageBg }}>
          {/* Progress */}
          <div style={{ width: "100%", maxWidth: 700, display: "flex", alignItems: "center", gap: 12, marginBottom: 28, flexShrink: 0 }}>
            <div style={{ flex: 1, height: 4, backgroundColor: C.border, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ width: "38%", height: 4, borderRadius: 2, backgroundColor: C.blue }} />
            </div>
            <div style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap" }}>3 of 7 sections</div>
          </div>

          <div style={{ width: "100%", maxWidth: 700, display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ fontSize: 20, fontWeight: 600, color: C.heading }}>The protein factory</div>

            {/* Video player */}
            <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${C.border}`, backgroundColor: "#0a0d12" }}>
              {/* Thumbnail / video area */}
              <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", backgroundColor: "#080c11", overflow: "hidden" }}>
                {/* Animated background representing video content */}
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {/* Cell illustration backdrop */}
                  <svg width="100%" height="100%" viewBox="0 0 700 394" style={{ opacity: videoPlayed || videoProgress > 0 ? 0.3 : 0.15, transition: "opacity 0.5s" }}>
                    <ellipse cx="350" cy="197" rx="320" ry="180" fill="#0f1520" stroke="#30363d" strokeWidth="2" />
                    <ellipse cx="200" cy="180" rx="70" ry="60" fill="#0e1e3a" stroke="#388bfd" strokeWidth="1.5" strokeDasharray="5 3" />
                    <circle cx="195" cy="175" r="16" fill="#152847" stroke="#58a6ff" strokeWidth="1" />
                    {[0,1,2].map(i => <path key={i} d={`M250 ${120+i*18} Q290 ${110+i*18} 330 ${120+i*18} Q370 ${130+i*18} 410 ${120+i*18}`} fill="none" stroke="#388bfd" strokeWidth="1.5"/>)}
                    <ellipse cx="250" cy="300" rx="35" ry="18" fill="#0d2010" stroke="#3fb950" strokeWidth="1.5"/>
                    <ellipse cx="400" cy="300" rx="25" ry="12" fill="#0d2010" stroke="#3fb950" strokeWidth="1.5" transform="rotate(-15 400 300)"/>
                  </svg>
                  {/* Play button or playing indicator */}
                  {!videoPlaying ? (
                    <button onClick={startVideo}
                      style={{ position: "absolute", width: 64, height: 64, borderRadius: "50%", backgroundColor: "rgba(88,166,255,0.15)", border: "2px solid #58a6ff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", backdropFilter: "blur(4px)", transition: "background 0.15s" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(88,166,255,0.25)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(88,166,255,0.15)"; }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <polygon points="5,3 19,12 5,21" fill="#58a6ff"/>
                      </svg>
                    </button>
                  ) : (
                    <button onClick={pauseVideo}
                      style={{ position: "absolute", width: 64, height: 64, borderRadius: "50%", backgroundColor: "rgba(88,166,255,0.15)", border: "2px solid #58a6ff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", backdropFilter: "blur(4px)" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <rect x="6" y="4" width="4" height="16" fill="#58a6ff" rx="1"/>
                        <rect x="14" y="4" width="4" height="16" fill="#58a6ff" rx="1"/>
                      </svg>
                    </button>
                  )}
                  {/* Chapter label */}
                  {videoProgress > 0 && (
                    <div style={{ position: "absolute", top: 12, left: 14, fontSize: 11, fontWeight: 600, color: C.heading, backgroundColor: "rgba(13,17,23,0.8)", padding: "4px 10px", borderRadius: 6 }}>
                      {[...chapters].reverse().find(ch => videoProgress >= ch.pct)?.label ?? "Introduction"}
                    </div>
                  )}
                  {videoPlayed && (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(13,17,23,0.6)", flexDirection: "column", gap: 10 }}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={C.green} strokeWidth="1.5"/><polyline points="8,12 11,15 16,9" stroke={C.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.green }}>Video complete</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Controls bar */}
              <div style={{ padding: "10px 14px", backgroundColor: "#0d1117", borderTop: `1px solid ${C.border}` }}>
                {/* Progress bar */}
                <div style={{ position: "relative", height: 4, backgroundColor: C.border, borderRadius: 2, marginBottom: 10, cursor: "pointer", overflow: "hidden" }}
                  onClick={(e) => {
                    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                    const pct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                    setVideoProgress(Math.min(100, Math.max(0, pct)));
                    if (pct >= 100) setVideoPlayed(true);
                  }}>
                  <div style={{ width: `${videoProgress}%`, height: "100%", backgroundColor: C.blue, borderRadius: 2, transition: "width 0.1s" }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button onClick={videoPlaying ? pauseVideo : startVideo}
                    style={{ width: 28, height: 28, border: "none", backgroundColor: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, color: C.heading }}>
                    {videoPlaying
                      ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="6" y="4" width="4" height="16" fill={C.heading} rx="1"/><rect x="14" y="4" width="4" height="16" fill={C.heading} rx="1"/></svg>
                      : <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><polygon points="5,3 19,12 5,21" fill={C.heading}/></svg>}
                  </button>
                  <div style={{ fontSize: 12, color: C.muted, fontVariantNumeric: "tabular-nums" }}>
                    {fmt(elapsed)} / {fmt(totalSec)}
                  </div>
                  <div style={{ flex: 1 }} />
                  <div style={{ fontSize: 11, color: C.muted }}>The protein factory · Organelles</div>
                </div>
              </div>
            </div>

            {/* Chapter list */}
            <div style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
              <div style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: `1px solid ${C.border}` }}>
                Chapters
              </div>
              {chapters.map((ch, i) => {
                const chElapsed = videoProgress >= ch.pct;
                const nextPct = chapters[i+1]?.pct ?? 100;
                const isPlaying = videoProgress >= ch.pct && videoProgress < nextPct;
                return (
                  <div key={i} onClick={() => setVideoProgress(ch.pct)}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderBottom: i < chapters.length-1 ? `1px solid ${C.border}` : "none",
                      cursor: "pointer", backgroundColor: isPlaying ? C.activeRow : "transparent", transition: "background 0.12s" }}>
                    <div style={{ fontSize: 11, color: C.muted, width: 28, flexShrink: 0 }}>{fmt(Math.round((ch.pct/100)*totalSec))}</div>
                    <div style={{ fontSize: 13, color: isPlaying ? C.heading : chElapsed ? C.muted : C.dimmed, fontWeight: isPlaying ? 500 : 400 }}>{ch.label}</div>
                    {chElapsed && !isPlaying && (
                      <svg style={{ marginLeft: "auto" }} width="14" height="14" viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12" stroke={C.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    )}
                    {isPlaying && <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", backgroundColor: C.blue }} />}
                  </div>
                );
              })}
            </div>

            {/* Key takeaways */}
            <div style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.blue}`, borderRadius: "0 8px 8px 0", padding: "14px 16px", fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
              <strong style={{ color: C.blue }}>Key takeaways:</strong> The rough ER manufactures proteins via ribosomes. The Golgi apparatus packages and ships them. The smooth ER handles lipid synthesis and detoxification.
            </div>

            {/* Continue button — only after some progress */}
            {(videoPlayed || videoProgress >= 80) && (
              <div style={{ display: "flex", justifyContent: "center", paddingTop: 8, paddingBottom: 40 }}>
                <button
                  onMouseEnter={() => setContinueBtnHover(true)}
                  onMouseLeave={() => setContinueBtnHover(false)}
                  onClick={() => onNavigate("exercise")}
                  style={{ padding: "12px 40px", backgroundColor: continueBtnHover ? C.checkGreenH : C.checkGreen, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s" }}>
                  Continue to exercise
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden", fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* Sidebar */}
      <div style={{ width: 220, backgroundColor: C.surface, borderRight: `1px solid ${C.border}`, overflowY: "auto", flexShrink: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "12px 14px 10px", borderBottom: `1px solid ${C.border}`, marginBottom: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.heading }}>Organelles</div>
          <div style={{ fontSize: 11, fontWeight: 400, color: C.muted, marginTop: 2 }}>Lesson 3 of 5 · 8h</div>
        </div>
        {SIDEBAR_SECTIONS.map((s, i) => {
          const dotColor = s.state === "done" ? C.green : s.state === "active" ? C.blue : C.border;
          const textColor = s.state === "done" ? C.green : s.state === "active" ? C.blue : C.muted;
          const isActiveSec = s.state === "active";
          return (
            <SidebarItem key={i} label={s.label} dotColor={dotColor} textColor={textColor} isActive={isActiveSec} />
          );
        })}
      </div>

      {/* Main scrollable area */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 24px 80px" }}>

        {/* Progress bar */}
        <div style={{ width: "100%", maxWidth: 640, display: "flex", alignItems: "center", gap: 12, marginBottom: 28, flexShrink: 0 }}>
          <div style={{ flex: 1, height: 4, backgroundColor: C.border, borderRadius: 2, overflow: "hidden" }}>
            <div style={{ width: "38%", height: 4, borderRadius: 2, backgroundColor: C.blue, transition: "width 0.4s" }} />
          </div>
          <div style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap" }}>3 of 7 sections</div>
        </div>

        {/* Content column */}
        <div style={{ width: "100%", maxWidth: 640, display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Heading */}
          <div style={{ fontSize: 20, fontWeight: 600, color: C.heading, lineHeight: 1.3 }}>
            The protein factory
          </div>

          {/* Cell illustration */}
          <div style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: `1px solid ${C.border}` }}>
              Inside an animal cell
            </div>
            <div style={{ padding: "20px 16px", display: "flex", justifyContent: "center", backgroundColor: "#0d1117" }}>
              <svg width="100%" viewBox="0 0 580 340" style={{ maxWidth: 580 }}>

                {/* Cell membrane */}
                <ellipse cx="290" cy="170" rx="272" ry="155" fill="#0f1520" stroke="#30363d" strokeWidth="2.5" />

                {/* Cytoplasm fill */}
                <ellipse cx="290" cy="170" rx="268" ry="151" fill="#0d1421" />

                {/* ── Nucleus ── */}
                <ellipse cx="118" cy="165" rx="72" ry="62" fill="#0e1e3a" stroke="#388bfd" strokeWidth="2" strokeDasharray="6 3" />
                {/* Nuclear pores */}
                {[[-30,0],[30,0],[0,-45],[0,45],[-22,-35],[22,-35],[-22,35],[22,35]].map(([dx,dy],i) => (
                  <circle key={i} cx={118+(dx??0)} cy={165+(dy??0)} r="4" fill="#0e1e3a" stroke="#388bfd" strokeWidth="1.5" />
                ))}
                {/* Nucleolus */}
                <circle cx="112" cy="160" r="18" fill="#152847" stroke="#58a6ff" strokeWidth="1" />
                <text x="112" y="164" textAnchor="middle" fontSize="8" fill="#58a6ff" fontWeight="600">nucleolus</text>
                <text x="118" y="240" textAnchor="middle" fontSize="10" fill="#58a6ff" fontWeight="600">Nucleus</text>
                {/* Label line */}
                <line x1="118" y1="228" x2="118" y2="232" stroke="#58a6ff" strokeWidth="1" strokeOpacity="0.5" />

                {/* ── Rough ER (right of nucleus) ── */}
                {/* Wavy paired membranes with ribosome dots */}
                <path d="M205 110 Q225 100 245 112 Q265 124 285 112 Q305 100 325 112 Q345 124 365 110" fill="none" stroke="#388bfd" strokeWidth="2" />
                <path d="M205 124 Q225 114 245 126 Q265 138 285 126 Q305 114 325 126 Q345 138 365 124" fill="none" stroke="#388bfd" strokeWidth="2" />
                {/* Ribosomes on first pair */}
                {[210,225,240,255,270,285,300,315,330,348].map((x,i) => (
                  <circle key={i} cx={x} cy={107 + (i%2)*3} r="3.5" fill="#3fb950" />
                ))}

                <path d="M205 142 Q225 132 245 144 Q265 156 285 144 Q305 132 325 144 Q345 156 365 142" fill="none" stroke="#388bfd" strokeWidth="2" />
                <path d="M205 156 Q225 146 245 158 Q265 170 285 158 Q305 146 325 158 Q345 170 365 156" fill="none" stroke="#388bfd" strokeWidth="2" />
                {/* Ribosomes on second pair */}
                {[210,226,242,258,274,290,306,322,338,354].map((x,i) => (
                  <circle key={i} cx={x} cy={139 + (i%2)*3} r="3.5" fill="#3fb950" />
                ))}

                <path d="M205 174 Q225 164 245 176 Q265 188 285 176 Q305 164 325 176 Q345 188 365 174" fill="none" stroke="#388bfd" strokeWidth="2" />
                <path d="M205 188 Q225 178 245 190 Q265 202 285 190 Q305 178 325 190 Q345 202 365 188" fill="none" stroke="#388bfd" strokeWidth="2" />
                {/* Ribosomes on third pair */}
                {[212,228,244,260,276,292,308,324,340,356].map((x,i) => (
                  <circle key={i} cx={x} cy={171 + (i%2)*3} r="3.5" fill="#3fb950" />
                ))}

                {/* Rough ER label */}
                <text x="285" y="76" textAnchor="middle" fontSize="10" fill="#388bfd" fontWeight="600">Rough ER</text>
                <line x1="285" y1="79" x2="285" y2="104" stroke="#388bfd" strokeWidth="1" strokeOpacity="0.5" strokeDasharray="3 2" />
                {/* Ribosome legend dot */}
                <circle cx="248" cy="74" r="3.5" fill="#3fb950" />
                <text x="254" y="78" fontSize="9" fill="#3fb950">ribosomes</text>

                {/* ── Smooth ER (lower right) ── */}
                <path d="M390 190 Q415 178 440 194 Q465 210 490 194" fill="none" stroke="#d2a8ff" strokeWidth="2" />
                <path d="M390 208 Q415 196 440 212 Q465 228 490 212" fill="none" stroke="#d2a8ff" strokeWidth="2" />
                <path d="M395 226 Q420 214 445 230 Q470 246 492 230" fill="none" stroke="#d2a8ff" strokeWidth="2" />
                <path d="M395 244 Q420 232 445 248 Q470 264 492 248" fill="none" stroke="#d2a8ff" strokeWidth="2" />
                {/* Smooth ER label */}
                <text x="442" y="283" textAnchor="middle" fontSize="10" fill="#d2a8ff" fontWeight="600">Smooth ER</text>
                <line x1="442" y1="266" x2="442" y2="279" stroke="#d2a8ff" strokeWidth="1" strokeOpacity="0.5" strokeDasharray="3 2" />

                {/* ── Golgi apparatus ── */}
                {[0,1,2,3,4].map(i => (
                  <path key={i}
                    d={`M420 ${112 + i*10} Q440 ${106 + i*10} 460 ${112 + i*10} Q480 ${118 + i*10} 500 ${112 + i*10}`}
                    fill="none" stroke="#e3b341" strokeWidth={i===0||i===4 ? 1.5 : 2.5} strokeOpacity={i===0||i===4 ? 0.5 : 1}
                  />
                ))}
                {/* Vesicle buds */}
                <circle cx="502" cy="118" r="5" fill="none" stroke="#e3b341" strokeWidth="1.5" />
                <circle cx="506" cy="128" r="4" fill="none" stroke="#e3b341" strokeWidth="1.5" />
                <text x="460" y="94" textAnchor="middle" fontSize="10" fill="#e3b341" fontWeight="600">Golgi apparatus</text>
                <line x1="460" y1="97" x2="460" y2="108" stroke="#e3b341" strokeWidth="1" strokeOpacity="0.5" strokeDasharray="3 2" />

                {/* ── Mitochondria (bottom) ── */}
                {/* Mito 1 */}
                <ellipse cx="175" cy="268" rx="38" ry="20" fill="#0d2010" stroke="#3fb950" strokeWidth="1.5" />
                <path d="M152 262 Q165 254 175 262 Q185 270 198 262" fill="none" stroke="#3fb950" strokeWidth="1" strokeOpacity="0.6" />
                <path d="M150 270 Q163 262 175 270 Q187 278 200 270" fill="none" stroke="#3fb950" strokeWidth="1" strokeOpacity="0.6" />
                {/* Mito 2 (smaller, rotated) */}
                <ellipse cx="340" cy="272" rx="28" ry="14" fill="#0d2010" stroke="#3fb950" strokeWidth="1.5" transform="rotate(-15 340 272)" />
                <path d="M321 268 Q332 263 340 268 Q348 273 358 268" fill="none" stroke="#3fb950" strokeWidth="1" strokeOpacity="0.6" transform="rotate(-15 340 272)" />
                {/* Mitochondria label */}
                <text x="255" y="302" textAnchor="middle" fontSize="10" fill="#3fb950" fontWeight="600">Mitochondria</text>
                <line x1="213" y1="285" x2="230" y2="297" stroke="#3fb950" strokeWidth="1" strokeOpacity="0.5" strokeDasharray="3 2" />

                {/* ── Free ribosomes (scattered) ── */}
                {[[160,120],[170,200],[210,230],[380,160],[400,240],[350,230],[145,230],[490,165]].map(([x,y],i) => (
                  <circle key={i} cx={x} cy={y} r="3" fill="#3fb950" opacity="0.5" />
                ))}

                {/* ── Cell membrane label ── */}
                <text x="530" y="100" textAnchor="middle" fontSize="9" fill="#8b949e">Cell</text>
                <text x="530" y="111" textAnchor="middle" fontSize="9" fill="#8b949e">membrane</text>
                <line x1="525" y1="105" x2="555" y2="80" stroke="#8b949e" strokeWidth="1" strokeOpacity="0.4" />

              </svg>
            </div>
          </div>

          {/* Prose 1 */}
          <div style={{ fontSize: 15, fontWeight: 400, color: C.body, lineHeight: 1.75 }}>
            You know the mitochondria powers the cell. But all that energy is useless without a way to <strong style={{ color: C.heading, fontWeight: 600 }}>build things</strong>. The cell needs to manufacture proteins constantly — structural proteins, enzymes, hormones, and more.
          </div>

          {/* Prose 2 */}
          <div style={{ fontSize: 15, fontWeight: 400, color: C.body, lineHeight: 1.75 }}>
            That is where the <strong style={{ color: C.heading, fontWeight: 600 }}>endoplasmic reticulum (ER)</strong> comes in. It is a massive network of folded membranes — if you unfolded it completely, it would cover the entire cell surface several times over.
          </div>

          {/* Inline question — gates prose below */}
          <InlineQuestion
            id="q1"
            label="Quick check"
            question="Before reading further — what do you think makes the rough ER look rough under a microscope?"
            options={[
              "It has a bumpy outer membrane",
              "Ribosomes attached to its surface",
              "It produces rough proteins",
              "Its folds create a rough texture",
            ]}
            correctIndex={1}
            onUnlock={() => { setProseContinueVisible(true); setTimeout(() => scrollRef.current && (scrollRef.current.scrollTop += 200), 100); }}
          />

          {/* Gated prose section — revealed after correct answer */}
          {proseContinueVisible && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeIn 0.3s ease-in" }}>
              <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>

              <div style={{ fontSize: 15, fontWeight: 400, color: C.body, lineHeight: 1.75 }}>
                Exactly right. <strong style={{ color: C.heading, fontWeight: 600 }}>Ribosomes</strong> are tiny molecular machines that read genetic instructions and assemble amino acids into proteins. When they dock onto the ER membrane, they give it that rough, granular appearance — hence the name.
              </div>

              {/* Diagram card */}
              <div style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
                <div style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: `1px solid ${C.border}` }}>
                  Rough ER vs smooth ER
                </div>
                <div style={{ padding: 20, display: "flex", justifyContent: "center" }}>
                  <svg width="100%" viewBox="0 0 480 160" style={{ maxWidth: 480 }}>
                    <text x="80"  y="18" textAnchor="middle" fontSize="11" fill={C.muted} fontWeight="600">ROUGH ER</text>
                    <path d="M20 40 Q50 30 80 40 Q110 50 140 40" fill="none" stroke="#388bfd" strokeWidth="2.5" />
                    <path d="M20 60 Q50 50 80 60 Q110 70 140 60" fill="none" stroke="#388bfd" strokeWidth="2.5" />
                    <path d="M20 80 Q50 70 80 80 Q110 90 140 80" fill="none" stroke="#388bfd" strokeWidth="2.5" />
                    <circle cx="35" cy="38" r="4" fill={C.green}/><circle cx="50" cy="33" r="4" fill={C.green}/><circle cx="65" cy="36" r="4" fill={C.green}/>
                    <circle cx="80" cy="38" r="4" fill={C.green}/><circle cx="95" cy="33" r="4" fill={C.green}/><circle cx="110" cy="37" r="4" fill={C.green}/><circle cx="125" cy="36" r="4" fill={C.green}/>
                    <circle cx="35" cy="58" r="4" fill={C.green}/><circle cx="50" cy="53" r="4" fill={C.green}/><circle cx="65" cy="56" r="4" fill={C.green}/>
                    <circle cx="80" cy="59" r="4" fill={C.green}/><circle cx="95" cy="54" r="4" fill={C.green}/><circle cx="110" cy="57" r="4" fill={C.green}/>
                    <text x="80"  y="130" textAnchor="middle" fontSize="10" fill={C.green}>Ribosomes attached</text>
                    <text x="80"  y="145" textAnchor="middle" fontSize="10" fill={C.muted}>Makes proteins for export</text>
                    <line x1="200" y1="20" x2="200" y2="150" stroke={C.border} strokeWidth="1" strokeDasharray="4 3" />
                    <text x="360" y="18" textAnchor="middle" fontSize="11" fill={C.muted} fontWeight="600">SMOOTH ER</text>
                    <path d="M240 40 Q280 30 320 50 Q360 70 400 55" fill="none" stroke="#d2a8ff" strokeWidth="2.5" />
                    <path d="M240 70 Q280 60 320 80 Q360 100 400 85" fill="none" stroke="#d2a8ff" strokeWidth="2.5" />
                    <path d="M240 100 Q280 90 320 110 Q360 130 400 115" fill="none" stroke="#d2a8ff" strokeWidth="2.5" />
                    <text x="360" y="145" textAnchor="middle" fontSize="10" fill="#d2a8ff">No ribosomes</text>
                    <text x="360" y="157" textAnchor="middle" fontSize="10" fill={C.muted}>Lipids, detox functions</text>
                  </svg>
                </div>
              </div>

              {/* Prose 3 */}
              <div style={{ fontSize: 15, fontWeight: 400, color: C.body, lineHeight: 1.75 }}>
                The <strong style={{ color: C.heading, fontWeight: 600 }}>smooth ER</strong> has no ribosomes and therefore looks smooth. It handles a different set of jobs — making lipids, regulating calcium, and detoxifying drugs in liver cells.
              </div>

              {/* Callout */}
              <div style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.blue}`, borderRadius: "0 8px 8px 0", padding: "14px 16px", fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
                <strong style={{ color: C.blue }}>Why does this matter?</strong> Cells that secrete lots of protein — like pancreatic cells making digestive enzymes, or plasma cells making antibodies — are absolutely packed with rough ER. The more protein a cell exports, the more rough ER it needs.
              </div>

              {/* Apply-it question */}
              <ApplyItQuestion onNext={() => alert("Moving to: The shipping department (Golgi apparatus)...")} />

              {/* Continue to exercise */}
              <div style={{ display: "flex", justifyContent: "center", paddingTop: 8, paddingBottom: 40 }}>
                <button
                  onMouseEnter={() => setContinueBtnHover(true)}
                  onMouseLeave={() => setContinueBtnHover(false)}
                  onClick={() => onNavigate("exercise")}
                  style={{ padding: "12px 40px", backgroundColor: continueBtnHover ? C.checkGreenH : C.checkGreen, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s" }}>
                  Continue
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function SidebarItem({ label, dotColor, textColor, isActive }: { label: string; dotColor: string; textColor: string; isActive: boolean }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 14px", cursor: "pointer", transition: "background 0.1s", fontSize: 12, color: hov && !isActive ? C.heading : textColor, backgroundColor: isActive ? C.activeRow : hov ? C.activeRow : "transparent" }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, backgroundColor: dotColor }} />
      {label}
    </div>
  );
}

// ── Screen 3: Exercise ────────────────────────────────────────────────────────
function ExerciseScreen() {
  const exOptions = [
    { text: "Generating large amounts of ATP for muscle contraction", icon: "⚡", correct: false },
    { text: "Producing and secreting antibody proteins",              icon: "🔬", correct: false },
    { text: "Synthesising lipids or detoxifying substances",          icon: "🧪", correct: true  },
    { text: "Rapidly dividing and replicating DNA",                   icon: "🧬", correct: false },
  ];
  const correctIndex = 2;

  const [sel,          setSel]          = useState<number | null>(null);
  const [done,         setDone]         = useState(false);
  const [shakeIdx,     setShakeIdx]     = useState<number | null>(null);
  const [lives,        setLives]        = useState(3);
  const [redFlash,     setRedFlash]     = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showXpPop,    setShowXpPop]    = useState(false);

  // Stable ambient particles
  const particles = useMemo(() => Array.from({ length: 14 }, (_, i) => ({
    id: i,
    left: `${6 + (i * 7) % 90}%`,
    top:  `${5 + (i * 11) % 88}%`,
    size: 2 + (i % 3),
    dur:  4 + (i % 5),
    delay: -(i * 0.7),
    color: ["#58a6ff33","#3fb95033","#d2a8ff33","#e3b34133"][i % 4],
  })), []);

  // Confetti burst pieces
  const confetti = useMemo(() => Array.from({ length: 22 }, (_, i) => ({
    id: i,
    angle: (i / 22) * 360,
    dist:  70 + (i % 3) * 40,
    color: ["#58a6ff","#3fb950","#d2a8ff","#e3b341","#f78166","#79c0ff"][i % 6],
    size:  5 + (i % 4),
  })), []);

  function getOptState(i: number): ExOptState {
    if (!done) return sel === i ? "sel" : "idle";
    if (i === correctIndex) return "correct";
    if (i === sel && sel !== correctIndex) return "wrong";
    return "idle";
  }

  const isCorrect = done && sel === correctIndex;
  const isWrong   = done && sel !== null && sel !== correctIndex;

  const getColors = (state: ExOptState) => ({
    border: state==="correct" ? C.green : state==="wrong" ? C.red : state==="sel" ? C.blue : C.border,
    bg:     state==="correct" ? "#0d2218" : state==="wrong" ? C.redBg : state==="sel" ? C.activeBg : C.surface,
    text:   state==="correct" ? C.green : state==="wrong" ? C.red : state==="sel" ? C.heading : C.body,
    glow:   state==="correct" ? "0 0 20px rgba(63,185,80,0.35)" : state==="wrong" ? "0 0 20px rgba(248,81,73,0.3)" : state==="sel" ? "0 0 14px rgba(88,166,255,0.25)" : "none",
    bdgBg:  state==="correct" ? C.green : state==="wrong" ? C.red : state==="sel" ? C.blue : "#21262d",
    bdgColor: ["correct","wrong","sel"].includes(state) ? "#fff" : C.muted,
  });

  function handleSelect(i: number) { if (!done) setSel(i); }

  function handleCheck() {
    if (sel === null) return;
    if (isCorrect) { alert("Exercise 3: The Golgi apparatus and protein shipping..."); return; }
    if (isWrong) {
      setShakeIdx(sel); setRedFlash(true); setLives(l => Math.max(0, l - 1));
      setTimeout(() => { setSel(null); setDone(false); setShakeIdx(null); setRedFlash(false); }, 650);
      return;
    }
    setDone(true);
    if (sel === correctIndex) {
      setShowConfetti(true); setShowXpPop(true);
      setTimeout(() => setShowConfetti(false), 1800);
      setTimeout(() => setShowXpPop(false), 2200);
    }
  }

  const btnEnabled = sel !== null;

  return (
    <>
      <style>{`
        @keyframes g-float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes g-pulse   { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:.9;transform:scale(1.08)} }
        @keyframes g-wave    { 0%{transform:translateY(0)} 50%{transform:translateY(-4px)} 100%{transform:translateY(0)} }
        @keyframes g-bob     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes g-spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes g-shake   { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(5px)} }
        @keyframes g-flash   { 0%,100%{opacity:0} 30%{opacity:1} }
        @keyframes g-confetti{ 0%{opacity:1;transform:translate(0,0) scale(1)} 100%{opacity:0;transform:translate(var(--cx),var(--cy)) scale(0.3)} }
        @keyframes g-xppop   { 0%{opacity:0;transform:translateY(0) scale(0.7)} 30%{opacity:1;transform:translateY(-20px) scale(1.1)} 80%{opacity:1;transform:translateY(-40px) scale(1)} 100%{opacity:0;transform:translateY(-60px) scale(0.9)} }
        @keyframes g-nucleus-glow { 0%,100%{filter:drop-shadow(0 0 4px #388bfd66)} 50%{filter:drop-shadow(0 0 12px #388bfdaa)} }
        @keyframes g-dot-in  { from{transform:scaleX(0);transform-origin:left} to{transform:scaleX(1);transform-origin:left} }
        @keyframes g-slidein { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
        @keyframes g-vesicle { 0%{transform:translate(0,0)} 25%{transform:translate(8px,-5px)} 50%{transform:translate(14px,2px)} 75%{transform:translate(6px,8px)} 100%{transform:translate(0,0)} }
      `}</style>

      {/* Red flash overlay on wrong */}
      <AnimatePresence>
        {redFlash && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.12}}
            style={{position:"fixed",inset:0,backgroundColor:"rgba(248,81,73,0.08)",pointerEvents:"none",zIndex:50}} />
        )}
      </AnimatePresence>

      <div style={{ flex:1, display:"flex", flexDirection:"column", backgroundColor:C.pageBg, fontFamily:"system-ui,-apple-system,sans-serif", position:"relative", overflow:"hidden" }}>

        {/* Ambient floating background particles */}
        {particles.map(p => (
          <div key={p.id} style={{ position:"absolute", left:p.left, top:p.top, width:p.size, height:p.size, borderRadius:"50%", backgroundColor:p.color, animation:`g-float ${p.dur}s ${p.delay}s ease-in-out infinite`, pointerEvents:"none", zIndex:0 }} />
        ))}

        {/* Sub-header */}
        <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} transition={{duration:0.3}}
          style={{ position:"relative", zIndex:1, padding:"12px 24px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:12, flexShrink:0, backgroundColor:C.surface }}>

          <div style={{ fontSize:12, color:C.muted, cursor:"pointer" }}>← Organelles</div>
          <div style={{ fontSize:12, fontWeight:600, color:C.muted, flex:1 }}>Exercise 2 of 5</div>

          {/* Lives */}
          <div style={{ display:"flex", gap:4, marginRight:8 }}>
            {[0,1,2].map(i => (
              <motion.div key={i}
                animate={i >= lives ? { scale:[1,1.3,0.8], opacity:0 } : { scale:1, opacity:1 }}
                transition={{ duration:0.4 }}
                style={{ fontSize:14 }}>❤️</motion.div>
            ))}
          </div>

          {/* Progress dots */}
          <div style={{ display:"flex", gap:4 }}>
            {[0,1,2,3,4].map(i => (
              <motion.div key={i}
                initial={{ scaleX:0 }} animate={{ scaleX:1 }}
                transition={{ duration:0.35, delay:i*0.07, ease:"easeOut" }}
                style={{ width:28, height:4, borderRadius:2, transformOrigin:"left",
                  backgroundColor: i===0 ? C.green : i===1 ? C.blue : C.border,
                  boxShadow: i===1 ? `0 0 6px ${C.blue}` : "none" }} />
            ))}
          </div>
        </motion.div>

        {/* Body */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"28px 24px 40px", overflowY:"auto", position:"relative", zIndex:1 }}>
          <div style={{ width:"100%", maxWidth:600, position:"relative" }}>

            {/* XP pop */}
            <AnimatePresence>
              {showXpPop && (
                <motion.div
                  initial={{opacity:0,y:0,scale:0.7}} animate={{opacity:1,y:-50,scale:1.1}} exit={{opacity:0,y:-90,scale:0.9}}
                  transition={{duration:1.8,ease:"easeOut"}}
                  style={{ position:"absolute", top:0, right:0, fontSize:20, fontWeight:700, color:"#e3b341", pointerEvents:"none", zIndex:20, textShadow:"0 0 12px rgba(227,179,65,0.8)" }}>
                  +15 XP ✨
                </motion.div>
              )}
            </AnimatePresence>

            {/* Confetti burst */}
            <AnimatePresence>
              {showConfetti && (
                <div style={{ position:"absolute", top:"30%", left:"50%", pointerEvents:"none", zIndex:20 }}>
                  {confetti.map(p => {
                    const cx = Math.cos((p.angle * Math.PI)/180) * p.dist;
                    const cy = Math.sin((p.angle * Math.PI)/180) * p.dist;
                    return (
                      <motion.div key={p.id}
                        initial={{ opacity:1, x:0, y:0, scale:1 }}
                        animate={{ opacity:0, x:cx, y:cy, scale:0.3 }}
                        transition={{ duration:1.2, ease:"easeOut" }}
                        style={{ position:"absolute", width:p.size, height:p.size, borderRadius:"50%", backgroundColor:p.color }} />
                    );
                  })}
                </div>
              )}
            </AnimatePresence>

            {/* Badge + XP strip */}
            <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.3,delay:0.1}}
              style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <div style={{ fontSize:11, fontWeight:600, color:C.blue, textTransform:"uppercase", letterSpacing:"0.08em" }}>
                Organelles · Apply
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, fontWeight:600, color:"#e3b341",
                backgroundColor:"rgba(227,179,65,0.1)", border:"1px solid rgba(227,179,65,0.2)", borderRadius:20, padding:"3px 10px" }}>
                ⭐ +15 XP
              </div>
            </motion.div>

            {/* Question */}
            <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{duration:0.35,delay:0.15}}
              style={{ fontSize:18, fontWeight:600, color:C.heading, lineHeight:1.4, marginBottom:22 }}>
              A cell is found that contains very few mitochondria but is loaded with smooth ER. What is the most likely primary function of this cell?
            </motion.div>

            {/* Animated cell diagram */}
            <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} transition={{duration:0.45,delay:0.2}}
              style={{ backgroundColor:"#080e18", border:`1px solid #1e3a5f`, borderRadius:14, padding:"12px 20px 16px", marginBottom:22,
                display:"flex", justifyContent:"center", alignItems:"center", minHeight:150,
                boxShadow:"inset 0 0 40px rgba(56,139,253,0.05), 0 0 0 1px rgba(56,139,253,0.08)" }}>
              <svg width="100%" viewBox="0 0 480 140" style={{ maxWidth:480, overflow:"visible" }}>
                {/* Cytoplasm glow */}
                <defs>
                  <radialGradient id="cyto-grad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#1a2d4a" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#080e18" stopOpacity="0" />
                  </radialGradient>
                  <filter id="nucleus-glow">
                    <feGaussianBlur stdDeviation="3" result="blur"/>
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>

                {/* Cell outline — subtle breathing */}
                <ellipse cx="240" cy="70" rx="228" ry="62" fill="url(#cyto-grad)" stroke="#21262d" strokeWidth="1.5"
                  style={{ animation:"g-wave 6s ease-in-out infinite" }} />

                {/* ── Nucleus ── */}
                <g style={{ animation:"g-bob 5s ease-in-out infinite", transformOrigin:"110px 68px" }}>
                  <ellipse cx="110" cy="68" rx="44" ry="38" fill="#0c1e3a" stroke="#388bfd" strokeWidth="2"
                    style={{ animation:"g-nucleus-glow 3s ease-in-out infinite" }} />
                  {/* Nuclear pores */}
                  {[[-28,0],[28,0],[0,-28],[0,28],[-20,-20],[20,-20],[-20,20],[20,20]].map(([dx,dy],i) => (
                    <circle key={i} cx={110+(dx??0)} cy={68+(dy??0)} r="3" fill="#0c1e3a" stroke="#388bfd" strokeWidth="1.2"
                      style={{ animation:`g-pulse ${2+i*0.3}s ${i*0.2}s ease-in-out infinite` }} />
                  ))}
                  <circle cx="106" cy="64" r="12" fill="#152847" />
                  <text x="110" y="72" textAnchor="middle" fontSize="9" fill={C.blue} fontWeight="600">nucleus</text>
                </g>

                {/* ── Smooth ER (waving group 1) ── */}
                <g style={{ animation:"g-wave 3.5s 0.2s ease-in-out infinite", transformOrigin:"220px 45px" }}>
                  <path d="M168 32 Q188 22 208 34 Q228 46 248 34" fill="none" stroke="#d2a8ff" strokeWidth="2.2" />
                  <path d="M168 46 Q188 36 208 48 Q228 60 248 48" fill="none" stroke="#d2a8ff" strokeWidth="2.2" />
                </g>
                <g style={{ animation:"g-wave 4s 0.8s ease-in-out infinite", transformOrigin:"220px 72px" }}>
                  <path d="M165 62 Q187 52 207 64 Q227 76 247 64" fill="none" stroke="#d2a8ff" strokeWidth="2.2" />
                  <path d="M165 76 Q187 66 207 78 Q227 90 247 78" fill="none" stroke="#d2a8ff" strokeWidth="2.2" />
                </g>
                <g style={{ animation:"g-wave 3s 1.4s ease-in-out infinite", transformOrigin:"220px 97px" }}>
                  <path d="M168 92 Q188 82 208 94 Q228 106 248 94" fill="none" stroke="#d2a8ff" strokeWidth="2.2" />
                  <path d="M168 106 Q188 96 208 108 Q228 120 248 108" fill="none" stroke="#d2a8ff" strokeWidth="2.2" />
                </g>

                {/* ── Smooth ER group 2 (right) ── */}
                <g style={{ animation:"g-wave 3.8s 0.5s ease-in-out infinite", transformOrigin:"310px 55px" }}>
                  <path d="M268 40 Q290 30 312 42 Q334 54 354 42" fill="none" stroke="#d2a8ff" strokeWidth="2.2" />
                  <path d="M268 56 Q290 46 312 58 Q334 70 354 58" fill="none" stroke="#d2a8ff" strokeWidth="2.2" />
                </g>
                <g style={{ animation:"g-wave 4.5s 1s ease-in-out infinite", transformOrigin:"310px 84px" }}>
                  <path d="M265 74 Q288 64 310 76 Q332 88 352 76" fill="none" stroke="#d2a8ff" strokeWidth="2.2" />
                  <path d="M265 90 Q288 80 310 92 Q332 104 352 92" fill="none" stroke="#d2a8ff" strokeWidth="2.2" />
                </g>

                {/* Smooth ER label */}
                <text x="258" y="128" textAnchor="middle" fontSize="9.5" fill="#d2a8ff" fontWeight="600">smooth ER (abundant)</text>

                {/* ── Mitochondria (few — bobbing) ── */}
                <g style={{ animation:"g-bob 4s 1s ease-in-out infinite", transformOrigin:"415px 58px" }}>
                  <ellipse cx="415" cy="58" rx="28" ry="15" fill="#0d2010" stroke={C.green} strokeWidth="1.5" />
                  <path d="M396 54 Q406 49 415 54 Q424 59 434 54" fill="none" stroke={C.green} strokeWidth="1" opacity="0.7" />
                  <path d="M394 62 Q404 57 415 62 Q426 67 436 62" fill="none" stroke={C.green} strokeWidth="1" opacity="0.7" />
                  <text x="415" y="84" textAnchor="middle" fontSize="8.5" fill={C.green}>few mito.</text>
                </g>

                {/* Floating vesicles */}
                {[[178,25],[248,110],[362,28],[365,108]].map(([x,y],i) => (
                  <circle key={i} cx={x} cy={y} r="4" fill="none" stroke="#d2a8ff" strokeWidth="1.2"
                    style={{ animation:`g-vesicle ${5+i}s ${i*1.2}s ease-in-out infinite`, opacity:0.6 }} />
                ))}
              </svg>
            </motion.div>

            {/* Options */}
            <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
              {exOptions.map((opt, i) => {
                const state  = getOptState(i);
                const colors = getColors(state);
                const isShaking = shakeIdx === i;

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity:0, x:-16 }}
                    animate={{ opacity:1, x:0 }}
                    transition={{ duration:0.3, delay:0.3 + i*0.07 }}
                    onClick={() => handleSelect(i)}
                    whileHover={!done ? { scale:1.015, x:3 } : {}}
                    whileTap={!done ? { scale:0.97 } : {}}
                    style={{
                      display:"flex", alignItems:"center", gap:12,
                      padding:"13px 16px", borderRadius:10,
                      border:`2px solid ${colors.border}`,
                      backgroundColor: colors.bg,
                      cursor: done ? "default" : "pointer",
                      boxShadow: colors.glow,
                      transition:"border-color 0.2s, background-color 0.2s, box-shadow 0.2s",
                      animation: isShaking ? "g-shake 0.55s ease" : "none",
                    }}>

                    {/* Letter badge */}
                    <motion.div
                      animate={state==="correct" ? {scale:[1,1.4,1],rotate:[0,10,-10,0]} : state==="wrong" ? {scale:[1,0.7,1]} : {}}
                      transition={{duration:0.35}}
                      style={{ width:32, height:32, borderRadius:8, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center",
                        backgroundColor: colors.bdgBg, fontSize:12, fontWeight:700, color: colors.bdgColor,
                        transition:"all 0.2s" }}>
                      {state==="correct" ? "✓" : state==="wrong" ? "✗" : String.fromCharCode(65+i)}
                    </motion.div>

                    {/* Icon */}
                    <span style={{ fontSize:18, flexShrink:0 }}>{opt.icon}</span>

                    {/* Text */}
                    <span style={{ fontSize:14, color:colors.text, fontWeight: state==="sel" ? 600 : 400, transition:"color 0.2s, font-weight 0.1s", flex:1 }}>
                      {opt.text}
                    </span>

                    {/* Correct checkmark sparkle */}
                    <AnimatePresence>
                      {state==="correct" && (
                        <motion.span initial={{scale:0,opacity:0}} animate={{scale:1,opacity:1}} transition={{type:"spring",stiffness:400,damping:15}}
                          style={{ fontSize:18 }}>✨</motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            {/* Check button */}
            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.3,delay:0.55}}
              style={{ display:"flex", justifyContent:"flex-start", marginBottom:4 }}>
              <motion.button
                onClick={handleCheck}
                disabled={!btnEnabled}
                whileHover={btnEnabled ? {scale:1.04} : {}}
                whileTap={btnEnabled ? {scale:0.95} : {}}
                style={{
                  padding:"11px 28px",
                  backgroundColor: !btnEnabled ? C.border : isCorrect ? C.checkBlue : C.checkGreen,
                  color: btnEnabled ? "#fff" : C.dimmed,
                  border:"none", borderRadius:9, fontSize:14, fontWeight:600,
                  cursor: btnEnabled ? "pointer" : "not-allowed",
                  fontFamily:"inherit",
                  boxShadow: !btnEnabled ? "none" : isCorrect ? "0 0 20px rgba(31,111,235,0.4)" : "0 0 20px rgba(35,134,54,0.4)",
                  transition:"background-color 0.15s, box-shadow 0.2s",
                }}>
                {isCorrect ? "Next exercise →" : isWrong ? "Try again" : "Check answer"}
              </motion.button>
            </motion.div>

            {/* Feedback */}
            <AnimatePresence>
              {done && (
                <motion.div
                  key={isCorrect ? "c" : "w"}
                  initial={{opacity:0, y:14, scale:0.97}}
                  animate={{opacity:1, y:0,  scale:1}}
                  exit={{opacity:0, y:-8}}
                  transition={{duration:0.35, ease:"easeOut"}}
                  style={{ marginTop:14, padding:"14px 16px", borderRadius:10, fontSize:13, lineHeight:1.7,
                    backgroundColor: isCorrect ? C.completeBg : C.redBg,
                    border:`1px solid ${isCorrect ? C.greenBorder : C.redBorder}`,
                    color: isCorrect ? C.green : C.red,
                    boxShadow: isCorrect ? "0 0 24px rgba(63,185,80,0.15)" : "0 0 20px rgba(248,81,73,0.12)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                    <span style={{ fontSize:20 }}>{isCorrect ? "🎉" : "💡"}</span>
                    <strong>{isCorrect ? "Correct!" : "Not quite."}</strong>
                  </div>
                  {isCorrect
                    ? "Smooth ER is the organelle for lipid synthesis and detoxification. Liver cells — which detoxify alcohol and drugs — are packed with smooth ER for exactly this reason."
                    : "Look at what is abundant — smooth ER. Remember: smooth ER handles lipids and detoxification, not protein secretion (rough ER) and not ATP production (mitochondria)."}
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>
    </>
  );
}

// ── Root: tab nav + view router ───────────────────────────────────────────────
export default function CoursesPage() {
  const [view, setView] = useState<View>("courses");
  const tabs: { id: View; label: string }[] = [
    { id: "courses",  label: "Courses"        },
    { id: "lesson",   label: "Watch lesson" },
    { id: "exercise", label: "Exercise"       },
  ];

  return (
    <div style={{ backgroundColor: C.pageBg, display: "flex", flexDirection: "column", height: "100%", fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* Top nav bar */}
      <div style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}`, padding: "0 20px", display: "flex", alignItems: "center", flexShrink: 0 }}>
        {tabs.map(tab => (
          <TabBtn key={tab.id} label={tab.label} active={view === tab.id} onClick={() => setView(tab.id)} />
        ))}
      </div>

      {/* View */}
      {view === "courses"  && <CoursesScreen  onNavigate={setView} />}
      {view === "lesson"   && <LessonScreen onNavigate={setView} />}
      {view === "exercise" && <ExerciseScreen />}
    </div>
  );
}

function TabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontSize: 14, fontWeight: 400,
        color: active ? C.blue : hov ? C.heading : C.muted,
        padding: "12px 16px",
        border: "none",
        borderBottom: `2px solid ${active ? C.blue : "transparent"}`,
        background: "none",
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "color 0.15s",
        whiteSpace: "nowrap",
      }}>
      {label}
    </button>
  );
}
