"use client";

import { useState } from "react";
import { mockFamily, mockScheduleBlocks, mockAdults } from "@/lib/mockData";
import { cn, getAvatarInitials, formatTime, getTodayString, getWeekDates } from "@/lib/utils";
import { ScheduleBlock } from "@/types";
import {
  ChevronLeft, ChevronRight, SkipForward, Plus, CheckCircle2,
  Clock, Coffee, Zap, Star, Calendar, AlertCircle, X, User,
  Sparkles, Check, ArrowRight, RefreshCw,
} from "lucide-react";

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7);

const blockTypeStyles: Record<string, string> = {
  academic:    "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-300",
  activity:    "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/30 dark:border-green-800 dark:text-green-300",
  meal:        "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300",
  free:        "bg-accent border-border text-muted-foreground",
  appointment: "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-300",
  "co-op":     "bg-teal-50 border-teal-200 text-teal-800 dark:bg-teal-950/30 dark:border-teal-800 dark:text-teal-300",
};

const blockTypeIcon: Record<string, React.ReactNode> = {
  academic: <Zap className="w-3 h-3" />,
  activity: <Star className="w-3 h-3" />,
  meal: <Coffee className="w-3 h-3" />,
  free: <Star className="w-3 h-3" />,
  appointment: <Calendar className="w-3 h-3" />,
  "co-op": <Star className="w-3 h-3" />,
};

type ViewMode = "day" | "week" | "single";

// All family members unified (adults first, then children)
const ALL_MEMBERS = [
  ...mockAdults.map(a => ({ id: a.id, name: a.name, avatarColor: a.avatarColor, role: a.role as string })),
  ...mockFamily.children.map(c => ({ id: c.id, name: c.name, avatarColor: c.avatarColor, role: `Grade ${c.gradeLevel}` })),
];

function getMemberId(block: ScheduleBlock): string | undefined {
  return block.assigneeId ?? block.childId;
}

export default function SchedulePage() {
  const [view, setView] = useState<ViewMode>("day");
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [bumpDone, setBumpDone] = useState(false);
  const [blocks, setBlocks] = useState<ScheduleBlock[]>(mockScheduleBlocks);
  const [showAddModal, setShowAddModal] = useState(false);
  const [focusMember, setFocusMember] = useState<string | "all">("all");
  const [showOptimize, setShowOptimize] = useState(false);
  const [optimizeLoading, setOptimizeLoading] = useState(false);
  const [optimizeReady, setOptimizeReady] = useState(false);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<number>>(new Set());

  const weekDates = getWeekDates(weekOffset);
  const today = getTodayString();

  const allDayBlocks = blocks.filter((b) => b.date === selectedDate);
  const dayBlocks = focusMember === "all"
    ? allDayBlocks
    : allDayBlocks.filter((b) => getMemberId(b) === focusMember);

  const visibleMembers = focusMember === "all" ? ALL_MEMBERS : ALL_MEMBERS.filter(m => m.id === focusMember);

  function timeToMinutes(t: string) {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  }

  function handleBump() {
    const incomplete = dayBlocks.filter((b) => !b.completed);
    if (incomplete.length === 0) return;
    // Next calendar day
    const next = new Date(selectedDate + "T12:00:00");
    next.setDate(next.getDate() + 1);
    const nextDate = next.toISOString().split("T")[0];
    setBlocks(prev => prev.map(b =>
      incomplete.some(inc => inc.id === b.id) ? { ...b, date: nextDate } : b
    ));
    setBumpDone(true);
    setTimeout(() => setBumpDone(false), 2500);
  }

  function addBlock(newBlock: Omit<ScheduleBlock, "id" | "completed">) {
    setBlocks(prev => [...prev, { ...newBlock, id: `sb-${Date.now()}`, completed: false }]);
    setShowAddModal(false);
  }

  const incompleteToday = dayBlocks.filter((b) => !b.completed).length;

  // Compute overlapping layout for single-day view
  function computeBlockLayout(blocks: ScheduleBlock[]): Map<string, { col: number; totalCols: number }> {
    const sorted = [...blocks].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    const cols: number[] = []; // tracks end minute of last block in each column
    const blockCol = new Map<string, number>();

    for (const block of sorted) {
      const startMin = timeToMinutes(block.startTime);
      const endMin = timeToMinutes(block.endTime);
      let col = cols.findIndex(endMin2 => endMin2 <= startMin);
      if (col === -1) { col = cols.length; cols.push(endMin); }
      else cols[col] = endMin;
      blockCol.set(block.id, col);
    }

    const result = new Map<string, { col: number; totalCols: number }>();
    for (const block of sorted) {
      const startMin = timeToMinutes(block.startTime);
      const endMin = timeToMinutes(block.endTime);
      let maxCol = 0;
      for (const other of sorted) {
        if (timeToMinutes(other.startTime) < endMin && timeToMinutes(other.endTime) > startMin) {
          maxCol = Math.max(maxCol, blockCol.get(other.id)!);
        }
      }
      result.set(block.id, { col: blockCol.get(block.id)!, totalCols: maxCol + 1 });
    }
    return result;
  }

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Schedule</h1>
          <p className="text-muted-foreground text-xs mt-0.5">{mockAdults.length} adults · {mockFamily.children.length} kids · {dayBlocks.length} blocks today</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* View toggle */}
          <div className="flex bg-accent border border-border rounded-md p-1 gap-1">
            {([["day", "By Person"], ["single", "Single Day"], ["week", "Week"]] as [ViewMode, string][]).map(([v, label]) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn("px-3 py-1.5 rounded-md text-sm font-medium transition-colors", v === view ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
              >
                {label}
              </button>
            ))}
          </div>
          {/* Bump button */}
          <button
            onClick={handleBump}
            disabled={incompleteToday === 0}
            title="Move all incomplete blocks to tomorrow"
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all",
              bumpDone
                ? "bg-green-500 text-white"
                : incompleteToday === 0
                  ? "bg-accent text-muted-foreground cursor-default"
                  : "bg-foreground text-background hover:opacity-80"
            )}
          >
            <SkipForward className="w-4 h-4" />
            {bumpDone
              ? `✓ ${incompleteToday} moved to tomorrow`
              : incompleteToday > 0
                ? `Bump ${incompleteToday} to tomorrow`
                : "All done!"}
          </button>
          <button
            onClick={() => {
              setShowOptimize(true);
              setOptimizeReady(false);
              setAppliedSuggestions(new Set());
              setOptimizeLoading(true);
              setTimeout(() => { setOptimizeLoading(false); setOptimizeReady(true); }, 1800);
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-md border border-border text-muted-foreground hover:bg-accent hover:text-foreground text-sm transition-colors"
          >
            <Sparkles className="w-4 h-4" /> Optimize
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-md border border-border text-muted-foreground hover:bg-accent text-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Assign block
          </button>
        </div>
      </div>

      {/* Week navigation */}
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setWeekOffset(w => w - 1)} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex gap-1 flex-1 overflow-x-auto scrollbar-hide">
          {weekDates.map((date) => {
            const d = new Date(date + "T12:00:00");
            const isToday = date === today;
            const isSelected = date === selectedDate;
            const hasBlocks = blocks.some((b) => b.date === date && (focusMember === "all" || getMemberId(b) === focusMember));
            return (
              <button
                key={date}
                onClick={() => { setSelectedDate(date); setView("day"); }}
                className={cn(
                  "flex-1 min-w-[52px] flex flex-col items-center py-2 rounded-xl transition-colors text-xs",
                  isSelected ? "bg-foreground text-background" : isToday ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/60"
                )}
              >
                <span className="font-medium">{d.toLocaleDateString("en-US", { weekday: "short" })}</span>
                <span className={cn("font-bold text-sm", isSelected ? "text-white" : "")}>{d.getDate()}</span>
                {hasBlocks && !isSelected && <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1" />}
              </button>
            );
          })}
        </div>
        <button onClick={() => setWeekOffset(w => w + 1)} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Person filter strip */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setFocusMember("all")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
            focusMember === "all"
              ? "bg-foreground text-background border-transparent"
              : "bg-card text-muted-foreground border-border hover:border-foreground/30"
          )}
        >
          <User className="w-3 h-3" /> Everyone
        </button>
        {ALL_MEMBERS.map((member) => {
          const active = focusMember === member.id;
          return (
            <button
              key={member.id}
              onClick={() => setFocusMember(active ? "all" : member.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                active ? "text-white border-transparent" : "bg-card text-muted-foreground border-border hover:border-foreground/30"
              )}
              style={active ? { backgroundColor: member.avatarColor, borderColor: member.avatarColor } : {}}
            >
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0"
                style={{ backgroundColor: active ? "rgba(255,255,255,0.25)" : member.avatarColor, color: "white" }}
              >
                {getAvatarInitials(member.name)}
              </div>
              {member.name}
              {focusMember === "all" && (
                <span className="bg-accent border border-border text-muted-foreground rounded-full px-1.5 py-0.5 text-[10px] font-semibold">
                  {allDayBlocks.filter(b => getMemberId(b) === member.id).length}
                </span>
              )}
            </button>
          );
        })}
        {focusMember !== "all" && (
          <span className="text-xs text-muted-foreground ml-1">
            {dayBlocks.length} block{dayBlocks.length !== 1 ? "s" : ""} · click to deselect
          </span>
        )}
      </div>

      {view === "single" ? (
        /* Single-day view — overlapping blocks on one timeline */
        <div className="bg-card rounded-md border border-border overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border bg-accent/50 flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </span>
            <span className="ml-auto text-xs text-muted-foreground">{dayBlocks.length} blocks · all children</span>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: "68vh" }}>
            <div className="flex">
              {/* Time labels */}
              <div className="flex-shrink-0 w-14 relative" style={{ height: `${HOURS.length * 64}px` }}>
                {HOURS.map((h, i) => (
                  <div key={h} className="absolute w-full border-t border-border flex items-start" style={{ top: `${i * 64}px`, height: "64px" }}>
                    <span className="text-muted-foreground text-[10px] px-2 leading-none mt-1 select-none">
                      {h === 12 ? "12 PM" : h > 12 ? `${h - 12} PM` : `${h} AM`}
                    </span>
                  </div>
                ))}
              </div>
              {/* Single event column */}
              <div className="flex-1 relative border-l border-border" style={{ height: `${HOURS.length * 64}px` }}>
                {HOURS.map((h, i) => (
                  <div key={h} className="absolute w-full border-t border-border" style={{ top: `${i * 64}px` }} />
                ))}
                {(() => {
                  const layout = computeBlockLayout(dayBlocks);
                  return dayBlocks.map((block) => {
                    const { col, totalCols } = layout.get(block.id)!;
                    const startMin = timeToMinutes(block.startTime) - 7 * 60;
                    const endMin = timeToMinutes(block.endTime) - 7 * 60;
                    const topPx = (startMin / 60) * 64;
                    const heightPx = Math.max(((endMin - startMin) / 60) * 64, 28);
                    const GAP = 3;
                    const colWidth = `calc(${100 / totalCols}% - ${GAP}px)`;
                    const leftPct = `calc(${(col / totalCols) * 100}% + ${GAP / 2}px)`;
                    const child = ALL_MEMBERS.find(m => m.id === getMemberId(block));
                    return (
                      <div
                        key={block.id}
                        className={cn(
                          "absolute rounded-md border px-2 py-1 overflow-hidden cursor-pointer hover:shadow-md transition-shadow",
                          blockTypeStyles[block.type] ?? "bg-accent border-border text-muted-foreground",
                          block.completed && "opacity-50"
                        )}
                        style={{ top: `${topPx}px`, height: `${heightPx}px`, left: leftPct, width: colWidth }}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          {blockTypeIcon[block.type]}
                          <span className="text-[10px] font-semibold truncate flex-1">{block.title}</span>
                          {child && (
                            <div
                              className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0"
                              style={{ backgroundColor: child.avatarColor }}
                            >
                              {getAvatarInitials(child.name)}
                            </div>
                          )}
                          {block.completed && <CheckCircle2 className="w-3 h-3 flex-shrink-0 text-green-600" />}
                        </div>
                        {heightPx > 40 && (
                          <p className="text-[9px] opacity-60 mt-0.5">{formatTime(block.startTime)} – {formatTime(block.endTime)}</p>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        </div>
      ) : view === "day" ? (
        /* By Person view — all family members as columns */
        <div className="bg-card rounded-md border border-border overflow-hidden">
          {/* Member header row */}
          <div className="grid border-b border-border bg-accent/50 sticky top-0 z-10" style={{ gridTemplateColumns: `64px repeat(${visibleMembers.length}, 1fr)` }}>
            <div className="h-12" />
            {visibleMembers.map((member) => (
              <div key={member.id} className="h-12 border-l border-border flex items-center gap-2 px-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ backgroundColor: member.avatarColor }}>
                  {getAvatarInitials(member.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-foreground text-sm font-medium truncate">{member.name}</p>
                  <p className="text-muted-foreground text-[10px] capitalize truncate">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Scrollable time grid */}
          <div className="overflow-y-auto" style={{ maxHeight: "60vh" }}>
            <div className="grid" style={{ gridTemplateColumns: `64px repeat(${visibleMembers.length}, 1fr)` }}>
              {/* Time labels column */}
              <div className="relative" style={{ height: `${HOURS.length * 64}px` }}>
                {HOURS.map((h, i) => (
                  <div key={h} className="absolute w-full border-t border-border flex items-start" style={{ top: `${i * 64}px`, height: "64px" }}>
                    <span className="text-muted-foreground text-[10px] px-2 leading-none mt-1 select-none">
                      {h === 12 ? "12 PM" : h > 12 ? `${h - 12} PM` : `${h} AM`}
                    </span>
                  </div>
                ))}
              </div>
              {/* Member columns */}
              {visibleMembers.map((member) => {
                const memberBlocks = dayBlocks.filter((b) => getMemberId(b) === member.id);
                return (
                  <div key={member.id} className="relative border-l border-border" style={{ height: `${HOURS.length * 64}px` }}>
                    {HOURS.map((h, i) => (
                      <div key={h} className="absolute w-full border-t border-border" style={{ top: `${i * 64}px` }} />
                    ))}
                    {memberBlocks.map((block) => {
                      const startMin = timeToMinutes(block.startTime) - 7 * 60;
                      const endMin = timeToMinutes(block.endTime) - 7 * 60;
                      const topPx = (startMin / 60) * 64;
                      const heightPx = Math.max(((endMin - startMin) / 60) * 64, 24);
                      return (
                        <div
                          key={block.id}
                          className={cn(
                            "absolute left-1 right-1 rounded-md border px-2 py-1 overflow-hidden cursor-pointer hover:shadow-md transition-shadow",
                            blockTypeStyles[block.type] ?? "bg-accent border-border text-muted-foreground",
                            block.completed && "opacity-50"
                          )}
                          style={{ top: `${topPx}px`, height: `${heightPx}px` }}
                        >
                          <div className="flex items-center gap-1">
                            {blockTypeIcon[block.type]}
                            <span className="text-[10px] font-semibold truncate">{block.title}</span>
                            {block.completed && <CheckCircle2 className="w-3 h-3 ml-auto flex-shrink-0 text-green-600" />}
                          </div>
                          {heightPx > 36 && (
                            <p className="text-[9px] opacity-60 mt-0.5">{formatTime(block.startTime)} – {formatTime(block.endTime)}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Week view — 7-column time grid */
        <div className="bg-card rounded-md border border-border overflow-hidden">
          {/* Day header row */}
          <div className="grid border-b border-border bg-accent/50 sticky top-0 z-10" style={{ gridTemplateColumns: `56px repeat(7, 1fr)` }}>
            <div className="h-12" />
            {weekDates.map((date) => {
              const d = new Date(date + "T12:00:00");
              const isToday = date === today;
              const dayBlockCount = blocks.filter(b =>
                b.date === date && (focusMember === "all" || getMemberId(b) === focusMember)
              ).length;
              return (
                <div
                  key={date}
                  className={cn(
                    "h-12 border-l border-border flex flex-col items-center justify-center gap-0.5 cursor-pointer hover:bg-accent/60 transition-colors",
                    isToday && "bg-accent/60"
                  )}
                  onClick={() => { setSelectedDate(date); setView("single"); }}
                >
                  <span className={cn("text-[10px] font-medium", isToday ? "text-primary" : "text-muted-foreground")}>
                    {d.toLocaleDateString("en-US", { weekday: "short" })}
                  </span>
                  <span className={cn(
                    "text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full",
                    isToday ? "bg-primary text-white" : "text-foreground"
                  )}>
                    {d.getDate()}
                  </span>
                  {dayBlockCount > 0 && (
                    <span className="text-[9px] text-muted-foreground">{dayBlockCount}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Scrollable grid body */}
          <div className="overflow-y-auto" style={{ maxHeight: "65vh" }}>
            <div className="grid" style={{ gridTemplateColumns: `56px repeat(7, 1fr)` }}>
              {/* Time labels */}
              <div className="relative" style={{ height: `${HOURS.length * 64}px` }}>
                {HOURS.map((h, i) => (
                  <div key={h} className="absolute w-full border-t border-border flex items-start" style={{ top: `${i * 64}px`, height: "64px" }}>
                    <span className="text-muted-foreground text-[10px] px-1.5 leading-none mt-1 select-none">
                      {h === 12 ? "12p" : h > 12 ? `${h - 12}p` : `${h}a`}
                    </span>
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {weekDates.map((date) => {
                const colBlocks = blocks.filter(b =>
                  b.date === date && (focusMember === "all" || getMemberId(b) === focusMember)
                );
                const layout = computeBlockLayout(colBlocks);
                const isToday = date === today;
                return (
                  <div
                    key={date}
                    className={cn("relative border-l border-border", isToday && "bg-accent/20")}
                    style={{ height: `${HOURS.length * 64}px` }}
                  >
                    {HOURS.map((h, i) => (
                      <div key={h} className="absolute w-full border-t border-border" style={{ top: `${i * 64}px` }} />
                    ))}
                    {colBlocks.map((block) => {
                      const { col, totalCols } = layout.get(block.id) ?? { col: 0, totalCols: 1 };
                      const startMin = timeToMinutes(block.startTime) - 7 * 60;
                      const endMin = timeToMinutes(block.endTime) - 7 * 60;
                      const topPx = (startMin / 60) * 64;
                      const heightPx = Math.max(((endMin - startMin) / 60) * 64, 20);
                      const GAP = 2;
                      const member = ALL_MEMBERS.find(m => m.id === getMemberId(block));
                      return (
                        <div
                          key={block.id}
                          className={cn(
                            "absolute rounded-md border px-1.5 py-0.5 overflow-hidden cursor-pointer hover:shadow-md transition-shadow",
                            blockTypeStyles[block.type] ?? "bg-accent border-border text-muted-foreground",
                            block.completed && "opacity-40"
                          )}
                          style={{
                            top: `${topPx}px`,
                            height: `${heightPx}px`,
                            left: `calc(${(col / totalCols) * 100}% + ${GAP}px)`,
                            width: `calc(${(1 / totalCols) * 100}% - ${GAP * 2}px)`,
                          }}
                        >
                          <p className="text-[10px] font-semibold truncate leading-tight">{block.title}</p>
                          {heightPx > 30 && (
                            <p className="text-[9px] opacity-60 leading-tight">{formatTime(block.startTime)}</p>
                          )}
                          {focusMember === "all" && member && heightPx > 44 && (
                            <div
                              className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-white text-[7px] font-bold mt-0.5"
                              style={{ backgroundColor: member.avatarColor }}
                            >
                              {getAvatarInitials(member.name)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {showAddModal && (
        <AddBlockModal
          selectedDate={selectedDate}
          onClose={() => setShowAddModal(false)}
          onAdd={addBlock}
        />
      )}

      {/* Optimize panel */}
      {showOptimize && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/20" onClick={() => setShowOptimize(false)} />
          <div className="w-full max-w-sm bg-card border-l border-border flex flex-col shadow-xl">
            {/* Header */}
            <div className="px-5 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-muted-foreground" />
                <p className="font-semibold text-foreground text-sm">Schedule Optimizer</p>
              </div>
              <button onClick={() => setShowOptimize(false)} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-accent transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {optimizeLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 py-16 px-6">
                  <div className="w-10 h-10 rounded-full bg-accent border border-border flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-muted-foreground animate-pulse" />
                  </div>
                  <div className="text-center space-y-1.5">
                    <p className="text-foreground font-medium text-sm">Analyzing your schedule…</p>
                    <p className="text-muted-foreground text-xs">Checking energy patterns, gaps, and academic pacing</p>
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                </div>
              ) : optimizeReady ? (
                <div className="p-4 space-y-3">
                  {/* Summary */}
                  <div className="bg-accent/40 border border-border rounded-md p-3">
                    <p className="text-foreground font-medium text-xs mb-1">Analysis for {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</p>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      Found {dayBlocks.length} blocks across {ALL_MEMBERS.length} family members. {incompleteToday} incomplete. Identified 4 optimizations.
                    </p>
                  </div>

                  {/* Suggestions */}
                  {[
                    {
                      title: "Shift Emma's English Lit earlier",
                      detail: "Emma is a morning-energy learner. Moving English Lit from 1:00 PM to 10:45 AM would align with her peak focus window.",
                      tag: "Energy match",
                      tagColor: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
                      child: "Emma",
                    },
                    {
                      title: "Add a break after Sophia's Math block",
                      detail: "Sophia has 3 academic blocks with no free time on this day. A 20-min break between Math and her next session reduces fatigue.",
                      tag: "Wellbeing",
                      tagColor: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800",
                      child: "Sophia",
                    },
                    {
                      title: "Move Liam's History to afternoon",
                      detail: "Liam is an afternoon-energy learner. World History is currently in the morning — moving it to 1:30 PM matches his natural focus pattern.",
                      tag: "Energy match",
                      tagColor: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
                      child: "Liam",
                    },
                    {
                      title: "Consolidate Sarah's admin blocks",
                      detail: "Sarah has two separate admin tasks across the day. Merging them into one 90-min block frees up a contiguous gap for lesson prep.",
                      tag: "Efficiency",
                      tagColor: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
                      child: "Sarah",
                    },
                  ].map((s, i) => {
                    const applied = appliedSuggestions.has(i);
                    return (
                      <div key={i} className={cn("bg-card border border-border rounded-md p-3.5 space-y-2.5 transition-opacity", applied && "opacity-50")}>
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn("text-foreground font-medium text-xs leading-snug", applied && "line-through")}>{s.title}</p>
                          <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full border font-medium flex-shrink-0", s.tagColor)}>{s.tag}</span>
                        </div>
                        <p className="text-muted-foreground text-xs leading-relaxed">{s.detail}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground">{s.child}</span>
                          <button
                            onClick={() => setAppliedSuggestions(prev => { const s2 = new Set(Array.from(prev)); s2.add(i); return s2; })}
                            disabled={applied}
                            className={cn(
                              "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                              applied
                                ? "bg-accent text-muted-foreground cursor-default"
                                : "bg-foreground text-background hover:opacity-80"
                            )}
                          >
                            {applied ? <><Check className="w-3 h-3" /> Applied</> : <>Apply <ArrowRight className="w-3 h-3" /></>}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>

            {/* Footer */}
            {optimizeReady && (
              <div className="px-4 py-3 border-t border-border flex items-center justify-between flex-shrink-0">
                <span className="text-muted-foreground text-xs">
                  {appliedSuggestions.size} of 4 applied
                </span>
                <button
                  onClick={() => {
                    setOptimizeReady(false);
                    setAppliedSuggestions(new Set());
                    setOptimizeLoading(true);
                    setTimeout(() => { setOptimizeLoading(false); setOptimizeReady(true); }, 1800);
                  }}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
                >
                  <RefreshCw className="w-3 h-3" /> Re-analyze
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Add Block Modal ────────────────────────────────────────
function AddBlockModal({ selectedDate, onClose, onAdd }: {
  selectedDate: string;
  onClose: () => void;
  onAdd: (block: Omit<ScheduleBlock, "id" | "completed">) => void;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ScheduleBlock["type"]>("academic");
  const [assigneeId, setAssigneeId] = useState(ALL_MEMBERS[0].id);
  const [date, setDate] = useState(selectedDate);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  const blockTypes: ScheduleBlock["type"][] = ["academic", "activity", "meal", "free", "appointment", "co-op"];

  function handleSubmit() {
    if (!title) return;
    const isChild = assigneeId.startsWith("child-");
    onAdd({
      title, type, date, startTime, endTime,
      assigneeId: isChild ? undefined : assigneeId,
      childId: isChild ? assigneeId : undefined,
      color: ALL_MEMBERS.find(m => m.id === assigneeId)?.avatarColor,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-card rounded-md border border-border shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <p className="font-medium text-foreground text-sm">Assign block</p>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          {/* Assignee picker */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-2">Assign to</label>
            <div className="flex flex-wrap gap-2">
              {ALL_MEMBERS.map(member => (
                <button
                  key={member.id}
                  onClick={() => setAssigneeId(member.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                    assigneeId === member.id
                      ? "border-transparent text-white"
                      : "border-border text-muted-foreground hover:border-foreground/30 bg-card"
                  )}
                  style={assigneeId === member.id ? { backgroundColor: member.avatarColor, borderColor: member.avatarColor } : {}}
                >
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold"
                    style={{ backgroundColor: assigneeId === member.id ? "rgba(255,255,255,0.3)" : member.avatarColor }}
                  >
                    {getAvatarInitials(member.name)}
                  </div>
                  {member.name}
                </button>
              ))}
            </div>
          </div>
          {/* Title */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Title</label>
            <input
              value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Math lesson, Dentist appointment…"
              className="w-full border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring bg-card text-foreground"
            />
          </div>
          {/* Type */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Type</label>
            <div className="flex flex-wrap gap-1.5">
              {blockTypes.map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium border capitalize transition-colors",
                    type === t ? "bg-foreground text-background border-transparent" : "border-border text-muted-foreground hover:bg-accent"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          {/* Date + Time */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full border border-border rounded-md px-2 py-2 text-xs outline-none focus:ring-1 focus:ring-ring bg-card text-foreground" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Start</label>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                className="w-full border border-border rounded-md px-2 py-2 text-xs outline-none focus:ring-1 focus:ring-ring bg-card text-foreground" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">End</label>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)}
                className="w-full border border-border rounded-md px-2 py-2 text-xs outline-none focus:ring-1 focus:ring-ring bg-card text-foreground" />
            </div>
          </div>
        </div>
        <div className="px-5 py-3 border-t border-border flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-muted-foreground border border-border rounded-md hover:bg-accent transition-colors">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={!title}
            className="px-4 py-2 text-sm bg-foreground text-background rounded-md font-medium hover:opacity-80 disabled:opacity-30 transition-opacity"
          >
            Add block
          </button>
        </div>
      </div>
    </div>
  );
}
