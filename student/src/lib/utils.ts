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

export const SUBJECT_COLORS: Record<string, SubjectColor> = {
  Biology: {
    bg: "#EEEDFE",
    accent: "#534AB7",
    text: "#534AB7",
    border: "#C5C3F5",
    lightBg: "#F5F4FF",
  },
  "Life Sciences": {
    bg: "#EEEDFE",
    accent: "#534AB7",
    text: "#534AB7",
    border: "#C5C3F5",
    lightBg: "#F5F4FF",
  },
  Mathematics: {
    bg: "#E1F5EE",
    accent: "#0F6E56",
    text: "#0F6E56",
    border: "#A3DECA",
    lightBg: "#F0FAF6",
  },
  Math: {
    bg: "#E1F5EE",
    accent: "#0F6E56",
    text: "#0F6E56",
    border: "#A3DECA",
    lightBg: "#F0FAF6",
  },
  "Pre-Algebra": {
    bg: "#E1F5EE",
    accent: "#0F6E56",
    text: "#0F6E56",
    border: "#A3DECA",
    lightBg: "#F0FAF6",
  },
  "Algebra II": {
    bg: "#E1F5EE",
    accent: "#0F6E56",
    text: "#0F6E56",
    border: "#A3DECA",
    lightBg: "#F0FAF6",
  },
  History: {
    bg: "#FAEEDA",
    accent: "#854F0B",
    text: "#854F0B",
    border: "#F0D0A0",
    lightBg: "#FDF6EC",
  },
  "Social Studies": {
    bg: "#FAEEDA",
    accent: "#854F0B",
    text: "#854F0B",
    border: "#F0D0A0",
    lightBg: "#FDF6EC",
  },
  "AP World History": {
    bg: "#FAEEDA",
    accent: "#854F0B",
    text: "#854F0B",
    border: "#F0D0A0",
    lightBg: "#FDF6EC",
  },
  English: {
    bg: "#FAECE7",
    accent: "#993C1D",
    text: "#993C1D",
    border: "#F5C4B4",
    lightBg: "#FDF5F2",
  },
  Literature: {
    bg: "#FAECE7",
    accent: "#993C1D",
    text: "#993C1D",
    border: "#F5C4B4",
    lightBg: "#FDF5F2",
  },
  "English Literature": {
    bg: "#FAECE7",
    accent: "#993C1D",
    text: "#993C1D",
    border: "#F5C4B4",
    lightBg: "#FDF5F2",
  },
  Science: {
    bg: "#E6F1FB",
    accent: "#185FA5",
    text: "#185FA5",
    border: "#B3D0EE",
    lightBg: "#F0F7FD",
  },
  "Physical Science": {
    bg: "#E6F1FB",
    accent: "#185FA5",
    text: "#185FA5",
    border: "#B3D0EE",
    lightBg: "#F0F7FD",
  },
  Chemistry: {
    bg: "#E6F1FB",
    accent: "#185FA5",
    text: "#185FA5",
    border: "#B3D0EE",
    lightBg: "#F0F7FD",
  },
  Physics: {
    bg: "#E6F1FB",
    accent: "#185FA5",
    text: "#185FA5",
    border: "#B3D0EE",
    lightBg: "#F0F7FD",
  },
  Art: {
    bg: "#FBEAF0",
    accent: "#993556",
    text: "#993556",
    border: "#F5C0D4",
    lightBg: "#FDF2F6",
  },
  Creative: {
    bg: "#FBEAF0",
    accent: "#993556",
    text: "#993556",
    border: "#F5C0D4",
    lightBg: "#FDF2F6",
  },
  Spanish: {
    bg: "#E6F1FB",
    accent: "#185FA5",
    text: "#185FA5",
    border: "#B3D0EE",
    lightBg: "#F0F7FD",
  },
  "Spanish II": {
    bg: "#E6F1FB",
    accent: "#185FA5",
    text: "#185FA5",
    border: "#B3D0EE",
    lightBg: "#F0F7FD",
  },
  "Foreign Language": {
    bg: "#E6F1FB",
    accent: "#185FA5",
    text: "#185FA5",
    border: "#B3D0EE",
    lightBg: "#F0F7FD",
  },
};

export function getSubjectColor(subject: string): SubjectColor {
  return (
    SUBJECT_COLORS[subject] ?? {
      bg: "#F1EFE8",
      accent: "#5F5E5A",
      text: "#5F5E5A",
      border: "#E0DDD4",
      lightBg: "#F7F6F2",
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
    "on-track": "text-emerald-700 bg-emerald-50 border-emerald-200",
    ahead: "text-blue-700 bg-blue-50 border-blue-200",
    "catch-up": "text-amber-700 bg-amber-50 border-amber-200",
  };
  return colors[status] ?? "text-emerald-700 bg-emerald-50 border-emerald-200";
}
