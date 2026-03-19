"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { mockPods, mockPodMessages, mockPodTasks } from "@/lib/mockData";
import { PodMessage, PodTask, PodRole } from "@/types";
import { cn, getAvatarInitials } from "@/lib/utils";
import {
  Users, MessageSquare, CheckSquare, FileText, Settings, Plus, Send,
  Check, ChevronLeft, UserPlus, X, Shield, Eye, Crown,
  Hash, Lock, MoreHorizontal, Trash2, ArrowRight, Copy, Mail,
} from "lucide-react";

const ROLE_CONFIG: Record<PodRole, { label: string; badge: string }> = {
  "pod-lead":       { label: "Pod Lead",    badge: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800" },
  "member-full":    { label: "Member",      badge: "bg-accent text-muted-foreground border-border" },
  "guest-member":   { label: "Guest",       badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800" },
  "guest-observer": { label: "Observer",    badge: "bg-accent text-muted-foreground border-border" },
  "guest-coparent": { label: "Co-parent",   badge: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800" },
  "student-member": { label: "Student",     badge: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800" },
};

const TASK_ROLE_BADGE: Record<string, string> = {
  teacher:          "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
  driver:           "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800",
  "supply-lead":    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
  organizer:        "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
  "discussion-leader": "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
  logistics:        "bg-accent text-muted-foreground border-border",
};

type Tab = "overview" | "members" | "tasks" | "chat" | "docs";

function formatTime(ts: string) {
  const d = new Date(ts);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatDate(ts: string) {
  const d = new Date(ts);
  const today = new Date();
  const diff = Math.floor((today.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function PodDetailPage() {
  const params = useParams();
  const podId = params.podId as string;
  const pod = mockPods.find(p => p.id === podId);

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [activeChannel, setActiveChannel] = useState(pod?.channels[0]?.id ?? "");
  const [allMessages, setAllMessages] = useState<Record<string, PodMessage[]>>(mockPodMessages);
  const [tasks, setTasks] = useState<PodTask[]>(mockPodTasks[podId] ?? []);
  const [messageInput, setMessageInput] = useState("");

  // Invite modal
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteNameHint, setInviteNameHint] = useState("");
  const [inviteRole, setInviteRole] = useState("guest-member");
  const [inviteSent, setInviteSent] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  if (!pod) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Pod not found.</p>
        <Link href="/pods" className="text-sm text-primary hover:underline mt-2 inline-block">← Back to Pods</Link>
      </div>
    );
  }

  const channelMessages = allMessages[activeChannel] ?? [];
  const currentChannel = pod.channels.find(c => c.id === activeChannel);
  const currentMember = pod.members.find(m => m.isCurrentUser);
  const isLead = currentMember?.role === "pod-lead";

  const todoTasks = tasks.filter(t => t.status === "todo");
  const inProgressTasks = tasks.filter(t => t.status === "in-progress");
  const doneTasks = tasks.filter(t => t.status === "done");

  function sendMessage() {
    if (!messageInput.trim()) return;
    const msg: PodMessage = {
      id: `msg-${Date.now()}`,
      channelId: activeChannel,
      authorId: "pm-1",
      authorName: "Sarah",
      authorColor: "#8b5cf6",
      content: messageInput.trim(),
      timestamp: new Date().toISOString(),
    };
    setAllMessages(prev => ({ ...prev, [activeChannel]: [...(prev[activeChannel] ?? []), msg] }));
    setMessageInput("");
  }

  function markDone(taskId: string) {
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, status: "done", completedAt: new Date().toISOString().split("T")[0] } : t
    ));
  }

  function sendInvite() {
    if (!inviteEmail.trim()) return;
    const token = `tok_${Math.random().toString(36).slice(2, 14)}`;
    setInviteLink(`${typeof window !== "undefined" ? window.location.origin : ""}/invite/${token}`);
    setInviteSent(true);
  }

  function copyLink() {
    navigator.clipboard.writeText(inviteLink).catch(() => {});
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <MoreHorizontal className="w-3.5 h-3.5" /> },
    { id: "members",  label: `Members (${pod.members.length})`, icon: <Users className="w-3.5 h-3.5" /> },
    { id: "tasks",    label: `Tasks (${tasks.length})`, icon: <CheckSquare className="w-3.5 h-3.5" /> },
    { id: "chat",     label: "Chat", icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: "docs",     label: "Docs", icon: <FileText className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Page header */}
      <div className="border-b border-border bg-background px-4 lg:px-6 py-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/pods" className="text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-foreground truncate">{pod.name}</h1>
              {isLead && <Crown className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
            </div>
            <p className="text-muted-foreground text-xs">
              {pod.meetingDay}{pod.meetingTime ? ` · ${pod.meetingTime}` : ""} · {pod.members.length} families
            </p>
          </div>
          <button
            onClick={() => { setShowInvite(true); setInviteSent(false); setInviteEmail(""); setInviteLink(""); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-foreground text-background text-xs font-medium hover:opacity-80 transition-opacity"
          >
            <UserPlus className="w-3.5 h-3.5" /> Invite
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border bg-background px-4 lg:px-6 flex-shrink-0">
        <div className="flex gap-0 overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap",
                activeTab === tab.id
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div className="p-4 lg:p-6 space-y-5 max-w-4xl mx-auto overflow-y-auto h-full">
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { label: "Families", value: pod.members.length },
                { label: "Channels", value: pod.channels.length },
                { label: "Open Tasks", value: tasks.filter(t => t.status !== "done").length },
              ].map(s => (
                <div key={s.label} className="bg-card border border-border rounded-md p-4">
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Pod info */}
            <div className="bg-card border border-border rounded-md divide-y divide-border">
              {[
                { label: "Type", value: pod.type.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase()) },
                ...(pod.meetingDay ? [{ label: "Meeting day", value: pod.meetingDay + (pod.meetingTime ? ` · ${pod.meetingTime}` : "") }] : []),
                { label: "Subjects", value: pod.subjects.join(", ") || "—" },
                { label: "Created", value: new Date(pod.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-muted-foreground text-xs">{row.label}</span>
                  <span className="text-foreground text-xs font-medium capitalize">{row.value}</span>
                </div>
              ))}
            </div>

            {/* Privacy reminder */}
            <div className="bg-accent/40 border border-border rounded-md p-4 flex gap-3">
              <Shield className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-foreground font-medium text-sm">Data isolation</p>
                <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
                  Pod members only see content inside this pod. Your private family schedule, transcripts, and household data are never accessible to other families — even pod leads.
                </p>
              </div>
            </div>

            {/* Recent messages */}
            {Object.values(allMessages).flat().length > 0 && (
              <div className="bg-card border border-border rounded-md overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border bg-accent/40">
                  <p className="text-foreground font-medium text-sm">Recent activity</p>
                </div>
                <div className="divide-y divide-border">
                  {Object.values(allMessages).flat().slice(-4).reverse().map(msg => (
                    <div key={msg.id} className="px-4 py-3 flex gap-2.5">
                      <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[9px] font-bold" style={{ backgroundColor: msg.authorColor }}>
                        {getAvatarInitials(msg.authorName)}
                      </div>
                      <div>
                        <span className="text-foreground text-xs font-medium">{msg.authorName}</span>
                        <span className="text-muted-foreground text-xs ml-2">{formatDate(msg.timestamp)}</span>
                        <p className="text-muted-foreground text-xs mt-0.5">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* MEMBERS */}
        {activeTab === "members" && (
          <div className="p-4 lg:p-6 space-y-4 max-w-3xl mx-auto overflow-y-auto h-full">
            <div className="bg-card border border-border rounded-md overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border bg-accent/40 flex items-center justify-between">
                <p className="text-foreground font-medium text-sm">{pod.members.length} {pod.members.length === 1 ? "family" : "families"}</p>
                <button
                  onClick={() => { setShowInvite(true); setInviteSent(false); setInviteEmail(""); setInviteLink(""); }}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Invite family
                </button>
              </div>
              <div className="divide-y divide-border">
                {pod.members.map(member => {
                  const roleConf = ROLE_CONFIG[member.role];
                  const isGuest = member.role.startsWith("guest");
                  return (
                    <div key={member.id} className="px-4 py-3 flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: member.avatarColor }}
                      >
                        {getAvatarInitials(member.displayName.replace(" (You)", ""))}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-foreground font-medium text-sm truncate">{member.displayName}</p>
                          {member.role === "pod-lead" && <Crown className="w-3 h-3 text-amber-500 flex-shrink-0" />}
                        </div>
                        <p className="text-muted-foreground text-xs">{member.email}</p>
                      </div>
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-medium flex-shrink-0", roleConf.badge)}>
                        {roleConf.label}
                      </span>
                      {isLead && isGuest && !member.isCurrentUser && (
                        <button className="p-1.5 rounded-md text-muted-foreground/40 hover:text-rose-500 hover:bg-accent transition-colors flex-shrink-0" title="Revoke access">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-accent/40 border border-border rounded-md p-4 flex gap-3">
              <Eye className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-foreground font-medium text-sm">Guest access</p>
                <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
                  Guests join via a personal invite link — no account required. They see only this pod's channels, their assigned tasks, and shared documents. Revoking access invalidates their link immediately.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TASKS */}
        {activeTab === "tasks" && (
          <div className="p-4 lg:p-6 overflow-y-auto h-full">
            <div className="grid grid-cols-3 gap-4 max-w-5xl mx-auto">
              {([
                { id: "todo", label: "To do", items: todoTasks },
                { id: "in-progress", label: "In progress", items: inProgressTasks },
                { id: "done", label: "Done", items: doneTasks },
              ] as const).map(col => (
                <div key={col.id} className="space-y-2">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-foreground font-medium text-sm">{col.label}</span>
                    <span className="text-muted-foreground text-xs bg-accent border border-border px-2 py-0.5 rounded-full">{col.items.length}</span>
                  </div>
                  {col.items.map(task => (
                    <div
                      key={task.id}
                      className={cn(
                        "bg-card border border-border rounded-md p-3 space-y-2",
                        task.status === "done" && "opacity-60"
                      )}
                    >
                      <p className={cn("text-sm text-foreground", task.status === "done" && "line-through")}>{task.title}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full border font-medium capitalize", TASK_ROLE_BADGE[task.role] ?? "bg-accent text-muted-foreground border-border")}>
                          {task.role.replace("-", " ")}
                        </span>
                        {task.assigneeName && (
                          <span className="text-[10px] text-muted-foreground">{task.assigneeName}</span>
                        )}
                        {task.dueDay && (
                          <span className="text-[10px] text-muted-foreground ml-auto">{task.dueDay}</span>
                        )}
                      </div>
                      {task.status !== "done" && (
                        <button
                          onClick={() => markDone(task.id)}
                          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors font-medium"
                        >
                          <Check className="w-3 h-3" /> Mark done
                        </button>
                      )}
                      {task.completedAt && (
                        <p className="text-[10px] text-muted-foreground">Completed {task.completedAt}</p>
                      )}
                    </div>
                  ))}
                  {col.id === "todo" && (
                    <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md border border-dashed border-border text-muted-foreground text-xs hover:bg-accent hover:text-foreground transition-colors">
                      <Plus className="w-3.5 h-3.5" /> Add task
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHAT */}
        {activeTab === "chat" && (
          <div className="flex h-full overflow-hidden">
            {/* Channel sidebar */}
            <div className="w-44 flex-shrink-0 border-r border-border bg-card overflow-y-auto">
              <div className="px-3 pt-3 pb-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Channels</p>
              </div>
              {pod.channels.map(ch => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannel(ch.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors",
                    ch.id === activeChannel
                      ? "bg-accent text-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  )}
                >
                  <Hash className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{ch.name}</span>
                  {(ch.unreadCount ?? 0) > 0 && (
                    <span className="ml-auto w-4 h-4 rounded-full bg-primary text-primary-foreground text-[8px] font-bold flex items-center justify-center flex-shrink-0">
                      {ch.unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border flex-shrink-0 flex items-center gap-2">
                <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-foreground font-medium text-sm">{currentChannel?.name}</span>
                {currentChannel?.subject && (
                  <span className="text-muted-foreground text-xs">· {currentChannel.subject}</span>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {channelMessages.length === 0 && (
                  <div className="text-center py-10">
                    <Hash className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">No messages yet in #{currentChannel?.name}</p>
                  </div>
                )}
                {channelMessages.map((msg, i) => {
                  const prevMsg = channelMessages[i - 1];
                  const sameAuthor = prevMsg?.authorId === msg.authorId;
                  return (
                    <div key={msg.id} className={cn("flex gap-2.5", sameAuthor && "mt-0.5")}>
                      {!sameAuthor ? (
                        <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[9px] font-bold mt-0.5" style={{ backgroundColor: msg.authorColor }}>
                          {getAvatarInitials(msg.authorName)}
                        </div>
                      ) : (
                        <div className="w-7 flex-shrink-0" />
                      )}
                      <div>
                        {!sameAuthor && (
                          <div className="flex items-baseline gap-2 mb-0.5">
                            <span className="text-foreground font-medium text-sm">{msg.authorName}</span>
                            <span className="text-muted-foreground text-[10px]">{formatTime(msg.timestamp)}</span>
                          </div>
                        )}
                        <p className="text-foreground text-sm leading-relaxed">{msg.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-3 border-t border-border flex-shrink-0">
                <div className="flex gap-2">
                  <input
                    value={messageInput}
                    onChange={e => setMessageInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder={`Message #${currentChannel?.name}`}
                    className="flex-1 border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring bg-card text-foreground placeholder:text-muted-foreground"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!messageInput.trim()}
                    className="p-2 rounded-md bg-foreground text-background hover:opacity-80 disabled:opacity-30 transition-opacity"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DOCS */}
        {activeTab === "docs" && (
          <div className="p-4 lg:p-6 space-y-4 max-w-3xl mx-auto overflow-y-auto h-full">
            <div className="bg-card border border-border rounded-md overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border bg-accent/40 flex items-center justify-between">
                <p className="text-foreground font-medium text-sm">Shared documents</p>
                <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium">
                  <Plus className="w-3.5 h-3.5" /> New doc
                </button>
              </div>
              <div className="divide-y divide-border">
                {[
                  { title: "Session Plan — Cell Structure Lab", date: "2026-03-15", type: "session", author: "Sarah" },
                  { title: "Supply List — Spring Semester", date: "2026-03-10", type: "list", author: "Lisa" },
                  { title: "Curriculum Outline — Science Co-op 2025–2026", date: "2025-09-01", type: "outline", author: "Sarah" },
                ].map(doc => (
                  <div key={doc.title} className="px-4 py-3 flex items-center gap-3 hover:bg-accent/40 transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded-md bg-accent border border-border flex items-center justify-center flex-shrink-0">
                      <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground font-medium text-sm truncate">{doc.title}</p>
                      <p className="text-muted-foreground text-xs">{doc.author} · {new Date(doc.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
            <p className="text-muted-foreground text-xs text-center">
              Guests with view access can open documents without a Homeschool OS account.
            </p>
          </div>
        )}
      </div>

      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-md shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="font-semibold text-foreground text-sm">Invite to {pod.name}</h3>
              <button onClick={() => setShowInvite(false)} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-accent transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {!inviteSent ? (
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email address</label>
                  <input
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    placeholder="family@example.com"
                    type="email"
                    className="w-full border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring bg-card text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Name hint <span className="font-normal">(optional — pre-fills their name)</span></label>
                  <input
                    value={inviteNameHint}
                    onChange={e => setInviteNameHint(e.target.value)}
                    placeholder="e.g. The Petersons"
                    className="w-full border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring bg-card text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Access level</label>
                  <select
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value)}
                    className="w-full border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring bg-card text-foreground"
                  >
                    <option value="member-full">Full member — Homeschool OS account required</option>
                    <option value="guest-member">Guest — no account required, can post + complete tasks</option>
                    <option value="guest-observer">Observer — no account required, view only</option>
                    <option value="guest-coparent">Co-parent — supporting a spouse who organises</option>
                  </select>
                </div>
                <div className="bg-accent/40 border border-border rounded-md p-3 text-xs text-muted-foreground space-y-1.5">
                  <p className="font-medium text-foreground">What they will see</p>
                  <p>✓ Pod channels and shared documents</p>
                  <p>✓ Their assigned task cards</p>
                  <p className="font-medium text-foreground mt-2">What they will never see</p>
                  <p>✗ Your private family schedule</p>
                  <p>✗ Your children's transcripts or academic records</p>
                  <p>✗ Any other family's private data</p>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={sendInvite}
                    disabled={!inviteEmail.trim()}
                    className="flex items-center gap-2 px-4 py-2 rounded-md bg-foreground text-background text-sm font-medium hover:opacity-80 disabled:opacity-40 transition-opacity"
                  >
                    <Mail className="w-3.5 h-3.5" /> Send invite
                  </button>
                  <button onClick={() => setShowInvite(false)} className="border border-border text-muted-foreground px-4 py-2 rounded-md text-sm hover:bg-accent transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-md p-3">
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <p className="text-green-700 dark:text-green-300 text-sm font-medium">Invite sent to {inviteEmail}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">Personal invite link</p>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={inviteLink}
                      className="flex-1 border border-border rounded-md px-3 py-2 text-xs bg-accent text-muted-foreground outline-none"
                    />
                    <button
                      onClick={copyLink}
                      className={cn("flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all", linkCopied ? "bg-green-600 text-white" : "bg-foreground text-background hover:opacity-80")}
                    >
                      {linkCopied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                    </button>
                  </div>
                  <p className="text-muted-foreground text-[10px] mt-1.5">Link expires in 90 days · No account required</p>
                </div>
                <button onClick={() => setShowInvite(false)} className="w-full border border-border text-muted-foreground px-4 py-2 rounded-md text-sm hover:bg-accent transition-colors">
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
