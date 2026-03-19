"use client";

import { useState } from "react";
import { mockChildren, mockCourses } from "@/lib/mockData";
import { cn, getAvatarInitials, carnegieProgress } from "@/lib/utils";
import { Course } from "@/types";
import {
  GraduationCap, Download, Award, TrendingUp, BookOpen,
  CheckCircle2, AlertTriangle, Plus, Edit3, Star, Clock
} from "lucide-react";

const GPA_TABLE = [
  { type: "Standard",    A: "4.0", B: "3.0", C: "2.0", D: "1.0" },
  { type: "Honors",      A: "4.5", B: "3.5", C: "2.5", D: "1.5" },
  { type: "AP",          A: "5.0", B: "4.0", C: "3.0", D: "2.0" },
  { type: "Dual Enroll.",A: "5.0", B: "4.0", C: "3.0", D: "2.0" },
];

function calcGPA(courses: Course[], weighted: boolean): number {
  const graded = courses.filter((c) => c.letterGrade);
  if (!graded.length) return 0;
  const base = (l: string) => l.startsWith("A") ? 4.0 : l.startsWith("B") ? 3.0 : l.startsWith("C") ? 2.0 : l.startsWith("D") ? 1.0 : 0;
  const bonus = (t: string) => !weighted ? 0 : t === "honors" ? 0.5 : (t === "ap" || t === "dual-enrollment") ? 1.0 : 0;
  const total = graded.reduce((s, c) => s + Math.min(4.0 + bonus(c.type), base(c.letterGrade!) + bonus(c.type)), 0);
  return Math.round((total / graded.length) * 100) / 100;
}

const gradeColor = (g: string) => {
  if (g?.startsWith("A")) return "text-green-700 dark:text-green-400";
  if (g?.startsWith("B")) return "text-primary";
  if (g?.startsWith("C")) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
};

const typeLabel: Record<string, string> = {
  standard: "Standard", honors: "Honors", ap: "AP", "dual-enrollment": "Dual Enroll.",
};

export default function TranscriptPage() {
  const highSchoolers = mockChildren.filter((c) => parseInt(c.gradeLevel) >= 9);
  const [selectedChild, setSelectedChild] = useState(highSchoolers[0]?.id ?? mockChildren[0].id);
  const [exportDone, setExportDone] = useState(false);
  const [generateDesc, setGenerateDesc] = useState<string | null>(null);

  const child = mockChildren.find((c) => c.id === selectedChild) ?? mockChildren[0];
  const courses = mockCourses.filter((c) => c.childId === selectedChild);
  const weightedGPA = calcGPA(courses, true);
  const unweightedGPA = calcGPA(courses, false);
  const totalCredits = courses.filter(c => c.status !== "planned").length;
  const totalHours = courses.reduce((s, c) => s + c.hoursLogged, 0);

  function handleExport() {
    setExportDone(true);
    setTimeout(() => setExportDone(false), 2500);
  }

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Transcript</h1>
          <p className="text-muted-foreground text-xs mt-0.5">Auto-populated from daily sessions · Grades 9–12</p>
        </div>
        <button
          onClick={handleExport}
          className={cn(
            "flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium transition-all",
            exportDone ? "bg-green-600 text-white" : "bg-foreground text-background hover:opacity-80"
          )}
        >
          {exportDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
          {exportDone ? "PDF generated!" : "Export Official PDF"}
        </button>
      </div>

      {/* Student selector */}
      {highSchoolers.length > 0 ? (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {highSchoolers.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedChild(c.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap border",
                c.id === selectedChild
                  ? "bg-foreground text-background border-transparent"
                  : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold" style={{ backgroundColor: c.avatarColor }}>
                {getAvatarInitials(c.name)}
              </div>
              {c.name} · Grade {c.gradeLevel}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-md border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20 p-3.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-amber-800 dark:text-amber-300 text-sm">Transcript builder is active for students in grades 9–12.</p>
        </div>
      )}

      {/* GPA stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Weighted GPA",   value: weightedGPA.toFixed(2),   icon: Star,      sub: "includes AP/Honors bonus" },
          { label: "Unweighted GPA", value: unweightedGPA.toFixed(2), icon: TrendingUp, sub: "4.0 scale" },
          { label: "Total Credits",  value: totalCredits.toFixed(1),  icon: Award,     sub: "Carnegie units earned" },
          { label: "Hours Logged",   value: `${totalHours}h`,         icon: Clock,     sub: "across all courses" },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-md border border-border p-4">
            <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center mb-3">
              <s.icon className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold tracking-tight text-foreground">{s.value}</p>
            <p className="text-foreground text-xs font-medium mt-0.5">{s.label}</p>
            <p className="text-muted-foreground text-[10px] mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Transcript table */}
      <div className="bg-card rounded-md border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <GraduationCap className="w-4 h-4 text-muted-foreground" />
            <div>
              <h2 className="font-medium text-foreground text-sm">{child.name} — Academic Transcript</h2>
              <p className="text-muted-foreground text-[11px]">{new Date().getFullYear()}–{new Date().getFullYear() + 1} Academic Year</p>
            </div>
          </div>
          <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-xs transition-colors">
            <Plus className="w-3 h-3" /> Add course
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-accent/50 border-b border-border">
                {["Course", "Type", "Credit", "Hours", "Carnegie", "Grade", "Description"].map((h, i) => (
                  <th key={h} className={cn(
                    "text-left px-4 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider",
                    i > 2 && i < 5 && "hidden md:table-cell",
                    i === 0 ? "px-4" : "px-3"
                  )}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {courses.map((course) => {
                const prog = carnegieProgress(course.hoursLogged, course.creditHours);
                const isLow = prog < 50;
                return (
                  <tr key={course.id} className="hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-foreground font-medium text-sm">{course.name}</p>
                      <p className="text-muted-foreground text-[11px]">{course.subject}</p>
                    </td>
                    <td className="px-3 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-accent text-muted-foreground border border-border">
                        {typeLabel[course.type]}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-foreground text-sm font-medium tabular-nums">{course.creditHours}.0</td>
                    <td className="px-3 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <span className="text-foreground text-sm tabular-nums">{course.hoursLogged}h</span>
                        {isLow && <AlertTriangle className="w-3 h-3 text-amber-500" />}
                      </div>
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell">
                      <div className="w-20">
                        <div className="text-[10px] text-muted-foreground mb-1 tabular-nums">{prog}%</div>
                        <div className="w-full bg-accent rounded-full h-1.5">
                          <div
                            className={cn("h-1.5 rounded-full transition-all", isLow ? "bg-amber-400" : "bg-primary")}
                            style={{ width: `${prog}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      {course.letterGrade ? (
                        <span className={cn("text-sm font-bold tabular-nums", gradeColor(course.letterGrade))}>
                          {course.letterGrade}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => setGenerateDesc(generateDesc === course.id ? null : course.id)}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
                      >
                        {course.description
                          ? <><CheckCircle2 className="w-3 h-3 text-green-500" /> View</>
                          : <><Edit3 className="w-3 h-3" /> AI Draft</>
                        }
                      </button>
                      {generateDesc === course.id && (
                        <div className="mt-2 p-3 bg-accent border border-border rounded-md text-xs text-foreground max-w-xs">
                          <p className="font-medium text-muted-foreground mb-1.5 uppercase tracking-wide text-[10px]">AI-generated description</p>
                          <p className="leading-relaxed text-foreground/80">This {typeLabel[course.type]} {course.name} course covered core {course.subject?.toLowerCase()} concepts through textbook instruction, projects, and discussion. Student demonstrated strong analytical skills and mastery of foundational principles.</p>
                          <button className="mt-2.5 text-primary font-medium hover:underline">Approve & save →</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* GPA scale reference */}
        <div className="px-4 py-3 border-t border-border">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">GPA Scale</p>
          <table className="text-xs">
            <thead>
              <tr className="text-muted-foreground">
                <th className="text-left pr-6 py-1 font-medium">Type</th>
                {["A", "B", "C", "D"].map(g => <th key={g} className="text-center px-3 py-1 font-medium">{g}</th>)}
              </tr>
            </thead>
            <tbody>
              {GPA_TABLE.map((row) => (
                <tr key={row.type} className="text-foreground/70">
                  <td className="pr-6 py-0.5 font-medium">{row.type}</td>
                  {[row.A, row.B, row.C, row.D].map((v, i) => (
                    <td key={i} className="text-center px-3 py-0.5 tabular-nums">{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Signature block */}
        <div className="px-4 py-3 border-t border-border bg-accent/30">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Official Signature Block (printed)</p>
          <div className="border border-border rounded-md p-3 bg-card text-xs text-muted-foreground space-y-3">
            <p className="leading-relaxed">I certify that the above is an accurate record of academic work completed in our home education program.</p>
            <div className="flex gap-12">
              <div className="border-b border-border pb-1 w-40">
                <span className="text-muted-foreground/60">Parent / Educator Signature</span>
              </div>
              <div className="border-b border-border pb-1 w-28">
                <span className="text-muted-foreground/60">Date</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
