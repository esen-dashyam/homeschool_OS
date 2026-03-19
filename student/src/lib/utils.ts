import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { SubjectColor } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
}

export function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

export function getGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${name}`;
  if (hour < 17) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
}

// Dark-theme palette (Brilliant.org faithful)
const PURPLE = { bg: "#1e1942", accent: "#8b7cf8", text: "#a89fec", border: "#3d2d8a", lightBg: "#1a1538" };
const GREEN  = { bg: "#0d2218", accent: "#3fb950", text: "#4ec660", border: "#1a4730", lightBg: "#0a1a12" };
const AMBER  = { bg: "#241a08", accent: "#e3b341", text: "#ecc452", border: "#4a3510", lightBg: "#1e1508" };
const ORANGE = { bg: "#2a1108", accent: "#f0883e", text: "#f59550", border: "#5a2a0e", lightBg: "#231008" };
const BLUE   = { bg: "#0d1e3a", accent: "#58a6ff", text: "#79b8ff", border: "#1c3a60", lightBg: "#0a1830" };
const TEAL   = { bg: "#0a1f22", accent: "#39c5cf", text: "#56d0d8", border: "#154045", lightBg: "#081a1d" };
const PINK   = { bg: "#2a0e28", accent: "#d2a8ff", text: "#e0baff", border: "#5a2058", lightBg: "#220c20" };

export const SUBJECT_COLORS: Record<string, SubjectColor> = {
  Biology:            PURPLE,
  "Life Sciences":    PURPLE,
  Mathematics:        GREEN,
  Math:               GREEN,
  "Pre-Algebra":      GREEN,
  "Algebra II":       GREEN,
  History:            AMBER,
  "Social Studies":   AMBER,
  "AP World History": AMBER,
  English:            ORANGE,
  Literature:         ORANGE,
  "English Literature": ORANGE,
  Science:            BLUE,
  "Physical Science": BLUE,
  Chemistry:          BLUE,
  Physics:            BLUE,
  Art:                PINK,
  Creative:           PINK,
  Spanish:            TEAL,
  "Spanish II":       TEAL,
  "Foreign Language": TEAL,
};

export function getSubjectColor(subject: string): SubjectColor {
  return (
    SUBJECT_COLORS[subject] ?? {
      bg: "#1c1f26",
      accent: "#8b949e",
      text: "#8b949e",
      border: "#30363d",
      lightBg: "#161b22",
    }
  );
}

export function getSubjectIcon(subject: string): string {
  const icons: Record<string, string> = {
    Biology: "🧬",
    "Life Sciences": "🧬",
    Mathematics: "📐",
    Math: "📐",
    "Pre-Algebra": "📐",
    "Algebra II": "📐",
    History: "🏛️",
    "Social Studies": "🌍",
    "AP World History": "🏛️",
    English: "📖",
    Literature: "📚",
    "English Literature": "📚",
    Science: "🔭",
    "Physical Science": "⚗️",
    Chemistry: "⚗️",
    Physics: "⚛️",
    Art: "🎨",
    Creative: "🎨",
    Spanish: "💬",
    "Spanish II": "💬",
    "Foreign Language": "💬",
  };
  return icons[subject] ?? "📓";
}

export function paceLabel(status: string): string {
  const labels: Record<string, string> = {
    "on-track": "On track",
    ahead: "Ahead",
    "catch-up": "Catch up today",
  };
  return labels[status] ?? "On track";
}

export function paceColor(status: string): string {
  const colors: Record<string, string> = {
    "on-track": "text-emerald-400 bg-emerald-950/40 border-emerald-800",
    ahead: "text-blue-400 bg-blue-950/40 border-blue-800",
    "catch-up": "text-amber-400 bg-amber-950/40 border-amber-800",
  };
  return colors[status] ?? "text-emerald-400 bg-emerald-950/40 border-emerald-800";
}
