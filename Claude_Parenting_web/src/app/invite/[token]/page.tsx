"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { mockPodInvitations, mockPodMessages, mockPodTasks } from "@/lib/mockData";
import { PodMessage } from "@/types";
import {
  Shield, Check, Send, Hash, Users, FileText, CheckSquare,
  ChevronRight, X, BookOpen, Calendar,
} from "lucide-react";

type JoinRole = "parent" | "co-parent" | "observer";
type Stage = "join" | "workspace";

const ROLE_OPTIONS: { id: JoinRole; label: string; desc: string }[] = [
  { id: "parent",    label: "Parent",    desc: "Coordinating and teaching" },
  { id: "co-parent", label: "Co-parent", desc: "Supporting a spouse who organises" },
  { id: "observer",  label: "Observer",  desc: "Viewing only, no posting" },
];

function getInitials(name: string) {
  return name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
}

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function InvitePage() {
  const params = useParams();
  const token = params.token as string;

  // Look up invite from mock data
  const invitation = mockPodInvitations.find(inv => inv.token === token);

  const [stage, setStage] = useState<Stage>("join");
  const [name, setName] = useState(invitation?.displayNameHint ?? "");
  const [role, setRole] = useState<JoinRole>("parent");
  const [activeChannel, setActiveChannel] = useState("ch-1");
  const [messages, setMessages] = useState<PodMessage[]>(mockPodMessages["ch-1"] ?? []);
  const [input, setInput] = useState("");
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [tasksDone, setTasksDone] = useState<Set<string>>(new Set());
  const [showUpgrade, setShowUpgrade] = useState(false);

  // Guest tasks: filter to show only tasks relevant to this guest
  const guestTasks = (mockPodTasks["pod-1"] ?? []).filter(t => t.status !== "done").slice(0, 2);

  // If token not found, show expired state
  if (!invitation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-sm w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-accent border border-border flex items-center justify-center mx-auto">
            <X className="w-5 h-5 text-muted-foreground" />
          </div>
          <h1 className="text-foreground font-semibold text-lg">This invite link has expired</h1>
          <p className="text-muted-foreground text-sm">
            This link is no longer valid. Contact the pod lead to request a new invite.
          </p>
        </div>
      </div>
    );
  }

  if (stage === "join") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-blue-500 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-foreground font-semibold text-sm">Homeschool OS</span>
          </div>

          {/* Invitation header */}
          <div>
            <p className="text-muted-foreground text-sm">{invitation.hostName} invited you to</p>
            <h1 className="text-foreground font-bold text-2xl mt-1">{invitation.podName}</h1>
            <p className="text-muted-foreground text-xs mt-1">
              A small learning community on Homeschool OS
            </p>
          </div>

          {/* Access preview */}
          <div className="bg-accent/40 border border-border rounded-md p-4 space-y-3">
            <div>
              <p className="text-foreground font-medium text-xs mb-2">What you will have access to</p>
              <ul className="space-y-1">
                {["Co-op general channel and subject threads", "Your assigned task cards", "Shared session documents"].map(item => (
                  <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="w-3 h-3 text-green-600 dark:text-green-400 flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t border-border pt-3">
              <p className="text-foreground font-medium text-xs mb-2">What you will never see</p>
              <ul className="space-y-1">
                {[
                  `${invitation.hostName}'s private family schedule`,
                  "Children's transcripts or academic records",
                  "Any other family's private data",
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <X className="w-3 h-3 text-rose-500 flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Join form */}
          <div className="bg-card border border-border rounded-md p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                How should others see you?
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. The Peterson Family"
                className="w-full border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring bg-card text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2">
                I am joining as
              </label>
              <div className="space-y-2">
                {ROLE_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setRole(opt.id)}
                    className={cn(
                      "w-full flex items-start gap-3 p-3 rounded-md border text-left transition-colors",
                      role === opt.id
                        ? "border-foreground bg-accent"
                        : "border-border hover:bg-accent/60"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5",
                      role === opt.id ? "border-foreground bg-foreground" : "border-border"
                    )} />
                    <div>
                      <p className="text-foreground font-medium text-sm">{opt.label}</p>
                      <p className="text-muted-foreground text-xs">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <p className="text-muted-foreground text-xs flex items-start gap-1.5">
              <Shield className="w-3 h-3 flex-shrink-0 mt-0.5" />
              Your family's personal information stays completely separate. You will only see this pod workspace.
            </p>

            <button
              onClick={() => { if (name.trim()) setStage("workspace"); }}
              disabled={!name.trim()}
              className="w-full bg-foreground text-background py-2.5 rounded-md text-sm font-medium hover:opacity-80 disabled:opacity-40 transition-opacity"
            >
              Join pod
            </button>

            <p className="text-center text-muted-foreground text-xs">
              No account required · Personal link · Expires in 90 days
            </p>
          </div>
        </div>
      </div>
    );
  }

  // WORKSPACE stage
  function sendMessage() {
    if (!input.trim() || role === "observer") return;
    const msg: PodMessage = {
      id: `g-msg-${Date.now()}`,
      channelId: activeChannel,
      authorId: "guest",
      authorName: name,
      authorColor: "#6366f1",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, msg]);
    setInput("");
  }

  const podChannels = [
    { id: "ch-1", name: "general", unreadCount: 2 },
    { id: "ch-2", name: "science", unreadCount: 0 },
  ];

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Guest sidebar */}
      <aside className="w-56 flex-shrink-0 flex flex-col border-r border-border bg-card">
        {/* Pod header */}
        <div className="px-3 py-3.5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-500 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-foreground font-semibold text-xs truncate">{invitation.podName}</p>
              <p className="text-muted-foreground text-[10px]">{name} · Guest</p>
            </div>
          </div>
        </div>

        {/* Channels */}
        <nav className="flex-1 overflow-y-auto py-2">
          <p className="px-3 pt-1 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Channels</p>
          {podChannels.map(ch => (
            <button
              key={ch.id}
              onClick={() => {
                setActiveChannel(ch.id);
                setMessages(mockPodMessages[ch.id] ?? []);
              }}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors",
                ch.id === activeChannel
                  ? "bg-accent text-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              )}
            >
              <Hash className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{ch.name}</span>
              {ch.unreadCount > 0 && (
                <span className="ml-auto w-4 h-4 rounded-full bg-primary text-primary-foreground text-[8px] font-bold flex items-center justify-center flex-shrink-0">
                  {ch.unreadCount}
                </span>
              )}
            </button>
          ))}

          {/* Tasks */}
          <p className="px-3 pt-3 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Your tasks</p>
          <div className="px-2 space-y-1">
            {guestTasks.map(task => (
              <div key={task.id} className={cn("bg-background border border-border rounded-md p-2 text-xs", tasksDone.has(task.id) && "opacity-50")}>
                <p className={cn("text-foreground font-medium leading-tight", tasksDone.has(task.id) && "line-through")}>{task.title}</p>
                <div className="flex items-center gap-1 mt-1.5">
                  <button
                    onClick={() => setTasksDone(prev => { const s = new Set(Array.from(prev)); s.add(task.id); return s; })}
                    disabled={tasksDone.has(task.id)}
                    className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors font-medium"
                  >
                    <Check className="w-2.5 h-2.5" />
                    {tasksDone.has(task.id) ? "Done" : "Mark done"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Greyed nav items */}
          <p className="px-3 pt-4 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Shared documents</p>
          <div className="px-3 py-1">
            {["Session Plan — Cell Structure Lab", "Supply List — Spring"].map(doc => (
              <div key={doc} className="flex items-center gap-2 py-1.5 text-muted-foreground/60 cursor-default">
                <FileText className="w-3 h-3 flex-shrink-0" />
                <span className="text-xs truncate">{doc}</span>
              </div>
            ))}
          </div>
        </nav>

        {/* Account options */}
        <div className="border-t border-border px-3 py-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-accent border border-border flex items-center justify-center text-foreground text-[9px] font-bold flex-shrink-0">
              {getInitials(name)}
            </div>
            <div className="min-w-0">
              <p className="text-foreground text-xs font-medium truncate">{name}</p>
              <p className="text-muted-foreground text-[10px]">Guest access</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Upgrade banner */}
        {!bannerDismissed && !showUpgrade && (
          <div className="bg-accent/60 border-b border-border px-4 py-2.5 flex items-center justify-between flex-shrink-0">
            <p className="text-foreground text-xs">
              Want your own family schedule, meal planner, and AI tutor?{" "}
              <button onClick={() => setShowUpgrade(true)} className="font-medium underline hover:no-underline">
                Create a free account
              </button>
            </p>
            <button onClick={() => setBannerDismissed(true)} className="text-muted-foreground hover:text-foreground p-0.5 ml-3 flex-shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Upgrade form */}
        {showUpgrade && (
          <div className="border-b border-border px-4 py-4 bg-card flex-shrink-0">
            <div className="max-w-sm mx-auto space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-foreground font-semibold text-sm">Create your free account</h3>
                <button onClick={() => { setShowUpgrade(false); setBannerDismissed(true); }} className="text-muted-foreground hover:text-foreground p-0.5">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-muted-foreground text-xs">Your pod history, messages, and completed tasks carry over automatically.</p>
              <div className="grid gap-2">
                <input
                  type="email"
                  placeholder="Email"
                  defaultValue={invitation.email}
                  className="w-full border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring bg-card text-foreground placeholder:text-muted-foreground"
                />
                <input
                  type="password"
                  placeholder="Create a password"
                  className="w-full border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring bg-card text-foreground placeholder:text-muted-foreground"
                />
                <button className="w-full bg-foreground text-background py-2 rounded-md text-sm font-medium hover:opacity-80 transition-opacity">
                  Create account — it's free
                </button>
              </div>
              <div className="pt-1">
                <p className="text-muted-foreground text-xs font-medium mb-1.5">What a full account unlocks</p>
                <div className="grid grid-cols-2 gap-1">
                  {["Family schedule", "AI tutor", "Meal planner", "Grocery list", "Transcript builder", "Your own pods"].map(f => (
                    <span key={f} className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ChevronRight className="w-3 h-3" /> {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat header */}
        <div className="px-4 py-2.5 border-b border-border flex-shrink-0 flex items-center gap-2">
          <Hash className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-foreground font-medium text-sm">
            {podChannels.find(c => c.id === activeChannel)?.name}
          </span>
          {role === "observer" && (
            <span className="ml-auto text-xs text-muted-foreground bg-accent border border-border px-2 py-0.5 rounded-full">
              View only
            </span>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => {
            const prev = messages[i - 1];
            const sameAuthor = prev?.authorId === msg.authorId;
            return (
              <div key={msg.id} className="flex gap-2.5">
                {!sameAuthor ? (
                  <div
                    className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[9px] font-bold mt-0.5"
                    style={{ backgroundColor: msg.authorColor }}
                  >
                    {getInitials(msg.authorName)}
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

        {/* Input */}
        {role !== "observer" ? (
          <div className="p-3 border-t border-border flex-shrink-0">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Message the pod…"
                className="flex-1 border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring bg-card text-foreground placeholder:text-muted-foreground"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="p-2 rounded-md bg-foreground text-background hover:opacity-80 disabled:opacity-30 transition-opacity"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3 border-t border-border flex-shrink-0 text-center">
            <p className="text-muted-foreground text-xs">
              Observer access — you can read but not post.{" "}
              <button onClick={() => setShowUpgrade(true)} className="text-foreground font-medium hover:underline">
                Create an account
              </button>{" "}
              to participate.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
