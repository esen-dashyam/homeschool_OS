"use client";

import { useState } from "react";
import Link from "next/link";
import { mockPods } from "@/lib/mockData";
import { Pod, PodType } from "@/types";
import { cn, getAvatarInitials } from "@/lib/utils";
import {
  Users, Plus, Calendar, BookOpen, Shield, Globe, ChevronRight,
  Microscope, Library, GraduationCap, TreePine, BookMarked, X, Check,
} from "lucide-react";

const podTypeConfig: Record<PodType, { label: string; icon: React.ReactNode }> = {
  "co-op":         { label: "Co-op",          icon: <Users className="w-3.5 h-3.5" /> },
  "micro-school":  { label: "Micro-school",   icon: <GraduationCap className="w-3.5 h-3.5" /> },
  "tutor-share":   { label: "Tutor Share",    icon: <Microscope className="w-3.5 h-3.5" /> },
  "study-group":   { label: "Study Group",    icon: <Library className="w-3.5 h-3.5" /> },
  "nature-group":  { label: "Nature Group",   icon: <TreePine className="w-3.5 h-3.5" /> },
  "reading-circle":{ label: "Reading Circle", icon: <BookMarked className="w-3.5 h-3.5" /> },
};

const POD_TYPES: PodType[] = ["co-op", "micro-school", "tutor-share", "study-group", "nature-group", "reading-circle"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function PodsPage() {
  const [pods, setPods] = useState<Pod[]>(mockPods);
  const [showCreate, setShowCreate] = useState(false);
  const [newPod, setNewPod] = useState({ name: "", type: "co-op" as PodType, meetingDay: "Thursday", subjects: "" });
  const [created, setCreated] = useState(false);

  function handleCreate() {
    if (!newPod.name.trim()) return;
    const p: Pod = {
      id: `pod-${Date.now()}`,
      name: newPod.name,
      type: newPod.type,
      meetingDay: newPod.meetingDay,
      subjects: newPod.subjects.split(",").map(s => s.trim()).filter(Boolean),
      members: [{ id: "pm-new", displayName: "Sarah (You)", email: "sarah@example.com", role: "pod-lead", avatarColor: "#8b5cf6", joinedAt: new Date().toISOString(), isCurrentUser: true }],
      channels: [
        { id: `ch-new-1`, podId: `pod-${Date.now()}`, name: "general", type: "general" },
      ],
      leadMemberId: "pm-new",
      createdAt: new Date().toISOString(),
    };
    setPods(prev => [...prev, p]);
    setCreated(true);
    setTimeout(() => { setCreated(false); setShowCreate(false); setNewPod({ name: "", type: "co-op", meetingDay: "Thursday", subjects: "" }); }, 1500);
  }

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Pods</h1>
          <p className="text-muted-foreground text-xs mt-0.5">
            {pods.length} active {pods.length === 1 ? "pod" : "pods"} · small learning communities your family coordinates with
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-md bg-foreground text-background text-sm font-medium hover:opacity-80 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" /> New Pod
        </button>
      </div>

      {/* What is a pod? */}
      <div className="bg-accent/40 border border-border rounded-md p-4 flex gap-4">
        <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-foreground font-medium text-sm">What is a pod?</p>
          <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
            A pod is a small learning community — 2 to 8 families coordinating around shared education. Each pod has its own task board, shared documents, and channels. Your private family data is never visible to other pod members.
          </p>
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-card border border-border rounded-md p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-foreground text-sm">Create a new pod</h3>
            <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-accent transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Pod name</label>
              <input
                value={newPod.name}
                onChange={e => setNewPod(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Thursday Science Co-op"
                className="w-full border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring bg-card text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Pod type</label>
              <select
                value={newPod.type}
                onChange={e => setNewPod(p => ({ ...p, type: e.target.value as PodType }))}
                className="w-full border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring bg-card text-foreground"
              >
                {POD_TYPES.map(t => (
                  <option key={t} value={t}>{podTypeConfig[t].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Meeting day</label>
              <select
                value={newPod.meetingDay}
                onChange={e => setNewPod(p => ({ ...p, meetingDay: e.target.value }))}
                className="w-full border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring bg-card text-foreground"
              >
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Subjects covered <span className="font-normal">(comma-separated)</span></label>
              <input
                value={newPod.subjects}
                onChange={e => setNewPod(p => ({ ...p, subjects: e.target.value }))}
                placeholder="e.g. Science, Lab Skills, History"
                className="w-full border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring bg-card text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                created ? "bg-green-600 text-white" : "bg-foreground text-background hover:opacity-80"
              )}
            >
              {created ? <><Check className="w-3.5 h-3.5" /> Created!</> : "Create Pod"}
            </button>
            <button onClick={() => setShowCreate(false)} className="border border-border text-muted-foreground px-4 py-2 rounded-md text-sm hover:bg-accent transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Pod cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {pods.map(pod => {
          const typeConf = podTypeConfig[pod.type];
          const totalUnread = pod.channels.reduce((n, c) => n + (c.unreadCount ?? 0), 0);
          const currentMember = pod.members.find(m => m.isCurrentUser);
          return (
            <div key={pod.id} className="bg-card border border-border rounded-md overflow-hidden hover:shadow-sm transition-shadow">
              <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-accent border border-border text-muted-foreground rounded-full font-medium">
                        {typeConf.icon} {typeConf.label}
                      </span>
                      {currentMember?.role === "pod-lead" && (
                        <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-accent border border-border text-muted-foreground rounded-full font-medium">
                          <Shield className="w-2.5 h-2.5" /> Lead
                        </span>
                      )}
                      {totalUnread > 0 && (
                        <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                          {totalUnread}
                        </span>
                      )}
                    </div>
                    <h3 className="text-foreground font-semibold text-sm">{pod.name}</h3>
                    {pod.description && (
                      <p className="text-muted-foreground text-xs mt-0.5 line-clamp-2">{pod.description}</p>
                    )}
                  </div>
                </div>

                {/* Meta */}
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
                  {pod.meetingDay && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {pod.meetingDay}
                      {pod.meetingTime && ` · ${pod.meetingTime}`}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> {pod.members.length} {pod.members.length === 1 ? "family" : "families"}
                  </span>
                  {pod.subjects.length > 0 && (
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> {pod.subjects.slice(0, 2).join(", ")}{pod.subjects.length > 2 ? ` +${pod.subjects.length - 2}` : ""}
                    </span>
                  )}
                </div>

                {/* Members */}
                <div className="flex items-center gap-1.5 mb-4">
                  {pod.members.slice(0, 5).map((m, i) => (
                    <div
                      key={m.id}
                      className="w-6 h-6 rounded-full border-2 border-card flex items-center justify-center text-white text-[8px] font-bold"
                      style={{ backgroundColor: m.avatarColor, marginLeft: i > 0 ? "-6px" : 0 }}
                      title={m.displayName}
                    >
                      {getAvatarInitials(m.displayName.replace(" (You)", ""))}
                    </div>
                  ))}
                  {pod.members.length > 5 && (
                    <span className="text-[10px] text-muted-foreground ml-1">+{pod.members.length - 5}</span>
                  )}
                </div>
              </div>

              <div className="border-t border-border px-4 py-2.5 bg-accent/30 flex items-center justify-between">
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span>{pod.channels.length} channels</span>
                </div>
                <Link
                  href={`/pods/${pod.id}`}
                  className="flex items-center gap-1 text-xs font-medium text-foreground hover:text-muted-foreground transition-colors"
                >
                  Open pod <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {pods.length === 0 && (
        <div className="bg-accent/40 border border-dashed border-border rounded-md p-10 text-center">
          <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium text-sm">No pods yet</p>
          <p className="text-muted-foreground/60 text-xs mt-1">Create a pod to start coordinating with other homeschool families</p>
        </div>
      )}
    </div>
  );
}
