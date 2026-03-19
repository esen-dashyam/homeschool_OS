import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { CourseType } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getGPAPoints(letterGrade: string, courseType: CourseType): number {
  const basePoints: Record<string, number> = { A: 4.0, B: 3.0, C: 2.0, D: 1.0, F: 0.0 };
  const bonuses: Record<CourseType, number> = {
    standard: 0,
    honors: 0.5,
    ap: 1.0,
    "dual-enrollment": 1.0,
  };
  const base = basePoints[letterGrade] ?? 0;
  return Math.max(0, base + (base > 0 ? bonuses[courseType] : 0));
}

export function percentToLetter(percent: number): string {
  if (percent >= 93) return "A";
  if (percent >= 90) return "A-";
  if (percent >= 87) return "B+";
  if (percent >= 83) return "B";
  if (percent >= 80) return "B-";
  if (percent >= 77) return "C+";
  if (percent >= 73) return "C";
  if (percent >= 70) return "C-";
  if (percent >= 67) return "D+";
  if (percent >= 60) return "D";
  return "F";
}

export function carnegieProgress(hoursLogged: number, creditHours: number): number {
  const target = creditHours * 120;
  return Math.min(100, Math.round((hoursLogged / target) * 100));
}

export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function getWeekDates(offset = 0): string[] {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - day + 1 + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split("T")[0];
  });
}

export function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

export function getAvatarInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function blockTypeColor(type: string): string {
  const colors: Record<string, string> = {
    academic: "bg-blue-100 border-blue-300 text-blue-800",
    activity: "bg-green-100 border-green-300 text-green-800",
    meal: "bg-amber-100 border-amber-300 text-amber-800",
    free: "bg-purple-100 border-purple-300 text-purple-800",
    appointment: "bg-rose-100 border-rose-300 text-rose-800",
    "co-op": "bg-teal-100 border-teal-300 text-teal-800",
  };
  return colors[type] ?? "bg-gray-100 border-gray-300 text-gray-800";
}

export function subjectColor(subject: string): string {
  const map: Record<string, string> = {
    Math: "bg-blue-500",
    Science: "bg-green-500",
    History: "bg-amber-500",
    English: "bg-purple-500",
    Literature: "bg-pink-500",
    "Foreign Language": "bg-teal-500",
    "Physical Education": "bg-orange-500",
    Art: "bg-rose-500",
    Music: "bg-indigo-500",
    "Computer Science": "bg-cyan-500",
  };
  return map[subject] ?? "bg-slate-500";
}

export function complianceTierLabel(tier: string): string {
  const labels: Record<string, string> = {
    none: "No Requirements",
    notification: "Notification Only",
    moderate: "Moderate Regulation",
    high: "High Regulation",
  };
  return labels[tier] ?? tier;
}

export function complianceTierColor(tier: string): string {
  const colors: Record<string, string> = {
    none: "text-green-600 bg-green-50 border-green-200",
    notification: "text-blue-600 bg-blue-50 border-blue-200",
    moderate: "text-amber-600 bg-amber-50 border-amber-200",
    high: "text-red-600 bg-red-50 border-red-200",
  };
  return colors[tier] ?? "text-gray-600 bg-gray-50 border-gray-200";
}
