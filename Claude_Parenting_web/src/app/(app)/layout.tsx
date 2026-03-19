"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, getAvatarInitials } from "@/lib/utils";
import { mockFamily, mockNotifications } from "@/lib/mockData";
import {
  LayoutDashboard, CalendarDays, BookOpen, GraduationCap,
  FileText, Utensils, ShoppingCart, Star, CheckSquare,
  Settings, Bell, ChevronLeft, ChevronRight, Menu, X,
  FolderOpen, LayoutGrid, NotebookPen, MessageSquare, Users
} from "lucide-react";
import { mockPods } from "@/lib/mockData";

const navSections = [
  {
    label: "Academic",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/schedule", label: "Schedule", icon: CalendarDays },
      { href: "/student", label: "Tutor & Learning", icon: BookOpen },
      { href: "/compliance", label: "Compliance", icon: FileText },
      { href: "/transcript", label: "Transcript", icon: GraduationCap },
      { href: "/portfolio", label: "Portfolio", icon: FolderOpen },
      { href: "/docs", label: "Documents", icon: NotebookPen },
    ],
  },
  {
    label: "Family",
    items: [
      { href: "/chat", label: "Family Chat", icon: MessageSquare },
      { href: "/tasks", label: "Task Board", icon: LayoutGrid },
      { href: "/activities", label: "Activities", icon: Star },
      { href: "/meals", label: "Meal Planner", icon: Utensils },
      { href: "/grocery", label: "Grocery List", icon: ShoppingCart },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

// Pod nav items are dynamic — built separately

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/schedule": "Schedule",
  "/student": "Tutor & Learning",
  "/compliance": "Compliance",
  "/transcript": "Transcript",
  "/portfolio": "Portfolio",
  "/activities": "Activities",
  "/meals": "Meal Planner",
  "/grocery": "Grocery List",
  "/chat": "Family Chat",
  "/tasks": "Task Board",
  "/docs": "Documents",
  "/settings": "Settings",
  "/pods": "Pods",
  ...Object.fromEntries(mockPods.map(p => [`/pods/${p.id}`, p.name])),
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const unreadCount = mockNotifications.filter((n) => !n.read).length;
  const pageTitle = PAGE_TITLES[pathname] ?? "Homeschool OS";

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside
      className={cn(
        "flex flex-col h-full transition-all duration-200",
        "bg-[hsl(var(--sidebar-background))] border-r border-[hsl(var(--sidebar-border))]",
        mobile ? "w-60" : collapsed ? "w-14" : "w-56"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-2.5 px-3 py-3.5 border-b border-[hsl(var(--sidebar-border))]",
        collapsed && !mobile && "justify-center px-0"
      )}>
        <div className="w-6 h-6 rounded-md bg-blue-500 flex items-center justify-center flex-shrink-0">
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        {(!collapsed || mobile) && (
          <div className="min-w-0">
            <p className="text-[hsl(var(--sidebar-foreground))] font-semibold text-sm leading-none truncate">
              Homeschool OS
            </p>
            <p className="text-[hsl(var(--muted-foreground))] text-[11px] mt-0.5 truncate">
              {mockFamily.parentName}&apos;s Family
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 scrollbar-hide">
        {navSections.map((section) => (
          <div key={section.label} className="mb-4">
            {(!collapsed || mobile) && (
              <p className="text-[hsl(var(--muted-foreground))] text-[10px] font-semibold uppercase tracking-wider px-2 py-1">
                {section.label}
              </p>
            )}
            {section.items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
                    collapsed && !mobile && "justify-center px-0 mx-1",
                    active
                      ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground))] font-medium"
                      : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {(!collapsed || mobile) && item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Pods */}
      {(!collapsed || mobile) && (
        <div className="px-2 pb-2 border-t border-[hsl(var(--sidebar-border))] pt-2">
          <div className="flex items-center justify-between px-2 py-1">
            <p className="text-[hsl(var(--muted-foreground))] text-[10px] font-semibold uppercase tracking-wider">
              Pods
            </p>
            <Link href="/pods" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--sidebar-foreground))] text-[10px] font-medium transition-colors">
              All
            </Link>
          </div>
          {mockPods.map((pod) => {
            const active = pathname === `/pods/${pod.id}`;
            return (
              <Link
                key={pod.id}
                href={`/pods/${pod.id}`}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2 py-1.5 px-2 rounded-md transition-colors",
                  active
                    ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground))]"
                    : "hover:bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--sidebar-foreground))]"
                )}
              >
                <div className="w-4 h-4 rounded-md bg-[hsl(var(--sidebar-accent))] flex items-center justify-center flex-shrink-0">
                  <Users className="w-2.5 h-2.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{pod.name}</p>
                  <p className="text-[10px] text-[hsl(var(--muted-foreground))]">{pod.meetingDay}</p>
                </div>
                {pod.channels.reduce((n, c) => n + (c.unreadCount ?? 0), 0) > 0 && (
                  <span className="ml-auto w-4 h-4 rounded-full bg-primary text-primary-foreground text-[8px] font-bold flex items-center justify-center flex-shrink-0">
                    {pod.channels.reduce((n, c) => n + (c.unreadCount ?? 0), 0)}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* Children quick-access */}
      {(!collapsed || mobile) && (
        <div className="px-2 pb-2 border-t border-[hsl(var(--sidebar-border))] pt-2">
          <p className="text-[hsl(var(--muted-foreground))] text-[10px] font-semibold uppercase tracking-wider px-2 py-1">
            Children
          </p>
          {mockFamily.children.map((child) => (
            <Link
              key={child.id}
              href={`/student?child=${child.id}`}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 py-1.5 px-2 hover:bg-[hsl(var(--sidebar-accent))] rounded-md transition-colors"
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
                style={{ backgroundColor: child.avatarColor }}
              >
                {getAvatarInitials(child.name)}
              </div>
              <div className="min-w-0">
                <p className="text-[hsl(var(--sidebar-foreground))] text-xs font-medium truncate">{child.name}</p>
                <p className="text-[hsl(var(--muted-foreground))] text-[10px]">Grade {child.gradeLevel}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Collapse toggle */}
      {!mobile && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center py-2.5 border-t border-[hsl(var(--sidebar-border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] transition-colors"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      )}
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10">
            <Sidebar mobile />
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-4 right-4 text-foreground z-20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-background border-b border-border px-4 lg:px-6 py-2.5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-muted-foreground hover:text-foreground"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-foreground font-semibold text-sm">{pageTitle}</h2>
              <p className="text-muted-foreground text-xs">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-accent"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full text-white text-[8px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-9 w-80 bg-card rounded-md shadow-lg border border-border z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <span className="font-semibold text-foreground text-sm">Notifications</span>
                    <button onClick={() => setNotifOpen(false)} className="text-muted-foreground hover:text-foreground p-0.5">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="divide-y divide-border max-h-72 overflow-y-auto">
                    {mockNotifications.map((n) => (
                      <div key={n.id} className={cn("px-4 py-3 flex gap-2.5", !n.read && "bg-accent/50")}>
                        <div className={cn("w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0", {
                          "bg-green-500": n.type === "completion",
                          "bg-amber-500": n.type === "alert",
                          "bg-blue-500": n.type === "milestone",
                          "bg-blue-400": n.type === "reminder",
                        })} />
                        <div>
                          <p className="text-foreground text-xs font-medium">{n.title}</p>
                          <p className="text-muted-foreground text-xs mt-0.5">{n.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center border border-border">
              <span className="text-foreground text-xs font-semibold">{mockFamily.parentName[0]}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
