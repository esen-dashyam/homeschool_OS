"use client";

import { useState } from "react";
import { mockFamily, mockAttendance, mockChildren } from "@/lib/mockData";
import { cn, complianceTierLabel, getAvatarInitials, formatDate } from "@/lib/utils";
import {
  FileText, Download, CheckCircle2, XCircle, AlertTriangle,
  Calendar, Clock, Shield, ChevronDown, Info, Plus
} from "lucide-react";

const STATE_REQUIREMENTS: Record<string, { requiredDays: number; subjects: string[]; portfolio: boolean; annualReport: boolean }> = {
  "Colorado":   { requiredDays: 172, subjects: ["Reading", "Writing", "Math", "Science", "Social Studies", "History", "Art", "Music", "PE"], portfolio: false, annualReport: true },
  "New York":   { requiredDays: 180, subjects: ["English", "Math", "Science", "Social Studies", "Art", "Music", "Health", "PE", "Library"], portfolio: true,  annualReport: true },
  "California": { requiredDays: 175, subjects: ["English", "Math", "Science", "History/Social Science", "Art", "PE", "Health"], portfolio: false, annualReport: false },
  "Texas":      { requiredDays: 0,   subjects: [], portfolio: false, annualReport: false },
};

export default function CompliancePage() {
  const [selectedChild, setSelectedChild] = useState(mockChildren[0].id);
  const [exportDone, setExportDone] = useState(false);
  const [expandedMonth, setExpandedMonth] = useState<string | null>("March 2026");

  const reqs = STATE_REQUIREMENTS[mockFamily.state] ?? STATE_REQUIREMENTS["Colorado"];
  const childAttendance = mockAttendance.filter((a) => a.childId === selectedChild);
  const presentDays = childAttendance.filter((a) => a.present).length;
  const absentDays = childAttendance.filter((a) => !a.present).length;
  const progress = reqs.requiredDays > 0 ? Math.min(100, Math.round((presentDays / reqs.requiredDays) * 100)) : 100;
  const avgHours = childAttendance.length > 0
    ? (childAttendance.reduce((s, a) => s + a.hoursLogged, 0) / childAttendance.length).toFixed(1)
    : "0";

  const byMonth: Record<string, typeof childAttendance> = {};
  childAttendance.forEach((a) => {
    const month = new Date(a.date + "T12:00:00").toLocaleDateString("en-US", { month: "long", year: "numeric" });
    if (!byMonth[month]) byMonth[month] = [];
    byMonth[month].push(a);
  });

  function handleExport() {
    setExportDone(true);
    setTimeout(() => setExportDone(false), 2500);
  }

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Compliance</h1>
          <p className="text-muted-foreground text-xs mt-0.5">{mockFamily.state} · {complianceTierLabel(mockFamily.complianceTier)}</p>
        </div>
        <button
          onClick={handleExport}
          className={cn(
            "flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium transition-all",
            exportDone
              ? "bg-green-600 text-white"
              : "bg-foreground text-background hover:opacity-80"
          )}
        >
          {exportDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
          {exportDone ? "PDF generated!" : "Export Attendance PDF"}
        </button>
      </div>

      {/* State info banner */}
      <div className="flex items-start gap-3 rounded-md border border-border bg-accent/40 p-3.5">
        <Shield className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-foreground text-sm">{mockFamily.state} — {complianceTierLabel(mockFamily.complianceTier)}</p>
          <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed">
            {mockFamily.complianceTier === "moderate"
              ? `Colorado requires ${reqs.requiredDays} school days per year, subject logging, and an annual assessment or evaluation.`
              : mockFamily.complianceTier === "high"
              ? "Your state requires full portfolio management, annual reports, standardized test logs, and district submission."
              : mockFamily.complianceTier === "notification"
              ? "Your state requires a one-time or annual notification of intent. Homeschool OS has tracked your submission date."
              : "Your state has no homeschool requirements. Tracking here is optional but recommended for college applications."}
          </p>
        </div>
      </div>

      {/* Child selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {mockChildren.map((child) => (
          <button
            key={child.id}
            onClick={() => setSelectedChild(child.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap border",
              child.id === selectedChild
                ? "bg-foreground text-background border-transparent"
                : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold" style={{ backgroundColor: child.avatarColor }}>
              {getAvatarInitials(child.name)}
            </div>
            {child.name}
          </button>
        ))}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Days Present",    value: presentDays,  sub: `of ${reqs.requiredDays || "—"} required`, icon: CheckCircle2, valueColor: "text-green-700 dark:text-green-400" },
          { label: "Days Absent",     value: absentDays,   sub: "logged this year",                         icon: XCircle,      valueColor: "text-rose-600 dark:text-rose-400" },
          { label: "Avg Daily Hours", value: avgHours,     sub: "hours per session",                        icon: Clock,        valueColor: "text-foreground" },
          { label: "Year Progress",   value: `${progress}%`, sub: reqs.requiredDays > 0 ? `${Math.max(0, reqs.requiredDays - presentDays)} days remaining` : "No minimum", icon: Calendar, valueColor: "text-foreground" },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-md border border-border p-4">
            <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center mb-3">
              <s.icon className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <p className={cn("text-2xl font-bold tracking-tight", s.valueColor)}>{s.value}</p>
            <p className="text-foreground text-xs font-medium mt-0.5">{s.label}</p>
            <p className="text-muted-foreground text-[10px] mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {reqs.requiredDays > 0 && (
        <div className="bg-card rounded-md border border-border p-4">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-foreground font-medium text-sm">Annual attendance progress</p>
            <span className="text-muted-foreground text-xs tabular-nums">{presentDays} / {reqs.requiredDays} days</span>
          </div>
          <div className="w-full bg-accent rounded-full h-2">
            <div
              className={cn("h-2 rounded-full transition-all duration-500",
                progress >= 80 ? "bg-green-500" : progress >= 50 ? "bg-primary" : "bg-amber-500"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-muted-foreground text-[11px] mt-2">
            {reqs.requiredDays - presentDays > 0
              ? `${reqs.requiredDays - presentDays} more days needed to meet the state minimum`
              : "Annual requirement met"}
          </p>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4">

        {/* Attendance log */}
        <div className="bg-card rounded-md border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="font-medium text-foreground text-sm">Attendance Log</h2>
            <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-xs transition-colors">
              <Plus className="w-3 h-3" /> Add entry
            </button>
          </div>
          <div className="divide-y divide-border max-h-96 overflow-y-auto">
            {Object.entries(byMonth).slice(0, 3).map(([month, records]) => (
              <div key={month}>
                <button
                  onClick={() => setExpandedMonth(expandedMonth === month ? null : month)}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-accent/40 hover:bg-accent/70 text-left transition-colors"
                >
                  <span className="text-foreground text-xs font-semibold">{month}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-[11px]">{records.filter(r => r.present).length}/{records.length} present</span>
                    <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", expandedMonth === month && "rotate-180")} />
                  </div>
                </button>
                {expandedMonth === month && records.slice(0, 12).map((rec) => (
                  <div key={rec.id} className="flex items-center gap-3 px-4 py-2 text-xs border-t border-border/50">
                    {rec.present
                      ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                      : <XCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                    }
                    <span className="text-foreground flex-1">{formatDate(rec.date)}</span>
                    {rec.present && <span className="text-muted-foreground tabular-nums">{rec.hoursLogged.toFixed(1)}h</span>}
                    {!rec.present && rec.absenceReason && (
                      <span className="text-muted-foreground capitalize">{rec.absenceReason}</span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Required subjects + notices */}
        <div className="space-y-4">
          <div className="bg-card rounded-md border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="font-medium text-foreground text-sm">Required Subjects — {mockFamily.state}</h2>
            </div>
            <div className="p-4">
              {reqs.subjects.length > 0 ? (
                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                  {reqs.subjects.map((subj) => (
                    <div key={subj} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                      <span className="text-foreground text-xs">{subj}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No subject requirements for {mockFamily.state}.</p>
              )}
            </div>
          </div>

          {/* Notices */}
          {reqs.annualReport && (
            <div className="flex items-start gap-3 rounded-md border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20 p-3.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-900 dark:text-amber-300 font-medium text-sm">Annual report required</p>
                <p className="text-amber-700 dark:text-amber-400 text-xs mt-0.5">Submit by August 1st. Export your PDF above and sign it before filing.</p>
              </div>
            </div>
          )}

          {reqs.portfolio && (
            <div className="flex items-start gap-3 rounded-md border border-border bg-accent/40 p-3.5">
              <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-foreground font-medium text-sm">Portfolio required</p>
                <p className="text-muted-foreground text-xs mt-0.5">Maintain a portfolio of student work samples. Use the Portfolio section in Transcript.</p>
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div className="bg-card rounded-md border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="font-medium text-foreground text-sm">Quick Actions</h2>
            </div>
            <div className="divide-y divide-border">
              {[
                { icon: FileText, label: "View full attendance report", sub: "All records for this year" },
                { icon: Download, label: "Export PDF for district", sub: "Formatted for submission" },
                { icon: Calendar, label: "Log today's session", sub: "Mark attendance & hours" },
              ].map(({ icon: Icon, label, sub }) => (
                <button key={label} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/60 transition-colors text-left">
                  <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-foreground text-xs font-medium">{label}</p>
                    <p className="text-muted-foreground text-[10px]">{sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
