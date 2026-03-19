"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { mockStudent } from "@/lib/mockData";
import {
  Sun, BookOpen, Sparkles, StickyNote, Users
} from "lucide-react";

const navItems = [
  { href: "/today",   icon: Sun,        label: "Today" },
  { href: "/courses", icon: BookOpen,   label: "My Courses" },
  { href: "/tutor",   icon: Sparkles,   label: "AI Tutor" },
  { href: "/notes",   icon: StickyNote, label: "My Notes" },
  { href: "/pods",    icon: Users,      label: "Pod Tasks" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showLabel, setShowLabel] = useState<string | null>(null);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Left nav rail */}
      <nav className="hidden sm:flex flex-col items-center py-4 px-2 gap-1 bg-card border-r border-border flex-shrink-0 w-16 z-10">
        {/* Logo mark */}
        <div className="w-9 h-9 rounded-xl bg-[#534AB7] flex items-center justify-center mb-4 flex-shrink-0 shadow-sm">
          <BookOpen className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
        </div>

        {/* Nav icons */}
        <div className="flex flex-col items-center gap-1 flex-1">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <div key={item.href} className="relative group">
                <Link
                  href={item.href}
                  onMouseEnter={() => setShowLabel(item.href)}
                  onMouseLeave={() => setShowLabel(null)}
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-xl transition-all",
                    active
                      ? "bg-[#534AB7] text-white shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                  aria-label={item.label}
                >
                  <item.icon className="w-5 h-5" />
                </Link>
                {/* Tooltip */}
                {showLabel === item.href && (
                  <div className="absolute left-12 top-1/2 -translate-y-1/2 z-50 pointer-events-none">
                    <div className="bg-foreground text-background text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                      {item.label}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Student avatar */}
        <div className="mt-auto">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm"
            style={{ backgroundColor: mockStudent.avatarColor }}
            title={mockStudent.name}
          >
            {mockStudent.name[0]}
          </div>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all",
                active ? "text-[#534AB7]" : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", active && "stroke-[2.5]")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-16 sm:pb-0">
        {children}
      </main>
    </div>
  );
}
