"use client";

import { useState } from "react";
import { mockFamily, mockChildren, mockPortfolioEntries } from "@/lib/mockData";
import { PortfolioEntry } from "@/types";
import { cn, getAvatarInitials, formatDate } from "@/lib/utils";
import {
  FolderOpen, Upload, FileText, Image as ImageIcon, BookOpen,
  Award, Plus, Camera, Star, Download, GraduationCap, Palette, Microscope
} from "lucide-react";

type EntryType = "all" | "photo" | "document" | "assessment" | "project";

const typeConfig: Record<string, { label: string; icon: React.ReactNode }> = {
  photo:      { label: "Photo",      icon: <Camera className="w-3.5 h-3.5" /> },
  document:   { label: "Document",  icon: <FileText className="w-3.5 h-3.5" /> },
  assessment: { label: "Assessment",icon: <Award className="w-3.5 h-3.5" /> },
  project:    { label: "Project",   icon: <Star className="w-3.5 h-3.5" /> },
};

const gradeStageConfig = [
  { label: "K–2", desc: "Ages 5–7 · Early Learning", grades: ["K","1","2"], icon: <Palette className="w-4 h-4" /> },
  { label: "3–5", desc: "Ages 8–10 · Foundational",  grades: ["3","4","5"], icon: <BookOpen className="w-4 h-4" /> },
  { label: "6–8", desc: "Ages 11–13 · Middle",        grades: ["6","7","8"], icon: <Microscope className="w-4 h-4" /> },
  { label: "9–12", desc: "Ages 14–18 · High School",  grades: ["9","10","11","12"], icon: <GraduationCap className="w-4 h-4" /> },
];

const mockAllEntries: PortfolioEntry[] = [
  { id: "pe1",  childId: "child-1", title: "AP World History Essay — Causes of WWI",        date: "2026-03-16", type: "document",   subject: "History",   grade: "A",    notes: "Outstanding thesis development. Strong use of primary sources." },
  { id: "pe2",  childId: "child-1", title: "Biology Lab Report — Mitosis Observation",      date: "2026-03-14", type: "document",   subject: "Science",   grade: "A-" },
  { id: "pe3",  childId: "child-1", title: "English Literary Analysis — The Great Gatsby",  date: "2026-03-10", type: "assessment", subject: "Literature",grade: "A" },
  { id: "pe4",  childId: "child-1", title: "Photography Portfolio — Nature Study",          date: "2026-03-08", type: "photo",      subject: "Art" },
  { id: "pe5",  childId: "child-1", title: "Algebra II Test — Quadratic Equations",         date: "2026-03-05", type: "assessment", subject: "Math",      grade: "B+" },
  { id: "pe6",  childId: "child-2", title: "Robotics Co-op Project Photo",                  date: "2026-03-17", type: "photo",      subject: "Science" },
  { id: "pe7",  childId: "child-2", title: "Earth Science Poster — Plate Tectonics",        date: "2026-03-12", type: "project",    subject: "Science",   grade: "A-" },
  { id: "pe8",  childId: "child-2", title: "Pre-Algebra Quiz",                              date: "2026-03-09", type: "assessment", subject: "Math",      grade: "B" },
  { id: "pe9",  childId: "child-3", title: "Watercolor — My Garden",                        date: "2026-03-17", type: "photo",      subject: "Art" },
  { id: "pe10", childId: "child-3", title: "Reading Journal — Charlotte's Web",             date: "2026-03-15", type: "document",   subject: "English" },
  { id: "pe11", childId: "child-3", title: "Math Worksheet — Counting by 5s",               date: "2026-03-13", type: "assessment", subject: "Math",      grade: "100%" },
];

const gradeColor = (g: string) => {
  if (g?.startsWith("A") || g === "100%") return "text-green-700 dark:text-green-400";
  if (g?.startsWith("B")) return "text-primary";
  return "text-amber-600 dark:text-amber-400";
};

export default function PortfolioPage() {
  const [selectedChild, setSelectedChild] = useState(mockChildren[0].id);
  const [typeFilter, setTypeFilter] = useState<EntryType>("all");
  const [showUpload, setShowUpload] = useState(false);

  const child = mockChildren.find((c) => c.id === selectedChild)!;
  const gradeNum = child.gradeLevel === "K" ? 0 : parseInt(child.gradeLevel);
  const currentStage = gradeStageConfig.find(s => s.grades.includes(child.gradeLevel)) ?? gradeStageConfig[0];

  const entries = mockAllEntries.filter(
    (e) => e.childId === selectedChild && (typeFilter === "all" || e.type === typeFilter)
  );

  const entryCount = mockAllEntries.filter(e => e.childId === selectedChild).length;
  const subjectCount = new Set(mockAllEntries.filter(e => e.childId === selectedChild && e.subject).map(e => e.subject)).size;

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Portfolio</h1>
          <p className="text-muted-foreground text-xs mt-0.5">Continuous K–12 record · One unbroken record from kindergarten through graduation</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-md bg-foreground text-background text-sm font-medium hover:opacity-80 transition-opacity"
          >
            <Upload className="w-3.5 h-3.5" /> Upload Work
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-md border border-border text-muted-foreground text-sm hover:bg-accent hover:text-foreground transition-colors">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      {/* Child selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {mockChildren.map((c) => (
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

      {/* Grade stage banner */}
      <div className="flex items-center gap-3 rounded-md border border-border bg-accent/40 p-3.5">
        <div className="text-muted-foreground">{currentStage.icon}</div>
        <div>
          <p className="font-medium text-foreground text-sm">Grades {currentStage.label} — {currentStage.desc}</p>
          <p className="text-muted-foreground text-xs mt-0.5">
            {gradeNum <= 2 && "Portfolio focuses on photos of crafts, activities, and early learning moments."}
            {gradeNum >= 3 && gradeNum <= 5 && "Portfolio captures writing samples, math work, and project documentation."}
            {gradeNum >= 6 && gradeNum <= 8 && "Portfolio includes graded essays, test results, and project reports."}
            {gradeNum >= 9 && "Portfolio feeds directly into the transcript builder as your official academic record."}
          </p>
        </div>
        {gradeNum >= 9 && (
          <span className="ml-auto text-xs font-medium bg-card border border-border px-2 py-1 rounded-md whitespace-nowrap text-muted-foreground">
            Linked to Transcript
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Entries",    value: entryCount,                                            icon: FolderOpen },
          { label: "Subjects Covered", value: subjectCount,                                          icon: BookOpen },
          { label: "This Month",       value: entries.filter(e => e.date >= "2026-03-01").length,   icon: Star },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-md border border-border p-4">
            <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center mb-3">
              <s.icon className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold tracking-tight text-foreground">{s.value}</p>
            <p className="text-muted-foreground text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Upload area */}
      {showUpload && (
        <div className="border-2 border-dashed border-border bg-accent/40 rounded-md p-8 text-center">
          <Upload className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-foreground font-medium text-sm">Drop files here or click to browse</p>
          <p className="text-muted-foreground text-xs mt-1">PDF · DOCX · JPG · PNG · up to 25 MB</p>
          <div className="flex justify-center gap-3 mt-4">
            <select className="border border-border rounded-md px-3 py-1.5 text-sm bg-card text-foreground outline-none focus:ring-1 focus:ring-ring">
              <option>Document</option><option>Photo</option><option>Assessment</option><option>Project</option>
            </select>
            <select className="border border-border rounded-md px-3 py-1.5 text-sm bg-card text-foreground outline-none focus:ring-1 focus:ring-ring">
              <option>Science</option><option>Math</option><option>English</option><option>History</option><option>Art</option>
            </select>
            <button className="bg-foreground text-background px-4 py-1.5 rounded-md text-sm font-medium hover:opacity-80 transition-opacity">
              Upload
            </button>
          </div>
        </div>
      )}

      {/* Type filter */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "document", "assessment", "photo", "project"] as EntryType[]).map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors capitalize",
              typeFilter === t
                ? "bg-foreground text-background border-transparent"
                : "bg-card border-border text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            {t !== "all" && <span className="opacity-70">{typeConfig[t]?.icon}</span>}
            {t === "all" ? "All entries" : typeConfig[t]?.label}
            <span className={cn("px-1.5 py-0.5 rounded-full text-[10px] font-bold",
              typeFilter === t ? "bg-white/20 text-inherit" : "bg-accent text-muted-foreground"
            )}>
              {t === "all" ? entryCount : mockAllEntries.filter(e => e.childId === selectedChild && e.type === t).length}
            </span>
          </button>
        ))}
      </div>

      {/* Entries grid */}
      {entries.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.map((entry) => {
            const config = typeConfig[entry.type];
            return (
              <div
                key={entry.id}
                className="bg-card rounded-md border border-border overflow-hidden hover:shadow-sm transition-shadow cursor-pointer"
              >
                <div className="h-24 bg-accent/50 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-md bg-card border border-border flex items-center justify-center text-muted-foreground">
                    {config?.icon}
                  </div>
                </div>
                <div className="p-3.5">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-foreground font-medium text-sm leading-tight line-clamp-2">{entry.title}</p>
                    {entry.grade && (
                      <span className={cn("text-xs font-bold flex-shrink-0", gradeColor(entry.grade))}>
                        {entry.grade}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {entry.subject && (
                      <span className="text-[11px] px-2 py-0.5 bg-accent border border-border text-muted-foreground rounded-full">{entry.subject}</span>
                    )}
                    <span className="text-[11px] text-muted-foreground ml-auto">{formatDate(entry.date)}</span>
                  </div>
                  {entry.notes && (
                    <p className="text-muted-foreground text-xs mt-2 line-clamp-2">{entry.notes}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-accent/40 border border-dashed border-border rounded-md p-10 text-center">
          <FolderOpen className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium text-sm">{child.name} has no {typeFilter === "all" ? "" : typeFilter} portfolio entries yet</p>
          <p className="text-muted-foreground/60 text-xs mt-1">Upload work samples or let the AI capture strong assessment results automatically</p>
        </div>
      )}
    </div>
  );
}
