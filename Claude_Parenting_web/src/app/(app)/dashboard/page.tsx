"use client";

import { useState } from "react";
import Link from "next/link";
import { mockFamily, mockScheduleBlocks, mockNotifications, mockCourses, mockAttendance, mockPersonalTasks } from "@/lib/mockData";
import { cn, getAvatarInitials, formatTime, carnegieProgress, getTodayString } from "@/lib/utils";
import {
  AlertTriangle, CheckCircle2, Clock, Bell,
  ChevronRight, SkipForward, BookOpen, FileText,
  Users, Zap, Award, FolderOpen, Star, Utensils,
  BarChart2, Brain, Calendar
} from "lucide-react";

const topicHeatData = [
  { subject: "Biology", child: "Emma", strength: 94, sessions: 12, trend: "up" },
  { subject: "AP World History", child: "Emma", strength: 78, sessions: 10, trend: "up" },
  { subject: "English Literature", child: "Emma", strength: 96, sessions: 8, trend: "stable" },
  { subject: "Algebra II", child: "Emma", strength: 62, sessions: 9, trend: "down" },
  { subject: "Spanish II", child: "Emma", strength: 71, sessions: 7, trend: "up" },
  { subject: "Earth Science", child: "Liam", strength: 88, sessions: 8, trend: "up" },
  { subject: "Pre-Algebra", child: "Liam", strength: 75, sessions: 9, trend: "stable" },
  { subject: "World History", child: "Liam", strength: 68, sessions: 7, trend: "up" },
];

const engagementData = [
  { day: "Mon", hours: 5.2 },
  { day: "Tue", hours: 4.8 },
  { day: "Wed", hours: 6.1 },
  { day: "Thu", hours: 3.5 },
  { day: "Fri", hours: 5.9 },
  { day: "Sat", hours: 1.2 },
  { day: "Sun", hours: 0.5 },
];

export default function DashboardPage() {
  const today = getTodayString();
  const [bumpConfirm, setBumpConfirm] = useState<string | null>(null);

  const todayBlocks = mockScheduleBlocks.filter((b) => b.date === today);
  const completedToday = todayBlocks.filter((b) => b.completed).length;
  const totalToday = todayBlocks.length;

  const unreadNotifs = mockNotifications.filter((n) => !n.read);
  const urgentTasks = mockPersonalTasks.filter((t) => t.priority === "urgent" && !t.completed);

  const childStats = mockFamily.children.map((child) => {
    const blocks = todayBlocks.filter((b) => b.childId === child.id);
    const done = blocks.filter((b) => b.completed).length;
    const courses = mockCourses.filter((c) => c.childId === child.id);
    const currentBlock = blocks.find((b) => !b.completed && b.type === "academic");
    const attendanceDays = mockAttendance.filter((a) => a.childId === child.id && a.present).length;
    return { child, blocks, done, total: blocks.length, courses, currentBlock, attendanceDays };
  });

  function handleBump(childId: string) {
    setBumpConfirm(childId);
    setTimeout(() => setBumpConfirm(null), 2000);
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header row */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Good morning, {mockFamily.parentName}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            {" · "}
            {completedToday}/{totalToday} blocks completed today
          </p>
        </div>
        <div className="flex gap-2">
          {unreadNotifs.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 bg-accent border border-border text-foreground text-xs font-medium px-3 py-1.5 rounded-md">
              <Bell className="w-3 h-3" />
              {unreadNotifs.length} alert{unreadNotifs.length > 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>

      {/* Alert banner */}
      {urgentTasks.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3.5 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-900 font-medium text-sm">Action needed</p>
            {urgentTasks.slice(0, 2).map((t) => (
              <p key={t.id} className="text-amber-700 text-sm">{t.title}</p>
            ))}
          </div>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Today's Blocks", value: `${completedToday}/${totalToday}`, icon: Calendar },
          { label: "Children Active", value: mockFamily.children.length, icon: Users },
          { label: "Compliance Days", value: mockAttendance.filter(a => a.present).length, icon: FileText },
          { label: "Notifications", value: unreadNotifs.length, icon: Bell },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-md border border-border p-4">
            <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center mb-3">
              <stat.icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
            <p className="text-muted-foreground text-xs mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Children cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-foreground font-semibold text-sm">Today&apos;s Schedule — All Children</h2>
          <Link href="/schedule" className="text-primary text-sm hover:underline flex items-center gap-1">
            Full Schedule <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid lg:grid-cols-3 gap-3">
          {childStats.map(({ child, blocks, done, total, currentBlock, courses, attendanceDays }) => (
            <div key={child.id} className="bg-card rounded-md border border-border overflow-hidden">
              {/* Child header */}
              <div className="px-4 py-3 flex items-center gap-3 border-b border-border">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: child.avatarColor }}
                >
                  {getAvatarInitials(child.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">{child.name}</p>
                  <p className="text-muted-foreground text-xs">Grade {child.gradeLevel} · {child.pace} pace</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold" style={{ color: child.avatarColor }}>{done}/{total}</p>
                  <p className="text-muted-foreground text-xs">done</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="px-4 pt-3">
                <div className="w-full bg-accent rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{ width: `${total > 0 ? (done / total) * 100 : 0}%`, backgroundColor: child.avatarColor }}
                  />
                </div>
              </div>

              {/* Current task */}
              {currentBlock ? (
                <div className="px-4 py-3">
                  <p className="text-xs text-muted-foreground mb-1">Currently working on</p>
                  <div className="flex items-center gap-2 bg-accent/50 rounded-md p-2.5">
                    <BookOpen className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-foreground text-sm font-medium truncate">{currentBlock.title}</p>
                      <p className="text-muted-foreground text-xs">{formatTime(currentBlock.startTime)} – {formatTime(currentBlock.endTime)}</p>
                    </div>
                    <Link
                      href={`/student?child=${child.id}`}
                      className="ml-auto text-primary text-xs font-medium hover:underline whitespace-nowrap"
                    >
                      Open →
                    </Link>
                  </div>
                </div>
              ) : done === total && total > 0 ? (
                <div className="px-4 py-3">
                  <div className="flex items-center gap-2 bg-green-50 rounded-md p-2.5">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <p className="text-green-700 text-sm font-medium">All done for today!</p>
                  </div>
                </div>
              ) : (
                <div className="px-4 py-3">
                  <p className="text-muted-foreground text-sm">No upcoming blocks scheduled</p>
                </div>
              )}

              {/* Schedule blocks */}
              <div className="px-4 pb-2 space-y-1 max-h-36 overflow-y-auto scrollbar-hide">
                {blocks.slice(0, 5).map((block) => (
                  <div key={block.id} className={cn("flex items-center gap-2 py-1 text-xs", block.completed && "opacity-40")}>
                    {block.completed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className={cn("truncate", block.completed ? "line-through text-muted-foreground" : "text-foreground")}>
                      {block.title}
                    </span>
                    <span className="ml-auto text-muted-foreground whitespace-nowrap">{formatTime(block.startTime)}</span>
                  </div>
                ))}
              </div>

              {/* Bump button */}
              <div className="px-4 pb-4 pt-2">
                <button
                  onClick={() => handleBump(child.id)}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-2 rounded-md text-xs font-medium transition-all",
                    bumpConfirm === child.id
                      ? "bg-green-500 text-white"
                      : "border border-border text-muted-foreground hover:border-border hover:text-foreground hover:bg-accent"
                  )}
                >
                  {bumpConfirm === child.id ? (
                    <><CheckCircle2 className="w-3.5 h-3.5" /> Schedule bumped!</>
                  ) : (
                    <><SkipForward className="w-3.5 h-3.5" /> One-click bump</>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 3: Topic heat map + Engagement chart */}
      <div className="grid lg:grid-cols-2 gap-3">
        {/* Topic heat map */}
        <div className="bg-card rounded-md border border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <Brain className="w-4 h-4 text-muted-foreground" /> Topic Mastery
            </h3>
            <span className="text-xs text-muted-foreground">Last 30 days</span>
          </div>
          <div className="space-y-2.5">
            {topicHeatData.map((t) => {
              const color = t.strength >= 85 ? "bg-green-500" : t.strength >= 70 ? "bg-primary" : t.strength >= 55 ? "bg-amber-400" : "bg-rose-400";
              const textColor = t.strength >= 85 ? "text-green-700 dark:text-green-400" : t.strength >= 70 ? "text-primary" : t.strength >= 55 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400";
              const bgColor = "bg-accent border border-border";
              return (
                <div key={`${t.child}-${t.subject}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground">{t.subject}</span>
                      <span className="text-[10px] text-muted-foreground">({t.child})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full", bgColor, textColor)}>
                        {t.strength}%
                      </span>
                      <span className="text-[10px]">
                        {t.trend === "up" ? "↑" : t.trend === "down" ? "↓" : "→"}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-accent rounded-full h-1.5">
                    <div className={cn("h-1.5 rounded-full transition-all", color)} style={{ width: `${t.strength}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> 85–100% Mastered</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary inline-block" /> 70–84% Solid</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> 55–69% Developing</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400 inline-block" /> &lt;55% Needs work</span>
          </div>
        </div>

        {/* Weekly engagement */}
        <div className="bg-card rounded-md border border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-muted-foreground" /> Weekly Study Hours
            </h3>
            <span className="text-xs text-muted-foreground">
              Total: {engagementData.reduce((s, d) => s + d.hours, 0).toFixed(1)}h this week
            </span>
          </div>
          <div className="flex items-end gap-2 h-28">
            {engagementData.map((d) => {
              const maxH = Math.max(...engagementData.map(x => x.hours));
              const heightPct = (d.hours / maxH) * 100;
              const isWeekend = d.day === "Sat" || d.day === "Sun";
              const today = new Date().toLocaleDateString("en-US", { weekday: "short" }).slice(0, 3);
              const isToday = d.day === today;
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground font-medium">{d.hours}h</span>
                  <div className="w-full rounded-t-lg transition-all" style={{
                    height: `${Math.max(heightPct, 4)}%`,
                    backgroundColor: isToday ? "hsl(213, 78%, 48%)" : isWeekend ? "hsl(40, 10%, 88%)" : "hsl(213, 60%, 75%)"
                  }} />
                  <span className={cn("text-[10px] font-semibold", isToday ? "text-primary" : "text-muted-foreground")}>
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-border grid grid-cols-3 gap-3">
            {[
              { label: "Avg/day", value: (engagementData.slice(0,5).reduce((s,d) => s+d.hours,0)/5).toFixed(1) + "h" },
              { label: "Best day", value: engagementData.reduce((a,b) => a.hours>b.hours?a:b).day },
              { label: "5-day streak", value: "5 days" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-foreground font-semibold text-sm">{s.value}</p>
                <p className="text-muted-foreground text-[10px]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: Compliance + Notifications + Quick links */}
      <div className="grid lg:grid-cols-3 gap-3">
        {/* Compliance status */}
        <div className="bg-card rounded-md border border-border p-4">
          <h3 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" /> Compliance — {mockFamily.state}
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs">Attendance days logged</span>
              <span className="font-semibold text-foreground text-sm">{mockAttendance.filter(a => a.present).length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs">Required days (CO)</span>
              <span className="font-semibold text-foreground text-sm">172</span>
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{Math.round((mockAttendance.filter(a=>a.present).length / 172) * 100)}%</span>
              </div>
              <div className="w-full bg-accent rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full bg-primary"
                  style={{ width: `${Math.min(100, (mockAttendance.filter(a=>a.present).length / 172) * 100)}%` }}
                />
              </div>
            </div>
            <Link href="/compliance" className="flex items-center gap-1.5 text-primary text-xs font-medium hover:underline">
              <FileText className="w-3.5 h-3.5" /> Export attendance PDF
            </Link>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card rounded-md border border-border p-4">
          <h3 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
            <Bell className="w-4 h-4 text-muted-foreground" /> Alerts & Activity
          </h3>
          <div className="space-y-1.5">
            {mockNotifications.slice(0, 4).map((n) => (
              <div key={n.id} className={cn("flex gap-2.5 p-2 rounded-md", !n.read && "bg-accent/60")}>
                <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0", {
                  "bg-green-500": n.type === "completion",
                  "bg-amber-500": n.type === "alert",
                  "bg-blue-500": n.type === "milestone",
                  "bg-blue-400": n.type === "reminder",
                })} />
                <div className="min-w-0">
                  <p className="text-foreground text-xs font-medium truncate">{n.title}</p>
                  <p className="text-muted-foreground text-[11px] line-clamp-2">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="bg-card rounded-md border border-border p-4">
          <h3 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-muted-foreground" /> Quick Access
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { href: "/transcript", label: "Transcript", icon: Award },
              { href: "/portfolio", label: "Portfolio", icon: FolderOpen },
              { href: "/meals", label: "Meal Planner", icon: Utensils },
              { href: "/activities", label: "Activities", icon: Star },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1.5 p-3 rounded-md hover:bg-accent border border-border transition-colors"
              >
                <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center">
                  <item.icon className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <span className="text-xs text-foreground font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-border">
            <Link href="/onboarding" className="flex items-center gap-2 text-muted-foreground hover:text-primary text-xs font-medium transition-colors">
              <Users className="w-3.5 h-3.5" /> Re-run planning agent
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
