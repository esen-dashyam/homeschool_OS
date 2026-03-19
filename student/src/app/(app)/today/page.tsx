"use client";

import { useState } from "react";
import Link from "next/link";
import { mockStudent, mockSchedule, mockCourses } from "@/lib/mockData";
import { cn, formatTime, getGreeting, getSubjectColor, paceLabel, paceColor } from "@/lib/utils";
import { Sparkles, Clock, CheckCircle2, ChevronRight, Flame, BookCheck, TrendingUp, Zap, Star } from "lucide-react";

const statusConfig = {
  done:     { label: "Done",    className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  active:   { label: "Active",  className: "bg-[#534AB7]/10 text-[#534AB7] border-[#534AB7]/20" },
  "up-next":{ label: "Up next", className: "bg-amber-100 text-amber-700 border-amber-200" },
  later:    { label: "Later",   className: "bg-muted text-muted-foreground border-border" },
};

export default function TodayPage() {
  const [challengeDone, setChallengeDone] = useState(false);
  const [challengeAnswer, setChallengeAnswer] = useState<number | null>(null);
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric"
  });

  const activeBlock = mockSchedule.find((b) => b.status === "active");
  const upNextBlock = mockSchedule.find((b) => b.status === "up-next");
  const upNextCard = activeBlock ?? upNextBlock;
  const upNextCourse = upNextCard
    ? mockCourses.find((c) => c.id === upNextCard.courseId)
    : null;
  const upNextColors = upNextCard ? getSubjectColor(upNextCard.subject) : null;

  const completedToday = mockSchedule.filter((b) => b.status === "done").length;
  const totalBlocks = mockSchedule.length;

  const primaryCourse = mockCourses[0];
  const primaryPaceColor = paceColor(primaryCourse.paceStatus);

  const CHALLENGE_OPTS = [
    "It produces mRNA copies of DNA",
    "It synthesizes ATP through respiration",
    "It packages proteins for export",
    "It digests damaged cell components",
  ];
  const CHALLENGE_CORRECT = 1;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      {/* XP + Streak strip */}
      <div className="flex items-center gap-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-2 border-b border-border bg-card/50">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-xs font-bold text-amber-600">1,240 XP</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-orange-500" />
          <span className="text-xs font-bold text-orange-600">7 day streak</span>
        </div>
      </div>

      {/* Daily Challenge */}
      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#0f1117" }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: "#2d2d3f" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" style={{ color: "#EF9F27" }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#EF9F27" }}>Daily Challenge</span>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#2a1f5e", color: "#7F77DD" }}>+25 XP</span>
          </div>
        </div>
        <div className="px-5 py-4">
          <p className="font-semibold text-sm mb-3" style={{ color: "#e8e8f0" }}>
            🧬 Biology Review — What does the mitochondria produce that cells use as energy currency?
          </p>
          {!challengeDone ? (
            <div className="grid grid-cols-1 gap-2">
              {CHALLENGE_OPTS.map((opt, i) => (
                <button key={i}
                  onClick={() => { setChallengeAnswer(i); if (i === CHALLENGE_CORRECT) setChallengeDone(true); }}
                  className="text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{
                    backgroundColor: challengeAnswer === i
                      ? i === CHALLENGE_CORRECT ? "#1a4a2e" : "#3d1a1a"
                      : "#1c1c28",
                    border: `1.5px solid ${challengeAnswer === i
                      ? i === CHALLENGE_CORRECT ? "#1D9E75" : "#E24B4A"
                      : "#2d2d3f"}`,
                    color: challengeAnswer === i
                      ? i === CHALLENGE_CORRECT ? "#1D9E75" : "#E24B4A"
                      : "#a0a0b8",
                  }}>
                  {opt}
                </button>
              ))}
              {challengeAnswer !== null && challengeAnswer !== CHALLENGE_CORRECT && (
                <p className="text-xs mt-1" style={{ color: "#E24B4A" }}>Not quite — try another.</p>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: "#1a4a2e", border: "1.5px solid #1D9E75" }}>
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: "#1D9E75" }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: "#1D9E75" }}>Correct! +25 XP earned</p>
                <p className="text-xs mt-0.5" style={{ color: "#a0a0b8" }}>ATP — adenosine triphosphate — is the cell&apos;s energy currency.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{getGreeting(mockStudent.name)} 👋</h1>
        <p className="text-muted-foreground text-sm mt-1">{today}</p>
      </div>

      {/* Up next card */}
      {upNextCard && upNextColors && (
        <div
          className="rounded-2xl p-5 border"
          style={{ backgroundColor: upNextColors.lightBg, borderColor: upNextColors.border }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: upNextColors.accent }}>
              {upNextCard.status === "active" ? "Working on now" : "Up next"}
            </span>
            <span
              className="text-xs font-medium px-2.5 py-1 rounded-full border"
              style={{ backgroundColor: upNextColors.bg, color: upNextColors.accent, borderColor: upNextColors.border }}
            >
              {upNextCard.subject}
            </span>
          </div>
          <h2 className="text-foreground font-semibold text-lg mb-1">{upNextCard.topic}</h2>
          {upNextCourse && (
            <p className="text-muted-foreground text-sm mb-4">{upNextCourse.unitName}</p>
          )}
          <div className="flex items-center gap-3">
            <Link
              href="/tutor"
              className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl text-white transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: upNextColors.accent }}
            >
              <Sparkles className="w-4 h-4" />
              Open AI Tutor
            </Link>
            <span className="text-muted-foreground text-sm flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {formatTime(upNextCard.startTime)} – {formatTime(upNextCard.endTime)}
            </span>
          </div>
        </div>
      )}

      {/* Today's schedule */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground text-base">Today&apos;s schedule</h2>
          <span className="text-muted-foreground text-sm">{completedToday}/{totalBlocks} done</span>
        </div>

        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {mockSchedule.map((block, i) => {
            const colors = getSubjectColor(block.subject);
            const status = statusConfig[block.status];
            const isLast = i === mockSchedule.length - 1;
            return (
              <div
                key={block.id}
                className={cn(
                  "flex items-center gap-4 px-4 py-3.5",
                  !isLast && "border-b border-border",
                  block.status === "done" && "opacity-60"
                )}
              >
                {/* Color bar */}
                <div
                  className="w-1 h-10 rounded-full flex-shrink-0"
                  style={{ backgroundColor: colors.accent }}
                />

                {/* Time */}
                <div className="w-20 flex-shrink-0">
                  <p className="text-foreground text-xs font-semibold">{formatTime(block.startTime)}</p>
                  <p className="text-muted-foreground text-xs">{formatTime(block.endTime)}</p>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-medium truncate",
                    block.status === "done" ? "line-through text-muted-foreground" : "text-foreground"
                  )}>
                    {block.topic}
                  </p>
                  <p className="text-muted-foreground text-xs">{block.subject}</p>
                </div>

                {/* Status + action */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {block.status === "done" ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <>
                      <span className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full border",
                        status.className
                      )}>
                        {status.label}
                      </span>
                      {(block.status === "active" || block.status === "up-next") && (
                        <Link href="/tutor" className="text-muted-foreground hover:text-foreground transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="w-8 h-8 rounded-xl bg-[#EEEDFE] flex items-center justify-center mb-3">
            <Flame className="w-4 h-4 text-[#534AB7]" />
          </div>
          <p className="text-foreground font-bold text-xl">12.5h</p>
          <p className="text-muted-foreground text-xs mt-0.5">Hours this week</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="w-8 h-8 rounded-xl bg-[#E1F5EE] flex items-center justify-center mb-3">
            <BookCheck className="w-4 h-4 text-[#0F6E56]" />
          </div>
          <p className="text-foreground font-bold text-xl">4</p>
          <p className="text-muted-foreground text-xs mt-0.5">Topics done this week</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="w-8 h-8 rounded-xl bg-[#FAEEDA] flex items-center justify-center mb-3">
            <TrendingUp className="w-4 h-4 text-[#854F0B]" />
          </div>
          <p className={cn(
            "font-bold text-sm leading-tight mt-1",
            primaryPaceColor.split(" ").filter(c => c.startsWith("text-")).join(" ")
          )}>
            {paceLabel(primaryCourse.paceStatus)}
          </p>
          <p className="text-muted-foreground text-xs mt-0.5">{primaryCourse.name} pace</p>
        </div>
      </div>
    </div>
  );
}
